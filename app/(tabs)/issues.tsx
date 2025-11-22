import AppHeader from "../../components/AppHeader";
import ScreenContainer from "../../components/ScreenContainer";
import { Text } from "react-native";

export default function Issues() {
  return (
    <>
      <AppHeader title="Issues" />

      <ScreenContainer>
        <Text style={{ fontSize: 20 }}>Your issues will appear here.</Text>
      </ScreenContainer>
    </>
  );
}
