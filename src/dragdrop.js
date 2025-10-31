// Drag-and-drop logic for Bus Seating Chart Maker
// Handles dragstart, dragover, drop, and related helpers
// Includes mobile touch support

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

  // Add mobile touch support for seat assignment
  if (sourceType === 'roster') {
    // For roster items, add touch to assign to empty seats
    element.addEventListener('touchend', (e) => {
      e.preventDefault();
      // Find the first available empty seat and assign
      const emptySeat = document.querySelector('.seat.empty');
      if (emptySeat) {
        const seatId = emptySeat.dataset.seatId;
        if (seatId) {
          window.seatingAssignments[uuid] = seatId;
          if (typeof window.redrawAll === 'function') window.redrawAll();
        }
      } else {
        // No empty seats, show modal picker
        const seatedStudents = Object.keys(window.seatingAssignments);
        if (seatedStudents.length > 0) {
          // Find a seat to potentially replace
          const firstSeat = document.querySelector('.seat[data-seat-id]');
          if (firstSeat && typeof window.openSeatPicker === 'function') {
            window.openSeatPicker(firstSeat.dataset.seatId);
          }
        }
      }
    });
  }
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

// Mobile-friendly seat interaction helper
function addMobileSeatInteraction(seatElement, seatId) {
  // Add visual feedback on touch start
  seatElement.addEventListener('touchstart', () => {
    seatElement.classList.add('touching');
  });
  
  // Add touch event for mobile seat assignment
  seatElement.addEventListener('touchend', (e) => {
    e.preventDefault();
    e.stopPropagation();
    seatElement.classList.remove('touching');
    
    // If seat is empty, open picker to assign a student
    if (seatElement.classList.contains('empty')) {
      if (typeof window.openSeatPicker === 'function') {
        window.openSeatPicker(seatId);
      }
    } else {
      // If seat is occupied, option to remove student (move back to roster)
      const studentUuid = Object.keys(window.seatingAssignments).find(
        uuid => window.seatingAssignments[uuid] === seatId
      );
      if (studentUuid) {
        const student = window.allStudents[studentUuid];
        if (student && confirm(`Remove ${student.firstName} ${student.lastName} from this seat?`)) {
          delete window.seatingAssignments[studentUuid];
          if (typeof window.redrawAll === 'function') window.redrawAll();
        }
      }
    }
  });
  
  // Remove touching class on cancel
  seatElement.addEventListener('touchcancel', () => {
    seatElement.classList.remove('touching');
  });
}

// Export functions
window.makeDraggable = makeDraggable;
window.makeDropTarget = makeDropTarget;
window.addMobileSeatInteraction = addMobileSeatInteraction;
