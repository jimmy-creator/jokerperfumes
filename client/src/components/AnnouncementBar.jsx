import { useEffect, useState } from 'react';
import api from '../api/axios';
import { PLACEHOLDER_ANNOUNCEMENTS } from '../utils/placeholders';

// This store saves announcements as plain strings, but the cache key lives on
// `localhost:5173`, an origin shared with the sibling storefronts in this repo
// family — some of which cache `{ text, textAr }` objects under the same key.
// Rendering a stale object straight into JSX throws "Objects are not valid as a
// React child" and blanks the whole page, so coerce every item to a string.
function toText(item) {
  if (typeof item === 'string') return item;
  if (item && typeof item === 'object') {
    const isAr = (document.documentElement.lang || '').toLowerCase().startsWith('ar');
    return (isAr && item.textAr) || item.text || '';
  }
  return '';
}

function normalise(value) {
  return Array.isArray(value) ? value.map(toText).filter(Boolean) : [];
}

export default function AnnouncementBar() {
  const [items, setItems] = useState(() => {
    try {
      return normalise(JSON.parse(localStorage.getItem('cached-announcements')));
    } catch {
      return [];
    }
  });

  useEffect(() => {
    api.get('/settings/announcements')
      .then((res) => {
        const clean = normalise(res.data);
        setItems(clean);
        localStorage.setItem('cached-announcements', JSON.stringify(clean));
      })
      // Unreachable API (backend-less demo) — show placeholder copy rather
      // than an empty strip. Deliberately not cached, so it cannot outlive
      // the outage and mask real announcements later.
      .catch(() => setItems((prev) => (prev.length ? prev : PLACEHOLDER_ANNOUNCEMENTS)));
  }, []);

  if (!items.length) return null;

  // Items joined by a gold diamond, per the design. Rendered twice: a static
  // row on desktop (where the strip fits) and a marquee below `md`, where the
  // same copy would otherwise overflow a phone width.
  const row = items.map((text, i) => (
    <span key={i} className="flex items-center whitespace-nowrap">
      {i > 0 && <span aria-hidden="true" className="px-3 opacity-70">✦</span>}
      <span>{text}</span>
    </span>
  ));

  return (
    <div
      className="overflow-hidden"
      style={{
        backgroundColor: 'var(--bg-dark)',
        borderBottom: '3px solid var(--copper)',
      }}
      role="region"
      aria-label="Announcements"
    >
      <div
        className="mx-auto max-w-[1200px] px-4 font-serif text-xs uppercase tracking-[0.18em]"
        style={{ color: 'var(--gold)' }}
      >
        {/* Desktop: static */}
        <div className="hidden items-center py-2 md:flex">{row}</div>

        {/* Mobile: seamless marquee (track duplicated so -50% loops cleanly) */}
        <div className="flex w-max animate-[marquee_28s_linear_infinite] items-center py-2 md:hidden">
          {row}
          <span aria-hidden="true" className="px-3 opacity-70">✦</span>
          {items.map((text, i) => (
            <span key={`dup-${i}`} className="flex items-center whitespace-nowrap">
              {i > 0 && <span aria-hidden="true" className="px-3 opacity-70">✦</span>}
              <span>{text}</span>
            </span>
          ))}
          <span aria-hidden="true" className="px-3 opacity-70">✦</span>
        </div>
      </div>
    </div>
  );
}
