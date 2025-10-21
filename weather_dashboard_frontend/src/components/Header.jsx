import React from 'react';

/**
 * Header with playful brand and Locate Me action.
 */
export default function Header({ onLocate }) {
  return (
    <header className="header container">
      <div className="brand">
        <div className="brand-bubble">☁️</div>
        <div className="brand-title">
          <h1 className="title">Breezy</h1>
          <p className="subtitle">Playful weather at a glance</p>
        </div>
      </div>
      <button className="btn" onClick={onLocate} aria-label="Locate me">
        📍 Locate Me
      </button>
    </header>
  );
}
