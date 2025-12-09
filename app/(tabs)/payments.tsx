import AppHeader from "../../components/AppHeader";
import ScreenContainer from "../../components/ScreenContainer";
import { Text } from "react-native";

export default function Payments() {
  return (
    <>
      <AppHeader title="Payments" />

      <ScreenContainer>
        <Text style={{ fontSize: 20 }}>
          Your rent payments will appear here.
        </Text>
      </ScreenContainer>
    </>
  );
}