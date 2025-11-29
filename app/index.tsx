import React from "react";
import { Redirect } from "expo-router";
import { useAuth } from "../contexts/AuthContext";

/**
 * Central redirect:
 * - If authenticated → go to tabs home
 * - If not → go to signin
 *
 * Using Redirect keeps the routing clean and prevents premature navigation.
 */

export default function Index() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Redirect href="/signin" />;
  }

  return <Redirect href="/(tabs)/home" />;
}
