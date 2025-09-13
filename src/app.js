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
    window.normalizeGrade = normalizeGrade;
// Bus Seating Chart Maker - Bench Layout with Themes and Printing
// Vanilla JS, no build tools.

(function () {

  // Utility functions are now loaded from src/utils.js

  // State

  // Attach shared state to window for all modules
  window.allStudents = window.allStudents || {}; // uuid -> { id, firstName, lastName, grade }
  window.seatingAssignments = window.seatingAssignments || {};
  window.selectedStudentUuid = window.selectedStudentUuid || null;
  window.rowsCount = window.rowsCount || 13;
  window.GRADE_COLORS = window.GRADE_COLORS || {
    PK: '#FFD966', KG: '#C9DAF8', '01': '#D9EAD3', '02': '#F4CCCC', '03': '#EAD1DC',
    '04': '#FFF2CC', '05': '#D0E0E3', '06': '#FDE68A', '07': '#A7F3D0', '08': '#FCA5A5',
    '09': '#C4B5FD', '10': '#FBCFE8', '11': '#F9A8D4', '12': '#A3E635', default: '#FFFFFF'
  };


  // THEMES is now loaded from src/themes.js and available as window.THEMES

  // Elements

  // Expose key elements and state to window for modules
  window.rowsInput = $('#rows');
  window.themeSelector = $('#theme-selector');
  window.unassignedList = $('#unassignedList');
  window.lastSavedEl = $('#lastSaved');
  window.metaEl = $('#meta');
  window.rowsCount = rowsCount;
  window.GRADE_COLORS = GRADE_COLORS;

  // Wire buttons
  $('#applyLayout').addEventListener('click', () => {
  rowsCount = window.clamp(parseInt(rowsInput.value || '13', 10), 1, 30);
    renderSeatingChart();
    saveState();
  });

  // Wire up grade color legend pickers
  const legendForm = document.getElementById('grade-color-legend');
  if (legendForm) {
    legendForm.addEventListener('input', (e) => {
      const tgt = e.target;
      if (tgt && tgt.name && tgt.value) {
        GRADE_COLORS[tgt.name] = tgt.value;
        renderSeatingChart();
      }
    });
  }
  // Optional controls removed from UI; guard event wiring
  const saveBtn = document.getElementById('save');
  const loadBtn = document.getElementById('load');
  const exportBtn = document.getElementById('export');
  const importInput = document.getElementById('importFile');
  if (saveBtn) saveBtn.addEventListener('click', () => { saveState(); touchSaved(); });
  if (loadBtn) loadBtn.addEventListener('click', () => { loadState(); redrawAll(); });
  if (exportBtn) exportBtn.addEventListener('click', exportJSON);
  if (importInput) importInput.addEventListener('change', importJSON);

  // Tabs: roster input
  $$('.tab-button').forEach(btn => {
    btn.addEventListener('click', () => showTab(btn.dataset.tab));
  });

  // Roster inputs
  $('#csv-file').addEventListener('change', handleCsvUpload);
  $('#add-student-form').addEventListener('submit', handleManualAdd);

  // Print buttons
  $('#print-chart-btn').addEventListener('click', printChartLandscapeSplit);
  $('#print-tags-btn').addEventListener('click', printTags);
  $('#print-icons-btn').addEventListener('click', printBenchIcons);

  // Theme change
  themeSelector.addEventListener('change', () => {
    renderSeatingChart();
    saveState();
  });

  // Helpers

  function populateThemeSelector() {
    themeSelector.innerHTML = '';
    Object.keys(THEMES).forEach(name => {
      const opt = document.createElement('option');
      opt.value = name; opt.textContent = name;
      themeSelector.appendChild(opt);
    });
    const saved = localStorage.getItem('busSeaterTheme') || 'Animals';
    themeSelector.value = saved;
  }


  // Seating chart rendering functions are now loaded from src/seatingChart.js

  function renderUnassignedList() {
    unassignedList.innerHTML = '';
    const assigned = new Set(Object.keys(seatingAssignments));
    // Make the unassigned list a drop target to unassign a student by dragging from a seat
    unassignedList.addEventListener('dragover', (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; });
    unassignedList.addEventListener('dragenter', (e) => { e.preventDefault(); unassignedList.classList.add('drag-over'); });
    unassignedList.addEventListener('dragleave', () => { unassignedList.classList.remove('drag-over'); });
    unassignedList.addEventListener('drop', (e) => {
      e.preventDefault();
      unassignedList.classList.remove('drag-over');
      const draggedUuid = e.dataTransfer.getData('text/plain');
      const sourceSeat = e.dataTransfer.getData('text/bus-seat-source');
      if (draggedUuid && sourceSeat && allStudents[draggedUuid]) {
        // Unassign from seat back to roster
        delete seatingAssignments[draggedUuid];
        selectedStudentUuid = null;
        redrawAll();
      }
    });
    Object.keys(allStudents).forEach(uuid => {
      if (!assigned.has(uuid)) {
        const s = allStudents[uuid];
        const li = document.createElement('li');
        li.textContent = `${s.firstName} ${s.lastName} (Grade: ${s.grade})`;
        li.dataset.uuid = uuid;
        if (uuid === selectedStudentUuid) li.classList.add('selected');
        li.addEventListener('click', () => selectStudent(uuid));
        // Make draggable for drag-and-drop assignment
        li.draggable = true;
        li.addEventListener('dragstart', (e) => {
          e.dataTransfer.setData('text/plain', uuid);
          e.dataTransfer.setData('text/bus-origin', 'roster');
          e.dataTransfer.effectAllowed = 'move';
        });
        unassignedList.appendChild(li);
      }
    });
    updatePrintButtons();
  }
  window.renderUnassignedList = renderUnassignedList;

  function updatePrintButtons() {
    const has = Object.keys(seatingAssignments).length > 0;
    $('#print-chart-btn').disabled = !has;
    $('#print-tags-btn').disabled = !has;
    // Bench icons depend only on layout/theme, not assignments
    $('#print-icons-btn').disabled = false;
  }
  window.updatePrintButtons = updatePrintButtons;

  function showTab(name) {
    $$('.tab-content').forEach(el => el.classList.add('hidden'));
    $$('.tab-button').forEach(el => el.classList.remove('active'));
    $(`#${name}`).classList.remove('hidden');
    $(`.tab-button[data-tab="${name}"]`).classList.add('active');
  }
  window.showTab = showTab;

  // CSV & Manual add
  function handleCsvUpload(ev) {
    const file = ev.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = String(e.target.result || '');
      const lines = text.split(/\r?\n/).filter(Boolean);
      // Skip header if present
      const rows = lines.slice(1);
      rows.forEach(line => {
        const cols = line.split(',').map(s => s.trim());
        if (cols.length >= 4) {
          addStudent({ id: cols[0], lastName: cols[1], firstName: cols[2], grade: cols[3] });
        }
      });
      redrawAll();
      ev.target.value = '';
    };
    reader.readAsText(file);
  }
  window.handleCsvUpload = handleCsvUpload;

  function handleManualAdd(e) {
    e.preventDefault();
    const form = e.target;
    addStudent({
      id: form.querySelector('#student-id').value,
      firstName: form.querySelector('#first-name').value,
      lastName: form.querySelector('#last-name').value,
      grade: form.querySelector('#grade').value
    });
    form.reset();
    redrawAll();
  }
  window.handleManualAdd = handleManualAdd;

  function addStudent(student) {
    const uuid = 'student-' + Date.now() + '-' + Math.random().toString(36).slice(2, 9);
    allStudents[uuid] = student;
  }
  window.addStudent = addStudent;

  function selectStudent(uuid) {
    selectedStudentUuid = (selectedStudentUuid === uuid) ? null : uuid;
    renderUnassignedList();
  }
  window.selectStudent = selectStudent;

  function assignSeat(seatId) {
    if (!selectedStudentUuid) { alert('Select a student from the list first.'); return; }
    seatingAssignments[selectedStudentUuid] = seatId;
    selectedStudentUuid = null;
    redrawAll();
  }
  window.assignSeat = assignSeat;

  function unassignSeat(uuid) {
    delete seatingAssignments[uuid];
    redrawAll();
  }
  window.unassignSeat = unassignSeat;


  // Redraw all main UI components
  function redrawAll() {
    renderSeatingChart();
    renderUnassignedList();
    // Removed saveState for privacy: no persistent data
  }
  window.redrawAll = redrawAll;


  // Persistence removed for privacy: no localStorage, no export/import

  // Printing - Tags

  // Print name tags for assigned students
  function printTags() {
    const theme = THEMES[themeSelector.value] || THEMES.Default;
    const assignedList = getAssignedStudentsSorted();
    let html = generateTagsHtml(assignedList, theme);
    openPrintWindow(html);
  }
  window.printTags = printTags;

  // Helper: Get sorted list of assigned students
  function getAssignedStudentsSorted() {
    return Object.keys(seatingAssignments)
      .map(uuid => ({ ...allStudents[uuid], seatId: seatingAssignments[uuid] }))
      .filter(s => s && s.seatId)
      .sort((a, b) => {
        const na = parseInt(a.seatId.match(/\d+/)[0], 10);
        const nb = parseInt(b.seatId.match(/\d+/)[0], 10);
        if (na !== nb) return na - nb;
        return a.seatId.localeCompare(b.seatId);
      });
  }

  // Helper: Generate HTML for tags
  function generateTagsHtml(list, theme) {
    let html = `<!doctype html><html><head><meta charset="utf-8"><title>Print Name Tags</title>
      <style>
        body { margin: 0.5in; font-family: system-ui, Segoe UI, Arial, "Segoe UI Emoji", "Noto Color Emoji", "Apple Color Emoji", sans-serif; }
        .print-tags-table { width: 100%; border-collapse: collapse; }
        .print-tags-table td { width: 50%; height: 2in; text-align: center; vertical-align: middle; border: 1px dashed #ccc; padding: 10px; box-sizing: border-box; }
        .tag-name { font-size: 24pt; font-weight: bold; }
        .tag-info { font-size: 14pt; }
        .tag-seat { font-size: 16pt; font-weight: bold; }
      </style>
    </head><body><table class="print-tags-table">`;
    for (let i = 0; i < list.length; i += 2) {
      html += '<tr>';
      const left = list[i];
      html += `<td>${tagHtml(left, theme)}</td>`;
      const right = list[i+1];
      html += `<td>${right ? tagHtml(right, theme) : ''}</td>`;
      html += '</tr>';
    }
    html += '</table></body></html>';
    return html;
  }

  // Helper: Open print window
  function openPrintWindow(html) {
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(html);
    w.document.close();
    w.focus();
    w.print();
  }

  function tagHtml(student, theme) {
    if (!student) return '';
    const bench = (student.seatId.match(/\d+/) || [''])[0];
    const icon = theme[bench] || '';
    const letter = student.seatId.slice(-1);
    const desc = letter === 'A' ? 'Window Seat' : letter === 'B' ? 'Middle Seat' : 'Aisle Seat';
    return `<div class="tag-name">${student.firstName} ${student.lastName}</div>
            <div class="tag-info">Grade: ${student.grade}</div>
            <div class="tag-info">Bus Bench: ${icon}</div>
            <div class="tag-seat">${bench} ${desc}</div>`;
  }

  // Human-readable description for a seatId like "7LA" without exposing A/B/C in the UI

  // Expose describeSeatId globally for modules
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
  window.describeSeatId = describeSeatId;

  // Printing - Seating Chart (landscape, split into two pages by halves)

  // Print seating chart in landscape, split into two pages
  function printChartLandscapeSplit() {
    const theme = THEMES[themeSelector.value] || THEMES.Default;
    const total = rowsCount;
    const firstHalf = Math.ceil(total / 2);
    const ranges = [ [1, firstHalf], [firstHalf + 1, total] ];
    let html = generateChartHtml(ranges, theme, total);
    openPrintWindow(html);
  }
  window.printChartLandscapeSplit = printChartLandscapeSplit;

  // Helper: Generate chart HTML for print
  function generateChartHtml(ranges, theme, total) {
    const css = `
      @page { size: letter landscape; margin: 6mm; }
      body { margin: 0; font-family: system-ui, Segoe UI, Arial, "Segoe UI Emoji", "Noto Color Emoji", "Apple Color Emoji", sans-serif; background: white; color: #0f172a; }
      .page { page-break-after: always; height: 100vh; display: flex; flex-direction: column; }
      table { width: 100%; border-collapse: collapse; height: 100%; table-layout: fixed; }
      thead th { position: sticky; top: 0; }
      th, td { border: 1px solid #94a3b8; padding: 8px; font-size: 12pt; text-align: center; vertical-align: middle; }
      th { background: #e2e8f0; }
      tbody { --rows: 1; }
      tbody tr { height: calc( (100vh - 12mm) / var(--rows) ); }
      .bench-label { font-weight: 800; background: #f1f5f9; }
      .aisle { background: #e2e8f0; font-weight: 800; white-space: nowrap; }
      .seat-content { font-weight: 700; }
      .seat-grade { font-style: italic; font-size: 10pt; }
      .seat-id { font-size: 9pt; color: #475569; }
      @media print { .page:last-child { page-break-after: auto; } }
    `;
    let html = `<!doctype html><html><head><meta charset="utf-8"><title>Print Seating Chart</title><style>${css}</style></head><body>`;
    ranges.forEach(([start, end]) => {
      if (start > end || start > total) return;
      html += '<div class="page">';
      html += generateSeatingTableHtml(start, Math.min(end, total), theme);
      html += '</div>';
    });
    html += '</body></html>';
    return html;
  }

  function generateSeatingTableHtml(startRow, endRow, theme) {
    const cols = ['Left Side', 'Window (L)', 'Middle (L)', 'Aisle (L)', 'AISLE', 'Aisle (R)', 'Middle (R)', 'Window (R)', 'Right Side'];
    const rowsInHalf = (endRow - startRow + 1);
    let out = '<table><thead><tr>' + cols.map(c => `<th>${c}</th>`).join('') + `</tr></thead><tbody style="--rows:${rowsInHalf}">`;
    for (let i = startRow; i <= endRow; i++) {
      const leftBench = (i * 2) - 1;
      const rightBench = i * 2;
      const leftLabel = formatBenchLabel(theme, leftBench);
      const rightLabel = formatBenchLabel(theme, rightBench);
      out += '<tr>';
      out += `<td class="bench-label">Bench Seat ${leftBench}<br>${leftLabel}</td>`;
      out += seatCellHtml(`${leftBench}LA`);
      out += seatCellHtml(`${leftBench}LB`);
      out += seatCellHtml(`${leftBench}LC`);
      out += `<td class="aisle">Row ${i}</td>`;
      out += seatCellHtml(`${rightBench}RC`);
      out += seatCellHtml(`${rightBench}RB`);
      out += seatCellHtml(`${rightBench}RA`);
      out += `<td class="bench-label">Bench Seat ${rightBench}<br>${rightLabel}</td>`;
      out += '</tr>';
    }
    out += '</tbody></table>';
    return out;
  }

  function formatBenchLabel(theme, benchNum) {
    const { icon, name } = getThemeItem(theme, benchNum);
    if (icon && name) return `${icon} ${name}`;
    return icon || name || '';
  }

  function seatCellHtml(seatId) {
  const uuid = Object.keys(GRADE_COLORS && seatingAssignments ? seatingAssignments : {}).find(u => seatingAssignments[u] === seatId);
  if (!uuid) return `<td class="seat empty"><div class="seat-content">(Empty)</div></td>`;
  const s = allStudents[uuid];
  const g = typeof window.normalizeGrade === 'function' ? window.normalizeGrade(s.grade) : String(s.grade || '').toUpperCase();
    const bg = GRADE_COLORS && GRADE_COLORS[g] ? GRADE_COLORS[g] : (GRADE_COLORS ? GRADE_COLORS.default : '#FFFFFF');
    // Show both colored badge and cell background
    return `<td class="seat" style="background:${bg} !important"><div class="seat-content">
      <div class="seat-name">${s.firstName} ${s.lastName}</div>
      <div class="seat-grade">Grade: <span style="display:inline-block;width:1em;height:1em;border-radius:50%;background:${bg};border:1px solid #888;vertical-align:middle;margin-right:4px"></span>${s.grade}</div>
    </div></td>`;
// Add tooltip to print button for print backgrounds
window.addEventListener('DOMContentLoaded', () => {
  const printBtn = document.getElementById('print-chart-btn');
  if (printBtn) {
    printBtn.title = 'If colors do not show when printing, enable "Print backgrounds" or "Background graphics" in your browser\'s print dialog.';
  }
});
  }

  // Printing - Bench Icons (large; 4 per page, Option A: 2x2 quadrants)

  // Print large bench icons (4 per page)
  function printBenchIcons() {
    const theme = THEMES[themeSelector.value] || THEMES.Default;
    const benches = Array.from({ length: rowsCount * 2 }, (_, i) => (i + 1));
    const pages = [];
    for (let i = 0; i < benches.length; i += 4) pages.push(benches.slice(i, i + 4));
    let html = generateBenchIconsHtml(pages, theme);
    openPrintWindow(html);
  }
  window.printBenchIcons = printBenchIcons;

  // Helper: Generate HTML for bench icons
  function generateBenchIconsHtml(pages, theme) {
    const css = `
      @page { margin: 12mm; size: letter portrait; }
      body { margin: 0; font-family: system-ui, Segoe UI, Arial, "Segoe UI Emoji", "Noto Color Emoji", "Apple Color Emoji", sans-serif; }
      .page { page-break-after: always; padding: 8mm; box-sizing: border-box; }
      .grid-2x2 { display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; gap: 8mm; height: calc(100vh - 16mm); }
      .sector { border: 1px solid #94a3b8; display: flex; align-items: center; justify-content: center; padding: 6mm; box-sizing: border-box; }
      .card { border: 1px dashed #cbd5e1; display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; text-align: center; padding: 8mm; }
      .icon { font-size: 120pt; line-height: 1; }
      .bench { margin-top: 6mm; font-size: 72pt; font-weight: 800; }
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
          const { icon } = getThemeItem(theme, benchNum);
          html += `<div class="card">
                    <div class="icon">${icon || ''}</div>
                    <div class="bench">${benchNum}</div>
                  </div>`;
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


  // Expose getThemeItem globally for modules
  function getThemeItem(theme, benchNum) {
    const raw = theme[String(benchNum)] || '';
    if (!raw) return { icon: '', name: '' };
    if (typeof raw === 'object' && raw.icon) return raw; // future-proof if theme entries become objects
    // Expecting format "<emoji> Name"; split on space first token
    const m = String(raw).trim();
    const first = m.split(' ')[0] || '';
    const rest = m.slice(first.length).trim();
    return { icon: first, name: rest };
  }
  window.getThemeItem = getThemeItem;

  // Simple modal seat picker for assigning from unassigned list
  function openSeatPicker(targetSeatId) {
    const roster = Object.keys(allStudents)
      .filter(uuid => !Object.prototype.hasOwnProperty.call(seatingAssignments, uuid))
      .map(uuid => ({ uuid, ...allStudents[uuid] }));
    if (!roster.length) { alert('No unassigned students.'); return; }

    const root = document.getElementById('modal-root');
    const content = document.getElementById('modal-content');
    const backdrop = document.getElementById('modal-backdrop');
    if (!root || !content) return;
    content.innerHTML = '';
    const title = document.createElement('div');
    title.className = 'modal-title';
    title.textContent = 'Assign student to seat';
    content.appendChild(title);
    const list = document.createElement('div');
    list.className = 'modal-list';
    roster.forEach(s => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = `${s.firstName} ${s.lastName} (Grade: ${s.grade})`;
      btn.addEventListener('click', () => {
        seatingAssignments[s.uuid] = targetSeatId;
        closeModal();
        redrawAll();
      });
      list.appendChild(btn);
    });
    content.appendChild(list);
    const actions = document.createElement('div');
    actions.className = 'modal-actions';
    const cancel = document.createElement('button');
    cancel.type = 'button';
    cancel.textContent = 'Cancel';
    cancel.addEventListener('click', closeModal);
    actions.appendChild(cancel);
    content.appendChild(actions);
    root.classList.add('show');
    root.style.display = 'flex';
    if (backdrop) backdrop.addEventListener('click', closeModal, { once: true });
    document.addEventListener('keydown', escCloseOnce, { once: true });

    function escCloseOnce(ev) { if (ev.key === 'Escape') closeModal(); }
    function closeModal() {
      root.classList.remove('show');
      root.style.display = 'none';
      content.innerHTML = '';
    }
  }
  window.openSeatPicker = openSeatPicker;

  // Init
  function init() {
    populateThemeSelector();
    // No loadState: privacy-safe, no persistent data
    renderSeatingChart();
    renderUnassignedList();
    // No touchSaved: privacy-safe
  }

  // --- End main script ---
  init();
})();
