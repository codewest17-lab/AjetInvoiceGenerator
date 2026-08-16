import AsyncStorage from "@react-native-async-storage/async-storage";

const INVOICES_KEY = "@ajet_invoice/invoices";

export async function loadInvoices() {
  try {
    const raw = await AsyncStorage.getItem(INVOICES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.warn("Failed to load invoices", e);
    return [];
  }
}

export async function saveInvoices(invoices) {
  try {
    await AsyncStorage.setItem(INVOICES_KEY, JSON.stringify(invoices));
  } catch (e) {
    console.warn("Failed to save invoices", e);
  }
}
