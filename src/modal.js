// Modal picker logic for Bus Seating Chart Maker
// Handles opening and closing the seat assignment modal

function openSeatPicker(targetSeatId) {
  const roster = Object.keys(window.allStudents)
    .filter(uuid => !Object.prototype.hasOwnProperty.call(window.seatingAssignments, uuid))
    .map(uuid => ({ uuid, ...window.allStudents[uuid] }));
  if (!roster.length) { alert('No unassigned students.'); return; }

  const root = document.getElementById('modal-root');
  const content = document.getElementById('modal-content');
  const backdrop = document.getElementById('modal-backdrop');
  if (!root || !content) return;
  content.innerHTML = '';
  
  // Define escape handler with cleanup
  const escHandler = (ev) => { if (ev.key === 'Escape') closeModal(); };
  
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
      window.seatingAssignments[s.uuid] = targetSeatId;
      closeModal();
      if (typeof window.redrawAll === 'function') window.redrawAll();
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
  document.addEventListener('keydown', escHandler);

  function closeModal() {
    root.classList.remove('show');
    root.style.display = 'none';
    content.innerHTML = '';
    // Clean up event listener
    document.removeEventListener('keydown', escHandler);
  }
}

// Export function
window.openSeatPicker = openSeatPicker;
