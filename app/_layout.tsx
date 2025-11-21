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

  // Get current route safely
  const current = segments?.[0];

  // Public screens
  const publicRoutes = ["signin", "signup"];
  const isPublic = publicRoutes.includes(current);

  // Segments undefined on first render — wait 1 cycle
  if (current === undefined) return null;

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
