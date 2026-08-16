import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import uuid from "react-native-uuid";
import { useInvoices } from "../context/InvoiceContext";
import { usePremium } from "../context/PremiumContext";
import { computeTotals } from "../utils/invoiceCalculations";
import { formatCurrency, CURRENCIES } from "../utils/currency";
import { getTemplate } from "../templates/templateRegistry";
import { interstitialManager } from "../ads/InterstitialAdManager";
import AdBanner from "../components/AdBanner";
import colors from "../constants/colors";

function Field({ label, value, onChangeText, placeholder, keyboardType, style }) {
  return (
    <View style={[{ marginBottom: 10 }, style]}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.subtext}
        keyboardType={keyboardType}
      />
    </View>
  );
}

export default function InvoiceEditorScreen({ route, navigation }) {
  const { upsertInvoice, deleteInvoice } = useInvoices();
  const { isPremium } = usePremium();
  const [invoice, setInvoice] = useState(route.params.invoice);

  useEffect(() => {
    interstitialManager.load();
  }, []);

  const template = getTemplate(invoice.templateId);
  const totals = computeTotals(invoice);

  const update = useCallback((patch) => setInvoice((prev) => ({ ...prev, ...patch })), []);
  const updateFrom = (patch) => update({ from: { ...invoice.from, ...patch } });
  const updateTo = (patch) => update({ to: { ...invoice.to, ...patch } });

  const updateItem = (id, patch) =>
    update({ items: invoice.items.map((it) => (it.id === id ? { ...it, ...patch } : it)) });

  const addItem = () =>
    update({ items: [...invoice.items, { id: uuid.v4(), description: "", quantity: 1, price: 0 }] });

  const removeItem = (id) => {
    if (invoice.items.length === 1) return;
    update({ items: invoice.items.filter((it) => it.id !== id) });
  };

  const persistAndGo = (screen) => {
    upsertInvoice(invoice);
    interstitialManager.showIfReady({
      isPremium,
      onDone: () => navigation.navigate(screen, { invoiceId: invoice.id }),
    });
  };

  const confirmDelete = () => {
    Alert.alert("Delete invoice?", "This can't be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          deleteInvoice(invoice.id);
          navigation.popToTop();
        },
      },
    ]);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 24 }}>
        <TouchableOpacity
          style={[styles.templateBanner, { borderColor: template.swatch[0] }]}
          onPress={() => navigation.navigate("TemplateSelect", { invoiceId: invoice.id, currentTemplateId: invoice.templateId, onSelect: (id) => update({ templateId: id }) })}
        >
          <View style={[styles.swatchDot, { backgroundColor: template.swatch[0] }]} />
          <Text style={styles.templateBannerText}>Template: {template.name}</Text>
          {template.premium && <Ionicons name="star" size={14} color={colors.gold} style={{ marginLeft: 4 }} />}
          <Ionicons name="chevron-forward" size={18} color={colors.subtext} style={{ marginLeft: "auto" }} />
        </TouchableOpacity>

        <View style={styles.rowFields}>
          <Field label="Invoice #" value={invoice.invoiceNumber} onChangeText={(v) => update({ invoiceNumber: v })} style={{ flex: 1, marginRight: 8 }} />
          <Field label="Currency" value={invoice.currency} onChangeText={(v) => update({ currency: v.toUpperCase().slice(0, 3) })} style={{ width: 90 }} />
        </View>
        <View style={styles.rowFields}>
          <Field label="Date" value={invoice.date} onChangeText={(v) => update({ date: v })} style={{ flex: 1, marginRight: 8 }} placeholder="YYYY-MM-DD" />
          <Field label="Due Date" value={invoice.dueDate} onChangeText={(v) => update({ dueDate: v })} style={{ flex: 1 }} placeholder="YYYY-MM-DD" />
        </View>

        <Text style={styles.sectionTitle}>From</Text>
        <Field label="Your Business Name" value={invoice.from.name} onChangeText={(v) => updateFrom({ name: v })} />
        <View style={styles.rowFields}>
          <Field label="Email" value={invoice.from.email} onChangeText={(v) => updateFrom({ email: v })} style={{ flex: 1, marginRight: 8 }} />
          <Field label="Phone" value={invoice.from.phone} onChangeText={(v) => updateFrom({ phone: v })} style={{ flex: 1 }} />
        </View>
        <Field label="Address" value={invoice.from.address} onChangeText={(v) => updateFrom({ address: v })} />

        <Text style={styles.sectionTitle}>Bill To</Text>
        <Field label="Client Name" value={invoice.to.name} onChangeText={(v) => updateTo({ name: v })} />
        <View style={styles.rowFields}>
          <Field label="Email" value={invoice.to.email} onChangeText={(v) => updateTo({ email: v })} style={{ flex: 1, marginRight: 8 }} />
          <Field label="Phone" value={invoice.to.phone} onChangeText={(v) => updateTo({ phone: v })} style={{ flex: 1 }} />
        </View>
        <Field label="Address" value={invoice.to.address} onChangeText={(v) => updateTo({ address: v })} />

        <Text style={styles.sectionTitle}>Line Items</Text>
        {invoice.items.map((item, idx) => (
          <View key={item.id} style={styles.itemCard}>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={styles.itemIndex}>Item {idx + 1}</Text>
              <TouchableOpacity onPress={() => removeItem(item.id)}>
                <Ionicons name="trash-outline" size={18} color={colors.danger} />
              </TouchableOpacity>
            </View>
            <Field label="Description" value={item.description} onChangeText={(v) => updateItem(item.id, { description: v })} />
            <View style={styles.rowFields}>
              <Field
                label="Qty"
                value={String(item.quantity)}
                onChangeText={(v) => updateItem(item.id, { quantity: v.replace(/[^0-9.]/g, "") })}
                keyboardType="numeric"
                style={{ flex: 1, marginRight: 8 }}
              />
              <Field
                label="Price"
                value={String(item.price)}
                onChangeText={(v) => updateItem(item.id, { price: v.replace(/[^0-9.]/g, "") })}
                keyboardType="numeric"
                style={{ flex: 1 }}
              />
            </View>
          </View>
        ))}
        <TouchableOpacity style={styles.addItemBtn} onPress={addItem}>
          <Ionicons name="add-circle-outline" size={18} color={colors.primary} />
          <Text style={styles.addItemText}>Add line item</Text>
        </TouchableOpacity>

        <View style={styles.rowFields}>
          <Field
            label="Tax %"
            value={String(invoice.taxRate)}
            onChangeText={(v) => update({ taxRate: v.replace(/[^0-9.]/g, "") })}
            keyboardType="numeric"
            style={{ flex: 1, marginRight: 8 }}
          />
          <Field
            label="Discount %"
            value={String(invoice.discount)}
            onChangeText={(v) => update({ discount: v.replace(/[^0-9.]/g, "") })}
            keyboardType="numeric"
            style={{ flex: 1 }}
          />
        </View>
        <Field label="Notes" value={invoice.notes} onChangeText={(v) => update({ notes: v })} />

        <View style={styles.totalsBox}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>{formatCurrency(totals.subtotal, invoice.currency)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Discount</Text>
            <Text style={styles.totalValue}>-{formatCurrency(totals.discountAmount, invoice.currency)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Tax</Text>
            <Text style={styles.totalValue}>{formatCurrency(totals.taxAmount, invoice.currency)}</Text>
          </View>
          <View style={[styles.totalRow, { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 8, marginTop: 4 }]}>
            <Text style={styles.grandLabel}>Total</Text>
            <Text style={styles.grandValue}>{formatCurrency(totals.total, invoice.currency)}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.primaryBtn} onPress={() => persistAndGo("Preview")}>
          <Ionicons name="eye-outline" size={18} color="#fff" />
          <Text style={styles.primaryBtnText}>Preview & Export PDF</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryBtn} onPress={() => upsertInvoice(invoice)}>
          <Text style={styles.secondaryBtnText}>Save Draft</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.deleteBtn} onPress={confirmDelete}>
          <Text style={styles.deleteBtnText}>Delete Invoice</Text>
        </TouchableOpacity>
      </ScrollView>
      <AdBanner />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingHorizontal: 16, paddingTop: 12 },
  templateBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  swatchDot: { width: 14, height: 14, borderRadius: 7, marginRight: 8 },
  templateBannerText: { fontWeight: "600", color: colors.text },
  rowFields: { flexDirection: "row" },
  label: { fontSize: 12, color: colors.subtext, marginBottom: 4, fontWeight: "600" },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.text,
  },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: colors.text, marginTop: 12, marginBottom: 8 },
  itemCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  itemIndex: { fontSize: 12, fontWeight: "700", color: colors.subtext, marginBottom: 4 },
  addItemBtn: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 16 },
  addItemText: { color: colors.primary, fontWeight: "600" },
  totalsBox: { backgroundColor: colors.card, borderRadius: 12, padding: 14, marginVertical: 16, borderWidth: 1, borderColor: colors.border },
  totalRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 3 },
  totalLabel: { color: colors.subtext, fontSize: 13 },
  totalValue: { color: colors.text, fontSize: 13, fontWeight: "600" },
  grandLabel: { color: colors.text, fontSize: 16, fontWeight: "700" },
  grandValue: { color: colors.primary, fontSize: 18, fontWeight: "800" },
  primaryBtn: {
    flexDirection: "row",
    gap: 8,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  primaryBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  secondaryBtn: { borderRadius: 12, paddingVertical: 12, alignItems: "center", borderWidth: 1, borderColor: colors.border, marginBottom: 10 },
  secondaryBtnText: { color: colors.text, fontWeight: "600" },
  deleteBtn: { alignItems: "center", paddingVertical: 10 },
  deleteBtnText: { color: colors.danger, fontWeight: "600", fontSize: 13 },
});
