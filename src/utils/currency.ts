export function formatMoney(value: number, currency = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,//
    maximumFractionDigits: 0,
  }).format(value);
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