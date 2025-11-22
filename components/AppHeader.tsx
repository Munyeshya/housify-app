import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function AppHeader({ title }: { title: string }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ backgroundColor: "#6322FF" }}>
      {/* Actual header area */}
      <View
        style={[
          styles.headerContainer,
          { paddingTop: insets.top + 20 }
        ]}
      >
        <Text style={styles.title}>{title}</Text>

        <TouchableOpacity>
          <Feather name="bell" size={26} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* The large round curve that matches your screenshot */}
      <View style={styles.bottomCurve} />
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    paddingHorizontal: 25,
    paddingBottom: 30,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  title: {
    color: "white",
    fontSize: 28,
    fontWeight: "700",
  },

  bottomCurve: {
    width: "100%",
    height: 40,
    backgroundColor: "white",
    borderTopLeftRadius: 80,
    borderTopRightRadius: 80,
  },
});
