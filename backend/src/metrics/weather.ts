// Météo réelle via Open-Meteo (API gratuite, sans clé) + géolocalisation par IP.
// Rafraîchie toutes les 15 min, géoloc faite une seule fois.

export interface Weather {
  available: boolean;
  city: string;
  currentC: number;
  minC: number;
  maxC: number;
  code: number; // code météo WMO (https://open-meteo.com/en/docs)
}

let cache: Weather = { available: false, city: '', currentC: 0, minC: 0, maxC: 0, code: 0 };
let lat: number | null = null;
let lon: number | null = null;
let city = '';

async function geolocate(): Promise<void> {
  try {
    const res = await fetch('https://ipapi.co/json/');
    const j = (await res.json()) as { latitude?: number; longitude?: number; city?: string };
    if (typeof j.latitude === 'number' && typeof j.longitude === 'number') {
      lat = j.latitude;
      lon = j.longitude;
      city = j.city || '';
    }
  } catch { /* pas de réseau / géoloc indisponible */ }
}

async function refresh(): Promise<void> {
  if (lat === null || lon === null) await geolocate();
  if (lat === null || lon === null) return;
  try {
    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
      `&current=temperature_2m,weather_code` +
      `&daily=temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=1`;
    const res = await fetch(url);
    const j = (await res.json()) as {
      current?: { temperature_2m?: number; weather_code?: number };
      daily?: { temperature_2m_max?: number[]; temperature_2m_min?: number[] };
    };
    cache = {
      available: true,
      city,
      currentC: Math.round(j.current?.temperature_2m ?? 0),
      minC: Math.round(j.daily?.temperature_2m_min?.[0] ?? 0),
      maxC: Math.round(j.daily?.temperature_2m_max?.[0] ?? 0),
      code: j.current?.weather_code ?? 0,
    };
  } catch { /* API injoignable : on garde le dernier cache */ }
}

export function startWeatherPolling(): void {
  void refresh();
  setInterval(() => void refresh(), 15 * 60 * 1000);
}

export function getWeather(): Weather {
  return cache;
}
