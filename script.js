const DB_KEY = 'miniCRM_leads';
function getLeads() {
   try { return JSON.parse(localStorage.getItem(DB_KEY)) || []; }
   catch { return []; }
}
function saveLeads(leads) {
   localStorage.setItem(DB_KEY, JSON.stringify(leads));
}
function generateId() {
   return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}
document.addEventListener('DOMContentLoaded', () => {
   const loginForm = document.getElementById('loginForm');
   if (loginForm) {
       loginForm.addEventListener('submit', e => {
           e.preventDefault();
           const user = loginForm.username.value.trim().toUpperCase();
           const pass = loginForm.password.value;
           if (user === 'ADMIN' && pass === 'esit45') {
               const card = document.querySelector('.glass-card');
               if (card) {
                   card.style.boxShadow = '0 0 50px rgba(212,175,55,0.6), 0 0 120px rgba(212,175,55,0.3)';
                   setTimeout(() => { window.location.href = 'dashboard.html'; }, 400);
               } else {
                   window.location.href = 'dashboard.html';
               }
           } else {
               shakeCard();
               alert('Invalid username or password.\nHint: ADMIN / esit45');
           }
       });
   }
   const customerForm = document.getElementById('customerForm');
   if (customerForm) {
       customerForm.addEventListener('submit', e => {
           e.preventDefault();
           addLead(customerForm);
       });
   }
   if (document.getElementById('customerTable')) {
       renderLeads();
       updateStats();
   }
});
function shakeCard() {
   const card = document.querySelector('.glass-card');
   if (!card) return;
   card.style.transition = 'transform 0.08s ease, box-shadow 0.4s ease';
   const shakes = [6, -6, 5, -5, 3, -3, 0];
   let i = 0;
   const interval = setInterval(() => {
       card.style.transform = `translateX(${shakes[i]}px)`;
       i++;
       if (i >= shakes.length) { clearInterval(interval); card.style.transform = ''; }
   }, 60);
}
function addLead(form) {
   const name   = form.name.value.trim();
   const email  = form.email.value.trim();
   const source = form.source.value;
   const status = form.status.value;
   const notes  = form.notes.value.trim();
   if (!name || !source || !status) return;
   const lead = { id: generateId(), name, email, source, status, notes, createdAt: Date.now() };
   const leads = getLeads();
   leads.unshift(lead);
   saveLeads(leads);
   form.reset();
   document.getElementById('formPanel').style.display = 'none';
   renderLeads();
   updateStats();
}
function renderLeads(filter = '') {
   const tbody = document.getElementById('customerTable');
   const emptyRow = document.getElementById('emptyRow');
   const leads = getLeads();
   const q = filter.toLowerCase();
   Array.from(tbody.querySelectorAll('tr:not(.empty-row)')).forEach(r => r.remove());
   const filtered = q
       ? leads.filter(l => [l.name, l.email, l.source, l.status, l.notes].join(' ').toLowerCase().includes(q))
       : leads;
   if (filtered.length === 0) { emptyRow.style.display = ''; return; }
   emptyRow.style.display = 'none';
   filtered.forEach(lead => {
       const tr = document.createElement('tr');
tr.dataset.id = lead.id;
       tr.innerHTML = `
<td>${escHtml(lead.name)}</td>
<td>${escHtml(lead.email) || '<span style="opacity:.4">—</span>'}</td>
<td>${escHtml(lead.source)}</td>
<td><button class="status-btn status-${lead.status}" onclick="cycleStatus('${lead.id}', this)">${lead.status}</button></td>
<td style="max-width:200px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escHtml(lead.notes) || '<span style="opacity:.4">—</span>'}</td>
<td><button class="delete-btn" onclick="deleteLead('${lead.id}')">✕ Delete</button></td>`;
       tbody.appendChild(tr);
   });
}
function cycleStatus(id, btn) {
   const statuses = ['New', 'Contacted', 'Converted'];
   const leads = getLeads();
   const lead = leads.find(l => l.id === id);
   if (!lead) return;
   lead.status = statuses[(statuses.indexOf(lead.status) + 1) % statuses.length];
   saveLeads(leads);
   btn.className = `status-btn status-${lead.status}`;
   btn.textContent = lead.status;
   updateStats();
}
function deleteLead(id) {
   if (!confirm('Remove this lead?')) return;
   saveLeads(getLeads().filter(l => l.id !== id));
   renderLeads(document.getElementById('searchInput')?.value || '');
   updateStats();
}
function updateStats() {
   const leads = getLeads();
   const count = s => leads.filter(l => l.status === s).length;
   setText('statTotal',     leads.length);
   setText('statNew',       count('New'));
   setText('statContacted', count('Contacted'));
   setText('statConverted', count('Converted'));
}
function setText(id, val) {
   const el = document.getElementById(id);
   if (el) el.textContent = val;
}
function filterLeads() {
   const q = document.getElementById('searchInput')?.value || '';
   renderLeads(q);
}
function escHtml(str) {
   if (!str) return '';
   return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}