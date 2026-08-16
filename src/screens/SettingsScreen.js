import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { usePremium } from "../context/PremiumContext";
import colors from "../constants/colors";

function Row({ icon, label, value, onPress }) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} disabled={!onPress}>
      <Ionicons name={icon} size={20} color={colors.primary} />
      <Text style={styles.rowLabel}>{label}</Text>
      {value ? <Text style={styles.rowValue}>{value}</Text> : null}
      {onPress && <Ionicons name="chevron-forward" size={18} color={colors.subtext} />}
    </TouchableOpacity>
  );
}

export default function SettingsScreen({ navigation }) {
  const { isPremium } = usePremium();

  return (
    <View style={styles.container}>
      <Row
        icon="star-outline"
        label="Subscription"
        value={isPremium ? "Premium" : "Free"}
        onPress={() => navigation.navigate("Premium")}
      />
      <Row icon="document-text-outline" label="App" value="AjetInvoiceGenerator" />
      <Row icon="information-circle-outline" label="Version" value="1.0.0" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 16 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rowLabel: { flex: 1, fontSize: 14, color: colors.text, fontWeight: "600" },
  rowValue: { fontSize: 13, color: colors.subtext, marginRight: 4 },
});
