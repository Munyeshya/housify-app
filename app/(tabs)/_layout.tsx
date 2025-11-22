import { AntDesign, Feather, MaterialIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { useAuth } from "../../contexts/AuthContext";
import { View } from "react-native";

// ---- TYPES ---- //
type TabItemProps = {
  focused: boolean;
  icon: React.ReactNode;
};

// ---- CUSTOM TAB ITEM (ICONS ONLY) ---- //
function TabItem({ focused, icon }: TabItemProps) {
  return (
    <View
      style={{
        backgroundColor: focused ? "#ffffff" : "transparent",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 30,
        alignItems: "center",
        justifyContent: "center",
        minWidth: 50,
      }}
    >
      {icon}
    </View>
  );
}

// ---- MAIN TAB LAYOUT ---- //
export default function TabsLayout() {
  const { user } = useAuth();
  const isLandlord = user?.role === "landlord";

  if (!user) return null;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        // FLOATING ROUNDED TAB BAR
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
        tabBarShowLabel: false, // no labels
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
                  size={22}
                  color={focused ? "#5271FF" : "#ffffff"}
                />
              }
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
                  size={22}
                  color={focused ? "#5271FF" : "#ffffff"}
                />
              }
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
              <TabItem
                focused={focused}
                icon={
                  <Feather
                    name="home"
                    size={22}
                    color={focused ? "#5271FF" : "#ffffff"}
                  />
                }
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
              <TabItem
                focused={focused}
                icon={
                  <MaterialIcons
                    name="payment"
                    size={22}
                    color={focused ? "#5271FF" : "#ffffff"}
                  />
                }
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
                  size={22}
                  color={focused ? "#5271FF" : "#ffffff"}
                />
              }
            />
          ),
        }}
      />
    </Tabs>
  );
}