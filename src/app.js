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

  // Clear all assignments button
  $('#clear-all-btn').addEventListener('click', clearAllAssignments);

  // Theme change
  themeSelector.addEventListener('change', () => {
    renderSeatingChart();
    saveState();
  });

  // Helpers

  // populateThemeSelector is now loaded from src/themes.js


  // Seating chart rendering functions are now loaded from src/seatingChart.js
  // renderUnassignedList is now loaded from src/roster.js
  // updatePrintButtons is now loaded from src/seatingChart.js

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
    
    // Show loading toast
    showToast('⏳ Loading CSV...', 'info');
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = String(e.target.result || '');
      const lines = text.split(/\r?\n/).filter(Boolean);
      
      // Validate CSV has at least header + one data row
      if (lines.length < 2) {
        showToast('❌ CSV must have at least a header row and one data row', 'error');
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
      
      // Provide feedback to user with toast
      let message = `✅ Imported ${imported} student(s)`;
      if (skipped > 0) {
        message += ` (skipped ${skipped})`;
        showToast(message, 'warning');
      } else {
        showToast(message, 'success');
      }
      
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

  // addStudent is now loaded from src/roster.js

  // selectStudent is now loaded from src/roster.js

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

  // clearAllAssignments is now loaded from src/seatingChart.js

  // assignSeat is now loaded from src/seatingChart.js

  // unassignSeat is now loaded from src/seatingChart.js


  // Redraw all main UI components
  function redrawAll() {
    renderSeatingChart();
    renderUnassignedList();
    updateSeatingStats();
    // Removed saveState for privacy: no persistent data
  }
  window.redrawAll = redrawAll;

  // updateSeatingStats is now loaded from src/seatingChart.js


  // Export/Import functionality for saving and loading seating charts
  // exportJSON and importJSON are now loaded from src/storage.js

  // Printing - Tags
  // printTags is now loaded from src/printing.js

  // Helper: Get sorted list of assigned students
  // getAssignedStudentsSorted is now loaded from src/printing.js

  // Helper: Generate HTML for tags
  // generateTagsHtml is now loaded from src/printing.js

  // Helper: Open print window
  // openPrintWindow is now loaded from src/printing.js

  // tagHtml is now loaded from src/printing.js

  // Human-readable description for a seatId like "7LA" without exposing A/B/C in the UI
  // describeSeatId is now loaded from src/utils.js

  // Printing - Seating Chart (landscape, split into two pages by halves)

  // printChartLandscapeSplit is now loaded from src/printing.js

  // Helper: Generate chart HTML for print
  // generateChartHtml is now loaded from src/printing.js

  // generateSeatingTableHtml is now loaded from src/printing.js

  // formatBenchLabel is now loaded from src/printing.js

  // seatCellHtml is now loaded from src/printing.js

// Add tooltip to print button for print backgrounds
window.addEventListener('DOMContentLoaded', () => {
  const printBtn = document.getElementById('print-chart-btn');
  if (printBtn) {
    printBtn.title = 'If colors do not show when printing, enable "Print backgrounds" or "Background graphics" in your browser\'s print dialog.';
  }
});

  // Printing - Bench Icons (large; 4 per page, Option A: 2x2 quadrants)

  // printBenchIcons is now loaded from src/printing.js

  // Helper: Generate HTML for bench icons
  // generateBenchIconsHtml is now loaded from src/printing.js


  // Expose getThemeItem globally for modules
  // getThemeItem is now loaded from src/themes.js

  // Simple modal seat picker for assigning from unassigned list
  // openSeatPicker is now loaded from src/modal.js

  // Init
  function init() {
    populateThemeSelector();
    // No loadState: privacy-safe, no persistent data
    renderSeatingChart();
    renderUnassignedList();
    // No touchSaved: privacy-safe
  }

  // Scroll hint handler for mobile
  function setupScrollHint() {
    const scrollHint = document.getElementById('scroll-hint');
    const chartContainer = document.getElementById('seating-chart-container');
    
    if (scrollHint && chartContainer) {
      // Hide on scroll
      chartContainer.addEventListener('scroll', () => {
        scrollHint.style.display = 'none';
      }, { once: true });
      
      // Auto-hide after 3 seconds
      setTimeout(() => {
        if (scrollHint) {
          scrollHint.style.opacity = '0';
          scrollHint.style.transition = 'opacity 0.3s ease';
          setTimeout(() => {
            scrollHint.style.display = 'none';
          }, 300);
        }
      }, 3000);
    }
  }

  // --- End main script ---
  init();
  setupScrollHint();
})();
