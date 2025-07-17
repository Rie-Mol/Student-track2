// Student Calendar Deadlines App using Bootstrap only

let deadlines = [];

// Load deadlines from localStorage
function loadDeadlines() {
    const saved = localStorage.getItem('studentDeadlines');
    deadlines = saved ? JSON.parse(saved) : [];
}

// Save deadlines to localStorage
function saveDeadlines() {
    localStorage.setItem('studentDeadlines', JSON.stringify(deadlines));
}

function populateYearDropdown() {
    const yearSelect = document.getElementById('calendarYear');
    const currentYear = new Date().getFullYear();
    yearSelect.innerHTML = '';
    for (let y = currentYear - 5; y <= currentYear + 5; y++) {
        yearSelect.innerHTML += `<option value='${y}'>${y}</option>`;
    }
    yearSelect.value = currentYear;
}

// Render calendar for current month
function renderCalendar() {
    const calendarDiv = document.getElementById('calendar');
    const monthSelect = document.getElementById('calendarMonth');
    const yearSelect = document.getElementById('calendarYear');
    const year = parseInt(yearSelect.value);
    const month = parseInt(monthSelect.value);
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    let html = `<h5 class='text-center mb-3'>${new Date(year, month).toLocaleString('default', { month: 'long' })} ${year}</h5>`;
    html += `<table class='table table-bordered text-center'><thead><tr>`;
    ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].forEach(d => html += `<th>${d}</th>`);
    html += `</tr></thead><tbody><tr>`;

    let day = 1;
    for (let i = 0; i < 6; i++) {
        for (let j = 0; j < 7; j++) {
            if (i === 0 && j < firstDay) {
                html += `<td></td>`;
            } else if (day > daysInMonth) {
                html += `<td></td>`;
            } else {
                const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
                const dayDeadlines = deadlines.filter(dl => dl.date === dateStr);
                let bgColor = '';
                let borderStyle = '';
                if (dayDeadlines.length > 0) {
                    const missed = dayDeadlines.some(dl => {
                        const deadlineDate = new Date(dl.date + (dl.time ? 'T' + dl.time : 'T23:59'));
                        return !dl.done && deadlineDate < today;
                    });
                    if (missed) {
                        bgColor = 'background-color:#dc3545;color:white;'; // red for missed
                    } else {
                        bgColor = 'background-color:#0d6efd;color:white;'; // blue for any deadline
                    }
                }
                if (dateStr === todayStr) {
                    borderStyle = 'border:2px solid #ffc107;';
                }
                html += `<td style='cursor:pointer;${bgColor}${borderStyle}' data-date='${dateStr}'>${day}</td>`;
                day++;
            }
        }
        html += `</tr>`;
        if (day > daysInMonth) break;
        else html += `<tr>`;
    }
    html += `</tbody></table>`;
    calendarDiv.innerHTML = html;

    // Add click event to show deadlines for a day
    document.querySelectorAll('#calendar td[data-date]').forEach(td => {
        td.addEventListener('click', function() {
            showDeadlinesForDate(this.dataset.date);
        });
    });
}

// Show deadlines for a selected date
function showDeadlinesForDate(date) {
    const listDiv = document.getElementById('deadlineList');
    const filter = document.getElementById('priorityFilter')?.value || 'ALL';
    // Ensure date format matches
    let dayDeadlines = deadlines.filter(dl => dl.date && dl.date.trim() === date.trim());
    if (filter !== 'ALL') {
        dayDeadlines = dayDeadlines.filter(dl => dl.priority === filter);
    }
    let html = `<h5>Deadlines for ${date}</h5>`;
    if (dayDeadlines.length === 0) {
        html += `<div class='alert alert-secondary text-center rounded-pill shadow-sm'>No deadlines for this date.</div>`;
    } else {
        dayDeadlines.forEach((dl, idx) => {
            let boxColor = 'background:#198754;color:white;'; // LOW
            if (dl.priority === 'HIGH') boxColor = 'background:#dc3545;color:white;';
            else if (dl.priority === 'MEDIUM') boxColor = 'background:#fd7e14;color:white;';
            if (dl.done) boxColor += 'opacity:0.6;';
            let notifyText = 'No notification';
            if (dl.notify === 'day') notifyText = 'Notify: 1 day before';
            else if (dl.notify === 'hour') notifyText = 'Notify: 1 hour before';
            else if (dl.notify === '30min') notifyText = 'Notify: 30 mins before';
            html += `<div class='card mb-4 shadow-sm rounded border-0' style='${boxColor}'>
                <div class='card-body d-flex flex-column gap-2'>
                    <div class='d-flex justify-content-between align-items-center'>
                        <div>
                            <strong class='fs-5'>${dl.title}</strong>
                            <span class='badge bg-light text-dark ms-2'>${dl.priority}</span>
                            ${dl.done ? '<i class="fa fa-check-circle ms-2"></i>' : ''}
                        </div>
                        <div class='d-flex gap-2'>
                            <button class='btn btn-sm btn-outline-light' onclick='deleteDeadline(${idx})'><i class='fa fa-trash'></i></button>
                            ${!dl.done ? `<button class='btn btn-sm btn-outline-light' onclick='markDeadlineDone(${idx})'><i class='fa fa-check'></i> Done</button>` : ''}
                        </div>
                    </div>
                    <div class='d-flex justify-content-between align-items-center'>
                        <span class='text-light'><i class='fa fa-calendar me-1'></i>${dl.date} ${dl.time || ''}</span>
                        <span class='small text-light'><i class='fa fa-bell me-1'></i>${notifyText}</span>
                    </div>
                </div>
            </div>`;
        });
    }
    listDiv.innerHTML = html;
}

// Render all deadlines
function renderDeadlineList() {
    const listDiv = document.getElementById('deadlineList');
    const filter = document.getElementById('priorityFilter')?.value || 'ALL';
    let html = '';
    let filteredDeadlines = deadlines;
    if (filter !== 'ALL') {
        filteredDeadlines = deadlines.filter(dl => dl.priority === filter);
    }
    if (filteredDeadlines.length === 0) {
        html += `<div class='alert alert-secondary text-center rounded-pill shadow-sm'>No deadlines yet.</div>`;
    } else {
        filteredDeadlines.forEach((dl, idx) => {
            let boxColor = 'background:#198754;color:white;'; // LOW
            if (dl.priority === 'HIGH') boxColor = 'background:#dc3545;color:white;';
            else if (dl.priority === 'MEDIUM') boxColor = 'background:#fd7e14;color:white;';
            if (dl.done) boxColor += 'opacity:0.6;';
            let notifyText = 'No notification';
            if (dl.notify === 'day') notifyText = 'Notify: 1 day before';
            else if (dl.notify === 'hour') notifyText = 'Notify: 1 hour before';
            else if (dl.notify === '30min') notifyText = 'Notify: 30 mins before';
            html += `<div class='card mb-4 shadow-sm rounded border-0' style='${boxColor}'>
                <div class='card-body d-flex flex-column gap-2'>
                    <div class='d-flex justify-content-between align-items-center'>
                        <div>
                            <strong class='fs-5'>${dl.title}</strong>
                            <span class='badge bg-light text-dark ms-2'>${dl.priority}</span>
                            ${dl.done ? '<i class="fa fa-check-circle ms-2"></i>' : ''}
                        </div>
                        <div class='d-flex gap-2'>
                            <button class='btn btn-sm btn-outline-light' onclick='deleteDeadline(${idx})'><i class='fa fa-trash'></i></button>
                            ${!dl.done ? `<button class='btn btn-sm btn-outline-light' onclick='markDeadlineDone(${idx})'><i class='fa fa-check'></i> Done</button>` : ''}
                        </div>
                    </div>
                    <div class='d-flex justify-content-between align-items-center'>
                        <span class='text-light'><i class='fa fa-calendar me-1'></i>${dl.date} ${dl.time || ''}</span>
                        <span class='small text-light'><i class='fa fa-bell me-1'></i>${notifyText}</span>
                    </div>
                </div>
            </div>`;
        });
    }
    listDiv.innerHTML = html;
}

function markDeadlineDone(idx) {
    deadlines[idx].done = true;
    saveDeadlines();
    renderCalendar();
    renderDeadlineList();
}

// Add filter event
const priorityFilter = document.getElementById('priorityFilter');
if (priorityFilter) {
    priorityFilter.addEventListener('change', renderDeadlineList);
}

function deleteDeadline(idx) {
    deadlines.splice(idx, 1);
    saveDeadlines();
    renderCalendar();
    renderDeadlineList();
}

const deadlineForm = document.getElementById('deadlineForm');
deadlineForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const date = document.getElementById('deadlineDate').value;
    const time = document.getElementById('deadlineTime').value;
    const title = document.getElementById('deadlineTitle').value;
    const priority = document.getElementById('deadlinePriority').value;
    const notify = document.getElementById('deadlineNotify').value;
    if (date && title && priority) {
        deadlines.push({ date, time, title, priority, notify });
        saveDeadlines();
        renderCalendar();
        renderDeadlineList();
        deadlineForm.reset();
        var modal = bootstrap.Modal.getInstance(document.getElementById('deadlineModal'));
        modal.hide();
    }
});

// Notification logic
function checkNotifications() {
    const now = new Date();
    let upcoming = [];
    deadlines.forEach(dl => {
        if (!dl.notify || dl.notify === 'none') return;
        let eventDateTime = new Date(dl.date + (dl.time ? 'T' + dl.time : 'T00:00'));
        let diffMs = eventDateTime - now;
        let notifyMs = 0;
        if (dl.notify === 'day') notifyMs = 24*60*60*1000;
        else if (dl.notify === 'hour') notifyMs = 60*60*1000;
        else if (dl.notify === '30min') notifyMs = 30*60*1000;
        if (diffMs > 0 && diffMs < notifyMs + 1000 && diffMs > notifyMs - 1000) {
            upcoming.push(`${dl.title} (${dl.date} ${dl.time || ''})`);
        }
    });
    const notificationBar = document.getElementById('notificationBar');
    if (upcoming.length > 0) {
        notificationBar.style.display = 'block';
        notificationBar.textContent = 'Upcoming: ' + upcoming.join(', ');
    } else {
        notificationBar.style.display = 'none';
        notificationBar.textContent = '';
    }
}
setInterval(checkNotifications, 60000); // check every minute

// Initial load
loadDeadlines();
populateYearDropdown();
renderCalendar();
renderDeadlineList();
checkNotifications();

// Add event listeners for month/year dropdowns
window.addEventListener('DOMContentLoaded', () => {
    populateYearDropdown();
    const today = new Date();
    document.getElementById('calendarMonth').value = today.getMonth();
    document.getElementById('calendarYear').value = today.getFullYear();
    renderCalendar();
    showDeadlinesForDate(`${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`);
    document.getElementById('calendarMonth').addEventListener('change', renderCalendar);
    document.getElementById('calendarYear').addEventListener('change', renderCalendar);
});