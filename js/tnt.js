// =============================================================
// TNT — Trusted & True app screens
// =============================================================

const router = new Router();

// ── TNT Logo SVG ───────────────────────────────────────────────
function tntLogoSVG(size = 34) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 34s-14-8-14-18a8 8 0 0 1 14-5.3A8 8 0 0 1 34 16c0 10-14 18-14 18z" fill="#aa1945" opacity=".85"/>
    <path d="M20 34s-10-6-12-14a8 8 0 0 1 12-8.5A8 8 0 0 1 32 20c-2 8-12 14-12 14z" fill="#82002b" opacity=".6"/>
  </svg>`;
}

function tntTopBar(showProfile = false) {
  return `
    <header class="tnt-topbar">
      <div class="tnt-logo-mark">
        ${tntLogoSVG(32)}
        <span class="tnt-logo-text">Trusted<span> & True</span></span>
      </div>
      ${showProfile ? `
        <div class="tnt-topbar-actions">
          <div style="display:flex;align-items:center;gap:8px;font-size:13px;font-weight:600;color:var(--tnt-text-muted)">
            <div class="avatar" style="background:#aa1945;width:30px;height:30px;font-size:11px">AJ</div>
            Alex Johnson
          </div>
        </div>` : `
        <div class="tnt-topbar-actions">
          <a href="index.html" style="font-size:12px;color:var(--tnt-text-muted);font-weight:600">← Demo Hub</a>
        </div>`}
    </header>`;
}

// ── Screen: Login ──────────────────────────────────────────────
function renderLogin() {
  document.getElementById('app').innerHTML = `
    <div class="tnt-screen">
      ${tntTopBar()}
      <div class="tnt-hero">
        <div class="tnt-login-card">
          ${tntLogoSVG(48)}
          <h1 class="tnt-login-tagline" style="margin-top:12px">Find your person.</h1>
          <p class="tnt-login-sub">Genuine connections, powered by verified identity.</p>

          <div class="tnt-trust-bar">
            <span>ID-verified members only</span>
            <span class="tnt-trust-bar-dot"></span>
            <span>End-to-end encrypted</span>
            <span class="tnt-trust-bar-dot"></span>
            <span>No passwords</span>
          </div>

          <button class="btn-osmio" onclick="startAuth()">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            Sign in with Osmio ID Pair
          </button>

          <div class="tnt-demo-links">
            <span class="tnt-demo-link-label">Demo scenarios</span>
            <span class="tnt-demo-link" onclick="router.go('access-denied')">
              ⚠ Simulate: No certificate installed → Access denied
            </span>
          </div>
        </div>
      </div>
    </div>`;
}

function startAuth() {
  // Store the OAuth-style request for MOI to read
  sessionStorage.setItem('moi_oauth_request', JSON.stringify({
    appName: 'Trusted & True',
    appId: 'tnt',
    requestId: 'req_' + Date.now(),
    certUsed: MOCK.currentUser.certs.foundation.id,
    requiredFields: ['firstName', 'lastName'],
    optionalFields: ['photo', 'dob', 'country'],
    returnTo: 'tnt.html#redirecting'
  }));
  router.go('cert-check');
}

// ── Screen: Certificate Check (animated) ──────────────────────
function renderCertCheck() {
  document.getElementById('app').innerHTML = `
    <div class="tnt-screen">
      ${tntTopBar()}
      <div class="tnt-cert-screen">
        <div class="tnt-cert-card">
          <div class="tnt-cert-header">
            <div class="tnt-cert-icon-wrap">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <h2>Verifying your Osmio ID</h2>
            <p>Authenticating with your client certificate</p>
          </div>
          <div class="cert-steps" id="cert-steps"></div>
        </div>
      </div>
    </div>`;

  const steps = [
    { icon: 'spin', type: 'loading', text: 'Scanning for Osmio ID Pair...', sub: null, delay: 0 },
    { icon: 'check', type: 'success', text: 'Certificate detected', sub: MOCK.currentUser.certs.foundation.id, delay: 900 },
    { icon: 'spin', type: 'loading', text: 'Validating with OSMIO Certificate Authority...', sub: null, delay: 1300 },
    { icon: 'check', type: 'success', text: 'Signature valid · Certificate trusted', sub: `Issuer: ${MOCK.currentUser.certs.foundation.issuer}`, delay: 2400 },
    { icon: 'check', type: 'success', text: 'Certificate expires: Nov 15, 2026', sub: `Serial: ${MOCK.currentUser.certs.foundation.serial}`, delay: 2800 },
    { icon: 'idqa', type: 'info', text: 'IDQA Score resolved', sub: 'Scale: 0–24 · ID Verified at 12', idqa: MOCK.currentUser.idqa, delay: 3300 },
    { icon: 'spin', type: 'loading', text: 'Preparing MOI permission request...', sub: null, delay: 3800 },
  ];

  steps.forEach((step, i) => {
    setTimeout(() => {
      const container = document.getElementById('cert-steps');
      if (!container) return;

      let iconHtml;
      if (step.icon === 'spin') {
        iconHtml = `<span>${SPINNER_SVG}</span>`;
      } else if (step.icon === 'check') {
        iconHtml = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><polyline points="20 6 9 17 4 12" stroke-dasharray="40" stroke-dashoffset="40" style="animation:checkDraw .3s ease forwards"/></svg>`;
      } else if (step.icon === 'idqa') {
        iconHtml = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>`;
      } else {
        iconHtml = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>`;
      }

      const div = document.createElement('div');
      div.className = 'cert-step';
      div.innerHTML = `
        <div class="cert-step-icon ${step.type}">${iconHtml}</div>
        <div class="cert-step-text">
          <strong>${step.text}</strong>
          ${step.sub ? `<span>${step.sub}</span>` : ''}
          ${step.idqa ? `<div class="cert-step-idqa">✓ IDQA ${step.idqa}/24 · ID Verified</div>` : ''}
        </div>`;
      container.appendChild(div);

      // Last step → redirect to MOI consent
      if (i === steps.length - 1) {
        setTimeout(() => {
          window.location.href = 'moi.html#consent';
        }, 1000);
      }
    }, step.delay);
  });
}

// ── Screen: Access Denied ──────────────────────────────────────
function renderAccessDenied() {
  document.getElementById('app').innerHTML = `
    <div class="tnt-screen">
      ${tntTopBar()}
      <div class="tnt-denied-screen">
        <div class="tnt-denied-card">
          <div class="tnt-denied-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ef476f" stroke-width="2.5" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </div>
          <h2>No Osmio ID Pair Found</h2>
          <p>Trusted & True requires a valid Osmio ID Pair to sign in.<br>
          No certificate was detected on this device.</p>

          <div style="margin-bottom:20px;padding:14px;background:rgba(239,71,111,.05);border:1px solid rgba(239,71,111,.15);border-radius:10px;font-size:12.5px;color:#9a7480;text-align:left">
            <strong style="color:#5a3040;display:block;margin-bottom:4px">What is an Osmio ID Pair?</strong>
            An Osmio ID Pair is a client SSL certificate that authenticates you without a username or password.
            It's issued after identity enrollment and lives securely on your device.
          </div>

          <button class="btn-tnt-primary" style="width:100%;margin-bottom:12px" onclick="window.open('https://osmio.id','_blank')">
            Enroll at osmio.id →
          </button>
          <button class="btn-outline-tnt" style="width:100%" onclick="router.go('login')">
            ← Back to login
          </button>
        </div>
      </div>
    </div>`;
}

// ── Screen: Returning from MOI ─────────────────────────────────
function renderRedirecting() {
  document.getElementById('app').innerHTML = `
    <div class="tnt-screen">
      ${tntTopBar()}
      <div class="tnt-redirect-screen">
        <div class="tnt-redirect-card">
          <div class="tnt-redirect-spinner">
            ${SPINNER_SVG.replace('width="18"','width="28"').replace('height="18"','height="28"').replace('stroke-width="2.5"','stroke-width="2"').replace('currentColor','#aa1945')}
          </div>
          <h2>Receiving your profile</h2>
          <p>Securely transferring your MOI data to Trusted & True…</p>
          <div class="tnt-redirect-progress">
            <div class="tnt-redirect-bar" id="prog-bar"></div>
          </div>
        </div>
      </div>
    </div>`;

  // Animate progress bar
  requestAnimationFrame(() => {
    const bar = document.getElementById('prog-bar');
    if (bar) bar.style.width = '100%';
  });

  // After 2.2s go to dashboard
  setTimeout(() => router.go('dashboard'), 2400);
}

// ── Screen: Dashboard ──────────────────────────────────────────
function renderDashboard() {
  const response = JSON.parse(sessionStorage.getItem('moi_oauth_response') || 'null');
  const u = MOCK.currentUser;
  const moi = u.moi;
  const tnt = MOCK.tntProfile;

  // What TNT received from MOI (shared fields or fallback to MOI data)
  const shared = (response && response.shared) || {};
  const sharedFirstName = shared.firstName || moi.firstName;
  const sharedLastName  = shared.lastName  || moi.lastName;
  const sharedPhoto     = shared.photo     || null;
  const sharedDob       = shared.dob       || null;
  const sharedCountry   = shared.country   || null;

  function field(label, fieldObj, notShared = false) {
    if (notShared || !fieldObj) {
      return `<div class="tnt-field">
        <div class="tnt-field-label">${label}</div>
        <div class="tnt-field-not-shared">Not shared</div>
      </div>`;
    }
    return `<div class="tnt-field">
      <div class="tnt-field-label">
        ${label}
        ${verifiedBadge(fieldObj.verified)}
      </div>
      <div class="tnt-field-value">${fieldObj.value || '—'}</div>
    </div>`;
  }

  document.getElementById('app').innerHTML = `
    <div class="tnt-screen">
      ${tntTopBar(true)}
      <div class="tnt-dashboard">
        <div class="tnt-dash-welcome">Welcome back</div>
        <div class="tnt-dash-name">${moi.firstName.value} ${moi.lastName.value} 👋</div>

        <div class="tnt-moi-notice">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          Profile data received from MOI · End-to-end encrypted transfer · Cert: ${u.certs.foundation.id}
        </div>

        <div class="tnt-profile-grid">
          <!-- Profile sidebar -->
          <div class="tnt-profile-card">
            <div class="tnt-profile-avatar">AJ</div>
            <div class="tnt-profile-fullname">${moi.firstName.value} ${moi.lastName.value}</div>
            <div style="margin:6px 0">${idqaBadge(u.idqa)}</div>
            <div style="font-size:12px;color:var(--tnt-text-muted);margin-top:4px">
              📍 ${tnt.location}
            </div>
            <div class="tnt-profile-stats">
              <div class="tnt-stat">
                <div class="tnt-stat-val">${tnt.matches}</div>
                <div class="tnt-stat-label">Matches</div>
              </div>
              <div class="tnt-stat">
                <div class="tnt-stat-val">${tnt.messages}</div>
                <div class="tnt-stat-label">Messages</div>
              </div>
              <div class="tnt-stat">
                <div class="tnt-stat-val">${tnt.profileComplete}%</div>
                <div class="tnt-stat-label">Profile</div>
              </div>
            </div>
            <div style="margin-top:16px;padding-top:14px;border-top:1px solid var(--tnt-border)">
              <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:var(--tnt-text-muted);margin-bottom:8px">Certificate used</div>
              <div style="font-size:11.5px;font-weight:700;color:var(--tnt-primary);font-family:monospace;word-break:break-all">${u.certs.foundation.id}</div>
              <div style="font-size:11px;color:var(--tnt-text-muted);margin-top:3px">Foundation Certificate</div>
            </div>
          </div>

          <!-- MOI data received -->
          <div class="tnt-moi-data-card">
            <div class="tnt-moi-header">
              <span class="tnt-moi-title">Data received from MOI</span>
              <span class="tnt-moi-source">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                moi.osmio.id
              </span>
            </div>
            <div class="tnt-field-grid">
              ${field('First Name',  sharedFirstName)}
              ${field('Last Name',   sharedLastName)}
              ${field('Date of Birth', sharedDob, !sharedDob)}
              ${field('Country', sharedCountry, !sharedCountry)}
            </div>

            <div style="margin-top:16px;padding:12px 14px;background:rgba(170,25,69,.04);border-radius:10px;border:1px solid var(--tnt-border)">
              <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:var(--tnt-text-muted);margin-bottom:8px">
                Fields not shared by user
              </div>
              <div style="display:flex;flex-wrap:wrap;gap:6px">
                ${sharedPhoto ? '' : '<span class="tnt-tag" style="opacity:.5;font-size:12px">Photo</span>'}
                ${sharedDob   ? '' : '<span class="tnt-tag" style="opacity:.5;font-size:12px">Date of Birth</span>'}
                ${sharedCountry ? '' : '<span class="tnt-tag" style="opacity:.5;font-size:12px">Country</span>'}
              </div>
            </div>
          </div>
        </div>

        <!-- Interests -->
        <div class="tnt-interests-card">
          <div class="tnt-interests-title">Interests</div>
          <div class="tnt-tags">
            ${tnt.interests.map(i => `<span class="tnt-tag">${i}</span>`).join('')}
          </div>
        </div>

        <div class="tnt-cta-bar">
          <button class="btn-tnt-primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            View My Matches
          </button>
          <button class="btn-outline-tnt" onclick="window.location.href='moi.html#dashboard'">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            Manage MOI Data
          </button>
          <button class="btn-outline-tnt" onclick="router.go('login')">← Sign out</button>
        </div>
      </div>
    </div>`;
}

// ── Router init ────────────────────────────────────────────────
router
  .on('login',        renderLogin)
  .on('cert-check',   renderCertCheck)
  .on('access-denied',renderAccessDenied)
  .on('redirecting',  renderRedirecting)
  .on('dashboard',    renderDashboard)
  .init('login');

// Highlight active demo nav link
document.querySelectorAll('#demo-nav a').forEach(a => {
  if (a.href === location.href) a.classList.add('active');
});
window.addEventListener('hashchange', () => {
  document.querySelectorAll('#demo-nav a').forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === `tnt.html${location.hash}`);
  });
});
