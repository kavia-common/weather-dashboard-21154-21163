# Weather Dashboard (Login-free)

This app shows current weather and a 7-day forecast with city search and geolocation.

- Uses OpenWeatherMap when `REACT_APP_OPENWEATHER_API_KEY` is set
- Falls back to Open‑Meteo + Nominatim (keyless) if not set
- Mobile-first, playful "Ocean Professional" styling

## Environment (.env)
Create `.env` in the project root (same folder as package.json) to enable OpenWeatherMap:
```
REACT_APP_OPENWEATHER_API_KEY=your_openweather_api_key
```
Note: Never commit real API keys. In absence of the key, the app automatically uses the keyless fallback.
