import { BottomTabBar, BottomTabBarProps } from "@react-navigation/bottom-tabs";
import React from "react";
import { View } from "react-native";

export default function CustomTabBar(props: BottomTabBarProps) {
  return (
    <View
      style={{
        position: "absolute",
        bottom: 20,

        // Perfect floating width spacing
        left: 20,
        right: 20,
        height: 75,

        backgroundColor: "#3153FF",
        borderRadius: 22,
        overflow: "hidden",

        // Floating shadow
        elevation: 10,
        shadowColor: "#666666ff",
        shadowOpacity: 0.12,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 8,
      }}
    >
      <BottomTabBar {...props} />
    </View>
  );
}
