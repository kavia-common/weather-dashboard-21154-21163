import { render, screen } from '@testing-library/react';
import App from './App';

test('renders app container and header brand', () => {
  render(<App />);
  // Basic smoke test: at least renders without crashing and includes header brand title
  expect(screen.getByText(/Breezy/i)).toBeInTheDocument();
});

test('shows "Locate Me" button in header', () => {
  render(<App />);
  // Accessible by visible text content
  expect(screen.getByText(/Locate Me/i)).toBeInTheDocument();
  // And by aria-label (button has aria-label="Locate me")
  expect(screen.getByLabelText(/Locate me/i)).toBeInTheDocument();
});

test('footer shows fallback provider when no OpenWeather API key is set', () => {
  // In CRA tests, REACT_APP_* are baked at build time; CI won’t set the key.
  // The App footer renders "Open‑Meteo & Nominatim" when no key is present.
  render(<App />);
  expect(
    screen.getByText(/Data via Open‑Meteo & Nominatim/i)
  ).toBeInTheDocument();
  // Also ensure it does not claim OpenWeather mode on initial render in this env
  expect(screen.queryByText(/Data via OpenWeatherMap/i)).not.toBeInTheDocument();
});
