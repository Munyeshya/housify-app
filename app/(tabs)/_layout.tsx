import { AntDesign, Feather, MaterialIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { useAuth } from "../../contexts/AuthContext";
import { View } from "react-native";

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

          // No top border
          borderTopWidth: 0,

          // Shadow for floating effect
          elevation: 8,
          shadowColor: "#000",
          shadowOpacity: 0.2,
          shadowOffset: { width: 0, height: 4 },
          shadowRadius: 10,

          paddingBottom: 10,
        },

        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 12,
          marginTop: 2,
          color: "#ffffff",
        },

        tabBarActiveTintColor: "#ffffff",
        tabBarInactiveTintColor: "#E1E1E1",
      }}
    >
      {/* HOME */}
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) => (
            <AntDesign
              name="home"
              size={24}
              color={focused ? "#ffffff" : "#E1E1E1"}
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
            <Feather
              name="alert-circle"
              size={24}
              color={focused ? "#ffffff" : "#E1E1E1"}
            />
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
              <Feather
                name="home"
                size={24}
                color={focused ? "#ffffff" : "#E1E1E1"}
              />
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
              <MaterialIcons
                name="payment"
                size={26}
                color={focused ? "#ffffff" : "#E1E1E1"}
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
            <Feather
              name="settings"
              size={24}
              color={focused ? "#ffffff" : "#E1E1E1"}
            />
          ),
        }}
      />
    </Tabs>
  );
}
