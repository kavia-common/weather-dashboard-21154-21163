import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Emit a clear warning once if the OpenWeather API key is not configured.
// This does not break the app; it will fall back to the keyless provider.
(function warnMissingOpenWeatherKeyOnce() {
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
