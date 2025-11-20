// Printing functionality for Bus Seating Chart Maker
// Handles generating and printing name tags, seating charts, and bench icons

// Helper: Open print window
function openPrintWindow(html) {
  const w = window.open('', '_blank');
  if (!w) return;
  w.document.write(html);
  w.document.close();
  w.focus();
  w.print();
}

// --- Name Tags Printing ---

// Print name tags for assigned students
function printTags() {
  const theme = window.THEMES[window.themeSelector.value] || window.THEMES.Default;
  const assignedList = getAssignedStudentsSorted();
  
  // Read print options from checkboxes
  const printOptions = {
    showBenchNumbers: document.getElementById('print-show-bench-numbers')?.checked ?? true,
    showRowNumbers: document.getElementById('print-show-row-numbers')?.checked ?? true,
    showSeatPositions: document.getElementById('print-show-seat-positions')?.checked ?? true,
    showThemeIcons: document.getElementById('print-show-theme-icons')?.checked ?? true
  };
  
  let html = generateTagsHtml(assignedList, theme, printOptions);
  openPrintWindow(html);
}
window.printTags = printTags;

// Helper: Get sorted list of assigned students
function getAssignedStudentsSorted() {
  return Object.keys(window.seatingAssignments)
    .map(uuid => ({ ...window.allStudents[uuid], seatId: window.seatingAssignments[uuid] }))
    .filter(s => s && s.seatId)
    .sort((a, b) => {
      const na = parseInt(a.seatId.match(/\d+/)[0], 10);
      const nb = parseInt(b.seatId.match(/\d+/)[0], 10);
      if (na !== nb) return na - nb;
      return a.seatId.localeCompare(b.seatId);
    });
}

// Helper: Generate HTML for tags
function generateTagsHtml(list, theme, printOptions) {
  let html = `<!doctype html><html><head><meta charset="utf-8"><title>Print Name Tags</title>
    <style>
      @page { margin: 0.5in; }
      body { margin: 0; font-family: system-ui, Segoe UI, Arial, "Segoe UI Emoji", "Noto Color Emoji", "Apple Color Emoji", sans-serif; }
      .print-tags-table { width: 100%; border-collapse: collapse; }
      .print-tags-table tr { page-break-inside: avoid; page-break-after: auto; }
      .print-tags-table td { width: 50%; height: 2in; text-align: center; vertical-align: middle; border: 1px dashed #ccc; padding: 10px; box-sizing: border-box; page-break-inside: avoid; }
      .tag-name { font-size: 24pt; font-weight: bold; word-wrap: break-word; }
      .tag-info { font-size: 14pt; margin-top: 4px; }
      .tag-seat { font-size: 16pt; font-weight: bold; margin-top: 4px; }
      .hidden { display: none; }
    </style>
  </head><body><table class="print-tags-table">`;
  for (let i = 0; i < list.length; i += 2) {
    html += '<tr>';
    const left = list[i];
    html += `<td>${tagHtml(left, theme, printOptions)}</td>`;
    const right = list[i+1];
    html += `<td>${right ? tagHtml(right, theme, printOptions) : ''}</td>`;
    html += '</tr>';
  }
  html += '</table></body></html>';
  return html;
}

function tagHtml(student, theme, printOptions) {
  if (!student) return '';
  const bench = (student.seatId.match(/\d+/) || [''])[0];
  const { icon, name } = window.getThemeItem(theme, bench);
  const letter = student.seatId.slice(-1);
  const desc = letter === 'A' ? 'Window Seat' : letter === 'B' ? 'Middle Seat' : 'Aisle Seat';
  
  let html = `<div class="tag-name">${student.firstName} ${student.lastName}</div>`;
  html += `<div class="tag-info">Grade: ${student.grade}</div>`;
  
  // Show theme icon if enabled
  if (printOptions.showThemeIcons && (icon || name)) {
    const themeText = icon && name ? `${icon} ${name}` : (icon || name);
    html += `<div class="tag-info">Bus Bench: ${themeText}</div>`;
  }
  
  // Build seat info based on options
  let seatInfo = '';
  if (printOptions.showBenchNumbers) {
    seatInfo = `${bench}`;
  }
  if (printOptions.showSeatPositions) {
    seatInfo += (seatInfo ? ' ' : '') + desc;
  }
  
  if (seatInfo) {
    html += `<div class="tag-seat">${seatInfo}</div>`;
  }
  
  return html;
}

// --- Seating Chart Printing (Landscape Split) ---

// Print seating chart in landscape, split into two pages
function printChartLandscapeSplit() {
  const theme = window.THEMES[window.themeSelector.value] || window.THEMES.Default;
  const total = window.rowsCount;
  const firstHalf = Math.ceil(total / 2);
  const ranges = [ [1, firstHalf], [firstHalf + 1, total] ];
  
  // Read print options from checkboxes
  const printOptions = {
    showBenchNumbers: document.getElementById('print-show-bench-numbers')?.checked ?? true,
    showRowNumbers: document.getElementById('print-show-row-numbers')?.checked ?? true,
    showSeatPositions: document.getElementById('print-show-seat-positions')?.checked ?? true,
    showThemeIcons: document.getElementById('print-show-theme-icons')?.checked ?? true
  };
  
  let html = generateChartHtml(ranges, theme, total, printOptions);
  
  openPrintWindow(html);
}
window.printChartLandscapeSplit = printChartLandscapeSplit;

// Helper: Generate chart HTML for print
function generateChartHtml(ranges, theme, total, printOptions) {
  const css = `
    @page { size: letter landscape; margin: 6mm; }
    body { margin: 0; font-family: system-ui, Segoe UI, Arial, "Segoe UI Emoji", "Noto Color Emoji", "Apple Color Emoji", sans-serif; background: white; color: #0f172a; }
    .page { page-break-after: always; height: 100vh; display: flex; flex-direction: column; }
    table { width: 100%; border-collapse: collapse; height: 100%; table-layout: fixed; }
    thead th { position: sticky; top: 0; }
    th, td { border: 1px solid #94a3b8; padding: 8px; font-size: 12pt; text-align: center; vertical-align: middle; }
    th { background: #e2e8f0; }
    tbody { --rows: 1; }
    tbody tr { height: calc( (100vh - 12mm) / var(--rows) ); page-break-inside: avoid; page-break-after: auto; }
    .bench-label { font-weight: 800; background: #f1f5f9; }
    .aisle { background: #e2e8f0; font-weight: 800; white-space: nowrap; }
    .seat-content { font-weight: 700; word-wrap: break-word; }
    .seat-grade { font-style: italic; font-size: 10pt; }
    .seat-id { font-size: 9pt; color: #475569; }
    .hidden { display: none; }
    @media print { .page:last-child { page-break-after: auto; } }
  `;
  let html = `<!doctype html><html><head><meta charset="utf-8"><title>Print Seating Chart</title><style>${css}</style></head><body>`;
  ranges.forEach(([start, end]) => {
    if (start > end || start > total) return;
    html += '<div class="page">';
    html += generateSeatingTableHtml(start, Math.min(end, total), theme, printOptions);
    html += '</div>';
  });
  html += '</body></html>';
  return html;
}

function generateSeatingTableHtml(startRow, endRow, theme, printOptions) {
  // Build column headers based on options
  const cols = [];
  cols.push('Left Side');
  if (printOptions.showSeatPositions) {
    cols.push('Window (L)', 'Middle (L)', 'Aisle (L)');
  } else {
    cols.push('Seat 1', 'Seat 2', 'Seat 3');
  }
  cols.push('AISLE');
  if (printOptions.showSeatPositions) {
    cols.push('Aisle (R)', 'Middle (R)', 'Window (R)');
  } else {
    cols.push('Seat 1', 'Seat 2', 'Seat 3');
  }
  cols.push('Right Side');
  
  const rowsInHalf = (endRow - startRow + 1);
  let out = '<table><thead><tr>' + cols.map(c => `<th>${c}</th>`).join('') + `</tr></thead><tbody style="--rows:${rowsInHalf}">`;
  for (let i = startRow; i <= endRow; i++) {
    const leftBench = (i * 2) - 1;
    const rightBench = i * 2;
    const leftLabel = formatBenchLabel(theme, leftBench, printOptions);
    const rightLabel = formatBenchLabel(theme, rightBench, printOptions);
    out += '<tr>';
    out += `<td class="bench-label">${leftLabel}</td>`;
    out += seatCellHtml(`${leftBench}LA`);
    out += seatCellHtml(`${leftBench}LB`);
    out += seatCellHtml(`${leftBench}LC`);
    out += `<td class="aisle">${printOptions.showRowNumbers ? `Row ${i}` : '&nbsp;'}</td>`;
    out += seatCellHtml(`${rightBench}RC`);
    out += seatCellHtml(`${rightBench}RB`);
    out += seatCellHtml(`${rightBench}RA`);
    out += `<td class="bench-label">${rightLabel}</td>`;
    out += '</tr>';
  }
  out += '</tbody></table>';
  return out;
}

function formatBenchLabel(theme, benchNum, printOptions) {
  const parts = [];
  
  // Add bench number if enabled
  if (printOptions.showBenchNumbers) {
    parts.push(`Bench Seat ${benchNum}`);
  }
  
  // Add theme icon if enabled
  if (printOptions.showThemeIcons) {
    const { icon, name } = window.getThemeItem(theme, benchNum);
    if (icon && name) {
      parts.push(`${icon} ${name}`);
    } else if (icon || name) {
      parts.push(icon || name);
    }
  }
  
  // Return formatted label or just "Bench" if nothing is shown
  return parts.length > 0 ? parts.join('<br>') : 'Bench';
}

function seatCellHtml(seatId) {
  const uuid = Object.keys(window.seatingAssignments).find(u => window.seatingAssignments[u] === seatId);
  if (!uuid) return `<td class="seat empty"><div class="seat-content">(Empty)</div></td>`;
  const s = window.allStudents[uuid];
  const g = typeof window.normalizeGrade === 'function' ? window.normalizeGrade(s.grade) : String(s.grade || '').toUpperCase();
  const bg = (window.GRADE_COLORS && window.GRADE_COLORS[g]) ? window.GRADE_COLORS[g] : (window.GRADE_COLORS?.default || '#FFFFFF');
  // Show both colored badge and cell background
  return `<td class="seat" style="background:${bg} !important"><div class="seat-content">
    <div class="seat-name">${s.firstName} ${s.lastName}</div>
    <div class="seat-grade">Grade: <span style="display:inline-block;width:1em;height:1em;border-radius:50%;background:${bg};border:1px solid #888;vertical-align:middle;margin-right:4px"></span>${s.grade}</div>
  </div></td>`;
}

// --- Bench Icons Printing ---

// Print large bench icons (4 per page)
function printBenchIcons() {
  const theme = window.THEMES[window.themeSelector.value] || window.THEMES.Default;
  const benches = Array.from({ length: window.rowsCount * 2 }, (_, i) => (i + 1));
  const pages = [];
  for (let i = 0; i < benches.length; i += 4) pages.push(benches.slice(i, i + 4));
  
  // Read print options from checkboxes
  const printOptions = {
    showBenchNumbers: document.getElementById('print-show-bench-numbers')?.checked ?? true,
    showRowNumbers: document.getElementById('print-show-row-numbers')?.checked ?? true,
    showSeatPositions: document.getElementById('print-show-seat-positions')?.checked ?? true,
    showThemeIcons: document.getElementById('print-show-theme-icons')?.checked ?? true
  };
  
  let html = generateBenchIconsHtml(pages, theme, printOptions);
  openPrintWindow(html);
}
window.printBenchIcons = printBenchIcons;

// Helper: Generate HTML for bench icons
function generateBenchIconsHtml(pages, theme, printOptions) {
  const css = `
    @page { margin: 12mm; size: letter portrait; }
    body { margin: 0; font-family: system-ui, Segoe UI, Arial, "Segoe UI Emoji", "Noto Color Emoji", "Apple Color Emoji", sans-serif; }
    .page { page-break-after: always; padding: 8mm; box-sizing: border-box; page-break-inside: avoid; }
    .grid-2x2 { display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; gap: 8mm; height: calc(100vh - 16mm); }
    .sector { border: 1px solid #94a3b8; display: flex; align-items: center; justify-content: center; padding: 6mm; box-sizing: border-box; page-break-inside: avoid; }
    .card { border: 1px dashed #cbd5e1; display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; text-align: center; padding: 8mm; }
    .icon { font-size: 120pt; line-height: 1; }
    .bench { margin-top: 6mm; font-size: 72pt; font-weight: 800; }
    .hidden { display: none; }
    .cut-guides { position: fixed; inset: 0; pointer-events: none; }
    .cut-guides::before, .cut-guides::after { content: ""; position: absolute; background: #94a3b8; opacity: 0.5; }
    .cut-guides::before { width: 1px; left: 50%; top: 0; bottom: 0; }
    .cut-guides::after { height: 1px; top: 50%; left: 0; right: 0; }
    @media print { .page:last-child { page-break-after: auto; } }
  `;
  let html = `<!doctype html><html><head><meta charset="utf-8"><title>Print Bench Icons</title><style>${css}</style></head><body>`;
  pages.forEach((pageBenches) => {
    html += '<div class="page">';
    html += '<div class="grid-2x2">';
    for (let s = 0; s < 4; s++) {
      const benchNum = pageBenches[s];
      html += '<div class="sector">';
      if (benchNum) {
        const { icon, name } = window.getThemeItem(theme, benchNum);
        html += '<div class="card">';
        
        // Show icon if enabled
        if (printOptions.showThemeIcons && icon) {
          html += `<div class="icon">${icon}</div>`;
        }
        
        // Show bench number if enabled
        if (printOptions.showBenchNumbers) {
          html += `<div class="bench">${benchNum}</div>`;
        }
        
        html += '</div>';
      }
      html += '</div>';
    }
    html += '</div>';
    html += '<div class="cut-guides"></div>';
    html += '</div>';
  });
  html += '</body></html>';
  return html;
}
