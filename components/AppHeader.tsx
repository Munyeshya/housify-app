import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function AppHeader({ title }: { title: string }) {
  const insets = useSafeAreaInsets(); // top notch safe area

  return (
    <View
      style={[
        styles.headerContainer,
        { paddingTop: insets.top + 15 } // dynamic safe-area + padding
      ]}
    >
      <Text style={styles.title}>{title}</Text>

      <TouchableOpacity style={styles.iconWrapper}>
        <Feather name="bell" size={26} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    width: "100%",
    backgroundColor: "#6322FF", // your purple/blue gradient color
    paddingHorizontal: 20,
    paddingBottom: 30,

    // 👇 curved bottom shape
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",

    // subtle shadow
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 }
  },

  title: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "700",
  },

  iconWrapper: {
    padding: 8,
  }
});
