// Roster logic for Bus Seating Chart Maker
// Handles student data, CSV parsing, add/remove, and roster management

// State
window.allStudents = {}; // uuid -> { id, firstName, lastName, grade }
window.selectedStudentUuid = null;

// Add a student
function addStudent(student) {
  const uuid = 'student-' + Date.now() + '-' + Math.random().toString(36).slice(2, 9);
  window.allStudents[uuid] = student;
}

// Remove a student
function removeStudent(uuid) {
  delete window.allStudents[uuid];
}

// Select a student
function selectStudent(uuid) {
  window.selectedStudentUuid = (window.selectedStudentUuid === uuid) ? null : uuid;
  if (typeof window.renderUnassignedList === 'function') window.renderUnassignedList();
}

function renderUnassignedList() {
  const unassignedList = window.unassignedList || document.getElementById('unassignedList');
  if (!unassignedList) return;

  unassignedList.innerHTML = '';
  const assigned = new Set(Object.keys(window.seatingAssignments));
  // Make the unassigned list a drop target to unassign a student by dragging from a seat
  unassignedList.addEventListener('dragover', (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; });
  unassignedList.addEventListener('dragenter', (e) => { e.preventDefault(); unassignedList.classList.add('drag-over'); });
  unassignedList.addEventListener('dragleave', () => { unassignedList.classList.remove('drag-over'); });
  unassignedList.addEventListener('drop', (e) => {
    e.preventDefault();
    unassignedList.classList.remove('drag-over');
    const draggedUuid = e.dataTransfer.getData('text/plain');
    const sourceSeat = e.dataTransfer.getData('text/bus-seat-source');
    if (draggedUuid && sourceSeat && window.allStudents[draggedUuid]) {
      // Unassign from seat back to roster
      delete window.seatingAssignments[draggedUuid];
      window.selectedStudentUuid = null;
      if (typeof window.redrawAll === 'function') window.redrawAll();
    }
  });
  
  // Get unassigned students and sort based on current sort preference
  const unassignedStudents = Object.keys(window.allStudents)
    .filter(uuid => !assigned.has(uuid))
    .map(uuid => ({ uuid, ...window.allStudents[uuid] }))
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
    if (uuid === window.selectedStudentUuid) li.classList.add('selected');
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
  if (typeof window.updatePrintButtons === 'function') window.updatePrintButtons();
}

// Parse CSV roster
function parseCsvRoster(csvText) {
  const lines = csvText.trim().split(/\r?\n/);
  const students = {};
  for (const line of lines) {
    const [id, lastName, firstName, grade] = line.split(',').map(s => s.trim());
    if (firstName && lastName && grade) {
      const uuid = 'student-' + Date.now() + '-' + Math.random().toString(36).slice(2, 9);
      students[uuid] = { id, firstName, lastName, grade };
    }
  }
  return students;
}

// Export functions
window.addStudent = addStudent;
window.removeStudent = removeStudent;
window.selectStudent = selectStudent;
window.parseCsvRoster = parseCsvRoster;
window.renderUnassignedList = renderUnassignedList;
