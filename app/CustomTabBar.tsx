// app/CustomTabBar.tsx
import React from "react";
import { View, StyleSheet } from "react-native";
import { BottomTabBar, BottomTabBarProps } from "@react-navigation/bottom-tabs";

/**
 * Custom wrapper that provides floating rounded background.
 * We DO NOT rely on props.style (React Navigation types don't expose it reliably).
 * Instead make the inner BottomTabBar transparent so the wrapper shows through.
 */
export default function CustomTabBar(props: BottomTabBarProps) {
  return (
    <View style={styles.wrapper}>
      <BottomTabBar
        {...props}
        style={{
          backgroundColor: "transparent", // <-- KEY: let wrapper color show through
          borderTopWidth: 0,
          elevation: 0,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: 20,
    right: 20,
    bottom: 20,
    height: 75,

    backgroundColor: "#3153FF", // your blue background
    borderRadius: 22,
    overflow: "hidden",

    // floating shadow
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
  },
});
