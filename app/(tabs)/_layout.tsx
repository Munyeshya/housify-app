import { AntDesign, Feather, MaterialIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { useAuth } from "../../contexts/AuthContext";
import { View, Text } from "react-native";

export default function TabsLayout() {
  const { user } = useAuth();
  const isLandlord = user?.role === "landlord";

  if (!user) return null;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        // ---- FLOATING BLUE ROUNDED TAB BAR ---- //
        tabBarStyle: {
          position: "absolute",
          bottom: 20,
          left: 20,
          right: 20,
          height: 85,
          backgroundColor: "#3153FF",
          borderRadius: 22,
          borderTopWidth: 0,

          elevation: 8,
          shadowColor: "#000",
          shadowOpacity: 0.18,
          shadowOffset: { width: 0, height: 3 },
          shadowRadius: 8,

          paddingTop: 8,
          paddingBottom: 8,
        },

        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 12,
          marginTop: 2,
          fontWeight: "600",
        },

        tabBarActiveTintColor: "#FFFFFF",
        tabBarInactiveTintColor: "#D6D6D6",
      }}
    >
      {/* HOME */}
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ focused, color }) => (
            <CenteredIcon>
              <AntDesign
                name="home"
                size={24}
                color={focused ? "#FFFFFF" : "#D6D6D6"}
              />
            </CenteredIcon>
          ),
        }}
      />

      {/* ISSUES */}
      <Tabs.Screen
        name="issues"
        options={{
          title: "Issues",
          tabBarIcon: ({ focused }) => (
            <CenteredIcon>
              <Feather
                name="alert-circle"
                size={24}
                color={focused ? "#FFFFFF" : "#D6D6D6"}
              />
            </CenteredIcon>
          ),
        }}
      />

      {/* LANDLORD ONLY — PROPERTIES */}
      <Tabs.Screen
        name="properties"
        options={{
          title: "Properties",
          href: isLandlord ? "/(tabs)/properties" : null,
          tabBarIcon: ({ focused }) =>
            isLandlord ? (
              <CenteredIcon>
                <Feather
                  name="home"
                  size={24}
                  color={focused ? "#FFFFFF" : "#D6D6D6"}
                />
              </CenteredIcon>
            ) : null,
        }}
      />

      {/* TENANT ONLY — PAYMENTS */}
      <Tabs.Screen
        name="payments"
        options={{
          title: "Payments",
          href: !isLandlord ? "/(tabs)/payments" : null,
          tabBarIcon: ({ focused }) =>
            !isLandlord ? (
              <CenteredIcon>
                <MaterialIcons
                  name="payment"
                  size={26}
                  color={focused ? "#FFFFFF" : "#D6D6D6"}
                />
              </CenteredIcon>
            ) : null,
        }}
      />

      {/* SETTINGS */}
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ focused }) => (
            <CenteredIcon>
              <Feather
                name="settings"
                size={24}
                color={focused ? "#FFFFFF" : "#D6D6D6"}
              />
            </CenteredIcon>
          ),
        }}
      />
    </Tabs>
  );
}

/* ---- Centered Icon Wrapper ---- */
function CenteredIcon({ children }) {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",

        // Ensures icon stays centered vertically
        paddingBottom: 2,
      }}
    >
      {children}
    </View>
  );
}
