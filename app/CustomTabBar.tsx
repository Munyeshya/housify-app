import { BottomTabBar, BottomTabBarProps } from "@react-navigation/bottom-tabs";
import React from "react";
import { View } from "react-native";

export default function CustomTabBar(props: BottomTabBarProps) {
  return (
    <View
      style={{
        position: "absolute",
        bottom: 20,
        left: 20,
        right: 20,
        height: 75,

        backgroundColor: "#3153FF", // ← NEW BLUE BACKGROUND
        borderRadius: 22,
        overflow: "hidden",

        elevation: 10,
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: 3 },
        shadowRadius: 8,
      }}
    >
      <BottomTabBar {...props} />
    </View>
  );
}
