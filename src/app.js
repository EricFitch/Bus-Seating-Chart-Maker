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
  window.sortBy = window.sortBy || 'lastName'; // 'lastName' or 'firstName'
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
  window.GRADE_COLORS = GRADE_COLORS;
  
  // Initialize rowsInput with current value
  rowsInput.value = window.rowsCount;

  // No-op persistence functions (removed for privacy)
  function saveState() { /* no-op for privacy */ }
  function loadState() { /* no-op for privacy */ }
  function touchSaved() { /* no-op for privacy */ }

  // Wire buttons
  $('#applyLayout').addEventListener('click', () => {
    window.rowsCount = window.clamp(parseInt(rowsInput.value || '13', 10), 1, 30);
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

  // Sort toggle button
  $('#sort-toggle-btn').addEventListener('click', toggleSort);

  // Print buttons
  $('#print-chart-btn').addEventListener('click', printChartLandscapeSplit);
  $('#print-tags-btn').addEventListener('click', printTags);
  $('#print-icons-btn').addEventListener('click', printBenchIcons);

  // Export/Import buttons
  $('#export-btn').addEventListener('click', exportJSON);
  $('#import-file').addEventListener('change', importJSON);
  $('#import-btn').addEventListener('click', () => {
    $('#import-file').click();
  });

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
    // Default to Animals theme (no persistence for privacy)
    themeSelector.value = 'Animals';
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
    
    // Get unassigned students and sort based on current sort preference
    const unassignedStudents = Object.keys(allStudents)
      .filter(uuid => !assigned.has(uuid))
      .map(uuid => ({ uuid, ...allStudents[uuid] }))
      .sort((a, b) => {
        if (window.sortBy === 'firstName') {
          // Sort by first name, then last name
          const firstNameCompare = (a.firstName || '').localeCompare(b.firstName || '');
          if (firstNameCompare !== 0) return firstNameCompare;
          return (a.lastName || '').localeCompare(b.lastName || '');
        } else {
          // Sort by last name, then first name (default)
          const lastNameCompare = (a.lastName || '').localeCompare(b.lastName || '');
          if (lastNameCompare !== 0) return lastNameCompare;
          return (a.firstName || '').localeCompare(b.firstName || '');
        }
      });
    
    unassignedStudents.forEach(({ uuid, firstName, lastName, grade }) => {
      const li = document.createElement('li');
      li.textContent = `${firstName} ${lastName} (Grade: ${grade})`;
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
      
      // Validate CSV has at least header + one data row
      if (lines.length < 2) {
        alert('CSV must have at least a header row and one data row.');
        ev.target.value = '';
        return;
      }
      
      // Skip header if present
      const rows = lines.slice(1);
      let imported = 0;
      let skipped = 0;
      
      rows.forEach(line => {
        const cols = line.split(',').map(s => s.trim());
        // Require at least 3 columns and non-empty name and grade
        if (cols.length >= 3 && cols[0] && cols[1] && cols[2]) {
          addStudent({ lastName: cols[0], firstName: cols[1], grade: cols[2] });
          imported++;
        } else {
          skipped++;
        }
      });
      
      // Provide feedback to user
      let message = `Imported ${imported} student(s)`;
      if (skipped > 0) {
        message += ` (skipped ${skipped} invalid row(s))`;
      }
      alert(message);
      
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

  function toggleSort() {
    // Toggle between lastName and firstName
    window.sortBy = (window.sortBy === 'lastName') ? 'firstName' : 'lastName';
    
    // Update button text
    const btn = $('#sort-toggle-btn');
    if (btn) {
      btn.textContent = window.sortBy === 'lastName' ? 'Sort: Last Name' : 'Sort: First Name';
    }
    
    // Re-render list with new sort order
    renderUnassignedList();
  }
  window.toggleSort = toggleSort;

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


  // Export/Import functionality for saving and loading seating charts

  function exportJSON() {
    const data = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      rowsCount: window.rowsCount,
      sortBy: window.sortBy,
      theme: themeSelector.value,
      students: allStudents,
      seatingAssignments: seatingAssignments,
      gradeColors: GRADE_COLORS
    };
    
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bus-seating-chart-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
  window.exportJSON = exportJSON;

  function importJSON(ev) {
    const file = ev.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(String(e.target.result || ''));
        
        // Validate data structure
        if (!data.students || !data.seatingAssignments) {
          alert('Invalid file format. Please select a valid seating chart export file.');
          return;
        }
        
        // Load the data
        window.allStudents = data.students || {};
        window.seatingAssignments = data.seatingAssignments || {};
        window.rowsCount = data.rowsCount || 13;
        window.sortBy = data.sortBy || 'lastName';
        
        // Update UI elements
        if (data.rowsCount) {
          rowsInput.value = data.rowsCount;
        }
        if (data.theme && themeSelector) {
          themeSelector.value = data.theme;
        }
        if (data.gradeColors) {
          window.GRADE_COLORS = data.gradeColors;
          // Update color pickers if present
          Object.keys(data.gradeColors).forEach(grade => {
            const picker = document.querySelector(`input[name="${grade}"]`);
            if (picker) picker.value = data.gradeColors[grade];
          });
        }
        
        // Update sort button text
        const sortBtn = $('#sort-toggle-btn');
        if (sortBtn) {
          sortBtn.textContent = window.sortBy === 'lastName' ? 'Sort: Last Name' : 'Sort: First Name';
        }
        
        // Redraw everything
        redrawAll();
        
        const studentCount = Object.keys(window.allStudents).length;
        const assignedCount = Object.keys(window.seatingAssignments).length;
        alert(`Successfully loaded ${studentCount} student(s) with ${assignedCount} seat assignment(s).`);
        
      } catch (err) {
        alert('Error loading file: ' + err.message);
      }
      
      // Clear the file input
      ev.target.value = '';
    };
    
    reader.readAsText(file);
  }
  window.importJSON = importJSON;

  // Printing - Tags

  // Print name tags for assigned students
  function printTags() {
    const theme = THEMES[themeSelector.value] || THEMES.Default;
    const assignedList = getAssignedStudentsSorted();
    
    // Read print options from checkboxes
    const printOptions = {
      showBenchNumbers: $('#print-show-bench-numbers')?.checked ?? true,
      showRowNumbers: $('#print-show-row-numbers')?.checked ?? true,
      showSeatPositions: $('#print-show-seat-positions')?.checked ?? true,
      showThemeIcons: $('#print-show-theme-icons')?.checked ?? true
    };
    
    let html = generateTagsHtml(assignedList, theme, printOptions);
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

  // Helper: Open print window
  function openPrintWindow(html) {
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(html);
    w.document.close();
    w.focus();
    w.print();
  }

  function tagHtml(student, theme, printOptions) {
    if (!student) return '';
    const bench = (student.seatId.match(/\d+/) || [''])[0];
    const { icon, name } = getThemeItem(theme, bench);
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
    const total = window.rowsCount;
    const firstHalf = Math.ceil(total / 2);
    const ranges = [ [1, firstHalf], [firstHalf + 1, total] ];
    
    // Read print options from checkboxes
    const printOptions = {
      showBenchNumbers: $('#print-show-bench-numbers')?.checked ?? true,
      showRowNumbers: $('#print-show-row-numbers')?.checked ?? true,
      showSeatPositions: $('#print-show-seat-positions')?.checked ?? true,
      showThemeIcons: $('#print-show-theme-icons')?.checked ?? true
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
      const { icon, name } = getThemeItem(theme, benchNum);
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
    const uuid = Object.keys(seatingAssignments).find(u => seatingAssignments[u] === seatId);
    if (!uuid) return `<td class="seat empty"><div class="seat-content">(Empty)</div></td>`;
    const s = allStudents[uuid];
    const g = typeof window.normalizeGrade === 'function' ? window.normalizeGrade(s.grade) : String(s.grade || '').toUpperCase();
    const bg = (GRADE_COLORS && GRADE_COLORS[g]) ? GRADE_COLORS[g] : (GRADE_COLORS?.default || '#FFFFFF');
    // Show both colored badge and cell background
    return `<td class="seat" style="background:${bg} !important"><div class="seat-content">
      <div class="seat-name">${s.firstName} ${s.lastName}</div>
      <div class="seat-grade">Grade: <span style="display:inline-block;width:1em;height:1em;border-radius:50%;background:${bg};border:1px solid #888;vertical-align:middle;margin-right:4px"></span>${s.grade}</div>
    </div></td>`;
  }

// Add tooltip to print button for print backgrounds
window.addEventListener('DOMContentLoaded', () => {
  const printBtn = document.getElementById('print-chart-btn');
  if (printBtn) {
    printBtn.title = 'If colors do not show when printing, enable "Print backgrounds" or "Background graphics" in your browser\'s print dialog.';
  }
});

  // Printing - Bench Icons (large; 4 per page, Option A: 2x2 quadrants)

  // Print large bench icons (4 per page)
  function printBenchIcons() {
    const theme = THEMES[themeSelector.value] || THEMES.Default;
    const benches = Array.from({ length: window.rowsCount * 2 }, (_, i) => (i + 1));
    const pages = [];
    for (let i = 0; i < benches.length; i += 4) pages.push(benches.slice(i, i + 4));
    
    // Read print options from checkboxes
    const printOptions = {
      showBenchNumbers: $('#print-show-bench-numbers')?.checked ?? true,
      showRowNumbers: $('#print-show-row-numbers')?.checked ?? true,
      showSeatPositions: $('#print-show-seat-positions')?.checked ?? true,
      showThemeIcons: $('#print-show-theme-icons')?.checked ?? true
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
          const { icon, name } = getThemeItem(theme, benchNum);
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
