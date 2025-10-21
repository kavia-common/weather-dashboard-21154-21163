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
Create `.env` in the project root (same folder as package.json) to enable OpenWeatherMap:
```
REACT_APP_OPENWEATHER_API_KEY=your_openweather_api_key
# Optional: some accounts must use One Call 3.0
# REACT_APP_OPENWEATHER_USE_ONECALL3=true
```
Important:
- Only use `REACT_APP_OPENWEATHER_API_KEY`. Do NOT use `REACT_APP_REACT_APP_OPENWEATHER_API_KEY`.
- The app calls `https://api.openweathermap.org` directly; no proxying through the dev server domain or preview host.
- If the key is missing or invalid, the UI will show a friendly error and a Retry button.
- Use the in-app "Test OpenWeather" button to validate connectivity with known coordinates; the app logs the computed URL without your key.
Note: Never commit real API keys. In absence of the key, the app automatically uses the keyless fallback.

## Features
- Header with brand and “Locate Me”
- Search bar with suggestions (OpenWeather Geocoding if key is set; Nominatim otherwise)
- Current weather card: city, temperature, description, humidity, wind
- 7-day forecast cards with min/max and icons
- Loading state and clear errors for 401/403/429/network with Retry
- Automatic retry path: on 401 from One Call, app retries with One Call v3.0; if still 401, falls back to separate current/forecast endpoints
- Optional: remembers last selected city using browser memory (can be extended with localStorage)

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
