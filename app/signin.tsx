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
    router.replace("/"); // go to home
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", padding: 20 }}>
      <Text style={{ fontSize: 28, fontWeight: "bold", marginBottom: 20 }}>
        Sign In
      </Text>

      <TextInput
        placeholder="Email"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
        style={{
          borderWidth: 1,
          borderRadius: 8,
          padding: 12,
          marginBottom: 12,
        }}
      />

      <TextInput
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={{
          borderWidth: 1,
          borderRadius: 8,
          padding: 12,
          marginBottom: 20,
        }}
      />

      <TouchableOpacity
        onPress={handleSignIn}
        style={{
          backgroundColor: "black",
          padding: 14,
          borderRadius: 8,
          marginBottom: 10,
        }}
      >
        <Text style={{ color: "white", textAlign: "center", fontSize: 16 }}>
          Sign In
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={async () => {
          await AsyncStorage.clear();
          alert("Storage cleared. Restart the app.");
        }}
        style={{ marginTop: 20 }}
      >
        <Text style={{ textAlign: "center", color: "red" }}>
          Reset Session (Dev Only)
        </Text> 
      </TouchableOpacity>
    </View>
  );
}
