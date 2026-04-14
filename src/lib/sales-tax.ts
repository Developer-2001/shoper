import { Country, State } from "country-state-city";
import SalesTax from "sales-tax";

export type TaxEstimateInput = {
  country?: string;
  countryCode?: string;
  state?: string;
  stateCode?: string;
};

export type TaxEstimateResult = {
  countryCode: string;
  stateCode: string;
  rate: number;
  ratePercent: number;
  label: string;
};

function roundToTwo(value: number) {
  return Math.round(value * 100) / 100;
}

function normalizeCode(value?: string) {
  return (value || "").trim().toUpperCase();
}

function getTaxOriginCountryCode() {
  const configuredCode = normalizeCode(process.env.TAX_ORIGIN_COUNTRY_CODE);
  if (configuredCode && Country.getCountryByCode(configuredCode)) {
    return configuredCode;
  }

  return "";
}

export function resolveCountryCode(country?: string, countryCode?: string) {
  const directCode = normalizeCode(countryCode);
  if (directCode && Country.getCountryByCode(directCode)) {
    return directCode;
  }

  const countryName = (country || "").trim().toLowerCase();
  if (!countryName) return "";

  const match = Country.getAllCountries().find(
    (entry) => entry.name.trim().toLowerCase() === countryName
  );
  return match?.isoCode || "";
}

function resolveStateCode(countryCode: string, state?: string, stateCode?: string) {
  if (!countryCode) return "";

  const directCode = normalizeCode(stateCode);
  if (directCode && State.getStateByCodeAndCountry(directCode, countryCode)) {
    return directCode;
  }

  const stateName = (state || "").trim().toLowerCase();
  if (!stateName) return "";

  const match = State.getStatesOfCountry(countryCode).find(
    (entry) => entry.name.trim().toLowerCase() === stateName
  );
  return match?.isoCode || "";
}

export async function getEstimatedSalesTaxRate(
  input: TaxEstimateInput
): Promise<TaxEstimateResult> {
  const countryCode = resolveCountryCode(input.country, input.countryCode);
  const stateCode = resolveStateCode(countryCode, input.state, input.stateCode);
  const originCountryCode = getTaxOriginCountryCode();

  if (!countryCode) {
    return {
      countryCode: "",
      stateCode: "",
      rate: 0,
      ratePercent: 0,
      label: "No sales tax",
    };
  }

  try {
    if (originCountryCode) {
      SalesTax.setTaxOriginCountry(originCountryCode);
    }

    const tax = await SalesTax.getSalesTax(countryCode, stateCode || undefined);
    const rate = Number(tax?.rate || 0);
    const ratePercent = roundToTwo(rate * 100);

    const detailLabels = Array.isArray(tax?.details)
      ? tax.details
          .map((detail: { type?: string; rate?: number }) => {
            const partRate = roundToTwo(Number(detail?.rate || 0) * 100);
            return `${String(detail?.type || "tax").toUpperCase()} ${partRate}%`;
          })
          .filter(Boolean)
      : [];

    const label =
      detailLabels.length > 0
        ? detailLabels.join(" + ")
        : ratePercent > 0
          ? `${String(tax?.type || "tax").toUpperCase()} ${ratePercent}%`
          : "No sales tax";

    return {
      countryCode,
      stateCode,
      rate,
      ratePercent,
      label,
    };
  } catch (error) {
    console.error("Sales tax lookup failed:", error);
    return {
      countryCode,
      stateCode,
      rate: 0,
      ratePercent: 0,
      label: "Tax estimate unavailable",
    };
  }
}
