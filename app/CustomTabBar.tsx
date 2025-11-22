import React from "react";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { View } from "react-native";
import { BottomTabBar } from "@react-navigation/bottom-tabs";

export default function CustomTabBar(props: BottomTabBarProps) {
  return (
    <View
      style={{
        position: "absolute",
        bottom: 20,

        left: 20,   // ✔ Side spacing works now
        right: 20,  // ✔ Side spacing works now

        height: 75,
        borderRadius: 22,
        backgroundColor: "#FFFFFF",

        overflow: "hidden",
        elevation: 10,
        shadowColor: "#000",
        shadowOpacity: 0.12,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 8,
      }}
    >
      <BottomTabBar {...props} />
    </View>
  );
}
