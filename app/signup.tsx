import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../contexts/AuthContext";

export default function SignUpScreen() {
  const router = useRouter();
  const { signUp } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignUp = async () => {
    await signUp(email, password);
    router.replace("/");
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#FFFFFF", paddingHorizontal: 24, justifyContent: "center" }}>
      
      <Text style={{ fontSize: 32, fontWeight: "800", color: "#111", marginBottom: 6 }}>
        Create your
      </Text>
      <Text style={{ fontSize: 32, fontWeight: "800", color: "#5271FF", marginBottom: 32 }}>
        Account
      </Text>

      <TextInput
        placeholder="Email address"
        placeholderTextColor="#8a8a8a"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
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

      <TouchableOpacity
        onPress={handleSignUp}
        style={{
          backgroundColor: "#5271FF",
          paddingVertical: 16,
          borderRadius: 12,
          marginBottom: 16,
        }}
      >
        <Text style={{ color: "white", fontSize: 18, fontWeight: "700", textAlign: "center" }}>
          Create Account
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/signin")}>
        <Text style={{ textAlign: "center", marginTop: 6, color: "#5271FF", fontSize: 15 }}>
          Already have an account? Sign In
        </Text>
      </TouchableOpacity>
    </View>
  );
}
