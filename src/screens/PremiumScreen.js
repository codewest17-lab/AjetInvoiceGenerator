import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { usePremium } from "../context/PremiumContext";
import colors from "../constants/colors";

const BENEFITS = [
  { icon: "color-palette-outline", text: "Unlock Elegant, Bold & Corporate templates" },
  { icon: "close-circle-outline", text: "Remove all banner & interstitial ads" },
  { icon: "infinite-outline", text: "Unlimited saved invoices" },
  { icon: "download-outline", text: "Priority PDF export quality" },
];

const PLANS = [
  { id: "monthly", label: "Monthly", price: "$4.99", sub: "per month" },
  { id: "yearly", label: "Yearly", price: "$29.99", sub: "per year · best value", badge: "SAVE 50%" },
];

export default function PremiumScreen({ navigation }) {
  const { isPremium, unlockPremium, revokePremium } = usePremium();
  const [selectedPlan, setSelectedPlan] = useState("yearly");
  const [purchasing, setPurchasing] = useState(false);

  // -------------------------------------------------------------
  // This is a MOCK purchase flow so the app is runnable immediately.
  // For a real release, replace this with expo-in-app-purchases or
  // react-native-iap:
  //   1. Configure the "monthly"/"yearly" products in App Store
  //      Connect & Google Play Console (matching product IDs).
  //   2. On purchase success callback, call unlockPremium().
  //   3. On app start, call your IAP library's restore/getPurchases
  //      and call unlockPremium() if an active entitlement is found.
  // -------------------------------------------------------------
  const handlePurchase = async () => {
    setPurchasing(true);
    await new Promise((r) => setTimeout(r, 900));
    await unlockPremium();
    setPurchasing(false);
    Alert.alert("Welcome to Premium!", "All templates are unlocked and ads are removed.", [
      { text: "Great!", onPress: () => navigation.goBack() },
    ]);
  };

  if (isPremium) {
    return (
      <View style={styles.container}>
        <View style={styles.activeCard}>
          <Ionicons name="checkmark-circle" size={48} color={colors.success} />
          <Text style={styles.activeTitle}>You're on Premium</Text>
          <Text style={styles.activeSub}>All templates unlocked · Ads removed</Text>
        </View>
        <TouchableOpacity style={styles.linkBtn} onPress={() => revokePremium()}>
          <Text style={styles.linkBtnText}>(Dev only) Reset premium status</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <Ionicons name="star" size={36} color={colors.gold} />
        <Text style={styles.heroTitle}>AjetInvoiceGenerator Premium</Text>
        <Text style={styles.heroSub}>Better templates. No ads. Ever.</Text>
      </View>

      {BENEFITS.map((b) => (
        <View key={b.text} style={styles.benefitRow}>
          <Ionicons name={b.icon} size={20} color={colors.primary} />
          <Text style={styles.benefitText}>{b.text}</Text>
        </View>
      ))}

      <View style={styles.plans}>
        {PLANS.map((p) => (
          <TouchableOpacity
            key={p.id}
            style={[styles.planCard, selectedPlan === p.id && styles.planCardActive]}
            onPress={() => setSelectedPlan(p.id)}
          >
            {p.badge && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{p.badge}</Text>
              </View>
            )}
            <Text style={styles.planLabel}>{p.label}</Text>
            <Text style={styles.planPrice}>{p.price}</Text>
            <Text style={styles.planSub}>{p.sub}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.purchaseBtn} onPress={handlePurchase} disabled={purchasing}>
        {purchasing ? <ActivityIndicator color="#fff" /> : <Text style={styles.purchaseBtnText}>Upgrade Now</Text>}
      </TouchableOpacity>

      <Text style={styles.disclaimer}>
        Cancel anytime. Prices shown are placeholders — connect a real billing SDK before publishing.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 20 },
  hero: { alignItems: "center", marginBottom: 20, gap: 4 },
  heroTitle: { fontSize: 20, fontWeight: "800", color: colors.text, marginTop: 6 },
  heroSub: { fontSize: 13, color: colors.subtext },
  benefitRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 },
  benefitText: { fontSize: 14, color: colors.text, flex: 1 },
  plans: { flexDirection: "row", gap: 12, marginTop: 12, marginBottom: 20 },
  planCard: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    backgroundColor: colors.card,
  },
  planCardActive: { borderColor: colors.primary, backgroundColor: "#EEF3FF" },
  badge: {
    position: "absolute",
    top: -10,
    backgroundColor: colors.gold,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  badgeText: { color: "#fff", fontSize: 9, fontWeight: "800" },
  planLabel: { fontSize: 13, color: colors.subtext, fontWeight: "600" },
  planPrice: { fontSize: 22, fontWeight: "800", color: colors.text, marginTop: 4 },
  planSub: { fontSize: 11, color: colors.subtext, marginTop: 2 },
  purchaseBtn: { backgroundColor: colors.primary, borderRadius: 14, paddingVertical: 15, alignItems: "center" },
  purchaseBtnText: { color: "#fff", fontWeight: "800", fontSize: 16 },
  disclaimer: { fontSize: 11, color: colors.subtext, textAlign: "center", marginTop: 14 },
  activeCard: { alignItems: "center", marginTop: 60, gap: 6 },
  activeTitle: { fontSize: 20, fontWeight: "800", color: colors.text, marginTop: 8 },
  activeSub: { fontSize: 13, color: colors.subtext },
  linkBtn: { alignItems: "center", marginTop: 24 },
  linkBtnText: { color: colors.subtext, fontSize: 12, textDecorationLine: "underline" },
});
