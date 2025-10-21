import React from 'react';

/** Error banner with optional retry. Shows actionable messages for 401/403/429/network issues from providers and One Call version hints. */
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
