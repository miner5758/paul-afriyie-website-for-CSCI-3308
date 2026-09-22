console.log("script.js loaded");

// Saved events list
const events = [];

let editingIndex = null;

// Shows the Location field for in-person events and the Remote URL field for remote events. Also flips the required attribute.
function updateLocationOptions() {
  const modality = document.getElementById('event_modality').value;

  const locationContainer = document.getElementById('location_container');
  const remoteContainer = document.getElementById('remote_url_container');
  const locationInput = document.getElementById('event_location');
  const remoteInput = document.getElementById('event_remote_url');

  if (modality === 'in-person') {
    locationContainer.classList.remove('d-none');
    remoteContainer.classList.add('d-none');
    locationInput.required = true;
    remoteInput.required = false;
  } else {
    locationContainer.classList.add('d-none');
    remoteContainer.classList.remove('d-none');
    locationInput.required = false;
    remoteInput.required = true;
  }
}

updateLocationOptions();

function saveEvent() {
  const form = document.getElementById('event_form');

  
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const modality = document.getElementById('event_modality').value;

  const eventDetails = {
    name: document.getElementById('event_name').value,
    weekday: document.getElementById('event_weekday').value,
    time: document.getElementById('event_time').value,
    modality: modality,
    location: modality === 'in-person'
      ? document.getElementById('event_location').value
      : null,
    remote_url: modality === 'remote'
      ? document.getElementById('event_remote_url').value
      : null,
    attendees: document.getElementById('event_attendees').value
      .split(',')
      .map(name => name.trim())
      .filter(name => name !== ''),
    category: document.getElementById('event_category').value,
  };

  if (editingIndex === null) {
    // Creating a new event
    events.push(eventDetails);
    addEventToCalendarUI(eventDetails, events.length - 1);
  } else {
    // Updating an existing event
    events[editingIndex] = eventDetails;
    const oldCard = document.querySelector(`.event[data-index="${editingIndex}"]`);
    oldCard.remove();
    addEventToCalendarUI(eventDetails, editingIndex);
  }
  console.log(events);

  form.reset();
  updateLocationOptions(); // reset() puts modality back to In Person

  const modalElement = document.getElementById('event_modal');
  const modal = bootstrap.Modal.getOrCreateInstance(modalElement);
  modal.hide();
}

function openEditModal(index) {
  const ev = events[index];
  editingIndex = index;

  document.getElementById('event_name').value = ev.name;
  document.getElementById('event_weekday').value = ev.weekday;
  document.getElementById('event_time').value = ev.time;
  document.getElementById('event_modality').value = ev.modality;
  document.getElementById('event_location').value = ev.location ?? '';
  document.getElementById('event_remote_url').value = ev.remote_url ?? '';
  document.getElementById('event_attendees').value = ev.attendees.join(', ');
  document.getElementById('event_category').value = ev.category;
  updateLocationOptions(); 

  document.getElementById('event_modal_label').textContent = 'Edit Event';

  const modalElement = document.getElementById('event_modal');
  bootstrap.Modal.getOrCreateInstance(modalElement).show();
}


document.getElementById('event_modal').addEventListener('hidden.bs.modal', () => {
  editingIndex = null;
  document.getElementById('event_modal_label').textContent = 'Create Event';
  document.getElementById('event_form').reset();
  updateLocationOptions();
});

function createEventCard(eventDetails) {
  const eventElement = document.createElement('div');
  eventElement.className = 'event row border rounded m-1 py-1 category-' + eventDetails.category;

  const where = eventDetails.modality === 'in-person'
    ? `<strong>Location:</strong> ${eventDetails.location}`
    : `<strong>URL:</strong> <a href="${eventDetails.remote_url}" target="_blank">${eventDetails.remote_url}</a>`;

  const details = document.createElement('div');
  details.className = 'col small';
  details.innerHTML = `
    <div class="fw-bold">${eventDetails.name}</div>
    <div><strong>Time:</strong> ${eventDetails.time}</div>
    <div><strong>Modality:</strong> ${eventDetails.modality === 'in-person' ? 'In Person' : 'Remote'}</div>
    <div>${where}</div>
    <div><strong>Attendees:</strong> ${eventDetails.attendees.join(', ')}</div>
    <div><strong>Category:</strong> ${eventDetails.category.charAt(0).toUpperCase() + eventDetails.category.slice(1)}</div>
  `;

  eventElement.appendChild(details);
  return eventElement;
}

// Puts an event card into the column for its weekday.
function addEventToCalendarUI(eventInfo, index) {
  const card = createEventCard(eventInfo);
  card.dataset.index = index;
  card.addEventListener('click', () => openEditModal(index));
  card.querySelectorAll('a').forEach(a => a.addEventListener('click', e => e.stopPropagation()));

  const column = document.getElementById(eventInfo.weekday);
  column.appendChild(card);
}
