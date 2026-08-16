export const CURRENCIES = ["USD", "EUR", "GBP", "NGN", "INR", "CAD", "AUD", "ZAR"];

export function formatCurrency(amount, currency = "USD") {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
    }).format(amount || 0);
  } catch (e) {
    return `${currency} ${(amount || 0).toFixed(2)}`;
  }
}
