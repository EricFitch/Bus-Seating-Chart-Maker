// Utility functions for Bus Seating Chart Maker

// Clamp a number between min and max
function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

// DOM selectors
function $(sel) { return document.querySelector(sel); }
function $$(sel) { return Array.from(document.querySelectorAll(sel)); }

// Normalize grade input for color lookup
function normalizeGrade(grade) {
  if (!grade) return '';
  const g = String(grade).trim().toUpperCase();
  if (g === 'PK' || g === 'PREK' || g === 'PRE-K') return 'PK';
  if (g === 'KG' || g === 'K' || g === 'KINDER' || g === 'KINDERGARTEN') return 'KG';
  if (/^(\d{1,2})$/.test(g)) return g.padStart(2, '0');
  if (/^(\d{1,2})ST$/.test(g)) return g.replace(/ST$/, '').padStart(2, '0');
  if (/^(\d{1,2})ND$/.test(g)) return g.replace(/ND$/, '').padStart(2, '0');
  if (/^(\d{1,2})RD$/.test(g)) return g.replace(/RD$/, '').padStart(2, '0');
  if (/^(\d{1,2})TH$/.test(g)) return g.replace(/TH$/, '').padStart(2, '0');
  if (/^0\d$/.test(g)) return g;
  return g;
}

// Human-readable description for a seatId like "7LA" without exposing A/B/C in the UI
function describeSeatId(seatId) {
  try {
    const match = String(seatId).match(/^(\d+)([LR])([ABC])$/);
    if (!match) return String(seatId);
    const bench = match[1];
    const side = match[2] === 'L' ? 'Left' : 'Right';
    const letter = match[3];
    const part = letter === 'A' ? 'Window Seat' : letter === 'B' ? 'Middle Seat' : 'Aisle Seat';
    return `Bench ${bench} • ${side} ${part}`;
  } catch { return String(seatId); }
}

// Export to global scope for use in app.js
window.clamp = clamp;
window.$ = $;
window.$$ = $$;
window.normalizeGrade = normalizeGrade;
window.describeSeatId = describeSeatId;
