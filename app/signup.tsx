import { AntDesign } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Animated,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../contexts/AuthContext";

/**
 * Sign Up screen — same behavior as Sign In
 * - validates fields
 * - shakes only form inputs + create button when invalid
 * - shows subtle red message
 */

export default function SignUpScreen() {
  const router = useRouter();
  const { signUp } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const shakeAnim = useRef(new Animated.Value(0)).current;

  const runShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -6, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const handleSignUp = async () => {
    if (!email.trim() || !password.trim()) {
      setError("⚠ Please fill in all fields");
      runShake();
      return;
    }

    setError(null);

    await signUp(email.trim(), password);
    router.replace("/(tabs)/home");
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoWrap}>
          <Image source={require("../assets/images/logo.png")} resizeMode="contain" style={styles.logo} />
        </View>

        <Text style={styles.title}>
          Create your{"\n"}Account
        </Text>
      </View>

      <View style={styles.cardRoot}>
        <TouchableOpacity style={styles.googleButton}>
          <AntDesign name="google" size={20} color="#000" />
          <Text style={styles.googleText}>Continue with Google</Text>
        </TouchableOpacity>

        <View style={styles.dividerRow}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>Or</Text>
          <View style={styles.divider} />
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Animated.View style={{ transform: [{ translateX: shakeAnim }] }}>
          <TextInput
            placeholder="Email address"
            placeholderTextColor="#8a8a8a"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
          />

          <TextInput
            placeholder="Password"
            placeholderTextColor="#8a8a8a"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            style={[styles.input, { marginBottom: 24 }]}
          />

          <TouchableOpacity onPress={handleSignUp} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Create Account</Text>
          </TouchableOpacity>
        </Animated.View>

        <TouchableOpacity onPress={() => router.push("/signin")}>
          <Text style={styles.switchText}>Already have an account? Sign In</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  header: {
    backgroundColor: "#3153ffff",
    height: 220,
    justifyContent: "center",
    alignItems: "center",
  },
  logoWrap: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  logo: { width: 48, height: 48 },
  title: { marginTop: 20, fontSize: 28, fontWeight: "800", color: "white", textAlign: "center" },

  cardRoot: { marginTop: -40, padding: 20 },

  googleButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#e5e5e5",
    paddingVertical: 14,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    gap: 10,
  },
  googleText: { marginLeft: 4, fontSize: 16, fontWeight: "600" },

  dividerRow: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  divider: { flex: 1, height: 1, backgroundColor: "#e5e5e5" },
  dividerText: { marginHorizontal: 10, color: "#6b6b6b" },

  errorText: { color: "#D64545", marginBottom: 10, textAlign: "left" },

  input: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    marginBottom: 14,
  },

  primaryButton: { backgroundColor: "#3153ffff", paddingVertical: 16, borderRadius: 12, marginBottom: 16 },
  primaryButtonText: { color: "white", textAlign: "center", fontSize: 18, fontWeight: "700" },

  switchText: { textAlign: "center", color: "#3153ffff", fontSize: 15 },
});
