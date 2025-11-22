import { AntDesign, Feather, MaterialIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { useAuth } from "../../contexts/AuthContext";

export default function TabsLayout() {
  const { user } = useAuth();
  const isLandlord = user?.role === "landlord";

  if (!user) return null;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        tabBarActiveTintColor: "#3153FF",
        tabBarInactiveTintColor: "#8a8a8a",

        // ---- FLOATING ROUNDED TAB BAR WITH 20PX SIDE SPACING ---- //
        tabBarStyle: {
          position: "absolute",
          bottom: 20,

          // *** This now works on iOS + Android + Web ***
          left: 20,
          right: 20,
          width: "auto",
          alignSelf: "center",

          height: 75,
          paddingTop: 10,
          paddingBottom: 10,

          backgroundColor: "#FFFFFF",
          borderRadius: 22,
          borderTopWidth: 0,

          elevation: 10,
          shadowColor: "#000",
          shadowOpacity: 0.12,
          shadowOffset: { width: 0, height: 2 },
          shadowRadius: 8,

          overflow: "hidden",
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

      {/* TENANT ONLY */}
      <Tabs.Screen
        name="payments"
        options={{
          title: "Payments",
          href: !isLandlord ? "/(tabs)/payments" : null,
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
