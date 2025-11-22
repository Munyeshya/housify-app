import AppHeader from "../../components/AppHeader";
import ScreenContainer from "../../components/ScreenContainer";
import { Text } from "react-native";

export default function Settings() {
  return (
    <>
      <AppHeader title="Settings" />

      <ScreenContainer>
        <Text style={{ fontSize: 20 }}>
          Account & app settings will appear here.
        </Text>
      </ScreenContainer>
    </>
  );
}
