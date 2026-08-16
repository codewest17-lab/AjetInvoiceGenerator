export function computeTotals(invoice) {
  const subtotal = (invoice.items || []).reduce((sum, item) => {
    const qty = Number(item.quantity) || 0;
    const price = Number(item.price) || 0;
    return sum + qty * price;
  }, 0);

  const discountAmount = subtotal * ((Number(invoice.discount) || 0) / 100);
  const taxableAmount = subtotal - discountAmount;
  const taxAmount = taxableAmount * ((Number(invoice.taxRate) || 0) / 100);
  const total = taxableAmount + taxAmount;

  return {
    subtotal,
    discountAmount,
    taxAmount,
    total: Math.max(total, 0),
  };
}
