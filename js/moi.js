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
          <p>Your personal data, stored securely and encrypted with your Osmio ID Pair. You control who sees what.</p>

          <div class="moi-cert-detect">
            <div style="color:#06d6a0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>
            </div>
            <div class="moi-cert-detect-info">
              <strong>Osmio ID Pair detected</strong>
              <span>${u.certs.foundation.id} · Foundation Osmio ID Pair</span>
            </div>
          </div>

          <button class="btn-moi" style="width:100%" onclick="router.go('dashboard')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            Access My Vault
          </button>

          <div style="margin-top:20px;padding:12px;background:rgba(0,180,216,.04);border:1px solid rgba(0,180,216,.1);border-radius:9px;font-size:12px;color:var(--moi-text-muted);text-align:left;line-height:1.55">
            <strong style="color:var(--moi-accent);display:block;margin-bottom:3px">End-to-end encrypted</strong>
            Your data is encrypted using the public key from your Osmio ID Pair. Only you can decrypt it with your private key.
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
    requiredFields: ['firstName', 'lastName', 'above18'],
    optionalFields: ['photo', 'country'],
    returnTo: 'tnt.html#redirecting'
  };

  // Derive age from DOB — only the pass/fail conclusion is ever shared, not the raw date
  // Demo: 'moi_demo_dob' overrides DOB; 'moi_demo_country' overrides country of residence
  const demoDob = sessionStorage.getItem('moi_demo_dob');
  const demoCountry = sessionStorage.getItem('moi_demo_country');
  const effectiveDob = demoDob || moi.dob.value;
  const effectiveCountry = demoCountry || moi.country.value;
  const dobDate = effectiveDob ? new Date(effectiveDob) : null;

  function computeAge(dob) {
    if (!dob) return null;
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    if (today.getMonth() < dob.getMonth() ||
        (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate())) age--;
    return age;
  }
  const userAge = computeAge(dobDate);

  function makeAgeField(minAge) {
    const passes = userAge !== null ? userAge >= minAge : null;
    return {
      label: `Age Verification (${minAge}+)`,
      emoji: '🔞',
      value: passes === null ? 'DOB not set' : passes ? `${minAge}+ Confirmed` : `Under ${minAge}`,
      verified: moi.dob.verified,
      note: 'Derived from your date of birth. The actual date is never shared.',
      ageFails: passes === false
    };
  }

  const fieldMeta = {
    firstName: { label: 'First Name',    emoji: '👤', value: moi.firstName.value, verified: moi.firstName.verified },
    lastName:  { label: 'Last Name',     emoji: '👤', value: moi.lastName.value,  verified: moi.lastName.verified  },
    above13:   makeAgeField(13),
    above18:   makeAgeField(18),
    above21:   makeAgeField(21),
    above25:   makeAgeField(25),
    photo:     { label: 'Profile Photo', emoji: '🖼', value: 'Photo on file', verified: moi.photo ? moi.photo.verified : false },
    email:     { label: 'Email',         emoji: '✉️', value: moi.email.value,  verified: moi.email.verified  },
    country:   { label: 'Country of Residence', emoji: '🌍', value: effectiveCountry, verified: moi.country.verified },
  };

  const requiredRows = request.requiredFields.map(f => {
    const meta = fieldMeta[f] || { label: f, emoji: '📄', value: '—', verified: false };
    const failBorder = meta.ageFails ? 'border-color:rgba(239,71,111,.35);background:rgba(239,71,111,.04)' : '';
    const valueColor = meta.ageFails ? 'color:#ef476f;font-weight:600' : '';
    return `<div class="moi-consent-field required" style="${failBorder}">
      <div class="moi-field-icon" style="background:rgba(0,180,216,.1);font-size:16px">${meta.emoji}</div>
      <div class="moi-field-info">
        <strong>${meta.label}</strong>
        <span style="${valueColor}">${meta.value}</span>
        ${meta.note ? `<span style="font-size:10.5px;color:var(--moi-accent);opacity:.8;font-style:italic">${meta.note}</span>` : ''}
        ${meta.ageFails ? `<span style="font-size:11px;color:#ef476f;font-style:italic">⚠ This app may reject you based on this result.</span>` : ''}
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
      ${moiTopBar('Licence Request', false)}
      <div class="moi-consent-screen">
        <div class="moi-consent-card">

          <div class="moi-consent-header">
            <div class="moi-consent-apps">
              ${(()=>{
                const colors = { tnt:'#aa1945', nextcloud:'#0082c9', betmax:'#16a34a', cigs:'#92400e' };
                const labels = { tnt:'T&T', nextcloud:'NC', betmax:'BM', cigs:'🍷' };
                const col = colors[request.appId] || '#334155';
                const lbl = labels[request.appId] || request.appName.substring(0,2).toUpperCase();
                return `<div class="moi-consent-app-icon" style="background:${col};color:#fff;font-family:inherit">${lbl}</div>`;
              })()}
              <div class="moi-consent-arrow">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </div>
              <div class="moi-consent-app-icon moi-icon">MOI</div>
            </div>
            <h2>${request.appName} is requesting a data licence</h2>
            <p>Choose what information to include in this licence.<br>You can revoke this licence anytime from your MOI dashboard.</p>
          </div>

          <div class="moi-consent-body">
            <div class="moi-consent-section-label">Always shared — required by ${request.appName}</div>
            ${requiredRows}

            ${optionalRows ? `
            <div class="moi-consent-section-label" style="margin-top:16px">Optional — your choice</div>
            ${optionalRows}` : ''}
          </div>

          <div class="moi-consent-footer">
            <div class="moi-consent-security">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              Secured by Osmio ID Pair: ${u.certs.foundation.id}
            </div>
            <div class="moi-consent-btns">
              <button class="btn-moi-danger" onclick="denyConsent()">
                Decline
              </button>
              <button class="btn-moi" onclick="approveConsent()">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>
                Grant Licence
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

  // Re-derive age and country using same overrides as renderConsent
  const demoDob = sessionStorage.getItem('moi_demo_dob');
  const demoCountry = sessionStorage.getItem('moi_demo_country');
  const effectiveDob = demoDob || moi.dob.value;
  const effectiveCountry = demoCountry || moi.country.value;
  const dobDate = effectiveDob ? new Date(effectiveDob) : null;
  function computeAge(dob) {
    if (!dob) return null;
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    if (today.getMonth() < dob.getMonth() ||
        (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate())) age--;
    return age;
  }
  const userAge = computeAge(dobDate);

  // Always share the name fields (always required)
  const shared = {
    firstName: { value: moi.firstName.value, verified: moi.firstName.verified },
    lastName:  { value: moi.lastName.value,  verified: moi.lastName.verified  },
  };

  // Include all required fields: age checks computed from DOB; other fields from moi or demo override
  (request.requiredFields || []).forEach(f => {
    if (f === 'firstName' || f === 'lastName') return; // already included
    const ageMatch = f.match(/^above(\d+)$/);
    if (ageMatch) {
      const minAge = parseInt(ageMatch[1]);
      const passes = userAge !== null ? userAge >= minAge : null;
      shared[f] = { value: passes, verified: moi.dob.verified };
    } else if (f === 'country') {
      shared[f] = { value: effectiveCountry, verified: moi.country.verified };
    } else if (moi[f]) {
      shared[f] = { value: moi[f].value, verified: moi[f].verified };
    }
  });

  // Collect optional fields that were toggled on
  document.querySelectorAll('.field-toggle').forEach(cb => {
    if (cb.checked) {
      const f = cb.dataset.field;
      if (moi[f]) shared[f] = { value: moi[f].value, verified: moi[f].verified };
    }
  });

  // Save response for the requesting app to read
  sessionStorage.setItem('moi_oauth_response', JSON.stringify({
    requestId: request.requestId,
    approved: true,
    shared,
    grantedAt: new Date().toISOString()
  }));

  // Show brief success then redirect
  document.getElementById('app').innerHTML = `
    <div class="moi-screen">
      ${moiTopBar('Licence Granted', false)}
      <div class="moi-success-screen">
        <div class="moi-success-card">
          <div class="moi-success-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <h2>Licence granted</h2>
          <p>A data licence has been granted to <strong style="color:var(--moi-text)">${request.appName}</strong>.<br>
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

  // Split access log into active consents (granted + has fields) and history
  const activeConsents = u.accessLog.filter(l => l.granted && l.fields);
  const allLogRows = u.accessLog.map((l, i) => `
    <div class="moi-log-row" id="log-row-${i}">
      <div class="moi-log-dot ${l.granted ? 'granted' : 'denied'}"></div>
      <div class="moi-log-info">
        <div class="moi-log-app">${l.app} <span style="font-size:11px;font-weight:500;color:var(--moi-text-muted)">· Osmio ID Pair ${l.certType === 'foundation' ? MOCK.currentUser.certs.foundation.id : MOCK.currentUser.certs.numberplate.id}</span></div>
        <div class="moi-log-fields">${l.fields ? l.fields.join(', ') : 'Direct vault access'} · ${l.granted ? 'Granted' : 'Denied'}</div>
      </div>
      <div class="moi-log-time">${timeAgo(l.date)}</div>
    </div>`).join('');

  const appMeta = {
    'Trusted & True': { color: '#aa1945', icon: '❤' },
    'Nextcloud':      { color: '#0082c9', icon: '☁' },
    'BetMax':         { color: '#16a34a', icon: '⭐' },
    'Alkoshop':       { color: '#92400e', icon: '🍷' },
  };
  const consentRows = activeConsents.map((l, i) => {
    const meta = appMeta[l.app] || { color: '#334155', icon: '○' };
    return `
    <div class="moi-consent-row" id="consent-${i}">
      <div style="width:32px;height:32px;border-radius:9px;background:${meta.color};display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0">${meta.icon}</div>
      <div class="moi-log-info" style="flex:1">
        <div class="moi-log-app" style="font-weight:700">${l.app}</div>
        <div class="moi-log-fields" style="margin-top:1px">${l.fields.join(', ')}</div>
        <div style="font-size:11px;color:var(--moi-text-muted);margin-top:2px">Osmio ID Pair ${l.certType === 'foundation' ? MOCK.currentUser.certs.foundation.id : MOCK.currentUser.certs.numberplate.id} · Last accessed ${timeAgo(l.date)}</div>
      </div>
      <button class="moi-revoke-btn" onclick="revokeConsent(${i}, '${l.app}')">Revoke</button>
    </div>`;
  }).join('');

  // IDQA max is 24; current max achievable is 12 (attestation not yet implemented)
  const idqaPct = Math.round((u.idqa / 24) * 100);
  const idqaStatus = u.idqa >= 12 ? 'ID Attested' : u.idqa >= 8 ? 'Email Attested' : 'Unattested';
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
            <button class="btn-moi" onclick="router.go('verify-request')" style="font-size:13px;padding:8px 16px">Request Attestation</button>
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
                <div style="font-size:10px;color:var(--moi-text-muted);margin-top:4px;opacity:.7">Scores above 12 require additional attestation — further documents or a live video call with an Attestation Officer. This level is not yet rolled out.</div>
              </div>

              <div class="moi-cert-mini">
                <div class="moi-cert-mini-label">Foundation Osmio ID Pair</div>
                <div class="moi-cert-mini-id">${u.certs.foundation.id}</div>
                <div style="font-size:11px;color:var(--moi-text-muted);margin-top:2px">Expires ${formatDate(u.certs.foundation.validTo)}</div>
              </div>

              <div class="moi-cert-mini" style="margin-top:8px">
                <div class="moi-cert-mini-label">Numberplate Osmio ID Pair</div>
                <div class="moi-cert-mini-id">${u.certs.numberplate.id}</div>
                <div style="font-size:11px;color:var(--moi-text-muted);margin-top:2px">Expires ${formatDate(u.certs.numberplate.validTo)}</div>
              </div>
            </div>

            <!-- Verification status -->
            <div class="moi-card">
              <div class="moi-card-title">Attestation Status</div>
              ${u.verificationStatus === 'none' ? `
                <div style="font-size:13px;color:var(--moi-text-muted);margin-bottom:12px;line-height:1.55">
                  Your stored data has not been attested yet. Attestation increases trust on connected apps.
                </div>
                <button class="btn-moi" style="width:100%;font-size:13px;padding:9px" onclick="router.go('verify-request')">
                  Request Attestation
                </button>` : `
                <div class="badge badge-pending" style="font-size:13px;padding:6px 12px">Attestation pending review</div>`}
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

        <!-- Your Licences -->
        <div class="moi-card">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
            <div>
              <div class="moi-card-title" style="margin-bottom:2px">Your Licences</div>
              <div style="font-size:12px;color:var(--moi-text-muted)">Apps holding an active data licence from you</div>
            </div>
            <span style="font-size:11px;color:var(--moi-text-muted);font-weight:600">${activeConsents.length} active</span>
          </div>
          ${consentRows || `<div style="font-size:13px;color:var(--moi-text-muted);padding:8px 0;font-style:italic">No active licences.</div>`}
        </div>

        <!-- Notarial Certificates -->
        <div class="moi-card">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
            <div>
              <div class="moi-card-title" style="margin-bottom:2px">Notarial Certificates</div>
              <div style="font-size:12px;color:var(--moi-text-muted)">Certificates issued by your Attestation Officer after successful identity sessions</div>
            </div>
            <span style="font-size:11px;color:var(--moi-text-muted);font-weight:600">${u.notarialCertificates.length} issued</span>
          </div>
          ${u.notarialCertificates.length === 0 ? `<div style="font-size:13px;color:var(--moi-text-muted);padding:8px 0;font-style:italic">No certificates issued yet. A certificate will appear here after your attestation session is completed.</div>` :
            u.notarialCertificates.map(cert => `
            <div style="display:flex;align-items:flex-start;gap:14px;padding:14px 0;border-bottom:1px solid rgba(255,255,255,.06)">
              <div style="width:40px;height:40px;border-radius:10px;background:rgba(6,214,160,.12);border:1px solid rgba(6,214,160,.25);display:flex;align-items:center;justify-content:center;flex-shrink:0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#06d6a0" stroke-width="2.5" stroke-linecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>
              </div>
              <div style="flex:1">
                <div style="font-size:13.5px;font-weight:700;color:var(--moi-text);margin-bottom:3px">Notarial Certificate <span style="font-family:monospace;font-size:12px;color:var(--moi-text-muted)">${cert.id}</span></div>
                <div style="font-size:12px;color:var(--moi-text-muted);line-height:1.5">
                  Issued by <strong style="color:var(--moi-text)">${cert.officerName}</strong> · ${cert.officerJurisdiction}<br>
                  Fields attested: ${cert.fieldsAttested.join(', ')}<br>
                  Issued ${formatDate(cert.issuedDate)} · Expires ${formatDate(cert.expiresDate)}
                </div>
                <div style="margin-top:6px;display:flex;gap:8px;align-items:center;flex-wrap:wrap">
                  <span class="badge badge-verified">Valid</span>
                  <span style="font-size:11px;color:var(--moi-text-muted);font-family:monospace">Ref: ${cert.sessionRef}</span>
                </div>
              </div>
              <button class="btn-moi-outline" onclick="viewCertificate('${cert.id}')" style="font-size:12px;padding:6px 14px;white-space:nowrap;flex-shrink:0">View →</button>
            </div>`).join('')}
        </div>

        <!-- Licence History -->
        <div class="moi-card">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
            <div class="moi-card-title" style="margin-bottom:0">Licence History</div>
            <span style="font-size:11px;color:var(--moi-text-muted);font-weight:600">Last ${u.accessLog.length} events</span>
          </div>
          ${allLogRows}
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
            <span>Attested fields are locked by default. If you change an attested value, it will be marked <strong>unattested</strong> until an Attestation Officer re-confirms it.</span>
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
          <div class="moi-form-section-title">Contact</div>
          <div class="moi-form-grid">
            <div class="moi-form-group">
              <label class="moi-form-label">
                Email
                ${verifiedBadge(moi.email.verified)}
              </label>
              <div style="position:relative">
                <input class="moi-form-input" id="inp-email" type="email" value="${moi.email.value}" ${moi.email.verified ? 'data-verified="true" readonly' : ''} style="width:100%;padding-right:${moi.email.verified ? '80px' : '14px'}">
                ${moi.email.verified ? `<button onclick="unlockVerifiedField('inp-email','email')" class="moi-unlock-btn">Edit</button>` : ''}
              </div>
            </div>
            <div class="moi-form-group">
              <label class="moi-form-label">
                Phone
                ${verifiedBadge(moi.phone.verified)}
              </label>
              <div style="position:relative">
                <input class="moi-form-input" id="inp-phone" type="tel" value="${moi.phone.value}" ${moi.phone.verified ? 'data-verified="true" readonly' : ''} style="width:100%;padding-right:${moi.phone.verified ? '80px' : '14px'}">
                ${moi.phone.verified ? `<button onclick="unlockVerifiedField('inp-phone','phone')" class="moi-unlock-btn">Edit</button>` : ''}
              </div>
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

function revokeConsent(index, appName) {
  if (!confirm(`Withdraw data licence for "${appName}"?\n\nThis revokes ${appName}'s active licence to request your MOI data going forward. Any data they have already received may be retained by them under their own privacy policy. You can request data deletion separately from ${appName} directly.`)) return;
  const row = document.getElementById(`consent-${index}`);
  if (!row) return;
  row.style.transition = 'opacity .4s ease, transform .4s ease';
  row.style.opacity = '0';
  row.style.transform = 'translateX(20px)';
  // Mark as revoked in mock data
  const active = MOCK.currentUser.accessLog.filter(l => l.granted && l.fields);
  if (active[index]) active[index].granted = false;
  setTimeout(() => {
    row.remove();
    // Update the "N active" count
    const countEl = document.querySelector('.moi-card span[style*="font-size:11px"]');
    const remaining = document.querySelectorAll('.moi-consent-row').length;
    if (countEl) countEl.textContent = `${remaining} active`;
    if (remaining === 0) {
      const consentCard = document.querySelector('.moi-consent-row')?.closest('.moi-card');
      if (!consentCard) {
        // Insert empty state message
        const cards = document.querySelectorAll('.moi-card');
        cards.forEach(c => {
          if (c.textContent.includes('Your Licences')) {
            const existing = c.querySelector('.moi-consent-row');
            if (!existing) {
              const p = document.createElement('div');
              p.style.cssText = 'font-size:13px;color:var(--moi-text-muted);padding:8px 0;font-style:italic';
              p.textContent = 'No active licences.';
              c.appendChild(p);
            }
          }
        });
      }
    }
  }, 420);
}

function unlockVerifiedField(inputId, fieldKey) {
  if (!confirm('⚠ This field is attested.\n\nIf you change this value, it will be marked as unattested. An Attestation Officer will need to re-confirm it before it can be used in licences again.\n\nContinue?')) return;
  const input = document.getElementById(inputId);
  if (!input) return;
  input.removeAttribute('readonly');
  input.removeAttribute('data-verified');
  input.style.borderColor = 'var(--moi-warning)';
  input.style.boxShadow = '0 0 0 3px rgba(255,209,102,.15)';
  input.focus();
  // Hide the unlock button
  const btn = input.parentElement.querySelector('.moi-unlock-btn');
  if (btn) { btn.textContent = 'Unlocked'; btn.style.color = 'var(--moi-warning)'; btn.disabled = true; }
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
      ${moiTopBar('Attestation')}
      <div class="moi-verify-screen">
        <div class="moi-verify-card">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px">
            <button class="btn-moi-outline" onclick="router.go('dashboard')" style="font-size:13px;padding:7px 14px">← Back</button>
            <h2 style="margin-bottom:0">Request Identity Attestation</h2>
          </div>
          <p>Submit your stored information for attestation review. An Attestation Officer will cross-check against your enrollment records and liveliness check results.</p>

          <div style="margin-bottom:14px">
            <div style="font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:.7px;color:var(--moi-text-muted);margin-bottom:10px">Select data to submit for attestation</div>

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
                <span>Cross-checked against liveliness check</span>
              </div>
              ${verifiedBadge(moi.dob.verified)}
            </label>

            <label class="moi-verify-item">
              <input type="checkbox" checked>
              <div class="moi-verify-item-text">
                <strong>Profile Photo</strong>
                <span>Compared against liveliness check</span>
              </div>
              ${verifiedBadge(false)}
            </label>

            <label class="moi-verify-item">
              <input type="checkbox">
              <div class="moi-verify-item-text">
                <strong>Gender — <span style="color:var(--moi-text-muted);font-weight:400">${moi.gender.value}</span></strong>
                <span>Optional — included if relevant to your use case</span>
              </div>
              ${verifiedBadge(moi.gender.verified)}
            </label>

            <label class="moi-verify-item">
              <input type="checkbox">
              <div class="moi-verify-item-text">
                <strong>Email — <span style="color:var(--moi-text-muted);font-weight:400">${moi.email.value}</span></strong>
                <span>Verified at enrollment</span>
              </div>
              ${verifiedBadge(moi.email.verified)}
            </label>

            <label class="moi-verify-item">
              <input type="checkbox">
              <div class="moi-verify-item-text">
                <strong>Phone — <span style="color:var(--moi-text-muted);font-weight:400">${moi.phone.value}</span></strong>
                <span>Verified at enrollment</span>
              </div>
              ${verifiedBadge(moi.phone.verified)}
            </label>

            <label class="moi-verify-item">
              <input type="checkbox">
              <div class="moi-verify-item-text">
                <strong>Address — <span style="color:var(--moi-text-muted);font-weight:400">${moi.address.value}</span></strong>
                <span>Cross-checked against proof of address document</span>
              </div>
              ${verifiedBadge(moi.address.verified)}
            </label>

            <label class="moi-verify-item">
              <input type="checkbox">
              <div class="moi-verify-item-text">
                <strong>City — <span style="color:var(--moi-text-muted);font-weight:400">${moi.city.value}</span></strong>
                <span>Cross-checked against proof of address document</span>
              </div>
              ${verifiedBadge(moi.city.verified)}
            </label>

            <label class="moi-verify-item">
              <input type="checkbox">
              <div class="moi-verify-item-text">
                <strong>State / Province — <span style="color:var(--moi-text-muted);font-weight:400">${moi.state.value}</span></strong>
                <span>Cross-checked against proof of address document</span>
              </div>
              ${verifiedBadge(moi.state.verified)}
            </label>

            <label class="moi-verify-item">
              <input type="checkbox">
              <div class="moi-verify-item-text">
                <strong>Country — <span style="color:var(--moi-text-muted);font-weight:400">${moi.country.value}</span></strong>
                <span>Cross-checked against proof of address document</span>
              </div>
              ${verifiedBadge(moi.country.verified)}
            </label>

            <label class="moi-verify-item">
              <input type="checkbox">
              <div class="moi-verify-item-text">
                <strong>Postal Code — <span style="color:var(--moi-text-muted);font-weight:400">${moi.postalCode.value}</span></strong>
                <span>Cross-checked against proof of address document</span>
              </div>
              ${verifiedBadge(moi.postalCode.verified)}
            </label>

            <label class="moi-verify-item">
              <input type="checkbox">
              <div class="moi-verify-item-text">
                <strong>Occupation — <span style="color:var(--moi-text-muted);font-weight:400">${moi.occupation.value}</span></strong>
                <span>Optional — included if relevant to your use case</span>
              </div>
              ${verifiedBadge(moi.occupation.verified)}
            </label>

            <label class="moi-verify-item">
              <input type="checkbox">
              <div class="moi-verify-item-text">
                <strong>Bio</strong>
                <span>Optional — self-authored description</span>
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

          <div class="moi-privacy-note" style="flex-direction:column;gap:10px;align-items:flex-start">
            <div style="display:flex;align-items:flex-start;gap:8px">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" style="flex-shrink:0;margin-top:1px"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              <span><strong style="color:var(--moi-text)">Officer-only custody.</strong> Your documents are transmitted securely and held exclusively by your assigned Attestation Officer — a commissioned US Notary Public. Your supervisor and all other OSMIO staff have no access. Documents may only be disclosed under a valid court order and are otherwise legally protected under US notarial privilege law.</span>
            </div>
            <div style="display:flex;align-items:flex-start;gap:8px">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" style="flex-shrink:0;margin-top:1px"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <span><strong style="color:var(--moi-text)">Session recording.</strong> Your video attestation session will be recorded and retained in the secure custody of your Attestation Officer under the same notarial privilege protections. The recording cannot be shared with any third party without a court order.</span>
            </div>
          </div>

          <div style="display:flex;gap:10px">
            <button class="btn-moi" onclick="submitVerification()">
              Submit for Attestation
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
  btn.innerHTML = `${SPINNER_SVG} Saving documents…`;
  btn.disabled = true;
  setTimeout(() => {
    router.go('schedule-slot');
  }, 900);
}

// ── Screen: Schedule Slot ──────────────────────────────────────
let selectedSlot = null; // { date, time, label }

function renderScheduleSlot() {
  // Build 2-week slot grid starting next Monday
  const today = new Date('2026-04-24');
  const slots = [];
  const days = [];
  // Find next Mon
  let d = new Date(today);
  d.setDate(d.getDate() + ((1 + 7 - d.getDay()) % 7 || 7));

  for (let w = 0; w < 2; w++) {
    const weekDays = [];
    for (let i = 0; i < 5; i++) {
      const dd = new Date(d);
      dd.setDate(d.getDate() + w * 7 + i);
      weekDays.push(dd);
    }
    days.push(weekDays);
  }

  const times = ['09:00','09:30','10:00','10:30','11:00','11:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30'];

  // Busy slots = all sessions already scheduled (any officer)
  const busySet = new Set(
    MOCK.attestationRequests
      .filter(r => r.slotDate && r.slotTime && r.status !== 'completed')
      .map(r => r.slotDate + 'T' + r.slotTime)
  );

  function fmtDay(d) {
    return d.toLocaleDateString('en-GB', { weekday:'short', day:'numeric', month:'short' });
  }
  function fmtISO(d) {
    return d.toISOString().slice(0,10);
  }

  let weekIdx = 0;

  function buildGrid(wi) {
    const weekDays = days[wi];
    return `<div class="moi-slot-grid">
      ${weekDays.map(day => {
        const iso = fmtISO(day);
        return `<div class="moi-slot-col">
          <div class="moi-slot-day-hdr">${fmtDay(day)}</div>
          ${times.map(t => {
            const key = iso + 'T' + t;
            const busy = busySet.has(key);
            const isSelected = selectedSlot && selectedSlot.date === iso && selectedSlot.time === t;
            return `<button
              class="moi-slot-btn ${busy ? 'busy' : ''} ${isSelected ? 'selected' : ''}"
              ${busy ? 'disabled' : ''}
              onclick="selectSlot('${iso}','${t}','${fmtDay(day)} ${t}')">
              ${t}
            </button>`;
          }).join('')}
        </div>`;
      }).join('')}
    </div>`;
  }

  document.getElementById('app').innerHTML = `
    <div class="moi-screen">
      ${moiTopBar('Schedule Video Call')}
      <div class="moi-schedule-screen">
        <div class="moi-schedule-card">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px">
            <button class="btn-moi-outline" onclick="router.go('verify-request')" style="font-size:13px;padding:7px 14px">← Back</button>
            <h2 style="margin:0">Schedule Your Attestation Call</h2>
          </div>
          <p style="color:var(--moi-text-muted);font-size:13.5px;margin:0 0 12px;line-height:1.55">Select an available 30-minute slot for a video call with your Attestation Officer. Once confirmed, the supervisor will assign you an officer and you'll receive a calendar invite by email.</p>
          <div style="display:flex;align-items:flex-start;gap:8px;padding:10px 14px;background:rgba(255,209,102,.06);border:1px solid rgba(255,209,102,.18);border-radius:9px;margin-bottom:20px;font-size:12.5px;color:var(--moi-warning);line-height:1.55">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" style="flex-shrink:0;margin-top:1px"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <span>This video session will be <strong>recorded</strong> and held in the exclusive secure custody of your Attestation Officer (a commissioned US Notary Public). The recording is protected under notarial privilege — it cannot be shared with any third party, including OSMIO supervisory staff, without a court order.</span>
          </div>

          <div class="moi-slot-week-nav">
            <button class="moi-slot-week-btn active" id="wbtn-0" onclick="switchSlotWeek(0)">Week 1 · Apr 27 – May 1</button>
            <button class="moi-slot-week-btn" id="wbtn-1" onclick="switchSlotWeek(1)">Week 2 · May 4 – May 8</button>
          </div>

          <div id="slot-grid-wrap">
            ${buildGrid(0)}
          </div>

          <div class="moi-slot-legend">
            <span><span class="moi-slot-dot available"></span>Available</span>
            <span><span class="moi-slot-dot busy"></span>Unavailable</span>
            <span><span class="moi-slot-dot selected"></span>Selected</span>
          </div>

          <div id="slot-confirm-bar" class="moi-slot-confirm ${selectedSlot ? '' : 'hidden'}">
            <div>
              <div style="font-size:13px;font-weight:700;color:var(--moi-text)">Selected: <span id="slot-confirm-label">${selectedSlot ? selectedSlot.label : ''}</span></div>
              <div style="font-size:11.5px;color:var(--moi-text-muted);margin-top:2px">30-minute video call · Officer assigned by supervisor</div>
            </div>
            <button class="btn-moi" onclick="confirmSlotAndShowEmail()">
              Continue →
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Email preview modal -->
    <div id="email-preview-modal" class="moi-email-modal hidden" onclick="if(event.target.id==='email-preview-modal')this.classList.add('hidden')">
      <div class="moi-email-modal-inner">
        <div class="moi-email-modal-hdr">
          <div>
            <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.6px;color:#9ca3af;margin-bottom:4px">Email Preview — sent to you on confirmation</div>
            <div style="font-size:15px;font-weight:700;color:#111827">Attestation Request Received · ATT-2026-01024</div>
          </div>
          <button onclick="document.getElementById('email-preview-modal').classList.add('hidden')" style="font-size:22px;color:#6b7280;background:none;border:none;cursor:pointer;line-height:1">×</button>
        </div>
        <div class="moi-email-modal-meta">
          <span><strong>From:</strong> no-reply@osmio.id</span>
          <span><strong>To:</strong> alex.johnson@example.com</span>
        </div>
        <div class="moi-email-modal-body">
          ${MOCK.emails['alex.johnson@example.com'].find(e=>e.tag==='attestation-submitted').body}
        </div>
        <div class="moi-email-modal-footer">
          <button class="btn-moi-outline" onclick="document.getElementById('email-preview-modal').classList.add('hidden')" style="font-size:13px">Close Preview</button>
          <button class="btn-moi" onclick="finalSubmitAttestation()" style="font-size:13px">
            Confirm & Submit
          </button>
        </div>
      </div>
    </div>`;

  // Re-store weekIdx for switching
  window._slotWeekDays = days;
  window._slotBusySet = busySet;
  window._slotTimes = times;
  window._slotFmtDay = fmtDay;
  window._slotFmtISO = fmtISO;
  window._buildSlotGrid = buildGrid;
}

function switchSlotWeek(wi) {
  document.getElementById('slot-grid-wrap').innerHTML = window._buildSlotGrid(wi);
  document.querySelectorAll('.moi-slot-week-btn').forEach((b,i) => b.classList.toggle('active', i===wi));
}

function selectSlot(date, time, label) {
  selectedSlot = { date, time, label };
  document.querySelectorAll('.moi-slot-btn').forEach(b => b.classList.remove('selected'));
  event.currentTarget.classList.add('selected');
  const bar = document.getElementById('slot-confirm-bar');
  const lbl = document.getElementById('slot-confirm-label');
  if (bar) bar.classList.remove('hidden');
  if (lbl) lbl.textContent = label;
}

function confirmSlotAndShowEmail() {
  if (!selectedSlot) return;
  document.getElementById('email-preview-modal').classList.remove('hidden');
}

function finalSubmitAttestation() {
  document.getElementById('email-preview-modal').classList.add('hidden');
  const btn = document.querySelector('.btn-moi');
  MOCK.currentUser.verificationStatus = 'pending';

  const refId = 'ATT-2026-01024';
  document.getElementById('app').innerHTML = `
    <div class="moi-screen">
      ${moiTopBar('Request Submitted')}
      <div class="moi-success-screen">
        <div class="moi-success-card">
          <div class="moi-success-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <h2>Attestation request submitted</h2>
          <p>Your documents and chosen time slot have been sent to the supervisor team. You'll receive a confirmation email once an officer is assigned — typically within 1 business day.</p>
          <div style="margin-top:16px;padding:14px 16px;background:rgba(0,180,216,.06);border:1px solid rgba(0,180,216,.15);border-radius:9px;font-size:13px;color:var(--moi-text-muted);line-height:1.6">
            <div>Reference: <strong style="color:var(--moi-accent);font-family:monospace">${refId}</strong></div>
            <div style="margin-top:4px">Slot: <strong style="color:var(--moi-text)">${selectedSlot ? selectedSlot.label : '—'}</strong></div>
          </div>
          <div style="display:flex;gap:10px;margin-top:20px;flex-wrap:wrap">
            <button class="btn-moi" style="flex:1" onclick="router.go('dashboard')">Back to Dashboard</button>
            <a href="email.html#alex" style="flex:1;display:flex;align-items:center;justify-content:center;gap:6px;padding:10px 16px;background:rgba(0,180,216,.1);border:1px solid rgba(0,180,216,.2);border-radius:10px;font-size:13px;font-weight:700;color:var(--moi-accent);text-decoration:none">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              View in Inbox
            </a>
          </div>
        </div>
      </div>
    </div>`;
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

function viewCertificate(certId) {
  sessionStorage.setItem('moi_viewing_cert', certId);
  router.go('certificate');
}

// ── Screen: Notarial Certificate Detail ───────────────────────
function renderCertificateDetail() {
  const certId = sessionStorage.getItem('moi_viewing_cert');
  const cert = MOCK.currentUser.notarialCertificates.find(c => c.id === certId);
  if (!cert) { router.go('dashboard'); return; }
  const u = MOCK.currentUser;

  document.getElementById('app').innerHTML = `
    <div class="moi-screen">
      ${moiTopBar('Notarial Certificate')}
      <div class="moi-verify-screen">
        <div class="moi-verify-card">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:20px">
            <button class="btn-moi-outline" onclick="router.go('dashboard')" style="font-size:13px;padding:7px 14px">← Back</button>
            <h2 style="margin:0">Notarial Certificate</h2>
          </div>

          <!-- Certificate document -->
          <div style="background:#fff;border-radius:14px;padding:36px 40px;border:2px solid rgba(6,214,160,.3);box-shadow:0 4px 32px rgba(0,0,0,.18);font-family:'Times New Roman',serif;color:#111;position:relative;overflow:hidden">

            <!-- Watermark -->
            <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%) rotate(-30deg);font-size:80px;font-weight:900;color:rgba(0,180,216,.04);pointer-events:none;white-space:nowrap;letter-spacing:8px">OSMIO</div>

            <div style="text-align:center;margin-bottom:28px">
              <div style="display:inline-flex;align-items:center;gap:8px;margin-bottom:8px">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0077a8" stroke-width="2" stroke-linecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>
                <span style="font-size:13px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#0077a8">OSMIO Identity Network</span>
              </div>
              <div style="font-size:22px;font-weight:700;letter-spacing:1px;margin-bottom:4px;color:#111">NOTARIAL CERTIFICATE</div>
              <div style="font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#666">Certificate of Identity Attestation</div>
              <div style="width:80px;height:2px;background:linear-gradient(90deg,#0077a8,#06d6a0);border-radius:999px;margin:12px auto 0"></div>
            </div>

            <div style="font-size:13.5px;line-height:1.9;margin-bottom:20px;color:#222">
              <p>I, <strong>${cert.officerName}</strong>, a Notary Public duly commissioned in the <strong>${cert.officerJurisdiction}</strong>, Commission No. <strong>${cert.notaryCommissionNo}</strong>, do hereby certify that on <strong>${formatDate(cert.issuedDate)}</strong>, the following individual appeared before me by live video call and presented satisfactory evidence of their identity:</p>
            </div>

            <div style="background:rgba(0,119,168,.05);border:1px solid rgba(0,119,168,.15);border-radius:10px;padding:18px 22px;margin-bottom:20px">
              <div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.8px;color:#0077a8;margin-bottom:10px">Subject of Attestation</div>
              <table style="width:100%;font-size:13.5px;border-collapse:collapse">
                <tr><td style="padding:4px 0;color:#555;width:40%">Full Name</td><td style="padding:4px 0;font-weight:600">${cert.issuedTo}</td></tr>
                <tr><td style="padding:4px 0;color:#555">OSMIO Certificate ID</td><td style="padding:4px 0;font-family:monospace;font-size:12.5px">${cert.issuedToCertId}</td></tr>
                <tr><td style="padding:4px 0;color:#555">Fields Attested</td><td style="padding:4px 0;font-weight:600">${cert.fieldsAttested.join(', ')}</td></tr>
              </table>
            </div>

            <div style="font-size:13.5px;line-height:1.9;margin-bottom:20px;color:#222">
              <p>${cert.notes}</p>
              <p>This certificate is issued pursuant to US notarial law and is valid until <strong>${formatDate(cert.expiresDate)}</strong>. The identity session was recorded and the recording is retained in the secure custody of the undersigned Notary Public. It may only be disclosed pursuant to a valid court order.</p>
            </div>

            <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-top:28px;padding-top:20px;border-top:1px solid #ddd">
              <div style="font-size:12px;color:#555">
                <div style="font-family:monospace;font-size:11px;margin-bottom:2px;color:#999">Certificate Ref: ${cert.id} · Session: ${cert.sessionRef}</div>
                <div>Issued: ${formatDate(cert.issuedDate)}</div>
                <div>Notary Commission: ${cert.notaryCommissionNo}</div>
              </div>
              <div style="text-align:right">
                <div style="font-style:italic;font-size:15px;color:#333;margin-bottom:2px;font-family:'Dancing Script',cursive,serif">${cert.officerName}</div>
                <div style="font-size:11px;color:#555;text-transform:uppercase;letter-spacing:.5px">Notary Public</div>
                <div style="font-size:11px;color:#555">${cert.officerJurisdiction}</div>
              </div>
            </div>

            <div style="margin-top:24px;padding:10px 14px;background:rgba(0,0,0,.02);border-radius:8px;text-align:center">
              <div style="font-size:10px;color:#999;letter-spacing:.5px">Verify this certificate at <strong style="color:#0077a8">verify.osmio.id</strong> · Ref: ${cert.id}</div>
            </div>
          </div>

          <div style="margin-top:16px;padding:12px 16px;background:rgba(0,180,216,.05);border:1px solid rgba(0,180,216,.12);border-radius:9px;font-size:12px;color:var(--moi-text-muted);line-height:1.6">
            <strong style="color:var(--moi-accent)">About this certificate.</strong> This notarial certificate was issued by a licensed US Notary Public after your live video attestation session. It is legally protected under US notarial law. The originating documents and session recording remain in the exclusive custody of the issuing officer and are accessible only under court order.
          </div>
        </div>
      </div>
    </div>`;
}

// ── Router init ────────────────────────────────────────────────
router
  .on('login',          renderLogin)
  .on('consent',        renderConsent)
  .on('dashboard',      renderDashboard)
  .on('manage',         renderManage)
  .on('verify-request', renderVerifyRequest)
  .on('schedule-slot',  renderScheduleSlot)
  .on('certificate',    renderCertificateDetail)
  .init('login');

window.addEventListener('hashchange', () => {
  document.querySelectorAll('#demo-nav a').forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === `moi.html${location.hash}`);
  });
});
