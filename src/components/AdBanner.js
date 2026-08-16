import React from "react";
import { View, StyleSheet } from "react-native";
import { BannerAd, BannerAdSize } from "react-native-google-mobile-ads";
import { BANNER_AD_UNIT_ID } from "../constants/adUnitIds";
import { usePremium } from "../context/PremiumContext";

// Drop <AdBanner /> at the bottom of any screen. It renders nothing
// for premium users (ads removed) and nothing while premium status
// is still loading, to avoid a flash of ads for premium users.
export default function AdBanner({ size = BannerAdSize.ANCHORED_ADAPTIVE_BANNER }) {
  const { isPremium, loading } = usePremium();

  if (loading || isPremium) return null;

  return (
    <View style={styles.wrap}>
      <BannerAd
        unitId={BANNER_AD_UNIT_ID}
        size={size}
        requestOptions={{ requestNonPersonalizedAdsOnly: false }}
        onAdFailedToLoad={(err) => console.log("Banner ad failed:", err?.message)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: "100%",
    alignItems: "center",
    backgroundColor: "transparent",
  },
});
