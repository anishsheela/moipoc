// =============================================================
// MOCK DATA — Single source of truth for the entire demo
// =============================================================

const MOCK = {

  // ── Current logged-in user (demo subject) ──────────────────
  currentUser: {
    id: 'usr_001',
    email: 'alex.johnson@example.com',
    phone: '+1 (512) 555-0147',
    idqa: 12,
    enrolledDate: '2024-11-15',
    initials: 'AJ',
    avatarColor: '#aa1945',

    certs: {
      foundation: {
        id: 'OSMIO-FND-2024-00847',
        commonName: 'Alex Johnson',
        email: 'alex.johnson@example.com',
        issuer: 'OSMIO Foundation CA',
        validFrom: '2024-11-15',
        validTo: '2026-11-15',
        fingerprint: 'A4:F2:8C:1D:93:7E:B5:02:4F:68:C3:A1:9D:52:7B:E4',
        serial: '03:A1:7C:9F:2B:44'
      },
      numberplate: {
        id: 'OSMIO-NP-2024-03291',
        commonName: 'OSMIO Numberplate',
        issuer: 'OSMIO Numberplate CA',
        validFrom: '2024-11-15',
        validTo: '2026-11-15',
        fingerprint: '7B:C9:3E:F1:08:2A:D4:56:E7:91:BC:4F:A2:63:88:1D',
        serial: '09:F3:2C:8A:61:B5'
      }
    },

    moi: {
      firstName:   { value: 'Alex',                                   verified: true,  verifiedDate: '2024-11-16' },
      lastName:    { value: 'Johnson',                                 verified: true,  verifiedDate: '2024-11-16' },
      dob:         { value: '1992-03-24',                              verified: false, verifiedDate: null },
      gender:      { value: 'Male',                                    verified: false, verifiedDate: null },
      photo:       { value: null,                                      verified: false, verifiedDate: null },
      email:       { value: 'alex.johnson@example.com',                verified: true,  verifiedDate: '2024-11-15' },
      phone:       { value: '+1 (512) 555-0147',                       verified: true,  verifiedDate: '2024-11-15' },
      address:     { value: '42 Maple Street, Austin, TX 78701',       verified: false, verifiedDate: null },
      city:        { value: 'Austin',                                  verified: false, verifiedDate: null },
      state:       { value: 'Texas',                                   verified: false, verifiedDate: null },
      country:     { value: 'United States',                           verified: false, verifiedDate: null },
      postalCode:  { value: '78701',                                   verified: false, verifiedDate: null },
      occupation:  { value: 'Software Engineer',                       verified: false, verifiedDate: null },
      bio:         { value: 'Coffee enthusiast, amateur photographer, and hiking lover.', verified: false, verifiedDate: null }
    },

    verificationStatus: 'none', // none | pending | approved

    accessLog: [
      { app: 'Trusted & True',  date: '2026-04-07T10:23:00', fields: ['First Name', 'Last Name'],                  certType: 'foundation',   granted: true  },
      { app: 'MOI Dashboard',   date: '2026-04-06T15:45:00', fields: null,                                          certType: 'foundation',   granted: true  },
      { app: 'Trusted & True',  date: '2026-04-03T11:12:00', fields: ['First Name', 'Last Name', 'Photo'],          certType: 'foundation',   granted: true  },
      { app: 'MOI Dashboard',   date: '2026-03-28T09:30:00', fields: null,                                          certType: 'foundation',   granted: true  },
      { app: 'Trusted & True',  date: '2026-03-15T14:22:00', fields: ['First Name', 'Last Name'],                   certType: 'numberplate',  granted: true  },
      { app: 'Trusted & True',  date: '2026-02-20T08:05:00', fields: ['First Name', 'Last Name', 'Date of Birth'],  certType: 'foundation',   granted: false },
    ]
  },

  // ── All registered users ───────────────────────────────────
  users: [
    {
      id: 'usr_001', name: 'Alex Johnson',   email: 'alex.johnson@example.com',
      idqa: 12, initials: 'AJ', avatarColor: '#aa1945',
      enrolledDate: '2024-11-15', verificationStatus: 'none',
      certId: 'OSMIO-FND-2024-00847'
    },
    {
      id: 'usr_002', name: 'Sarah Chen',     email: 's.chen@example.com',
      idqa: 8,  initials: 'SC', avatarColor: '#0077a8',
      enrolledDate: '2025-01-08', verificationStatus: 'pending',
      certId: 'OSMIO-FND-2025-01203'
    },
    {
      id: 'usr_003', name: 'Marcus Rivera',  email: 'm.rivera@example.com',
      idqa: 8,  initials: 'MR', avatarColor: '#6b21a8',
      enrolledDate: '2025-03-02', verificationStatus: 'none',
      certId: 'OSMIO-FND-2025-02490'
    },
    {
      id: 'usr_004', name: 'Emma Williams',  email: 'e.williams@example.com',
      idqa: 12, initials: 'EW', avatarColor: '#065f46',
      enrolledDate: '2024-12-20', verificationStatus: 'approved',
      certId: 'OSMIO-FND-2024-01150'
    },
    {
      id: 'usr_005', name: 'David Park',     email: 'd.park@example.com',
      idqa: 8,  initials: 'DP', avatarColor: '#b45309',
      enrolledDate: '2025-02-14', verificationStatus: 'pending',
      certId: 'OSMIO-FND-2025-02841'
    },
    {
      id: 'usr_006', name: 'Priya Sharma',   email: 'p.sharma@example.com',
      idqa: 8,  initials: 'PS', avatarColor: '#9d174d',
      enrolledDate: '2025-03-10', verificationStatus: 'pending',
      certId: 'OSMIO-FND-2025-03155'
    },
    {
      id: 'usr_007', name: "James O'Brien",  email: 'j.obrien@example.com',
      idqa: 12, initials: 'JO', avatarColor: '#1e40af',
      enrolledDate: '2025-01-30', verificationStatus: 'approved',
      certId: 'OSMIO-FND-2025-02103'
    },
    {
      id: 'usr_008', name: 'Yuki Tanaka',    email: 'y.tanaka@example.com',
      idqa: 12, initials: 'YT', avatarColor: '#065f46',
      enrolledDate: '2024-12-05', verificationStatus: 'approved',
      certId: 'OSMIO-FND-2024-01899'
    },
    {
      id: 'usr_009', name: 'Robert Garcia',  email: 'r.garcia@example.com',
      idqa: 8,  initials: 'RG', avatarColor: '#7c3aed',
      enrolledDate: '2025-02-01', verificationStatus: 'rejected',
      certId: 'OSMIO-FND-2025-01654'
    },
    {
      id: 'usr_010', name: 'Amara Osei',     email: 'a.osei@example.com',
      idqa: 12, initials: 'AO', avatarColor: '#854d0e',
      enrolledDate: '2025-04-01', verificationStatus: 'none',
      certId: 'OSMIO-FND-2025-04002'
    }
  ],

  // ── Verification queue (admin panel) ──────────────────────
  verificationQueue: [
    {
      id: 'vrf_001',
      userId: 'usr_002',
      userName: 'Sarah Chen',
      email: 's.chen@example.com',
      initials: 'SC',
      avatarColor: '#0077a8',
      certId: 'OSMIO-FND-2025-01203',
      submittedDate: '2026-04-05T09:15:00',
      resolvedDate: null,
      status: 'pending',
      idqaCurrent: 8,
      idqaIfApproved: 12,
      adminNote: '',
      trustSwiftlyRef: 'TS-2026-00912',
      submittedFields: {
        firstName:  { submitted: 'Sarah',          enrolled: 'Sarah',          match: true  },
        lastName:   { submitted: 'Chen',            enrolled: 'Chen',           match: true  },
        dob:        { submitted: '1995-07-14',      enrolled: '1995-07-14',     match: true  },
        photo:      { submitted: '[image on file]', enrolled: null,             match: null  }
      }
    },
    {
      id: 'vrf_002',
      userId: 'usr_005',
      userName: 'David Park',
      email: 'd.park@example.com',
      initials: 'DP',
      avatarColor: '#b45309',
      certId: 'OSMIO-FND-2025-02841',
      submittedDate: '2026-04-06T14:30:00',
      resolvedDate: null,
      status: 'pending',
      idqaCurrent: 8,
      idqaIfApproved: 12,
      adminNote: '',
      trustSwiftlyRef: 'TS-2026-01034',
      submittedFields: {
        firstName:  { submitted: 'David',           enrolled: 'David',          match: true  },
        lastName:   { submitted: 'Park',            enrolled: 'Park',           match: true  },
        dob:        { submitted: '1988-11-03',      enrolled: '1988-11-03',     match: true  },
        photo:      { submitted: '[image on file]', enrolled: null,             match: null  }
      }
    },
    {
      id: 'vrf_003',
      userId: 'usr_006',
      userName: 'Priya Sharma',
      email: 'p.sharma@example.com',
      initials: 'PS',
      avatarColor: '#9d174d',
      certId: 'OSMIO-FND-2025-03155',
      submittedDate: '2026-04-04T11:00:00',
      resolvedDate: null,
      status: 'pending',
      idqaCurrent: 8,
      idqaIfApproved: 12,
      adminNote: '',
      trustSwiftlyRef: 'TS-2026-00887',
      submittedFields: {
        firstName:  { submitted: 'Priya',           enrolled: 'Priya',          match: true  },
        lastName:   { submitted: 'Sharma',          enrolled: 'Sharma',         match: true  },
        dob:        { submitted: '1997-02-28',      enrolled: '1997-02-28',     match: true  },
        photo:      { submitted: '[image on file]', enrolled: null,             match: null  }
      }
    },
    {
      id: 'vrf_004',
      userId: 'usr_007',
      userName: "James O'Brien",
      email: 'j.obrien@example.com',
      initials: 'JO',
      avatarColor: '#1e40af',
      certId: 'OSMIO-FND-2025-02103',
      submittedDate: '2026-04-03T16:45:00',
      resolvedDate: '2026-04-03T18:20:00',
      status: 'approved',
      idqaCurrent: 12,
      adminNote: 'All documents verified successfully. Liveness check passed.',
      trustSwiftlyRef: 'TS-2026-00801',
      submittedFields: {
        firstName:  { submitted: 'James',           enrolled: 'James',          match: true  },
        lastName:   { submitted: "O'Brien",         enrolled: "O'Brien",        match: true  },
        dob:        { submitted: '1990-05-17',      enrolled: '1990-05-17',     match: true  },
        photo:      { submitted: '[image on file]', enrolled: null,             match: null  }
      }
    },
    {
      id: 'vrf_005',
      userId: 'usr_008',
      userName: 'Yuki Tanaka',
      email: 'y.tanaka@example.com',
      initials: 'YT',
      avatarColor: '#065f46',
      certId: 'OSMIO-FND-2024-01899',
      submittedDate: '2026-04-02T10:00:00',
      resolvedDate: '2026-04-02T11:30:00',
      status: 'approved',
      idqaCurrent: 12,
      adminNote: 'Identity confirmed. TrustSwiftly liveness and document clear.',
      trustSwiftlyRef: 'TS-2026-00755',
      submittedFields: {
        firstName:  { submitted: 'Yuki',            enrolled: 'Yuki',           match: true  },
        lastName:   { submitted: 'Tanaka',          enrolled: 'Tanaka',         match: true  },
        dob:        { submitted: '1993-09-08',      enrolled: '1993-09-08',     match: true  },
        photo:      { submitted: '[image on file]', enrolled: null,             match: null  }
      }
    },
    {
      id: 'vrf_006',
      userId: 'usr_009',
      userName: 'Robert Garcia',
      email: 'r.garcia@example.com',
      initials: 'RG',
      avatarColor: '#7c3aed',
      certId: 'OSMIO-FND-2025-01654',
      submittedDate: '2026-04-01T09:00:00',
      resolvedDate: '2026-04-01T14:15:00',
      status: 'rejected',
      idqaCurrent: 8,
      adminNote: 'Photo quality insufficient. ID document partially obscured. Please resubmit with clearer images.',
      trustSwiftlyRef: 'TS-2026-00701',
      submittedFields: {
        firstName:  { submitted: 'Robert',          enrolled: 'Robert',         match: true  },
        lastName:   { submitted: 'Garcia',          enrolled: 'Garcia',         match: true  },
        dob:        { submitted: '1985-12-30',      enrolled: '1985-12-30',     match: true  },
        photo:      { submitted: '[image on file]', enrolled: null,             match: null  }
      }
    }
  ],

  // ── TNT profile data (what TNT sees after MOI share) ──────
  tntProfile: {
    userId: 'usr_001',
    joinedTnT: '2026-01-10',
    matches: 12,
    messages: 47,
    profileComplete: 72,
    interests: ['Hiking', 'Photography', 'Coffee', 'Travel', 'Music'],
    location: 'Austin, TX',
    lastActive: '2026-04-07T10:23:00'
  },

  // ── Admin credentials (demo) ───────────────────────────────
  admin: {
    username: 'admin@osmio.id',
    password: 'osmio2026',
    name: 'Admin Portal',
    role: 'Attestation Officer'
  },

  // ── SVG Assets — generated illustrations ──────────────────
  svgAssets: {

    // Alex Johnson portrait photo
    userPhoto: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160">
      <rect width="160" height="160" fill="#1e3450"/>
      <ellipse cx="80" cy="180" rx="72" ry="45" fill="#1e3d6e"/>
      <rect x="66" y="112" width="28" height="32" rx="7" fill="#c8906a"/>
      <path d="M52 152 L67 130 L80 138 L93 130 L108 152Z" fill="#2c5282"/>
      <ellipse cx="80" cy="78" rx="36" ry="40" fill="#c8906a"/>
      <ellipse cx="45" cy="82" rx="8" ry="11" fill="#b87850"/>
      <ellipse cx="115" cy="82" rx="8" ry="11" fill="#b87850"/>
      <ellipse cx="80" cy="44" rx="38" ry="19" fill="#2a1808"/>
      <rect x="42" y="44" width="76" height="24" fill="#2a1808"/>
      <ellipse cx="44" cy="66" rx="9" ry="22" fill="#2a1808"/>
      <ellipse cx="116" cy="66" rx="9" ry="22" fill="#2a1808"/>
      <path d="M57 70 Q67 65 77 70" stroke="#1a0e04" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <path d="M83 70 Q93 65 103 70" stroke="#1a0e04" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <ellipse cx="66" cy="81" rx="7" ry="7" fill="white"/>
      <ellipse cx="94" cy="81" rx="7" ry="7" fill="white"/>
      <circle cx="67" cy="82" r="4.5" fill="#1a0e04"/>
      <circle cx="95" cy="82" r="4.5" fill="#1a0e04"/>
      <circle cx="66" cy="80" r="1.5" fill="white" opacity="0.85"/>
      <circle cx="94" cy="80" r="1.5" fill="white" opacity="0.85"/>
      <path d="M80 88 C77 95 75 100 77 103 Q80 105 83 103 C85 100 83 95 80 88Z" fill="#b07850" opacity="0.65"/>
      <path d="M69 108 Q80 117 91 108" stroke="#965838" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    </svg>`,

    // Government ID card
    govId: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 318">
      <rect width="500" height="318" rx="14" fill="#1a2f48"/>
      <rect width="500" height="56" rx="0" fill="#0a1a2e"/>
      <rect width="500" height="56" rx="14" fill="#0a1a2e"/>
      <rect y="28" width="500" height="28" fill="#0a1a2e"/>
      <circle cx="44" cy="28" r="20" fill="none" stroke="#c8a840" stroke-width="1.5" opacity="0.7"/>
      <text x="44" y="35" text-anchor="middle" fill="#c8a840" font-size="17" font-family="serif">★</text>
      <text x="265" y="21" text-anchor="middle" fill="white" font-family="Arial" font-size="12" font-weight="bold" letter-spacing="2">IDENTITY DOCUMENT</text>
      <text x="265" y="41" text-anchor="middle" fill="#7aaccc" font-family="Arial" font-size="9.5" letter-spacing="1.5">UNITED STATES OF AMERICA · OSMIO IDENTITY AUTHORITY</text>
      <rect x="0" y="56" width="5" height="262" fill="#c8a840" opacity="0.5"/>
      <rect x="22" y="74" width="106" height="134" rx="7" fill="#0d1a2c" stroke="#2a4870" stroke-width="1.5"/>
      <ellipse cx="75" cy="118" rx="26" ry="30" fill="#c8906a"/>
      <ellipse cx="75" cy="160" rx="36" ry="26" fill="#1e3d6e"/>
      <ellipse cx="52" cy="122" rx="7" ry="9" fill="#b87850"/>
      <ellipse cx="98" cy="122" rx="7" ry="9" fill="#b87850"/>
      <ellipse cx="75" cy="94" rx="28" ry="14" fill="#1e0e04"/>
      <rect x="47" y="94" width="56" height="18" fill="#1e0e04"/>
      <ellipse cx="148" cy="102" rx="42" ry="6" fill="none"/>
      <ellipse cx="62" cy="108" rx="6" ry="16" fill="#1e0e04"/>
      <ellipse cx="88" cy="108" rx="6" ry="16" fill="#1e0e04"/>
      <ellipse cx="64" cy="116" rx="5" ry="5" fill="white"/>
      <ellipse cx="86" cy="116" rx="5" ry="5" fill="white"/>
      <circle cx="65" cy="117" r="3" fill="#1a0e04"/>
      <circle cx="87" cy="117" r="3" fill="#1a0e04"/>
      <path d="M67 136 Q75 142 83 136" stroke="#7a4828" stroke-width="2" fill="none" stroke-linecap="round"/>
      <text x="75" y="222" text-anchor="middle" fill="#4a7aaa" font-family="Arial" font-size="8.5">PHOTO</text>
      <rect x="22" y="228" width="48" height="36" rx="4" fill="#b8941e"/>
      <line x1="22" y1="240" x2="70" y2="240" stroke="#7a600a" stroke-width="1.5"/>
      <line x1="22" y1="249" x2="70" y2="249" stroke="#7a600a" stroke-width="1.5"/>
      <line x1="22" y1="258" x2="70" y2="258" stroke="#7a600a" stroke-width="1.5"/>
      <line x1="37" y1="228" x2="37" y2="264" stroke="#7a600a" stroke-width="1.5"/>
      <line x1="54" y1="228" x2="54" y2="264" stroke="#7a600a" stroke-width="1.5"/>
      <text x="150" y="92" fill="#7aaccc" font-family="Arial" font-size="9" letter-spacing="1">SURNAME</text>
      <text x="150" y="109" fill="white" font-family="Arial" font-size="17" font-weight="bold">JOHNSON</text>
      <text x="150" y="130" fill="#7aaccc" font-family="Arial" font-size="9" letter-spacing="1">GIVEN NAME(S)</text>
      <text x="150" y="147" fill="white" font-family="Arial" font-size="17" font-weight="bold">ALEX</text>
      <text x="150" y="168" fill="#7aaccc" font-family="Arial" font-size="9" letter-spacing="1">DATE OF BIRTH</text>
      <text x="150" y="184" fill="white" font-family="Arial" font-size="13">24 MAR 1992</text>
      <text x="340" y="92" fill="#7aaccc" font-family="Arial" font-size="9" letter-spacing="1">SEX</text>
      <text x="340" y="109" fill="white" font-family="Arial" font-size="17" font-weight="bold">M</text>
      <text x="340" y="130" fill="#7aaccc" font-family="Arial" font-size="9" letter-spacing="1">NATIONALITY</text>
      <text x="340" y="147" fill="white" font-family="Arial" font-size="13">AMERICAN</text>
      <text x="340" y="168" fill="#7aaccc" font-family="Arial" font-size="9" letter-spacing="1">EXPIRY</text>
      <text x="340" y="184" fill="white" font-family="Arial" font-size="13">24 MAR 2030</text>
      <text x="150" y="204" fill="#7aaccc" font-family="Arial" font-size="9" letter-spacing="1">DOCUMENT NUMBER</text>
      <text x="150" y="221" fill="white" font-family="Courier New" font-size="14" font-weight="bold">US-ID-2024-8471052</text>
      <rect x="0" y="278" width="500" height="40" fill="#050d18"/>
      <text x="14" y="296" fill="#00d060" font-family="Courier New" font-size="9.5" opacity="0.9">IDUSJOHNSON&lt;&lt;ALEX&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;</text>
      <text x="14" y="312" fill="#00d060" font-family="Courier New" font-size="9.5" opacity="0.9">8471052&lt;3USA9203248M3003248&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;</text>
    </svg>`,

    // TrustSwiftly liveness verification screenshot
    trustSwiftly: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 580">
      <rect width="360" height="580" rx="28" fill="#f8fafc"/>
      <rect x="1" y="1" width="358" height="578" rx="27" fill="none" stroke="#e2e8f0" stroke-width="2"/>
      <rect x="130" y="14" width="100" height="6" rx="3" fill="#cbd5e1"/>
      <rect x="142" y="16" width="12" height="2" rx="1" fill="#94a3b8"/>
      <circle cx="233" cy="17" r="3" fill="#94a3b8"/>
      <rect x="24" y="40" width="50" height="18" rx="4" fill="#0ea5e9" opacity="0.15"/>
      <text x="49" y="53" text-anchor="middle" fill="#0ea5e9" font-family="Arial" font-size="10" font-weight="bold">TRUST</text>
      <text x="200" y="53" text-anchor="middle" fill="#0f172a" font-family="Arial" font-size="14" font-weight="bold">Identity Verification</text>
      <rect x="22" y="70" width="316" height="200" rx="12" fill="#0f172a"/>
      <ellipse cx="180" cy="148" rx="55" ry="62" fill="#c8906a"/>
      <ellipse cx="148" cy="154" rx="9" ry="9" fill="white"/>
      <ellipse cx="212" cy="154" rx="9" ry="9" fill="white"/>
      <circle cx="150" cy="155" r="6" fill="#1a0e04"/>
      <circle cx="214" cy="155" r="6" fill="#1a0e04"/>
      <path d="M162 175 Q180 185 198 175" stroke="#7a4828" stroke-width="3" fill="none" stroke-linecap="round"/>
      <ellipse cx="180" cy="100" rx="58" ry="28" fill="#1a0e04"/>
      <rect x="122" y="100" width="116" height="30" fill="#1a0e04"/>
      <ellipse cx="122" cy="120" rx="11" ry="32" fill="#1a0e04"/>
      <ellipse cx="238" cy="120" rx="11" ry="32" fill="#1a0e04"/>
      <rect x="22" y="250" width="316" height="3" rx="1" fill="#22c55e"/>
      <rect x="22" y="250" width="240" height="3" rx="1" fill="#22c55e"/>
      <circle cx="22" cy="251" r="5" fill="#22c55e"/>
      <circle cx="238" cy="251" r="5" fill="#22c55e"/>
      <text x="180" y="285" text-anchor="middle" fill="#15803d" font-family="Arial" font-size="13" font-weight="bold">✓ Liveness check passed</text>
      <text x="180" y="302" text-anchor="middle" fill="#6b7280" font-family="Arial" font-size="11">Real person detected · No spoofing</text>
      <rect x="22" y="320" width="316" height="100" rx="10" fill="#f1f5f9"/>
      <text x="38" y="344" fill="#6b7280" font-family="Arial" font-size="10" letter-spacing="0.5">VERIFICATION RESULT</text>
      <text x="38" y="366" fill="#0f172a" font-family="Arial" font-size="13" font-weight="bold">Alex Johnson</text>
      <text x="38" y="384" fill="#6b7280" font-family="Arial" font-size="11">DOB: 24 Mar 1992 · Male</text>
      <text x="38" y="402" fill="#6b7280" font-family="Arial" font-size="11">Nationality: American</text>
      <text x="270" y="366" fill="#15803d" font-family="Arial" font-size="11" font-weight="bold">MATCH</text>
      <text x="270" y="384" fill="#15803d" font-family="Arial" font-size="22">✓</text>
      <rect x="22" y="436" width="316" height="54" rx="10" fill="#0ea5e9"/>
      <text x="180" y="460" text-anchor="middle" fill="white" font-family="Arial" font-size="14" font-weight="bold">Verification Complete</text>
      <text x="180" y="478" text-anchor="middle" fill="rgba(255,255,255,0.8)" font-family="Arial" font-size="10">Ref: TS-2026-00912</text>
      <text x="180" y="530" text-anchor="middle" fill="#94a3b8" font-family="Arial" font-size="10">Powered by TrustSwiftly · Apr 5, 2026</text>
    </svg>`,

    // Proof of address document
    proofOfAddress: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 340">
      <rect width="480" height="340" rx="4" fill="#fffef8"/>
      <rect x="1" y="1" width="478" height="338" rx="3" fill="none" stroke="#d4c89a" stroke-width="1.5"/>
      <rect width="480" height="70" rx="0" fill="#1a3a5c"/>
      <rect width="480" height="70" rx="4" fill="#1a3a5c"/>
      <rect y="40" width="480" height="30" fill="#1a3a5c"/>
      <text x="240" y="28" text-anchor="middle" fill="white" font-family="Arial" font-size="16" font-weight="bold">UTILITY CORPORATION OF AMERICA</text>
      <text x="240" y="50" text-anchor="middle" fill="#90b8d8" font-family="Arial" font-size="10">Account Statement · Electric Service</text>
      <text x="28" y="106" fill="#555" font-family="Arial" font-size="10" font-weight="bold">BILLING ADDRESS</text>
      <text x="28" y="124" fill="#1a1a1a" font-family="Arial" font-size="13" font-weight="bold">Alex Johnson</text>
      <text x="28" y="141" fill="#333" font-family="Arial" font-size="12">42 Maple Street</text>
      <text x="28" y="157" fill="#333" font-family="Arial" font-size="12">Austin, TX 78701</text>
      <text x="28" y="173" fill="#333" font-family="Arial" font-size="12">United States</text>
      <text x="290" y="106" fill="#555" font-family="Arial" font-size="10" font-weight="bold">ACCOUNT DETAILS</text>
      <text x="290" y="124" fill="#555" font-family="Arial" font-size="10">Account Number</text>
      <text x="290" y="140" fill="#1a1a1a" font-family="Arial" font-size="12" font-weight="bold">UCA-TX-2024-88431</text>
      <text x="290" y="160" fill="#555" font-family="Arial" font-size="10">Statement Date</text>
      <text x="290" y="176" fill="#1a1a1a" font-family="Arial" font-size="12" font-weight="bold">01 April 2026</text>
      <rect x="20" y="196" width="440" height="1" fill="#ddd"/>
      <text x="28" y="218" fill="#555" font-family="Arial" font-size="10" font-weight="bold">SERVICE PERIOD</text>
      <text x="28" y="235" fill="#333" font-family="Arial" font-size="12">01 Mar 2026 – 31 Mar 2026</text>
      <text x="28" y="255" fill="#555" font-family="Arial" font-size="10" font-weight="bold">SERVICE ADDRESS</text>
      <text x="28" y="272" fill="#333" font-family="Arial" font-size="12">42 Maple Street, Austin, TX 78701</text>
      <text x="290" y="218" fill="#555" font-family="Arial" font-size="10" font-weight="bold">AMOUNT DUE</text>
      <text x="290" y="242" fill="#1a3a5c" font-family="Arial" font-size="28" font-weight="bold">$94.72</text>
      <text x="290" y="262" fill="#555" font-family="Arial" font-size="10">Due by 15 April 2026</text>
      <rect x="20" y="290" width="440" height="1" fill="#ddd"/>
      <text x="240" y="316" text-anchor="middle" fill="#aaa" font-family="Arial" font-size="9">This document can be used as proof of address. For queries call 1-800-UCA-HELP.</text>
    </svg>`
  },

  // ── Documents submitted by current user ───────────────────
  currentUserDocuments: [
    {
      id: 'doc_001',
      type: 'govId',
      label: 'Government Issued ID',
      description: 'US National ID Card',
      uploadedDate: '2026-04-05T09:10:00',
      svgKey: 'govId',
      status: 'submitted'
    },
    {
      id: 'doc_002',
      type: 'selfie',
      label: 'TrustSwiftly Liveness Check',
      description: 'Automated liveness & ID verification via TrustSwiftly',
      uploadedDate: '2026-04-05T09:12:00',
      svgKey: 'trustSwiftly',
      status: 'submitted',
      trustSwiftlyRef: 'TS-2026-00912'
    },
    {
      id: 'doc_003',
      type: 'proofOfAddress',
      label: 'Proof of Address',
      description: 'Utility bill (optional)',
      uploadedDate: '2026-04-05T09:14:00',
      svgKey: 'proofOfAddress',
      status: 'submitted'
    }
  ]
};
