import React from "react";
import { View, StyleSheet } from "react-native";
import type { ReactNode } from "react";

export default function ScreenContainer({ children }: { children: ReactNode }) {
  return (
    <View style={styles.container}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,

    // Prevent content from sitting behind the floating tab bar
    paddingBottom: 100,

    // Center content vertically & horizontally
    justifyContent: "center",
    alignItems: "center",

    backgroundColor: "#FFFFFF",
  },
});
