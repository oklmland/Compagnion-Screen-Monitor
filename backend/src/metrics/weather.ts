// Météo réelle via Open-Meteo (API gratuite, sans clé) + géolocalisation par IP.
// Plusieurs fournisseurs de géoloc en repli, réessai rapide tant que la météo
// n'est pas dispo, puis rafraîchissement toutes les 15 min.

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

async function tryJson(url: string): Promise<any | null> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// Plusieurs fournisseurs gratuits sans clé, essayés dans l'ordre.
async function geolocate(): Promise<void> {
  const j1 = await tryJson('https://ipapi.co/json/');
  if (j1 && typeof j1.latitude === 'number' && typeof j1.longitude === 'number') {
    lat = j1.latitude; lon = j1.longitude; city = j1.city || ''; return;
  }
  const j2 = await tryJson('https://freeipapi.com/api/json');
  if (j2 && typeof j2.latitude === 'number' && typeof j2.longitude === 'number') {
    lat = j2.latitude; lon = j2.longitude; city = j2.cityName || ''; return;
  }
  const j3 = await tryJson('http://ip-api.com/json/');
  if (j3 && typeof j3.lat === 'number' && typeof j3.lon === 'number') {
    lat = j3.lat; lon = j3.lon; city = j3.city || ''; return;
  }
  console.warn('[weather] géolocalisation IP échouée (3 fournisseurs)');
}

async function refresh(): Promise<void> {
  if (lat === null || lon === null) await geolocate();
  if (lat === null || lon === null) return;
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,weather_code` +
    `&daily=temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=1`;
  const j = await tryJson(url);
  if (!j || !j.current) {
    console.warn('[weather] Open-Meteo injoignable');
    return;
  }
  cache = {
    available: true,
    city,
    currentC: Math.round(j.current.temperature_2m ?? 0),
    minC: Math.round(j.daily?.temperature_2m_min?.[0] ?? 0),
    maxC: Math.round(j.daily?.temperature_2m_max?.[0] ?? 0),
    code: j.current.weather_code ?? 0,
  };
  console.log(`[weather] ${city} ${cache.minC}~${cache.maxC}°C (code ${cache.code})`);
}

export function startWeatherPolling(): void {
  void refresh();
  // Tant que ce n'est pas dispo (réseau pas prêt au boot), on réessaie vite ;
  // une fois OK, on passe au rythme lent de 15 min.
  const fast = setInterval(() => {
    if (cache.available) { clearInterval(fast); return; }
    void refresh();
  }, 60 * 1000);
  setInterval(() => void refresh(), 15 * 60 * 1000);
}

export function getWeather(): Weather {
  return cache;
}
