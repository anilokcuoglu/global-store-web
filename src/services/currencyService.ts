export interface CurrencyRates {
  USD: number;
  EUR: number;
  TRY: number;
}

export interface CurrencyData {
  rates: CurrencyRates;
  base: string;
  date: string;
}

const CURRENCY_API_URL = "https://api.exchangerate-api.com/v4/latest/USD";

let currencyCache: CurrencyRates | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 60 * 60 * 1000;

export async function getCurrencyRates(): Promise<CurrencyRates> {
  const now = Date.now();

  if (currencyCache && now - cacheTimestamp < CACHE_DURATION) {
    return currencyCache;
  }

  try {
    const response = await fetch(CURRENCY_API_URL);

    if (!response.ok) {
      throw new Error(`Currency API error: ${response.status}`);
    }

    const data: CurrencyData = await response.json();

    const rates: CurrencyRates = {
      USD: 1,
      EUR: data.rates.EUR || 0.85,
      TRY: data.rates.TRY || 30.5,
    };

    currencyCache = rates;
    cacheTimestamp = now;

    return rates;
  } catch (error) {
    console.error("Error fetching currency rates:", error);

    return {
      USD: 1,
      EUR: 0.85,
      TRY: 30.5,
    };
  }
}

export function convertPrice(
  priceUSD: number,
  targetCurrency: keyof CurrencyRates,
  rates: CurrencyRates
): number {
  const rate = rates[targetCurrency];
  return Math.round(priceUSD * rate * 100) / 100;
}

export function formatPrice(
  price: number,
  currency: keyof CurrencyRates
): string {
  const symbols = {
    USD: "$",
    EUR: "€",
    TRY: "₺",
  };

  return `${symbols[currency]}${price.toFixed(2)}`;
}
