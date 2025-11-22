// app/(tabs)/_layout.tsx
import { AntDesign, Feather, MaterialIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { useAuth } from "../../contexts/AuthContext";
import CustomTabBar from "../CustomTabBar"; // one level up from (tabs)

export default function TabsLayout() {
  const { user } = useAuth();
  const isLandlord = user?.role === "landlord";

  if (!user) return null;

  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />} // <- correct spread
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#FFFFFF",   // icons/labels on blue
        tabBarInactiveTintColor: "#E1E1E1",
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

      <Tabs.Screen
        name="properties"
        options={{
          title: "Properties",
          href: isLandlord ? "/(tabs)/properties" : null,
          tabBarIcon: ({ color }) => <Feather name="home" size={24} color={color} />,
        }}
      />

      <Tabs.Screen
        name="payments"
        options={{
          title: "Payments",
          href: isLandlord ? null : undefined,
          tabBarIcon: ({ color }) => <MaterialIcons name="payment" size={24} color={color} />,
        }}
      />

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
