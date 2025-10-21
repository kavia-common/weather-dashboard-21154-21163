import React from 'react';
import { formatDateShort } from '../utils/format';

/**
 * ForecastGrid renders 7-day forecast with min/max and icons.
 */
export default function ForecastGrid({ daily }) {
  if (!daily || !daily.length) return null;
  return (
    <section className="grid" style={{ marginTop: 12 }}>
      {daily.map((d) => {
        const isEmoji = d.icon && !String(d.icon).startsWith('http');
        return (
          <div className="card day" key={d.date}>
            <div className="meta">
              <div style={{ fontSize: 22 }}>
                {d.icon ? (
                  isEmoji ? <span role="img" aria-label="icon">{d.icon}</span> :
                    <img src={d.icon} alt={d.description || 'icon'} width={48} height={48} />
                ) : '⛅'}
              </div>
              <div>
                <div style={{ fontWeight: 700 }}>{formatDateShort(d.date)}</div>
                <div style={{ color: '#6b7280', fontSize: 12 }}>{d.description}</div>
              </div>
            </div>
            <div>
              <span className="hi">{d.max}°</span>
              <span className="lo"> / {d.min}°</span>
            </div>
          </div>
        );
      })}
    </section>
  );
}
