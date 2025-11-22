import AppHeader from "../../components/AppHeader";
import ScreenContainer from "../../components/ScreenContainer";
import { Text } from "react-native";

export default function Home() {
  return (
    <>
      <AppHeader title="Dashboard" />

      <ScreenContainer>
        <Text style={{ fontSize: 20, fontWeight: "600" }}>
          Welcome to your Dashboard
        </Text>
      </ScreenContainer>
    </>
  );
}
