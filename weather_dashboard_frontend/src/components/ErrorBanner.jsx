import React from 'react';

/** Error banner with optional retry */
export default function ErrorBanner({ message, onRetry }) {
  if (!message) return null;
  return (
    <div className="error">
      <span>⚠️ {message}</span>
      {onRetry && (
        <button className="btn" onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
}
