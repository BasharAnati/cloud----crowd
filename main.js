// ============================
// Cloud Crowd - main.js (INLINE EDIT IN DRAWER)
// ============================

// Temporary ticket storage
let tickets = JSON.parse(localStorage.getItem('cloudCrowdTickets')) || {
  cctv: [],
  ce: [],
  'free-orders': [],
  complaints: [],
  'time-table': []
};

let currentSection = '';

// الحقول المختصرة التي نظهرها داخل الكرت لكل قسم
const mainFields = {
  cctv: ['branch', 'staff', 'dateTime'],
  ce: ['customerName', 'branch', 'restaurant'],
  'free-orders': ['customerName', 'orderNumber', 'discountAmount'],
  complaints: ['customerName', 'branch', 'issueCategory'],
  'time-table': ['customerName', 'orderNumber', 'phone']
};

// ترتيب الأعمدة (Statuses) لكل قسم
const STATUS_COLUMNS = {
  cctv: ['Under Review', 'Escalated', 'Closed'],
  ce: ['Pending (Customer Call Required)', 'Under Review', 'Escalated', 'Closed'],
  'free-orders': ['Active', 'Taken', 'Not Active'],
  complaints: ['Pending (Customer Call Required)', 'Under Review', 'Escalated', 'Closed'],
  'time-table': [
    'Pending Call', 'Called – No Answer', 'Called – Customer Refused Return',
    'Scheduled for Pickup', 'Scheduled for Delivery',
    'Issue – Needs Follow-up', 'Returned', 'No Call Needed'
  ]
};

// تعريف حقول النماذج (نسختك الأصلية)
const formFields = {
  cctv: [
    { label: 'Case Status', type: 'select', name: 'status', options: ['Closed', 'Under Review', 'Escalated'] },
    { label: 'Branch', type: 'select', name: 'branch', options: ['Wadi Saqra', 'Swefieh', 'Swefieh Village', 'Manara'] },
    { label: 'Date & Time', type: 'datetime-local', name: 'dateTime' },
    { label: 'Camera(s)', type: 'multi-select', name: 'cameras', options: [
      'Back of Kitchen', 'Kitchen', 'Pepsi Kitchen', 'Storehouse', 'Cashier', 'Main Stove',
      'Prep Back Area', 'Prep Room', 'Back Corridor', 'Fingerprint', 'Posterior View',
      'Refrigerators', '2 Pepsi Kitchen', 'Main Kitchen'
    ] },
    { label: 'Section(s)', type: 'multi-select', name: 'sections', options: [
      'Cash Wrap','Counter','Line','Grill','Fryer','Freezer','Fridge','Oven','Station',
      'Rest Area','Stairs','Front Door','Back Door','Sink','Front Area','Kitchen',
      'Prep Main Stove','Prep Back Area'
    ] },
    { label: 'Staff Involved', type: 'multi-select', name: 'staff', options: [
      'Khaled Al-Nimri', 'Faisal Al-Nimri', 'Ahmad Al-Masri', 'Sarah Al-Husseini', 'Omar Al-Khatib', 'Lina Abu Zaid',
      'Yazan Al-Jabari', 'Rania Al-Tamimi', 'Tareq Al-Saleh', 'Dalia Al-Khaled', 'Ziad Al-Najjar', 'Nour Al-Faraj',
      'Hani Al-Majali', 'Maya Al-Qudah', 'Samer Al-Hassan', 'Leen Al-Rawashdeh', 'Bilal Al-Sharif', 'Hana Al-Atrash',
      'Majed Al-Din', 'Rawan Al-Bakri', 'Zain Al-Hayek', 'Sahar Al-Saleem', 'Fadi Al-Masoud', 'Yasmin Al-Khateeb',
      'Sami Al-Khalil', 'Nourhan Al-Salem', 'Kamal Al-Zu’bi', 'Dima Al-Hamdan', 'Mazen Al-Tarawneh', 'Huda Al-Jarrah',
      'Rami Al-Nouri', 'Amal Al-Sharaf', 'Talal Al-Masri', 'Lara Al-Farouq', 'Nader Al-Haj', 'Salma Al-Hussain',
      'Issa Al-Qasem', 'Dina Al-Majed'
    ] },
    { label: 'Review Type', type: 'select', name: 'reviewType', options: ['Recorded', 'Live'] },
    { label: 'Violated Policy', type: 'multi-select', name: 'violations', options: [
      'Cleanliness','Punctuality','Cash Handling','Equipment Check','Personal Hygiene','Safety/Compliance',
      'Stock Management','Order Accuracy','Staff Behavior','Eating','Kitchen Tools Compliance','Other'
    ] },
    { label: 'Case Details', type: 'textarea', name: 'notes' },
    { label: 'Action Taken', type: 'textarea', name: 'actionTaken' }
  ],
  ce: [
    { label: 'Status', type: 'select', name: 'status', options: ['Closed','Under Review','Escalated','Pending (Customer Call Required)'] },
    { label: 'Order Number', type: 'text', name: 'orderNumber' },
    { label: 'Department Responsible', type: 'select', name: 'department', options: [
      'Kitchen','Delivery/Prepared Delay','Customer Service','Frontline / Cashier','IT','Operations','Management'
    ] },
    { label: 'Customer Name', type: 'text', name: 'customerName' },
    { label: 'Phone Number', type: 'text', name: 'phone' },
    { label: 'Creation Date', type: 'datetime-local', name: 'creationDate' },
    { label: 'Shift', type: 'select', name: 'shift', options: ['Shift A','Shift B'] },
    { label: 'Order Type', type: 'select', name: 'orderType', options: ['Delivery','Takeout'] },
    { label: 'Branch Name', type: 'select', name: 'branch', options: ['Swefieh','Wadi Saqra','Swefieh Village'] },
    { label: 'Restaurant', type: 'select', name: 'restaurant', options: [
      'Very Good Burger','Sager','Happy Tummies','Crunchychkn','Bun Run','Butter Me Up','Bint Halal',
      'Colors Catering','Heat Burger','Thyme Table',"Evi's",'Chili Charms'
    ] },
    { label: 'Order Channel', type: 'select', name: 'channel', options: ['Web','Call Center'] },
    { label: 'Feedback Date', type: 'datetime-local', name: 'feedbackDate' },
    { label: 'Issue Category', type: 'select', name: 'issueCategory', options: [
      'Positive Experience','Service Quality','Food Quality','Delivery/Prepared Time','Employee Attitude','Other'
    ] },
    { label: 'Case Details', type: 'textarea', name: 'customerNotes' },
    { label: 'Action Taken', type: 'textarea', name: 'actionTaken' },
    { label: 'Customer Satisfaction Level', type: 'select', name: 'satisfaction', options: ['Satisfied','Not Satisfied'] }
  ],
  'free-orders': [
    { label: 'Status', type: 'select', name: 'status', options: [ 'Active','Not Active','Taken' ] },
    { label: 'Customer Name', type: 'text', name: 'customerName' },
    { label: 'Phone Number', type: 'text', name: 'phone' },
    { label: 'Order Date', type: 'datetime-local', name: 'orderDate' },
    { label: 'Order Number', type: 'text', name: 'orderNumber' },
    { label: 'Order on Circa', type: 'file', name: 'orderOnCirca', accept: 'image/*' },
    { label: 'Discount Amount', type: 'text', name: 'discountAmount' },
    { label: 'Reason for Discount', type: 'textarea', name: 'reasonForDiscount' },
    { label:'Order Channel', type:'select', name:'channel', options:['Circa','Talabat','Careem','Direct Order (From Store)'] },
    { label: 'Decision Maker', type: 'text', name: 'decisionMaker' },
    { label: 'Attached', type: 'file', name: 'attached', accept: 'image/*' },
    { label: 'The date of using the discount', type: 'datetime-local', name: 'discountDate' },
    { label: 'New order number', type: 'text', name: 'newOrderNumber' },
    { label: 'Deduction from', type: 'text', name: 'deductionFrom' },
    { label: 'Case description', type: 'textarea', name: 'caseDescription' }
  ],
  complaints: [
    { label: 'Status', type: 'select', name: 'status', options: ['Closed','Under Review','Escalated','Pending (Customer Call Required)'] },
    { label: 'Order Number', type: 'text', name: 'orderNumber' },
    { label: 'Department Responsible', type: 'select', name: 'department', options: [
      'Kitchen','Delivery/Prepared Delay','Customer Service','Frontline / Cashier','IT','Operations','Management'
    ] },
    { label: 'Customer Name', type: 'text', name: 'customerName' },
    { label: 'Phone Number', type: 'text', name: 'phone' },
    { label: 'Creation Date', type: 'datetime-local', name: 'creationDate' },
    { label: 'Shift', type: 'select', name: 'shift', options: ['Shift A','Shift B'] },
    { label: 'Order Type', type: 'select', name: 'orderType', options: ['Delivery','Takeout'] },
    { label: 'Branch Name', type: 'select', name: 'branch', options: ['Swefieh','Wadi Saqra','Swefieh Village'] },
    { label: 'Restaurant', type: 'select', name: 'restaurant', options: [
      'Very Good Burger','Sager','Happy Tummies','Crunchychkn','Bun Run','Butter Me Up','Bint Halal',
      'Colors Catering','Heat Burger','Thyme Table',"Evi's",'Chili Charms'
    ] },
    { label:'Order Channel', type:'select', name:'channel', options:['Circa','Talabat','Careem','Direct Order (From Store)'] },
    { label: 'Issue Category', type: 'select', name: 'issueCategory', options: [
      'Positive Experience','Service Quality','Food Quality','Delivery/Prepared Time','Employee Attitude','Other'
    ] },
    { label: 'Case Details', type: 'textarea', name: 'complaintDetails' },
    { label: 'Action Taken', type: 'textarea', name: 'actionTaken' },
    { label: 'Attached', type: 'file', name: 'attached', accept: 'image/*' }
  ],
  'time-table': [
    { label: 'Status', type: 'select', name: 'status', options: [
      'No Call Needed', 'Pending Call', 'Called – No Answer', 'Called – Customer Refused Return',
      'Scheduled for Pickup', 'Scheduled for Delivery', 'Issue – Needs Follow-up', 'Returned'
    ] },
    { label: 'Customer Name', type: 'text', name: 'customerName' },
    { label: 'Phone Number', type: 'text', name: 'phone' },
    { label: 'Order Number', type: 'text', name: 'orderNumber' },
    { label: 'Order Date', type: 'datetime-local', name: 'orderDate' },
    { label: 'Return Date', type: 'datetime-local', name: 'returnDate' },
    { label: 'Amount to Be Refunded', type: 'text', name: 'amountToBeRefunded' },
    { label: 'Plates Quantity', type: 'text', name: 'platesQuantity' },
    { label: 'Plates Numbers', type: 'text', name: 'platesNumbers' },
    { label: 'Note', type: 'textarea', name: 'note' }
  ]
};

/* ==== Labels formatter ==== */
const FIELD_LABELS = {
  dateTime: 'Date & Time',
  creationDate: 'Creation Date',
  orderDate: 'Order Date',
  returnDate: 'Return Date',
  discountDate: 'Discount Date',
  newOrderNumber: 'New Order Number',
  orderNumber: 'Order Number',
  phone: 'Phone Number',
  reviewType: 'Review Type',
  issueCategory: 'Issue Category',
  decisionMaker: 'Decision Maker',
  deductionFrom: 'Deduction From',
  amountToBeRefunded: 'Amount to be Refunded',
  platesQuantity: 'Plates Quantity',
  platesNumbers: 'Plates Numbers',
  caseDescription: 'Case Description',
  customerNotes: 'Case Details',
  actionTaken: 'Action Taken'
};
function toLabel(fieldName){
  if (FIELD_LABELS[fieldName]) return FIELD_LABELS[fieldName];
  return fieldName
    .replace(/[_-]/g,' ')
    .replace(/([a-z])([A-Z])/g,'$1 $2')
    .replace(/\b\w/g, ch => ch.toUpperCase());
}

/* ==== Case numbers ==== */
const CASE_COUNTER_KEY = 'cloudCrowdCaseCounter';
function nextCaseNumber(section){
  const prefix = section.toUpperCase().replace(/[^A-Z0-9]+/g,'-');
  let n = parseInt(localStorage.getItem(CASE_COUNTER_KEY) || '1000', 10);
  n += 1;
  localStorage.setItem(CASE_COUNTER_KEY, String(n));
  const serial = n.toString().padStart(5,'0');
  return `${prefix}-${serial}`;
}
function ensureCaseNumbers(){
  let updated = false;
  Object.keys(tickets).forEach(sec => {
    tickets[sec].forEach(t => {
      if (!t.caseNumber) { t.caseNumber = nextCaseNumber(sec); updated = true; }
    });
  });
  if (updated) saveTicketsToStorage();
}

/* ==== Storage helpers ==== */
function saveTicketsToStorage(){ localStorage.setItem('cloudCrowdTickets', JSON.stringify(tickets)); }

function getMainFieldsContent(ticket){
  const fields = mainFields[currentSection] || [];
  let content = '';
  fields.forEach(field => {
    const value = ticket[field] || 'Not specified';
    content += `<p><strong>${toLabel(field)}:</strong> ${value}</p>`;
  });
  return content;
}

/* ===== Drawer (Side Panel) with inline edit ===== */
let drawerIndex = null;
let drawerEditMode = false;

function ensureDrawerActionsContainer(){
  const drawer = document.getElementById('ticket-drawer');
  if (!drawer) return null;
  let actions = drawer.querySelector('.drawer-actions');
  if (!actions) {
    actions = document.createElement('div');
    actions.className = 'drawer-actions';
    drawer.querySelector('.drawer-panel')?.appendChild(actions);
  }
  return actions;
}

function openTicketDrawerByCase(caseNumber){
  const idx = tickets[currentSection].findIndex(t => t.caseNumber === caseNumber);
  if (idx >= 0) openTicketDrawer(idx);
}

function openTicketDrawer(index){
  drawerIndex = index;
  drawerEditMode = false;
  const ticket = tickets[currentSection][index];
  const drawer = document.getElementById('ticket-drawer');
  if (!drawer) return;

  const titleEl = document.getElementById('drawer-title');
  const caseEl  = document.getElementById('drawer-caseNumber');
  const metaEl  = document.getElementById('drawer-meta');
  const bodyEl  = document.getElementById('drawer-body');
  const editBtn = document.getElementById('drawer-edit-btn');
  const actions = ensureDrawerActionsContainer();

  // Title & Case
  titleEl.textContent = ticket.status || 'Details';
  caseEl.textContent  = ticket.caseNumber || '';

  // Meta (date/time + status badge)
  let dateFrag = '';
  if (ticket.dateTime || ticket.creationDate || ticket.orderDate){
    const d = new Date(ticket.dateTime || ticket.creationDate || ticket.orderDate);
    dateFrag = `
      <div class="meta-item"><strong>Date:</strong> ${d.toLocaleDateString('en-US')}</div>
      <div class="meta-item"><strong>Time:</strong> ${d.toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit',hour12:true})}</div>
    `;
  }
  metaEl.innerHTML = `<span class="meta-badge">${ticket.status || 'Uncategorized'}</span>${dateFrag}`;

  // Body (read-only)
  bodyEl.innerHTML = buildDrawerReadonly(ticket);

  // Actions: Edit button
  if (actions) actions.innerHTML = '';
  if (editBtn) {
    editBtn.textContent = 'Edit';
    editBtn.onclick = () => enterDrawerEditMode();
  } else if (actions) {
    const btn = document.createElement('button');
    btn.className = 'edit-btn';
    btn.id = 'drawer-edit-btn';
    btn.textContent = 'Edit';
    btn.onclick = () => enterDrawerEditMode();
    actions.appendChild(btn);
  }

  // Open drawer
  drawer.classList.add('open');
  drawer.setAttribute('aria-hidden','false');
  document.body.classList.add('drawer-open');
}

function buildDrawerReadonly(ticket){
  let all = '';
  for (const f in ticket){
    if (['caseNumber','createdAt'].includes(f)) continue;
    const v = ticket[f];
    if (Array.isArray(v)) all += `<p><strong>${toLabel(f)}:</strong> ${v.join(', ')}</p>`;
    else if (v && typeof v !== 'object') all += `<p><strong>${toLabel(f)}:</strong> ${v}</p>`;
  }
  return all || '<div class="no-tickets">No details.</div>';
}

function buildDrawerEditForm(ticket){
  // مسموح التعديل على: Status + Action Taken
  const statusField = formFields[currentSection].find(f => f.name === 'status');
  const statusOptions = statusField ? statusField.options : [];

  return `
    <div class="form-group">
      <label>Status</label>
      <select name="status">
        ${statusOptions.map(opt => `<option value="${opt}" ${ticket.status === opt ? 'selected' : ''}>${opt}</option>`).join('')}
      </select>
    </div>
    <div class="form-group">
      <label>Action Taken</label>
      <textarea name="actionTaken" rows="4">${ticket.actionTaken || ''}</textarea>
    </div>
  `;
}

function enterDrawerEditMode(){
  if (drawerIndex == null) return;
  const ticket = tickets[currentSection][drawerIndex];
  const drawer = document.getElementById('ticket-drawer');
  const titleEl = document.getElementById('drawer-title');
  const bodyEl  = document.getElementById('drawer-body');
  const editBtn = document.getElementById('drawer-edit-btn');
  const actions = ensureDrawerActionsContainer();

  drawerEditMode = true;

  // عنوان يوضح أننا في وضع تعديل
  titleEl.textContent = `Edit • ${ticket.status || ''}`;

  // بدن اللوحة => نموذج قابل للتعديل
  bodyEl.innerHTML = `
    <form id="drawer-edit-form">
      ${buildDrawerEditForm(ticket)}
    </form>
  `;

  // أزرار الحفظ/إلغاء
  if (actions) {
    actions.innerHTML = `
      <button id="drawer-save-btn" class="submit-btn">Save</button>
      <button id="drawer-cancel-btn" class="cancel-btn" type="button">Cancel</button>
    `;
    actions.querySelector('#drawer-save-btn').onclick = (e) => {
      e.preventDefault();
      saveDrawerEdits();
    };
    actions.querySelector('#drawer-cancel-btn').onclick = (e) => {
      e.preventDefault();
      cancelDrawerEdits();
    };
  }

  // إخفاء/تعطيل زر Edit الأساسي إذا موجود
  if (editBtn) editBtn.style.display = 'none';
}

function cancelDrawerEdits(){
  if (drawerIndex == null) return;
  const editBtn = document.getElementById('drawer-edit-btn');
  const actions = ensureDrawerActionsContainer();
  drawerEditMode = false;

  // رجوع للوضع القرائي
  openTicketDrawer(drawerIndex);

  // إرجاع زر Edit إن كان مخفي
  if (editBtn) editBtn.style.display = '';
  if (actions) {
    // سيتم إعادة تهيئتها داخل openTicketDrawer
  }
}

function saveDrawerEdits(){
  if (drawerIndex == null) return;
  const form = document.getElementById('drawer-edit-form');
  if (!form) return;

  const fd = new FormData(form);
  const t = tickets[currentSection][drawerIndex];

  // تحديث الحقول المسموح بها
  t.status = fd.get('status');
  t.actionTaken = fd.get('actionTaken');

  // حفظ + إعادة رسم + البقاء في اللوحة
  saveTicketsToStorage();
  renderTickets();

  // إبقاء اللوحة مفتوحة مع الوضع القرائي (لتشوف التحديثات فورًا)
  openTicketDrawer(drawerIndex);
}

function closeTicketDrawer(){
  const drawer = document.getElementById('ticket-drawer');
  if (!drawer) return;
  drawer.classList.remove('open');
  drawer.setAttribute('aria-hidden','true');
  document.body.classList.remove('drawer-open');
  drawerIndex = null;
  drawerEditMode = false;
}
window.closeTicketDrawer = closeTicketDrawer;
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeTicketDrawer(); });

/* ===== Render (Kanban) ===== */
function renderTickets(){
  const wrap = document.getElementById('tickets');
  if (!wrap) return;
  wrap.innerHTML = '';
  const sectionTickets = tickets[currentSection] || [];

  // تجميع حسب الحالة
  const grouped = {};
  sectionTickets.forEach(t => {
    const st = t.status || 'Uncategorized';
    (grouped[st] ||= []).push(t);
  });

  const desired = STATUS_COLUMNS[currentSection] || Object.keys(grouped);
  const known = new Set(desired);
  const extras = Object.keys(grouped).filter(s => !known.has(s));
  const columns = [...desired, ...extras];

  columns.forEach(status => {
    const col = document.createElement('section');
    col.className = 'group';

    const count = (grouped[status] || []).length;

    // Header pill
    const header = document.createElement('div');
    header.className = 'col-header';
    header.innerHTML = `
      <div class="col-header-inner">
        <div translate class="col-title">${status}</div>
        <div class="col-right">
          <span class="col-sort" aria-label="Sort">
            <svg viewBox="0 0 24 24" width="18" height="18" focusable="false" aria-hidden="true">
              <path d="M0 0h24v24H0z" fill="none"></path>
              <path d="M9 3 5 6.99h3V14h2V6.99h3L9 3zm7 14.01V10h-2v7.01h-3L15 21l4-3.99h-3z"></path>
            </svg>
          </span>
          <span class="col-count">${count}</span>
        </div>
      </div>
    `;
    col.appendChild(header);

    const under = document.createElement('div');
    under.className = 'col-underbar';
    col.appendChild(under);

    (grouped[status] || []).forEach(ticket => {
      const card = document.createElement('div');
      card.className = `ticket-card ${getStatusClass(ticket.status)}`;

      // Head (chip + time)
      let timeStr = '';
      if (ticket.dateTime || ticket.creationDate || ticket.orderDate) {
        const d = new Date(ticket.dateTime || ticket.creationDate || ticket.orderDate);
        timeStr = d.toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit',hour12:true});
      }
      const head = `
        <div class="card-top"></div>
        <div class="card-head">
          <span class="chip chip-type">${primaryChipFor(ticket)}</span>
          <span class="card-time">${timeStr}</span>
        </div>
      `;

      const main = `
        <div class="card-main">
          ${getMainFieldsContent(ticket)}
          <div class="card-foot">
            <span class="card-case">${ticket.caseNumber || ''}</span>
          </div>
        </div>
      `;

      card.innerHTML = head + main;
      card.addEventListener('click', () => openTicketDrawerByCase(ticket.caseNumber));
      col.appendChild(card);
    });

    wrap.appendChild(col);
  });
}

function primaryChipFor(ticket){
  switch (currentSection) {
    case 'ce':
    case 'complaints':
      return ticket.orderType || ticket.channel || 'TICKET';
    case 'free-orders':
      return ticket.status || 'FREE';
    case 'time-table':
      return ticket.status || 'TASK';
    case 'cctv':
      return ticket.reviewType || 'CCTV';
    default:
      return 'TICKET';
  }
}

function getStatusClass(status){
  switch(status){
    case 'Taken': return 'status-taken';
    case 'Active': return 'status-active';
    case 'Not Active': return 'status-not-active';
    case 'Open': return 'status-open';
    case 'Follow-Up Needed': return 'status-follow-up-needed';
    case 'No Response': return 'status-no-response';
    case 'Call Back Scheduled': return 'status-call-back-scheduled';
    case 'In Progress': return 'status-in-progress';
    case 'Escalated': return 'status-escalated';
    case 'Resolved': return 'status-resolved';
    case 'Perfect Feedback': return 'status-perfect-feedback';
    case 'No Call Needed': return 'status-no-call-needed';
    case 'Pending Call': return 'status-pending-call';
    case 'Called – No Answer': return 'status-called-no-answer';
    case 'Called – Customer Refused Return': return 'status-called-customer-refused-return';
    case 'Scheduled for Pickup': return 'status-scheduled-for-pickup';
    case 'Scheduled for Delivery': return 'status-scheduled-for-delivery';
    case 'Issue – Needs Follow-up': return 'status-issue-needs-follow-up';
    case 'Returned': return 'status-returned';
    case 'Closed': return 'status-closed';
    case 'Under Review': return 'status-under-review';
    default: return '';
  }
}

/* ===== Edit Modal (kept for adding new tickets only; not used for drawer editing) ===== */
function openEditModal(index){
  // لم نعد نستخدم المودال للتعديل من اللوحة الجانبية.
  // أبقيناه للاحتياط—يمكنك حذفه إن رغبت.
  const modal = document.getElementById('modal');
  const ticket = tickets[currentSection][index];

  const dynamicForm = document.getElementById('dynamic-form');
  dynamicForm.innerHTML = `
    <div class="form-group">
      <label>Status</label>
      <select name="status">
        ${formFields[currentSection].find(f => f.name === 'status').options.map(opt =>
          `<option value="${opt}" ${ticket.status === opt ? 'selected' : ''}>${opt}</option>`
        ).join('')}
      </select>
    </div>
    <div class="form-group">
      <label>Action Taken</label>
      <textarea name="actionTaken">${ticket.actionTaken || ''}</textarea>
    </div>
    <input type="hidden" name="ticketIndex" value="${index}">
  `;

  modal.querySelector('h2').textContent = `Edit Ticket ${ticket.caseNumber || ''}`;
  modal.style.display = 'flex';
}

function goBack(){ window.location.href = 'index.html'; }

/* ===== New Ticket Modal ===== */
function openModal(section){
  currentSection = section;
  const modal = document.getElementById('modal');
  const dynamicForm = document.getElementById('dynamic-form');
  dynamicForm.innerHTML = '';

  formFields[currentSection].forEach(field => {
    const group = document.createElement('div');
    group.classList.add('form-group');

    const label = document.createElement('label');
    label.textContent = field.label;
    group.appendChild(label);

    if (field.type === 'select') {
      const select = document.createElement('select');
      select.name = field.name;
      field.options.forEach(o => {
        const opt = document.createElement('option');
        opt.value = o; opt.textContent = o;
        select.appendChild(opt);
      });
      group.appendChild(select);
    } else if (field.type === 'multi-select') {
      const multi = document.createElement('div');
      multi.classList.add('multi-select');
      multi.dataset.name = field.name;

      const selected = document.createElement('div');
      selected.classList.add('selected');
      selected.textContent = 'Select options...';
      multi.appendChild(selected);

      const dropdown = document.createElement('div');
      dropdown.classList.add('dropdown');
      field.options.forEach(o => {
        const lbl = document.createElement('label');
        const cb = document.createElement('input');
        cb.type = 'checkbox'; cb.value = o;
        lbl.appendChild(cb);
        lbl.appendChild(document.createTextNode(o));
        dropdown.appendChild(lbl);
      });
      multi.appendChild(dropdown);

      selected.addEventListener('click', () => multi.classList.toggle('open'));
      document.addEventListener('click', (e) => { if (!multi.contains(e.target)) multi.classList.remove('open'); });
      dropdown.querySelectorAll('input').forEach(cb => cb.addEventListener('change', () => updateSelected(multi)));

      group.appendChild(multi);
    } else if (field.type === 'textarea') {
      const ta = document.createElement('textarea');
      ta.name = field.name;
      group.appendChild(ta);
    } else if (field.type === 'file') {
      const input = document.createElement('input');
      input.type = 'file'; input.name = field.name; input.accept = field.accept || '*/*';
      group.appendChild(input);

      const preview = document.createElement('img');
      preview.classList.add('file-preview');
      group.appendChild(preview);

      input.addEventListener('change', () => {
        if (input.files && input.files[0]) {
          const reader = new FileReader();
          reader.onload = (e) => { preview.src = e.target.result; preview.style.display = 'block'; };
          reader.readAsDataURL(input.files[0]);
        } else { preview.style.display = 'none'; }
      });

      input.addEventListener('paste', (e) => {
        const items = (e.clipboardData || e.originalEvent.clipboardData).items;
        for (const item of items) {
          if (item.type.indexOf('image') !== -1) {
            const blob = item.getAsFile();
            const reader = new FileReader();
            reader.onload = (ev) => { preview.src = ev.target.result; preview.style.display = 'block'; input.dataset.pasted = ev.target.result; };
            reader.readAsDataURL(blob);
          }
        }
      });
    } else {
      const inp = document.createElement('input');
      inp.type = field.type; inp.name = field.name;
      group.appendChild(inp);
    }

    dynamicForm.appendChild(group);
  });

  document.getElementById('ticket-form').querySelector('[name="ticketIndex"]')?.remove();
  modal.querySelector('h2').textContent = 'Add New Ticket';
  modal.style.display = 'flex';
}

function updateSelected(multi){
  const selected = multi.querySelector('.selected');
  selected.innerHTML = '';
  multi.querySelectorAll('input:checked').forEach(cb => {
    const span = document.createElement('span');
    span.textContent = cb.value;
    const x = document.createElement('button');
    x.textContent = 'x';
    x.addEventListener('click', (e) => { e.stopPropagation(); cb.checked = false; updateSelected(multi); });
    span.appendChild(x);
    selected.appendChild(span);
  });
  if (selected.innerHTML === '') selected.textContent = 'Select options...';
}

function closeModal(){
  document.getElementById('modal').style.display = 'none';
  document.getElementById('ticket-form').reset();
  document.querySelectorAll('.multi-select').forEach(m => {
    m.querySelector('.selected').innerHTML = '';
    m.querySelectorAll('input').forEach(cb => cb.checked = false);
    m.classList.remove('open');
  });
  document.querySelectorAll('.file-preview').forEach(p => { p.src = ''; p.style.display = 'none'; });
}

/* ===== Bind form safely ===== */
function bindFormHandler(){
  const formEl = document.getElementById('ticket-form');
  if (!formEl) return;
  formEl.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const ticketIndex = fd.get('ticketIndex');

    if (ticketIndex !== null && ticketIndex !== '' && !Number.isNaN(Number(ticketIndex))) {
      const t = tickets[currentSection][Number(ticketIndex)];
      t.status = fd.get('status');
      t.actionTaken = fd.get('actionTaken');
    } else {
      const t = {};
      formFields[currentSection].forEach(field => {
        if (field.type === 'multi-select') {
          const multi = document.querySelector(`.multi-select[data-name="${field.name}"]`);
          t[field.name] = Array.from(multi.querySelectorAll('input:checked')).map(cb => cb.value);
        } else if (field.type === 'file') {
          const input = e.target.elements[field.name];
          t[field.name] = input.dataset.pasted || (input.files && input.files[0] ? URL.createObjectURL(input.files[0]) : '');
        } else {
          const input = e.target.elements[field.name];
          if (input) t[field.name] = input.value;
        }
      });
      t.caseNumber = nextCaseNumber(currentSection);
      t.createdAt = new Date().toISOString();
      tickets[currentSection].push(t);
    }

    saveTicketsToStorage();
    renderTickets();
    closeModal();
  });
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bindFormHandler);
else bindFormHandler();

/* ==== Initial load ==== */
window.addEventListener('load', () => {
  const saved = localStorage.getItem('cloudCrowdTickets');
  if (saved) tickets = JSON.parse(saved);
  ensureCaseNumbers();
  saveTicketsToStorage();
});

/* ==== expose helpers ==== */
window.goBack = goBack;
window.openModal = openModal;
