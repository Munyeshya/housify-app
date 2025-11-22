import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function AppHeader({ title }: { title: string }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrapper, { paddingTop: insets.top + 15 }]}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{title}</Text>

        <TouchableOpacity>
          <Feather name="bell" size={26} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Bottom curve */}
      <View style={styles.curve} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: "#6322FF",
    paddingHorizontal: 25,
    paddingBottom: 40,
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "white",
  },

  curve: {
    height: 40,
    backgroundColor: "white",

    // This creates the SAME curve on web + mobile
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,

    marginTop: 20,

    // Web + Native consistent clipping
    overflow: "hidden",
  },
});
