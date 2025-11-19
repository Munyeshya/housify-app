"use client";

import AppIntroSlider from "react-native-app-intro-slider";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

const slides = [
  {
    key: "1",
    title: "Welcome to Housify",
    text: "Find the perfect home or manage your properties effortlessly.",
    image: require("../assets/images/1.png"),
  },
  {
    key: "2",
    title: "For Landlords",
    text: "Register properties, track tenants, and handle claims with ease.",
    image: require("../assets/images/2.png"),
  },
  {
    key: "3",
    title: "For Tenants",
    text: "View details, submit issues, and pay rent from your phone.",
    image: require("../assets/images/3.png"),
  },
];

export default function WelcomeScreen() {
  const router = useRouter();

  const renderItem = ({ item }: any) => (
    <View className="flex-1 items-center justify-center px-6">
      <Image
        source={item.image}
        className="w-64 h-64 mb-10"
        resizeMode="contain"
      />
      <Text className="text-3xl font-bold text-gray-900 text-center mb-4">
        {item.title}
      </Text>
      <Text className="text-base text-gray-600 text-center">
        {item.text}
      </Text>
    </View>
  );

  const renderDoneButton = () => (
    <TouchableOpacity
      onPress={() => router.push("/(auth)/login")}
      className="bg-blue-600 py-3 px-10 rounded-xl mb-10"
    >
      <Text className="text-white font-semibold text-lg">Get Started</Text>
    </TouchableOpacity>
  );

  return (
    <AppIntroSlider
      renderItem={renderItem}
      data={slides}
      activeDotStyle={{ backgroundColor: "#2563eb", width: 30 }}
      dotStyle={{ backgroundColor: "#cbd5e1" }}
      renderDoneButton={renderDoneButton}
    />
  );
}
