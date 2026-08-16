import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { loadInvoices, saveInvoices } from "../utils/storage";
import uuid from "react-native-uuid";

const InvoiceContext = createContext(null);

export function blankInvoice() {
  const today = new Date();
  const due = new Date();
  due.setDate(due.getDate() + 14);
  return {
    id: uuid.v4(),
    invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
    templateId: "classic",
    date: today.toISOString().slice(0, 10),
    dueDate: due.toISOString().slice(0, 10),
    status: "draft", // draft | sent | paid
    currency: "USD",
    from: { name: "", email: "", address: "", phone: "" },
    to: { name: "", email: "", address: "", phone: "" },
    items: [{ id: uuid.v4(), description: "", quantity: 1, price: 0 }],
    taxRate: 0,
    discount: 0,
    notes: "Thank you for your business.",
  };
}

export function InvoiceProvider({ children }) {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const stored = await loadInvoices();
      setInvoices(stored);
      setLoading(false);
    })();
  }, []);

  const persist = useCallback(async (next) => {
    setInvoices(next);
    await saveInvoices(next);
  }, []);

  const upsertInvoice = useCallback(
    async (invoice) => {
      setInvoices((prev) => {
        const exists = prev.some((i) => i.id === invoice.id);
        const next = exists
          ? prev.map((i) => (i.id === invoice.id ? invoice : i))
          : [invoice, ...prev];
        saveInvoices(next);
        return next;
      });
    },
    []
  );

  const deleteInvoice = useCallback(async (id) => {
    setInvoices((prev) => {
      const next = prev.filter((i) => i.id !== id);
      saveInvoices(next);
      return next;
    });
  }, []);

  const getInvoice = useCallback((id) => invoices.find((i) => i.id === id), [invoices]);

  return (
    <InvoiceContext.Provider
      value={{ invoices, loading, upsertInvoice, deleteInvoice, getInvoice, persist }}
    >
      {children}
    </InvoiceContext.Provider>
  );
}

export function useInvoices() {
  const ctx = useContext(InvoiceContext);
  if (!ctx) throw new Error("useInvoices must be used within an InvoiceProvider");
  return ctx;
}
