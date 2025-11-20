// Storage logic for Bus Seating Chart Maker
// Handles export and import of seating chart data

function exportJSON() {
  const themeSelector = window.themeSelector || document.getElementById('theme-selector');
  const data = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    rowsCount: window.rowsCount,
    sortBy: window.sortBy,
    theme: themeSelector ? themeSelector.value : 'Default',
    students: window.allStudents,
    seatingAssignments: window.seatingAssignments,
    gradeColors: window.GRADE_COLORS
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
      const rowsInput = window.rowsInput || document.getElementById('rows');
      const themeSelector = window.themeSelector || document.getElementById('theme-selector');

      if (data.rowsCount && rowsInput) {
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
      const sortBtn = document.getElementById('sort-toggle-btn');
      if (sortBtn) {
        sortBtn.textContent = window.sortBy === 'lastName' ? 'Sort: Last Name' : 'Sort: First Name';
      }
      
      // Redraw everything
      if (typeof window.redrawAll === 'function') window.redrawAll();
      
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

// Export functions
window.exportJSON = exportJSON;
window.importJSON = importJSON;
