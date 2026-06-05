// =============================================================
// ADMIN — OSMIO Attestation Portal (role-based: supervisor + officer)
// =============================================================

const router = new Router();

let adminRole    = null; // 'supervisor' | 'officer'
let adminPersona = null; // supervisor or officer object
let selectedVerificationId = null;
let selectedRequestId      = null;
let reassignRequestId      = null;
let offScheduleView        = 'list'; // 'list' | 'calendar'
let supOfficerScheduleId   = null;
let supOfficerScheduleView = 'list'; // 'list' | 'calendar'
let currentSessionReqId    = null;
let sessionEnded           = false;
let sessionTimerInterval   = null;

// ── Helpers ────────────────────────────────────────────────────
function fmtSlot(date, time) {
  if (!date) return '—';
  const d = new Date(date + 'T' + (time || '00:00'));
  return d.toLocaleDateString('en-GB', { weekday:'short', day:'numeric', month:'short' }) + ' · ' + (time || '');
}
function fmtSlotLong(date, time) {
  if (!date) return '—';
  const d = new Date(date + 'T' + (time || '00:00'));
  return d.toLocaleDateString('en-GB', { weekday:'long', day:'numeric', month:'long', year:'numeric' }) + ' at ' + (time || '');
}
const US_FEDERAL_HOLIDAYS_2026 = [
  '2026-01-01','2026-01-19','2026-02-16','2026-05-25','2026-06-19',
  '2026-07-03','2026-09-07','2026-10-12','2026-11-11','2026-11-26','2026-12-25'
];
function isWeekend(dateStr) {
  const day = new Date(dateStr + 'T12:00').getDay(); // 0=Sun, 6=Sat
  return day === 0 || day === 6;
}
function isHoliday(dateStr) { return US_FEDERAL_HOLIDAYS_2026.includes(dateStr); }
function isDefaultBlocked(dateStr) { return isWeekend(dateStr) || isHoliday(dateStr); }

function officerAvailableForSlot(officerId, slotDate, slotTime) {
  const avail = MOCK.officerAvailability[officerId];
  if (!avail) return true;
  if (isDefaultBlocked(slotDate) && !(avail.openedDays && avail.openedDays.includes(slotDate))) return false;
  if (avail.daysOff && avail.daysOff.includes(slotDate)) return false;
  const key = slotDate + 'T' + slotTime;
  return !avail.blockedSlots.includes(key);
}
function officerSessionCount(officerId) {
  return MOCK.attestationRequests.filter(r => r.assignedOfficerId === officerId && (r.status === 'officer-assigned' || r.status === 'pending-acceptance')).length;
}
function officerEmailInbox(email) {
  return `email.html#${MOCK.emailPersonas.find(p=>p.email===email)?.id || ''}`;
}

// ── Shared sidebar — supervisor ────────────────────────────────
function supSidebar(active) {
  const p = adminPersona;
  const needsAssign = MOCK.attestationRequests.filter(r => r.status === 'slot-chosen').length;
  return `
  <aside class="admin-sidebar">
    <div class="admin-sidebar-logo">
      <div class="admin-sidebar-logo-icon">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
      </div>
      <div>
        <div class="admin-sidebar-logo-text">OSMIO</div>
        <div class="admin-sidebar-logo-sub">Supervisor Portal</div>
      </div>
    </div>
    <nav class="admin-nav">
      <div class="admin-nav-section-label">Scheduling</div>
      <button class="admin-nav-item ${active==='sup-dashboard'?'active':''}" onclick="router.go('sup-dashboard')">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
        Dashboard
      </button>
      <button class="admin-nav-item ${active==='sup-assign'?'active':''}" onclick="router.go('sup-assign')">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
        Assign Officers
        ${needsAssign > 0 ? `<span class="admin-nav-item-badge">${needsAssign}</span>` : ''}
      </button>
      <button class="admin-nav-item ${active==='sup-all-requests'?'active':''}" onclick="router.go('sup-all-requests')">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        All Requests
      </button>
      <button class="admin-nav-item ${active==='sup-officer-schedules'?'active':''}" onclick="router.go('sup-officer-schedules')">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01"/></svg>
        Officer Schedules
      </button>
      <div class="admin-nav-section-label">System</div>
      <button class="admin-nav-item" onclick="router.go('login')">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        Sign out
      </button>
    </nav>
    <div class="admin-sidebar-user">
      ${avatar(p.initials, p.avatarColor, 30)}
      <div class="admin-sidebar-user-info">
        <strong>${p.name}</strong>
        <span>${p.role}</span>
      </div>
    </div>
  </aside>`;
}

// ── Shared sidebar — officer ───────────────────────────────────
function offSidebar(active) {
  const p = adminPersona;
  const mySessions = MOCK.attestationRequests.filter(r => r.assignedOfficerId === p.id && r.status === 'officer-assigned');
  const today = new Date().toISOString().slice(0,10);
  const todayCount = mySessions.filter(r => r.slotDate === today).length;
  const needsAcceptance = MOCK.attestationRequests.filter(r => r.assignedOfficerId === p.id && r.status === 'pending-acceptance').length;
  return `
  <aside class="admin-sidebar">
    <div class="admin-sidebar-logo">
      <div class="admin-sidebar-logo-icon">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
      </div>
      <div>
        <div class="admin-sidebar-logo-text">OSMIO</div>
        <div class="admin-sidebar-logo-sub">Officer Portal</div>
      </div>
    </div>
    <nav class="admin-nav">
      <div class="admin-nav-section-label">My Work</div>
      <button class="admin-nav-item ${active==='off-dashboard'?'active':''}" onclick="router.go('off-dashboard')">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
        Dashboard
        ${needsAcceptance > 0 ? `<span class="admin-nav-item-badge" style="background:#f59e0b">${needsAcceptance}</span>` : todayCount > 0 ? `<span class="admin-nav-item-badge">${todayCount}</span>` : ''}
      </button>
      <button class="admin-nav-item ${active==='off-schedule'?'active':''}" onclick="router.go('off-schedule')">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        My Schedule
      </button>
      <button class="admin-nav-item ${active==='off-availability'?'active':''}" onclick="router.go('off-availability')">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        My Availability
      </button>
      <div class="admin-nav-section-label">System</div>
      <button class="admin-nav-item ${active==='verify-cert'?'active':''}" onclick="router.go('verify-cert')">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>
        Verify Certificate
      </button>
      <button class="admin-nav-item" onclick="router.go('login')">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        Sign out
      </button>
    </nav>
    <div class="admin-sidebar-user">
      ${avatar(p.initials, p.avatarColor, 30)}
      <div class="admin-sidebar-user-info">
        <strong>${p.name}</strong>
        <span>Attestation Officer</span>
      </div>
    </div>
  </aside>`;
}

// ── Screen: Login (role selection) ────────────────────────────
function renderLogin() {
  adminRole = null; adminPersona = null;
  document.getElementById('app').innerHTML = `
    <div class="admin-login-screen">
      <div class="admin-login-card" style="max-width:460px">
        <div class="admin-login-logo">
          <div class="admin-login-logo-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </div>
          <span class="admin-login-logo-text">OSMIO <span>Attestation Portal</span></span>
        </div>
        <h1>Sign In</h1>
        <p>Select your role to access the attestation portal.</p>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:24px">
          <button class="admin-role-btn" onclick="selectRole('supervisor')">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>
            <strong>Supervisor</strong>
            <span>Assign officers, manage queue</span>
          </button>
          <button class="admin-role-btn" onclick="selectRole('officer')">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            <strong>Attestation Officer</strong>
            <span>View schedule, set availability</span>
          </button>
        </div>

        <div style="margin-bottom:16px;padding:12px 14px;background:rgba(124,58,237,.05);border:1px solid rgba(124,58,237,.15);border-radius:10px;display:flex;align-items:center;justify-content:space-between;gap:8px">
          <div style="font-size:12.5px;color:#6b7280;line-height:1.5">Verifying a document as a <strong style="color:#374151">member of the public?</strong> No account needed.</div>
          <button onclick="router.go('public-verify')" style="background:#7c3aed;color:#fff;border:none;border-radius:8px;padding:7px 14px;font-size:12px;font-weight:700;cursor:pointer;white-space:nowrap;transition:background .15s ease" onmouseover="this.style.background='#8b5cf6'" onmouseout="this.style.background='#7c3aed'">Verify a Document →</button>
        </div>

        <div id="persona-section" class="hidden">
          <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.6px;color:#9ca3af;margin-bottom:10px">Select account <span style="font-weight:400;font-size:10px">(demo)</span></div>
          <div id="persona-list"></div>
          <button class="btn-admin-primary" style="width:100%;margin-top:16px" id="sign-in-btn" onclick="attemptLogin()" disabled>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            Sign in with Osmio ID Pair
          </button>
        </div>
      </div>
    </div>`;
}

function selectRole(role) {
  adminRole = role;
  document.querySelectorAll('.admin-role-btn').forEach(b => b.classList.remove('active'));
  event.currentTarget.classList.add('active');
  const section = document.getElementById('persona-section');
  if (section) section.classList.remove('hidden');
  const list = document.getElementById('persona-list');
  const items = role === 'supervisor' ? MOCK.supervisors : MOCK.attestationOfficers;
  if (list) {
    list.innerHTML = items.map(p => `
      <button class="admin-persona-btn" id="persona-${p.id}" onclick="selectPersona('${p.id}','${role}')">
        ${avatar(p.initials, p.avatarColor, 36)}
        <div style="text-align:left">
          <div style="font-size:13.5px;font-weight:700;color:#111827">${p.name}</div>
          <div style="font-size:11.5px;color:#6b7280">${p.role || 'Attestation Officer'}</div>
        </div>
      </button>`).join('');
  }
}

function selectPersona(id, role) {
  const items = role === 'supervisor' ? MOCK.supervisors : MOCK.attestationOfficers;
  adminPersona = items.find(p => p.id === id);
  document.querySelectorAll('.admin-persona-btn').forEach(b => b.classList.remove('active'));
  const el = document.getElementById('persona-' + id);
  if (el) el.classList.add('active');
  const btn = document.getElementById('sign-in-btn');
  if (btn) btn.disabled = false;
}

function attemptLogin() {
  if (!adminPersona) return;
  if (adminRole === 'supervisor') router.go('sup-dashboard');
  else router.go('off-dashboard');
}

// ══════════════════════════════════════════════════════════════
// SUPERVISOR SCREENS
// ══════════════════════════════════════════════════════════════

function renderSupDashboard() {
  if (!adminPersona) { router.go('login'); return; }
  const requests = MOCK.attestationRequests;
  const needsAssign       = requests.filter(r => r.status === 'slot-chosen').length;
  const pendingAcceptance = requests.filter(r => r.status === 'pending-acceptance').length;
  const confirmed         = requests.filter(r => r.status === 'officer-assigned').length;
  const needsNewSlot      = requests.filter(r => r.status === 'needs-new-slot').length;
  const completed         = requests.filter(r => r.status === 'completed').length;

  // Next 5 upcoming sessions (assigned or pending acceptance, sorted by date)
  const upcoming = requests
    .filter(r => (r.status === 'officer-assigned' || r.status === 'pending-acceptance') && r.slotDate)
    .sort((a,b) => (a.slotDate+a.slotTime) > (b.slotDate+b.slotTime) ? 1 : -1)
    .slice(0, 5);

  document.getElementById('app').innerHTML = `
  <div class="admin-layout">
    ${supSidebar('sup-dashboard')}
    <main class="admin-main">
      <div class="admin-page-header">
        <div>
          <div class="admin-page-title">Supervisor Dashboard</div>
          <div class="admin-page-sub">Welcome back, ${adminPersona.name.split(' ')[0]}</div>
        </div>
        <div style="font-size:12px;color:#9ca3af;font-weight:500">
          ${new Date().toLocaleDateString('en-US',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}
        </div>
      </div>

      <div class="admin-stats-row" style="grid-template-columns:repeat(5,1fr)">
        <div class="admin-stat-card pending" style="cursor:pointer" onclick="router.go('sup-assign')">
          <div class="admin-stat-label">Needs Officer</div>
          <div class="admin-stat-val">${needsAssign}</div>
          <div class="admin-stat-sub">Slot chosen · unassigned</div>
        </div>
        <div class="admin-stat-card" style="border-top:3px solid #f59e0b">
          <div class="admin-stat-label">Pending Acceptance</div>
          <div class="admin-stat-val" style="color:#d97706">${pendingAcceptance}</div>
          <div class="admin-stat-sub">Awaiting officer acceptance</div>
        </div>
        <div class="admin-stat-card approved">
          <div class="admin-stat-label">Confirmed</div>
          <div class="admin-stat-val">${confirmed}</div>
          <div class="admin-stat-sub">Officer accepted</div>
        </div>
        <div class="admin-stat-card" style="border-top:3px solid #f97316">
          <div class="admin-stat-label">Needs New Slot</div>
          <div class="admin-stat-val" style="color:#ea580c">${needsNewSlot}</div>
          <div class="admin-stat-sub">Awaiting user</div>
        </div>
        <div class="admin-stat-card rejected">
          <div class="admin-stat-label">Completed</div>
          <div class="admin-stat-val">${completed}</div>
          <div class="admin-stat-sub">Session done</div>
        </div>
      </div>

      ${needsAssign > 0 ? `
      <div class="admin-card" style="border-color:rgba(59,130,246,.3);margin-bottom:20px">
        <div class="admin-card-header" style="background:rgba(59,130,246,.04)">
          <div>
            <div class="admin-card-title">⚡ Action Required</div>
            <div style="font-size:12.5px;color:#6b7280;margin-top:2px">${needsAssign} request${needsAssign>1?'s':''} waiting for officer assignment</div>
          </div>
          <button class="btn-admin-primary" onclick="router.go('sup-assign')" style="padding:9px 18px;font-size:13px">Assign Officers →</button>
        </div>
      </div>` : ''}

      <div class="admin-card">
        <div class="admin-card-header">
          <div class="admin-card-title">Upcoming Sessions</div>
          <button class="btn-admin-outline" style="font-size:12px;padding:5px 12px" onclick="router.go('sup-all-requests')">View all →</button>
        </div>
        <div style="overflow-x:auto">
          <table class="admin-table">
            <thead><tr><th>User</th><th>Slot</th><th>Officer</th><th>Status</th><th>Ref</th></tr></thead>
            <tbody>
              ${upcoming.map(r => `
              <tr>
                <td><div class="admin-user-cell">${avatar(r.userInitials, r.userAvatarColor, 32)}<div><strong>${r.userName}</strong><span>${r.userEmail}</span></div></div></td>
                <td style="white-space:nowrap;font-size:13px"><strong>${fmtSlot(r.slotDate, r.slotTime)}</strong></td>
                <td><div class="admin-user-cell">${avatar(MOCK.attestationOfficers.find(o=>o.id===r.assignedOfficerId)?.initials||'??', MOCK.attestationOfficers.find(o=>o.id===r.assignedOfficerId)?.avatarColor||'#666', 28)}<strong style="font-size:13px">${r.assignedOfficerName}</strong></div></td>
                <td>${r.status === 'pending-acceptance' ? `<span class="admin-badge" style="background:#fef3c7;color:#92400e;border:1px solid #fde68a"><span class="admin-badge-dot" style="background:#f59e0b"></span>Pending Acceptance</span>` : `<span class="admin-badge approved"><span class="admin-badge-dot"></span>Confirmed</span>`}</td>
                <td style="font-family:monospace;font-size:12px;color:#6b7280">${r.refId}</td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <div class="admin-card">
        <div class="admin-card-header">
          <div class="admin-card-title">Officer Roster</div>
        </div>
        <div style="overflow-x:auto">
          <table class="admin-table">
            <thead><tr><th>Officer</th><th>Specialty</th><th>Active Sessions</th><th>Cert ID</th></tr></thead>
            <tbody>
              ${MOCK.attestationOfficers.map(o => `
              <tr>
                <td><div class="admin-user-cell">${avatar(o.initials, o.avatarColor, 32)}<div><strong>${o.name}</strong><span>${o.email}</span></div></div></td>
                <td><span class="admin-badge ${o.specialty==='Specialist'?'approved':'pending'}">${o.specialty}</span></td>
                <td style="font-size:14px;font-weight:700;color:#374151">${officerSessionCount(o.id)}</td>
                <td style="font-family:monospace;font-size:11.5px;color:#6b7280">${o.certId}</td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  </div>`;
}

// ── Supervisor: Assign Officers ────────────────────────────────
function renderSupAssign() {
  if (!adminPersona) { router.go('login'); return; }
  const pending = MOCK.attestationRequests.filter(r => r.status === 'slot-chosen');

  document.getElementById('app').innerHTML = `
  <div class="admin-layout">
    ${supSidebar('sup-assign')}
    <main class="admin-main">
      <div class="admin-page-header">
        <div>
          <div class="admin-page-title">Assign Officers</div>
          <div class="admin-page-sub">${pending.length} request${pending.length!==1?'s':''} awaiting assignment</div>
        </div>
      </div>

      ${pending.length === 0 ? `
      <div style="background:#fff;border-radius:14px;padding:48px;text-align:center;border:1px solid #e2e6ef">
        <div style="font-size:32px;margin-bottom:12px">✓</div>
        <div style="font-size:16px;font-weight:700;color:#111827">All requests assigned</div>
        <div style="font-size:14px;color:#6b7280;margin-top:6px">No pending officer assignments right now.</div>
      </div>` : pending.map(r => renderAssignCard(r)).join('')}
    </main>
  </div>`;
}

// ── Supervisor: Reassign Officer ───────────────────────────────
function startReassign(requestId) {
  reassignRequestId = requestId;
  router.go('sup-reassign');
}

function renderSupReassign() {
  if (!adminPersona) { router.go('login'); return; }
  const req = MOCK.attestationRequests.find(r => r.id === reassignRequestId);
  if (!req) { router.go('sup-all-requests'); return; }

  document.getElementById('app').innerHTML = `
  <div class="admin-layout">
    ${supSidebar('sup-all-requests')}
    <main class="admin-main">
      <div class="admin-page-header">
        <div style="display:flex;align-items:center;gap:14px">
          <button onclick="router.go('sup-all-requests')" class="btn-admin-outline" style="padding:7px 14px;font-size:12.5px;display:flex;align-items:center;gap:6px">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="15 18 9 12 15 6"/></svg> Back
          </button>
          <div>
            <div class="admin-page-title">Reassign Officer</div>
            <div class="admin-page-sub">${req.userName} · ${req.refId}</div>
          </div>
        </div>
      </div>
      ${renderAssignCard(req, true)}
    </main>
  </div>`;
}

// ── Supervisor: Notify user to select a new slot ───────────────
function notifyNewSlot(requestId) {
  const req = MOCK.attestationRequests.find(r => r.id === requestId);
  if (!req) return;

  const oldSlot = fmtSlotLong(req.slotDate, req.slotTime);

  req.status = 'needs-new-slot';
  req.slotDate = null;
  req.slotTime = null;
  req.assignedOfficerId = null;
  req.assignedOfficerName = null;
  req.assignedAt = null;

  if (!MOCK.emails[req.userEmail]) MOCK.emails[req.userEmail] = [];
  MOCK.emails[req.userEmail].unshift({
    id: 'email_nns_' + requestId,
    from: 'no-reply@osmio.id', fromName: 'OSMIO Attestation',
    to: req.userEmail,
    subject: 'Action Required: Please select a new attestation slot · ' + req.refId,
    date: new Date().toISOString(), read: false, tag: 'needs-new-slot',
    body: `<div style="font-family:Inter,Arial,sans-serif;max-width:580px;margin:0 auto">
<div style="background:#12121e;padding:20px 28px;border-radius:10px 10px 0 0;display:flex;align-items:center;gap:10px">
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00b4d8" stroke-width="2.5" stroke-linecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
  <span style="color:#fff;font-size:16px;font-weight:800">OSMIO</span>
  <span style="color:#6a8a99;font-size:12px;margin-left:4px">Attestation Service</span>
</div>
<div style="padding:28px;background:#fff;border:1px solid #e2e6ef;border-top:none">
  <div style="display:inline-block;background:#fee2e2;color:#dc2626;font-size:12px;font-weight:700;padding:4px 12px;border-radius:20px;margin-bottom:16px">Action Required</div>
  <h2 style="color:#111827;font-size:20px;margin:0 0 8px">Please select a new time slot for your session</h2>
  <p style="color:#374151;font-size:14px;line-height:1.6;margin:0 0 20px">Unfortunately, we were unable to accommodate your chosen time slot as no officers are available. Please log back in to your OSMIO vault and select a new available slot for your attestation session.</p>
  <div style="background:#f8f9fc;border:1px solid #e2e6ef;border-radius:8px;padding:20px;margin:0 0 20px">
    <div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#6b7280;margin-bottom:12px">Your Request</div>
    <table style="width:100%;border-collapse:collapse;font-size:14px">
      <tr><td style="color:#6b7280;padding:5px 0;width:160px">Reference ID</td><td style="color:#111827;font-family:monospace;font-weight:700;font-size:13px">${req.refId}</td></tr>
      <tr><td style="color:#6b7280;padding:5px 0">Previous Slot</td><td style="color:#dc2626;font-weight:600;text-decoration:line-through">${oldSlot}</td></tr>
      <tr><td style="color:#6b7280;padding:5px 0">Status</td><td><span style="background:#fee2e2;color:#dc2626;font-size:12px;font-weight:700;padding:2px 10px;border-radius:20px">Slot unavailable — new slot needed</span></td></tr>
    </table>
  </div>
  <p style="color:#6b7280;font-size:13px;line-height:1.6">Please return to your OSMIO vault and choose a new time slot at your earliest convenience. Your request and all submitted information remain on file.</p>
  <div style="text-align:center;margin:24px 0">
    <a href="moi.html#schedule-slot" style="background:#aa1945;color:#fff;padding:12px 28px;border-radius:8px;font-weight:700;font-size:14px;text-decoration:none;display:inline-block">Select New Slot →</a>
  </div>
</div>
<div style="background:#f0f2f7;padding:14px 28px;border-radius:0 0 10px 10px;text-align:center">
  <p style="color:#9ca3af;font-size:11px;margin:0">OSMIO Identity Authority · osmio.id</p>
</div>
</div>`
  });

  showToast(`${req.userName} has been asked to select a new slot.`);
  const hash = window.location.hash.slice(1);
  if (hash === 'sup-reassign') router.go('sup-all-requests');
  else renderSupAssign();
}

function renderAssignCard(r, isReassign = false) {
  const officers = MOCK.attestationOfficers.map(o => {
    const avail = officerAvailableForSlot(o.id, r.slotDate, r.slotTime);
    const sessions = officerSessionCount(o.id);
    return { ...o, avail, sessions };
  }).sort((a, b) => b.avail - a.avail);
  const noneAvailable = officers.every(o => !o.avail);
  return `
  <div class="admin-card" id="assign-card-${r.id}" style="margin-bottom:20px">
    <div class="admin-card-header">
      <div style="display:flex;align-items:center;gap:12px">
        ${avatar(r.userInitials, r.userAvatarColor, 40)}
        <div>
          <div class="admin-card-title" style="margin-bottom:2px">${r.userName}</div>
          <div style="font-size:12.5px;color:#6b7280">${r.userEmail} · <span style="font-family:monospace">${r.certId}</span></div>
        </div>
      </div>
      <div style="text-align:right">
        <div style="font-size:12px;color:#6b7280;margin-bottom:4px">Chosen slot</div>
        <div style="font-size:14px;font-weight:700;color:#111827">${fmtSlot(r.slotDate, r.slotTime)}</div>
        <div style="font-size:11.5px;color:#9ca3af;margin-top:2px;font-family:monospace">${r.refId}</div>
      </div>
    </div>
    ${r.assignedOfficerName ? `
    <div style="padding:10px 20px;background:#f8f9fc;border-bottom:1px solid #e2e6ef;display:flex;align-items:center;gap:8px;font-size:13px">
      <span style="color:#6b7280">Currently assigned to:</span>
      <strong style="color:#374151">${r.assignedOfficerName}</strong>
      <span style="font-size:11px;font-weight:700;padding:2px 8px;border-radius:99px;background:#fef3c7;color:#92400e;border:1px solid #fde68a">${r.status === 'officer-assigned' ? 'Confirmed' : 'Pending Acceptance'}</span>
    </div>` : ''}
    ${noneAvailable ? `
    <div style="padding:12px 20px;background:#fff7ed;border-bottom:1px solid #fed7aa;display:flex;align-items:center;gap:10px;flex-wrap:wrap">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ea580c" stroke-width="2.5" stroke-linecap="round" style="flex-shrink:0"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      <span style="font-size:13px;color:#c2410c;font-weight:600">No officers are available for this slot.</span>
      <span style="font-size:12.5px;color:#9a3412">You may still assign to an unavailable officer, or ask the user to pick a different time.</span>
    </div>` : ''}
    <div style="padding:16px 20px">
      <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#9ca3af;margin-bottom:12px">
        ${isReassign ? 'Select a new officer for this slot' : 'Select an available officer for this slot'}
      </div>
      <div class="admin-officer-grid" id="officer-grid-${r.id}">
        ${officers.map(o => `
        <button class="admin-officer-card ${o.avail ? '' : 'unavailable'}" id="ofcrd-${r.id}-${o.id}"
          onclick="pickOfficer('${r.id}','${o.id}')">
          ${avatar(o.initials, o.avatarColor, 36)}
          <div style="flex:1;text-align:left">
            <div style="font-size:13.5px;font-weight:700;color:${o.avail?'#111827':'#9ca3af'}">${o.name}</div>
            <div style="font-size:11.5px;color:${o.avail?'#6b7280':'#c4cad4'}">${o.sessions} active session${o.sessions!==1?'s':''}</div>
          </div>
          <div class="admin-officer-avail-badge ${o.avail ? 'yes' : 'no'}">
            ${o.avail ? '✓ Available' : '✗ Unavailable'}
          </div>
        </button>`).join('')}
      </div>
      <div style="margin-top:14px;display:flex;gap:10px;align-items:center;flex-wrap:wrap">
        <button class="btn-approve" id="assign-btn-${r.id}" onclick="confirmAssign('${r.id}')" disabled style="max-width:220px">
          ${isReassign ? 'Reassign Officer' : 'Assign Officer'}
        </button>
        <span id="assign-selected-${r.id}" style="font-size:13px;color:#6b7280"></span>
        <button onclick="notifyNewSlot('${r.id}')"
          style="margin-left:auto;background:none;border:1.5px solid #d1d5db;border-radius:8px;padding:7px 14px;font-size:12px;font-weight:600;color:#6b7280;cursor:pointer;display:flex;align-items:center;gap:6px;transition:all .15s"
          onmouseover="this.style.borderColor='#f97316';this.style.color='#c2410c'" onmouseout="this.style.borderColor='#d1d5db';this.style.color='#6b7280'">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
          Request new slot from user
        </button>
      </div>
    </div>
  </div>`;
}

let assignSelections = {}; // { requestId: officerId }

function pickOfficer(requestId, officerId) {
  assignSelections[requestId] = officerId;
  const grid = document.getElementById('officer-grid-' + requestId);
  if (grid) {
    grid.querySelectorAll('.admin-officer-card').forEach(c => c.classList.remove('selected'));
    const card = document.getElementById(`ofcrd-${requestId}-${officerId}`);
    if (card) card.classList.add('selected');
  }
  const btn = document.getElementById('assign-btn-' + requestId);
  if (btn) btn.disabled = false;
  const officer = MOCK.attestationOfficers.find(o => o.id === officerId);
  const lbl = document.getElementById('assign-selected-' + requestId);
  if (lbl && officer) lbl.textContent = `Selected: ${officer.name}`;
}

function confirmAssign(requestId) {
  const officerId = assignSelections[requestId];
  if (!officerId) return;
  const officer = MOCK.attestationOfficers.find(o => o.id === officerId);
  const req = MOCK.attestationRequests.find(r => r.id === requestId);
  if (!req || !officer) return;

  const btn = document.getElementById('assign-btn-' + requestId);
  if (btn) { btn.innerHTML = `${SPINNER_SVG} Assigning…`; btn.disabled = true; }

  setTimeout(() => {
    req.status = 'pending-acceptance';
    req.assignedOfficerId = officerId;
    req.assignedOfficerName = officer.name;
    req.assignedAt = new Date().toISOString();

    // Replace card with success state
    const card = document.getElementById('assign-card-' + requestId);
    if (card) {
      card.style.borderColor = '#f59e0b';
      card.innerHTML = `
        <div class="admin-card-header" style="background:rgba(245,158,11,.04)">
          <div style="display:flex;align-items:center;gap:12px">
            ${avatar(req.userInitials, req.userAvatarColor, 40)}
            <div>
              <div class="admin-card-title" style="margin-bottom:2px;color:#d97706">⏳ ${req.userName} — Awaiting officer acceptance</div>
              <div style="font-size:12.5px;color:#6b7280">${fmtSlot(req.slotDate, req.slotTime)} · <strong>${officer.name}</strong></div>
            </div>
          </div>
          <div style="display:flex;gap:8px;align-items:center">
            <a href="${officerEmailInbox(officer.email)}" class="btn-admin-outline" style="font-size:12px;padding:5px 12px;text-decoration:none">📧 Officer email</a>
          </div>
        </div>`;
    }
    // Update sidebar badge
    const badge = document.querySelector('.admin-nav-item-badge');
    const remaining = MOCK.attestationRequests.filter(r => r.status === 'slot-chosen').length;
    if (badge) { if (remaining > 0) badge.textContent = remaining; else badge.remove(); }
    showToast(`${officer.name} notified — awaiting their acceptance.`);
  }, 900);
}

// ── Supervisor: All Requests ───────────────────────────────────
function renderSupAllRequests() {
  if (!adminPersona) { router.go('login'); return; }
  const all = MOCK.attestationRequests;
  const statusLabel = { 'slot-chosen':'Slot Chosen','pending-acceptance':'Pending Acceptance','officer-assigned':'Confirmed','needs-new-slot':'Needs New Slot','completed':'Completed' };
  const statusClass = { 'slot-chosen':'pending','pending-acceptance':'pending','officer-assigned':'approved','needs-new-slot':'pending','completed':'total' };

  document.getElementById('app').innerHTML = `
  <div class="admin-layout">
    ${supSidebar('sup-all-requests')}
    <main class="admin-main">
      <div class="admin-page-header">
        <div class="admin-page-title">All Attestation Requests</div>
        <div style="font-size:13px;color:#9ca3af">${all.length} total</div>
      </div>
      <div class="admin-card">
        <div style="overflow-x:auto">
          <table class="admin-table">
            <thead><tr><th>User</th><th>Submitted</th><th>Slot</th><th>Officer</th><th>Status</th><th>Ref</th><th>Actions</th></tr></thead>
            <tbody>
              ${all.map(r => `
              <tr>
                <td><div class="admin-user-cell">${avatar(r.userInitials, r.userAvatarColor, 32)}<div><strong>${r.userName}</strong><span>${r.userEmail}</span></div></div></td>
                <td style="font-size:13px;color:#6b7280">${formatDate(r.submittedDate)}</td>
                <td style="font-size:13px;white-space:nowrap">${r.slotDate ? fmtSlot(r.slotDate, r.slotTime) : '<span style="color:#c4cad4">—</span>'}</td>
                <td style="font-size:13px">${r.assignedOfficerName || '<span style="color:#c4cad4">—</span>'}</td>
                <td>${r.status === 'pending-acceptance' ? `<span class="admin-badge" style="background:#fef3c7;color:#92400e;border:1px solid #fde68a"><span class="admin-badge-dot" style="background:#f59e0b"></span>Pending Acceptance</span>` : r.status === 'needs-new-slot' ? `<span class="admin-badge" style="background:#fff7ed;color:#c2410c;border:1px solid #fed7aa"><span class="admin-badge-dot" style="background:#f97316"></span>Needs New Slot</span>` : `<span class="admin-badge ${statusClass[r.status]}"><span class="admin-badge-dot"></span>${statusLabel[r.status]}</span>`}</td>
                <td style="font-family:monospace;font-size:11.5px;color:#9ca3af">${r.refId}</td>
                <td style="white-space:nowrap">
                  ${r.status === 'pending-acceptance' || r.status === 'officer-assigned' ? `
                    <button onclick="startReassign('${r.id}')" class="btn-admin-outline" style="font-size:11.5px;padding:4px 10px">Reassign</button>` :
                  r.status === 'slot-chosen' ? `
                    <button onclick="notifyNewSlot('${r.id}')" class="btn-admin-outline" style="font-size:11.5px;padding:4px 10px;color:#c2410c;border-color:#fca5a5" title="Ask user to pick a different time slot">New Slot</button>` :
                  r.status === 'needs-new-slot' ? `<span style="font-size:12px;color:#9ca3af">Awaiting user</span>` : `<span style="color:#d1d5db">—</span>`}
                </td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  </div>`;
}

// ── Supervisor: Officer Schedules ─────────────────────────────
function renderSupOfficerSchedules() {
  if (!adminPersona) { router.go('login'); return; }

  document.getElementById('app').innerHTML = `
  <div class="admin-layout">
    ${supSidebar('sup-officer-schedules')}
    <main class="admin-main">
      <div class="admin-page-header">
        <div>
          <div class="admin-page-title">Officer Schedules</div>
          <div class="admin-page-sub">View sessions and availability for all attestation officers</div>
        </div>
      </div>

      <div class="admin-card" style="margin-bottom:20px">
        <div class="admin-card-header"><div class="admin-card-title">Officers</div></div>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:12px;padding:16px 20px">
          ${MOCK.attestationOfficers.map(o => {
            const sessions = officerSessionCount(o.id);
            const avail = MOCK.officerAvailability[o.id] || { blockedSlots:[], daysOff:[], openedDays:[] };
            const daysOff = (avail.daysOff || []).length;
            const selected = supOfficerScheduleId === o.id;
            return `
            <button onclick="selectSupOfficer('${o.id}')"
              style="display:flex;align-items:center;gap:10px;padding:12px 14px;border:1.5px solid ${selected?'#7c3aed':'#e2e6ef'};border-radius:12px;background:${selected?'rgba(124,58,237,.06)':'#fff'};cursor:pointer;text-align:left;transition:all .15s;width:100%"
              onmouseover="if('${o.id}'!=='${supOfficerScheduleId}')this.style.borderColor='#c4b5f8'" onmouseout="if('${o.id}'!=='${supOfficerScheduleId}')this.style.borderColor='#e2e6ef'">
              ${avatar(o.initials, o.avatarColor, 36)}
              <div style="flex:1;min-width:0">
                <div style="font-size:13.5px;font-weight:700;color:#111827;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${o.name}</div>
                <div style="font-size:11.5px;color:#6b7280">${o.specialty}</div>
                <div style="font-size:11.5px;margin-top:3px;font-weight:600;color:${sessions>0?'#7c3aed':'#9ca3af'}">${sessions} active session${sessions!==1?'s':''}${daysOff>0?` · ${daysOff} day${daysOff!==1?'s':''} off`:''}</div>
              </div>
              ${selected ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" stroke-width="2.5" stroke-linecap="round" style="flex-shrink:0"><polyline points="20 6 9 17 4 12"/></svg>` : ''}
            </button>`;
          }).join('')}
        </div>
      </div>

      ${supOfficerScheduleId ? renderSupOfficerScheduleDetail() : `
      <div class="admin-card">
        <div style="padding:40px;text-align:center;color:#9ca3af">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" style="margin:0 auto 12px;display:block"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          Select an officer above to view their schedule
        </div>
      </div>`}
    </main>
  </div>`;
}

function selectSupOfficer(officerId) {
  supOfficerScheduleId = supOfficerScheduleId === officerId ? null : officerId;
  supOfficerScheduleView = 'list';
  renderSupOfficerSchedules();
}

function setSupOfficerView(v) {
  supOfficerScheduleView = v;
  renderSupOfficerSchedules();
}

function renderSupOfficerScheduleDetail() {
  const officer = MOCK.attestationOfficers.find(o => o.id === supOfficerScheduleId);
  if (!officer) return '';

  const sessions = MOCK.attestationRequests
    .filter(r => r.assignedOfficerId === officer.id)
    .sort((a,b) => (a.slotDate+a.slotTime)>(b.slotDate+b.slotTime)?1:-1);

  const sessionsByDay = {};
  sessions.forEach(r => {
    if (!r.slotDate) return;
    if (!sessionsByDay[r.slotDate]) sessionsByDay[r.slotDate] = [];
    sessionsByDay[r.slotDate].push(r);
  });

  const avail = MOCK.officerAvailability[officer.id] || { blockedSlots:[], daysOff:[], openedDays:[] };
  const confirmed  = sessions.filter(r => r.status === 'officer-assigned').length;
  const pending    = sessions.filter(r => r.status === 'pending-acceptance').length;
  const completed  = sessions.filter(r => r.status === 'completed').length;

  return `
  <div class="admin-card" style="margin-bottom:16px">
    <div class="admin-card-header">
      <div style="display:flex;align-items:center;gap:12px">
        ${avatar(officer.initials, officer.avatarColor, 40)}
        <div>
          <div class="admin-card-title" style="margin-bottom:2px">${officer.name}</div>
          <div style="font-size:12.5px;color:#6b7280">${officer.email} · <span style="font-family:monospace;font-size:11.5px">${officer.certId}</span></div>
          <div style="display:flex;gap:10px;margin-top:6px">
            <span style="font-size:12px;color:#374151"><strong style="color:#059669">${confirmed}</strong> confirmed</span>
            <span style="font-size:12px;color:#374151"><strong style="color:#d97706">${pending}</strong> pending</span>
            <span style="font-size:12px;color:#374151"><strong style="color:#6b7280">${completed}</strong> completed</span>
            ${(avail.daysOff||[]).length>0?`<span style="font-size:12px;color:#374151"><strong style="color:#dc2626">${avail.daysOff.length}</strong> day${avail.daysOff.length!==1?'s':''} off</span>`:''}
          </div>
        </div>
      </div>
      <div style="display:flex;gap:8px;align-items:center;flex-shrink:0">
        <a href="${officerEmailInbox(officer.email)}" class="btn-admin-outline" style="font-size:12px;padding:5px 12px;text-decoration:none;display:inline-flex;align-items:center;gap:5px">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
          Email
        </a>
        <button class="admin-filter-tab ${supOfficerScheduleView==='list'?'active':''}" onclick="setSupOfficerView('list')">List</button>
        <button class="admin-filter-tab ${supOfficerScheduleView==='calendar'?'active':''}" onclick="setSupOfficerView('calendar')">Calendar</button>
      </div>
    </div>
  </div>
  ${supOfficerScheduleView === 'calendar' ? renderOffCalendar(sessionsByDay) : renderOffList(sessions)}`;
}

// ══════════════════════════════════════════════════════════════
// OFFICER SCREENS
// ══════════════════════════════════════════════════════════════

function renderOffDashboard() {
  if (!adminPersona) { router.go('login'); return; }
  const pendingAcceptanceReqs = MOCK.attestationRequests.filter(r => r.assignedOfficerId === adminPersona.id && r.status === 'pending-acceptance');
  const myReqs = MOCK.attestationRequests.filter(r => r.assignedOfficerId === adminPersona.id && r.status === 'officer-assigned');
  const today = '2026-04-24'; // demo fixed date
  const todayReqs = myReqs.filter(r => r.slotDate === today);
  const upcoming  = myReqs.filter(r => r.slotDate > today).sort((a,b) => (a.slotDate+a.slotTime)>(b.slotDate+b.slotTime)?1:-1);
  const completed = MOCK.attestationRequests.filter(r => r.assignedOfficerId === adminPersona.id && r.status === 'completed');

  document.getElementById('app').innerHTML = `
  <div class="admin-layout">
    ${offSidebar('off-dashboard')}
    <main class="admin-main">
      <div class="admin-page-header">
        <div>
          <div class="admin-page-title">My Dashboard</div>
          <div class="admin-page-sub">Welcome back, ${adminPersona.name.split(' ')[0]}</div>
        </div>
        <div style="font-size:12px;color:#9ca3af;font-weight:500">
          ${new Date().toLocaleDateString('en-US',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}
        </div>
      </div>

      <div class="admin-stats-row" style="grid-template-columns:repeat(4,1fr)">
        <div class="admin-stat-card" style="border-top:3px solid #f59e0b">
          <div class="admin-stat-label">Awaiting Acceptance</div>
          <div class="admin-stat-val" style="color:#d97706">${pendingAcceptanceReqs.length}</div>
          <div class="admin-stat-sub">Action required</div>
        </div>
        <div class="admin-stat-card pending">
          <div class="admin-stat-label">Today's Sessions</div>
          <div class="admin-stat-val">${todayReqs.length}</div>
          <div class="admin-stat-sub">Scheduled today</div>
        </div>
        <div class="admin-stat-card approved">
          <div class="admin-stat-label">Upcoming</div>
          <div class="admin-stat-val">${upcoming.length}</div>
          <div class="admin-stat-sub">Future sessions</div>
        </div>
        <div class="admin-stat-card total">
          <div class="admin-stat-label">Completed</div>
          <div class="admin-stat-val">${completed.length}</div>
          <div class="admin-stat-sub">All time</div>
        </div>
      </div>

      ${pendingAcceptanceReqs.length > 0 ? `
      <div class="admin-card" style="border-color:rgba(245,158,11,.4);margin-bottom:20px">
        <div class="admin-card-header" style="background:rgba(245,158,11,.04)">
          <div>
            <div class="admin-card-title" style="color:#d97706">⚠ Action Required — Sessions Pending Your Acceptance</div>
            <div style="font-size:12.5px;color:#6b7280;margin-top:2px">Accept or decline each session. Users will only be notified after you accept.</div>
          </div>
        </div>
        ${pendingAcceptanceReqs.map(r => offPendingAcceptanceRow(r)).join('')}
      </div>` : ''}

      ${todayReqs.length > 0 ? `
      <div class="admin-card" style="border-color:rgba(59,130,246,.3);margin-bottom:20px">
        <div class="admin-card-header"><div class="admin-card-title">Today's Sessions</div></div>
        ${todayReqs.map(r => offSessionRow(r, true)).join('')}
      </div>` : `
      <div class="admin-card" style="margin-bottom:20px">
        <div style="padding:32px;text-align:center;color:#9ca3af">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" style="margin:0 auto 12px;display:block"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          No sessions scheduled for today
        </div>
      </div>`}

      <div class="admin-card">
        <div class="admin-card-header">
          <div class="admin-card-title">Upcoming Sessions</div>
          <button class="btn-admin-outline" onclick="router.go('off-schedule')" style="font-size:12px;padding:5px 12px">Full Schedule →</button>
        </div>
        ${upcoming.slice(0,5).map(r => offSessionRow(r, false)).join('')}
        ${upcoming.length === 0 ? `<div style="padding:24px;text-align:center;color:#9ca3af;font-size:13.5px">No upcoming sessions</div>` : ''}
      </div>
    </main>
  </div>`;
}

function offPendingAcceptanceRow(r) {
  return `
  <div style="display:flex;align-items:center;gap:14px;padding:14px 20px;border-bottom:1px solid #fde68a;flex-wrap:wrap;background:rgba(255,251,235,.5)">
    ${avatar(r.userInitials, r.userAvatarColor, 38)}
    <div style="flex:1;min-width:160px">
      <div style="font-size:14px;font-weight:700;color:#111827">${r.userName}</div>
      <div style="font-size:12px;color:#6b7280;margin-top:2px">${r.userEmail}</div>
    </div>
    <div style="text-align:right;margin-right:8px">
      <div style="font-size:13px;font-weight:600;color:#374151">${fmtSlot(r.slotDate, r.slotTime)}</div>
      <div style="font-size:11px;color:#9ca3af;margin-top:2px;font-family:monospace">${r.refId}</div>
    </div>
    <div style="display:flex;gap:8px">
      <button class="btn-approve" style="padding:7px 14px;font-size:12px;border-radius:8px" onclick="acceptSession('${r.id}')">Accept Session</button>
      <button class="btn-admin-outline" style="padding:7px 14px;font-size:12px;border-radius:8px;color:#dc2626;border-color:#fca5a5" onclick="declineSession('${r.id}')">Decline</button>
    </div>
  </div>`;
}

function offSessionRow(r, showLink) {
  return `
  <div style="display:flex;align-items:center;gap:14px;padding:14px 20px;border-bottom:1px solid #e2e6ef;flex-wrap:wrap">
    ${avatar(r.userInitials, r.userAvatarColor, 38)}
    <div style="flex:1;min-width:160px">
      <div style="font-size:14px;font-weight:700;color:#111827">${r.userName}</div>
      <div style="font-size:12px;color:#6b7280;margin-top:2px">${r.userEmail}</div>
    </div>
    <div style="text-align:right;margin-right:8px">
      <div style="font-size:13px;font-weight:600;color:#374151">${fmtSlot(r.slotDate, r.slotTime)}</div>
      <div style="font-size:11px;color:#9ca3af;margin-top:2px;font-family:monospace">${r.refId}</div>
    </div>
    ${showLink ? `
    <button class="btn-approve" style="padding:7px 14px;font-size:12px;border-radius:8px" onclick="joinSession('${r.id}')">Complete Session →</button>` : ''}
  </div>`;
}

function acceptSession(requestId) {
  const req = MOCK.attestationRequests.find(r => r.id === requestId);
  if (!req) return;

  req.status = 'officer-assigned';
  req.acceptedAt = new Date().toISOString();

  // Push confirmation email to user inbox
  if (!MOCK.emails[req.userEmail]) MOCK.emails[req.userEmail] = [];
  const officerObj = MOCK.attestationOfficers.find(o => o.id === req.assignedOfficerId);
  const slotLong = fmtSlotLong(req.slotDate, req.slotTime);
  MOCK.emails[req.userEmail].unshift({
    id: 'email_dyn_' + requestId,
    from: 'no-reply@osmio.id', fromName: 'OSMIO Attestation',
    to: req.userEmail,
    subject: `Session Confirmed — ${req.assignedOfficerName} · ${fmtSlot(req.slotDate, req.slotTime)}`,
    date: new Date().toISOString(), read: false, tag: 'officer-assigned',
    body: `<div style="font-family:Inter,Arial,sans-serif;max-width:580px;margin:0 auto">
<div style="background:#12121e;padding:20px 28px;border-radius:10px 10px 0 0;display:flex;align-items:center;gap:10px">
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00b4d8" stroke-width="2.5" stroke-linecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
  <span style="color:#fff;font-size:16px;font-weight:800">OSMIO</span>
  <span style="color:#6a8a99;font-size:12px;margin-left:4px">Attestation Service</span>
</div>
<div style="padding:28px;background:#fff;border:1px solid #e2e6ef;border-top:none">
  <div style="display:inline-block;background:#dcfce7;color:#16a34a;font-size:12px;font-weight:700;padding:4px 12px;border-radius:20px;margin-bottom:16px">✓ Session Confirmed</div>
  <h2 style="color:#111827;font-size:20px;margin:0 0 8px">Your attestation session is confirmed</h2>
  <p style="color:#374151;font-size:14px;line-height:1.6;margin:0 0 20px">Your assigned officer has accepted the session. Your session details are below.</p>
  <div style="background:#f8f9fc;border:1px solid #e2e6ef;border-radius:8px;padding:20px;margin:0 0 20px">
    <div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#6b7280;margin-bottom:12px">Confirmed Session</div>
    <table style="width:100%;border-collapse:collapse;font-size:14px">
      <tr><td style="color:#6b7280;padding:5px 0;width:140px">Attestation Officer</td><td style="color:#111827;font-weight:700">${req.assignedOfficerName}</td></tr>
      <tr><td style="color:#6b7280;padding:5px 0">Date &amp; Time</td><td style="color:#111827;font-weight:600">${slotLong}</td></tr>
      <tr><td style="color:#6b7280;padding:5px 0">Duration</td><td style="color:#111827;font-weight:600">30 minutes (via SIGNiX)</td></tr>
      <tr><td style="color:#6b7280;padding:5px 0">Session</td><td style="color:#111827;font-weight:600">SIGNiX link provided separately</td></tr>
      <tr><td style="color:#6b7280;padding:5px 0">Reference</td><td style="color:#111827;font-family:monospace;font-size:13px">${req.refId}</td></tr>
    </table>
  </div>
  <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px 18px;margin:0 0 16px">
    <div style="font-size:13px;font-weight:700;color:#15803d;margin-bottom:6px">What happens next</div>
    <p style="color:#374151;font-size:13.5px;line-height:1.6;margin:0">You will receive a <strong>separate invitation email directly from SIGNiX</strong> with your session link. Please follow the instructions in that email to join at the scheduled time.</p>
  </div>
  <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:14px 18px;margin:0 0 16px">
    <div style="font-size:13px;font-weight:700;color:#92400e;margin-bottom:4px">Didn't receive the SIGNiX invitation?</div>
    <p style="color:#78350f;font-size:13px;line-height:1.6;margin:0">Check your spam folder first. If it's still missing closer to your session time, reply to this email or contact <a href="mailto:support@osmio.id" style="color:#92400e;font-weight:600">support@osmio.id</a> with your reference number and we'll resend it.</p>
  </div>
</div>
<div style="background:#f0f2f7;padding:14px 28px;border-radius:0 0 10px 10px;text-align:center">
  <p style="color:#9ca3af;font-size:11px;margin:0">OSMIO Identity Authority · osmio.id</p>
</div>
</div>`
  });

  showToast(`Session accepted — confirmation sent to ${req.userName}.`);
  renderOffDashboard();
}

function declineSession(requestId) {
  const req = MOCK.attestationRequests.find(r => r.id === requestId);
  if (!req) return;
  req.status = 'slot-chosen';
  req.assignedOfficerId = null;
  req.assignedOfficerName = null;
  req.assignedAt = null;
  showToast('Session declined — returned to unassigned queue.');
  renderOffDashboard();
}

// ── Officer: My Schedule ───────────────────────────────────────
function renderOffSchedule() {
  if (!adminPersona) { router.go('login'); return; }
  const myReqs = MOCK.attestationRequests
    .filter(r => r.assignedOfficerId === adminPersona.id)
    .sort((a,b) => (a.slotDate+a.slotTime)>(b.slotDate+b.slotTime)?1:-1);

  const days = ['2026-04-22','2026-04-23','2026-04-24','2026-04-28','2026-04-29','2026-04-30','2026-05-01','2026-05-05','2026-05-06','2026-05-07','2026-05-08'];

  const sessionsByDay = {};
  myReqs.forEach(r => {
    if (!r.slotDate) return;
    if (!sessionsByDay[r.slotDate]) sessionsByDay[r.slotDate] = [];
    sessionsByDay[r.slotDate].push(r);
  });

  document.getElementById('app').innerHTML = `
  <div class="admin-layout">
    ${offSidebar('off-schedule')}
    <main class="admin-main">
      <div class="admin-page-header">
        <div class="admin-page-title">My Schedule</div>
        <div style="display:flex;gap:6px">
          <button class="admin-filter-tab ${offScheduleView==='list'?'active':''}" onclick="setOffView('list')">List</button>
          <button class="admin-filter-tab ${offScheduleView==='calendar'?'active':''}" onclick="setOffView('calendar')">Calendar</button>
        </div>
      </div>

      ${offScheduleView === 'calendar' ? renderOffCalendar(sessionsByDay) : renderOffList(myReqs)}
    </main>
  </div>`;
}

function setOffView(v) {
  offScheduleView = v;
  renderOffSchedule();
}

function renderOffList(sessions) {
  if (sessions.length === 0) return `<div class="admin-card"><div style="padding:40px;text-align:center;color:#9ca3af">No sessions assigned yet.</div></div>`;
  const statusBadge = s => s === 'completed' ? `<span class="admin-badge approved">Completed</span>` : s === 'officer-assigned' ? `<span class="admin-badge pending">Confirmed</span>` : s === 'pending-acceptance' ? `<span class="admin-badge" style="background:#fef3c7;color:#92400e;border:1px solid #fde68a">Pending Acceptance</span>` : '';
  return `
  <div class="admin-card">
    <div style="overflow-x:auto">
      <table class="admin-table">
        <thead><tr><th>User</th><th>Date &amp; Time</th><th>Status</th><th>Ref</th></tr></thead>
        <tbody>
          ${sessions.map(r => `
          <tr>
            <td><div class="admin-user-cell">${avatar(r.userInitials, r.userAvatarColor, 32)}<div><strong>${r.userName}</strong><span>${r.userEmail}</span></div></div></td>
            <td style="white-space:nowrap;font-size:13px;font-weight:600">${fmtSlot(r.slotDate, r.slotTime)}</td>
            <td>${statusBadge(r.status)}</td>
            <td style="font-family:monospace;font-size:11.5px;color:#9ca3af">${r.refId}</td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>
  </div>`;
}

function renderOffCalendar(sessionsByDay) {
  const weeks = [
    { label:'Week of Apr 20', days:['2026-04-20','2026-04-21','2026-04-22','2026-04-23','2026-04-24','2026-04-25','2026-04-26'] },
    { label:'Week of Apr 27', days:['2026-04-27','2026-04-28','2026-04-29','2026-04-30','2026-05-01','2026-05-02','2026-05-03'] },
    { label:'Week of May 4',  days:['2026-05-04','2026-05-05','2026-05-06','2026-05-07','2026-05-08','2026-05-09','2026-05-10'] },
  ];
  return weeks.map(w => `
  <div class="admin-card" style="margin-bottom:16px">
    <div class="admin-card-header"><div class="admin-card-title">${w.label}</div></div>
    <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:0;overflow-x:auto">
      ${w.days.map(day => {
        const sessions = sessionsByDay[day] || [];
        const dayLabel = new Date(day+'T12:00').toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'short'});
        const blocked = isDefaultBlocked(day);
        return `
        <div style="border-right:1px solid #e2e6ef;padding:12px;min-height:80px;${blocked?'background:#f9fafb;':''}">
          <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.4px;color:${blocked?'#d1d5db':'#9ca3af'};margin-bottom:8px">${dayLabel}${isHoliday(day)?'<div style="font-size:9px;color:#f59e0b;font-weight:600;text-transform:none;letter-spacing:0">Holiday</div>':''}</div>
          ${sessions.map(r => `
          <div style="background:${r.status==='completed'?'rgba(16,185,129,.1)':'rgba(59,130,246,.1)'};border:1px solid ${r.status==='completed'?'rgba(16,185,129,.2)':'rgba(59,130,246,.2)'};border-radius:6px;padding:6px 8px;margin-bottom:6px;font-size:11.5px">
            <div style="font-weight:700;color:#111827">${r.userName}</div>
            <div style="color:#6b7280">${r.slotTime}</div>
          </div>`).join('')}
          ${sessions.length === 0 ? `<div style="font-size:11px;color:${blocked?'#e5e7eb':'#d1d5db'};text-align:center;padding-top:8px">${blocked?'Closed':'—'}</div>` : ''}
        </div>`;
      }).join('')}
    </div>
  </div>`).join('');
}

// ── Officer: Availability ──────────────────────────────────────
function renderOffAvailability() {
  if (!adminPersona) { router.go('login'); return; }
  const avail = MOCK.officerAvailability[adminPersona.id] || { blockedSlots: [], daysOff: [], openedDays: [] };
  if (!avail.openedDays) avail.openedDays = [];
  const times = ['09:00','09:30','10:00','10:30','11:00','11:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30'];
  const weeks = [
    { label:'Week of Apr 27', days:[
      {d:'2026-04-27',lbl:'Mon 27'},{d:'2026-04-28',lbl:'Tue 28'},{d:'2026-04-29',lbl:'Wed 29'},{d:'2026-04-30',lbl:'Thu 30'},{d:'2026-05-01',lbl:'Fri 1'},
      {d:'2026-05-02',lbl:'Sat 2'},{d:'2026-05-03',lbl:'Sun 3'}
    ]},
    { label:'Week of May 4', days:[
      {d:'2026-05-04',lbl:'Mon 4'},{d:'2026-05-05',lbl:'Tue 5'},{d:'2026-05-06',lbl:'Wed 6'},{d:'2026-05-07',lbl:'Thu 7'},{d:'2026-05-08',lbl:'Fri 8'},
      {d:'2026-05-09',lbl:'Sat 9'},{d:'2026-05-10',lbl:'Sun 10'}
    ]},
  ];

  document.getElementById('app').innerHTML = `
  <div class="admin-layout">
    ${offSidebar('off-availability')}
    <main class="admin-main">
      <div class="admin-page-header">
        <div>
          <div class="admin-page-title">My Availability</div>
          <div class="admin-page-sub">Toggle slots to mark yourself unavailable. Weekends and holidays are closed by default — click "Open for work" to enable them.</div>
        </div>
        <button class="btn-approve" onclick="saveAvailability()" style="padding:9px 20px;font-size:13px">Save Changes</button>
      </div>

      ${weeks.map(w => `
      <div class="admin-card" style="margin-bottom:16px">
        <div class="admin-card-header"><div class="admin-card-title">${w.label}</div></div>
        <div style="padding:16px 20px;overflow-x:auto">
          <div style="display:grid;grid-template-columns:70px repeat(7,1fr);gap:4px;min-width:700px">
            <div></div>
            ${w.days.map(dy => {
              const defaultBlocked = isDefaultBlocked(dy.d);
              const opened = avail.openedDays.includes(dy.d);
              const dayOff = avail.daysOff && avail.daysOff.includes(dy.d);
              const isActive = !defaultBlocked || opened;
              return `<div style="text-align:center">
                <div style="font-size:11px;font-weight:700;text-transform:uppercase;color:${defaultBlocked?'#d1d5db':'#9ca3af'};margin-bottom:4px">${dy.lbl}${isHoliday(dy.d)?'<div style="font-size:9px;color:#f59e0b;font-weight:600;text-transform:none;letter-spacing:0;margin-bottom:2px">Holiday</div>':''}</div>
                ${defaultBlocked && !opened
                  ? `<button class="admin-dayoff-btn" style="background:#f1f5f9;color:#94a3b8;border-color:#e2e8f0;font-size:10px" onclick="toggleOpenDay('${dy.d}',this)">Open for work</button>`
                  : defaultBlocked && opened
                    ? `<button class="admin-dayoff-btn" style="background:#ede9fe;color:#7c3aed;border-color:#ddd6fe;font-size:10px" onclick="toggleOpenDay('${dy.d}',this)">Opened ✓</button>`
                    : `<button class="admin-dayoff-btn ${dayOff?'off':''}" onclick="toggleDayOff('${dy.d}',this)" title="Mark full day off">${dayOff ? '✗ Day off' : 'Full day'}</button>`
                }
              </div>`;
            }).join('')}
            ${times.map(t => `
              <div style="font-size:11.5px;font-weight:600;color:#9ca3af;display:flex;align-items:center;padding-right:8px">${t}</div>
              ${w.days.map(dy => {
                const defaultBlocked = isDefaultBlocked(dy.d);
                const opened = avail.openedDays.includes(dy.d);
                const isActive = !defaultBlocked || opened;
                const key = dy.d + 'T' + t;
                const blocked = avail.blockedSlots && avail.blockedSlots.includes(key);
                const dayOff = avail.daysOff && avail.daysOff.includes(dy.d);
                if (!isActive) {
                  return `<div><button class="admin-avail-slot blocked" style="background:#f1f5f9;border-color:#e2e8f0;color:#d1d5db;cursor:default" disabled>—</button></div>`;
                }
                return `<div>
                  <button class="admin-avail-slot ${blocked||dayOff?'blocked':''}" data-key="${key}" onclick="toggleSlot('${key}',this)" ${dayOff?'disabled':''}>
                    ${blocked || dayOff ? '✗' : '✓'}
                  </button>
                </div>`;
              }).join('')}`).join('')}
          </div>
        </div>
      </div>`).join('')}

      <div style="background:#fff;border-radius:12px;padding:16px 20px;border:1px solid #e2e6ef;display:flex;align-items:center;gap:14px;flex-wrap:wrap">
        <div style="display:flex;gap:16px;font-size:12.5px;color:#6b7280;flex-wrap:wrap">
          <span><span style="display:inline-block;width:12px;height:12px;border-radius:3px;background:#dcfce7;border:1px solid #86efac;margin-right:5px"></span>Available</span>
          <span><span style="display:inline-block;width:12px;height:12px;border-radius:3px;background:#fee2e2;border:1px solid #fca5a5;margin-right:5px"></span>Blocked / Day off</span>
          <span><span style="display:inline-block;width:12px;height:12px;border-radius:3px;background:#f1f5f9;border:1px solid #e2e8f0;margin-right:5px"></span>Closed (weekend / holiday)</span>
        </div>
        <div style="margin-left:auto">
          <a href="${officerEmailInbox(adminPersona.email)}" class="btn-admin-outline" style="font-size:12px;padding:5px 12px;text-decoration:none">📧 View email confirmation</a>
        </div>
      </div>
    </main>
  </div>`;
}

function toggleSlot(key, btn) {
  const avail = MOCK.officerAvailability[adminPersona.id];
  if (!avail) return;
  const idx = avail.blockedSlots.indexOf(key);
  if (idx >= 0) {
    avail.blockedSlots.splice(idx, 1);
    btn.classList.remove('blocked');
    btn.textContent = '✓';
  } else {
    avail.blockedSlots.push(key);
    btn.classList.add('blocked');
    btn.textContent = '✗';
  }
}

function toggleDayOff(date, btn) {
  const avail = MOCK.officerAvailability[adminPersona.id];
  if (!avail) return;
  const idx = avail.daysOff.indexOf(date);
  if (idx >= 0) {
    avail.daysOff.splice(idx, 1);
    btn.classList.remove('off');
    btn.textContent = 'Full day';
  } else {
    avail.daysOff.push(date);
    btn.classList.add('off');
    btn.textContent = '✗ Day off';
  }
  renderOffAvailability();
}

function toggleOpenDay(date, btn) {
  const avail = MOCK.officerAvailability[adminPersona.id];
  if (!avail) return;
  if (!avail.openedDays) avail.openedDays = [];
  const idx = avail.openedDays.indexOf(date);
  if (idx >= 0) {
    avail.openedDays.splice(idx, 1);
  } else {
    avail.openedDays.push(date);
  }
  renderOffAvailability();
}

function saveAvailability() {
  const btn = document.querySelector('.btn-approve');
  if (!btn) return;
  btn.innerHTML = `${SPINNER_SVG} Saving…`;
  btn.disabled = true;
  setTimeout(() => {
    btn.innerHTML = '✓ Saved';
    btn.style.background = '#10b981';
    showToast('Availability saved — supervisors can now see your open slots.');
    setTimeout(() => { btn.innerHTML = 'Save Changes'; btn.disabled = false; btn.style.background = ''; }, 1800);
  }, 700);
}

// ── Officer: Case Documents (removed — documents handled by SIGNiX) ─────────
function renderOffDocuments() {
  router.go('off-schedule');
}

// ── Toast notification ─────────────────────────────────────────
function showToast(msg, type = 'success') {
  const t = document.createElement('div');
  t.className = `admin-toast admin-toast-${type}`;
  t.textContent = msg;
  document.body.appendChild(t);
  requestAnimationFrame(() => {
    requestAnimationFrame(() => { t.classList.add('visible'); });
  });
  setTimeout(() => {
    t.classList.remove('visible');
    setTimeout(() => t.remove(), 350);
  }, 3000);
}

// ══════════════════════════════════════════════════════════════
// PUBLIC VERIFICATION PORTAL (no login required)
// ══════════════════════════════════════════════════════════════

// ── Shared public portal header ────────────────────────────────
function pubHeader(step) {
  const steps = ['Your Details', 'Schedule', 'Confirm'];
  return `
  <header style="background:#fff;border-bottom:1px solid #e2e8f0;padding:0 32px;height:60px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:10">
    <div style="display:flex;align-items:center;gap:10px">
      <div style="width:32px;height:32px;background:linear-gradient(135deg,#7c3aed,#4c1d95);border-radius:9px;display:flex;align-items:center;justify-content:center">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>
      </div>
      <div>
        <div style="font-size:14px;font-weight:800;color:#111827;letter-spacing:-.2px">OSMIO</div>
        <div style="font-size:10px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:.5px;margin-top:-1px">Notary Attestation</div>
      </div>
    </div>
    ${step !== null ? `
    <div style="display:flex;align-items:center;gap:0">
      ${steps.map((s, i) => `
        <div style="display:flex;align-items:center;gap:0">
          <div style="display:flex;align-items:center;gap:6px;padding:4px 10px;border-radius:999px;background:${i < step ? 'rgba(124,58,237,.1)' : i === step ? 'rgba(124,58,237,.15)' : 'transparent'}">
            <div style="width:18px;height:18px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:800;background:${i < step ? '#7c3aed' : i === step ? '#7c3aed' : '#e2e8f0'};color:${i <= step ? '#fff' : '#9ca3af'}">
              ${i < step ? '✓' : i + 1}
            </div>
            <span style="font-size:12px;font-weight:${i === step ? '700' : '500'};color:${i === step ? '#7c3aed' : i < step ? '#6b7280' : '#9ca3af'}">${s}</span>
          </div>
          ${i < steps.length - 1 ? `<div style="width:20px;height:1px;background:#e2e8f0;flex-shrink:0"></div>` : ''}
        </div>`).join('')}
    </div>` : `<button class="btn-admin-outline" style="font-size:12px;padding:6px 14px" onclick="router.go('login')">Staff Login →</button>`}
  </header>`;
}

// State shared across public portal steps
let pubData = { firstName:'', lastName:'', email:'', phone:'' };
let pubSelectedSlot = null;

// ── Screen: Public Portal Landing ──────────────────────────────
function renderPublicVerify() {
  pubData = { firstName:'', lastName:'', email:'', phone:'' };
  pubSelectedSlot = null;

  document.getElementById('app').innerHTML = `
  <div style="min-height:100vh;background:#f8fafc;display:flex;flex-direction:column">
    ${pubHeader(null)}

    <main style="flex:1;max-width:680px;margin:0 auto;padding:56px 24px;width:100%;text-align:center">
      <div style="width:64px;height:64px;background:linear-gradient(135deg,#7c3aed,#4c1d95);border-radius:20px;display:flex;align-items:center;justify-content:center;margin:0 auto 24px;box-shadow:0 8px 32px rgba(124,58,237,.3)">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>
      </div>

      <div style="display:inline-flex;align-items:center;gap:6px;background:rgba(124,58,237,.08);border:1px solid rgba(124,58,237,.2);border-radius:999px;padding:5px 14px;font-size:11px;font-weight:700;letter-spacing:.8px;text-transform:uppercase;color:#7c3aed;margin-bottom:16px">
        No account required
      </div>

      <h1 style="font-size:32px;font-weight:900;letter-spacing:-.6px;color:#111827;margin-bottom:12px;line-height:1.1">Get your identity<br>notarially attested</h1>
      <p style="font-size:16px;color:#6b7280;line-height:1.7;max-width:480px;margin:0 auto 40px">Enter your details, schedule a 30-minute in-person session with a commissioned US Notary Public via SIGNiX, and receive an official notarial certificate — without needing an OSMIO account.</p>

      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:40px;text-align:left">
        <div style="background:#fff;border:1px solid #e2e8f0;border-radius:14px;padding:20px">
          <div style="width:36px;height:36px;background:rgba(124,58,237,.1);border-radius:10px;display:flex;align-items:center;justify-content:center;margin-bottom:12px">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" stroke-width="2.5" stroke-linecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </div>
          <div style="font-size:13.5px;font-weight:700;color:#111827;margin-bottom:4px">Enter your details</div>
          <div style="font-size:12px;color:#6b7280;line-height:1.55">Provide your contact information to get started</div>
        </div>
        <div style="background:#fff;border:1px solid #e2e8f0;border-radius:14px;padding:20px">
          <div style="width:36px;height:36px;background:rgba(124,58,237,.1);border-radius:10px;display:flex;align-items:center;justify-content:center;margin-bottom:12px">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" stroke-width="2.5" stroke-linecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          </div>
          <div style="font-size:13.5px;font-weight:700;color:#111827;margin-bottom:4px">Schedule a session</div>
          <div style="font-size:12px;color:#6b7280;line-height:1.55">Pick a slot — your session will be conducted via SIGNiX</div>
        </div>
        <div style="background:#fff;border:1px solid #e2e8f0;border-radius:14px;padding:20px">
          <div style="width:36px;height:36px;background:rgba(124,58,237,.1);border-radius:10px;display:flex;align-items:center;justify-content:center;margin-bottom:12px">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" stroke-width="2.5" stroke-linecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>
          </div>
          <div style="font-size:13.5px;font-weight:700;color:#111827;margin-bottom:4px">Receive certificate</div>
          <div style="font-size:12px;color:#6b7280;line-height:1.55">Get an official notarial certificate by email after the session</div>
        </div>
      </div>

      <button onclick="router.go('public-upload')" style="background:#7c3aed;color:#fff;border:none;border-radius:14px;padding:15px 36px;font-size:15px;font-weight:800;cursor:pointer;letter-spacing:-.2px;box-shadow:0 4px 24px rgba(124,58,237,.35);transition:all .18s ease" onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 8px 32px rgba(124,58,237,.45)'" onmouseout="this.style.transform='';this.style.boxShadow='0 4px 24px rgba(124,58,237,.35)'">
        Get Started →
      </button>

      <div style="margin-top:32px;padding:16px 20px;background:#fff;border:1px solid #e2e8f0;border-radius:12px;text-align:left">
        <div style="font-size:12px;font-weight:700;color:#374151;margin-bottom:6px;display:flex;align-items:center;gap:6px">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" stroke-width="2.5" stroke-linecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          Privacy &amp; Legal
        </div>
        <div style="font-size:12px;color:#6b7280;line-height:1.65">
          Your identity session is conducted exclusively via SIGNiX. No documents or session data are collected or stored by OSMIO. Your assigned Notary Public will issue a certificate after a successful session.
        </div>
      </div>

      <p style="margin-top:20px;font-size:11px;color:#9ca3af">OSMIO Identity Network · US Notarial Law Applies · <a href="javascript:void(0)" style="color:#9ca3af">Privacy Policy</a></p>
    </main>
  </div>`;
}

// ── Screen: Public — Personal Details ──────────────────────────
function renderPublicUpload() {
  document.getElementById('app').innerHTML = `
  <div style="min-height:100vh;background:#f8fafc;display:flex;flex-direction:column">
    ${pubHeader(0)}

    <main style="flex:1;max-width:640px;margin:0 auto;padding:40px 24px;width:100%">
      <h2 style="font-size:22px;font-weight:900;letter-spacing:-.4px;color:#111827;margin-bottom:4px">Your details</h2>
      <p style="font-size:14px;color:#6b7280;margin-bottom:28px">Enter your contact information to schedule an attestation session.</p>

      <div style="background:#fff;border:1px solid #e2e8f0;border-radius:16px;padding:24px 28px;margin-bottom:24px">
        <div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.6px;color:#9ca3af;margin-bottom:16px">Contact Information</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
          <div>
            <label style="display:block;font-size:12.5px;font-weight:600;color:#374151;margin-bottom:6px">First Name <span style="color:#ef4444">*</span></label>
            <input id="pub-first" type="text" value="${pubData.firstName}" placeholder="Alex"
              style="width:100%;padding:10px 13px;border:1px solid #d1d5db;border-radius:9px;font-size:14px;color:#111827;outline:none;font-family:inherit"
              oninput="pubData.firstName=this.value">
          </div>
          <div>
            <label style="display:block;font-size:12.5px;font-weight:600;color:#374151;margin-bottom:6px">Last Name <span style="color:#ef4444">*</span></label>
            <input id="pub-last" type="text" value="${pubData.lastName}" placeholder="Johnson"
              style="width:100%;padding:10px 13px;border:1px solid #d1d5db;border-radius:9px;font-size:14px;color:#111827;outline:none;font-family:inherit"
              oninput="pubData.lastName=this.value">
          </div>
          <div>
            <label style="display:block;font-size:12.5px;font-weight:600;color:#374151;margin-bottom:6px">Email <span style="color:#ef4444">*</span></label>
            <input id="pub-email" type="email" value="${pubData.email}" placeholder="you@example.com"
              style="width:100%;padding:10px 13px;border:1px solid #d1d5db;border-radius:9px;font-size:14px;color:#111827;outline:none;font-family:inherit"
              oninput="pubData.email=this.value">
          </div>
          <div>
            <label style="display:block;font-size:12.5px;font-weight:600;color:#374151;margin-bottom:6px">Phone</label>
            <input id="pub-phone" type="tel" value="${pubData.phone}" placeholder="+1 (555) 000-0000"
              style="width:100%;padding:10px 13px;border:1px solid #d1d5db;border-radius:9px;font-size:14px;color:#111827;outline:none;font-family:inherit"
              oninput="pubData.phone=this.value">
          </div>
        </div>
      </div>

      <div style="display:flex;justify-content:space-between;align-items:center">
        <button onclick="router.go('public-verify')" style="background:none;border:1px solid #d1d5db;border-radius:10px;padding:10px 20px;font-size:13.5px;font-weight:600;color:#6b7280;cursor:pointer">← Back</button>
        <button onclick="pubAdvanceToSchedule()" style="background:#7c3aed;color:#fff;border:none;border-radius:10px;padding:11px 28px;font-size:14px;font-weight:700;cursor:pointer;transition:background .15s ease" onmouseover="this.style.background='#8b5cf6'" onmouseout="this.style.background='#7c3aed'">
          Next: Schedule →
        </button>
      </div>
    </main>
  </div>`;
}

function pubAdvanceToSchedule() {
  pubData.firstName = document.getElementById('pub-first')?.value.trim() || pubData.firstName;
  pubData.lastName  = document.getElementById('pub-last')?.value.trim()  || pubData.lastName;
  pubData.email     = document.getElementById('pub-email')?.value.trim() || pubData.email;
  pubData.phone     = document.getElementById('pub-phone')?.value.trim() || pubData.phone;
  if (!pubData.firstName || !pubData.lastName || !pubData.email) {
    alert('Please fill in your first name, last name, and email to continue.');
    return;
  }
  router.go('public-schedule');
}

// ── Screen: Public — Schedule Slot ─────────────────────────────
function renderPublicSchedule() {
  const today = new Date('2026-04-30');
  const days = [];
  let d = new Date(today);
  d.setDate(d.getDate() + ((1 + 7 - d.getDay()) % 7 || 7));
  for (let w = 0; w < 2; w++) {
    const week = [];
    for (let i = 0; i < 5; i++) {
      const dd = new Date(d);
      dd.setDate(d.getDate() + w * 7 + i);
      week.push(dd);
    }
    days.push(week);
  }
  const times = ['09:00','09:30','10:00','10:30','11:00','11:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30'];
  const busySet = new Set(
    MOCK.attestationRequests
      .filter(r => r.slotDate && r.slotTime && r.status !== 'completed')
      .map(r => r.slotDate + 'T' + r.slotTime)
  );
  const fmtDay = d => d.toLocaleDateString('en-GB', { weekday:'short', day:'numeric', month:'short' });
  const fmtISO = d => d.toISOString().slice(0,10);

  function buildGrid(wi) {
    return `<div style="display:grid;grid-template-columns:repeat(5,1fr);gap:6px;min-width:420px">
      ${days[wi].map(day => {
        const iso = fmtISO(day);
        return `<div>
          <div style="font-size:11px;font-weight:700;text-align:center;color:#6b7280;text-transform:uppercase;letter-spacing:.4px;margin-bottom:8px">${fmtDay(day)}</div>
          ${times.map(t => {
            const key = iso + 'T' + t;
            const busy = busySet.has(key);
            const sel = pubSelectedSlot && pubSelectedSlot.date === iso && pubSelectedSlot.time === t;
            return `<button
              onclick="${busy ? '' : `pubSelectSlot('${iso}','${t}','${fmtDay(day)} ${t}')`}"
              ${busy ? 'disabled' : ''}
              style="display:block;width:100%;padding:7px 4px;margin-bottom:5px;border-radius:7px;font-size:12px;font-weight:600;cursor:${busy?'not-allowed':'pointer'};border:1px solid ${sel?'#7c3aed':busy?'#e2e8f0':'#d1d5db'};background:${sel?'#7c3aed':busy?'#f3f4f6':'#fff'};color:${sel?'#fff':busy?'#c4cad4':'#374151'};transition:all .1s ease">
              ${t}
            </button>`;
          }).join('')}
        </div>`;
      }).join('')}
    </div>`;
  }

  window._pubDays = days; window._pubBusySet = busySet; window._pubBuildGrid = buildGrid;

  document.getElementById('app').innerHTML = `
  <div style="min-height:100vh;background:#f8fafc;display:flex;flex-direction:column">
    ${pubHeader(1)}
    <main style="flex:1;max-width:700px;margin:0 auto;padding:40px 24px;width:100%">
      <h2 style="font-size:22px;font-weight:900;letter-spacing:-.4px;color:#111827;margin-bottom:4px">Choose a time slot</h2>
      <p style="font-size:14px;color:#6b7280;margin-bottom:8px">Select a 30-minute slot for your in-person session with a commissioned US Notary Public via SIGNiX.</p>

      <div style="display:flex;align-items:flex-start;gap:8px;padding:10px 14px;background:rgba(59,130,246,.06);border:1px solid rgba(59,130,246,.2);border-radius:9px;margin-bottom:24px;font-size:12.5px;color:#1e40af;line-height:1.55">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" style="flex-shrink:0;margin-top:1px"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        Your session will be conducted via <strong>SIGNiX</strong>. All verification, recordings, and liveness checks are handled securely by SIGNiX — no data is sent to or stored by OSMIO.
      </div>

      <div style="background:#fff;border:1px solid #e2e8f0;border-radius:16px;padding:20px 24px;margin-bottom:20px">
        <div style="display:flex;gap:8px;margin-bottom:16px">
          <button id="pub-wk-0" onclick="pubSwitchWeek(0)" style="padding:6px 16px;border-radius:8px;font-size:13px;font-weight:700;cursor:pointer;border:1px solid #7c3aed;background:#7c3aed;color:#fff">Week 1 · May 4–8</button>
          <button id="pub-wk-1" onclick="pubSwitchWeek(1)" style="padding:6px 16px;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;border:1px solid #d1d5db;background:#fff;color:#6b7280">Week 2 · May 11–15</button>
        </div>
        <div style="overflow-x:auto" id="pub-slot-wrap">${buildGrid(0)}</div>
        <div style="display:flex;gap:16px;margin-top:14px;font-size:12px;color:#6b7280">
          <span><span style="display:inline-block;width:12px;height:12px;border-radius:3px;border:1px solid #d1d5db;background:#fff;margin-right:4px;vertical-align:middle"></span>Available</span>
          <span><span style="display:inline-block;width:12px;height:12px;border-radius:3px;background:#f3f4f6;border:1px solid #e2e8f0;margin-right:4px;vertical-align:middle"></span>Taken</span>
          <span><span style="display:inline-block;width:12px;height:12px;border-radius:3px;background:#7c3aed;margin-right:4px;vertical-align:middle"></span>Selected</span>
        </div>
      </div>

      <div id="pub-slot-bar" style="background:#fff;border:1px solid ${pubSelectedSlot?'#7c3aed':'#e2e8f0'};border-radius:12px;padding:14px 18px;margin-bottom:24px;display:${pubSelectedSlot?'flex':'none'};align-items:center;justify-content:space-between;gap:12px">
        <div>
          <div style="font-size:13.5px;font-weight:700;color:#111827" id="pub-slot-label">${pubSelectedSlot ? pubSelectedSlot.label : ''}</div>
          <div style="font-size:12px;color:#6b7280;margin-top:1px">30-minute session via SIGNiX · Notary assigned on confirmation</div>
        </div>
        <span style="font-size:12px;font-weight:700;color:#7c3aed;white-space:nowrap">✓ Selected</span>
      </div>

      <div style="display:flex;justify-content:space-between;align-items:center">
        <button onclick="router.go('public-upload')" style="background:none;border:1px solid #d1d5db;border-radius:10px;padding:10px 20px;font-size:13.5px;font-weight:600;color:#6b7280;cursor:pointer">← Back</button>
        <button onclick="pubAdvanceToConfirm()" style="background:#7c3aed;color:#fff;border:none;border-radius:10px;padding:11px 28px;font-size:14px;font-weight:700;cursor:pointer;transition:background .15s ease" onmouseover="this.style.background='#8b5cf6'" onmouseout="this.style.background='#7c3aed'">
          Review &amp; Confirm →
        </button>
      </div>
    </main>
  </div>`;
}

function pubSwitchWeek(wi) {
  document.getElementById('pub-slot-wrap').innerHTML = window._pubBuildGrid(wi);
  document.getElementById('pub-wk-0').style.cssText = wi===0 ? 'padding:6px 16px;border-radius:8px;font-size:13px;font-weight:700;cursor:pointer;border:1px solid #7c3aed;background:#7c3aed;color:#fff' : 'padding:6px 16px;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;border:1px solid #d1d5db;background:#fff;color:#6b7280';
  document.getElementById('pub-wk-1').style.cssText = wi===1 ? 'padding:6px 16px;border-radius:8px;font-size:13px;font-weight:700;cursor:pointer;border:1px solid #7c3aed;background:#7c3aed;color:#fff' : 'padding:6px 16px;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;border:1px solid #d1d5db;background:#fff;color:#6b7280';
}

function pubSelectSlot(date, time, label) {
  pubSelectedSlot = { date, time, label };
  const bar = document.getElementById('pub-slot-bar');
  const lbl = document.getElementById('pub-slot-label');
  if (bar) { bar.style.display = 'flex'; bar.style.borderColor = '#7c3aed'; }
  if (lbl) lbl.textContent = label;
  // Refresh the grid so the selected slot highlights
  const wrap = document.getElementById('pub-slot-wrap');
  if (wrap && window._pubBuildGrid) {
    const active = document.getElementById('pub-wk-1')?.style.background === 'rgb(124, 58, 237)' ? 1 : 0;
    wrap.innerHTML = window._pubBuildGrid(active);
  }
}

function pubAdvanceToConfirm() {
  if (!pubSelectedSlot) { alert('Please select a time slot to continue.'); return; }
  router.go('public-confirm');
}

// ── Screen: Public — Review & Confirm ──────────────────────────
function renderPublicConfirm() {
  if (!pubSelectedSlot) { router.go('public-schedule'); return; }
  const refId = 'PUB-ATT-2026-' + Math.floor(10000 + Math.random() * 90000);

  document.getElementById('app').innerHTML = `
  <div style="min-height:100vh;background:#f8fafc;display:flex;flex-direction:column">
    ${pubHeader(2)}
    <main style="flex:1;max-width:600px;margin:0 auto;padding:40px 24px;width:100%">
      <h2 style="font-size:22px;font-weight:900;letter-spacing:-.4px;color:#111827;margin-bottom:4px">Review your request</h2>
      <p style="font-size:14px;color:#6b7280;margin-bottom:24px">Check the details below, then confirm to submit your attestation request.</p>

      <div style="background:#fff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;margin-bottom:16px">
        <div style="padding:18px 24px;border-bottom:1px solid #f1f5f9">
          <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.6px;color:#9ca3af;margin-bottom:12px">Applicant</div>
          <div style="font-size:15px;font-weight:700;color:#111827">${pubData.firstName} ${pubData.lastName}</div>
          <div style="font-size:13px;color:#6b7280;margin-top:2px">${pubData.email}${pubData.phone ? ' · ' + pubData.phone : ''}</div>
        </div>
        <div style="padding:18px 24px">
          <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.6px;color:#9ca3af;margin-bottom:10px">Scheduled Slot</div>
          <div style="font-size:15px;font-weight:700;color:#111827">${pubSelectedSlot.label}</div>
          <div style="font-size:13px;color:#6b7280;margin-top:2px">30-minute session via SIGNiX · Notary assigned within 1 business day</div>
        </div>
      </div>

      <div style="padding:14px 18px;background:rgba(124,58,237,.05);border:1px solid rgba(124,58,237,.15);border-radius:12px;margin-bottom:24px;font-size:12.5px;color:#4c1d95;line-height:1.65">
        <strong>By confirming</strong> you agree to complete an identity session via SIGNiX with your assigned US Notary Public. You will receive a notarial certificate at <strong>${pubData.email}</strong> after a successful session.
      </div>

      <div style="display:flex;justify-content:space-between;align-items:center">
        <button onclick="router.go('public-schedule')" style="background:none;border:1px solid #d1d5db;border-radius:10px;padding:10px 20px;font-size:13.5px;font-weight:600;color:#6b7280;cursor:pointer">← Back</button>
        <button onclick="pubSubmit('${refId}')" id="pub-submit-btn" style="background:#7c3aed;color:#fff;border:none;border-radius:10px;padding:11px 28px;font-size:14px;font-weight:700;cursor:pointer;transition:background .15s ease" onmouseover="this.style.background='#8b5cf6'" onmouseout="this.style.background='#7c3aed'">
          Confirm &amp; Submit
        </button>
      </div>
    </main>
  </div>`;
}

function pubSubmit(refId) {
  const btn = document.getElementById('pub-submit-btn');
  if (btn) { btn.innerHTML = `${SPINNER_SVG} Submitting…`; btn.disabled = true; }
  setTimeout(() => {
    document.getElementById('app').innerHTML = `
    <div style="min-height:100vh;background:#f8fafc;display:flex;flex-direction:column">
      ${pubHeader(null)}
      <main style="flex:1;max-width:560px;margin:0 auto;padding:80px 24px;width:100%;text-align:center">
        <div style="width:64px;height:64px;background:rgba(124,58,237,.12);border-radius:20px;display:flex;align-items:center;justify-content:center;margin:0 auto 20px">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <h2 style="font-size:24px;font-weight:900;letter-spacing:-.4px;color:#111827;margin-bottom:10px">Request submitted</h2>
        <p style="font-size:15px;color:#6b7280;line-height:1.65;margin-bottom:28px">
          Your chosen time slot has been received. A supervisor will assign a Notary Public to your session within 1 business day — you'll receive a confirmation email at <strong style="color:#374151">${pubData.email}</strong> with SIGNiX session details.
        </p>
        <div style="background:#fff;border:1px solid #e2e8f0;border-radius:14px;padding:20px 24px;margin-bottom:28px;text-align:left;font-size:13.5px;color:#374151;line-height:1.7">
          <div>Reference: <strong style="color:#7c3aed;font-family:monospace">${refId}</strong></div>
          <div>Slot: <strong>${pubSelectedSlot.label}</strong></div>
          <div>Confirmation sent to: <strong>${pubData.email}</strong></div>
        </div>
        <div style="padding:14px 18px;background:rgba(124,58,237,.05);border:1px solid rgba(124,58,237,.12);border-radius:12px;font-size:12.5px;color:#4c1d95;line-height:1.65;margin-bottom:28px;text-align:left">
          After a successful session via SIGNiX your Notary Public will issue a notarial certificate. This will be sent to you by email and is also verifiable at <strong>verify.osmio.id</strong> using your reference number.
        </div>
        <button onclick="router.go('public-verify')" style="background:none;border:1px solid #7c3aed;border-radius:10px;padding:10px 24px;font-size:13.5px;font-weight:700;color:#7c3aed;cursor:pointer">Start another request</button>
      </main>
    </div>`;
  }, 1200);
}

// ══════════════════════════════════════════════════════════════
// OFFICER: LIVE SESSION SIMULATION
// ══════════════════════════════════════════════════════════════

function joinSession(reqId) {
  clearInterval(sessionTimerInterval);
  currentSessionReqId = reqId;
  sessionEnded = false;
  router.go('off-session');
}

function endSession() {
  clearInterval(sessionTimerInterval);
  sessionEnded = true;
  document.getElementById('session-end-modal').style.display = 'flex';
}

function approveSession() {
  const req = MOCK.attestationRequests.find(r => r.id === currentSessionReqId);
  if (!req) return;
  const notes = (document.getElementById('session-decision-notes').value || '').trim()
    || 'Identity verified via SIGNiX session. Name, date of birth, and photo confirmed.';
  req.status = 'completed';
  req.decision = 'approved';
  req.sessionNotes = notes;
  req.completedAt = new Date().toISOString();
  sessionStorage.setItem('off_approved_req', req.id);
  router.go('off-cert-issued');
}

function rejectSession() {
  const req = MOCK.attestationRequests.find(r => r.id === currentSessionReqId);
  if (!req) return;
  req.status = 'completed';
  req.decision = 'rejected';
  req.completedAt = new Date().toISOString();
  showToast('Session closed — attestation rejected. Applicant has been notified.', 'error');
  router.go('off-schedule');
}

function renderOffSession() {
  if (!adminPersona) { router.go('login'); return; }

  const req = MOCK.attestationRequests.find(r => r.id === currentSessionReqId);
  if (!req) { router.go('off-schedule'); return; }

  document.getElementById('app').innerHTML = `
  <div class="admin-layout">
    ${offSidebar('off-schedule')}
    <main class="admin-main">
      <div class="admin-page-header">
        <div>
          <div class="admin-page-title">Complete Session</div>
          <div class="admin-page-sub">${req.userName} · ${fmtSlot(req.slotDate, req.slotTime)}</div>
        </div>
        <div style="font-family:monospace;font-size:12px;color:#9ca3af">${req.refId}</div>
      </div>

      <div style="background:rgba(59,130,246,.04);border:1px solid rgba(59,130,246,.2);border-radius:12px;padding:14px 18px;margin-bottom:20px;font-size:13px;color:#1e40af;line-height:1.6;display:flex;align-items:center;gap:10px">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" style="flex-shrink:0"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        The identity session for this applicant was conducted via <strong>SIGNiX</strong>. Record your decision below.
      </div>

      <div class="admin-card" style="max-width:600px">
        <div style="padding:20px 24px;border-bottom:1px solid #e2e8f0;display:flex;align-items:center;gap:12px">
          ${avatar(req.userInitials, req.userAvatarColor, 42)}
          <div>
            <div style="font-size:15px;font-weight:700;color:#111827">${req.userName}</div>
            <div style="font-size:13px;color:#6b7280">${req.userEmail}</div>
            <div style="font-size:12px;color:#9ca3af;margin-top:2px">OSMIO ID: <span style="font-family:monospace">${req.certId}</span></div>
          </div>
        </div>
        <div style="padding:20px 24px">
          <label style="display:block;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#6b7280;margin-bottom:8px">Officer Notes</label>
          <textarea id="session-decision-notes" style="width:100%;height:110px;border:1.5px solid #e2e8f0;border-radius:10px;padding:10px 14px;font-size:13.5px;color:#374151;resize:none;outline:none;font-family:inherit;line-height:1.55;transition:border-color .15s;box-sizing:border-box" onfocus="this.style.borderColor='#7c3aed'" onblur="this.style.borderColor='#e2e8f0'" placeholder="Identity verified via SIGNiX session. Name, date of birth, and photo confirmed."></textarea>
        </div>
        <div style="padding:0 24px 20px;display:grid;grid-template-columns:1fr 1fr;gap:10px">
          <button onclick="rejectSession()" style="padding:12px;border:1.5px solid #dc2626;border-radius:10px;background:#fff;color:#dc2626;font-size:14px;font-weight:700;cursor:pointer;transition:all .15s" onmouseover="this.style.background='#fef2f2'" onmouseout="this.style.background='#fff'">✗ Reject</button>
          <button onclick="approveSession()" style="padding:12px;border:none;border-radius:10px;background:#16a34a;color:#fff;font-size:14px;font-weight:700;cursor:pointer;transition:background .15s" onmouseover="this.style.background='#15803d'" onmouseout="this.style.background='#16a34a'">✓ Approve Attestation</button>
        </div>
      </div>

      <button onclick="router.go('off-schedule')" class="btn-admin-outline" style="font-size:13px;margin-top:12px">← Back to Schedule</button>
    </main>
  </div>`;
}

// ── Officer: Certificate Issued ────────────────────────────────
function renderOffCertIssued() {
  if (!adminPersona) { router.go('login'); return; }

  const reqId = sessionStorage.getItem('off_approved_req');
  const req   = MOCK.attestationRequests.find(r => r.id === reqId) || MOCK.attestationRequests.find(r => r.decision === 'approved');
  const today = new Date().toISOString().slice(0,10);
  const expiry = new Date(Date.now() + 2*365*24*60*60*1000).toISOString().slice(0,10);
  const certNo = 'NOTCERT-' + new Date().getFullYear() + '-' + String(Math.floor(Math.random()*90000)+10000);
  const officerName = adminPersona.name;
  const userName   = req ? req.userName   : 'Alex Johnson';
  const certId     = req ? req.certId     : 'OSMIO-FND-2024-00847';
  const sessionRef = req ? req.refId      : 'ATT-2026-01024';
  const notes      = req ? (req.sessionNotes || 'Identity verified via SIGNiX session. Name, date of birth, and photo confirmed.') : 'Identity verified.';

  const QR_SVG = `<svg width="80" height="80" viewBox="0 0 80 80" fill="none">
    <rect width="80" height="80" fill="white"/>
    <rect x="5" y="5" width="21" height="21" rx="2" fill="#111"/><rect x="8" y="8" width="15" height="15" rx="1" fill="white"/><rect x="11" y="11" width="9" height="9" fill="#111"/>
    <rect x="54" y="5" width="21" height="21" rx="2" fill="#111"/><rect x="57" y="8" width="15" height="15" rx="1" fill="white"/><rect x="60" y="11" width="9" height="9" fill="#111"/>
    <rect x="5" y="54" width="21" height="21" rx="2" fill="#111"/><rect x="8" y="57" width="15" height="15" rx="1" fill="white"/><rect x="11" y="60" width="9" height="9" fill="#111"/>
    <rect x="30" y="5" width="4" height="4" fill="#111"/><rect x="37" y="5" width="4" height="4" fill="#111"/><rect x="44" y="5" width="4" height="4" fill="#111"/>
    <rect x="30" y="12" width="4" height="4" fill="#111"/><rect x="44" y="12" width="4" height="4" fill="#111"/>
    <rect x="37" y="19" width="4" height="4" fill="#111"/>
    <rect x="30" y="30" width="4" height="4" fill="#111"/><rect x="37" y="30" width="4" height="4" fill="#111"/><rect x="44" y="30" width="4" height="4" fill="#111"/><rect x="51" y="30" width="4" height="4" fill="#111"/>
    <rect x="30" y="37" width="4" height="4" fill="#111"/><rect x="44" y="37" width="4" height="4" fill="#111"/>
    <rect x="37" y="44" width="4" height="4" fill="#111"/><rect x="51" y="44" width="4" height="4" fill="#111"/>
    <rect x="30" y="51" width="4" height="4" fill="#111"/><rect x="44" y="51" width="4" height="4" fill="#111"/>
    <rect x="54" y="30" width="4" height="4" fill="#111"/><rect x="68" y="30" width="4" height="4" fill="#111"/>
    <rect x="61" y="37" width="4" height="4" fill="#111"/><rect x="61" y="44" width="4" height="4" fill="#111"/>
    <rect x="54" y="51" width="4" height="4" fill="#111"/><rect x="68" y="44" width="4" height="4" fill="#111"/>
    <rect x="5" y="30" width="4" height="4" fill="#111"/><rect x="19" y="30" width="4" height="4" fill="#111"/>
    <rect x="12" y="37" width="4" height="4" fill="#111"/><rect x="5" y="44" width="4" height="4" fill="#111"/>
    <rect x="12" y="51" width="4" height="4" fill="#111"/><rect x="19" y="44" width="4" height="4" fill="#111"/>
    <rect x="5" y="68" width="4" height="4" fill="#111"/><rect x="19" y="68" width="4" height="4" fill="#111"/>
    <rect x="12" y="61" width="4" height="4" fill="#111"/><rect x="26" y="61" width="4" height="4" fill="#111"/>
    <rect x="37" y="61" width="4" height="4" fill="#111"/><rect x="44" y="68" width="4" height="4" fill="#111"/>
    <rect x="51" y="61" width="4" height="4" fill="#111"/><rect x="65" y="61" width="4" height="4" fill="#111"/>
    <rect x="58" y="68" width="4" height="4" fill="#111"/><rect x="72" y="68" width="4" height="4" fill="#111"/>
  </svg>`;

  const SEAL_SVG = `<svg width="64" height="64" viewBox="0 0 64 64">
    <circle cx="32" cy="32" r="30" fill="none" stroke="#7c3aed" stroke-width="2" stroke-dasharray="4 3"/>
    <circle cx="32" cy="32" r="24" fill="rgba(124,58,237,.08)" stroke="#7c3aed" stroke-width="1.5"/>
    <path d="M32 12l14 5v10c0 8-6 14-14 18-8-4-14-10-14-18V17z" fill="rgba(124,58,237,.15)" stroke="#7c3aed" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="32" cy="27" r="4" fill="#7c3aed"/>
    <path d="M24 40c0-4.4 3.6-8 8-8s8 3.6 8 8" fill="#7c3aed"/>
  </svg>`;

  document.getElementById('app').innerHTML = `
  <div class="admin-layout">
    ${offSidebar('off-documents')}
    <main class="admin-main">
      <div class="admin-page-header">
        <div>
          <div class="admin-page-title">Attestation Approved</div>
          <div class="admin-page-sub">Notarial certificate sealed and delivered</div>
        </div>
        <div style="display:flex;gap:10px">
          <button class="btn-admin-outline" style="font-size:12.5px" onclick="router.go('off-schedule')">My Schedule</button>
          <button class="btn-admin-outline" style="font-size:12.5px" onclick="showToast('Certificate downloaded (demo)')">Download PDF</button>
        </div>
      </div>

      <!-- Success banner -->
      <div style="background:linear-gradient(135deg,#f0fdf4,#dcfce7);border:1px solid #86efac;border-radius:14px;padding:20px 24px;margin-bottom:24px;display:flex;align-items:center;gap:16px">
        <div style="width:44px;height:44px;background:#16a34a;border-radius:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        </div>
        <div>
          <div style="font-size:16px;font-weight:800;color:#15803d;margin-bottom:3px">Attestation approved — certificate sealed</div>
          <div style="font-size:13px;color:#16a34a;line-height:1.55">The notarial certificate has been delivered to <strong>${userName}</strong>'s MOI vault. A copy is retained in your exclusive notarial custody.</div>
        </div>
      </div>

      <!-- Certificate document -->
      <div style="background:#fff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;max-width:700px;box-shadow:0 4px 24px rgba(0,0,0,.06)">

        <!-- Certificate header -->
        <div style="background:linear-gradient(135deg,#1e0938,#2d1458);padding:28px 32px;position:relative;overflow:hidden">
          <div style="position:absolute;inset:0;background-image:radial-gradient(rgba(124,58,237,.15) 1px,transparent 1px);background-size:20px 20px;pointer-events:none"></div>
          <div style="position:relative;display:flex;align-items:center;gap:16px;margin-bottom:16px">
            <div style="width:52px;height:52px;background:linear-gradient(135deg,#7c3aed,#4c1d95);border-radius:14px;display:flex;align-items:center;justify-content:center;box-shadow:0 0 24px rgba(124,58,237,.5)">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>
            </div>
            <div>
              <div style="font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:rgba(167,139,250,.7);margin-bottom:3px">OSMIO Identity Authority</div>
              <div style="font-size:20px;font-weight:900;color:#fff;letter-spacing:-.3px">Official Notarial Certificate</div>
            </div>
          </div>
          <div style="display:flex;gap:24px;position:relative">
            <div><div style="font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:rgba(167,139,250,.6);margin-bottom:3px">Certificate No.</div><div style="font-family:monospace;font-size:13px;font-weight:700;color:#fff">${certNo}</div></div>
            <div><div style="font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:rgba(167,139,250,.6);margin-bottom:3px">Session Ref.</div><div style="font-family:monospace;font-size:13px;font-weight:700;color:#fff">${sessionRef}</div></div>
            <div><div style="font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:rgba(167,139,250,.6);margin-bottom:3px">Date Issued</div><div style="font-size:13px;font-weight:700;color:#fff">${today}</div></div>
            <div><div style="font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:rgba(167,139,250,.6);margin-bottom:3px">Valid Through</div><div style="font-size:13px;font-weight:700;color:#c4b5f8">${expiry}</div></div>
          </div>
        </div>

        <!-- Certificate body -->
        <div style="padding:32px">
          <div style="font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#9ca3af;text-align:center;margin-bottom:20px">Notarial Certificate of Identity Attestation</div>

          <p style="font-size:14px;color:#374151;line-height:1.75;margin-bottom:20px">
            I, <strong style="color:#111827">${officerName}</strong>, a Notary Public duly commissioned in the <strong style="color:#111827">State of Texas, USA</strong>, Commission No. <strong style="color:#111827">TX-2024-NP-00891</strong>, do hereby certify that on <strong style="color:#111827">${today}</strong>, the following individual completed an identity verification session via SIGNiX and presented satisfactory evidence of their identity:
          </p>

          <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:20px;margin-bottom:20px">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:0">
              ${[
                ['Full Name', userName],
                ['OSMIO Certificate ID', certId],
                ['Fields Attested', 'First Name, Last Name, Date of Birth'],
                ['Verification Method', 'SIGNiX identity session'],
              ].map(([label, val]) => `
              <div style="padding:8px 12px;border-bottom:1px solid #e2e8f0">
                <div style="font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#9ca3af;margin-bottom:3px">${label}</div>
                <div style="font-size:13.5px;font-weight:600;color:#111827">${val}</div>
              </div>`).join('')}
            </div>
          </div>

          <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:14px 16px;margin-bottom:24px">
            <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.6px;color:#92400e;margin-bottom:6px">Officer Notes</div>
            <div style="font-size:13.5px;color:#78350f;line-height:1.6">${notes}</div>
          </div>

          <div style="display:flex;align-items:flex-end;justify-content:space-between;gap:24px;padding-top:16px;border-top:1px dashed #e2e8f0">
            <div style="display:flex;align-items:center;gap:16px">
              ${QR_SVG}
              <div>
                <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.6px;color:#9ca3af;margin-bottom:2px">Scan to verify</div>
                <div style="font-size:12px;color:#6b7280">osmio.id/verify</div>
                <div style="font-family:monospace;font-size:11px;color:#9ca3af;margin-top:2px">${certNo}</div>
              </div>
            </div>
            <div style="text-align:center">
              ${SEAL_SVG}
              <div style="margin-top:16px;padding-top:8px;border-top:1.5px solid #d1d5db;width:180px">
                <div style="font-size:13px;font-weight:700;color:#111827">${officerName}</div>
                <div style="font-size:11.5px;color:#6b7280;margin-top:2px">Notary Public, State of Texas</div>
                <div style="font-family:monospace;font-size:11px;color:#9ca3af;margin-top:2px">${adminPersona.certId}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style="display:flex;gap:10px;margin-top:20px">
        <button onclick="router.go('off-schedule')" class="btn-admin-outline" style="font-size:13px">← Back to Schedule</button>
        <a href="moi.html#certificate" style="display:inline-flex;align-items:center;gap:6px;padding:9px 18px;background:#7c3aed;color:#fff;border-radius:9px;font-size:13px;font-weight:700;text-decoration:none;transition:background .15s" onmouseover="this.style.background='#8b5cf6'" onmouseout="this.style.background='#7c3aed'">View in MOI Vault →</a>
      </div>
    </main>
  </div>`;
}

// ══════════════════════════════════════════════════════════════
// PUBLIC: CERTIFICATE VERIFICATION
// ══════════════════════════════════════════════════════════════

function renderVerifyCert() {
  document.getElementById('app').innerHTML = `
  <div style="min-height:100vh;background:#f8fafc;display:flex;flex-direction:column">
    ${pubHeader(null)}
    <main style="flex:1;max-width:600px;margin:0 auto;padding:56px 24px;width:100%">

      <div style="text-align:center;margin-bottom:40px">
        <div style="width:56px;height:56px;background:linear-gradient(135deg,#7c3aed,#4c1d95);border-radius:16px;display:flex;align-items:center;justify-content:center;margin:0 auto 20px;box-shadow:0 8px 28px rgba(124,58,237,.3)">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>
        </div>
        <h1 style="font-size:26px;font-weight:900;letter-spacing:-.5px;color:#111827;margin-bottom:8px">Verify a Certificate</h1>
        <p style="font-size:15px;color:#6b7280;line-height:1.65">Enter an OSMIO notarial certificate ID to check its validity. No account required.</p>
      </div>

      <div style="background:#fff;border:1px solid #e2e8f0;border-radius:16px;padding:28px">
        <div style="margin-bottom:16px">
          <label style="display:block;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#6b7280;margin-bottom:8px">Certificate ID</label>
          <div style="display:flex;gap:10px">
            <input id="cert-verify-input" type="text" placeholder="e.g. NOTCERT-2026-00291" style="flex:1;border:1.5px solid #e2e8f0;border-radius:10px;padding:11px 14px;font-size:14px;color:#111827;outline:none;font-family:monospace;transition:border-color .15s" onfocus="this.style.borderColor='#7c3aed'" onblur="this.style.borderColor='#e2e8f0'"
              onkeydown="if(event.key==='Enter')verifyCert()"/>
            <button onclick="verifyCert()" style="background:#7c3aed;color:#fff;border:none;border-radius:10px;padding:11px 22px;font-size:14px;font-weight:700;cursor:pointer;white-space:nowrap;transition:background .15s" onmouseover="this.style.background='#8b5cf6'" onmouseout="this.style.background='#7c3aed'">Verify →</button>
          </div>
          <div style="margin-top:8px;font-size:12.5px;color:#9ca3af">
            Try a sample:
            <a href="javascript:void(0)" onclick="document.getElementById('cert-verify-input').value='NOTCERT-2026-00291';document.getElementById('cert-verify-input').focus()" style="color:#7c3aed;font-weight:600;font-family:monospace">NOTCERT-2026-00291</a>
          </div>
        </div>
        <div id="cert-verify-result"></div>
      </div>

      <div style="margin-top:24px;padding:16px 20px;background:#fff;border:1px solid #e2e8f0;border-radius:12px;font-size:12px;color:#6b7280;line-height:1.7">
        <div style="font-size:12px;font-weight:700;color:#374151;margin-bottom:6px;display:flex;align-items:center;gap:6px">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" stroke-width="2.5" stroke-linecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          About OSMIO Certificate Verification
        </div>
        OSMIO notarial certificates are issued by commissioned US Notary Publics after an identity session via SIGNiX. Each certificate is cryptographically signed and can be independently verified here. Certificate data is never shared with third parties.
      </div>
    </main>
  </div>`;
}

function verifyCert() {
  const input    = (document.getElementById('cert-verify-input').value || '').trim();
  const resultEl = document.getElementById('cert-verify-result');
  if (!input) return;
  const cert = MOCK.currentUser.notarialCertificates.find(c => c.id.toLowerCase() === input.toLowerCase());
  if (cert) {
    resultEl.innerHTML = `
    <div style="margin-top:16px;background:#fff;border:1.5px solid #86efac;border-radius:14px;overflow:hidden">
      <div style="background:#f0fdf4;border-bottom:1px solid #bbf7d0;padding:14px 20px;display:flex;align-items:center;gap:10px">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2.5" stroke-linecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>
        <span style="font-size:14px;font-weight:800;color:#15803d">Certificate Valid</span>
        <span style="margin-left:auto;font-size:11px;font-weight:700;color:#16a34a;background:#dcfce7;padding:3px 10px;border-radius:99px;letter-spacing:.3px">✓ VERIFIED</span>
      </div>
      <div style="padding:20px">
        <table style="width:100%;border-collapse:collapse;font-size:13.5px">
          ${[
            ['Certificate No.', `<span style="font-family:monospace;font-weight:700">${cert.id}</span>`],
            ['Issued To', cert.issuedTo],
            ['OSMIO Certificate', `<span style="font-family:monospace;font-size:12px">${cert.issuedToCertId}</span>`],
            ['Fields Attested', cert.fieldsAttested.join(', ')],
            ['Attesting Officer', cert.officerName],
            ['Jurisdiction', cert.officerJurisdiction],
            ['Session Reference', `<span style="font-family:monospace">${cert.sessionRef}</span>`],
            ['Date Issued', cert.issuedDate],
            ['Valid Through', cert.expiresDate],
          ].map(([label, val]) => `
          <tr style="border-bottom:1px solid #f1f5f9">
            <td style="padding:9px 0;color:#6b7280;width:180px;font-weight:500">${label}</td>
            <td style="padding:9px 0;font-weight:600;color:#111827">${val}</td>
          </tr>`).join('')}
        </table>
        <div style="margin-top:14px;padding:12px 14px;background:#f8fafc;border-radius:9px;font-size:12.5px;color:#6b7280;line-height:1.6">${cert.notes}</div>
      </div>
    </div>`;
  } else {
    resultEl.innerHTML = `
    <div style="margin-top:16px;padding:20px;background:#fff;border:1.5px solid #fca5a5;border-radius:14px;display:flex;gap:12px;align-items:flex-start">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round" style="flex-shrink:0;margin-top:1px"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
      <div>
        <div style="font-size:14px;font-weight:700;color:#dc2626;margin-bottom:4px">Certificate not found</div>
        <div style="font-size:13px;color:#6b7280">No certificate matching <strong>${input}</strong> was found. Please check the ID and try again, or contact OSMIO support.</div>
      </div>
    </div>`;
  }
}

// ── Router ─────────────────────────────────────────────────────
router
  .on('login',            renderLogin)
  .on('public-verify',    renderPublicVerify)
  .on('public-upload',    renderPublicUpload)
  .on('public-schedule',  renderPublicSchedule)
  .on('public-confirm',   renderPublicConfirm)
  .on('sup-dashboard',    renderSupDashboard)
  .on('sup-assign',       renderSupAssign)
  .on('sup-reassign',     renderSupReassign)
  .on('sup-all-requests',       renderSupAllRequests)
  .on('sup-officer-schedules',  renderSupOfficerSchedules)
  .on('off-dashboard',          renderOffDashboard)
  .on('off-schedule',     renderOffSchedule)
  .on('off-availability', renderOffAvailability)
  .on('off-documents',    renderOffDocuments)
  .on('off-session',      renderOffSession)
  .on('off-cert-issued',  renderOffCertIssued)
  .on('verify-cert',      renderVerifyCert)
  .init('login');

window.addEventListener('hashchange', () => {
  document.querySelectorAll('#demo-nav a').forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === `admin.html${location.hash}`);
  });
});
