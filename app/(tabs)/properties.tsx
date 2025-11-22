import AppHeader from "../../components/AppHeader";
import ScreenContainer from "../../components/ScreenContainer";
import { Text } from "react-native";

export default function Properties() {
  return (
    <>
      <AppHeader title="Properties" />

      <ScreenContainer>
        <Text style={{ fontSize: 20 }}>
          Your managed properties will appear here.
        </Text>
      </ScreenContainer>
    </>
  );
}
