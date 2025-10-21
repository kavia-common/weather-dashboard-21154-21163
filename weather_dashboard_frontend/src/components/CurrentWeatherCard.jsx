import React from 'react';
import { degToCompass } from '../utils/format';

/**
 * CurrentWeatherCard shows location name and current conditions.
 */
export default function CurrentWeatherCard({ location, current }) {
  if (!location || !current) return null;
  const isEmojiIcon = current.icon && !current.icon.startsWith('http');

  return (
    <section className="card current">
      <div style={{ fontSize: 48 }}>
        {current.icon ? (
          isEmojiIcon ? (
            <span role="img" aria-label="icon">{current.icon}</span>
          ) : (
            <img src={current.icon} alt={current.description || 'weather icon'} width={96} height={96} />
          )
        ) : '⛅'}
      </div>
      <div>
        <h2 style={{ margin: 0 }}>
          {location.name}
          {location.country ? `, ${location.country}` : ''}
        </h2>
        <div className="temp">{current.temp}°</div>
        <div className="desc">{current.description}</div>
        <div className="kv">
          {typeof current.humidity !== 'undefined' && <span>💧 {current.humidity}%</span>}
          {typeof current.windSpeed !== 'undefined' && (
            <span>💨 {Math.round(current.windSpeed)} km/h {degToCompass(current.windDeg)}</span>
          )}
        </div>
      </div>
    </section>
  );
}
