import { Stack, useRouter, useSegments } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useEffect } from "react";
import { AuthProvider, useAuth } from "../contexts/AuthContext";

const queryClient = new QueryClient();

// ---- AUTH GUARD ---- //
function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const current = segments[0];

    const isAuthPage =
      current === "signin" || current === "signup";

    if (!isAuthenticated && !isAuthPage) {
      router.replace("/signin");
    }

    if (isAuthenticated && isAuthPage) {
      router.replace("/");
    }
  }, [isAuthenticated, segments]);

  return <>{children}</>;
}


export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <AuthGuard>
              <Stack screenOptions={{ headerShown: false }} />
            </AuthGuard>
          </AuthProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
