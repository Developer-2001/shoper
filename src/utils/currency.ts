export function formatMoney(value: number, currency = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export function salePrice(price: number, discountPercentage: number) {
  return Math.max(0, price - (price * discountPercentage) / 100);
}
