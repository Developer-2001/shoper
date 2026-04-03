import { NextRequest, NextResponse } from "next/server";
import { Country } from "country-state-city";

export const dynamic = "force-dynamic";

const COUNTRY_HEADER_KEYS = [
  "x-vercel-ip-country",
  "cf-ipcountry",
  "cloudfront-viewer-country",
  "x-country-code",
  "x-appengine-country",
  "fly-client-ip-country",
];

function getCountryCodeFromHeaders(request: NextRequest) {
  for (const key of COUNTRY_HEADER_KEYS) {
    const value = (request.headers.get(key) || "").trim().toUpperCase();
    if (value && Country.getCountryByCode(value)) {
      return value;
    }
  }

  return "";
}

export async function GET(request: NextRequest) {
  const countryCode = getCountryCodeFromHeaders(request);

  return NextResponse.json(
    { countryCode },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    },
  );
}
