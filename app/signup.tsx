import { useRouter } from "expo-router";
import { useState } from "react";
import { Text, TextInput, TouchableOpacity, View, Image } from "react-native";
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
    <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      
      {/* Blue Header */}
      <View
        style={{
          backgroundColor: "#5271FF",
          height: 220,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {/* Real Logo */}
        <View
          style={{
            width: 70,
            height: 70,
            borderRadius: 35,
            backgroundColor: "white",
            justifyContent: "center",
            alignItems: "center",
            overflow: "hidden",
          }}
        >
          <Image
            source={require("../assets/images/logo.png")}
            style={{ width: 48, height: 48, resizeMode: "contain" }}
          />
        </View>

        <Text
          style={{
            marginTop: 20,
            fontSize: 28,
            fontWeight: "800",
            color: "white",
            textAlign: "center",
          }}
        >
          Create your{"\n"}Account
        </Text>

        <Text
          style={{
            marginTop: 6,
            fontSize: 14,
            color: "white",
            opacity: 0.9,
          }}
        >
          Register to get started
        </Text>
      </View>

      {/* Card Section */}
      <View style={{ marginTop: -40, padding: 20 }}>
        
        {/* Google Button */}
        <TouchableOpacity
          style={{
            backgroundColor: "#FFFFFF",
            borderWidth: 1,
            borderColor: "#e5e5e5",
            paddingVertical: 14,
            borderRadius: 12,
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <Text style={{ marginLeft: 8, fontSize: 16, fontWeight: "600" }}>
            Continue with Google
          </Text>
        </TouchableOpacity>

        {/* Divider */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <View style={{ flex: 1, height: 1, backgroundColor: "#e5e5e5" }} />
          <Text style={{ marginHorizontal: 10, color: "#6b6b6b" }}>Or</Text>
          <View style={{ flex: 1, height: 1, backgroundColor: "#e5e5e5" }} />
        </View>

        {/* Inputs */}
        <TextInput
          placeholder="Email address"
          placeholderTextColor="#8a8a8a"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
          style={{
            backgroundColor: "#ffffff",
            borderWidth: 1,
            borderColor: "#e5e5e5",
            borderRadius: 12,
            padding: 14,
            fontSize: 16,
            marginBottom: 14,
          }}
        />

        <TextInput
          placeholder="Password"
          placeholderTextColor="#8a8a8a"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={{
            backgroundColor: "#ffffff",
            borderWidth: 1,
            borderColor: "#e5e5e5",
            borderRadius: 12,
            padding: 14,
            fontSize: 16,
            marginBottom: 24,
          }}
        />

        {/* Create Account Button */}
        <TouchableOpacity
          onPress={handleSignUp}
          style={{
            backgroundColor: "#5271FF",
            paddingVertical: 16,
            borderRadius: 12,
            marginBottom: 16,
          }}
        >
          <Text
            style={{
              color: "white",
              textAlign: "center",
              fontSize: 18,
              fontWeight: "700",
            }}
          >
            Create Account
          </Text>
        </TouchableOpacity>

        {/* Switch */}
        <TouchableOpacity onPress={() => router.push("/signin")}>
          <Text style={{ textAlign: "center", color: "#5271FF", fontSize: 15 }}>
            Already have an account? Sign In
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
