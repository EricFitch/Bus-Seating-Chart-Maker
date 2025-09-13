// Utility functions for Bus Seating Chart Maker

// Clamp a number between min and max
function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

// DOM selectors
function $(sel) { return document.querySelector(sel); }
function $$(sel) { return Array.from(document.querySelectorAll(sel)); }

// Export to global scope for use in app.js
window.clamp = clamp;
window.$ = $;
window.$$ = $$;
