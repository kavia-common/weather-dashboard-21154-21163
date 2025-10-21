import React, { useState } from 'react';
import './App.css';
import './index.css';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import CurrentWeatherCard from './components/CurrentWeatherCard';
import ForecastList from './components/ForecastList';
import Loader from './components/Loader';
import ErrorBanner from './components/ErrorBanner';
import useWeather from './hooks/useWeather';
import { owSelfCheck } from './api/openWeather';

/**
 * PUBLIC_INTERFACE
 * App
 * This is the single-page weather dashboard. It renders:
 * - Header with "Locate Me"
 * - Search bar with suggestions
 * - Current weather card and 7-day forecast
 * Data comes from useWeather(), which selects OpenWeather (if key exists)
 * or falls back to Open‑Meteo.
 */
function App() {
  const {
    location,
    weather,
    isLoading,
    error,
    searchText,
    setSearchText,
    suggestions,
    selectSuggestion,
    locateMe,
    retry,
  } = useWeather();

  const [diag, setDiag] = useState(null);
  const runSelfCheck = async () => {
    const res = await owSelfCheck();
    setDiag(res);
  };

  return (
    <div className="ocean-app">
      <div className="ocean-gradient" />
      <Header onLocate={locateMe} />
      <main className="container">
        <SearchBar
          value={searchText}
          onChange={setSearchText}
          suggestions={suggestions}
          onSelect={selectSuggestion}
        />

        {/* Developer-only diagnostics button (safe to keep visible) */}
        <div style={{ marginBottom: 8 }}>
          <button className="btn" onClick={runSelfCheck} aria-label="Run OpenWeather self-check">
            🔎 Test OpenWeather
          </button>
          {diag && (
            <div style={{ marginTop: 8, fontSize: 13, lineHeight: 1.5 }}>
              <div style={{ color: diag.ok ? '#10B981' : '#EF4444', fontWeight: 600 }}>
                {diag.ok ? 'Self-check OK' : `Self-check failed: ${diag.reason || diag.status || 'error'}`}
              </div>
              <div>Key present: {String(diag.apiKeyPresent ?? true)}</div>
              {typeof diag.misnamedKeyPresent !== 'undefined' && (
                <div>Misnamed var present (REACT_APP_REACT_APP_OPENWEATHER_API_KEY): {String(diag.misnamedKeyPresent)}</div>
              )}
              {typeof diag.useOneCall3Env !== 'undefined' && (
                <div>USE_ONECALL3 (env): {String(diag.useOneCall3Env)}</div>
              )}
              {diag.origin && <div>Origin: {diag.origin}</div>}
              {diag.version && <div>Selected version: {diag.version}</div>}
              {diag.status && <div>Status: {diag.status}</div>}
              {diag.body && <div>Response: {diag.body}</div>}
              {Array.isArray(diag.attempts) && diag.attempts.length > 0 && (
                <div style={{ marginTop: 4 }}>
                  Attempts:
                  <ul style={{ margin: '4px 0 0 16px' }}>
                    {diag.attempts.map((a, i) => (
                      <li key={i}>
                        v{a.version} - {a.ok ? 'ok' : `fail${a.status ? ` (${a.status})` : a.reason ? ` (${a.reason})` : ''}`}
                        {a.body ? ` - ${a.body}` : ''}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {isLoading && <Loader label="Fetching weather..." />}
        {error && <ErrorBanner message={error} onRetry={retry} />}
        {!isLoading && !error && weather && (
          <>
            <CurrentWeatherCard location={location} current={weather.current} />
            <ForecastList daily={weather.daily} />
          </>
        )}
      </main>
      <footer className="app-footer">
        <span>Data via {process.env.REACT_APP_OPENWEATHER_API_KEY ? 'OpenWeatherMap' : 'Open‑Meteo & Nominatim'}</span>
      </footer>
    </div>
  );
}

export default App;
