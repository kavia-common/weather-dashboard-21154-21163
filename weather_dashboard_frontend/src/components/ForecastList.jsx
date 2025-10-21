import React from 'react';
import ForecastCard from './ForecastCard';

/**
 * PUBLIC_INTERFACE
 * ForecastList shows a list of 7-day forecast cards.
 */
export default function ForecastList({ daily }) {
  if (!daily || !daily.length) return null;
  return (
    <section className="grid" style={{ marginTop: 12 }}>
      {daily.map((d) => (
        <ForecastCard key={d.date} day={d} />
      ))}
    </section>
  );
}
