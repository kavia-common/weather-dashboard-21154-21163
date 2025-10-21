/**
 * OpenWeather provider helpers.
 * Reads REACT_APP_OPENWEATHER_API_KEY from env (do not hardcode). Ensure you set it in .env.
 * Always call OpenWeather directly (no dev-server proxy) to avoid wrong host issues.
 */
const OW_API_ORIGIN = 'https://api.openweathermap.org';
const ICON_BASE = 'https://openweathermap.org/img/wn';

// Warn once if the key is missing to guide setup (dev console only)
let didWarnMissingKey = false;
function warnIfMissingKeyOnce() {
  const key = process.env.REACT_APP_OPENWEATHER_API_KEY;
  // Ensure we ignore any mistakenly set REACT_APP_REACT_APP_OPENWEATHER_API_KEY
  if (process.env.REACT_APP_REACT_APP_OPENWEATHER_API_KEY) {
    // eslint-disable-next-line no-console
    console.warn(
      '[WeatherDashboard] Detected REACT_APP_REACT_APP_OPENWEATHER_API_KEY in env. This is ignored. Use REACT_APP_OPENWEATHER_API_KEY instead.'
    );
  }
  if (!key && !didWarnMissingKey) {
    didWarnMissingKey = true;
    // eslint-disable-next-line no-console
    console.warn(
      '[WeatherDashboard] REACT_APP_OPENWEATHER_API_KEY is not set. Falling back to keyless providers (Open‑Meteo + Nominatim). ' +
      'To enable OpenWeather features, create .env with REACT_APP_OPENWEATHER_API_KEY=your_key and restart the dev server/rebuild.'
    );
  }
}

/**
 * Helper to parse fetch errors with more details and map common OpenWeather statuses.
 */
async function ensureOk(response, defaultMessage) {
  if (response.ok) return;
  const status = response.status;
  let details = '';
  try {
    const text = await response.text();
    try {
      const j = JSON.parse(text);
      details = j.message ? `: ${j.message}` : text ? `: ${text}` : '';
    } catch {
      details = text ? `: ${text}` : '';
    }
  } catch {
    // ignore parsing errors
  }
  let msg = `${defaultMessage} (HTTP ${status}${details})`;
  if (status === 401 || status === 403) {
    msg = `OpenWeather API key invalid or unauthorized (HTTP ${status}${details})`;
  } else if (status === 429) {
    msg = `Rate limit exceeded (HTTP ${status}${details})`;
  }
  throw new Error(msg);
}

/**
 * Build a full absolute URL to OpenWeather with provided path (starting with /).
 */
function buildOWUrl(pathAndQuery) {
  return `${OW_API_ORIGIN}${pathAndQuery}`;
}

/**
 * Version switcher: Some accounts must use One Call 3.0. Prefer 2.5 but allow opting into 3.0 via env.
 * Set REACT_APP_OPENWEATHER_USE_ONECALL3=true to force v3.0 endpoint.
 */
function getOneCallPath(lat, lon, key) {
  const useV3 = String(process.env.REACT_APP_OPENWEATHER_USE_ONECALL3 || '').toLowerCase() === 'true';
  if (useV3) {
    return `/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,alerts&units=metric&appid=${key}`;
  }
  return `/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,alerts&units=metric&appid=${key}`;
}

// PUBLIC_INTERFACE
export async function owSuggestCities(query, limit = 5) {
  /** Suggest cities using OpenWeather geocoding API. */
  warnIfMissingKeyOnce();
  const key = process.env.REACT_APP_OPENWEATHER_API_KEY;
  if (!key) {
    throw new Error(
      'OpenWeather API key missing. Set REACT_APP_OPENWEATHER_API_KEY in .env to enable OpenWeather.'
    );
  }
  const path = `/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=${limit}&appid=${key}`;
  const url = buildOWUrl(path);
  let r;
  try {
    r = await fetch(url);
  } catch (e) {
    throw new Error('Network error while fetching suggestions');
  }
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
  /**
   * Fetch current + daily forecast using One Call API.
   * Defaults to v2.5; if REACT_APP_OPENWEATHER_USE_ONECALL3=true, uses v3.0.
   */
  warnIfMissingKeyOnce();
  const key = process.env.REACT_APP_OPENWEATHER_API_KEY;
  if (!key) {
    throw new Error(
      'OpenWeather API key missing. Set REACT_APP_OPENWEATHER_API_KEY in .env to enable OpenWeather.'
    );
  }
  const path = getOneCallPath(lat, lon, key);
  const url = buildOWUrl(path);
  let r;
  try {
    r = await fetch(url);
  } catch (e) {
    throw new Error('Network error while fetching weather');
  }
  await ensureOk(r, 'Failed to fetch weather');
  const data = await r.json();
  const current = data.current || {};
  const daily = Array.isArray(data.daily) ? data.daily.slice(0, 7) : [];

  const curWeather = current.weather?.[0] || {};
  return {
    current: {
      temp: typeof current.temp === 'number' ? Math.round(current.temp) : undefined,
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
        min: typeof d.temp?.min === 'number' ? Math.round(d.temp.min) : undefined,
        max: typeof d.temp?.max === 'number' ? Math.round(d.temp.max) : undefined,
        icon: w.icon ? `${ICON_BASE}/${w.icon}@2x.png` : null,
        description: w.description || '',
      };
    }),
  };
}

/**
 * PUBLIC_INTERFACE
 * Quick self-check: performs a sample request with known coordinates to validate connectivity.
 */
export async function owSelfCheck() {
  /** This is a diagnostic helper, not used in UI by default. */
  const key = process.env.REACT_APP_OPENWEATHER_API_KEY;
  if (!key) {
    return { ok: false, reason: 'missing_key' };
  }
  const url = buildOWUrl(getOneCallPath(37.7749, -122.4194, key)); // San Francisco
  try {
    const r = await fetch(url);
    if (!r.ok) {
      return { ok: false, status: r.status };
    }
    return { ok: true };
  } catch {
    return { ok: false, reason: 'network' };
  }
}
