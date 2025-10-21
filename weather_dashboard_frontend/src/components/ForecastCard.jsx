import React from 'react';
import { formatDateShort } from '../utils/format';

/**
 * PUBLIC_INTERFACE
 * ForecastCard renders a single day's forecast with icon, date, and min/max.
 */
export default function ForecastCard({ day }) {
  if (!day) return null;
  const isEmoji = day.icon && !String(day.icon).startsWith('http');
  return (
    <div className="card day">
      <div className="meta">
        <div style={{ fontSize: 22 }}>
          {day.icon ? (
            isEmoji ? (
              <span role="img" aria-label="icon">{day.icon}</span>
            ) : (
              <img src={day.icon} alt={day.description || 'icon'} width={48} height={48} />
            )
          ) : '⛅'}
        </div>
        <div>
          <div style={{ fontWeight: 700 }}>{formatDateShort(day.date)}</div>
          <div style={{ color: '#6b7280', fontSize: 12 }}>{day.description}</div>
        </div>
      </div>
      <div>
        <span className="hi">{day.max}°</span>
        <span className="lo"> / {day.min}°</span>
      </div>
    </div>
  );
}
