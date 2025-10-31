// Seating chart rendering for Bus Seating Chart Maker
// Handles rendering of seating chart and seat cell creation

// Create ARIA live region for screen reader announcements
const announcer = document.createElement('div');
announcer.setAttribute('role', 'status');
announcer.setAttribute('aria-live', 'polite');
announcer.setAttribute('aria-atomic', 'true');
announcer.className = 'sr-only';
announcer.id = 'aria-announcer';
if (!document.getElementById('aria-announcer')) {
  document.body.appendChild(announcer);
}

// Helper function to announce changes to screen readers
function announce(message) {
  const announcer = document.getElementById('aria-announcer');
  if (announcer) {
    announcer.textContent = message;
    // Clear after a brief delay to allow for multiple announcements
    setTimeout(() => { announcer.textContent = ''; }, 1000);
  }
}
window.announce = announce;

function renderSeatingChart() {
  const table = window.$('#seating-chart');
  table.innerHTML = '';
  window.metaEl.textContent = `${window.rowsCount} rows • Bench layout with Window/Middle/Aisle seats`;
  const theme = window.THEMES[window.themeSelector.value] || window.THEMES.Default;

  const thead = table.createTHead();
  const header = thead.insertRow();
  const cols = ['Left Side', 'Window (L)', 'Middle (L)', 'Aisle (L)', 'AISLE', 'Aisle (R)', 'Middle (R)', 'Window (R)', 'Right Side'];
  cols.forEach(text => { const th = document.createElement('th'); th.textContent = text; header.appendChild(th); });

  const tbody = table.createTBody();
  for (let i = 1; i <= window.rowsCount; i++) {
    const row = tbody.insertRow();
    const leftBench = (i * 2) - 1;
    const rightBench = i * 2;

    const leftCell = row.insertCell();
    leftCell.className = 'bench-label';
    leftCell.innerHTML = benchLabelHtml(leftBench, theme[leftBench.toString()]);
    ['A','B','C'].forEach(l => createSeatCell(row, `${leftBench}L${l}`));
    row.insertCell().textContent = `Row ${i}`;
    row.cells[4].className = 'aisle';
    ['C','B','A'].forEach(l => createSeatCell(row, `${rightBench}R${l}`));
    const rightCell = row.insertCell();
    rightCell.className = 'bench-label';
    rightCell.innerHTML = benchLabelHtml(rightBench, theme[rightBench.toString()]);
  }

  if (typeof window.updatePrintButtons === 'function') window.updatePrintButtons();
}

function createSeatCell(row, seatId) {
  const cell = row.insertCell();
  cell.dataset.seatId = seatId;
  cell.className = 'seat';
  // Provide helpful tooltip and aria label without showing technical A/B/C codes
  const desc = window.describeSeatId(seatId);
  cell.title = `${desc} • ${seatId}`; // keep seatId in tooltip only
  cell.setAttribute('aria-label', desc);

  const uuid = Object.keys(window.seatingAssignments).find(u => window.seatingAssignments[u] === seatId);
  if (uuid) {
    const s = window.allStudents[uuid];
    cell.innerHTML = `<div class="seat-content">
                        <div class="seat-name">${s.firstName} ${s.lastName}</div>
                        <div class="seat-meta"><span class="grade-badge">${s.grade}</span></div>
                      </div>`;
    // Use global normalizeGrade for color lookup
    const g = typeof window.normalizeGrade === 'function' ? window.normalizeGrade(s.grade) : String(s.grade || '').toUpperCase();
    cell.style.backgroundColor = window.GRADE_COLORS[g] || window.GRADE_COLORS.default;
    cell.addEventListener('click', () => {
      window.unassignSeat(uuid);
      // Announce unassignment
      announce(`${s.firstName} ${s.lastName} removed from seat`);
    });

    // Make occupied seats draggable to move students directly
    cell.draggable = true;
    cell.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', uuid);
      e.dataTransfer.setData('text/bus-seat-source', seatId);
      e.dataTransfer.effectAllowed = 'move';
    });
    // Allow dropping onto occupied seats to swap if source is another seat
    cell.addEventListener('dragover', (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; });
    cell.addEventListener('dragenter', (e) => { e.preventDefault(); cell.classList.add('drag-over'); });
    cell.addEventListener('dragleave', () => { cell.classList.remove('drag-over'); });
    cell.addEventListener('drop', (e) => {
      e.preventDefault();
      cell.classList.remove('drag-over');
      const draggedUuid = e.dataTransfer.getData('text/plain');
      if (!draggedUuid || !window.allStudents[draggedUuid]) return;
      const origin = e.dataTransfer.getData('text/bus-origin');
      const sourceSeat = e.dataTransfer.getData('text/bus-seat-source');
      const targetSeat = seatId;
      const targetUuid = Object.keys(window.seatingAssignments).find(u => window.seatingAssignments[u] === targetSeat);
      if (!targetUuid) return;
      const draggedStudent = window.allStudents[draggedUuid];
      const targetStudent = window.allStudents[targetUuid];
      if (origin === 'roster') {
        // Replace: move roster student into target seat, unassign target student back to roster
        window.seatingAssignments[draggedUuid] = targetSeat;
        delete window.seatingAssignments[targetUuid];
        announce(`${draggedStudent.firstName} ${draggedStudent.lastName} assigned to ${desc}, ${targetStudent.firstName} ${targetStudent.lastName} moved to unassigned`);
      } else if (sourceSeat) {
        // Swap: seat-to-seat drag
        window.seatingAssignments[draggedUuid] = targetSeat;
        window.seatingAssignments[targetUuid] = sourceSeat;
        announce(`${draggedStudent.firstName} ${draggedStudent.lastName} and ${targetStudent.firstName} ${targetStudent.lastName} swapped seats`);
      } else {
        return;
      }
      window.selectedStudentUuid = null;
      if (typeof window.redrawAll === 'function') window.redrawAll();
    });
  } else {
    cell.innerHTML = `<div class="seat-content">(Empty)</div>`;
    cell.classList.add('empty');
    cell.addEventListener('click', () => window.openSeatPicker(seatId));
    // Drag & Drop: allow dropping a student onto an empty seat
    cell.addEventListener('dragover', (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; });
    cell.addEventListener('dragenter', (e) => { e.preventDefault(); cell.classList.add('drag-over'); });
    cell.addEventListener('dragleave', () => { cell.classList.remove('drag-over'); });
    cell.addEventListener('drop', (e) => {
      e.preventDefault();
      cell.classList.remove('drag-over');
      const draggedUuid = e.dataTransfer.getData('text/plain');
      if (!draggedUuid || !window.allStudents[draggedUuid]) return;
      const student = window.allStudents[draggedUuid];
      window.seatingAssignments[draggedUuid] = seatId;
      window.selectedStudentUuid = null;
      // Announce assignment
      announce(`${student.firstName} ${student.lastName} assigned to ${desc}`);
      if (typeof window.redrawAll === 'function') window.redrawAll();
    });
  }

  // Add mobile touch interaction support
  if (typeof window.addMobileSeatInteraction === 'function') {
    window.addMobileSeatInteraction(cell, seatId);
  }
}

function benchLabelHtml(benchNum, raw) {
  const { icon, name } = window.getThemeItem(window.THEMES[window.themeSelector.value] || window.THEMES.Default, benchNum);
  const iconHtml = icon ? `<div class="bench-icon">${icon}</div>` : '';
  const nameHtml = name ? `<div class="bench-name">${name}</div>` : '';
  return `<div class="bench-wrap">${iconHtml}<div class="bench-title">Bench Seat ${benchNum}</div>${nameHtml}</div>`;
}

// Export functions
window.renderSeatingChart = renderSeatingChart;
window.createSeatCell = createSeatCell;
window.benchLabelHtml = benchLabelHtml;
