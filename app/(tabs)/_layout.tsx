import React from "react";
import { Tabs } from "expo-router";
import { useAuth } from "../../contexts/AuthContext";
import { AntDesign, Feather, MaterialIcons } from "@expo/vector-icons";

/**
 * Tabs layout — role-based tabs.
 * - waits for user via useAuth
 * - shows landlord tabs (properties) or tenant tabs (payments)
 */

export default function TabsLayout() {
  const { user } = useAuth();
  const isLandlord = user?.role === "landlord";

  // If user is not yet available, show nothing (AuthGuard at root prevents this normally)
  // But this ensures no flicker if called directly.
  if (!user) return null;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#5271FF",
        tabBarInactiveTintColor: "#8a8a8a",
        tabBarStyle: {
          height: 70,
          paddingBottom: 12,
          paddingTop: 8,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <AntDesign name="home" size={24} color={color} />,
        }}
      />

      <Tabs.Screen
        name="issues"
        options={{
          title: "Issues",
          tabBarIcon: ({ color }) => <Feather name="alert-circle" size={24} color={color} />,
        }}
      />

      {isLandlord ? (
        <Tabs.Screen
          name="properties"
          options={{
            title: "Properties",
            tabBarIcon: ({ color }) => <Feather name="home" size={24} color={color} />,
          }}
        />
      ) : (
        <Tabs.Screen
          name="payments"
          options={{
            title: "Payments",
            tabBarIcon: ({ color }) => <MaterialIcons name="payment" size={24} color={color} />,
          }}
        />
      )}

      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => <Feather name="settings" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
