/**
 * OpenWeather provider helpers.
 * Reads REACT_APP_OPENWEATHER_API_KEY from env (do not hardcode). Ensure you set it in .env.
 */
const OW_API = 'https://api.openweathermap.org';
const ICON_BASE = 'https://openweathermap.org/img/wn';

/**
 * Helper to parse fetch errors with more details.
 */
async function ensureOk(response, defaultMessage) {
  if (response.ok) return;
  const status = response.status;
  let details = '';
  try {
    const text = await response.text();
    // OpenWeather often returns JSON with "message"
    try {
      const j = JSON.parse(text);
      details = j.message ? `: ${j.message}` : text ? `: ${text}` : '';
    } catch {
      details = text ? `: ${text}` : '';
    }
  } catch {
    // ignore parsing errors
  }
  const msg = `${defaultMessage} (HTTP ${status}${details})`;
  throw new Error(msg);
}

// PUBLIC_INTERFACE
export async function owSuggestCities(query, limit = 5) {
  /** Suggest cities using OpenWeather geocoding API. */
  const key = process.env.REACT_APP_OPENWEATHER_API_KEY;
  if (!key) {
    throw new Error(
      'OpenWeather API key missing. Set REACT_APP_OPENWEATHER_API_KEY in .env to enable OpenWeather.'
    );
  }
  const url = `${OW_API}/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=${limit}&appid=${key}`;
  const r = await fetch(url);
  await ensureOk(r, 'Failed to fetch suggestions');
  const data = await r.json();
  return data.map((d) => ({
    name: d.name,
    country: d.country,
    lat: d.lat,
    lon: d.lon,
  }));
}

// PUBLIC_INTERFACE
export async function owOneCall(lat, lon) {
  /** Fetch current + daily forecast using One Call API v2.5 (widely available) */
  const key = process.env.REACT_APP_OPENWEATHER_API_KEY;
  if (!key) {
    throw new Error(
      'OpenWeather API key missing. Set REACT_APP_OPENWEATHER_API_KEY in .env to enable OpenWeather.'
    );
  }
  const url = `${OW_API}/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,alerts&units=metric&appid=${key}`;
  const r = await fetch(url);
  await ensureOk(r, 'Failed to fetch weather');
  const data = await r.json();
  const current = data.current || {};
  const daily = Array.isArray(data.daily) ? data.daily.slice(0, 7) : [];

  const curWeather = current.weather?.[0] || {};
  return {
    current: {
      temp: Math.round(current.temp),
      description: curWeather.description || '',
      icon: curWeather.icon ? `${ICON_BASE}/${curWeather.icon}@2x.png` : null,
      humidity: current.humidity,
      windSpeed: current.wind_speed,
      windDeg: current.wind_deg,
    },
    daily: daily.map((d) => {
      const w = d.weather?.[0] || {};
      return {
        date: new Date(d.dt * 1000).toISOString(),
        min: Math.round(d.temp?.min),
        max: Math.round(d.temp?.max),
        icon: w.icon ? `${ICON_BASE}/${w.icon}@2x.png` : null,
        description: w.description || '',
      };
    }),
  };
}
