/** Format helpers */

// PUBLIC_INTERFACE
export function formatDateShort(iso) {
  /** Format ISO string to e.g., Mon 12 */
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' });
}

// PUBLIC_INTERFACE
export function degToCompass(num) {
  /** Convert degrees to compass direction, e.g. 90 -> E */
  if (typeof num !== 'number') return '';
  const val = Math.floor((num / 22.5) + 0.5);
  const arr = ["N","NNE","NE","ENE","E","ESE","SE","SSE",
               "S","SSW","SW","WSW","W","WNW","NW","NNW"];
  return arr[val % 16];
}
