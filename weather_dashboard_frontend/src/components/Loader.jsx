import React from 'react';

/** Simple loader */
export default function Loader({ label = 'Loading...' }) {
  return (
    <div className="loader card" role="status" aria-live="polite">
      <div style={{ fontSize: 24, marginBottom: 8 }}>🔄</div>
      <div>{label}</div>
    </div>
  );
}
