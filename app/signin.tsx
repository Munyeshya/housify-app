import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../contexts/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function SignInScreen() {
  const router = useRouter();
  const { signIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignIn = async () => {
    await signIn(email, password);
    router.replace("/");
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#FFFFFF", paddingHorizontal: 24, justifyContent: "center" }}>
      
      {/* Heading */}
      <Text style={{ fontSize: 32, fontWeight: "800", color: "#111", marginBottom: 6 }}>
        Sign in to your
      </Text>
      <Text style={{ fontSize: 32, fontWeight: "800", color: "#5271FF", marginBottom: 32 }}>
        Account
      </Text>

      {/* Email */}
      <TextInput
        placeholder="Email address"
        placeholderTextColor="#8a8a8a"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
        style={{
          borderWidth: 1,
          borderColor: "#dcdcdc",
          backgroundColor: "#fafafa",
          borderRadius: 12,
          padding: 14,
          marginBottom: 14,
          fontSize: 16,
        }}
      />

      {/* Password */}
      <TextInput
        placeholder="Password"
        placeholderTextColor="#8a8a8a"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={{
          borderWidth: 1,
          borderColor: "#dcdcdc",
          backgroundColor: "#fafafa",
          borderRadius: 12,
          padding: 14,
          marginBottom: 24,
          fontSize: 16,
        }}
      />

      {/* Primary Button */}
      <TouchableOpacity
        onPress={handleSignIn}
        style={{
          backgroundColor: "#5271FF",
          paddingVertical: 16,
          borderRadius: 12,
          marginBottom: 16,
        }}
      >
        <Text style={{ color: "white", fontSize: 18, fontWeight: "700", textAlign: "center" }}>
          Sign In
        </Text>
      </TouchableOpacity>

      {/* Switch to sign up */}
      <TouchableOpacity onPress={() => router.push("/signup")}>
        <Text style={{ textAlign: "center", marginTop: 6, color: "#5271FF", fontSize: 15 }}>
          Don’t have an account? Create one
        </Text>
      </TouchableOpacity>

      {/* Developer button (temporary) */}
      <TouchableOpacity
        onPress={async () => {
          await AsyncStorage.clear();
          alert("Storage cleared. Restart the app.");
        }}
        style={{ marginTop: 20 }}
      >
      </TouchableOpacity>
    </View>
  );
}
