import { render, screen } from '@testing-library/react';
import App from './App';

test('renders app container and header brand', () => {
  render(<App />);
  // Basic smoke test: at least renders without crashing and includes header brand title
  expect(screen.getByText(/Breezy/i)).toBeInTheDocument();
});
