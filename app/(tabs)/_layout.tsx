import { AntDesign, Feather, MaterialIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { View } from "react-native";
import { useAuth } from "../../contexts/AuthContext";

export default function TabsLayout() {
  const { user } = useAuth();
  const isLandlord = user?.role === "landlord";

  if (!user) return null;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        // ---- CLEAN WHITE TAB BAR ---- //
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          height: 80,
          borderTopWidth: 0,
          elevation: 10,
          shadowColor: "#000",
          shadowOpacity: 0.06,
          shadowOffset: { width: 0, height: -2 },
          shadowRadius: 8,
        },

        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 12,
          marginTop: 2,
        },

        tabBarActiveTintColor: "#3153ffff",
        tabBarInactiveTintColor: "#B0B0B0",
      }}
    >
      {/* HOME */}
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ focused, color }) => (
            <View style={{ alignItems: "center", justifyContent: "center" }}>
              <AntDesign
                name="home"
                size={24}
                color={focused ? "#3153ffff" : "#B0B0B0"}
              />
            </View>
          ),
        }}
      />

      {/* ISSUES */}
      <Tabs.Screen
        name="issues"
        options={{
          title: "Issues",
          tabBarIcon: ({ focused }) => (
            <View style={{ alignItems: "center", justifyContent: "center" }}>
              <Feather
                name="alert-circle"
                size={24}
                color={focused ? "#3153ffff" : "#B0B0B0"}
              />
            </View>
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
              <View style={{ alignItems: "center", justifyContent: "center" }}>
                <Feather
                  name="home"
                  size={24}
                  color={focused ? "#3153ffff" : "#B0B0B0"}
                />
              </View>
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
              <View style={{ alignItems: "center", justifyContent: "center" }}>
                <MaterialIcons
                  name="payment"
                  size={24}
                  color={focused ? "#3153ffff" : "#B0B0B0"}
                />
              </View>
            ) : null,
        }}
      />

      {/* SETTINGS */}
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ focused }) => (
            <View style={{ alignItems: "center", justifyContent: "center" }}>
              <Feather
                name="settings"
                size={24}
                color={focused ? "#3153ffff" : "#B0B0B0"}
              />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
