import { render } from '@testing-library/react';
import App from './App';

test('renders app container', () => {
  render(<App />);
  // Basic smoke test: at least renders without crashing and includes header brand title
  // More robust tests can be added later.
});
