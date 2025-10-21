import React from 'react';
import './App.css';
import './index.css';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import CurrentWeatherCard from './components/CurrentWeatherCard';
import ForecastGrid from './components/ForecastGrid';
import Loader from './components/Loader';
import ErrorBanner from './components/ErrorBanner';
import useWeather from './hooks/useWeather';

/**
 * PUBLIC_INTERFACE
 * App loads the login-free weather dashboard. It relies on useWeather hook which
 * selects OpenWeatherMap if REACT_APP_OPENWEATHER_API_KEY is provided via .env,
 * otherwise falls back to Open‑Meteo + Nominatim (keyless).
 * To configure OpenWeatherMap, set REACT_APP_OPENWEATHER_API_KEY in your environment.
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
        {isLoading && <Loader label="Fetching weather..." />}
        {error && <ErrorBanner message={error} onRetry={retry} />}
        {!isLoading && !error && weather && (
          <>
            <CurrentWeatherCard location={location} current={weather.current} />
            <ForecastGrid daily={weather.daily} />
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
