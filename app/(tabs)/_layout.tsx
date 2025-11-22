import { AntDesign, Feather, MaterialIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { useAuth } from "../../contexts/AuthContext";
import { View, Text } from "react-native";

// ---- TYPES ---- //
type TabItemProps = {
  focused: boolean;
  icon: React.ReactNode;
  label: string;
};

// ---- CUSTOM TAB ITEM ---- //
function TabItem({ focused, icon, label }: TabItemProps) {
  return (
    <View
      style={{
        flexDirection: "row",
        backgroundColor: focused ? "#ffffff" : "transparent",
        paddingHorizontal: focused ? 16 : 10,
        paddingVertical: focused ? 8 : 8,
        borderRadius: 25,
        alignItems: "center",
        justifyContent: "center",
        minWidth: focused ? 90 : 45,
        gap: focused ? 8 : 0,
      }}
    >
      {icon}

      {focused && (
        <Text style={{ color: "#5271FF", fontWeight: "700", fontSize: 14 }}>
          {label}
        </Text>
      )}
    </View>
  );
}

// ---- MAIN TAB LAYOUT ---- //
export default function TabsLayout() {
  const { user } = useAuth();
  const isLandlord = user?.role === "landlord";

  if (!user) return null; // Prevent flicker

  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        // ---- FLOATING ROUNDED TAB BAR ---- //
        tabBarStyle: {
          position: "absolute",
          bottom: 20,
          left: 25,
          right: 25,
          height: 75,
          borderRadius: 40,
          backgroundColor: "#5271FF",
          borderTopWidth: 0,
          elevation: 10,
          shadowColor: "#000",
          shadowOpacity: 0.15,
          shadowOffset: { width: 0, height: 5 },
          shadowRadius: 10,
          paddingBottom: 10,
          paddingTop: 10,
        },

        tabBarActiveTintColor: "#5271FF",
        tabBarInactiveTintColor: "#ffffff",
        tabBarShowLabel: false,
      }}
    >
      {/* HOME */}
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) => (
            <TabItem
              focused={focused}
              icon={
                <AntDesign
                  name="home"
                  size={20}
                  color={focused ? "#5271FF" : "#ffffff"}
                />
              }
              label="Home"
            />
          ),
        }}
      />

      {/* ISSUES */}
      <Tabs.Screen
        name="issues"
        options={{
          title: "Issues",
          tabBarIcon: ({ focused }) => (
            <TabItem
              focused={focused}
              icon={
                <Feather
                  name="alert-circle"
                  size={20}
                  color={focused ? "#5271FF" : "#ffffff"}
                />
              }
              label="Issues"
            />
          ),
        }}
      />

      {/* ---- LANDLORD ONLY: PROPERTIES ---- */}
      <Tabs.Screen
        name="properties"
        options={{
          title: "Properties",
          href: isLandlord ? "/(tabs)/properties" : null,
          tabBarIcon: ({ focused }) =>
            isLandlord ? (
              <TabItem
                focused={focused}
                icon={
                  <Feather
                    name="home"
                    size={20}
                    color={focused ? "#5271FF" : "#ffffff"}
                  />
                }
                label="Properties"
              />
            ) : null,
        }}
      />

      {/* ---- TENANT ONLY: PAYMENTS ---- */}
      <Tabs.Screen
        name="payments"
        options={{
          title: "Payments",
          href: !isLandlord ? "/(tabs)/payments" : null,
          tabBarIcon: ({ focused }) =>
            !isLandlord ? (
              <TabItem
                focused={focused}
                icon={
                  <MaterialIcons
                    name="payment"
                    size={20}
                    color={focused ? "#5271FF" : "#ffffff"}
                  />
                }
                label="Payments"
              />
            ) : null,
        }}
      />

      {/* SETTINGS */}
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ focused }) => (
            <TabItem
              focused={focused}
              icon={
                <Feather
                  name="settings"
                  size={20}
                  color={focused ? "#5271FF" : "#ffffff"}
                />
              }
              label="Settings"
            />
          ),
        }}
      />
    </Tabs>
  );
}
