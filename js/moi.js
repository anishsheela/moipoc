// =============================================================
// MOI — My Own Information app screens
// =============================================================

const router = new Router();

// Better MOI shield-person logo
function moiLogoSVG(size = 32) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 40 44" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="mlogoG" x1="4" y1="2" x2="36" y2="42" gradientUnits="userSpaceOnUse">
        <stop stop-color="#00c8f0"/>
        <stop offset="1" stop-color="#005f88"/>
      </linearGradient>
    </defs>
    <path d="M20 2L36 8.5V20C36 29.5 28 36.5 20 40C12 36.5 4 29.5 4 20V8.5L20 2Z" fill="url(#mlogoG)"/>
    <path d="M20 2L36 8.5V20C36 29.5 28 36.5 20 40C12 36.5 4 29.5 4 20V8.5L20 2Z" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="1"/>
    <circle cx="20" cy="17" r="6" fill="white" opacity="0.95"/>
    <ellipse cx="20" cy="30.5" rx="9" ry="6" fill="white" opacity="0.95"/>
  </svg>`;
}

// "My Own Information" with MOI in accent colour
function moiBrandText(subtitle = '') {
  return `<span class="moi-brand-text"><span class="moi-brand-moi">M</span>y <span class="moi-brand-moi">O</span>wn <span class="moi-brand-moi">I</span>nformation${subtitle ? `<span class="moi-brand-sep"> · </span><span class="moi-brand-sub">${subtitle}</span>` : ''}</span>`;
}

function moiTopBar(title = '', showUser = true) {
  const u = MOCK.currentUser;
  return `
    <header class="moi-topbar">
      <div class="moi-logo">
        ${moiLogoSVG(32)}
        ${moiBrandText(title)}
      </div>
      ${showUser ? `
        <div class="moi-cert-chip">
          <span class="moi-cert-chip-dot"></span>
          ${u.certs.foundation.id}
        </div>` : ''}
    </header>`;
}

// ── Screen: MOI Login ──────────────────────────────────────────
function renderLogin() {
  const u = MOCK.currentUser;
  document.getElementById('app').innerHTML = `
    <div class="moi-screen">
      ${moiTopBar('', false)}
      <div class="moi-login-screen">
        <div class="moi-login-card">
          <div class="moi-login-icon">
            ${moiLogoSVG(40)}
          </div>
          <h1>${moiBrandText()}</h1>
          <p>Your personal data, stored securely and encrypted with your Osmio ID. You control who sees what.</p>

          <div class="moi-cert-detect">
            <div style="color:#06d6a0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>
            </div>
            <div class="moi-cert-detect-info">
              <strong>Osmio ID Pair detected</strong>
              <span>${u.certs.foundation.id} · Foundation Certificate</span>
            </div>
          </div>

          <button class="btn-moi" style="width:100%" onclick="router.go('dashboard')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            Access My Vault
          </button>

          <div class="moi-login-divider">or</div>

          <div style="display:flex;flex-direction:column;gap:8px">
            <button class="btn-moi-outline" style="width:100%;font-size:13px" onclick="router.go('consent')">
              View incoming consent request (from TNT demo)
            </button>
          </div>

          <div style="margin-top:20px;padding:12px;background:rgba(0,180,216,.04);border:1px solid rgba(0,180,216,.1);border-radius:9px;font-size:12px;color:var(--moi-text-muted);text-align:left;line-height:1.55">
            <strong style="color:var(--moi-accent);display:block;margin-bottom:3px">End-to-end encrypted</strong>
            Your data is encrypted using the public key from your Osmio ID certificate. Only you can decrypt it with your private key.
          </div>
        </div>
      </div>
    </div>`;
}

// ── Screen: Consent (OAuth-style) ─────────────────────────────
function renderConsent() {
  const req = JSON.parse(sessionStorage.getItem('moi_oauth_request') || 'null');
  const u = MOCK.currentUser;
  const moi = u.moi;

  // Default request if none present (direct navigation)
  const request = req || {
    appName: 'Trusted & True',
    appId: 'tnt',
    requestId: 'req_demo',
    certUsed: u.certs.foundation.id,
    requiredFields: ['firstName', 'lastName'],
    optionalFields: ['photo', 'dob', 'country'],
    returnTo: 'tnt.html#redirecting'
  };

  const fieldMeta = {
    firstName: { label: 'First Name',    emoji: '👤', value: moi.firstName.value, verified: moi.firstName.verified },
    lastName:  { label: 'Last Name',     emoji: '👤', value: moi.lastName.value,  verified: moi.lastName.verified  },
    photo:     { label: 'Profile Photo', emoji: '🖼', value: 'Photo on file',      verified: moi.photo ? moi.photo.verified : false },
    dob:       { label: 'Date of Birth', emoji: '🎂', value: moi.dob.value,        verified: moi.dob.verified       },
    country:   { label: 'Country',       emoji: '🌍', value: moi.country.value,    verified: moi.country.verified   },
  };

  const requiredRows = request.requiredFields.map(f => {
    const meta = fieldMeta[f] || { label: f, emoji: '📄', value: '—', verified: false };
    return `<div class="moi-consent-field required">
      <div class="moi-field-icon" style="background:rgba(0,180,216,.1);font-size:16px">${meta.emoji}</div>
      <div class="moi-field-info">
        <strong>${meta.label}</strong>
        <span>${meta.value}</span>
      </div>
      ${verifiedBadge(meta.verified)}
      <span class="moi-field-required-tag">Required</span>
    </div>`;
  }).join('');

  const optionalRows = request.optionalFields.map(f => {
    const meta = fieldMeta[f] || { label: f, emoji: '📄', value: '—', verified: false };
    return `<div class="moi-consent-field optional" onclick="toggleField(this)">
      <div class="moi-field-icon" style="background:rgba(255,255,255,.05);font-size:16px">${meta.emoji}</div>
      <div class="moi-field-info">
        <strong>${meta.label}</strong>
        <span>${meta.value || 'Not stored yet'}</span>
      </div>
      ${verifiedBadge(meta.verified)}
      <label class="moi-toggle">
        <input type="checkbox" class="field-toggle" data-field="${f}">
        <span class="moi-toggle-slider"></span>
      </label>
    </div>`;
  }).join('');

  document.getElementById('app').innerHTML = `
    <div class="moi-screen">
      ${moiTopBar('Permission Request', false)}
      <div class="moi-consent-screen">
        <div class="moi-consent-card">

          <div class="moi-consent-header">
            <div class="moi-consent-apps">
              <div class="moi-consent-app-icon tnt-icon" style="font-family:'Red Hat Display',sans-serif">T&T</div>
              <div class="moi-consent-arrow">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </div>
              <div class="moi-consent-app-icon moi-icon">MOI</div>
            </div>
            <h2>${request.appName} wants to access your MOI data</h2>
            <p>Review and choose exactly what information to share.<br>You can revoke this anytime from your MOI dashboard.</p>
          </div>

          <div class="moi-consent-body">
            <div class="moi-consent-section-label">Always shared — required by ${request.appName}</div>
            ${requiredRows}

            <div class="moi-consent-section-label" style="margin-top:16px">Optional — your choice</div>
            ${optionalRows}
          </div>

          <div class="moi-consent-footer">
            <div class="moi-consent-security">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              Secured by Osmio ID · Certificate: ${u.certs.foundation.id}
            </div>
            <div class="moi-consent-btns">
              <button class="btn-moi-danger" onclick="denyConsent()">
                Deny
              </button>
              <button class="btn-moi" onclick="approveConsent()">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>
                Approve & Continue
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>`;
}

function toggleField(el) {
  const cb = el.querySelector('input[type=checkbox]');
  if (cb) cb.checked = !cb.checked;
}

function approveConsent() {
  const request = JSON.parse(sessionStorage.getItem('moi_oauth_request') || 'null') || {
    appName: 'Trusted & True', requestId: 'req_demo', returnTo: 'tnt.html#redirecting'
  };
  const moi = MOCK.currentUser.moi;

  // Collect what was toggled on
  const shared = {
    firstName: { value: moi.firstName.value, verified: moi.firstName.verified },
    lastName:  { value: moi.lastName.value,  verified: moi.lastName.verified  },
  };

  document.querySelectorAll('.field-toggle').forEach(cb => {
    if (cb.checked) {
      const f = cb.dataset.field;
      if (moi[f]) shared[f] = { value: moi[f].value, verified: moi[f].verified };
    }
  });

  // Save response for TNT to read
  sessionStorage.setItem('moi_oauth_response', JSON.stringify({
    requestId: request.requestId,
    approved: true,
    shared,
    grantedAt: new Date().toISOString()
  }));

  // Show brief success then redirect
  document.getElementById('app').innerHTML = `
    <div class="moi-screen">
      ${moiTopBar('Permission Granted', false)}
      <div class="moi-success-screen">
        <div class="moi-success-card">
          <div class="moi-success-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <h2>Permission granted</h2>
          <p>Your selected data has been securely shared with <strong style="color:var(--moi-text)">${request.appName}</strong>.<br>
          Redirecting you back now…</p>
          <div style="margin-top:20px;height:3px;background:var(--moi-surface-2);border-radius:999px;overflow:hidden">
            <div id="consent-prog" style="height:100%;background:var(--moi-accent);border-radius:999px;width:0%;transition:width 1.8s ease"></div>
          </div>
        </div>
      </div>
    </div>`;

  requestAnimationFrame(() => {
    const p = document.getElementById('consent-prog');
    if (p) p.style.width = '100%';
  });

  setTimeout(() => {
    window.location.href = request.returnTo || 'tnt.html#redirecting';
  }, 2000);
}

function denyConsent() {
  const request = JSON.parse(sessionStorage.getItem('moi_oauth_request') || 'null');
  sessionStorage.setItem('moi_oauth_response', JSON.stringify({ approved: false }));
  window.location.href = (request && request.returnTo) ? request.returnTo.replace('#redirecting', '#login') : 'tnt.html#login';
}

// ── Screen: Dashboard ──────────────────────────────────────────
function renderDashboard() {
  const u = MOCK.currentUser;
  const moi = u.moi;

  const fieldRows = [
    ['First Name',   moi.firstName],
    ['Last Name',    moi.lastName],
    ['Date of Birth',moi.dob],
    ['Gender',       moi.gender],
    ['Email',        moi.email],
    ['Phone',        moi.phone],
    ['Address',      moi.address],
    ['City',         moi.city],
    ['State',        moi.state],
    ['Country',      moi.country],
    ['Postal Code',  moi.postalCode],
    ['Occupation',   moi.occupation],
  ];

  const logRows = u.accessLog.map(l => `
    <div class="moi-log-row">
      <div class="moi-log-dot ${l.granted ? 'granted' : 'denied'}"></div>
      <div class="moi-log-info">
        <div class="moi-log-app">${l.app} <span style="font-size:11px;font-weight:500;color:var(--moi-text-muted)">via ${l.certType} cert</span></div>
        <div class="moi-log-fields">${l.fields ? l.fields.join(', ') : 'Direct vault access'} · ${l.granted ? 'Granted' : 'Denied'}</div>
      </div>
      <div class="moi-log-time">${timeAgo(l.date)}</div>
    </div>`).join('');

  // IDQA max is 24; current max achievable is 12 (attestation not yet implemented)
  const idqaPct = Math.round((u.idqa / 24) * 100);
  const idqaStatus = u.idqa >= 12 ? 'ID Verified' : u.idqa >= 8 ? 'Email Verified' : 'Unverified';
  const idqaStatusColor = u.idqa >= 12 ? '#06d6a0' : u.idqa >= 8 ? '#ffd166' : '#ef476f';

  document.getElementById('app').innerHTML = `
    <div class="moi-screen">
      ${moiTopBar('Dashboard')}
      <div class="moi-dashboard">

        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;flex-wrap:wrap;gap:10px">
          <div>
            <div style="font-size:22px;font-weight:800;color:var(--moi-text);letter-spacing:-.4px">${moi.firstName.value} ${moi.lastName.value}</div>
            <div style="font-size:13px;color:var(--moi-text-muted);margin-top:2px">${u.email} · Enrolled ${formatDate(u.enrolledDate)}</div>
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <button class="btn-moi-outline" onclick="router.go('manage')" style="font-size:13px;padding:8px 16px">Manage Data</button>
            <button class="btn-moi" onclick="router.go('verify-request')" style="font-size:13px;padding:8px 16px">Request Verification</button>
          </div>
        </div>

        <div class="moi-dash-grid">
          <!-- Identity sidebar -->
          <div style="display:flex;flex-direction:column;gap:16px">

            <div class="moi-card moi-identity-card">
              <div class="moi-card-title">Identity</div>
              <div class="moi-avatar-photo">${MOCK.svgAssets.userPhoto}</div>
              <div class="moi-identity-name">${moi.firstName.value} ${moi.lastName.value}</div>
              ${idqaBadge(u.idqa)}

              <div class="moi-idqa-gauge" style="margin-top:14px">
                <div class="moi-idqa-score-row">
                  <div>
                    <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:var(--moi-text-muted)">IDQA Score</div>
                    <div class="moi-idqa-score-val">${u.idqa}<span style="font-size:12px;font-weight:600;color:var(--moi-text-muted)">/24</span></div>
                  </div>
                  <div style="text-align:right">
                    <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:var(--moi-text-muted)">Status</div>
                    <div style="font-size:12px;font-weight:700;color:${idqaStatusColor}">${idqaStatus}</div>
                  </div>
                </div>
                <div class="moi-idqa-bar-wrap">
                  <div class="moi-idqa-bar" style="width:${idqaPct}%"></div>
                </div>
                <div class="moi-idqa-labels"><span>0</span><span>8</span><span>12</span><span>24</span></div>
                <div style="font-size:10px;color:var(--moi-text-muted);margin-top:4px;opacity:.7">12–24 reserved for attestation (coming soon)</div>
              </div>

              <div class="moi-cert-mini">
                <div class="moi-cert-mini-label">Foundation Certificate</div>
                <div class="moi-cert-mini-id">${u.certs.foundation.id}</div>
                <div style="font-size:11px;color:var(--moi-text-muted);margin-top:2px">Expires ${formatDate(u.certs.foundation.validTo)}</div>
              </div>

              <div class="moi-cert-mini" style="margin-top:8px">
                <div class="moi-cert-mini-label">Numberplate Certificate</div>
                <div class="moi-cert-mini-id">${u.certs.numberplate.id}</div>
                <div style="font-size:11px;color:var(--moi-text-muted);margin-top:2px">Expires ${formatDate(u.certs.numberplate.validTo)}</div>
              </div>
            </div>

            <!-- Verification status -->
            <div class="moi-card">
              <div class="moi-card-title">Verification Status</div>
              ${u.verificationStatus === 'none' ? `
                <div style="font-size:13px;color:var(--moi-text-muted);margin-bottom:12px;line-height:1.55">
                  Your stored data has not been admin-verified yet. Verification increases trust on connected apps.
                </div>
                <button class="btn-moi" style="width:100%;font-size:13px;padding:9px" onclick="router.go('verify-request')">
                  Request Verification
                </button>` : `
                <div class="badge badge-pending" style="font-size:13px;padding:6px 12px">Verification pending review</div>`}
            </div>
          </div>

          <!-- Main data card -->
          <div class="moi-card">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
              <div class="moi-card-title" style="margin-bottom:0">Stored Information</div>
              <button class="btn-moi-outline" onclick="router.go('manage')" style="font-size:12px;padding:6px 14px">Edit</button>
            </div>
            ${fieldRows.map(([label, f]) => `
              <div class="moi-field-row">
                <div class="moi-field-label-col">${label}</div>
                <div class="moi-field-val-col ${f && f.value ? '' : 'moi-field-val-empty'}">
                  ${f && f.value ? f.value : 'Not set'}
                </div>
                <div>${f ? verifiedBadge(f.verified) : ''}</div>
              </div>`).join('')}
          </div>
        </div>

        <!-- Access log -->
        <div class="moi-card">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
            <div class="moi-card-title" style="margin-bottom:0">Access Log</div>
            <span style="font-size:11px;color:var(--moi-text-muted);font-weight:600">Last 6 events</span>
          </div>
          ${logRows}
        </div>

      </div>
    </div>`;
}

// ── Screen: Manage Data ────────────────────────────────────────
function renderManage() {
  const moi = MOCK.currentUser.moi;

  document.getElementById('app').innerHTML = `
    <div class="moi-screen">
      ${moiTopBar('Manage Data')}
      <div class="moi-manage-screen">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px">
          <button class="btn-moi-outline" onclick="router.go('dashboard')" style="font-size:13px;padding:7px 14px">← Back</button>
          <div>
            <h2 style="margin-bottom:0">Manage Your Information</h2>
            <p style="font-size:13px;color:var(--moi-text-muted);margin-top:2px">Changes are encrypted before saving.</p>
          </div>
        </div>

        <div class="moi-form-section">
          <div class="moi-form-section-title">Identity</div>
          <div style="display:flex;align-items:flex-start;gap:10px;padding:11px 14px;background:rgba(255,209,102,.07);border:1px solid rgba(255,209,102,.2);border-radius:9px;margin-bottom:14px;font-size:12.5px;color:var(--moi-warning);line-height:1.5">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" style="flex-shrink:0;margin-top:1px"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            <span>Verified fields can be edited, but editing will mark them as <strong>unverified</strong> and require re-verification.</span>
          </div>
          <div class="moi-form-grid">
            <div class="moi-form-group">
              <label class="moi-form-label">
                First Name
                ${verifiedBadge(moi.firstName.verified)}
              </label>
              <div style="position:relative">
                <input class="moi-form-input" id="inp-firstName" type="text" value="${moi.firstName.value}" ${moi.firstName.verified ? 'data-verified="true" readonly' : ''} style="width:100%;padding-right:${moi.firstName.verified ? '80px' : '14px'}">
                ${moi.firstName.verified ? `<button onclick="unlockVerifiedField('inp-firstName','firstName')" class="moi-unlock-btn">Edit</button>` : ''}
              </div>
            </div>
            <div class="moi-form-group">
              <label class="moi-form-label">
                Last Name
                ${verifiedBadge(moi.lastName.verified)}
              </label>
              <div style="position:relative">
                <input class="moi-form-input" id="inp-lastName" type="text" value="${moi.lastName.value}" ${moi.lastName.verified ? 'data-verified="true" readonly' : ''} style="width:100%;padding-right:${moi.lastName.verified ? '80px' : '14px'}">
                ${moi.lastName.verified ? `<button onclick="unlockVerifiedField('inp-lastName','lastName')" class="moi-unlock-btn">Edit</button>` : ''}
              </div>
            </div>
            <div class="moi-form-group">
              <label class="moi-form-label">Date of Birth ${verifiedBadge(moi.dob.verified)}</label>
              <input class="moi-form-input" type="date" value="${moi.dob.value}">
            </div>
            <div class="moi-form-group">
              <label class="moi-form-label">Gender</label>
              <input class="moi-form-input" type="text" value="${moi.gender.value}">
            </div>
          </div>
        </div>

        <div class="moi-form-section">
          <div class="moi-form-section-title">Contact (Verified at enrollment)</div>
          <div class="moi-form-grid">
            <div class="moi-form-group">
              <label class="moi-form-label">Email ${verifiedBadge(moi.email.verified)}</label>
              <input class="moi-form-input" type="email" value="${moi.email.value}" disabled>
            </div>
            <div class="moi-form-group">
              <label class="moi-form-label">Phone ${verifiedBadge(moi.phone.verified)}</label>
              <input class="moi-form-input" type="tel" value="${moi.phone.value}" disabled>
            </div>
          </div>
        </div>

        <div class="moi-form-section">
          <div class="moi-form-section-title">Address</div>
          <div class="moi-form-grid">
            <div class="moi-form-group moi-form-full">
              <label class="moi-form-label">Street Address</label>
              <input class="moi-form-input" type="text" value="${moi.address.value}">
            </div>
            <div class="moi-form-group">
              <label class="moi-form-label">City</label>
              <input class="moi-form-input" type="text" value="${moi.city.value}">
            </div>
            <div class="moi-form-group">
              <label class="moi-form-label">State / Province</label>
              <input class="moi-form-input" type="text" value="${moi.state.value}">
            </div>
            <div class="moi-form-group">
              <label class="moi-form-label">Postal Code</label>
              <input class="moi-form-input" type="text" value="${moi.postalCode.value}">
            </div>
            <div class="moi-form-group">
              <label class="moi-form-label">Country</label>
              <input class="moi-form-input" type="text" value="${moi.country.value}">
            </div>
          </div>
        </div>

        <div class="moi-form-section">
          <div class="moi-form-section-title">Additional</div>
          <div class="moi-form-grid">
            <div class="moi-form-group">
              <label class="moi-form-label">Occupation</label>
              <input class="moi-form-input" type="text" value="${moi.occupation.value}">
            </div>
            <div class="moi-form-group moi-form-full">
              <label class="moi-form-label">Bio</label>
              <textarea class="moi-form-input" rows="3">${moi.bio.value}</textarea>
            </div>
          </div>
        </div>

        <div style="display:flex;gap:10px;padding-bottom:20px">
          <button class="btn-moi" onclick="saveManage()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>
            Save & Encrypt
          </button>
          <button class="btn-moi-outline" onclick="router.go('dashboard')">Cancel</button>
        </div>
      </div>
    </div>`;
}

function unlockVerifiedField(inputId, fieldKey) {
  if (!confirm('⚠ This field is verified.\n\nEditing it will mark it as unverified and you will need to go through verification again.\n\nDo you want to continue?')) return;
  const input = document.getElementById(inputId);
  if (!input) return;
  input.removeAttribute('readonly');
  input.removeAttribute('data-verified');
  input.style.borderColor = 'var(--moi-warning)';
  input.style.boxShadow = '0 0 0 3px rgba(255,209,102,.15)';
  input.focus();
  // Hide the unlock button
  const btn = input.parentElement.querySelector('.moi-unlock-btn');
  if (btn) { btn.textContent = 'Will unverify'; btn.style.color = 'var(--moi-warning)'; btn.disabled = true; }
  // Mark in mock data
  if (MOCK.currentUser.moi[fieldKey]) MOCK.currentUser.moi[fieldKey].verified = false;
}

function saveManage() {
  // Show saved feedback
  const btn = document.querySelector('.btn-moi');
  if (!btn) return;
  btn.innerHTML = `${SPINNER_SVG} Encrypting…`;
  btn.disabled = true;
  setTimeout(() => {
    btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg> Saved`;
    setTimeout(() => router.go('dashboard'), 800);
  }, 1200);
}

// ── Screen: Verify Request ─────────────────────────────────────
function renderVerifyRequest() {
  const moi = MOCK.currentUser.moi;

  document.getElementById('app').innerHTML = `
    <div class="moi-screen">
      ${moiTopBar('Verification')}
      <div class="moi-verify-screen">
        <div class="moi-verify-card">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px">
            <button class="btn-moi-outline" onclick="router.go('dashboard')" style="font-size:13px;padding:7px 14px">← Back</button>
            <h2 style="margin-bottom:0">Request Identity Verification</h2>
          </div>
          <p>Submit your stored information for admin review. An OSMIO officer will cross-check against your enrollment records and TrustSwiftly ID verification data.</p>

          <div style="margin-bottom:14px">
            <div style="font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:.7px;color:var(--moi-text-muted);margin-bottom:10px">Select data to submit for verification</div>

            <label class="moi-verify-item">
              <input type="checkbox" checked>
              <div class="moi-verify-item-text">
                <strong>First Name — <span style="color:var(--moi-text-muted);font-weight:400">${moi.firstName.value}</span></strong>
                <span>Cross-checked against enrollment record</span>
              </div>
              ${verifiedBadge(moi.firstName.verified)}
            </label>

            <label class="moi-verify-item">
              <input type="checkbox" checked>
              <div class="moi-verify-item-text">
                <strong>Last Name — <span style="color:var(--moi-text-muted);font-weight:400">${moi.lastName.value}</span></strong>
                <span>Cross-checked against enrollment record</span>
              </div>
              ${verifiedBadge(moi.lastName.verified)}
            </label>

            <label class="moi-verify-item">
              <input type="checkbox" checked>
              <div class="moi-verify-item-text">
                <strong>Date of Birth — <span style="color:var(--moi-text-muted);font-weight:400">${moi.dob.value}</span></strong>
                <span>Cross-checked against TrustSwiftly ID scan</span>
              </div>
              ${verifiedBadge(moi.dob.verified)}
            </label>

            <label class="moi-verify-item">
              <input type="checkbox" checked>
              <div class="moi-verify-item-text">
                <strong>Profile Photo</strong>
                <span>Compared against TrustSwiftly liveness check</span>
              </div>
              ${verifiedBadge(false)}
            </label>
          </div>

          <!-- Supporting documents section -->
          <div style="margin-top:20px">
            <div style="font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:.7px;color:var(--moi-text-muted);margin-bottom:10px">Supporting Documents <span style="color:var(--moi-accent);font-size:9px;font-weight:600;background:rgba(0,180,216,.1);padding:2px 6px;border-radius:4px;margin-left:4px">Optional</span></div>

            ${MOCK.currentUserDocuments.map(doc => `
              <div class="moi-doc-item">
                <div class="moi-doc-thumb" onclick="previewDoc('${doc.svgKey}','${doc.label}')">
                  <div class="moi-doc-thumb-inner">${MOCK.svgAssets[doc.svgKey]}</div>
                  <div class="moi-doc-thumb-overlay">Preview</div>
                </div>
                <div class="moi-doc-info">
                  <strong>${doc.label}</strong>
                  <span>${doc.description}</span>
                  <span style="color:var(--moi-success);font-size:11px;font-weight:600">✓ Uploaded ${timeAgo(doc.uploadedDate)}</span>
                  ${doc.trustSwiftlyRef ? `<span style="font-size:10.5px;color:var(--moi-text-muted);font-family:monospace">${doc.trustSwiftlyRef}</span>` : ''}
                </div>
                <span class="badge badge-verified" style="flex-shrink:0">Ready</span>
              </div>`).join('')}

            <label class="moi-doc-upload-btn">
              <input type="file" style="display:none" accept="image/*,.pdf" onchange="handleDocUpload(this)">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              Upload additional document
            </label>
          </div>

          <!-- Document preview modal -->
          <div id="doc-modal" class="moi-doc-modal hidden" onclick="closeDocModal(event)">
            <div class="moi-doc-modal-inner">
              <div class="moi-doc-modal-header">
                <span id="doc-modal-title"></span>
                <button onclick="document.getElementById('doc-modal').classList.add('hidden')" style="color:var(--moi-text-muted);font-size:20px;line-height:1">×</button>
              </div>
              <div id="doc-modal-body" class="moi-doc-modal-body"></div>
            </div>
          </div>

          <div class="moi-privacy-note">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" style="flex-shrink:0;margin-top:1px"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            <span>Your data and documents are sent securely to the OSMIO admin portal. They are used only for verification and are not shared with third parties.</span>
          </div>

          <div style="display:flex;gap:10px">
            <button class="btn-moi" onclick="submitVerification()">
              Submit for Verification
            </button>
            <button class="btn-moi-outline" onclick="router.go('dashboard')">Cancel</button>
          </div>
        </div>
      </div>
    </div>`;
}

function submitVerification() {
  const btn = document.querySelector('.btn-moi');
  if (!btn) return;
  btn.innerHTML = `${SPINNER_SVG} Submitting…`;
  btn.disabled = true;
  setTimeout(() => {
    MOCK.currentUser.verificationStatus = 'pending';
    document.getElementById('app').innerHTML = `
      <div class="moi-screen">
        ${moiTopBar('Verification Submitted')}
        <div class="moi-success-screen">
          <div class="moi-success-card">
            <div class="moi-success-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <h2>Submitted for review</h2>
            <p>Your verification request has been queued. An OSMIO officer will review your submission, typically within 1–2 business days. You'll be notified once reviewed.</p>
            <div style="margin-top:24px;padding:12px;background:rgba(0,180,216,.06);border:1px solid rgba(0,180,216,.15);border-radius:9px;font-size:12px;color:var(--moi-text-muted)">
              Reference ID: <strong style="color:var(--moi-accent);font-family:monospace">VRF-2026-00${Math.floor(1000+Math.random()*8999)}</strong>
            </div>
            <button class="btn-moi" style="width:100%;margin-top:20px" onclick="router.go('dashboard')">Back to Dashboard</button>
          </div>
        </div>
      </div>`;
  }, 1400);
}

function previewDoc(svgKey, title) {
  const modal = document.getElementById('doc-modal');
  if (!modal) return;
  document.getElementById('doc-modal-title').textContent = title;
  document.getElementById('doc-modal-body').innerHTML = MOCK.svgAssets[svgKey] || '';
  modal.classList.remove('hidden');
}

function closeDocModal(e) {
  if (e.target.id === 'doc-modal') {
    document.getElementById('doc-modal').classList.add('hidden');
  }
}

function handleDocUpload(input) {
  if (!input.files.length) return;
  const label = input.parentElement;
  label.innerHTML = `<span style="color:var(--moi-success)">✓ ${input.files[0].name} ready to submit</span>`;
}

// ── Router init ────────────────────────────────────────────────
router
  .on('login',          renderLogin)
  .on('consent',        renderConsent)
  .on('dashboard',      renderDashboard)
  .on('manage',         renderManage)
  .on('verify-request', renderVerifyRequest)
  .init('login');

window.addEventListener('hashchange', () => {
  document.querySelectorAll('#demo-nav a').forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === `moi.html${location.hash}`);
  });
});
