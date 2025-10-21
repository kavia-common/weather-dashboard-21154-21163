# Weather Dashboard (Login-free)

This app shows current weather and a 7-day forecast with city search and geolocation.

- Uses OpenWeatherMap when `REACT_APP_OPENWEATHER_API_KEY` is set
- Falls back to Open‑Meteo + Nominatim (keyless) if not set
- Mobile-first, playful "Ocean Professional" styling

## Quick start
- Install: `npm install`
- Run dev server: `npm start`
- Build: `npm run build`

Open http://localhost:3000. Search a city or click “Locate Me”.

## Environment (.env)
Use the provided `.env.example` as a template:
```
cp .env.example .env
```
Then edit `.env` (same folder as package.json) to enable OpenWeatherMap:
```
REACT_APP_OPENWEATHER_API_KEY=your_openweather_api_key
# Optional: some accounts must use One Call 3.0
# REACT_APP_OPENWEATHER_USE_ONECALL3=true
```

Important:
- Only use `REACT_APP_OPENWEATHER_API_KEY`. Do NOT use `REACT_APP_REACT_APP_OPENWEATHER_API_KEY` (misnamed; ignored by the code).
- The app calls `https://api.openweathermap.org` directly; no proxying through the dev server domain or preview host.
- If the key is missing or invalid, the UI will show a friendly error and a Retry button.
- Use the in-app "Test OpenWeather" button to validate connectivity with known coordinates; the app logs the computed URL without your key.

Notes on rate limits:
- Respect OpenWeather rate limits. If you hit 429, the app surfaces a clear message to retry later.
- If your account requires One Call v3.0, set `REACT_APP_OPENWEATHER_USE_ONECALL3=true` in `.env`. The app will otherwise default to v2.5 but automatically retries v3.0 if it receives a 401.

Never commit real API keys. When the key is absent, the app automatically uses keyless fallback providers.

## Validation
To quickly verify the app wiring and provider mode:
- Use the "🔎 Test OpenWeather" button on the home screen to run a self-check. It shows whether an API key is detected, the selected One Call version, attempts, and sanitized request info.
- Look at the footer label: “Data via OpenWeatherMap” confirms OpenWeather mode is active; “Open‑Meteo & Nominatim” confirms fallback mode.
- With `.env` missing: search, current, and 7‑day forecast should work via Open‑Meteo without errors.
- With a valid `REACT_APP_OPENWEATHER_API_KEY`: searches use OpenWeather Geocoding and weather comes from One Call (v2.5 by default, or v3.0 if forced/required).
- If you see a 401 for One Call, set `REACT_APP_OPENWEATHER_USE_ONECALL3=true` and retry. The app also auto-retries v3.0 on 401 and falls back to split endpoints if still unauthorized.
- Accessibility: tab through inputs and buttons to confirm visible focus outlines are present.

## Error handling summary
The UI shows clear, actionable messages and a Retry button where appropriate:
- 401/403 (unauthorized): “Invalid or unauthorized OpenWeather API key … If your account requires One Call 3.0, set REACT_APP_OPENWEATHER_USE_ONECALL3=true.”
- 429 (rate limit): “Rate limit exceeded. Please wait a moment and try again.”
- Network errors: “Network error. Please check your internet connection and try again.”
- Missing key: “OpenWeather key is not set. Using fallback provider or set REACT_APP_OPENWEATHER_API_KEY and rebuild.”
- One Call flow: on 401, the app retries with v3.0; if still 401, it falls back to separate current/forecast endpoints.

## Debouncing and persistence
- Search suggestions are debounced by ~350 ms to reduce API load.
- The last selected location is persisted in `localStorage` and restored on next visit, when available.

## Troubleshooting
- Invalid Host header when running `npm start` (preview/tunnel):
  - This project adds dev-only settings to allow preview hosts. See “Development server host check” below. This does not affect production builds.
- CORS or network issues:
  - The app makes direct requests to `https://api.openweathermap.org`. Ensure your environment allows outbound HTTPS and that requests are not being redirected through a dev server or preview host.
- One Call v3.0 requirement:
  - Some OpenWeather accounts must use One Call v3.0. Set `REACT_APP_OPENWEATHER_USE_ONECALL3=true` in `.env` and restart `npm start`, or rebuild for production.
- Misnamed env var:
  - If you accidentally set `REACT_APP_REACT_APP_OPENWEATHER_API_KEY`, it is ignored by code. Use `REACT_APP_OPENWEATHER_API_KEY`.

## Features
- Header with brand and “Locate Me”
- Search bar with suggestions (OpenWeather Geocoding if key is set; Nominatim otherwise)
- Current weather card: city, temperature, description, humidity, wind
- 7-day forecast cards with min/max and icons
- Loading state and clear errors for 401/403/429/network with Retry
- Automatic retry path: on 401 from One Call, app retries with One Call v3.0; if still 401, falls back to separate current/forecast endpoints
- Optional: remembers last selected city using browser localStorage

## Styling
Playful Ocean Professional theme with soft gradient background, rounded cards, and animated hovers. See `src/index.css` and `src/App.css`.

## Development server host check (preview environments)

If you see "Invalid Host header" when running `npm start` in a preview/tunneled environment, Create React App's dev server is rejecting the hostname.  
This project includes a dev-only configuration to allow preview hosts:

1) A `.env.development` file at the project root sets:
```
HOST=0.0.0.0
DANGEROUSLY_DISABLE_HOST_CHECK=true
```

This only applies to development and does not affect production builds. It binds the dev server to all interfaces and disables strict host checking, which is necessary in some preview environments.

Security note: Disabling host checks is acceptable only for local/dev preview use. Do not use this in production; the production build (via `npm run build`) is unaffected by these settings.
