import { AntDesign, Feather, MaterialIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { useAuth } from "../../contexts/AuthContext";
import CustomTabBar from "../CustomTabBar"; // IMPORTANT: custom bar outside tabs folder

export default function TabsLayout() {
  const { user } = useAuth();
  const isLandlord = user?.role === "landlord";

  if (!user) return null;

  return (
    <Tabs
      // Use custom floating tab bar wrapper
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,

        // ACTIVE / INACTIVE ICON + LABEL COLORS
        tabBarActiveTintColor: "#FFFFFF",  // white icons/labels on blue bar
        tabBarInactiveTintColor: "#E1E1E1", // light grey icons/labels

        // INTERNAL PADDING INSIDE THE FLOATING BAR
        tabBarItemStyle: {
          paddingVertical: 6,
          paddingHorizontal: 10,
        },

        tabBarIconStyle: {
          marginBottom: 2,
        },

        tabBarLabelStyle: {
          paddingTop: 2,
          fontSize: 12,
          fontWeight: "600",
        },
      }}
    >
      {/* HOME */}
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <AntDesign name="home" size={24} color={color} />
          ),
        }}
      />

      {/* ISSUES */}
      <Tabs.Screen
        name="issues"
        options={{
          title: "Issues",
          tabBarIcon: ({ color }) => (
            <Feather name="alert-circle" size={24} color={color} />
          ),
        }}
      />

      {/* LANDLORD ONLY */}
      <Tabs.Screen
        name="properties"
        options={{
          title: "Properties",
          href: isLandlord ? "/(tabs)/properties" : null,
          tabBarIcon: ({ color }) => (
            <Feather name="home" size={24} color={color} />
          ),
        }}
      />

      {/* TENANT ONLY — FIXED BEHAVIOR */}
      <Tabs.Screen
        name="payments"
        options={{
          title: "Payments",
          href: isLandlord ? null : undefined,  // FIXED: preserves alignment + hides correctly
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="payment" size={24} color={color} />
          ),
        }}
      />

      {/* SETTINGS */}
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => (
            <Feather name="settings" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
