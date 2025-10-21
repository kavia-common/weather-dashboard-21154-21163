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
 * Logs an info line with the computed URL (without the API key) to aid diagnostics.
 * Also validates that we are targeting the correct api host, not a preview/dev domain.
 */
function buildOWUrl(pathAndQuery) {
  const url = `${OW_API_ORIGIN}${pathAndQuery}`;
  try {
    const u = new URL(url);
    // eslint-disable-next-line no-console
    console.info('[WeatherDashboard][OpenWeather] Requesting:', `${u.origin}${u.pathname}${u.search.replace(/appid=[^&]*/,'appid=***')}`);
    if (u.origin !== OW_API_ORIGIN) {
      // eslint-disable-next-line no-console
      console.warn('[WeatherDashboard][OpenWeather] Unexpected origin for request! Expected https://api.openweathermap.org but got', u.origin);
    }
  } catch {
    // ignore URL parse issues
  }
  return url;
}

/**
 * Version switcher: Some accounts must use One Call 3.0. Prefer 2.5 but allow opting into 3.0 via env.
 * Set REACT_APP_OPENWEATHER_USE_ONECALL3=true to force v3.0 endpoint.
 */
function getOneCallPath(lat, lon, key, preferV3 = false) {
  const useV3Env = String(process.env.REACT_APP_OPENWEATHER_USE_ONECALL3 || '').toLowerCase() === 'true';
  const useV3 = preferV3 || useV3Env;
  if (useV3) {
    return `/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,alerts&units=metric&appid=${key}`;
  }
  return `/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,alerts&units=metric&appid=${key}`;
}

/**
 * Fallback using current weather and 7-day forecast (v2.5 endpoints) if One Call is unauthorized for an account.
 */
async function owCurrentAndForecast(lat, lon, key) {
  const currentUrl = buildOWUrl(`/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${key}`);
  const forecastUrl = buildOWUrl(`/data/2.5/forecast/daily?lat=${lat}&lon=${lon}&cnt=7&units=metric&appid=${key}`);

  let r1, r2;
  try {
    r1 = await fetch(currentUrl);
  } catch {
    throw new Error('Network error while fetching current weather');
  }
  await ensureOk(r1, 'Failed to fetch current weather');
  const c = await r1.json();

  try {
    r2 = await fetch(forecastUrl);
  } catch {
    throw new Error('Network error while fetching forecast');
  }
  await ensureOk(r2, 'Failed to fetch forecast');
  const f = await r2.json();

  const cw = c.weather?.[0] || {};
  return {
    current: {
      temp: typeof c.main?.temp === 'number' ? Math.round(c.main.temp) : undefined,
      description: cw.description || '',
      icon: cw.icon ? `${ICON_BASE}/${cw.icon}@2x.png` : null,
      humidity: c.main?.humidity,
      windSpeed: c.wind?.speed,
      windDeg: c.wind?.deg,
    },
    daily: Array.isArray(f.list) ? f.list.map((d) => {
      const w = d.weather?.[0] || {};
      return {
        date: new Date(d.dt * 1000).toISOString(),
        min: typeof d.temp?.min === 'number' ? Math.round(d.temp.min) : undefined,
        max: typeof d.temp?.max === 'number' ? Math.round(d.temp.max) : undefined,
        icon: w.icon ? `${ICON_BASE}/${w.icon}@2x.png` : null,
        description: w.description || '',
      };
    }) : [],
  };
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
   * Defaults to v2.5; on 401 tries v3.0; on further 401 falls back to current/forecast split endpoints.
   */
  warnIfMissingKeyOnce();
  const key = process.env.REACT_APP_OPENWEATHER_API_KEY;
  if (!key) {
    throw new Error(
      'OpenWeather API key missing. Set REACT_APP_OPENWEATHER_API_KEY in .env to enable OpenWeather.'
    );
  }

  // attempt One Call (env-selected version)
  let path = getOneCallPath(lat, lon, key);
  let url = buildOWUrl(path);
  let r;
  try {
    r = await fetch(url);
  } catch {
    throw new Error('Network error while fetching weather');
  }

  if (r.status === 401) {
    // eslint-disable-next-line no-console
    console.warn('[WeatherDashboard][OpenWeather] Received 401 for One Call. Retrying with One Call v3.0...');
    // try v3 explicitly
    path = getOneCallPath(lat, lon, key, true);
    url = buildOWUrl(path);
    try {
      r = await fetch(url);
    } catch {
      throw new Error('Network error while fetching weather (v3 retry)');
    }
    if (r.status === 401) {
      // eslint-disable-next-line no-console
      console.warn('[WeatherDashboard][OpenWeather] One Call v3.0 also returned 401. Falling back to current + daily forecast endpoints.');
      // final fallback to separate endpoints (v2.5)
      return await owCurrentAndForecast(lat, lon, key);
    }
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
 * Logs the computed URL (without key).
 */
export async function owSelfCheck() {
  /** This is a diagnostic helper, not used in UI by default. */
  const key = process.env.REACT_APP_OPENWEATHER_API_KEY;
  const misnamedKeyPresent = !!process.env.REACT_APP_REACT_APP_OPENWEATHER_API_KEY;
  const apiKeyPresent = !!key;

  // If key missing, report immediately with env context
  if (!apiKeyPresent) {
    return {
      ok: false,
      reason: 'missing_key',
      apiKeyPresent,
      misnamedKeyPresent,
      origin: OW_API_ORIGIN,
      useOneCall3Env: String(process.env.REACT_APP_OPENWEATHER_USE_ONECALL3 || '').toLowerCase() === 'true',
    };
  }

  const lat = 37.7749;
  const lon = -122.4194;

  // Decide initial version from env
  const preferV3Env = String(process.env.REACT_APP_OPENWEATHER_USE_ONECALL3 || '').toLowerCase() === 'true';

  const attempts = [];

  // Helper to run a single attempt
  const attempt = async (useV3) => {
    const version = useV3 ? '3.0' : '2.5';
    const path = getOneCallPath(lat, lon, key, useV3);
    const url = buildOWUrl(path);
    try {
      const r = await fetch(url);
      if (r.ok) {
        attempts.push({ version, status: r.status, ok: true });
        return { ok: true, version, status: r.status };
      }
      let body = '';
      try {
        const text = await r.text();
        if (text) {
          try {
            const j = JSON.parse(text);
            body = j && j.message ? j.message : text;
          } catch {
            body = text;
          }
        }
      } catch {
        // ignore
      }
      attempts.push({ version, status: r.status, ok: false, body: body || undefined });
      return { ok: false, version, status: r.status, body: body || undefined };
    } catch {
      attempts.push({ version, ok: false, reason: 'network' });
      return { ok: false, version, reason: 'network' };
    }
  };

  // First attempt: env-selected (default 2.5 unless env forces 3.0)
  const first = await attempt(preferV3Env);
  if (first.ok) {
    return {
      ok: true,
      version: first.version,
      status: first.status,
      origin: OW_API_ORIGIN,
      apiKeyPresent,
      misnamedKeyPresent,
      useOneCall3Env: preferV3Env,
      attempts,
    };
  }

  // If unauthorized on first attempt and we didn't already use v3, retry with v3
  if (first.status === 401 && !preferV3Env) {
    const second = await attempt(true);
    if (second.ok) {
      return {
        ok: true,
        version: second.version,
        status: second.status,
        origin: OW_API_ORIGIN,
        apiKeyPresent,
        misnamedKeyPresent,
        useOneCall3Env: preferV3Env,
        attempts,
      };
    }
    // Still failing: return detailed info so UI/logs can surface it
    return {
      ok: false,
      status: second.status || first.status,
      reason: second.reason || 'unauthorized',
      version: '3.0',
      origin: OW_API_ORIGIN,
      apiKeyPresent,
      misnamedKeyPresent,
      useOneCall3Env: preferV3Env,
      body: second.body || first.body,
      attempts,
    };
  }

  // Return the first failure details (non-401 or when env already forced v3)
  return {
    ...first,
    origin: OW_API_ORIGIN,
    apiKeyPresent,
    misnamedKeyPresent,
    useOneCall3Env: preferV3Env,
    attempts,
  };
}
