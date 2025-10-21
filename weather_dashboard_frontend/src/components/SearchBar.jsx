import React from 'react';

/**
 * SearchBar input with suggestion dropdown.
 */
export default function SearchBar({ value, onChange, suggestions, onSelect }) {
  return (
    <div className="search-bar">
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search city (e.g., Paris, Tokyo)"
        className="search-input"
        aria-label="Search city"
      />
      {suggestions && suggestions.length > 0 && (
        <div className="suggestions">
          {suggestions.slice(0, 5).map((s, idx) => (
            <div
              key={`${s.name}-${s.lat}-${s.lon}-${idx}`}
              className="suggestion-item"
              onClick={() => onSelect(s)}
              role="button"
              tabIndex={0}
            >
              <span>{s.name}</span>
              <span style={{ color: '#6b7280' }}>{s.country}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
