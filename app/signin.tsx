import { useRouter } from "expo-router";
import { useState } from "react";
import { Image, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { AntDesign } from "@expo/vector-icons";

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
    <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>

      {/* Blue Header */}
      <View
        style={{
          backgroundColor: "#3153ffff",
          height: 220,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {/* Real Logo Inside White Circle */}
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
            resizeMode="contain"
            style={{ width: 48, height: 48 }}
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
          Sign in to your{"\n"}Account
        </Text>

        {/* <Text
          style={{
            marginTop: 6,
            fontSize: 14,
            color: "white",
            opacity: 0.9,
          }}
        >
          Enter your email and password to log in
        </Text> */}
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
            gap: 10
          }}
        >
          <AntDesign name="google" size={20} color="#000" />

          <Text style={{ fontSize: 16, fontWeight: "600" }}>
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
            marginBottom: 6,
          }}
        />

        {/* Remember me + Forgot Password */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 20,
          }}
        >
          {/* <Text style={{ color: "#6b6b6b" }}>Remember me</Text> */}
          <TouchableOpacity>
            <Text style={{ color: "#3153ffff" }}>Forgot password?</Text>
          </TouchableOpacity>
        </View>

        {/* Login Button */}
        <TouchableOpacity
          onPress={handleSignIn}
          style={{
            backgroundColor: "#3153ffff",
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
            Log In
          </Text>
        </TouchableOpacity>

        {/* Create account */}
        <TouchableOpacity onPress={() => router.push("/signup")}>
          <Text style={{ textAlign: "center", color: "#3153ffff", fontSize: 15 }}>
            Don’t have an account? Sign Up
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
