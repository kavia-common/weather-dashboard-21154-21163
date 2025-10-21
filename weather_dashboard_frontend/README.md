# Weather Dashboard (Login-free)

This app shows current weather and a 7-day forecast with city search and geolocation.

- Uses OpenWeatherMap when `REACT_APP_OPENWEATHER_API_KEY` is set
- Falls back to Open‑Meteo + Nominatim (keyless) if not set
- Mobile-first, playful "Ocean Professional" styling

## Environment (.env)
Create `.env` in the project root (same folder as package.json) to enable OpenWeatherMap:
```
REACT_APP_OPENWEATHER_API_KEY=your_openweather_api_key
# Optional: some accounts must use One Call 3.0
# REACT_APP_OPENWEATHER_USE_ONECALL3=true
```
Important:
- Only use `REACT_APP_OPENWEATHER_API_KEY`. Do NOT use `REACT_APP_REACT_APP_OPENWEATHER_API_KEY`.
- The app calls `https://api.openweathermap.org` directly; no proxying through the dev server domain.
- If the key is missing or invalid, the UI will show a friendly error and a Retry button.
Note: Never commit real API keys. In absence of the key, the app automatically uses the keyless fallback.

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
