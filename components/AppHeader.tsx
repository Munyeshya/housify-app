import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function AppHeader({ title }: { title: string }) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.header,
        { paddingTop: insets.top + 20 }
      ]}
    >
      <Text style={styles.title}>{title}</Text>

      <TouchableOpacity style={styles.icon}>
        <Feather name="bell" size={26} color="#fff" />
      </TouchableOpacity>

      {/* The large bottom curve */}
      <View style={styles.curveContainer}>
        <View style={styles.curveShape} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#6322FF",
    paddingHorizontal: 20,
    paddingBottom: 50,   // ❤️ deeper header like screenshot
    position: "relative",
  },

  title: {
    color: "white",
    fontSize: 26,
    fontWeight: "700",
  },

  icon: {
    position: "absolute",
    right: 20,
    top: 50,
  },

  curveContainer: {
    position: "absolute",
    bottom: -40,   // ❤️ pulls curve down to create that “dip”
    left: 0,
    right: 0,
    height: 80,
    overflow: "hidden",
  },

  curveShape: {
    flex: 1,
    backgroundColor: "white",
    borderTopLeftRadius: 45,   // ❤️ VERY LARGE radius
    borderTopRightRadius: 45,  // ❤️ creates big soft curves
  },
});
