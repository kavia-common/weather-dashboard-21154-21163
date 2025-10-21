/**
 * useWeather manages:
 * - Provider selection based on REACT_APP_OPENWEATHER_API_KEY
 * - Initial geolocation (or default city)
 * - City suggestions with debounce (300-400ms)
 * - Fetch current + 7-day forecast, normalized to:
 *   { location:{name,country,lat,lon}, current:{temp,description,icon,humidity,windSpeed,windDeg}, daily:[{date,min,max,icon,description}] }
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { owSuggestCities, owOneCall } from '../api/openWeather';
import { nominatimSuggest, openMeteoDaily } from '../api/openMeteo';

const hasOWKey = !!process.env.REACT_APP_OPENWEATHER_API_KEY;

const DEFAULT_CITY = { name: 'San Francisco', country: 'US', lat: 37.7749, lon: -122.4194 };

// PUBLIC_INTERFACE
export default function useWeather() {
  const [location, setLocation] = useState(null);
  const [weather, setWeather] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchText, setSearchText] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  const debounceRef = useRef(null);
  const provider = useMemo(() => (hasOWKey ? 'openweather' : 'openmeteo'), []);

  // First load: try geolocation; fallback to default city.
  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        setError('');
        const geo = await getBrowserGeolocation(5000);
        const loc = {
          name: 'Your location',
          country: '',
          lat: geo.coords.latitude,
          lon: geo.coords.longitude,
        };
        setLocation(loc);
        const w = await fetchWeatherFor(loc);
        setWeather(w);
      } catch {
        // geolocation denied or failed: use default
        const loc = DEFAULT_CITY;
        setLocation(loc);
        try {
          const w = await fetchWeatherFor(loc);
          setWeather(w);
        } catch (e2) {
          setError(humanizeError(e2));
        }
      } finally {
        setIsLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Search suggestions with debounce
  useEffect(() => {
    if (!searchText) {
      setSuggestions([]);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const list = provider === 'openweather'
          ? await owSuggestCities(searchText, 5)
          : await nominatimSuggest(searchText, 5);
        setSuggestions(list.slice(0, 5));
      } catch (e) {
        // do not show banner on suggest errors; keep silent but log
        // console.warn(e);
      }
    }, 350);
    return () => debounceRef.current && clearTimeout(debounceRef.current);
  }, [searchText, provider]);

  const fetchWeatherFor = useCallback(async (loc) => {
    if (provider === 'openweather') {
      const w = await owOneCall(loc.lat, loc.lon);
      return {
        location: loc,
        current: w.current,
        daily: w.daily,
      };
    }
    const w = await openMeteoDaily(loc.lat, loc.lon);
    return {
      location: loc,
      current: w.current,
      daily: w.daily,
    };
  }, [provider]);

  // PUBLIC_INTERFACE
  const selectSuggestion = useCallback(async (item) => {
    setSearchText(`${item.name}, ${item.country}`);
    setSuggestions([]);
    setIsLoading(true);
    setError('');
    try {
      setLocation(item);
      const w = await fetchWeatherFor(item);
      setWeather(w);
    } catch (e) {
      setError(humanizeError(e, 'Failed to load weather for city'));
    } finally {
      setIsLoading(false);
    }
  }, [fetchWeatherFor]);

  // PUBLIC_INTERFACE
  const locateMe = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const geo = await getBrowserGeolocation(7000);
      const loc = {
        name: 'Your location',
        country: '',
        lat: geo.coords.latitude,
        lon: geo.coords.longitude,
      };
      setLocation(loc);
      const w = await fetchWeatherFor(loc);
      setWeather(w);
    } catch (e) {
      setError('Unable to get your location. Please allow location access or search a city.');
    } finally {
      setIsLoading(false);
    }
  }, [fetchWeatherFor]);

  // PUBLIC_INTERFACE
  const retry = useCallback(async () => {
    if (!location) return;
    setIsLoading(true);
    setError('');
    try {
      const w = await fetchWeatherFor(location);
      setWeather(w);
    } catch (e) {
      setError(humanizeError(e, 'Retry failed'));
    } finally {
      setIsLoading(false);
    }
  }, [location, fetchWeatherFor]);

  return {
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
    provider,
  };
}

function getBrowserGeolocation(timeout = 5000) {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error('Geolocation not supported'));
    const opts = { enableHighAccuracy: false, timeout, maximumAge: 60000 };
    navigator.geolocation.getCurrentPosition(resolve, reject, opts);
  });
}

/**
 * Convert raw errors to more actionable UI messages.
 */
function humanizeError(err, fallback = 'Failed to load weather') {
  const msg = (err && err.message) ? String(err.message) : '';
  if (/network/i.test(msg) || /Failed to fetch/i.test(msg) || /Network error/i.test(msg)) {
    return 'Network error. Please check your internet connection and try again.';
  }
  if (/401/.test(msg) || /403/.test(msg) || /invalid api key/i.test(msg) || /unauthorized/i.test(msg)) {
    return 'Invalid or unauthorized OpenWeather API key. Set REACT_APP_OPENWEATHER_API_KEY in .env and restart the dev server/rebuild. If your account requires One Call 3.0, set REACT_APP_OPENWEATHER_USE_ONECALL3=true.';
  }
  if (/429/.test(msg) || /rate limit/i.test(msg)) {
    return 'Rate limit exceeded. Please wait a moment and try again.';
  }
  if (/OpenWeather API key missing/i.test(msg) || /not set/i.test(msg)) {
    return 'OpenWeather key is not set. Using fallback provider or set REACT_APP_OPENWEATHER_API_KEY and rebuild.';
  }
  // Provide hint if One Call fails but we might still have fallback data paths
  if (/Failed to fetch weather/.test(msg)) {
    return 'Unable to fetch weather from One Call. Ensure API key permissions; the app may retry with One Call 3.0 or fallback to separate endpoints.';
  }
  return msg || fallback;
}
