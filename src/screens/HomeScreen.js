import React, { useMemo } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useInvoices, blankInvoice } from "../context/InvoiceContext";
import { usePremium } from "../context/PremiumContext";
import { computeTotals } from "../utils/invoiceCalculations";
import { formatCurrency } from "../utils/currency";
import AdBanner from "../components/AdBanner";
import colors from "../constants/colors";

const STATUS_COLORS = { draft: colors.subtext, sent: colors.primary, paid: colors.success };

export default function HomeScreen({ navigation }) {
  const { invoices } = useInvoices();
  const { isPremium } = usePremium();

  const stats = useMemo(() => {
    const outstanding = invoices
      .filter((i) => i.status !== "paid")
      .reduce((sum, i) => sum + computeTotals(i).total, 0);
    const paid = invoices
      .filter((i) => i.status === "paid")
      .reduce((sum, i) => sum + computeTotals(i).total, 0);
    return { outstanding, paid, count: invoices.length };
  }, [invoices]);

  const createNew = () => {
    const invoice = blankInvoice();
    navigation.navigate("InvoiceEditor", { invoice });
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <View>
          <Text style={styles.hello}>Your Invoices</Text>
          <Text style={styles.sub}>{stats.count} total</Text>
        </View>
        <View style={styles.topBarRight}>
          {!isPremium && (
            <TouchableOpacity style={styles.premiumPill} onPress={() => navigation.navigate("Premium")}>
              <Ionicons name="star" size={14} color="#fff" />
              <Text style={styles.premiumPillText}>Go Premium</Text>
            </TouchableOpacity>
          )}
          <Pressable onPress={() => navigation.navigate("Settings")} style={styles.iconBtn}>
            <Ionicons name="settings-outline" size={22} color={colors.text} />
          </Pressable>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: "#FFF4E5" }]}>
          <Text style={styles.statLabel}>Outstanding</Text>
          <Text style={styles.statValue}>{formatCurrency(stats.outstanding)}</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: "#E9F9F1" }]}>
          <Text style={styles.statLabel}>Paid</Text>
          <Text style={styles.statValue}>{formatCurrency(stats.paid)}</Text>
        </View>
      </View>

      <FlatList
        data={invoices}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 24 }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="document-text-outline" size={48} color={colors.border} />
            <Text style={styles.emptyText}>No invoices yet. Tap + to create your first one.</Text>
          </View>
        }
        renderItem={({ item }) => {
          const { total } = computeTotals(item);
          return (
            <TouchableOpacity
              style={styles.row}
              onPress={() => navigation.navigate("InvoiceEditor", { invoice: item })}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle}>{item.to.name || "Untitled client"}</Text>
                <Text style={styles.rowSub}>#{item.invoiceNumber} · Due {item.dueDate}</Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={styles.rowAmount}>{formatCurrency(total, item.currency)}</Text>
                <Text style={[styles.rowStatus, { color: STATUS_COLORS[item.status] }]}>
                  {item.status.toUpperCase()}
                </Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />

      <AdBanner />

      <TouchableOpacity style={styles.fab} onPress={createNew}>
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingHorizontal: 16, paddingTop: 8 },
  topBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  topBarRight: { flexDirection: "row", alignItems: "center", gap: 10 },
  hello: { fontSize: 22, fontWeight: "700", color: colors.text },
  sub: { fontSize: 13, color: colors.subtext },
  iconBtn: { padding: 6 },
  premiumPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.gold,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  premiumPillText: { color: "#fff", fontWeight: "700", fontSize: 12 },
  statsRow: { flexDirection: "row", gap: 12, marginBottom: 16 },
  statCard: { flex: 1, borderRadius: 12, padding: 14 },
  statLabel: { fontSize: 12, color: colors.subtext, marginBottom: 4 },
  statValue: { fontSize: 18, fontWeight: "700", color: colors.text },
  row: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  rowTitle: { fontSize: 15, fontWeight: "600", color: colors.text },
  rowSub: { fontSize: 12, color: colors.subtext, marginTop: 2 },
  rowAmount: { fontSize: 15, fontWeight: "700", color: colors.text },
  rowStatus: { fontSize: 11, fontWeight: "700", marginTop: 2 },
  empty: { alignItems: "center", marginTop: 80, gap: 12, paddingHorizontal: 40 },
  emptyText: { textAlign: "center", color: colors.subtext, fontSize: 14 },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 84,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
});
