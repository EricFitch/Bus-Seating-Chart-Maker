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
