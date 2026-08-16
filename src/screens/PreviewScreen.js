import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { WebView } from "react-native-webview";
import { Ionicons } from "@expo/vector-icons";
import { useInvoices } from "../context/InvoiceContext";
import { usePremium } from "../context/PremiumContext";
import { renderInvoiceHtml } from "../templates/htmlTemplates";
import { shareInvoicePdf } from "../utils/pdfGenerator";
import { interstitialManager } from "../ads/InterstitialAdManager";
import AdBanner from "../components/AdBanner";
import colors from "../constants/colors";

export default function PreviewScreen({ route }) {
  const { getInvoice, upsertInvoice } = useInvoices();
  const { isPremium } = usePremium();
  const invoice = getInvoice(route.params.invoiceId);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    interstitialManager.load();
  }, []);

  if (!invoice) {
    return (
      <View style={styles.center}>
        <Text>Invoice not found.</Text>
      </View>
    );
  }

  const html = renderInvoiceHtml(invoice);

  const markStatus = (status) => {
    upsertInvoice({ ...invoice, status });
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      await shareInvoicePdf(invoice);
      interstitialManager.showIfReady({ isPremium, onDone: () => {} });
    } catch (e) {
      Alert.alert("Export failed", e.message || "Something went wrong generating the PDF.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <View style={styles.container}>
      <WebView originWhitelist={["*"]} source={{ html }} style={styles.webview} scalesPageToFit />

      <View style={styles.statusRow}>
        {["draft", "sent", "paid"].map((s) => (
          <TouchableOpacity
            key={s}
            style={[styles.statusChip, invoice.status === s && styles.statusChipActive]}
            onPress={() => markStatus(s)}
          >
            <Text style={[styles.statusChipText, invoice.status === s && styles.statusChipTextActive]}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.exportBtn} onPress={handleExport} disabled={exporting}>
        {exporting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Ionicons name="share-outline" size={18} color="#fff" />
            <Text style={styles.exportBtnText}>Export & Share PDF</Text>
          </>
        )}
      </TouchableOpacity>

      <AdBanner />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  webview: { flex: 1, margin: 12, borderRadius: 12, overflow: "hidden" },
  statusRow: { flexDirection: "row", gap: 8, paddingHorizontal: 12, marginBottom: 8 },
  statusChip: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: "center",
  },
  statusChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  statusChipText: { color: colors.text, fontWeight: "600", fontSize: 12 },
  statusChipTextActive: { color: "#fff" },
  exportBtn: {
    flexDirection: "row",
    gap: 8,
    backgroundColor: colors.primary,
    marginHorizontal: 12,
    marginBottom: 10,
    borderRadius: 12,
    paddingVertical: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  exportBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});
