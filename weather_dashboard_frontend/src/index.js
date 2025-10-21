import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

/**
 * Entry point: renders the Weather Dashboard app.
 * Emits warnings in dev console if OpenWeather key is misconfigured or missing.
 * Note: Only REACT_APP_OPENWEATHER_API_KEY is used; a misnamed REACT_APP_REACT_APP_OPENWEATHER_API_KEY will be ignored.
 */
(function warnMissingOpenWeatherKeyOnce() {
  if (process.env.REACT_APP_REACT_APP_OPENWEATHER_API_KEY) {
    // eslint-disable-next-line no-console
    console.warn(
      '[WeatherDashboard] Detected REACT_APP_REACT_APP_OPENWEATHER_API_KEY in env. This is ignored. Use REACT_APP_OPENWEATHER_API_KEY instead.'
    );
  }
  if (!process.env.REACT_APP_OPENWEATHER_API_KEY) {
    // eslint-disable-next-line no-console
    console.warn(
      '[WeatherDashboard] REACT_APP_OPENWEATHER_API_KEY is not set. The app will use the keyless fallback (Open‑Meteo + Nominatim). ' +
      'To enable OpenWeather, add REACT_APP_OPENWEATHER_API_KEY=your_key to .env and restart the dev server/rebuild.'
    );
  }
})();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
