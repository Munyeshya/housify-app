import React from "react";
import { View, StyleSheet } from "react-native";
import { BottomTabBar, BottomTabBarProps } from "@react-navigation/bottom-tabs";

export default function CustomTabBar(props: BottomTabBarProps) {
  return (
    <View style={styles.wrapper}>
      {/* We DO NOT use props.style — we override everything manually */}
      <BottomTabBar
        {...props}
        style={{
          backgroundColor: "transparent",
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
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

    backgroundColor: "#FFFFFF",
    borderRadius: 22,

    // Shadow for floating effect
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,

    overflow: "hidden",
  },
});
