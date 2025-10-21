import React from 'react';
import './App.css';
import './index.css';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import CurrentWeatherCard from './components/CurrentWeatherCard';
import ForecastList from './components/ForecastList';
import Loader from './components/Loader';
import ErrorBanner from './components/ErrorBanner';
import useWeather from './hooks/useWeather';

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
