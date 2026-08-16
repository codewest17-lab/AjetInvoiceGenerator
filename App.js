import React, { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import mobileAds from "react-native-google-mobile-ads";

import { PremiumProvider } from "./src/context/PremiumContext";
import { InvoiceProvider } from "./src/context/InvoiceContext";
import AppNavigator from "./src/navigation/AppNavigator";

export default function App() {
  useEffect(() => {
    // Initialize the Google Mobile Ads SDK once at app launch.
    mobileAds()
      .initialize()
      .then((adapterStatuses) => {
        console.log("AdMob initialized:", adapterStatuses);
      });
  }, []);

  return (
    <SafeAreaProvider>
      <PremiumProvider>
        <InvoiceProvider>
          <StatusBar style="dark" />
          <AppNavigator />
        </InvoiceProvider>
      </PremiumProvider>
    </SafeAreaProvider>
  );
}
