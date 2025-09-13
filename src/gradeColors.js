// Grade color legend logic for Bus Seating Chart Maker
// Handles color picker updates and legend rendering

function setupGradeColorLegend() {
  const legendForm = document.getElementById('grade-color-legend');
  if (legendForm) {
    legendForm.addEventListener('input', (e) => {
      const tgt = e.target;
      if (tgt && tgt.name && tgt.value) {
        window.GRADE_COLORS[tgt.name] = tgt.value;
        if (typeof window.renderSeatingChart === 'function') window.renderSeatingChart();
      }
    });
  }
}

// Export function
window.setupGradeColorLegend = setupGradeColorLegend;
