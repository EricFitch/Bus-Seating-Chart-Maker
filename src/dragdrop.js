// Drag-and-drop logic for Bus Seating Chart Maker
// Handles dragstart, dragover, drop, and related helpers

function makeDraggable(element, uuid, sourceType, seatId) {
  element.draggable = true;
  element.addEventListener('dragstart', (e) => {
    e.dataTransfer.setData('text/plain', uuid);
    if (sourceType === 'seat') {
      e.dataTransfer.setData('text/bus-seat-source', seatId);
    } else if (sourceType === 'roster') {
      e.dataTransfer.setData('text/bus-origin', 'roster');
    }
    e.dataTransfer.effectAllowed = 'move';
  });
}

function makeDropTarget(element, onDrop) {
  element.addEventListener('dragover', (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; });
  element.addEventListener('dragenter', (e) => { e.preventDefault(); element.classList.add('drag-over'); });
  element.addEventListener('dragleave', () => { element.classList.remove('drag-over'); });
  element.addEventListener('drop', (e) => {
    e.preventDefault();
    element.classList.remove('drag-over');
    onDrop(e);
  });
}

// Export functions
window.makeDraggable = makeDraggable;
window.makeDropTarget = makeDropTarget;
