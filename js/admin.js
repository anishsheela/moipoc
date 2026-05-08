// =============================================================
// ADMIN — OSMIO Attestation Portal (role-based: supervisor + officer)
// =============================================================

const router = new Router();

let adminRole    = null; // 'supervisor' | 'officer'
let adminPersona = null; // supervisor or officer object
let activeFilter = 'all';
let selectedVerificationId = null;
let selectedRequestId      = null;
let offScheduleView        = 'list'; // 'list' | 'calendar'
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
function officerAvailableForSlot(officerId, slotDate, slotTime) {
  const avail = MOCK.officerAvailability[officerId];
  if (!avail) return true;
  if (avail.daysOff && avail.daysOff.includes(slotDate)) return false;
  const key = slotDate + 'T' + slotTime;
  return !avail.blockedSlots.includes(key);
}
function officerSessionCount(officerId) {
  return MOCK.attestationRequests.filter(r => r.assignedOfficerId === officerId && r.status === 'officer-assigned').length;
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
      <div class="admin-nav-section-label">Legacy</div>
      <button class="admin-nav-item ${active==='dashboard'?'active':''}" onclick="router.go('dashboard')">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        Verifications Queue
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
        ${todayCount > 0 ? `<span class="admin-nav-item-badge">${todayCount}</span>` : ''}
      </button>
      <button class="admin-nav-item ${active==='off-schedule'?'active':''}" onclick="router.go('off-schedule')">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        My Schedule
      </button>
      <button class="admin-nav-item ${active==='off-availability'?'active':''}" onclick="router.go('off-availability')">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        My Availability
      </button>
      <button class="admin-nav-item ${active==='off-documents'?'active':''}" onclick="router.go('off-documents')">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
        Case Documents
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
  const needsAssign  = requests.filter(r => r.status === 'slot-chosen').length;
  const confirmed    = requests.filter(r => r.status === 'officer-assigned').length;
  const completed    = requests.filter(r => r.status === 'completed').length;
  const docsOnly     = requests.filter(r => r.status === 'docs-uploaded').length;

  // Next 5 upcoming sessions (assigned, sorted by date)
  const upcoming = requests
    .filter(r => r.status === 'officer-assigned' && r.slotDate)
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

      <div class="admin-stats-row" style="grid-template-columns:repeat(4,1fr)">
        <div class="admin-stat-card pending" style="cursor:pointer" onclick="router.go('sup-assign')">
          <div class="admin-stat-label">Needs Officer</div>
          <div class="admin-stat-val">${needsAssign}</div>
          <div class="admin-stat-sub">Slot chosen · unassigned</div>
        </div>
        <div class="admin-stat-card approved">
          <div class="admin-stat-label">Confirmed</div>
          <div class="admin-stat-val">${confirmed}</div>
          <div class="admin-stat-sub">Officer assigned</div>
        </div>
        <div class="admin-stat-card total">
          <div class="admin-stat-label">Docs Only</div>
          <div class="admin-stat-val">${docsOnly}</div>
          <div class="admin-stat-sub">No slot selected yet</div>
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
          <div class="admin-card-title">Upcoming Confirmed Sessions</div>
          <button class="btn-admin-outline" style="font-size:12px;padding:5px 12px" onclick="router.go('sup-all-requests')">View all →</button>
        </div>
        <div style="overflow-x:auto">
          <table class="admin-table">
            <thead><tr><th>User</th><th>Slot</th><th>Officer</th><th>Documents</th><th>Ref</th></tr></thead>
            <tbody>
              ${upcoming.map(r => `
              <tr>
                <td><div class="admin-user-cell">${avatar(r.userInitials, r.userAvatarColor, 32)}<div><strong>${r.userName}</strong><span>${r.userEmail}</span></div></div></td>
                <td style="white-space:nowrap;font-size:13px"><strong>${fmtSlot(r.slotDate, r.slotTime)}</strong></td>
                <td><div class="admin-user-cell">${avatar(MOCK.attestationOfficers.find(o=>o.id===r.assignedOfficerId)?.initials||'??', MOCK.attestationOfficers.find(o=>o.id===r.assignedOfficerId)?.avatarColor||'#666', 28)}<strong style="font-size:13px">${r.assignedOfficerName}</strong></div></td>
                <td style="font-size:12.5px;color:#6b7280">${r.docTypes.join(' · ')}</td>
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

function renderAssignCard(r) {
  const officers = MOCK.attestationOfficers.map(o => {
    const avail = officerAvailableForSlot(o.id, r.slotDate, r.slotTime);
    const sessions = officerSessionCount(o.id);
    return { ...o, avail, sessions };
  }).sort((a, b) => b.avail - a.avail);
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
    <div style="padding:16px 20px">
      <div style="background:rgba(107,114,128,.06);border:1px solid rgba(107,114,128,.15);border-radius:8px;padding:10px 14px;margin-bottom:14px;font-size:12px;color:#6b7280;display:flex;align-items:flex-start;gap:8px;line-height:1.55">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" style="flex-shrink:0;margin-top:1px"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        <span>Applicant documents: <strong style="color:#374151">${r.docTypes.join(', ')}</strong> — held in exclusive custody of the assigned officer (US notarial privilege). Supervisors have no access to document contents or session recordings.</span>
      </div>
      <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#9ca3af;margin-bottom:12px">Select an available officer for this slot</div>
      <div class="admin-officer-grid" id="officer-grid-${r.id}">
        ${officers.map(o => `
        <button class="admin-officer-card ${o.avail ? '' : 'unavailable'}" id="ofcrd-${r.id}-${o.id}"
          onclick="${o.avail ? `pickOfficer('${r.id}','${o.id}')` : ''}">
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
      <div style="margin-top:14px;display:flex;gap:10px;align-items:center">
        <button class="btn-approve" id="assign-btn-${r.id}" onclick="confirmAssign('${r.id}')" disabled style="max-width:220px">
          Assign Officer
        </button>
        <span id="assign-selected-${r.id}" style="font-size:13px;color:#6b7280"></span>
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
    req.status = 'officer-assigned';
    req.assignedOfficerId = officerId;
    req.assignedOfficerName = officer.name;
    req.assignedAt = new Date().toISOString();
    req.meetingLink = `https://meet.osmio.id/att-${requestId.slice(-3)}`;

    // Replace card with success state
    const card = document.getElementById('assign-card-' + requestId);
    if (card) {
      card.style.borderColor = '#10b981';
      card.innerHTML = `
        <div class="admin-card-header" style="background:rgba(16,185,129,.04)">
          <div style="display:flex;align-items:center;gap:12px">
            ${avatar(req.userInitials, req.userAvatarColor, 40)}
            <div>
              <div class="admin-card-title" style="margin-bottom:2px;color:#10b981">✓ ${req.userName} — Assigned</div>
              <div style="font-size:12.5px;color:#6b7280">${fmtSlot(req.slotDate, req.slotTime)} · <strong>${officer.name}</strong></div>
            </div>
          </div>
          <div style="display:flex;gap:8px;align-items:center">
            <a href="${officerEmailInbox(officer.email)}" class="btn-admin-outline" style="font-size:12px;padding:5px 12px;text-decoration:none">📧 Officer email</a>
            <a href="email.html#${MOCK.emailPersonas.find(p=>p.email===req.userEmail)?.id||''}" class="btn-admin-outline" style="font-size:12px;padding:5px 12px;text-decoration:none">📧 User email</a>
          </div>
        </div>`;
    }
    // Update sidebar badge
    const badge = document.querySelector('.admin-nav-item-badge');
    const remaining = MOCK.attestationRequests.filter(r => r.status === 'slot-chosen').length;
    if (badge) { if (remaining > 0) badge.textContent = remaining; else badge.remove(); }
    showToast(`${officer.name} assigned — confirmation emails sent.`);
  }, 900);
}

// ── Supervisor: All Requests ───────────────────────────────────
function renderSupAllRequests() {
  if (!adminPersona) { router.go('login'); return; }
  const all = MOCK.attestationRequests;
  const statusLabel = { 'docs-uploaded':'Docs Uploaded','slot-chosen':'Slot Chosen','officer-assigned':'Confirmed','completed':'Completed' };
  const statusClass = { 'docs-uploaded':'pending','slot-chosen':'pending','officer-assigned':'approved','completed':'total' };

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
            <thead><tr><th>User</th><th>Submitted</th><th>Slot</th><th>Officer</th><th>Status</th><th>Ref</th></tr></thead>
            <tbody>
              ${all.map(r => `
              <tr>
                <td><div class="admin-user-cell">${avatar(r.userInitials, r.userAvatarColor, 32)}<div><strong>${r.userName}</strong><span>${r.userEmail}</span></div></div></td>
                <td style="font-size:13px;color:#6b7280">${formatDate(r.submittedDate)}</td>
                <td style="font-size:13px;white-space:nowrap">${r.slotDate ? fmtSlot(r.slotDate, r.slotTime) : '<span style="color:#c4cad4">Not chosen</span>'}</td>
                <td style="font-size:13px">${r.assignedOfficerName || '<span style="color:#c4cad4">—</span>'}</td>
                <td><span class="admin-badge ${statusClass[r.status]}"><span class="admin-badge-dot"></span>${statusLabel[r.status]}</span></td>
                <td style="font-family:monospace;font-size:11.5px;color:#9ca3af">${r.refId}</td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  </div>`;
}

// ══════════════════════════════════════════════════════════════
// OFFICER SCREENS
// ══════════════════════════════════════════════════════════════

function renderOffDashboard() {
  if (!adminPersona) { router.go('login'); return; }
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

      <div class="admin-stats-row" style="grid-template-columns:repeat(3,1fr)">
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

function offSessionRow(r, showLink) {
  return `
  <div style="display:flex;align-items:center;gap:14px;padding:14px 20px;border-bottom:1px solid #e2e6ef;flex-wrap:wrap">
    ${avatar(r.userInitials, r.userAvatarColor, 38)}
    <div style="flex:1;min-width:160px">
      <div style="font-size:14px;font-weight:700;color:#111827">${r.userName}</div>
      <div style="font-size:12px;color:#6b7280;margin-top:2px">${r.docTypes.join(' · ')}</div>
    </div>
    <div style="text-align:right;margin-right:8px">
      <div style="font-size:13px;font-weight:600;color:#374151">${fmtSlot(r.slotDate, r.slotTime)}</div>
      <div style="font-size:11px;color:#9ca3af;margin-top:2px;font-family:monospace">${r.refId}</div>
    </div>
    <button class="btn-admin-outline" style="font-size:12px;padding:6px 12px;white-space:nowrap" onclick="viewOffDocuments('${r.id}')">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" style="display:inline;vertical-align:middle;margin-right:4px"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
      Documents
    </button>
    ${showLink && r.meetingLink ? `
    <div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px">
      <a href="${r.meetingLink}" class="btn-approve" style="padding:7px 14px;font-size:12px;text-decoration:none;border-radius:8px">Join →</a>
      <span style="font-size:10px;color:#9ca3af;white-space:nowrap">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" style="display:inline;vertical-align:middle"><circle cx="12" cy="12" r="3"/><path d="M3 12s4-7 9-7 9 7 9 7-4 7-9 7-9-7-9-7z"/></svg>
        Session will be recorded
      </span>
    </div>` : ''}
  </div>`;
}

function viewOffDocuments(requestId) {
  sessionStorage.setItem('off_viewing_request', requestId);
  router.go('off-documents');
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
  const statusBadge = s => s === 'completed' ? `<span class="admin-badge approved">Completed</span>` : s === 'officer-assigned' ? `<span class="admin-badge pending">Confirmed</span>` : '';
  return `
  <div class="admin-card">
    <div style="overflow-x:auto">
      <table class="admin-table">
        <thead><tr><th>User</th><th>Date &amp; Time</th><th>Documents</th><th>Meeting</th><th>Status</th><th>Ref</th></tr></thead>
        <tbody>
          ${sessions.map(r => `
          <tr>
            <td><div class="admin-user-cell">${avatar(r.userInitials, r.userAvatarColor, 32)}<div><strong>${r.userName}</strong><span>${r.userEmail}</span></div></div></td>
            <td style="white-space:nowrap;font-size:13px;font-weight:600">${fmtSlot(r.slotDate, r.slotTime)}</td>
            <td style="font-size:12.5px;color:#6b7280">${r.docTypes.join('<br>')}</td>
            <td>${r.meetingLink ? `<a href="${r.meetingLink}" style="color:#0077a8;font-size:12.5px;font-weight:600">Join call →</a>` : '<span style="color:#c4cad4">—</span>'}</td>
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
    { label:'Week of Apr 22', days:['2026-04-22','2026-04-23','2026-04-24','2026-04-25','2026-04-26'] },
    { label:'Week of Apr 27', days:['2026-04-27','2026-04-28','2026-04-29','2026-04-30','2026-05-01'] },
    { label:'Week of May 4',  days:['2026-05-04','2026-05-05','2026-05-06','2026-05-07','2026-05-08'] },
  ];
  return weeks.map(w => `
  <div class="admin-card" style="margin-bottom:16px">
    <div class="admin-card-header"><div class="admin-card-title">${w.label}</div></div>
    <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:0">
      ${w.days.map(day => {
        const sessions = sessionsByDay[day] || [];
        const dayLabel = new Date(day+'T12:00').toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'short'});
        return `
        <div style="border-right:1px solid #e2e6ef;padding:12px;min-height:80px">
          <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.4px;color:#9ca3af;margin-bottom:8px">${dayLabel}</div>
          ${sessions.map(r => `
          <div style="background:${r.status==='completed'?'rgba(16,185,129,.1)':'rgba(59,130,246,.1)'};border:1px solid ${r.status==='completed'?'rgba(16,185,129,.2)':'rgba(59,130,246,.2)'};border-radius:6px;padding:6px 8px;margin-bottom:6px;font-size:11.5px">
            <div style="font-weight:700;color:#111827">${r.userName}</div>
            <div style="color:#6b7280">${r.slotTime}</div>
          </div>`).join('')}
          ${sessions.length === 0 ? `<div style="font-size:11px;color:#d1d5db;text-align:center;padding-top:8px">—</div>` : ''}
        </div>`;
      }).join('')}
    </div>
  </div>`).join('');
}

// ── Officer: Availability ──────────────────────────────────────
function renderOffAvailability() {
  if (!adminPersona) { router.go('login'); return; }
  const avail = MOCK.officerAvailability[adminPersona.id] || { blockedSlots: [], daysOff: [] };
  const times = ['09:00','09:30','10:00','10:30','11:00','11:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30'];
  const weeks = [
    { label:'Week of Apr 27', days:[{d:'2026-04-27',lbl:'Mon 27'},{d:'2026-04-28',lbl:'Tue 28'},{d:'2026-04-29',lbl:'Wed 29'},{d:'2026-04-30',lbl:'Thu 30'},{d:'2026-05-01',lbl:'Fri 1 May'}] },
    { label:'Week of May 4',  days:[{d:'2026-05-04',lbl:'Mon 4'},{d:'2026-05-05',lbl:'Tue 5'},{d:'2026-05-06',lbl:'Wed 6'},{d:'2026-05-07',lbl:'Thu 7'},{d:'2026-05-08',lbl:'Fri 8'}] },
  ];

  document.getElementById('app').innerHTML = `
  <div class="admin-layout">
    ${offSidebar('off-availability')}
    <main class="admin-main">
      <div class="admin-page-header">
        <div>
          <div class="admin-page-title">My Availability</div>
          <div class="admin-page-sub">Toggle slots to mark yourself unavailable. Green = available (default).</div>
        </div>
        <button class="btn-approve" onclick="saveAvailability()" style="padding:9px 20px;font-size:13px">Save Changes</button>
      </div>

      ${weeks.map(w => `
      <div class="admin-card" style="margin-bottom:16px">
        <div class="admin-card-header"><div class="admin-card-title">${w.label}</div></div>
        <div style="padding:16px 20px;overflow-x:auto">
          <div style="display:grid;grid-template-columns:70px repeat(5,1fr);gap:4px;min-width:520px">
            <div></div>
            ${w.days.map(dy => {
              const dayOff = avail.daysOff && avail.daysOff.includes(dy.d);
              return `<div style="text-align:center">
                <div style="font-size:11px;font-weight:700;text-transform:uppercase;color:#9ca3af;margin-bottom:6px">${dy.lbl}</div>
                <button class="admin-dayoff-btn ${dayOff?'off':''}" onclick="toggleDayOff('${dy.d}',this)" title="Mark full day off">
                  ${dayOff ? '✗ Day off' : 'Full day'}
                </button>
              </div>`;
            }).join('')}
            ${times.map(t => `
              <div style="font-size:11.5px;font-weight:600;color:#9ca3af;display:flex;align-items:center;padding-right:8px">${t}</div>
              ${w.days.map(dy => {
                const key = dy.d + 'T' + t;
                const blocked = avail.blockedSlots && avail.blockedSlots.includes(key);
                const dayOff = avail.daysOff && avail.daysOff.includes(dy.d);
                return `<div>
                  <button class="admin-avail-slot ${blocked||dayOff?'blocked':''}" data-key="${key}" onclick="toggleSlot('${key}',this)" ${dayOff?'disabled':''}>
                    ${blocked || dayOff ? '✗' : '✓'}
                  </button>
                </div>`;
              }).join('')}`).join('')}
          </div>
        </div>
      </div>`).join('')}

      <div style="background:#fff;border-radius:12px;padding:16px 20px;border:1px solid #e2e6ef;display:flex;align-items:center;gap:14px">
        <div style="display:flex;gap:16px;font-size:12.5px;color:#6b7280">
          <span><span style="display:inline-block;width:12px;height:12px;border-radius:3px;background:#dcfce7;border:1px solid #86efac;margin-right:5px"></span>Available</span>
          <span><span style="display:inline-block;width:12px;height:12px;border-radius:3px;background:#fee2e2;border:1px solid #fca5a5;margin-right:5px"></span>Blocked / Day off</span>
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

// ── Officer: Case Documents ────────────────────────────────────
function renderOffDocuments() {
  if (!adminPersona) { router.go('login'); return; }

  const requestId = sessionStorage.getItem('off_viewing_request');
  const myReqs = MOCK.attestationRequests.filter(r => r.assignedOfficerId === adminPersona.id);
  const req = requestId ? myReqs.find(r => r.id === requestId) : myReqs[0];

  document.getElementById('app').innerHTML = `
  <div class="admin-layout">
    ${offSidebar('off-documents')}
    <main class="admin-main">
      <div class="admin-page-header">
        <div>
          <div class="admin-page-title">Case Documents</div>
          <div class="admin-page-sub">Submitted by applicants for your assigned sessions</div>
        </div>
      </div>

      <!-- Legal custody notice -->
      <div style="background:rgba(59,130,246,.04);border:1px solid rgba(59,130,246,.25);border-radius:12px;padding:16px 20px;margin-bottom:20px;display:flex;align-items:flex-start;gap:12px">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" style="flex-shrink:0;margin-top:1px"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        <div style="font-size:13px;line-height:1.65;color:#374151">
          <strong style="color:#1d4ed8;display:block;margin-bottom:3px">You are the sole custodian of these documents.</strong>
          As a commissioned US Notary Public, you hold these documents under notarial privilege. They are encrypted and accessible only to you — supervisors and all other OSMIO staff have no access. You may not share these documents with any third party. Disclosure requires a valid court order under applicable US law. Session recordings are held under the same protections.
        </div>
      </div>

      <!-- Session selector -->
      ${myReqs.length === 0 ? `
      <div class="admin-card" style="padding:40px;text-align:center;color:#9ca3af">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" style="margin:0 auto 12px;display:block"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
        No sessions assigned yet. Documents will appear here once a case is assigned to you.
      </div>` : `

      <div class="admin-card" style="margin-bottom:20px">
        <div class="admin-card-header">
          <div class="admin-card-title">Select a Case</div>
        </div>
        <div style="padding:0 4px">
          ${myReqs.map(r => `
          <button onclick="viewOffDocuments('${r.id}')" style="display:flex;align-items:center;gap:12px;width:100%;padding:12px 16px;border:none;border-radius:8px;cursor:pointer;text-align:left;transition:background .12s ease;background:${req && req.id===r.id?'rgba(124,58,237,.08)':'transparent'};margin-bottom:4px">
            ${avatar(r.userInitials, r.userAvatarColor, 34)}
            <div style="flex:1">
              <div style="font-size:13.5px;font-weight:700;color:#111827">${r.userName}</div>
              <div style="font-size:12px;color:#6b7280">${r.docTypes.join(' · ')} · ${fmtSlot(r.slotDate, r.slotTime)}</div>
            </div>
            <span style="font-family:monospace;font-size:11.5px;color:#9ca3af">${r.refId}</span>
          </button>`).join('')}
        </div>
      </div>

      ${req ? `
      <div class="admin-card">
        <div class="admin-card-header">
          <div style="display:flex;align-items:center;gap:10px">
            ${avatar(req.userInitials, req.userAvatarColor, 36)}
            <div>
              <div class="admin-card-title" style="margin-bottom:1px">${req.userName}</div>
              <div style="font-size:12.5px;color:#6b7280">${req.userEmail} · Session: ${fmtSlot(req.slotDate, req.slotTime)}</div>
            </div>
          </div>
          <div style="font-family:monospace;font-size:12px;color:#9ca3af">${req.refId}</div>
        </div>
        <div style="padding:20px">
          <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.6px;color:#9ca3af;margin-bottom:14px">Submitted Documents (${req.docTypes.length})</div>
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:16px;margin-bottom:24px">
            ${MOCK.currentUserDocuments.map((doc, i) => `
            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden">
              <div style="height:140px;background:#e2e8f0;display:flex;align-items:center;justify-content:center;padding:8px;cursor:pointer" onclick="showDocPreviewAdmin('${doc.svgKey}','${doc.label}')">
                <div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center">
                  ${MOCK.svgAssets[doc.svgKey] ? `<div style="transform:scale(0.65);transform-origin:center">${MOCK.svgAssets[doc.svgKey]}</div>` : `<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5" stroke-linecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`}
                </div>
              </div>
              <div style="padding:10px 12px">
                <div style="font-size:13px;font-weight:700;color:#111827;margin-bottom:2px">${doc.label}</div>
                <div style="font-size:11.5px;color:#6b7280;margin-bottom:4px">${doc.description}</div>
                <div style="font-size:11px;color:#10b981;font-weight:600">✓ Received ${doc.uploadedDate ? formatDate(doc.uploadedDate) : ''}</div>
                ${doc.trustSwiftlyRef ? `<div style="font-size:10.5px;color:#9ca3af;font-family:monospace;margin-top:2px">${doc.trustSwiftlyRef}</div>` : ''}
              </div>
            </div>`).join('')}
          </div>

          <div style="padding:14px 16px;background:rgba(245,158,11,.04);border:1px solid rgba(245,158,11,.2);border-radius:10px;display:flex;align-items:flex-start;gap:10px;font-size:12.5px;color:#92400e;line-height:1.6">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" style="flex-shrink:0;margin-top:1px"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <span>This session will be recorded. The recording will be stored under your exclusive notarial custody alongside these documents, subject to the same legal protections. Do not share the recording link with any third party.</span>
          </div>

          ${req.meetingLink ? `
          <div style="margin-top:16px;display:flex;gap:10px;align-items:center">
            <button class="btn-approve" style="padding:9px 20px;font-size:13px;border-radius:9px" onclick="joinSession('${req.id}')">Join Session →</button>
            <span style="font-size:12px;color:#9ca3af">Session: ${fmtSlotLong(req.slotDate, req.slotTime)}</span>
          </div>` : ''}
        </div>
      </div>` : ''}
      `}

      <!-- Document preview modal -->
      <div id="admin-doc-modal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:999;display:flex;align-items:center;justify-content:center" onclick="if(event.target.id==='admin-doc-modal')this.style.display='none'">
        <div style="background:#fff;border-radius:16px;padding:24px;max-width:500px;width:90%;max-height:80vh;overflow-y:auto">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
            <strong id="admin-doc-modal-title" style="font-size:15px;color:#111827"></strong>
            <button onclick="document.getElementById('admin-doc-modal').style.display='none'" style="font-size:22px;color:#6b7280;background:none;border:none;cursor:pointer;line-height:1">×</button>
          </div>
          <div id="admin-doc-modal-body"></div>
        </div>
      </div>
    </main>
  </div>`;
  // Force display of the modal container to flex (it starts as none via style attr)
  const modal = document.getElementById('admin-doc-modal');
  if (modal) modal.style.display = 'none';
}

function showDocPreviewAdmin(svgKey, title) {
  const modal = document.getElementById('admin-doc-modal');
  if (!modal) return;
  document.getElementById('admin-doc-modal-title').textContent = title;
  document.getElementById('admin-doc-modal-body').innerHTML = MOCK.svgAssets[svgKey] || '<p style="color:#6b7280">Preview not available.</p>';
  modal.style.display = 'flex';
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
  const steps = ['Your Details', 'Documents', 'Schedule', 'Confirm'];
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
let pubData = { firstName:'', lastName:'', email:'', phone:'', docTypes:[], uploadedDocs:[] };
let pubSelectedSlot = null;

// ── Screen: Public Portal Landing ──────────────────────────────
function renderPublicVerify() {
  pubData = { firstName:'', lastName:'', email:'', phone:'', docTypes:[], uploadedDocs:[] };
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

      <h1 style="font-size:32px;font-weight:900;letter-spacing:-.6px;color:#111827;margin-bottom:12px;line-height:1.1">Get your documents<br>notarially attested</h1>
      <p style="font-size:16px;color:#6b7280;line-height:1.7;max-width:480px;margin:0 auto 40px">Upload your documents, schedule a 30-minute live video call with a commissioned US Notary Public, and receive an official notarial certificate — without needing an OSMIO account.</p>

      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:40px;text-align:left">
        <div style="background:#fff;border:1px solid #e2e8f0;border-radius:14px;padding:20px">
          <div style="width:36px;height:36px;background:rgba(124,58,237,.1);border-radius:10px;display:flex;align-items:center;justify-content:center;margin-bottom:12px">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" stroke-width="2.5" stroke-linecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          </div>
          <div style="font-size:13.5px;font-weight:700;color:#111827;margin-bottom:4px">Upload documents</div>
          <div style="font-size:12px;color:#6b7280;line-height:1.55">Securely submit the documents you need attested</div>
        </div>
        <div style="background:#fff;border:1px solid #e2e8f0;border-radius:14px;padding:20px">
          <div style="width:36px;height:36px;background:rgba(124,58,237,.1);border-radius:10px;display:flex;align-items:center;justify-content:center;margin-bottom:12px">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" stroke-width="2.5" stroke-linecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          </div>
          <div style="font-size:13.5px;font-weight:700;color:#111827;margin-bottom:4px">Schedule a call</div>
          <div style="font-size:12px;color:#6b7280;line-height:1.55">Pick a 30-minute slot with a notary that suits you</div>
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
          Documents are transmitted using end-to-end encryption and held in the exclusive custody of your assigned Notary Public under US notarial privilege law. They cannot be shared with any third party without a court order. Sessions are recorded and stored under the same protections.
        </div>
      </div>

      <p style="margin-top:20px;font-size:11px;color:#9ca3af">OSMIO Identity Network · US Notarial Law Applies · <a href="javascript:void(0)" style="color:#9ca3af">Privacy Policy</a></p>
    </main>
  </div>`;
}

// ── Screen: Public — Personal Details & Documents ──────────────
function renderPublicUpload() {
  document.getElementById('app').innerHTML = `
  <div style="min-height:100vh;background:#f8fafc;display:flex;flex-direction:column">
    ${pubHeader(0)}

    <main style="flex:1;max-width:640px;margin:0 auto;padding:40px 24px;width:100%">
      <h2 style="font-size:22px;font-weight:900;letter-spacing:-.4px;color:#111827;margin-bottom:4px">Your details &amp; documents</h2>
      <p style="font-size:14px;color:#6b7280;margin-bottom:28px">Enter your contact information and upload the documents you'd like attested.</p>

      <!-- Contact info -->
      <div style="background:#fff;border:1px solid #e2e8f0;border-radius:16px;padding:24px 28px;margin-bottom:16px">
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

      <!-- Document type selection -->
      <div style="background:#fff;border:1px solid #e2e8f0;border-radius:16px;padding:24px 28px;margin-bottom:16px">
        <div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.6px;color:#9ca3af;margin-bottom:16px">What would you like attested?</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px" id="pub-doctype-grid">
          ${[
            ['Government ID (Passport / DL)', 'passport'],
            ['Birth Certificate', 'birth'],
            ['Marriage / Divorce Certificate', 'marriage'],
            ['Academic Transcripts / Degree', 'academic'],
            ['Financial Documents', 'financial'],
            ['Power of Attorney', 'poa'],
            ['Property / Title Deed', 'property'],
            ['Other / Custom', 'other'],
          ].map(([label, key]) => `
          <label style="display:flex;align-items:center;gap:10px;padding:12px 14px;border:1px solid #e2e8f0;border-radius:10px;cursor:pointer;transition:all .12s ease;font-size:13px;color:#374151;font-weight:500" id="pub-dtype-${key}" onclick="togglePubDocType('${key}',this)">
            <input type="checkbox" style="accent-color:#7c3aed;width:15px;height:15px;cursor:pointer" ${pubData.docTypes.includes(key)?'checked':''}>
            ${label}
          </label>`).join('')}
        </div>
      </div>

      <!-- File upload -->
      <div style="background:#fff;border:1px solid #e2e8f0;border-radius:16px;padding:24px 28px;margin-bottom:24px">
        <div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.6px;color:#9ca3af;margin-bottom:16px">Upload Documents</div>
        <label style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;border:2px dashed #d1d5db;border-radius:12px;padding:28px;cursor:pointer;transition:border-color .15s ease;background:#fafafa" onmouseover="this.style.borderColor='#7c3aed'" onmouseout="this.style.borderColor='#d1d5db'">
          <input type="file" style="display:none" accept="image/*,.pdf" multiple onchange="handlePubFileAdd(this)">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="1.5" stroke-linecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          <div style="text-align:center">
            <div style="font-size:14px;font-weight:600;color:#374151">Drop files or click to upload</div>
            <div style="font-size:12px;color:#9ca3af;margin-top:2px">PDF or image · Max 20 MB each</div>
          </div>
        </label>
        <div id="pub-file-list" style="margin-top:12px">
          ${pubData.uploadedDocs.map((f,i) => pubFileRow(f,i)).join('')}
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

function pubFileRow(name, i) {
  return `<div style="display:flex;align-items:center;gap:10px;padding:9px 12px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:9px;margin-top:8px;font-size:13px;color:#374151">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" stroke-width="2.5" stroke-linecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
    <span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${name}</span>
    <button onclick="removePubFile(${i})" style="background:none;border:none;color:#9ca3af;cursor:pointer;font-size:16px;line-height:1;padding:0 2px" title="Remove">×</button>
  </div>`;
}

function togglePubDocType(key, el) {
  const idx = pubData.docTypes.indexOf(key);
  if (idx >= 0) {
    pubData.docTypes.splice(idx, 1);
    el.style.borderColor = '#e2e8f0';
    el.style.background = '';
  } else {
    pubData.docTypes.push(key);
    el.style.borderColor = '#7c3aed';
    el.style.background = 'rgba(124,58,237,.04)';
  }
}

function handlePubFileAdd(input) {
  Array.from(input.files).forEach(f => {
    if (!pubData.uploadedDocs.includes(f.name)) pubData.uploadedDocs.push(f.name);
  });
  const list = document.getElementById('pub-file-list');
  if (list) list.innerHTML = pubData.uploadedDocs.map((f,i) => pubFileRow(f,i)).join('');
}

function removePubFile(i) {
  pubData.uploadedDocs.splice(i, 1);
  const list = document.getElementById('pub-file-list');
  if (list) list.innerHTML = pubData.uploadedDocs.map((f,i) => pubFileRow(f,i)).join('');
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
    ${pubHeader(2)}
    <main style="flex:1;max-width:700px;margin:0 auto;padding:40px 24px;width:100%">
      <h2 style="font-size:22px;font-weight:900;letter-spacing:-.4px;color:#111827;margin-bottom:4px">Choose a time slot</h2>
      <p style="font-size:14px;color:#6b7280;margin-bottom:8px">Select a 30-minute slot for your video call with a commissioned US Notary Public.</p>

      <div style="display:flex;align-items:flex-start;gap:8px;padding:10px 14px;background:rgba(245,158,11,.06);border:1px solid rgba(245,158,11,.2);border-radius:9px;margin-bottom:24px;font-size:12.5px;color:#92400e;line-height:1.55">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" style="flex-shrink:0;margin-top:1px"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        This session will be <strong>recorded</strong> and kept in the exclusive custody of your Notary Public under US notarial privilege. It cannot be shared with any third party without a court order.
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
          <div style="font-size:12px;color:#6b7280;margin-top:1px">30-minute video call · Notary assigned on confirmation</div>
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
    ${pubHeader(3)}
    <main style="flex:1;max-width:600px;margin:0 auto;padding:40px 24px;width:100%">
      <h2 style="font-size:22px;font-weight:900;letter-spacing:-.4px;color:#111827;margin-bottom:4px">Review your request</h2>
      <p style="font-size:14px;color:#6b7280;margin-bottom:24px">Check the details below, then confirm to submit your attestation request.</p>

      <div style="background:#fff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;margin-bottom:16px">
        <div style="padding:18px 24px;border-bottom:1px solid #f1f5f9">
          <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.6px;color:#9ca3af;margin-bottom:12px">Applicant</div>
          <div style="font-size:15px;font-weight:700;color:#111827">${pubData.firstName} ${pubData.lastName}</div>
          <div style="font-size:13px;color:#6b7280;margin-top:2px">${pubData.email}${pubData.phone ? ' · ' + pubData.phone : ''}</div>
        </div>
        <div style="padding:18px 24px;border-bottom:1px solid #f1f5f9">
          <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.6px;color:#9ca3af;margin-bottom:10px">Documents to Attest</div>
          ${pubData.docTypes.length === 0 && pubData.uploadedDocs.length === 0 ? '<div style="font-size:13px;color:#9ca3af;font-style:italic">No document types selected</div>' : ''}
          ${pubData.docTypes.map(k => {
            const labels = {passport:'Government ID (Passport / DL)',birth:'Birth Certificate',marriage:'Marriage / Divorce Certificate',academic:'Academic Transcripts / Degree',financial:'Financial Documents',poa:'Power of Attorney',property:'Property / Title Deed',other:'Other / Custom'};
            return `<div style="display:flex;align-items:center;gap:8px;font-size:13.5px;color:#374151;margin-bottom:6px">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" stroke-width="2.5" stroke-linecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/></svg>
              ${labels[k] || k}
            </div>`;
          }).join('')}
          ${pubData.uploadedDocs.map(f => `<div style="display:flex;align-items:center;gap:8px;font-size:13px;color:#6b7280;margin-bottom:5px">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2.5" stroke-linecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            ${f}
          </div>`).join('')}
        </div>
        <div style="padding:18px 24px">
          <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.6px;color:#9ca3af;margin-bottom:10px">Scheduled Slot</div>
          <div style="font-size:15px;font-weight:700;color:#111827">${pubSelectedSlot.label}</div>
          <div style="font-size:13px;color:#6b7280;margin-top:2px">30-minute video call · Notary assigned within 1 business day</div>
        </div>
      </div>

      <div style="padding:14px 18px;background:rgba(124,58,237,.05);border:1px solid rgba(124,58,237,.15);border-radius:12px;margin-bottom:24px;font-size:12.5px;color:#4c1d95;line-height:1.65">
        <strong>By confirming</strong> you agree that your documents and video session will be held in the secure custody of your assigned US Notary Public under notarial privilege. They cannot be disclosed to any third party without a court order. You will receive a notarial certificate at <strong>${pubData.email}</strong> after a successful session.
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
          Your documents and chosen time slot have been received. A supervisor will assign a Notary Public to your session within 1 business day — you'll receive a confirmation email at <strong style="color:#374151">${pubData.email}</strong>.
        </p>
        <div style="background:#fff;border:1px solid #e2e8f0;border-radius:14px;padding:20px 24px;margin-bottom:28px;text-align:left;font-size:13.5px;color:#374151;line-height:1.7">
          <div>Reference: <strong style="color:#7c3aed;font-family:monospace">${refId}</strong></div>
          <div>Slot: <strong>${pubSelectedSlot.label}</strong></div>
          <div>Confirmation sent to: <strong>${pubData.email}</strong></div>
        </div>
        <div style="padding:14px 18px;background:rgba(124,58,237,.05);border:1px solid rgba(124,58,237,.12);border-radius:12px;font-size:12.5px;color:#4c1d95;line-height:1.65;margin-bottom:28px;text-align:left">
          After a successful video session your Notary Public will issue a notarial certificate. This will be sent to you by email and is also verifiable at <strong>verify.osmio.id</strong> using your reference number.
        </div>
        <button onclick="router.go('public-verify')" style="background:none;border:1px solid #7c3aed;border-radius:10px;padding:10px 24px;font-size:13.5px;font-weight:700;color:#7c3aed;cursor:pointer">Start another request</button>
      </main>
    </div>`;
  }, 1200);
}

// ══════════════════════════════════════════════════════════════
// LEGACY ADMIN SCREENS (verification queue)
// ══════════════════════════════════════════════════════════════

function adminSidebar(activePage) {
  const pending = MOCK.verificationQueue.filter(v => v.status === 'pending').length;
  const p = adminPersona || { initials:'AO', avatarColor:'#aa1945', name:'Admin', role:'Attestation Officer' };
  return `
    <aside class="admin-sidebar">
      <div class="admin-sidebar-logo">
        <div class="admin-sidebar-logo-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        </div>
        <div>
          <div class="admin-sidebar-logo-text">OSMIO</div>
          <div class="admin-sidebar-logo-sub">Attestation Officer Portal</div>
        </div>
      </div>
      <nav class="admin-nav">
        <div class="admin-nav-section-label">Main</div>
        <button class="admin-nav-item ${activePage==='dashboard'?'active':''}" onclick="router.go('dashboard')">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
          Dashboard
        </button>
        <button class="admin-nav-item ${activePage==='verifications'?'active':''}" onclick="router.go('dashboard')">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          Verifications
          ${pending > 0 ? `<span class="admin-nav-item-badge">${pending}</span>` : ''}
        </button>
        <div class="admin-nav-section-label">Users</div>
        <button class="admin-nav-item ${activePage==='users'?'active':''}" onclick="router.go('users')">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          All Users
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
          <span>${p.role || 'Attestation Officer'}</span>
        </div>
      </div>
    </aside>`;
}

function renderDashboard() {
  if (!adminPersona) { router.go('login'); return; }
  const queue = MOCK.verificationQueue;
  const pending  = queue.filter(v => v.status === 'pending').length;
  const approved = queue.filter(v => v.status === 'approved').length;
  const rejected = queue.filter(v => v.status === 'rejected').length;
  const total    = MOCK.users.length;
  const filtered = activeFilter === 'all' ? queue : queue.filter(v => v.status === activeFilter);

  const tableRows = filtered.map(v => `
    <tr onclick="selectReview('${v.id}')">
      <td><div class="admin-user-cell">${avatar(v.initials, v.avatarColor, 34)}<div><strong>${v.userName}</strong><span>${v.email}</span></div></div></td>
      <td style="font-family:monospace;font-size:12px;color:#6b7280">${v.certId}</td>
      <td>${formatDate(v.submittedDate)}<br><span style="font-size:11px;color:#9ca3af">${timeAgo(v.submittedDate)}</span></td>
      <td><div style="display:flex;align-items:center;gap:6px">
        <span style="font-size:13px;font-weight:700;color:${v.idqaCurrent>=12?'#10b981':'#f59e0b'}">${v.idqaCurrent}</span>
        ${v.status==='approved'?'':`<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg><span style="font-size:13px;font-weight:700;color:#10b981">${v.idqaIfApproved||12}</span>`}
      </div></td>
      <td><span class="admin-badge ${v.status}"><span class="admin-badge-dot"></span>${v.status.charAt(0).toUpperCase()+v.status.slice(1)}</span></td>
      <td>${v.status==='pending'?`<button class="btn-admin-outline" style="font-size:12px;padding:5px 12px" onclick="event.stopPropagation();selectReview('${v.id}')">Review →</button>`:`<span style="font-size:12px;color:#9ca3af">${formatDate(v.resolvedDate)}</span>`}</td>
    </tr>`).join('');

  document.getElementById('app').innerHTML = `
    <div class="admin-layout">
      ${adminSidebar('dashboard')}
      <main class="admin-main">
        <div class="admin-page-header">
          <div>
            <div class="admin-page-title">Attestation Dashboard</div>
            <div class="admin-page-sub">Document verification queue</div>
          </div>
          <div style="font-size:12px;color:#9ca3af;font-weight:500">${new Date().toLocaleDateString('en-US',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</div>
        </div>
        <div class="admin-stats-row">
          <div class="admin-stat-card pending"><div class="admin-stat-label">Pending</div><div class="admin-stat-val">${pending}</div><div class="admin-stat-sub">Awaiting action</div></div>
          <div class="admin-stat-card approved"><div class="admin-stat-label">Approved</div><div class="admin-stat-val">${approved}</div><div class="admin-stat-sub">Attested</div></div>
          <div class="admin-stat-card rejected"><div class="admin-stat-label">Rejected</div><div class="admin-stat-val">${rejected}</div><div class="admin-stat-sub">Attestation rejected</div></div>
          <div class="admin-stat-card total"><div class="admin-stat-label">Total Users</div><div class="admin-stat-val">${total}</div><div class="admin-stat-sub">Registered</div></div>
        </div>
        <div class="admin-card">
          <div class="admin-card-header">
            <div class="admin-card-title">Verification Queue</div>
            <div class="admin-filter-tabs">
              ${['all','pending','approved','rejected'].map(f=>`<button class="admin-filter-tab ${activeFilter===f?'active':''}" onclick="setFilter('${f}')">${f.charAt(0).toUpperCase()+f.slice(1)}${f==='pending'&&pending>0?` (${pending})`:''}</button>`).join('')}
            </div>
          </div>
          <div style="overflow-x:auto"><table class="admin-table"><thead><tr><th>User</th><th>Osmio ID Pair</th><th>Submitted</th><th>IDQA</th><th>Status</th><th>Action</th></tr></thead><tbody>${tableRows||`<tr><td colspan="6" style="text-align:center;color:#9ca3af;padding:28px">No ${activeFilter} requests</td></tr>`}</tbody></table></div>
        </div>
      </main>
    </div>`;
}

function setFilter(f) { activeFilter = f; renderDashboard(); }
function selectReview(id) { selectedVerificationId = id; router.go('review'); }

function renderReview() {
  if (!adminPersona) { router.go('login'); return; }
  const v = MOCK.verificationQueue.find(x => x.id === selectedVerificationId) || MOCK.verificationQueue[0];
  if (!v) { router.go('dashboard'); return; }
  const fieldLabels = { firstName:'First Name', lastName:'Last Name', dob:'Date of Birth', photo:'Photo' };
  const fieldRows = Object.entries(v.submittedFields).map(([key, f]) => `
    <div class="admin-review-field-row">
      <div class="admin-review-field-key">${fieldLabels[key]||key}</div>
      <div class="admin-review-field-submitted">${f.submitted}</div>
      <div class="admin-review-field-enrolled">${f.enrolled||'—'}</div>
      <div class="admin-review-match ${f.match===true?'yes':f.match===false?'no':'na'}">${f.match===true?'✓ Match':f.match===false?'✗ Mismatch':'N/A'}</div>
    </div>`).join('');
  const isResolved = v.status !== 'pending';

  document.getElementById('app').innerHTML = `
    <div class="admin-layout">
      ${adminSidebar('dashboard')}
      <main class="admin-main">
        <div class="admin-page-header">
          <div>
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:4px">
              <button class="btn-admin-outline" onclick="router.go('dashboard')">← Back</button>
              <div class="admin-page-title">Review: ${v.userName}</div>
              <span class="admin-badge ${v.status}"><span class="admin-badge-dot"></span>${v.status.charAt(0).toUpperCase()+v.status.slice(1)}</span>
            </div>
            <div class="admin-page-sub">Verification request · ${formatDateTime(v.submittedDate)}</div>
          </div>
        </div>
        <div class="admin-review-grid" style="margin-bottom:16px">
          <div class="admin-card" style="padding:20px">
            <div class="admin-review-label">User</div>
            <div style="display:flex;align-items:center;gap:10px;margin:8px 0 12px">${avatar(v.initials, v.avatarColor, 44)}<div><div class="admin-review-val">${v.userName}</div><div style="font-size:12.5px;color:#6b7280">${v.email}</div></div></div>
            <div class="admin-review-label">Osmio ID Pair</div>
            <div style="font-family:monospace;font-size:12.5px;color:#374151;margin-top:3px">${v.certId}</div>
          </div>
          <div class="admin-card" style="padding:20px">
            <div class="admin-review-grid" style="margin:0;gap:14px">
              <div><div class="admin-review-label">Current IDQA</div><div class="admin-review-val" style="color:${v.idqaCurrent>=12?'#10b981':'#f59e0b'}">${v.idqaCurrent}</div></div>
              <div><div class="admin-review-label">IDQA if Approved</div><div class="admin-review-val" style="color:#10b981">${v.idqaIfApproved||12}</div></div>
              <div><div class="admin-review-label">Liveliness Check Ref</div><div style="font-family:monospace;font-size:13px;color:#374151;margin-top:3px">${v.trustSwiftlyRef}</div></div>
              <div><div class="admin-review-label">Submitted</div><div style="font-size:13px;font-weight:600;color:#374151;margin-top:3px">${formatDateTime(v.submittedDate)}</div></div>
            </div>
          </div>
        </div>
        <div class="admin-card" style="margin-bottom:16px">
          <div class="admin-card-header"><div class="admin-card-title">Data Comparison</div><span style="font-size:12px;color:#9ca3af">Submitted vs Enrollment Record</span></div>
          <div style="padding:16px 20px">
            <div style="display:grid;grid-template-columns:110px 1fr 1fr auto;gap:8px;padding:8px 0;border-bottom:1px solid #e2e6ef;margin-bottom:4px">
              <div style="font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#9ca3af">Field</div>
              <div style="font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#9ca3af">Submitted</div>
              <div style="font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#9ca3af">Enrollment</div>
              <div style="font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#9ca3af">Match</div>
            </div>
            ${fieldRows}
          </div>
        </div>
        <div class="admin-card" style="margin-bottom:16px">
          <div class="admin-card-header"><div class="admin-card-title">Submitted Documents</div></div>
          <div style="padding:16px 20px;display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:14px">
            ${MOCK.currentUserDocuments.map(doc=>`
              <div class="admin-doc-card" onclick="adminPreviewDoc('${doc.svgKey}','${doc.label}')">
                <div class="admin-doc-thumb"><div class="admin-doc-thumb-inner">${MOCK.svgAssets[doc.svgKey]}</div><div class="admin-doc-overlay">Click to enlarge</div></div>
                <div class="admin-doc-meta"><strong>${doc.label}</strong><span>${doc.description}</span><span style="color:#9ca3af;font-size:11px">${formatDateTime(doc.uploadedDate)}</span>${doc.trustSwiftlyRef?`<span style="font-family:monospace;font-size:11px;color:#6b7280">${doc.trustSwiftlyRef}</span>`:''}</div>
              </div>`).join('')}
          </div>
        </div>
        <div id="adm-doc-modal" class="adm-doc-modal hidden" onclick="if(event.target.id==='adm-doc-modal')this.classList.add('hidden')">
          <div class="adm-doc-modal-inner">
            <div class="adm-doc-modal-hdr"><span id="adm-doc-title" style="font-weight:700;color:#111827"></span><button onclick="document.getElementById('adm-doc-modal').classList.add('hidden')" style="font-size:22px;color:#6b7280;line-height:1;background:none;border:none;cursor:pointer">×</button></div>
            <div id="adm-doc-body" style="padding:16px;overflow:auto;max-height:70vh"></div>
          </div>
        </div>
        <div class="admin-action-card">
          <h3>${isResolved?'Resolution':'Decision'}</h3>
          ${isResolved?`
            <div style="margin-bottom:14px"><span class="admin-badge ${v.status}" style="font-size:13px;padding:6px 12px"><span class="admin-badge-dot"></span>${v.status==='approved'?'Approved':'Rejected'} · ${formatDateTime(v.resolvedDate)}</span></div>
            <div style="padding:12px 14px;background:#f8f9fc;border-radius:9px;border:1px solid #e2e6ef;font-size:13.5px;color:#374151"><strong style="display:block;margin-bottom:4px;font-size:12px;text-transform:uppercase;letter-spacing:.4px;color:#9ca3af">Admin Note</strong>${v.adminNote||'(No note provided)'}</div>
            <div style="margin-top:14px"><button class="btn-admin-outline" onclick="router.go('dashboard')">← Back to queue</button></div>`:
            `<textarea class="admin-note-input" id="admin-note" placeholder="Add a note for the user (optional)…"></textarea>
            <div class="admin-action-btns">
              <button class="btn-approve" onclick="resolveVerification('${v.id}','approved')">✓ Approve</button>
              <button class="btn-reject" onclick="resolveVerification('${v.id}','rejected')">✗ Reject</button>
            </div>`}
        </div>
      </main>
    </div>`;
}

function adminPreviewDoc(svgKey, title) {
  const modal = document.getElementById('adm-doc-modal');
  if (!modal) return;
  document.getElementById('adm-doc-title').textContent = title;
  document.getElementById('adm-doc-body').innerHTML = `<div style="max-width:700px;margin:0 auto">${MOCK.svgAssets[svgKey]||''}</div>`;
  modal.classList.remove('hidden');
}

function resolveVerification(id, decision) {
  const v = MOCK.verificationQueue.find(x => x.id === id);
  if (!v) return;
  const note = document.getElementById('admin-note') ? document.getElementById('admin-note').value.trim() : '';
  const btn = decision==='approved' ? document.querySelector('.btn-approve') : document.querySelector('.btn-reject');
  if (btn) { btn.innerHTML = `${SPINNER_SVG} Processing…`; btn.disabled = true; }
  setTimeout(() => {
    v.status = decision; v.resolvedDate = new Date().toISOString();
    v.adminNote = note || (decision==='approved'?'Identity verified successfully.':'Please resubmit with clearer documentation.');
    if (decision==='approved') {
      v.idqaCurrent = 12;
      const user = MOCK.users.find(u => u.id === v.userId);
      if (user) { user.idqa = 12; user.verificationStatus = 'approved'; }
    } else {
      const user = MOCK.users.find(u => u.id === v.userId);
      if (user) user.verificationStatus = 'rejected';
    }
    renderReview();
  }, 1000);
}

function renderUsers() {
  if (!adminPersona) { router.go('login'); return; }
  document.getElementById('app').innerHTML = `
    <div class="admin-layout">
      ${adminSidebar('users')}
      <main class="admin-main">
        <div class="admin-page-header"><div><div class="admin-page-title">All Users</div><div class="admin-page-sub">${MOCK.users.length} enrolled users</div></div></div>
        <div class="admin-card"><div style="overflow-x:auto"><table class="admin-table">
          <thead><tr><th>User</th><th>Osmio ID Pair</th><th>Enrolled</th><th>IDQA</th><th>Verification</th></tr></thead>
          <tbody>${MOCK.users.map(u=>`<tr><td><div class="admin-user-cell">${avatar(u.initials,u.avatarColor,34)}<div><strong>${u.name}</strong><span>${u.email}</span></div></div></td><td style="font-family:monospace;font-size:11.5px;color:#6b7280">${u.certId}</td><td style="font-size:13px;color:#6b7280">${formatDate(u.enrolledDate)}</td><td>${idqaBadge(u.idqa)}</td><td>${statusBadge(u.verificationStatus)}</td></tr>`).join('')}</tbody>
        </table></div></div>
      </main>
    </div>`;
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
    || 'Identity verified. Government-issued photo ID presented on camera and cross-checked. Liveness confirmed.';
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
  router.go('off-documents');
}

function renderOffSession() {
  if (!adminPersona) { router.go('login'); return; }
  clearInterval(sessionTimerInterval);

  const req = MOCK.attestationRequests.find(r => r.id === currentSessionReqId);
  if (!req) { router.go('off-documents'); return; }

  let elapsedSecs = 0;
  const fmtTimer = s => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;

  document.getElementById('app').innerHTML = `
  <div style="position:fixed;inset:0;background:#0d0d0d;display:flex;flex-direction:column;z-index:10">

    <!-- Top bar -->
    <div style="height:52px;background:rgba(0,0,0,.6);border-bottom:1px solid rgba(255,255,255,.07);display:flex;align-items:center;padding:0 20px;gap:16px;flex-shrink:0;backdrop-filter:blur(8px)">
      <div style="display:flex;align-items:center;gap:8px">
        <div style="width:28px;height:28px;background:linear-gradient(135deg,#7c3aed,#4c1d95);border-radius:8px;display:flex;align-items:center;justify-content:center">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        </div>
        <span style="font-size:13px;font-weight:800;color:#fff;letter-spacing:-.2px">OSMIO</span>
        <span style="font-size:12px;color:rgba(255,255,255,.35);font-weight:500">Attestation Session</span>
      </div>
      <div style="flex:1;display:flex;align-items:center;justify-content:center;gap:12px">
        <span style="display:flex;align-items:center;gap:6px;font-size:12px;font-weight:700;color:#ef4444">
          <span style="width:7px;height:7px;border-radius:50%;background:#ef4444;animation:pulse 1.5s ease-in-out infinite"></span>
          REC
        </span>
        <span style="font-size:14px;font-weight:700;font-family:monospace;color:#fff" id="session-timer">00:00</span>
        <span style="font-size:11.5px;color:rgba(255,255,255,.4);font-weight:500">${req.refId} · ${req.userName}</span>
      </div>
      <button onclick="endSession()" style="background:#dc2626;color:#fff;border:none;border-radius:8px;padding:7px 16px;font-size:12.5px;font-weight:700;cursor:pointer;display:flex;align-items:center;gap:6px;transition:background .15s" onmouseover="this.style.background='#b91c1c'" onmouseout="this.style.background='#dc2626'">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>
        End Session
      </button>
    </div>

    <!-- Main content -->
    <div style="flex:1;display:flex;overflow:hidden">

      <!-- Video area -->
      <div style="flex:1;position:relative;display:flex;align-items:center;justify-content:center;background:#111;overflow:hidden">

        <!-- Applicant video feed -->
        <div style="position:relative;width:100%;height:100%;display:flex;align-items:center;justify-content:center">
          <div style="width:min(600px,85%);aspect-ratio:16/9;background:#1a1a2e;border-radius:12px;overflow:hidden;position:relative;box-shadow:0 0 80px rgba(0,0,0,.6)">
            <!-- Simulated video: applicant face -->
            <div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:linear-gradient(180deg,#1a1a2e 0%,#0d0d1a 100%)">
              <div style="transform:scale(1.4);transform-origin:center 40%">${MOCK.svgAssets.userPhoto}</div>
            </div>
            <!-- Name overlay -->
            <div style="position:absolute;bottom:12px;left:14px;display:flex;align-items:center;gap:8px">
              <div style="background:rgba(0,0,0,.7);backdrop-filter:blur(4px);border-radius:6px;padding:5px 12px;font-size:13px;font-weight:700;color:#fff">${req.userName}</div>
              <div style="background:rgba(6,214,160,.2);border:1px solid rgba(6,214,160,.4);border-radius:6px;padding:5px 10px;font-size:11px;font-weight:700;color:#06d6a0">HD</div>
            </div>
            <!-- Connection quality -->
            <div style="position:absolute;top:10px;right:12px;display:flex;align-items:center;gap:3px">
              ${[1,2,3,4].map((b,i) => `<div style="width:3px;height:${6+i*3}px;background:${i<3?'#06d6a0':'rgba(255,255,255,.2)'};border-radius:1px"></div>`).join('')}
            </div>
          </div>
        </div>

        <!-- Officer PiP (bottom-right) -->
        <div style="position:absolute;bottom:80px;right:20px;width:160px;aspect-ratio:4/3;background:#1e1e2e;border-radius:10px;overflow:hidden;border:2px solid rgba(255,255,255,.1);box-shadow:0 4px 20px rgba(0,0,0,.5)">
          <div style="width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px">
            <div style="width:42px;height:42px;border-radius:50%;background:${adminPersona.avatarColor};display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:800;color:#fff">${adminPersona.initials}</div>
            <div style="font-size:10px;font-weight:600;color:rgba(255,255,255,.5)">You (Officer)</div>
          </div>
          <div style="position:absolute;bottom:6px;left:6px;font-size:10px;font-weight:700;color:#fff;background:rgba(0,0,0,.5);padding:2px 7px;border-radius:4px">${adminPersona.name.split(' ')[0]}</div>
        </div>
      </div>

      <!-- Right panel: case documents -->
      <div style="width:260px;background:#f8fafc;border-left:1px solid #e2e8f0;display:flex;flex-direction:column;overflow-y:auto;flex-shrink:0">
        <div style="padding:14px 16px;background:#fff;border-bottom:1px solid #e2e8f0">
          <div style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.8px;color:#9ca3af;margin-bottom:2px">Case Documents</div>
          <div style="font-size:13.5px;font-weight:700;color:#111827">${req.userName}</div>
          <div style="font-size:11.5px;color:#6b7280;font-family:monospace">${req.refId}</div>
        </div>
        <div style="padding:12px">
          ${req.docTypes.map(dt => `
          <div style="display:flex;align-items:center;gap:10px;padding:10px 12px;background:#fff;border:1px solid #e2e8f0;border-radius:9px;margin-bottom:8px">
            <div style="width:28px;height:28px;border-radius:7px;background:rgba(124,58,237,.1);display:flex;align-items:center;justify-content:center;flex-shrink:0">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" stroke-width="2.5" stroke-linecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            </div>
            <div style="flex:1;font-size:12.5px;font-weight:600;color:#374151">${dt}</div>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          </div>`).join('')}
        </div>
        <div style="padding:12px;margin-top:auto;border-top:1px solid #e2e8f0">
          <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.6px;color:#9ca3af;margin-bottom:8px">Session Notes</div>
          <textarea id="session-notes-input" placeholder="Jot notes during the call…" style="width:100%;height:90px;border:1px solid #e2e8f0;border-radius:8px;padding:8px 10px;font-size:12.5px;color:#374151;resize:none;outline:none;font-family:inherit;line-height:1.5"></textarea>
        </div>
      </div>
    </div>

    <!-- Bottom controls bar -->
    <div style="height:64px;background:rgba(0,0,0,.7);border-top:1px solid rgba(255,255,255,.06);display:flex;align-items:center;justify-content:center;gap:12px;flex-shrink:0;backdrop-filter:blur(8px)">
      ${[
        {icon:`<path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>`, label:'Mute'},
        {icon:`<path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>`, label:'Camera'},
        {icon:`<rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>`, label:'Share'},
      ].map(b => `
        <button onclick="showToast('This is a demo — ${b.label} disabled')" style="display:flex;flex-direction:column;align-items:center;gap:4px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.1);border-radius:10px;padding:8px 16px;cursor:pointer;color:rgba(255,255,255,.7);transition:all .15s" onmouseover="this.style.background='rgba(255,255,255,.14)'" onmouseout="this.style.background='rgba(255,255,255,.08)'">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${b.icon}</svg>
          <span style="font-size:10px;font-weight:600">${b.label}</span>
        </button>`).join('')}
      <button onclick="endSession()" style="background:#dc2626;color:#fff;border:none;border-radius:10px;padding:10px 28px;font-size:13px;font-weight:700;cursor:pointer;display:flex;align-items:center;gap:8px;margin-left:8px;transition:background .15s" onmouseover="this.style.background='#b91c1c'" onmouseout="this.style.background='#dc2626'">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>
        End Session
      </button>
    </div>

    <!-- End session modal -->
    <div id="session-end-modal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,.75);z-index:100;align-items:center;justify-content:center;backdrop-filter:blur(4px)">
      <div style="background:#fff;border-radius:20px;padding:32px;max-width:480px;width:90%;box-shadow:0 24px 80px rgba(0,0,0,.4)">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px">
          <div style="width:40px;height:40px;border-radius:12px;background:#dcfce7;display:flex;align-items:center;justify-content:center;flex-shrink:0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2.5" stroke-linecap="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          </div>
          <div>
            <div style="font-size:17px;font-weight:800;color:#111827">Session Complete</div>
            <div style="font-size:13px;color:#6b7280">${req.userName} · ${req.refId}</div>
          </div>
        </div>
        <div style="margin-bottom:16px">
          <label style="display:block;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#6b7280;margin-bottom:8px">Officer Notes</label>
          <textarea id="session-decision-notes" style="width:100%;height:100px;border:1.5px solid #e2e8f0;border-radius:10px;padding:10px 14px;font-size:13.5px;color:#374151;resize:none;outline:none;font-family:inherit;line-height:1.55;transition:border-color .15s" onfocus="this.style.borderColor='#7c3aed'" onblur="this.style.borderColor='#e2e8f0'" placeholder="Identity verified. Government-issued photo ID presented on camera and cross-checked. Liveness confirmed."></textarea>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
          <button onclick="rejectSession()" style="padding:12px;border:1.5px solid #dc2626;border-radius:10px;background:#fff;color:#dc2626;font-size:14px;font-weight:700;cursor:pointer;transition:all .15s" onmouseover="this.style.background='#fef2f2'" onmouseout="this.style.background='#fff'">✗ Reject</button>
          <button onclick="approveSession()" style="padding:12px;border:none;border-radius:10px;background:#16a34a;color:#fff;font-size:14px;font-weight:700;cursor:pointer;transition:background .15s" onmouseover="this.style.background='#15803d'" onmouseout="this.style.background='#16a34a'">✓ Approve Attestation</button>
        </div>
      </div>
    </div>
  </div>`;

  // Start the session timer
  setTimeout(() => {
    const timerEl = document.getElementById('session-timer');
    if (timerEl) {
      sessionTimerInterval = setInterval(() => {
        elapsedSecs++;
        if (timerEl) timerEl.textContent = fmtTimer(elapsedSecs);
      }, 1000);
    }
  }, 100);
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
  const notes      = req ? (req.sessionNotes || 'Identity verified by live video session. Government-issued photo ID (US Passport) presented and cross-checked.') : 'Identity verified.';

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
            I, <strong style="color:#111827">${officerName}</strong>, a Notary Public duly commissioned in the <strong style="color:#111827">State of Texas, USA</strong>, Commission No. <strong style="color:#111827">TX-2024-NP-00891</strong>, do hereby certify that on <strong style="color:#111827">${today}</strong>, the following individual appeared before me by live video call and presented satisfactory evidence of their identity:
          </p>

          <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:20px;margin-bottom:20px">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:0">
              ${[
                ['Full Name', userName],
                ['OSMIO Certificate ID', certId],
                ['Fields Attested', 'First Name, Last Name, Date of Birth'],
                ['Identity Document', 'US Passport (presented on camera)'],
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
        OSMIO notarial certificates are issued by commissioned US Notary Publics after a live video identity session. Each certificate is cryptographically signed and can be independently verified here. Certificate data is never shared with third parties.
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
  .on('sup-all-requests', renderSupAllRequests)
  .on('off-dashboard',    renderOffDashboard)
  .on('off-schedule',     renderOffSchedule)
  .on('off-availability', renderOffAvailability)
  .on('off-documents',    renderOffDocuments)
  .on('off-session',      renderOffSession)
  .on('off-cert-issued',  renderOffCertIssued)
  .on('verify-cert',      renderVerifyCert)
  .on('dashboard',        renderDashboard)
  .on('review',           renderReview)
  .on('users',            renderUsers)
  .init('login');

window.addEventListener('hashchange', () => {
  document.querySelectorAll('#demo-nav a').forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === `admin.html${location.hash}`);
  });
});
