import { useEffect, useMemo, useState } from "react"
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native"
import { authApi, bookmarksApi, dashboardsApi, paymentsApi, propertiesApi } from "../services/api"

const tabByRole = {
  admin: ["overview", "listings"],
  agent: ["overview", "listings"],
  landlord: ["overview", "listings"],
  tenant: ["overview", "listings", "bookmarks", "payments"],
}

const tabLabels = {
  overview: "Overview",
  listings: "Listings",
  bookmarks: "Bookmarks",
  payments: "Payments",
}

const paymentMethods = [
  "mobile_money",
  "bank_transfer",
  "cash",
  "card",
  "other",
]

function unwrapResults(payload) {
  if (Array.isArray(payload)) {
    return payload
  }
  if (payload && Array.isArray(payload.results)) {
    return payload.results
  }
  return []
}

function formatMoney(amount, currency = "RWF") {
  const parsed = Number(amount || 0)
  if (Number.isNaN(parsed)) {
    return `${currency} 0`
  }
  return `${currency} ${parsed.toLocaleString()}`
}

function formatRole(role) {
  if (!role) {
    return "User"
  }
  return role.charAt(0).toUpperCase() + role.slice(1)
}

function DashboardSummary({ data, isLoading }) {
  if (isLoading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator color="#0d5f4f" />
      </View>
    )
  }

  if (!data) {
    return (
      <View style={styles.emptyCard}>
        <Text style={styles.emptyText}>No dashboard data yet.</Text>
      </View>
    )
  }

  return (
    <View style={styles.jsonCard}>
      <Text style={styles.jsonText}>{JSON.stringify(data, null, 2)}</Text>
    </View>
  )
}

function LoginView({ credentials, errorMessage, isBusy, onChange, onSubmit }) {
  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.authWrap}>
        <Text style={styles.brandTitle}>Housify Mobile</Text>
        <Text style={styles.authSubtle}>Sign in with any existing account.</Text>
        <TextInput
          autoCapitalize="none"
          keyboardType="email-address"
          onChangeText={(value) => onChange("email", value)}
          placeholder="Email"
          placeholderTextColor="#6d7f78"
          style={styles.input}
          value={credentials.email}
        />
        <TextInput
          onChangeText={(value) => onChange("password", value)}
          placeholder="Password"
          placeholderTextColor="#6d7f78"
          secureTextEntry
          style={styles.input}
          value={credentials.password}
        />
        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
        <Pressable disabled={isBusy} onPress={onSubmit} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>{isBusy ? "Signing in..." : "Sign in"}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  )
}

function MobileApp() {
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  })
  const [token, setToken] = useState("")
  const [user, setUser] = useState(null)
  const [activeTab, setActiveTab] = useState("overview")
  const [errorMessage, setErrorMessage] = useState("")
  const [notice, setNotice] = useState("")
  const [isSigningIn, setIsSigningIn] = useState(false)

  const [dashboardData, setDashboardData] = useState(null)
  const [isDashboardLoading, setIsDashboardLoading] = useState(false)

  const [listings, setListings] = useState([])
  const [isListingsLoading, setIsListingsLoading] = useState(false)

  const [bookmarks, setBookmarks] = useState([])
  const [isBookmarksLoading, setIsBookmarksLoading] = useState(false)

  const [payments, setPayments] = useState([])
  const [isPaymentsLoading, setIsPaymentsLoading] = useState(false)
  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    method: "mobile_money",
    notes: "",
    reference: "",
    tenancy: "",
  })
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false)

  const role = user?.role || ""
  const availableTabs = useMemo(() => tabByRole[role] || ["overview"], [role])

  const bookmarksByPropertyId = useMemo(() => {
    const mapping = {}
    bookmarks.forEach((bookmark) => {
      if (bookmark?.property?.id) {
        mapping[bookmark.property.id] = bookmark.id
      }
    })
    return mapping
  }, [bookmarks])

  useEffect(() => {
    if (!role) {
      return
    }
    if (!availableTabs.includes(activeTab)) {
      setActiveTab(availableTabs[0])
    }
  }, [activeTab, availableTabs, role])

  async function refreshDashboard(currentRole, currentToken) {
    setIsDashboardLoading(true)
    try {
      const payload = await dashboardsApi.getByRole(currentRole, currentToken)
      setDashboardData(payload)
    } catch (error) {
      setNotice(error.message || "Could not load dashboard summary.")
    } finally {
      setIsDashboardLoading(false)
    }
  }

  async function refreshListings() {
    setIsListingsLoading(true)
    try {
      const payload = await propertiesApi.listPublic()
      setListings(unwrapResults(payload))
    } catch (error) {
      setNotice(error.message || "Could not load public listings.")
    } finally {
      setIsListingsLoading(false)
    }
  }

  async function refreshBookmarks(currentToken) {
    if (!currentToken) {
      return
    }
    setIsBookmarksLoading(true)
    try {
      const payload = await bookmarksApi.list(currentToken)
      setBookmarks(unwrapResults(payload))
    } catch (error) {
      setNotice(error.message || "Could not load bookmarks.")
    } finally {
      setIsBookmarksLoading(false)
    }
  }

  async function refreshPayments(currentToken) {
    if (!currentToken) {
      return
    }
    setIsPaymentsLoading(true)
    try {
      const payload = await paymentsApi.list(currentToken)
      const rows = unwrapResults(payload)
      setPayments(rows)
      if (!paymentForm.tenancy) {
        const firstTenancy = rows[0]?.tenancy_id || rows[0]?.tenancy
        if (firstTenancy) {
          setPaymentForm((current) => ({
            ...current,
            tenancy: String(firstTenancy),
          }))
        }
      }
    } catch (error) {
      setNotice(error.message || "Could not load payments.")
    } finally {
      setIsPaymentsLoading(false)
    }
  }

  async function bootstrapWorkspace(nextUser, nextToken) {
    setNotice("")
    await Promise.all([
      refreshDashboard(nextUser.role, nextToken),
      refreshListings(),
      nextUser.role === "tenant" ? refreshBookmarks(nextToken) : Promise.resolve(),
      nextUser.role === "tenant" ? refreshPayments(nextToken) : Promise.resolve(),
    ])
  }

  async function handleSignIn() {
    setErrorMessage("")
    setNotice("")
    if (!credentials.email || !credentials.password) {
      setErrorMessage("Email and password are required.")
      return
    }

    setIsSigningIn(true)
    try {
      const response = await authApi.login({
        email: credentials.email.trim(),
        password: credentials.password,
      })
      const nextToken = response?.token || ""
      if (!nextToken) {
        throw new Error("No token returned from login.")
      }
      const nextUser = await authApi.me(nextToken)
      setToken(nextToken)
      setUser(nextUser)
      setActiveTab("overview")
      await bootstrapWorkspace(nextUser, nextToken)
    } catch (error) {
      setErrorMessage(error.message || "Sign in failed.")
    } finally {
      setIsSigningIn(false)
    }
  }

  async function handleLogout() {
    const currentToken = token
    setToken("")
    setUser(null)
    setActiveTab("overview")
    setDashboardData(null)
    setListings([])
    setBookmarks([])
    setPayments([])
    setNotice("")
    try {
      if (currentToken) {
        await authApi.logout(currentToken)
      }
    } catch {
      // Ignore logout failures after local session reset.
    }
  }

  async function handleToggleBookmark(propertyId) {
    if (!token) {
      return
    }
    setNotice("")
    try {
      const bookmarkId = bookmarksByPropertyId[propertyId]
      if (bookmarkId) {
        await bookmarksApi.remove(token, bookmarkId)
      } else {
        await bookmarksApi.create(token, propertyId)
      }
      await refreshBookmarks(token)
    } catch (error) {
      setNotice(error.message || "Unable to update bookmark.")
    }
  }

  async function handleSubmitPayment() {
    if (!token) {
      return
    }
    if (!paymentForm.tenancy || !paymentForm.amount) {
      setNotice("Tenancy and amount are required.")
      return
    }
    setIsSubmittingPayment(true)
    setNotice("")
    try {
      await paymentsApi.submitTenant(token, {
        amount: paymentForm.amount,
        method: paymentForm.method,
        notes: paymentForm.notes,
        reference: paymentForm.reference,
        tenancy: Number(paymentForm.tenancy),
      })
      setPaymentForm((current) => ({
        ...current,
        amount: "",
        notes: "",
        reference: "",
      }))
      setNotice("Payment submitted successfully.")
      await refreshPayments(token)
    } catch (error) {
      setNotice(error.message || "Unable to submit payment.")
    } finally {
      setIsSubmittingPayment(false)
    }
  }

  if (!token || !user) {
    return (
      <LoginView
        credentials={credentials}
        errorMessage={errorMessage}
        isBusy={isSigningIn}
        onChange={(field, value) => setCredentials((current) => ({ ...current, [field]: value }))}
        onSubmit={handleSignIn}
      />
    )
  }

  const renderListings = () => (
    <View style={styles.sectionStack}>
      {isListingsLoading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color="#0d5f4f" />
        </View>
      ) : (
        <FlatList
          data={listings}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <View style={styles.propertyCard}>
              <Text style={styles.propertyTitle}>{item.title}</Text>
              <Text style={styles.propertyMeta}>
                {item.city || "City unknown"} - {item.neighborhood || "Neighborhood unknown"}
              </Text>
              <Text style={styles.propertyRent}>{formatMoney(item.rent_amount, item.currency)}</Text>
              {role === "tenant" ? (
                <Pressable
                  onPress={() => handleToggleBookmark(item.id)}
                  style={styles.secondaryButton}
                >
                  <Text style={styles.secondaryButtonText}>
                    {bookmarksByPropertyId[item.id] ? "Remove bookmark" : "Save bookmark"}
                  </Text>
                </Pressable>
              ) : null}
            </View>
          )}
          scrollEnabled={false}
        />
      )}
    </View>
  )

  const renderBookmarks = () => (
    <View style={styles.sectionStack}>
      {isBookmarksLoading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color="#0d5f4f" />
        </View>
      ) : bookmarks.length ? (
        bookmarks.map((bookmark) => (
          <View key={bookmark.id} style={styles.propertyCard}>
            <Text style={styles.propertyTitle}>{bookmark.property?.title || "Saved property"}</Text>
            <Text style={styles.propertyMeta}>
              {bookmark.property?.city || "City unknown"} - {bookmark.property?.neighborhood || "Neighborhood unknown"}
            </Text>
            <Text style={styles.propertyRent}>
              {formatMoney(bookmark.property?.rent_amount, bookmark.property?.currency)}
            </Text>
            <Pressable
              onPress={() => handleToggleBookmark(bookmark.property?.id)}
              style={styles.secondaryButton}
            >
              <Text style={styles.secondaryButtonText}>Remove bookmark</Text>
            </Pressable>
          </View>
        ))
      ) : (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No bookmarks yet.</Text>
        </View>
      )}
    </View>
  )

  const renderPayments = () => (
    <View style={styles.sectionStack}>
      <View style={styles.formCard}>
        <Text style={styles.panelTitle}>Submit payment</Text>
        <TextInput
          keyboardType="number-pad"
          onChangeText={(value) => setPaymentForm((current) => ({ ...current, tenancy: value }))}
          placeholder="Tenancy id"
          placeholderTextColor="#6d7f78"
          style={styles.input}
          value={paymentForm.tenancy}
        />
        <TextInput
          keyboardType="decimal-pad"
          onChangeText={(value) => setPaymentForm((current) => ({ ...current, amount: value }))}
          placeholder="Amount"
          placeholderTextColor="#6d7f78"
          style={styles.input}
          value={paymentForm.amount}
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.methodChips}>
          {paymentMethods.map((method) => (
            <Pressable
              key={method}
              onPress={() => setPaymentForm((current) => ({ ...current, method }))}
              style={[
                styles.methodChip,
                paymentForm.method === method ? styles.methodChipActive : null,
              ]}
            >
              <Text
                style={[
                  styles.methodChipText,
                  paymentForm.method === method ? styles.methodChipTextActive : null,
                ]}
              >
                {method.replace("_", " ")}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
        <TextInput
          onChangeText={(value) => setPaymentForm((current) => ({ ...current, reference: value }))}
          placeholder="Reference (optional)"
          placeholderTextColor="#6d7f78"
          style={styles.input}
          value={paymentForm.reference}
        />
        <TextInput
          onChangeText={(value) => setPaymentForm((current) => ({ ...current, notes: value }))}
          placeholder="Notes (optional)"
          placeholderTextColor="#6d7f78"
          style={[styles.input, styles.inputMultiline]}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
          value={paymentForm.notes}
        />
        <Pressable
          disabled={isSubmittingPayment}
          onPress={handleSubmitPayment}
          style={styles.primaryButton}
        >
          <Text style={styles.primaryButtonText}>
            {isSubmittingPayment ? "Submitting..." : "Submit payment"}
          </Text>
        </Pressable>
      </View>

      <View style={styles.formCard}>
        <Text style={styles.panelTitle}>Payment history</Text>
        {isPaymentsLoading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator color="#0d5f4f" />
          </View>
        ) : payments.length ? (
          payments.map((payment) => (
            <View key={payment.id} style={styles.paymentRow}>
              <View>
                <Text style={styles.paymentTitle}>{payment.property_title || "Property payment"}</Text>
                <Text style={styles.paymentMeta}>
                  {payment.status} - {payment.method}
                </Text>
              </View>
              <Text style={styles.paymentAmount}>
                {formatMoney(payment.amount_paid, payment.currency)}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No payments yet.</Text>
        )}
      </View>
    </View>
  )

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.appHeader}>
        <View>
          <Text style={styles.brandTitle}>Housify Mobile</Text>
          <Text style={styles.authSubtle}>{formatRole(role)} workspace</Text>
        </View>
        <Pressable onPress={handleLogout} style={styles.outlineButton}>
          <Text style={styles.outlineButtonText}>Logout</Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.contentWrap}
        showsVerticalScrollIndicator={false}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabBar}
        >
          {availableTabs.map((tab) => (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[styles.tabPill, activeTab === tab ? styles.tabPillActive : null]}
            >
              <Text
                style={[
                  styles.tabPillText,
                  activeTab === tab ? styles.tabPillTextActive : null,
                ]}
              >
                {tabLabels[tab] || tab}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {notice ? <Text style={styles.noticeText}>{notice}</Text> : null}

        {activeTab === "overview" ? (
          <DashboardSummary data={dashboardData} isLoading={isDashboardLoading} />
        ) : null}
        {activeTab === "listings" ? renderListings() : null}
        {activeTab === "bookmarks" ? renderBookmarks() : null}
        {activeTab === "payments" ? renderPayments() : null}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  appHeader: {
    alignItems: "center",
    borderBottomColor: "#d7e1dc",
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  authSubtle: {
    color: "#4f645d",
    fontSize: 13,
    marginTop: 2,
  },
  authWrap: {
    alignSelf: "center",
    backgroundColor: "#ffffff",
    borderColor: "#d7e1dc",
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 60,
    maxWidth: 420,
    padding: 20,
    width: "92%",
  },
  brandTitle: {
    color: "#0d332b",
    fontSize: 22,
    fontWeight: "700",
  },
  contentWrap: {
    paddingBottom: 28,
    paddingHorizontal: 14,
    paddingTop: 14,
  },
  emptyCard: {
    backgroundColor: "#ffffff",
    borderColor: "#d7e1dc",
    borderRadius: 10,
    borderWidth: 1,
    padding: 16,
  },
  emptyText: {
    color: "#4f645d",
    fontSize: 14,
  },
  errorText: {
    color: "#b20f2f",
    fontSize: 13,
    marginBottom: 10,
  },
  formCard: {
    backgroundColor: "#ffffff",
    borderColor: "#d7e1dc",
    borderRadius: 10,
    borderWidth: 1,
    padding: 14,
  },
  input: {
    backgroundColor: "#f5f9f7",
    borderColor: "#d7e1dc",
    borderRadius: 8,
    borderWidth: 1,
    color: "#0d332b",
    fontSize: 14,
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  inputMultiline: {
    minHeight: 88,
  },
  jsonCard: {
    backgroundColor: "#0d332b",
    borderRadius: 10,
    padding: 14,
  },
  jsonText: {
    color: "#cbe2da",
    fontFamily: "monospace",
    fontSize: 12,
    lineHeight: 18,
  },
  loadingWrap: {
    alignItems: "center",
    paddingVertical: 18,
  },
  methodChip: {
    backgroundColor: "#edf3f0",
    borderRadius: 999,
    marginRight: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  methodChipActive: {
    backgroundColor: "#0d5f4f",
  },
  methodChipText: {
    color: "#0d332b",
    fontSize: 12,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  methodChipTextActive: {
    color: "#ffffff",
  },
  methodChips: {
    marginTop: 10,
  },
  noticeText: {
    color: "#7c4f00",
    fontSize: 13,
    marginBottom: 10,
  },
  outlineButton: {
    borderColor: "#0d5f4f",
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  outlineButtonText: {
    color: "#0d5f4f",
    fontSize: 13,
    fontWeight: "700",
  },
  panelTitle: {
    color: "#0d332b",
    fontSize: 15,
    fontWeight: "700",
  },
  paymentAmount: {
    color: "#0d332b",
    fontSize: 14,
    fontWeight: "700",
  },
  paymentMeta: {
    color: "#4f645d",
    fontSize: 12,
    marginTop: 2,
    textTransform: "capitalize",
  },
  paymentRow: {
    alignItems: "center",
    borderTopColor: "#ebf1ee",
    borderTopWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    paddingTop: 10,
  },
  paymentTitle: {
    color: "#0d332b",
    fontSize: 13,
    fontWeight: "600",
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: "#0d5f4f",
    borderRadius: 8,
    marginTop: 12,
    paddingVertical: 11,
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
  },
  propertyCard: {
    backgroundColor: "#ffffff",
    borderColor: "#d7e1dc",
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 10,
    padding: 14,
  },
  propertyMeta: {
    color: "#4f645d",
    fontSize: 13,
    marginTop: 4,
  },
  propertyRent: {
    color: "#0d332b",
    fontSize: 14,
    fontWeight: "700",
    marginTop: 7,
  },
  propertyTitle: {
    color: "#0d332b",
    fontSize: 16,
    fontWeight: "700",
  },
  screen: {
    backgroundColor: "#f3f7f5",
    flex: 1,
  },
  secondaryButton: {
    alignItems: "center",
    borderColor: "#0d5f4f",
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 10,
    paddingVertical: 9,
  },
  secondaryButtonText: {
    color: "#0d5f4f",
    fontSize: 13,
    fontWeight: "700",
  },
  sectionStack: {
    gap: 10,
  },
  tabBar: {
    marginBottom: 12,
  },
  tabPill: {
    backgroundColor: "#e5efeb",
    borderRadius: 999,
    marginRight: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  tabPillActive: {
    backgroundColor: "#0d5f4f",
  },
  tabPillText: {
    color: "#0d332b",
    fontSize: 13,
    fontWeight: "600",
  },
  tabPillTextActive: {
    color: "#ffffff",
  },
})

export default MobileApp
