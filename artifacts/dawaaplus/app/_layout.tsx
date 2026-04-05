import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { IntegrationProvider } from "@/contexts/IntegrationContext";
import { OrdersProvider } from "@/contexts/OrdersContext";
import { InventoryProvider } from "@/contexts/InventoryContext";
import { PlatformDeliveryProvider } from "@/contexts/PlatformDeliveryContext";
import { PaymentMethodsProvider } from "@/contexts/PaymentMethodsContext";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    const seg0 = (segments as string[])[0];
    const inAuth = seg0 === "(auth)";
    const inPharmacy = seg0 === "(pharmacy)";
    const inCustomer = seg0 === "(customer)";
    const inWarehouse = seg0 === "(warehouse)";
    const inAdmin = seg0 === "(admin)";
    const inDelivery = seg0 === "(delivery)";

    if (!user) {
      // Guests are allowed in (auth) and (customer) — browsing without registration
      if (!inAuth && !inCustomer) router.replace("/(auth)/welcome");
    } else if (user.type === "admin") {
      if (!inAdmin) router.replace("/(admin)");
    } else if (user.type === "pharmacy") {
      if (!inPharmacy) router.replace("/(pharmacy)");
    } else if (user.type === "warehouse") {
      if (!inWarehouse) router.replace("/(warehouse)");
    } else if (user.type === "delivery") {
      if (!inDelivery) router.replace("/(delivery)");
    } else {
      if (!inCustomer) router.replace("/(customer)");
    }
  }, [user, isLoading, segments]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(customer)" />
      <Stack.Screen name="(pharmacy)" />
      <Stack.Screen name="(warehouse)" />
      <Stack.Screen name="(admin)" />
      <Stack.Screen name="(delivery)" />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <KeyboardProvider>
              <SettingsProvider>
                <AuthProvider>
                  <IntegrationProvider>
                    <OrdersProvider>
                      <InventoryProvider>
                        <PlatformDeliveryProvider>
                          <PaymentMethodsProvider>
                            <CartProvider>
                              <RootLayoutNav />
                            </CartProvider>
                          </PaymentMethodsProvider>
                        </PlatformDeliveryProvider>
                      </InventoryProvider>
                    </OrdersProvider>
                  </IntegrationProvider>
                </AuthProvider>
              </SettingsProvider>
            </KeyboardProvider>
          </GestureHandlerRootView>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
