import { Stack, useRouter, useSegments } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useEffect } from "react";
import { AuthProvider, useAuth } from "../contexts/AuthContext";

const queryClient = new QueryClient();

// ---- AUTH GUARD ---- //
import { useRootNavigationState } from "expo-router";

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  // THIS is the real fix:
  const navReady = useRootNavigationState();

  // Router not ready → don't run any redirects
  if (!navReady?.key) return null;

  // Now safe:
  const current = segments[0];
  const publicRoutes = ["signin", "signup"];
  const isPublic = publicRoutes.includes(current);

  if (!isAuthenticated && !isPublic) {
    router.replace("/signin");
    return null;
  }

  if (isAuthenticated && isPublic) {
    router.replace("/");
    return null;
  }

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
