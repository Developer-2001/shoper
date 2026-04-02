export function formatMoney(value: number, currency = "INR") {
  const safeValue = Number.isFinite(value) ? value : 0;
  const hasFraction = Math.abs(safeValue - Math.trunc(safeValue)) > 0.000001;

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    minimumFractionDigits: hasFraction ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(safeValue);
}

export function salePrice(price: number, discountPercentage: number) {
  return Math.max(0, price - (price * discountPercentage) / 100);
}

export const currencyOptions = [
  { value: "CAD", label: "Canada (CAD)" },
  { value: "ERN", label: "Eritrea (ERN)" },
  { value: "EUR", label: "European Union (EUR)" },
  { value: "INR", label: "India (INR)" },
  { value: "USD", label: "United States (USD)" },
];
