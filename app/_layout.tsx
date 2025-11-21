import { Stack } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useEffect } from "react";

import { AuthProvider, useAuth } from "../contexts/AuthContext";

// Router imports
import { 
  useRouter, 
  useSegments, 
  useRootNavigationState 
} from "expo-router";

const queryClient = new QueryClient();

// ---- AUTH GUARD ---- //
function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const navReady = useRootNavigationState();

  // Wait for router to initialize (prevents white screens)
  if (!navReady?.key) return null;

  useEffect(() => {
    const current = segments[0];
    const publicRoutes = ["signin", "signup"];
    const isPublic = publicRoutes.includes(current);

    if (!isAuthenticated && !isPublic) {
      router.replace("/signin");
    }

    if (isAuthenticated && isPublic) {
      router.replace("/");
    }
  }, [segments, isAuthenticated]);

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
