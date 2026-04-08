// =============================================================
// NEXTCLOUD — File storage app screens
// Age requirement: 13+
// =============================================================

const router = new Router();

function ncLogoSVG(size = 32) {
  // Simplified Nextcloud cloud mark
  return `<svg width="${size}" height="${size}" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="40" rx="10" fill="#0082c9"/>
    <ellipse cx="13" cy="22" rx="7" ry="7" fill="white"/>
    <ellipse cx="27" cy="22" rx="7" ry="7" fill="white"/>
    <ellipse cx="20" cy="16" rx="9" ry="9" fill="white"/>
    <rect x="11" y="16" width="18" height="11" fill="white"/>
  </svg>`;
}

function ncTopBar(showProfile = false) {
  return `
    <header class="nc-topbar">
      <div class="nc-logo-mark">
        ${ncLogoSVG(30)}
        <span class="nc-logo-text">Nextcloud</span>
      </div>
      ${showProfile ? `
        <div class="nc-topbar-actions">
          <div style="display:flex;align-items:center;gap:8px;font-size:13px;font-weight:600;color:var(--nc-text-muted)">
            <div class="avatar" style="background:#0082c9;width:30px;height:30px;font-size:11px">AJ</div>
            Alex Johnson
          </div>
        </div>` : `
        <div class="nc-topbar-actions">
          <a href="index.html" style="font-size:12px;color:var(--nc-text-muted);font-weight:600">← Demo Hub</a>
        </div>`}
    </header>`;
}

// ── Auth helpers ───────────────────────────────────────────────
function startAuth(demoDob = null) {
  if (demoDob) {
    sessionStorage.setItem('moi_demo_dob', demoDob);
  }
  sessionStorage.setItem('moi_oauth_request', JSON.stringify({
    appName: 'Nextcloud',
    appId: 'nextcloud',
    requestId: 'req_' + Date.now(),
    certUsed: MOCK.currentUser.certs.numberplate.id,
    requiredFields: ['firstName', 'lastName', 'above13'],
    optionalFields: ['email'],
    returnTo: 'nextcloud.html#redirecting'
  }));
  router.go('cert-check');
}

function startAuthYoung() {
  startAuth('2016-01-15'); // age ~10 in 2026 → under 13
}

// ── Screen: Login ──────────────────────────────────────────────
function renderLogin() {
  document.getElementById('app').innerHTML = `
    <div class="nc-screen">
      ${ncTopBar()}
      <div class="nc-hero">
        <div class="nc-login-card">
          ${ncLogoSVG(48)}
          <h1 class="nc-login-tagline" style="margin-top:12px">Your files, your cloud.</h1>
          <p class="nc-login-sub">OSMIO Internal Nextcloud — secure file storage for all team members. Age 13+.</p>

          <div class="nc-trust-bar">
            <span>End-to-end encrypted</span>
            <span class="nc-trust-bar-dot"></span>
            <span>No passwords</span>
            <span class="nc-trust-bar-dot"></span>
            <span>Self-hosted</span>
          </div>

          <button class="btn-osmio-nc" onclick="startAuth()">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            Sign in with Osmio ID Pair
          </button>

          <div class="nc-demo-links">
            <span class="nc-demo-link-label">Demo scenarios</span>
            <span class="nc-demo-link" onclick="startAuth()">
              ✓ Normal signup — Alex (age 34) passes age 13+ check
            </span>
            <span class="nc-demo-link" onclick="startAuthYoung()">
              ⚠ Simulate: Under-13 user → Age restriction
            </span>
          </div>
        </div>
      </div>
    </div>`;
}

// ── Screen: Certificate Check ──────────────────────────────────
function renderCertCheck() {
  document.getElementById('app').innerHTML = `
    <div class="nc-screen">
      ${ncTopBar()}
      <div class="nc-cert-screen">
        <div class="nc-cert-card">
          <div class="nc-cert-header">
            <div class="nc-cert-icon-wrap">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <h2>Verifying your Osmio ID</h2>
            <p>Authenticating with your Osmio ID Pair</p>
          </div>
          <div class="cert-steps" id="cert-steps"></div>
        </div>
      </div>
    </div>`;

  const steps = [
    { icon: 'spin', type: 'loading', text: 'Scanning for Osmio ID Pair...', sub: null, delay: 0 },
    { icon: 'check', type: 'success', text: 'Osmio ID Pair detected', sub: MOCK.currentUser.certs.numberplate.id, delay: 900 },
    { icon: 'spin', type: 'loading', text: 'Validating with OSMIO Certificate Authority...', sub: null, delay: 1300 },
    { icon: 'check', type: 'success', text: 'Signature valid · Osmio ID Pair trusted', sub: `Issuer: ${MOCK.currentUser.certs.numberplate.issuer}`, delay: 2400 },
    { icon: 'check', type: 'success', text: 'Osmio ID Pair expires: Nov 15, 2026', sub: `Serial: ${MOCK.currentUser.certs.numberplate.serial}`, delay: 2800 },
    { icon: 'idqa', type: 'info', text: 'IDQA Score resolved', sub: 'Scale: 0–24 · ID Attested at 12', idqa: MOCK.currentUser.idqa, delay: 3300 },
    { icon: 'spin', type: 'loading', text: 'Preparing MOI licence request (age 13+)...', sub: null, delay: 3800 },
  ];

  steps.forEach((step, i) => {
    setTimeout(() => {
      const container = document.getElementById('cert-steps');
      if (!container) return;

      let iconHtml;
      if (step.icon === 'spin') {
        iconHtml = `<span>${SPINNER_SVG}</span>`;
      } else {
        iconHtml = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><polyline points="20 6 9 17 4 12" stroke-dasharray="40" stroke-dashoffset="40" style="animation:checkDraw .3s ease forwards"/></svg>`;
      }

      const div = document.createElement('div');
      div.className = 'cert-step';
      div.innerHTML = `
        <div class="cert-step-icon ${step.type}">${iconHtml}</div>
        <div class="cert-step-text">
          <strong>${step.text}</strong>
          ${step.sub ? `<span>${step.sub}</span>` : ''}
          ${step.idqa ? `<div class="cert-step-idqa">✓ IDQA ${step.idqa}/24 · ID Attested</div>` : ''}
        </div>`;
      container.appendChild(div);

      if (i === steps.length - 1) {
        setTimeout(() => {
          window.location.href = 'moi.html#consent';
        }, 1000);
      }
    }, step.delay);
  });
}

// ── Screen: Returning from MOI ─────────────────────────────────
function renderRedirecting() {
  document.getElementById('app').innerHTML = `
    <div class="nc-screen">
      ${ncTopBar()}
      <div class="nc-redirect-screen">
        <div class="nc-redirect-card">
          <div class="nc-redirect-spinner">
            ${SPINNER_SVG.replace('width="18"','width="28"').replace('height="18"','height="28"').replace('stroke-width="2.5"','stroke-width="2"').replace('currentColor','#0082c9')}
          </div>
          <h2>Receiving your profile</h2>
          <p>Securely transferring your MOI data to Nextcloud…</p>
          <div class="nc-redirect-progress">
            <div class="nc-redirect-bar" id="prog-bar"></div>
          </div>
        </div>
      </div>
    </div>`;

  requestAnimationFrame(() => {
    const bar = document.getElementById('prog-bar');
    if (bar) bar.style.width = '100%';
  });

  setTimeout(() => router.go('dashboard'), 2400);
}

// ── Screen: Age Denied ─────────────────────────────────────────
function renderAgeDenied() {
  sessionStorage.removeItem('moi_demo_dob');
  document.getElementById('app').innerHTML = `
    <div class="nc-screen">
      ${ncTopBar()}
      <div class="nc-denied-screen">
        <div class="nc-denied-card">
          <div class="nc-denied-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ef476f" stroke-width="2.5" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </div>
          <h2>Age Restriction</h2>
          <p>You must be 13 or older to use OSMIO Nextcloud.<br>
          Your MOI age attestation confirmed you do not meet this requirement.</p>

          <div style="margin-bottom:20px;padding:14px;background:rgba(239,71,111,.05);border:1px solid rgba(239,71,111,.15);border-radius:10px;font-size:12.5px;color:#6a7a88;text-align:left">
            <strong style="color:#1a2a38;display:block;margin-bottom:4px">How this works</strong>
            Your date of birth was never shared with Nextcloud. MOI computed the age check and sent only the pass/fail verdict, attested by your Osmio ID Pair.
          </div>

          <button class="btn-outline-nc" style="width:100%" onclick="router.go('login')">
            ← Back to login
          </button>
        </div>
      </div>
    </div>`;
}

// ── Screen: Dashboard ──────────────────────────────────────────
function renderDashboard() {
  const response = JSON.parse(sessionStorage.getItem('moi_oauth_response') || 'null');
  const moi = MOCK.currentUser.moi;
  const shared = (response && response.shared) || {};
  const above13 = shared.above13 !== undefined ? shared.above13 : { value: true, verified: moi.dob.verified };

  // Age gate
  if (above13 && above13.value === false) {
    renderAgeDenied();
    return;
  }

  sessionStorage.removeItem('moi_demo_dob');

  const firstName = (shared.firstName || moi.firstName).value;
  const email     = (shared.email    || moi.email).value;

  document.getElementById('app').innerHTML = `
    <div class="nc-screen">
      ${ncTopBar(true)}
      <div class="nc-dashboard">
        <div class="nc-dash-welcome">Welcome back</div>
        <div class="nc-dash-name">${firstName}'s Files 📁</div>

        <div class="nc-moi-notice">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          Profile received from MOI · Age 13+ verified · Signed in as ${email}
        </div>

        <div class="nc-file-section-label">Pinned folders</div>
        <div class="nc-files-grid">
          <div class="nc-file-card">
            <div class="nc-file-icon">📁</div>
            <div class="nc-file-name">Documents</div>
            <div class="nc-file-size">24 files</div>
          </div>
          <div class="nc-file-card">
            <div class="nc-file-icon">🖼</div>
            <div class="nc-file-name">Photos</div>
            <div class="nc-file-size">312 files</div>
          </div>
          <div class="nc-file-card">
            <div class="nc-file-icon">🎬</div>
            <div class="nc-file-name">Videos</div>
            <div class="nc-file-size">8 files</div>
          </div>
          <div class="nc-file-card">
            <div class="nc-file-icon">📊</div>
            <div class="nc-file-name">Spreadsheets</div>
            <div class="nc-file-size">6 files</div>
          </div>
        </div>

        <div class="nc-file-section-label">Recent files</div>
        <div>
          <div class="nc-list-row">
            <div class="nc-list-icon">📄</div>
            <div class="nc-list-name">Q1 Report 2026.docx</div>
            <div class="nc-list-meta">Modified 2h ago · 1.2 MB</div>
          </div>
          <div class="nc-list-row">
            <div class="nc-list-icon">🖼</div>
            <div class="nc-list-name">profile_photo.jpg</div>
            <div class="nc-list-meta">Modified yesterday · 3.4 MB</div>
          </div>
          <div class="nc-list-row">
            <div class="nc-list-icon">📊</div>
            <div class="nc-list-name">Budget_2026.xlsx</div>
            <div class="nc-list-meta">Modified 3 days ago · 540 KB</div>
          </div>
          <div class="nc-list-row">
            <div class="nc-list-icon">📄</div>
            <div class="nc-list-name">Identity_Docs.pdf</div>
            <div class="nc-list-meta">Modified Apr 5 · 2.1 MB</div>
          </div>
          <div class="nc-list-row">
            <div class="nc-list-icon">🗜</div>
            <div class="nc-list-name">backup_2026-04-01.zip</div>
            <div class="nc-list-meta">Modified Apr 1 · 45.2 MB</div>
          </div>
        </div>

        <div style="margin-top:20px;padding:14px 18px;background:rgba(0,130,201,.06);border:1px solid rgba(0,130,201,.15);border-radius:12px;font-size:12.5px;color:var(--nc-text-muted)">
          <strong style="color:var(--nc-primary);display:block;margin-bottom:4px">13.2 GB used of 50 GB</strong>
          <div style="margin-top:6px;height:6px;background:#dde;border-radius:999px;overflow:hidden">
            <div style="height:100%;width:26%;background:var(--nc-primary);border-radius:999px"></div>
          </div>
        </div>

        <div style="margin-top:20px;display:flex;gap:10px;flex-wrap:wrap">
          <button class="btn-outline-nc" style="width:auto;padding:10px 20px" onclick="router.go('login')">← Sign out</button>
          <button class="btn-outline-nc" style="width:auto;padding:10px 20px" onclick="window.location.href='moi.html#dashboard'">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            Manage MOI Data
          </button>
        </div>
      </div>
    </div>`;
}

// ── Router init ────────────────────────────────────────────────
router
  .on('login',      renderLogin)
  .on('cert-check', renderCertCheck)
  .on('redirecting',renderRedirecting)
  .on('dashboard',  renderDashboard)
  .on('age-denied', renderAgeDenied)
  .init('login');

document.querySelectorAll('#demo-nav a').forEach(a => {
  if (a.href === location.href) a.classList.add('active');
});
window.addEventListener('hashchange', () => {
  document.querySelectorAll('#demo-nav a').forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === `nextcloud.html${location.hash}`);
  });
});
