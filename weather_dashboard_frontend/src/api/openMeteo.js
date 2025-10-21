/**
 * Keyless fallback using Open-Meteo for weather and Nominatim for geocoding.
 * Respect rate-limits: add User-Agent on Nominatim requests.
 */
import { codeToIcon } from '../utils/icons.js';

// PUBLIC_INTERFACE
export async function nominatimSuggest(query, limit = 5) {
  /** Suggest city-like places from Nominatim */
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
    query
  )}&addressdetails=1&limit=${limit}&accept-language=en`;
  const r = await fetch(url, {
    headers: { 'User-Agent': 'WeatherDashboard/1.0 (demo)' },
  });
  if (!r.ok) throw new Error('Failed to fetch suggestions');
  const data = await r.json();
  return data.map((d) => ({
    name: d.display_name.split(',')[0],
    country: d.address?.country_code?.toUpperCase() || '',
    lat: parseFloat(d.lat),
    lon: parseFloat(d.lon),
  }));
}

// PUBLIC_INTERFACE
export async function openMeteoDaily(lat, lon) {
  /** Fetch current + daily forecast from Open-Meteo */
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    current_weather: 'true',
    daily: 'weathercode,temperature_2m_max,temperature_2m_min',
    timezone: 'auto',
  });
  const url = `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
  const r = await fetch(url);
  if (!r.ok) throw new Error('Failed to fetch weather');
  const data = await r.json();

  const current = data.current_weather || {};
  const daily = data.daily || {};
  const days = (daily.time || []).slice(0, 7).map((iso, idx) => ({
    date: new Date(iso).toISOString(),
    min: Math.round(daily.temperature_2m_min?.[idx]),
    max: Math.round(daily.temperature_2m_max?.[idx]),
    icon: codeToIcon(daily.weathercode?.[idx]),
    description: codeToText(daily.weathercode?.[idx]),
  }));

  return {
    current: {
      temp: Math.round(current.temperature),
      description: codeToText(current.weathercode),
      icon: codeToIcon(current.weathercode),
      humidity: undefined, // Open-Meteo basic endpoint does not include humidity here
      windSpeed: current.windspeed,
      windDeg: current.winddirection,
    },
    daily: days,
  };
}

function codeToText(code) {
  const map = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Fog',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    56: 'Freezing drizzle',
    57: 'Dense freezing drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    66: 'Freezing rain',
    67: 'Heavy freezing rain',
    71: 'Slight snow',
    73: 'Moderate snow',
    75: 'Heavy snow',
    77: 'Snow grains',
    80: 'Rain showers',
    81: 'Rain showers',
    82: 'Violent rain showers',
    85: 'Snow showers',
    86: 'Snow showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with hail',
    99: 'Thunderstorm with heavy hail',
  };
  return map[code] || 'Weather';
}
