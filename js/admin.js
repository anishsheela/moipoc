// =============================================================
// ADMIN — OSMIO Attestation Portal screens
// =============================================================

const router = new Router();
let adminAuthed = false;
let activeFilter = 'all';
let selectedVerificationId = null;

// ── Shared admin sidebar ───────────────────────────────────────
function adminSidebar(activePage) {
  const pending = MOCK.verificationQueue.filter(v => v.status === 'pending').length;
  return `
    <aside class="admin-sidebar">
      <div class="admin-sidebar-logo">
        <div class="admin-sidebar-logo-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        </div>
        <div>
          <div class="admin-sidebar-logo-text">OSMIO Admin</div>
          <div class="admin-sidebar-logo-sub">Attestation Portal</div>
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
        <div class="admin-sidebar-user-avatar">AO</div>
        <div class="admin-sidebar-user-info">
          <strong>Admin</strong>
          <span>${MOCK.admin.username}</span>
        </div>
      </div>
    </aside>`;
}

// ── Screen: Login ──────────────────────────────────────────────
function renderLogin() {
  adminAuthed = false;
  document.getElementById('app').innerHTML = `
    <div class="admin-login-screen">
      <div class="admin-login-card">
        <div class="admin-login-logo">
          <div class="admin-login-logo-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </div>
          <span class="admin-login-logo-text">OSMIO <span>Admin Portal</span></span>
        </div>
        <h1>Attestation Officer</h1>
        <p>Sign in to manage identity verification requests.</p>

        <div id="login-error" style="display:none;padding:10px 14px;background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.2);border-radius:8px;font-size:13px;color:#ef4444;margin-bottom:14px">
          Invalid credentials. Please try again.
        </div>

        <div class="admin-form-group">
          <label class="admin-form-label">Username</label>
          <input class="admin-form-input" type="email" id="admin-user" placeholder="admin@osmio.id" value="">
        </div>
        <div class="admin-form-group">
          <label class="admin-form-label">Password</label>
          <input class="admin-form-input" type="password" id="admin-pass" placeholder="••••••••" value=""
            onkeydown="if(event.key==='Enter')attemptLogin()">
        </div>

        <button class="btn-admin-primary" onclick="attemptLogin()">Sign In</button>

        <div class="admin-hint">
          Demo credentials: <code>admin@osmio.id</code> / <code>osmio2026</code>
        </div>
      </div>
    </div>`;
}

function attemptLogin() {
  const user = document.getElementById('admin-user').value.trim();
  const pass = document.getElementById('admin-pass').value.trim();
  const errEl = document.getElementById('login-error');

  if (user === MOCK.admin.username && pass === MOCK.admin.password) {
    adminAuthed = true;
    router.go('dashboard');
  } else {
    errEl.style.display = 'block';
    const input = document.getElementById('admin-pass');
    if (input) { input.value = ''; input.focus(); }
  }
}

// ── Screen: Dashboard ──────────────────────────────────────────
function renderDashboard() {
  if (!adminAuthed) { router.go('login'); return; }

  const queue = MOCK.verificationQueue;
  const pending  = queue.filter(v => v.status === 'pending').length;
  const approved = queue.filter(v => v.status === 'approved').length;
  const rejected = queue.filter(v => v.status === 'rejected').length;
  const total    = MOCK.users.length;

  const filtered = activeFilter === 'all' ? queue
    : queue.filter(v => v.status === activeFilter);

  const tableRows = filtered.map(v => `
    <tr onclick="selectReview('${v.id}')">
      <td>
        <div class="admin-user-cell">
          ${avatar(v.initials, v.avatarColor, 34)}
          <div>
            <strong>${v.userName}</strong>
            <span>${v.email}</span>
          </div>
        </div>
      </td>
      <td style="font-family:monospace;font-size:12px;color:#6b7280">${v.certId}</td>
      <td>${formatDate(v.submittedDate)}<br><span style="font-size:11px;color:#9ca3af">${timeAgo(v.submittedDate)}</span></td>
      <td>
        <div style="display:flex;align-items:center;gap:6px">
          <span style="font-size:13px;font-weight:700;color:${v.idqaCurrent>=12?'#10b981':'#f59e0b'}">${v.idqaCurrent}</span>
          ${v.status === 'approved' ? '' : `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg><span style="font-size:13px;font-weight:700;color:#10b981">${v.idqaIfApproved||12}</span>`}
        </div>
      </td>
      <td>
        <span class="admin-badge ${v.status}">
          <span class="admin-badge-dot"></span>
          ${v.status.charAt(0).toUpperCase()+v.status.slice(1)}
        </span>
      </td>
      <td>
        ${v.status === 'pending'
          ? `<button class="btn-admin-outline" style="font-size:12px;padding:5px 12px" onclick="event.stopPropagation();selectReview('${v.id}')">Review →</button>`
          : `<span style="font-size:12px;color:#9ca3af">${formatDate(v.resolvedDate)}</span>`}
      </td>
    </tr>`).join('');

  document.getElementById('app').innerHTML = `
    <div class="admin-layout">
      ${adminSidebar('dashboard')}
      <main class="admin-main">
        <div class="admin-page-header">
          <div>
            <div class="admin-page-title">Attestation Dashboard</div>
            <div class="admin-page-sub">Review and manage identity attestation requests</div>
          </div>
          <div style="font-size:12px;color:#9ca3af;font-weight:500">
            ${new Date().toLocaleDateString('en-US',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}
          </div>
        </div>

        <!-- Stats -->
        <div class="admin-stats-row">
          <div class="admin-stat-card pending">
            <div class="admin-stat-label">Pending Attestation</div>
            <div class="admin-stat-val">${pending}</div>
            <div class="admin-stat-sub">Awaiting action</div>
          </div>
          <div class="admin-stat-card approved">
            <div class="admin-stat-label">Approved</div>
            <div class="admin-stat-val">${approved}</div>
            <div class="admin-stat-sub">Attested</div>
          </div>
          <div class="admin-stat-card rejected">
            <div class="admin-stat-label">Rejected</div>
            <div class="admin-stat-val">${rejected}</div>
            <div class="admin-stat-sub">Attestation rejected</div>
          </div>
          <div class="admin-stat-card total">
            <div class="admin-stat-label">Total Users</div>
            <div class="admin-stat-val">${total}</div>
            <div class="admin-stat-sub">Registered in system</div>
          </div>
        </div>

        <!-- Table -->
        <div class="admin-card">
          <div class="admin-card-header">
            <div class="admin-card-title">Attestation Queue</div>
            <div class="admin-filter-tabs">
              ${['all','pending','approved','rejected'].map(f => `
                <button class="admin-filter-tab ${activeFilter===f?'active':''}" onclick="setFilter('${f}')">${f.charAt(0).toUpperCase()+f.slice(1)}${f==='pending'&&pending>0?` (${pending})`:''}</button>
              `).join('')}
            </div>
          </div>
          <div style="overflow-x:auto">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Certificate ID</th>
                  <th>Submitted</th>
                  <th>IDQA</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                ${tableRows || `<tr><td colspan="6" style="text-align:center;color:#9ca3af;padding:28px">No ${activeFilter} requests</td></tr>`}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Users overview -->
        <div class="admin-card">
          <div class="admin-card-header">
            <div class="admin-card-title">Enrolled Users</div>
            <span style="font-size:12px;color:#9ca3af">${MOCK.users.length} total</span>
          </div>
          <div style="overflow-x:auto">
            <table class="admin-table">
              <thead>
                <tr><th>User</th><th>Certificate</th><th>Enrolled</th><th>IDQA</th><th>Verification</th></tr>
              </thead>
              <tbody>
                ${MOCK.users.slice(0,8).map(u => `
                  <tr>
                    <td><div class="admin-user-cell">${avatar(u.initials, u.avatarColor, 30)}<div><strong>${u.name}</strong><span>${u.email}</span></div></div></td>
                    <td style="font-family:monospace;font-size:11.5px;color:#6b7280">${u.certId}</td>
                    <td style="font-size:13px;color:#6b7280">${formatDate(u.enrolledDate)}</td>
                    <td>${idqaBadge(u.idqa)}</td>
                    <td>${statusBadge(u.verificationStatus)}</td>
                  </tr>`).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>`;
}

function setFilter(f) {
  activeFilter = f;
  renderDashboard();
}

function selectReview(id) {
  selectedVerificationId = id;
  router.go('review');
}

// ── Screen: Review ─────────────────────────────────────────────
function renderReview() {
  if (!adminAuthed) { router.go('login'); return; }

  const v = MOCK.verificationQueue.find(x => x.id === selectedVerificationId)
         || MOCK.verificationQueue[0];

  if (!v) { router.go('dashboard'); return; }

  const fieldLabels = { firstName: 'First Name', lastName: 'Last Name', dob: 'Date of Birth', photo: 'Photo' };

  const fieldRows = Object.entries(v.submittedFields).map(([key, f]) => `
    <div class="admin-review-field-row">
      <div class="admin-review-field-key">${fieldLabels[key] || key}</div>
      <div class="admin-review-field-submitted">${f.submitted}</div>
      <div class="admin-review-field-enrolled">${f.enrolled || '—'}</div>
      <div class="admin-review-match ${f.match === true ? 'yes' : f.match === false ? 'no' : 'na'}">
        ${f.match === true ? '✓ Match' : f.match === false ? '✗ Mismatch' : 'N/A'}
      </div>
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

        <!-- User info -->
        <div class="admin-review-grid" style="margin-bottom:16px">
          <div class="admin-card" style="padding:20px">
            <div class="admin-review-label">User</div>
            <div style="display:flex;align-items:center;gap:10px;margin:8px 0 12px">
              ${avatar(v.initials, v.avatarColor, 44)}
              <div>
                <div class="admin-review-val">${v.userName}</div>
                <div style="font-size:12.5px;color:#6b7280">${v.email}</div>
              </div>
            </div>
            <div class="admin-review-label">Certificate ID</div>
            <div style="font-family:monospace;font-size:12.5px;color:#374151;margin-top:3px">${v.certId}</div>
          </div>
          <div class="admin-card" style="padding:20px">
            <div class="admin-review-grid" style="margin:0;gap:14px">
              <div>
                <div class="admin-review-label">Current IDQA</div>
                <div class="admin-review-val" style="color:${v.idqaCurrent>=12?'#10b981':'#f59e0b'}">${v.idqaCurrent}</div>
              </div>
              <div>
                <div class="admin-review-label">IDQA if Approved</div>
                <div class="admin-review-val" style="color:#10b981">${v.idqaIfApproved || 12}</div>
              </div>
              <div>
                <div class="admin-review-label">TrustSwiftly Ref</div>
                <div style="font-family:monospace;font-size:13px;color:#374151;margin-top:3px">${v.trustSwiftlyRef}</div>
              </div>
              <div>
                <div class="admin-review-label">Submitted</div>
                <div style="font-size:13px;font-weight:600;color:#374151;margin-top:3px">${formatDateTime(v.submittedDate)}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Field comparison -->
        <div class="admin-card" style="margin-bottom:16px">
          <div class="admin-card-header">
            <div class="admin-card-title">Data Comparison</div>
            <span style="font-size:12px;color:#9ca3af">Submitted vs Enrollment Record</span>
          </div>
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

        <!-- Documents card -->
        <div class="admin-card" style="margin-bottom:16px">
          <div class="admin-card-header">
            <div class="admin-card-title">Submitted Documents</div>
            <span style="font-size:12px;color:#9ca3af">${MOCK.currentUserDocuments.length} document(s)</span>
          </div>
          <div style="padding:16px 20px;display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:14px">
            ${MOCK.currentUserDocuments.map(doc => `
              <div class="admin-doc-card" onclick="adminPreviewDoc('${doc.svgKey}','${doc.label}')">
                <div class="admin-doc-thumb">
                  <div class="admin-doc-thumb-inner">${MOCK.svgAssets[doc.svgKey]}</div>
                  <div class="admin-doc-overlay">Click to enlarge</div>
                </div>
                <div class="admin-doc-meta">
                  <strong>${doc.label}</strong>
                  <span>${doc.description}</span>
                  <span style="color:#9ca3af;font-size:11px">${formatDateTime(doc.uploadedDate)}</span>
                  ${doc.trustSwiftlyRef ? `<span style="font-family:monospace;font-size:11px;color:#6b7280">${doc.trustSwiftlyRef}</span>` : ''}
                </div>
              </div>`).join('')}
          </div>
        </div>

        <!-- Document modal -->
        <div id="adm-doc-modal" class="adm-doc-modal hidden" onclick="if(event.target.id==='adm-doc-modal')this.classList.add('hidden')">
          <div class="adm-doc-modal-inner">
            <div class="adm-doc-modal-hdr">
              <span id="adm-doc-title" style="font-weight:700;color:#111827"></span>
              <button onclick="document.getElementById('adm-doc-modal').classList.add('hidden')" style="font-size:22px;color:#6b7280;line-height:1;background:none;border:none;cursor:pointer">×</button>
            </div>
            <div id="adm-doc-body" style="padding:16px;overflow:auto;max-height:70vh"></div>
          </div>
        </div>

        <!-- Action card -->
        <div class="admin-action-card">
          <h3>${isResolved ? 'Resolution' : 'Decision'}</h3>
          ${isResolved ? `
            <div style="margin-bottom:14px">
              <span class="admin-badge ${v.status}" style="font-size:13px;padding:6px 12px">
                <span class="admin-badge-dot"></span>
                ${v.status === 'approved' ? 'Approved' : 'Rejected'} · ${formatDateTime(v.resolvedDate)}
              </span>
            </div>
            <div style="padding:12px 14px;background:#f8f9fc;border-radius:9px;border:1px solid #e2e6ef;font-size:13.5px;color:#374151">
              <strong style="display:block;margin-bottom:4px;font-size:12px;text-transform:uppercase;letter-spacing:.4px;color:#9ca3af">Admin Note</strong>
              ${v.adminNote || '(No note provided)'}
            </div>
            <div style="margin-top:14px">
              <button class="btn-admin-outline" onclick="router.go('dashboard')">← Back to queue</button>
            </div>` : `
            <textarea class="admin-note-input" id="admin-note" placeholder="Add a note for the user (optional, shown on rejection)…"></textarea>
            <div class="admin-action-btns">
              <button class="btn-approve" onclick="resolveVerification('${v.id}','approved')">
                ✓ Approve
              </button>
              <button class="btn-reject" onclick="resolveVerification('${v.id}','rejected')">
                ✗ Reject
              </button>
            </div>`}
        </div>
      </main>
    </div>`;
}

function adminPreviewDoc(svgKey, title) {
  const modal = document.getElementById('adm-doc-modal');
  if (!modal) return;
  document.getElementById('adm-doc-title').textContent = title;
  document.getElementById('adm-doc-body').innerHTML = `<div style="max-width:700px;margin:0 auto">${MOCK.svgAssets[svgKey] || ''}</div>`;
  modal.classList.remove('hidden');
}

function resolveVerification(id, decision) {
  const v = MOCK.verificationQueue.find(x => x.id === id);
  if (!v) return;

  const note = document.getElementById('admin-note') ? document.getElementById('admin-note').value.trim() : '';
  const btn = decision === 'approved'
    ? document.querySelector('.btn-approve')
    : document.querySelector('.btn-reject');

  if (btn) {
    btn.innerHTML = `${SPINNER_SVG} Processing…`;
    btn.disabled = true;
  }

  setTimeout(() => {
    v.status = decision;
    v.resolvedDate = new Date().toISOString();
    v.adminNote = note || (decision === 'approved' ? 'Identity verified successfully.' : 'Please resubmit with clearer documentation.');
    if (decision === 'approved') {
      v.idqaCurrent = 12;
      const user = MOCK.users.find(u => u.id === v.userId);
      if (user) { user.idqa = 12; user.verificationStatus = 'approved'; }
    } else {
      const user = MOCK.users.find(u => u.id === v.userId);
      if (user) user.verificationStatus = 'rejected';
    }
    renderReview(); // re-render to show resolved state
  }, 1000);
}

// ── Screen: Users ──────────────────────────────────────────────
function renderUsers() {
  if (!adminAuthed) { router.go('login'); return; }

  document.getElementById('app').innerHTML = `
    <div class="admin-layout">
      ${adminSidebar('users')}
      <main class="admin-main">
        <div class="admin-page-header">
          <div>
            <div class="admin-page-title">All Users</div>
            <div class="admin-page-sub">${MOCK.users.length} enrolled users</div>
          </div>
        </div>
        <div class="admin-card">
          <div style="overflow-x:auto">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>User</th><th>Certificate</th><th>Enrolled</th><th>IDQA</th><th>Verification</th>
                </tr>
              </thead>
              <tbody>
                ${MOCK.users.map(u => `
                  <tr>
                    <td><div class="admin-user-cell">${avatar(u.initials, u.avatarColor, 34)}<div><strong>${u.name}</strong><span>${u.email}</span></div></div></td>
                    <td style="font-family:monospace;font-size:11.5px;color:#6b7280">${u.certId}</td>
                    <td style="font-size:13px;color:#6b7280">${formatDate(u.enrolledDate)}</td>
                    <td>${idqaBadge(u.idqa)}</td>
                    <td>${statusBadge(u.verificationStatus)}</td>
                  </tr>`).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>`;
}

// ── Router init ────────────────────────────────────────────────
router
  .on('login',     renderLogin)
  .on('dashboard', renderDashboard)
  .on('review',    renderReview)
  .on('users',     renderUsers)
  .init('login');

window.addEventListener('hashchange', () => {
  document.querySelectorAll('#demo-nav a').forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === `admin.html${location.hash}`);
  });
});
