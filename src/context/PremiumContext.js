import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const PREMIUM_KEY = "@ajet_invoice/is_premium";

const PremiumContext = createContext(null);

export function PremiumProvider({ children }) {
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(PREMIUM_KEY);
        setIsPremium(stored === "true");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Call this after a verified purchase / restore completes.
  // Wire it to expo-in-app-purchases or react-native-iap's purchase
  // success callback in a real build. See README for integration notes.
  const unlockPremium = useCallback(async () => {
    await AsyncStorage.setItem(PREMIUM_KEY, "true");
    setIsPremium(true);
  }, []);

  const revokePremium = useCallback(async () => {
    await AsyncStorage.removeItem(PREMIUM_KEY);
    setIsPremium(false);
  }, []);

  return (
    <PremiumContext.Provider value={{ isPremium, loading, unlockPremium, revokePremium }}>
      {children}
    </PremiumContext.Provider>
  );
}

export function usePremium() {
  const ctx = useContext(PremiumContext);
  if (!ctx) throw new Error("usePremium must be used within a PremiumProvider");
  return ctx;
}
