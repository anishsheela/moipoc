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
      dob:         { value: '1992-03-24',                              verified: true,  verifiedDate: '2024-11-15' },
      gender:      { value: 'Male',                                    verified: false, verifiedDate: null },
      photo:       { value: null,                                      verified: false, verifiedDate: null },
      email:       { value: 'alex.johnson@example.com',                verified: true,  verifiedDate: '2024-11-15' },
      phone:       { value: '+1 (512) 555-0147',                       verified: true,  verifiedDate: '2024-11-15' },
      address:     { value: '42 Maple Street, Austin, TX 78701',       verified: false, verifiedDate: null },
      city:        { value: 'Austin',                                  verified: false, verifiedDate: null },
      state:       { value: 'Texas',                                   verified: false, verifiedDate: null },
      country:     { value: 'United States',                           verified: true,  verifiedDate: '2024-11-15' },
      postalCode:  { value: '78701',                                   verified: false, verifiedDate: null },
      occupation:  { value: 'Software Engineer',                       verified: false, verifiedDate: null },
      bio:         { value: 'Coffee enthusiast, amateur photographer, and hiking lover.', verified: false, verifiedDate: null }
    },

    verificationStatus: 'none', // none | pending | approved

    // Notarial certificates issued by attestation officers after successful sessions
    notarialCertificates: [
      {
        id: 'NOTCERT-2026-00291',
        issuedDate: '2026-02-14',
        officerName: 'Divya Nair',
        officerCertId: 'OSMIO-OFF-2025-00334',
        officerJurisdiction: 'Notary Public, State of Texas, USA',
        notaryCommissionNo: 'TX-2024-NP-00891',
        sessionRef: 'ATT-2026-00291',
        fieldsAttested: ['First Name', 'Last Name', 'Date of Birth'],
        status: 'valid',
        issuedTo: 'Alex Johnson',
        issuedToCertId: 'OSMIO-FND-2024-00847',
        expiresDate: '2028-02-14',
        notes: 'Identity verified by live video session. Government-issued photo ID (US Passport) presented and cross-checked.'
      }
    ],

    accessLog: [
      { app: 'Trusted & True',  date: '2026-04-07T10:23:00', fields: ['First Name', 'Last Name', 'Age 18+'],                      certType: 'numberplate',  granted: true  },
      { app: 'BetMax',          date: '2026-04-06T18:40:00', fields: ['First Name', 'Last Name', 'Age 18+', 'Country'],            certType: 'numberplate',  granted: true  },
      { app: 'Nextcloud',       date: '2026-04-05T09:15:00', fields: ['First Name', 'Last Name', 'Age 13+', 'Email'],              certType: 'numberplate',  granted: true  },
      { app: 'Alkoshop',        date: '2026-04-04T14:30:00', fields: ['First Name', 'Last Name', 'Age 21+', 'Country'],            certType: 'numberplate',  granted: true  },
      { app: 'MOI Dashboard',   date: '2026-04-06T15:45:00', fields: null,                                                         certType: 'foundation',   granted: true  },
      { app: 'Trusted & True',  date: '2026-04-03T11:12:00', fields: ['First Name', 'Last Name', 'Age 18+', 'Photo'],              certType: 'numberplate',  granted: true  },
      { app: 'MOI Dashboard',   date: '2026-03-28T09:30:00', fields: null,                                                         certType: 'foundation',   granted: true  },
      { app: 'Trusted & True',  date: '2026-03-15T14:22:00', fields: ['First Name', 'Last Name', 'Age 18+'],                       certType: 'numberplate',  granted: true  },
      { app: 'Trusted & True',  date: '2026-02-20T08:05:00', fields: ['First Name', 'Last Name', 'Date of Birth'],                 certType: 'numberplate',  granted: false },
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
      idqa: 8,  initials: 'AO', avatarColor: '#854d0e',
      enrolledDate: '2025-04-01', verificationStatus: 'pending',
      certId: 'OSMIO-FND-2025-04002'
    },
    { id:'usr_011', name:'Thomas Mbeki',  email:'t.mbeki@example.com',  idqa:8, initials:'TM', avatarColor:'#065f46', enrolledDate:'2025-03-20', verificationStatus:'pending', certId:'OSMIO-FND-2025-04102' },
    { id:'usr_012', name:'Ingrid Larsson',email:'i.larsson@example.com', idqa:8, initials:'IL', avatarColor:'#0077a8', enrolledDate:'2025-02-28', verificationStatus:'pending', certId:'OSMIO-FND-2025-04088' },
    { id:'usr_013', name:'Carlos Mendez', email:'c.mendez@example.com',  idqa:8, initials:'CM', avatarColor:'#7c3aed', enrolledDate:'2025-04-01', verificationStatus:'pending', certId:'OSMIO-FND-2025-04210' },
    { id:'usr_014', name:'Nadia Popescu', email:'n.popescu@example.com', idqa:8, initials:'NP', avatarColor:'#854d0e', enrolledDate:'2025-03-15', verificationStatus:'pending', certId:'OSMIO-FND-2025-04315' },
    { id:'usr_015', name:'Wei Zhang',     email:'w.zhang@example.com',   idqa:8, initials:'WZ', avatarColor:'#1e40af', enrolledDate:'2025-04-10', verificationStatus:'pending', certId:'OSMIO-FND-2025-04501' },
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
      adminNote: 'Identity confirmed. Liveliness check and document clear.',
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
    role: 'Attestation Officer',
    certId: 'OSMIO-ADM-2024-00012'
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
      <text x="180" y="530" text-anchor="middle" fill="#94a3b8" font-family="Arial" font-size="10">Liveliness check · Apr 5, 2026</text>
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

  // ── Additional users (for scheduling demo) ────────────────
  // (appended to MOCK.users at bottom of file via push)

  // ── Attestation Officers ───────────────────────────────────
  attestationOfficers: [
    { id: 'off_001', name: 'Divya Rajan',       email: 'd.rajan@osmio.id',      initials: 'DR', avatarColor: '#7c3aed', certId: 'OSMIO-OFF-2024-00101', specialty: 'General',    joinedDate: '2023-06-15' },
    { id: 'off_002', name: 'Connor Walsh',       email: 'c.walsh@osmio.id',      initials: 'CW', avatarColor: '#0077a8', certId: 'OSMIO-OFF-2024-00102', specialty: 'General',    joinedDate: '2023-08-01' },
    { id: 'off_003', name: 'Fatima Al-Rashid',   email: 'f.alrashid@osmio.id',   initials: 'FA', avatarColor: '#b45309', certId: 'OSMIO-OFF-2024-00103', specialty: 'Specialist', joinedDate: '2022-11-20' },
    { id: 'off_004', name: 'Marcus Webb',         email: 'm.webb@osmio.id',       initials: 'MW', avatarColor: '#065f46', certId: 'OSMIO-OFF-2024-00104', specialty: 'General',    joinedDate: '2023-03-10' },
    { id: 'off_005', name: 'Leila Nasser',        email: 'l.nasser@osmio.id',     initials: 'LN', avatarColor: '#9d174d', certId: 'OSMIO-OFF-2024-00105', specialty: 'Specialist', joinedDate: '2024-01-08' },
  ],

  // ── Supervisors ────────────────────────────────────────────
  supervisors: [
    { id: 'sup_001', name: 'Juanita Little-Lyons', email: 'j.littlelyons@osmio.id', initials: 'JL', avatarColor: '#aa1945', certId: 'OSMIO-SUP-2024-00001', role: 'Head Supervisor'   },
    { id: 'sup_002', name: 'Sophia Bertrand',       email: 's.bertrand@osmio.id',   initials: 'SB', avatarColor: '#1e40af', certId: 'OSMIO-SUP-2024-00002', role: 'Deputy Supervisor' },
  ],

  // ── Officer availability (blocked slots & days off) ────────
  // blockedSlots: ISO datetime strings (local, no tz) for blocked 30-min windows
  officerAvailability: {
    'off_001': {
      blockedSlots: ['2026-04-28T13:00','2026-04-28T13:30','2026-04-28T14:00','2026-04-28T14:30','2026-04-28T15:00','2026-04-28T15:30','2026-04-28T16:00','2026-04-28T16:30','2026-05-06T13:00','2026-05-06T13:30','2026-05-06T14:00','2026-05-06T14:30','2026-05-06T15:00'],
      daysOff: []
    },
    'off_002': {
      blockedSlots: ['2026-04-29T09:00','2026-04-29T09:30','2026-04-29T10:00','2026-04-29T10:30','2026-04-29T11:00','2026-04-29T11:30'],
      daysOff: ['2026-05-05']
    },
    'off_003': {
      blockedSlots: ['2026-04-30T09:00','2026-04-30T09:30','2026-04-30T10:00','2026-04-30T10:30','2026-04-30T11:00','2026-04-30T11:30','2026-04-30T12:00','2026-05-05T09:00','2026-05-05T09:30','2026-05-05T10:00','2026-05-05T10:30'],
      daysOff: []
    },
    'off_004': {
      blockedSlots: ['2026-04-28T09:00','2026-04-28T09:30','2026-04-28T10:00','2026-04-28T10:30','2026-04-28T11:00','2026-04-28T11:30','2026-05-07T13:00','2026-05-07T13:30','2026-05-07T14:00','2026-05-07T14:30','2026-05-07T15:00'],
      daysOff: []
    },
    'off_005': {
      blockedSlots: ['2026-05-06T09:00','2026-05-06T09:30','2026-05-06T10:00','2026-05-06T10:30','2026-05-06T11:00','2026-05-06T11:30'],
      daysOff: ['2026-05-04']
    }
  },

  // ── Attestation scheduling requests ───────────────────────
  // status: docs-uploaded | slot-chosen | officer-assigned | completed
  attestationRequests: [
    { id:'attreq_001', userId:'usr_001', userName:'Alex Johnson',    userEmail:'alex.johnson@example.com', userInitials:'AJ', userAvatarColor:'#aa1945', certId:'OSMIO-FND-2024-00847', submittedDate:'2026-04-24T09:00:00', status:'officer-assigned', slotDate:'2026-04-28', slotTime:'10:00', assignedOfficerId:'off_001', assignedOfficerName:'Divya Rajan',     assignedAt:'2026-04-24T14:30:00', meetingLink:'https://meet.osmio.id/att-001', docTypes:['Government ID','Liveness Check','Proof of Address'], refId:'ATT-2026-01024' },
    { id:'attreq_002', userId:'usr_002', userName:'Sarah Chen',      userEmail:'s.chen@example.com',       userInitials:'SC', userAvatarColor:'#0077a8', certId:'OSMIO-FND-2025-01203', submittedDate:'2026-04-23T10:30:00', status:'officer-assigned', slotDate:'2026-04-29', slotTime:'14:00', assignedOfficerId:'off_002', assignedOfficerName:'Connor Walsh',    assignedAt:'2026-04-24T11:00:00', meetingLink:'https://meet.osmio.id/att-002', docTypes:['Government ID','Liveness Check'], refId:'ATT-2026-01019' },
    { id:'attreq_003', userId:'usr_005', userName:'David Park',      userEmail:'d.park@example.com',       userInitials:'DP', userAvatarColor:'#b45309', certId:'OSMIO-FND-2025-02841', submittedDate:'2026-04-23T14:00:00', status:'officer-assigned', slotDate:'2026-04-30', slotTime:'09:30', assignedOfficerId:'off_005', assignedOfficerName:'Leila Nasser',    assignedAt:'2026-04-24T15:00:00', meetingLink:'https://meet.osmio.id/att-003', docTypes:['Government ID','Liveness Check','Proof of Address'], refId:'ATT-2026-01021' },
    { id:'attreq_004', userId:'usr_006', userName:'Priya Sharma',    userEmail:'p.sharma@example.com',     userInitials:'PS', userAvatarColor:'#9d174d', certId:'OSMIO-FND-2025-03155', submittedDate:'2026-04-22T11:00:00', status:'officer-assigned', slotDate:'2026-05-05', slotTime:'11:00', assignedOfficerId:'off_004', assignedOfficerName:'Marcus Webb',     assignedAt:'2026-04-23T09:00:00', meetingLink:'https://meet.osmio.id/att-004', docTypes:['Government ID','Liveness Check'], refId:'ATT-2026-01015' },
    { id:'attreq_005', userId:'usr_015', userName:'Wei Zhang',       userEmail:'w.zhang@example.com',      userInitials:'WZ', userAvatarColor:'#1e40af', certId:'OSMIO-FND-2025-04501', submittedDate:'2026-04-24T08:00:00', status:'officer-assigned', slotDate:'2026-05-05', slotTime:'14:30', assignedOfficerId:'off_003', assignedOfficerName:'Fatima Al-Rashid', assignedAt:'2026-04-24T16:00:00', meetingLink:'https://meet.osmio.id/att-005', docTypes:['Government ID','Liveness Check','Proof of Address'], refId:'ATT-2026-01026' },
    { id:'attreq_006', userId:'usr_011', userName:'Thomas Mbeki',    userEmail:'t.mbeki@example.com',      userInitials:'TM', userAvatarColor:'#065f46', certId:'OSMIO-FND-2025-04102', submittedDate:'2026-04-23T16:00:00', status:'officer-assigned', slotDate:'2026-05-06', slotTime:'10:00', assignedOfficerId:'off_001', assignedOfficerName:'Divya Rajan',     assignedAt:'2026-04-24T10:00:00', meetingLink:'https://meet.osmio.id/att-006', docTypes:['Government ID','Liveness Check'], refId:'ATT-2026-01020' },
    { id:'attreq_007', userId:'usr_013', userName:'Carlos Mendez',   userEmail:'c.mendez@example.com',     userInitials:'CM', userAvatarColor:'#7c3aed', certId:'OSMIO-FND-2025-04210', submittedDate:'2026-04-24T07:30:00', status:'slot-chosen',      slotDate:'2026-05-07', slotTime:'09:30', assignedOfficerId:null, assignedOfficerName:null, docTypes:['Government ID','Liveness Check','Proof of Address'], refId:'ATT-2026-01027' },
    { id:'attreq_008', userId:'usr_014', userName:'Nadia Popescu',   userEmail:'n.popescu@example.com',    userInitials:'NP', userAvatarColor:'#854d0e', certId:'OSMIO-FND-2025-04315', submittedDate:'2026-04-23T13:00:00', status:'slot-chosen',      slotDate:'2026-05-07', slotTime:'14:00', assignedOfficerId:null, assignedOfficerName:null, docTypes:['Government ID','Liveness Check'], refId:'ATT-2026-01022' },
    { id:'attreq_009', userId:'usr_012', userName:'Ingrid Larsson',  userEmail:'i.larsson@example.com',    userInitials:'IL', userAvatarColor:'#0077a8', certId:'OSMIO-FND-2025-04088', submittedDate:'2026-04-22T09:00:00', status:'slot-chosen',      slotDate:'2026-05-08', slotTime:'10:30', assignedOfficerId:null, assignedOfficerName:null, docTypes:['Government ID','Liveness Check','Proof of Address'], refId:'ATT-2026-01014' },
    { id:'attreq_010', userId:'usr_010', userName:'Amara Osei',      userEmail:'a.osei@example.com',       userInitials:'AO', userAvatarColor:'#854d0e', certId:'OSMIO-FND-2025-04002', submittedDate:'2026-04-24T11:00:00', status:'slot-chosen',      slotDate:'2026-05-11', slotTime:'09:00', assignedOfficerId:null, assignedOfficerName:null, docTypes:['Government ID','Liveness Check'], refId:'ATT-2026-01025' },
    { id:'attreq_011', userId:'usr_009', userName:'Robert Garcia',   userEmail:'r.garcia@example.com',     userInitials:'RG', userAvatarColor:'#7c3aed', certId:'OSMIO-FND-2025-01654', submittedDate:'2026-04-23T15:00:00', status:'slot-chosen',      slotDate:'2026-05-11', slotTime:'11:00', assignedOfficerId:null, assignedOfficerName:null, docTypes:['Government ID','Liveness Check','Proof of Address'], refId:'ATT-2026-01018' },
    { id:'attreq_012', userId:'usr_003', userName:'Marcus Rivera',   userEmail:'m.rivera@example.com',     userInitials:'MR', userAvatarColor:'#6b21a8', certId:'OSMIO-FND-2025-02490', submittedDate:'2026-04-23T08:30:00', status:'docs-uploaded',    slotDate:null, slotTime:null, assignedOfficerId:null, assignedOfficerName:null, docTypes:['Government ID','Liveness Check'], refId:'ATT-2026-01017' },
    { id:'attreq_013', userId:'usr_004', userName:'Emma Williams',   userEmail:'e.williams@example.com',   userInitials:'EW', userAvatarColor:'#065f46', certId:'OSMIO-FND-2024-01150', submittedDate:'2026-04-24T10:00:00', status:'docs-uploaded',    slotDate:null, slotTime:null, assignedOfficerId:null, assignedOfficerName:null, docTypes:['Government ID','Liveness Check','Proof of Address'], refId:'ATT-2026-01023' },
    { id:'attreq_014', userId:'usr_007', userName:"James O'Brien",   userEmail:'j.obrien@example.com',     userInitials:'JO', userAvatarColor:'#1e40af', certId:'OSMIO-FND-2025-02103', submittedDate:'2026-04-20T10:00:00', status:'completed',        slotDate:'2026-04-22', slotTime:'10:00', assignedOfficerId:'off_001', assignedOfficerName:'Divya Rajan',     completedAt:'2026-04-22T10:35:00', meetingLink:'https://meet.osmio.id/att-014', docTypes:['Government ID','Liveness Check'], refId:'ATT-2026-01001' },
    { id:'attreq_015', userId:'usr_008', userName:'Yuki Tanaka',     userEmail:'y.tanaka@example.com',     userInitials:'YT', userAvatarColor:'#065f46', certId:'OSMIO-FND-2024-01899', submittedDate:'2026-04-21T09:00:00', status:'completed',        slotDate:'2026-04-23', slotTime:'14:00', assignedOfficerId:'off_003', assignedOfficerName:'Fatima Al-Rashid', completedAt:'2026-04-23T14:42:00', meetingLink:'https://meet.osmio.id/att-015', docTypes:['Government ID','Liveness Check','Proof of Address'], refId:'ATT-2026-01008' },
  ],

  // ── Email client personas ──────────────────────────────────
  emailPersonas: [
    { id:'alex',    name:'Alex Johnson',          email:'alex.johnson@example.com', initials:'AJ', avatarColor:'#aa1945', role:'MOI User'          },
    { id:'juanita', name:'Juanita Little-Lyons',  email:'j.littlelyons@osmio.id',   initials:'JL', avatarColor:'#aa1945', role:'Head Supervisor'   },
    { id:'divya',   name:'Divya Rajan',            email:'d.rajan@osmio.id',         initials:'DR', avatarColor:'#7c3aed', role:'Attestation Officer'},
    { id:'connor',  name:'Connor Walsh',           email:'c.walsh@osmio.id',         initials:'CW', avatarColor:'#0077a8', role:'Attestation Officer'},
    { id:'marcus',  name:'Marcus Webb',            email:'m.webb@osmio.id',          initials:'MW', avatarColor:'#065f46', role:'Attestation Officer'},
  ],

  // ── Emails per inbox ───────────────────────────────────────
  emails: {
    'alex.johnson@example.com': [
      {
        id:'email_u003', from:'no-reply@osmio.id', fromName:'OSMIO Attestation', to:'alex.johnson@example.com',
        subject:'Reminder: Your attestation session is tomorrow — 10:00 AM',
        date:'2026-04-27T09:00:00', read:false, tag:'reminder',
        body:`<div style="font-family:Inter,Arial,sans-serif;max-width:580px;margin:0 auto">
<div style="background:#12121e;padding:20px 28px;border-radius:10px 10px 0 0;display:flex;align-items:center;gap:10px">
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00b4d8" stroke-width="2.5" stroke-linecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
  <span style="color:#fff;font-size:16px;font-weight:800">OSMIO</span>
  <span style="color:#6a8a99;font-size:12px;margin-left:4px">Attestation Service</span>
</div>
<div style="padding:28px;background:#fff;border:1px solid #e2e6ef;border-top:none">
  <h2 style="color:#111827;font-size:20px;margin:0 0 8px">Session reminder</h2>
  <p style="color:#374151;font-size:14px;line-height:1.6;margin:0 0 20px">Hi Alex, this is a friendly reminder that your identity attestation session is scheduled for <strong>tomorrow</strong>.</p>
  <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:20px;margin:0 0 20px">
    <div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#16a34a;margin-bottom:12px">Session Details</div>
    <table style="width:100%;border-collapse:collapse;font-size:14px">
      <tr><td style="color:#6b7280;padding:4px 0;width:140px">Date &amp; Time</td><td style="color:#111827;font-weight:600">Monday, 28 April 2026 · 10:00 AM</td></tr>
      <tr><td style="color:#6b7280;padding:4px 0">Officer</td><td style="color:#111827;font-weight:600">Divya Rajan</td></tr>
      <tr><td style="color:#6b7280;padding:4px 0">Duration</td><td style="color:#111827;font-weight:600">30 minutes</td></tr>
      <tr><td style="color:#6b7280;padding:4px 0">Meeting Link</td><td><a href="#" style="color:#0077a8;font-weight:600">meet.osmio.id/att-001</a></td></tr>
      <tr><td style="color:#6b7280;padding:4px 0">Reference</td><td style="color:#111827;font-family:monospace;font-size:13px">ATT-2026-01024</td></tr>
    </table>
  </div>
  <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:16px;margin:0 0 20px">
    <div style="font-size:13px;font-weight:700;color:#92400e;margin-bottom:8px">Checklist for tomorrow</div>
    <ul style="margin:0;padding-left:20px;color:#374151;font-size:13px;line-height:2">
      <li>Have your original Government-issued ID ready to show on camera</li>
      <li>Ensure good lighting — face clearly visible</li>
      <li>Use a quiet, private environment</li>
      <li>Test your camera and microphone before the call</li>
      <li>Join 2 minutes before your scheduled time</li>
    </ul>
  </div>
  <div style="text-align:center;margin:24px 0">
    <a href="#" style="background:#00b4d8;color:#fff;padding:12px 28px;border-radius:8px;font-weight:700;font-size:14px;text-decoration:none;display:inline-block">Join Session Tomorrow</a>
  </div>
</div>
<div style="background:#f0f2f7;padding:14px 28px;border-radius:0 0 10px 10px;text-align:center">
  <p style="color:#9ca3af;font-size:11px;margin:0">OSMIO Identity Authority · Secure Attestation Service · osmio.id</p>
</div>
</div>`
      },
      {
        id:'email_u002', from:'no-reply@osmio.id', fromName:'OSMIO Attestation', to:'alex.johnson@example.com',
        subject:'Session Confirmed — Divya Rajan · Mon 28 Apr, 10:00 AM',
        date:'2026-04-24T14:35:00', read:true, tag:'officer-assigned',
        body:`<div style="font-family:Inter,Arial,sans-serif;max-width:580px;margin:0 auto">
<div style="background:#12121e;padding:20px 28px;border-radius:10px 10px 0 0;display:flex;align-items:center;gap:10px">
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00b4d8" stroke-width="2.5" stroke-linecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
  <span style="color:#fff;font-size:16px;font-weight:800">OSMIO</span>
  <span style="color:#6a8a99;font-size:12px;margin-left:4px">Attestation Service</span>
</div>
<div style="padding:28px;background:#fff;border:1px solid #e2e6ef;border-top:none">
  <div style="display:inline-block;background:#dcfce7;color:#16a34a;font-size:12px;font-weight:700;padding:4px 12px;border-radius:20px;margin-bottom:16px">✓ Session Confirmed</div>
  <h2 style="color:#111827;font-size:20px;margin:0 0 8px">Your attestation officer has been assigned</h2>
  <p style="color:#374151;font-size:14px;line-height:1.6;margin:0 0 20px">Hi Alex, great news — a supervisor has reviewed your request and assigned you an attestation officer. Your session details are below.</p>
  <div style="background:#f8f9fc;border:1px solid #e2e6ef;border-radius:8px;padding:20px;margin:0 0 20px">
    <div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#6b7280;margin-bottom:12px">Confirmed Session</div>
    <table style="width:100%;border-collapse:collapse;font-size:14px">
      <tr><td style="color:#6b7280;padding:5px 0;width:140px">Attestation Officer</td><td style="color:#111827;font-weight:700">Divya Rajan</td></tr>
      <tr><td style="color:#6b7280;padding:5px 0">Date &amp; Time</td><td style="color:#111827;font-weight:600">Monday, 28 April 2026 · 10:00 AM</td></tr>
      <tr><td style="color:#6b7280;padding:5px 0">Duration</td><td style="color:#111827;font-weight:600">30 minutes (video call)</td></tr>
      <tr><td style="color:#6b7280;padding:5px 0">Meeting Link</td><td><a href="#" style="color:#0077a8;font-weight:600;font-size:13px">meet.osmio.id/att-001</a></td></tr>
      <tr><td style="color:#6b7280;padding:5px 0">Reference</td><td style="color:#111827;font-family:monospace;font-size:13px">ATT-2026-01024</td></tr>
    </table>
  </div>
  <p style="color:#374151;font-size:13.5px;line-height:1.6">Please join the video call at the scheduled time with your original ID document visible and ready. Ensure you are in a well-lit, quiet space.</p>
  <div style="text-align:center;margin:24px 0;display:flex;gap:12px;justify-content:center">
    <a href="#" style="background:#00b4d8;color:#fff;padding:11px 24px;border-radius:8px;font-weight:700;font-size:13px;text-decoration:none;display:inline-block">Join Video Call</a>
    <a href="#" style="background:#f0f2f7;color:#374151;padding:11px 24px;border-radius:8px;font-weight:700;font-size:13px;text-decoration:none;display:inline-block;border:1px solid #e2e6ef">Add to Calendar</a>
  </div>
</div>
<div style="background:#f0f2f7;padding:14px 28px;border-radius:0 0 10px 10px;text-align:center">
  <p style="color:#9ca3af;font-size:11px;margin:0">OSMIO Identity Authority · osmio.id</p>
</div>
</div>`
      },
      {
        id:'email_u001', from:'no-reply@osmio.id', fromName:'OSMIO Attestation', to:'alex.johnson@example.com',
        subject:'Attestation Request Received · ATT-2026-01024',
        date:'2026-04-24T09:05:00', read:true, tag:'attestation-submitted',
        body:`<div style="font-family:Inter,Arial,sans-serif;max-width:580px;margin:0 auto">
<div style="background:#12121e;padding:20px 28px;border-radius:10px 10px 0 0;display:flex;align-items:center;gap:10px">
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00b4d8" stroke-width="2.5" stroke-linecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
  <span style="color:#fff;font-size:16px;font-weight:800">OSMIO</span>
  <span style="color:#6a8a99;font-size:12px;margin-left:4px">Attestation Service</span>
</div>
<div style="padding:28px;background:#fff;border:1px solid #e2e6ef;border-top:none">
  <h2 style="color:#111827;font-size:20px;margin:0 0 8px">We've received your attestation request</h2>
  <p style="color:#374151;font-size:14px;line-height:1.6;margin:0 0 20px">Hi Alex, your identity attestation request has been successfully submitted. A supervisor will review your documents and assign an officer to your chosen time slot. You'll receive a confirmation email once an officer is assigned.</p>
  <div style="background:#f8f9fc;border:1px solid #e2e6ef;border-radius:8px;padding:20px;margin:0 0 20px">
    <div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#6b7280;margin-bottom:12px">Your Request Summary</div>
    <table style="width:100%;border-collapse:collapse;font-size:14px">
      <tr><td style="color:#6b7280;padding:5px 0;width:160px">Reference ID</td><td style="color:#111827;font-family:monospace;font-weight:700;font-size:13px">ATT-2026-01024</td></tr>
      <tr><td style="color:#6b7280;padding:5px 0">Submitted</td><td style="color:#111827;font-weight:600">24 April 2026, 9:00 AM</td></tr>
      <tr><td style="color:#6b7280;padding:5px 0">Chosen Slot</td><td style="color:#111827;font-weight:600">Monday, 28 April 2026 · 10:00 AM</td></tr>
      <tr><td style="color:#6b7280;padding:5px 0">Documents</td><td style="color:#111827;font-weight:600">Government ID · Liveness Check · Proof of Address</td></tr>
      <tr><td style="color:#6b7280;padding:5px 0">Status</td><td><span style="background:#dbeafe;color:#1d4ed8;font-size:12px;font-weight:700;padding:2px 10px;border-radius:20px">Awaiting officer assignment</span></td></tr>
    </table>
  </div>
  <p style="color:#6b7280;font-size:13px;line-height:1.6">If you need to reschedule, please contact support referencing <strong style="color:#374151">ATT-2026-01024</strong>. Officer assignment typically happens within 1 business day.</p>
</div>
<div style="background:#f0f2f7;padding:14px 28px;border-radius:0 0 10px 10px;text-align:center">
  <p style="color:#9ca3af;font-size:11px;margin:0">OSMIO Identity Authority · osmio.id</p>
</div>
</div>`
      }
    ],

    'j.littlelyons@osmio.id': [
      {
        id:'email_s004', from:'no-reply@osmio.id', fromName:'OSMIO System', to:'j.littlelyons@osmio.id',
        subject:'Action Required: 5 attestation requests awaiting officer assignment',
        date:'2026-04-24T08:00:00', read:false, tag:'reminder',
        body:`<div style="font-family:Inter,Arial,sans-serif;max-width:580px;margin:0 auto">
<div style="background:#12121e;padding:20px 28px;border-radius:10px 10px 0 0;display:flex;align-items:center;gap:10px">
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00b4d8" stroke-width="2.5" stroke-linecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
  <span style="color:#fff;font-size:16px;font-weight:800">OSMIO</span>
  <span style="color:#6a8a99;font-size:12px;margin-left:4px">Supervisor Portal</span>
</div>
<div style="padding:28px;background:#fff;border:1px solid #e2e6ef;border-top:none">
  <div style="display:inline-block;background:#fee2e2;color:#dc2626;font-size:12px;font-weight:700;padding:4px 12px;border-radius:20px;margin-bottom:16px">Action Required</div>
  <h2 style="color:#111827;font-size:20px;margin:0 0 8px">Pending officer assignments</h2>
  <p style="color:#374151;font-size:14px;line-height:1.6;margin:0 0 20px">Hi Juanita, there are currently <strong>5 attestation requests</strong> with chosen time slots that are waiting for an officer to be assigned.</p>
  <div style="background:#f8f9fc;border:1px solid #e2e6ef;border-radius:8px;overflow:hidden;margin:0 0 20px">
    <div style="padding:12px 16px;background:#f0f2f7;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#6b7280">Requests Awaiting Assignment</div>
    <table style="width:100%;border-collapse:collapse;font-size:13px">
      <tr style="border-bottom:1px solid #e2e6ef"><td style="padding:10px 16px;font-weight:600;color:#111827">Carlos Mendez</td><td style="padding:10px 16px;color:#6b7280">Thu 7 May · 9:30 AM</td><td style="padding:10px 16px;color:#6b7280">ATT-2026-01027</td></tr>
      <tr style="border-bottom:1px solid #e2e6ef"><td style="padding:10px 16px;font-weight:600;color:#111827">Nadia Popescu</td><td style="padding:10px 16px;color:#6b7280">Thu 7 May · 2:00 PM</td><td style="padding:10px 16px;color:#6b7280">ATT-2026-01022</td></tr>
      <tr style="border-bottom:1px solid #e2e6ef"><td style="padding:10px 16px;font-weight:600;color:#111827">Ingrid Larsson</td><td style="padding:10px 16px;color:#6b7280">Fri 8 May · 10:30 AM</td><td style="padding:10px 16px;color:#6b7280">ATT-2026-01014</td></tr>
      <tr style="border-bottom:1px solid #e2e6ef"><td style="padding:10px 16px;font-weight:600;color:#111827">Amara Osei</td><td style="padding:10px 16px;color:#6b7280">Mon 11 May · 9:00 AM</td><td style="padding:10px 16px;color:#6b7280">ATT-2026-01025</td></tr>
      <tr><td style="padding:10px 16px;font-weight:600;color:#111827">Robert Garcia</td><td style="padding:10px 16px;color:#6b7280">Mon 11 May · 11:00 AM</td><td style="padding:10px 16px;color:#6b7280">ATT-2026-01018</td></tr>
    </table>
  </div>
  <div style="text-align:center;margin:24px 0">
    <a href="admin.html#sup-dashboard" style="background:#aa1945;color:#fff;padding:12px 28px;border-radius:8px;font-weight:700;font-size:14px;text-decoration:none;display:inline-block">Open Supervisor Dashboard</a>
  </div>
</div>
<div style="background:#f0f2f7;padding:14px 28px;border-radius:0 0 10px 10px;text-align:center">
  <p style="color:#9ca3af;font-size:11px;margin:0">OSMIO Identity Authority · osmio.id</p>
</div>
</div>`
      },
      {
        id:'email_s001', from:'no-reply@osmio.id', fromName:'OSMIO System', to:'j.littlelyons@osmio.id',
        subject:'New Attestation Request: Alex Johnson · Slot: Mon 28 Apr 10:00 AM',
        date:'2026-04-24T09:05:00', read:true, tag:'new-request',
        body:`<div style="font-family:Inter,Arial,sans-serif;max-width:580px;margin:0 auto">
<div style="background:#12121e;padding:20px 28px;border-radius:10px 10px 0 0;display:flex;align-items:center;gap:10px">
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00b4d8" stroke-width="2.5" stroke-linecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
  <span style="color:#fff;font-size:16px;font-weight:800">OSMIO</span>
  <span style="color:#6a8a99;font-size:12px;margin-left:4px">Supervisor Portal</span>
</div>
<div style="padding:28px;background:#fff;border:1px solid #e2e6ef;border-top:none">
  <div style="display:inline-block;background:#dbeafe;color:#1d4ed8;font-size:12px;font-weight:700;padding:4px 12px;border-radius:20px;margin-bottom:16px">New Request</div>
  <h2 style="color:#111827;font-size:20px;margin:0 0 8px">Alex Johnson has submitted an attestation request</h2>
  <p style="color:#374151;font-size:14px;line-height:1.6;margin:0 0 20px">Hi Juanita, a new attestation request has been submitted with a video call slot selected. Please assign an available officer at your earliest convenience.</p>
  <div style="background:#f8f9fc;border:1px solid #e2e6ef;border-radius:8px;padding:20px;margin:0 0 20px">
    <div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#6b7280;margin-bottom:12px">Request Details</div>
    <table style="width:100%;border-collapse:collapse;font-size:14px">
      <tr><td style="color:#6b7280;padding:5px 0;width:160px">User</td><td style="color:#111827;font-weight:700">Alex Johnson</td></tr>
      <tr><td style="color:#6b7280;padding:5px 0">Email</td><td style="color:#111827">alex.johnson@example.com</td></tr>
      <tr><td style="color:#6b7280;padding:5px 0">Osmio ID Pair</td><td style="color:#111827;font-family:monospace;font-size:12px">OSMIO-FND-2024-00847</td></tr>
      <tr><td style="color:#6b7280;padding:5px 0">Chosen Slot</td><td style="color:#111827;font-weight:600">Monday, 28 April 2026 · 10:00 AM</td></tr>
      <tr><td style="color:#6b7280;padding:5px 0">Documents</td><td style="color:#111827;font-size:13px">Government ID · Liveness Check · Proof of Address</td></tr>
      <tr><td style="color:#6b7280;padding:5px 0">Reference</td><td style="color:#111827;font-family:monospace;font-size:13px">ATT-2026-01024</td></tr>
    </table>
  </div>
  <div style="text-align:center;margin:24px 0">
    <a href="admin.html#sup-dashboard" style="background:#aa1945;color:#fff;padding:12px 28px;border-radius:8px;font-weight:700;font-size:14px;text-decoration:none;display:inline-block">Assign Officer →</a>
  </div>
</div>
<div style="background:#f0f2f7;padding:14px 28px;border-radius:0 0 10px 10px;text-align:center">
  <p style="color:#9ca3af;font-size:11px;margin:0">OSMIO Identity Authority · osmio.id</p>
</div>
</div>`
      },
      {
        id:'email_s002', from:'no-reply@osmio.id', fromName:'OSMIO System', to:'j.littlelyons@osmio.id',
        subject:'New Attestation Request: Sarah Chen · Slot: Tue 29 Apr 2:00 PM',
        date:'2026-04-23T10:35:00', read:true, tag:'new-request',
        body:`<div style="font-family:Inter,Arial,sans-serif;max-width:580px;margin:0 auto">
<div style="background:#12121e;padding:20px 28px;border-radius:10px 10px 0 0;display:flex;align-items:center;gap:10px">
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00b4d8" stroke-width="2.5" stroke-linecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
  <span style="color:#fff;font-size:16px;font-weight:800">OSMIO</span>
  <span style="color:#6a8a99;font-size:12px;margin-left:4px">Supervisor Portal</span>
</div>
<div style="padding:28px;background:#fff;border:1px solid #e2e6ef;border-top:none">
  <div style="display:inline-block;background:#dbeafe;color:#1d4ed8;font-size:12px;font-weight:700;padding:4px 12px;border-radius:20px;margin-bottom:16px">New Request</div>
  <h2 style="color:#111827;font-size:20px;margin:0 0 8px">Sarah Chen has submitted an attestation request</h2>
  <p style="color:#374151;font-size:14px;line-height:1.6;margin:0 0 20px">Hi Juanita, a new attestation request has been submitted with a video call slot selected. Please assign an available officer.</p>
  <div style="background:#f8f9fc;border:1px solid #e2e6ef;border-radius:8px;padding:20px;margin:0 0 20px">
    <table style="width:100%;border-collapse:collapse;font-size:14px">
      <tr><td style="color:#6b7280;padding:5px 0;width:160px">User</td><td style="color:#111827;font-weight:700">Sarah Chen</td></tr>
      <tr><td style="color:#6b7280;padding:5px 0">Email</td><td style="color:#111827">s.chen@example.com</td></tr>
      <tr><td style="color:#6b7280;padding:5px 0">Osmio ID Pair</td><td style="color:#111827;font-family:monospace;font-size:12px">OSMIO-FND-2025-01203</td></tr>
      <tr><td style="color:#6b7280;padding:5px 0">Chosen Slot</td><td style="color:#111827;font-weight:600">Tuesday, 29 April 2026 · 2:00 PM</td></tr>
      <tr><td style="color:#6b7280;padding:5px 0">Documents</td><td style="color:#111827;font-size:13px">Government ID · Liveness Check</td></tr>
      <tr><td style="color:#6b7280;padding:5px 0">Reference</td><td style="color:#111827;font-family:monospace;font-size:13px">ATT-2026-01019</td></tr>
    </table>
  </div>
  <div style="text-align:center;margin:24px 0">
    <a href="admin.html#sup-dashboard" style="background:#aa1945;color:#fff;padding:12px 28px;border-radius:8px;font-weight:700;font-size:14px;text-decoration:none;display:inline-block">Assign Officer →</a>
  </div>
</div>
<div style="background:#f0f2f7;padding:14px 28px;border-radius:0 0 10px 10px;text-align:center">
  <p style="color:#9ca3af;font-size:11px;margin:0">OSMIO Identity Authority · osmio.id</p>
</div>
</div>`
      }
    ],

    'd.rajan@osmio.id': [
      {
        id:'email_o004', from:'no-reply@osmio.id', fromName:'OSMIO Scheduling', to:'d.rajan@osmio.id',
        subject:"This week's schedule: 28 Apr – 2 May (2 sessions)",
        date:'2026-04-24T08:00:00', read:false, tag:'schedule',
        body:`<div style="font-family:Inter,Arial,sans-serif;max-width:580px;margin:0 auto">
<div style="background:#12121e;padding:20px 28px;border-radius:10px 10px 0 0;display:flex;align-items:center;gap:10px">
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00b4d8" stroke-width="2.5" stroke-linecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
  <span style="color:#fff;font-size:16px;font-weight:800">OSMIO</span>
  <span style="color:#6a8a99;font-size:12px;margin-left:4px">Officer Portal</span>
</div>
<div style="padding:28px;background:#fff;border:1px solid #e2e6ef;border-top:none">
  <h2 style="color:#111827;font-size:20px;margin:0 0 8px">Your schedule this week</h2>
  <p style="color:#374151;font-size:14px;line-height:1.6;margin:0 0 20px">Hi Divya, here is your upcoming attestation schedule for the week of <strong>28 April – 2 May 2026</strong>.</p>
  <div style="background:#f8f9fc;border:1px solid #e2e6ef;border-radius:8px;overflow:hidden;margin:0 0 20px">
    <div style="padding:12px 16px;background:#f0f2f7;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#6b7280">Confirmed Sessions</div>
    <table style="width:100%;border-collapse:collapse;font-size:13px">
      <tr style="border-bottom:1px solid #e2e6ef">
        <td style="padding:12px 16px">
          <div style="font-weight:700;color:#111827;margin-bottom:2px">Alex Johnson</div>
          <div style="color:#6b7280">Government ID · Liveness Check · Proof of Address</div>
        </td>
        <td style="padding:12px 16px;white-space:nowrap">
          <div style="font-weight:600;color:#111827">Mon 28 Apr</div>
          <div style="color:#6b7280">10:00 AM · 30 min</div>
        </td>
        <td style="padding:12px 16px"><a href="#" style="color:#0077a8;font-size:12px;font-weight:600">Join →</a></td>
      </tr>
      <tr>
        <td style="padding:12px 16px">
          <div style="font-weight:700;color:#111827;margin-bottom:2px">Thomas Mbeki</div>
          <div style="color:#6b7280">Government ID · Liveness Check</div>
        </td>
        <td style="padding:12px 16px;white-space:nowrap">
          <div style="font-weight:600;color:#111827">Wed 6 May</div>
          <div style="color:#6b7280">10:00 AM · 30 min</div>
        </td>
        <td style="padding:12px 16px"><a href="#" style="color:#0077a8;font-size:12px;font-weight:600">Join →</a></td>
      </tr>
    </table>
  </div>
</div>
<div style="background:#f0f2f7;padding:14px 28px;border-radius:0 0 10px 10px;text-align:center">
  <p style="color:#9ca3af;font-size:11px;margin:0">OSMIO Identity Authority · osmio.id</p>
</div>
</div>`
      },
      {
        id:'email_o001', from:'no-reply@osmio.id', fromName:'OSMIO Scheduling', to:'d.rajan@osmio.id',
        subject:'New Assignment: Alex Johnson · Mon 28 Apr, 10:00 AM',
        date:'2026-04-24T14:30:00', read:true, tag:'new-assignment',
        body:`<div style="font-family:Inter,Arial,sans-serif;max-width:580px;margin:0 auto">
<div style="background:#12121e;padding:20px 28px;border-radius:10px 10px 0 0;display:flex;align-items:center;gap:10px">
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00b4d8" stroke-width="2.5" stroke-linecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
  <span style="color:#fff;font-size:16px;font-weight:800">OSMIO</span>
  <span style="color:#6a8a99;font-size:12px;margin-left:4px">Officer Portal</span>
</div>
<div style="padding:28px;background:#fff;border:1px solid #e2e6ef;border-top:none">
  <div style="display:inline-block;background:#ede9fe;color:#7c3aed;font-size:12px;font-weight:700;padding:4px 12px;border-radius:20px;margin-bottom:16px">New Assignment</div>
  <h2 style="color:#111827;font-size:20px;margin:0 0 8px">You have been assigned a new attestation session</h2>
  <p style="color:#374151;font-size:14px;line-height:1.6;margin:0 0 20px">Hi Divya, a supervisor has assigned you an attestation session. Please review the user details below and join the meeting at the scheduled time.</p>
  <div style="background:#f8f9fc;border:1px solid #e2e6ef;border-radius:8px;padding:20px;margin:0 0 16px">
    <div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#6b7280;margin-bottom:12px">Session Details</div>
    <table style="width:100%;border-collapse:collapse;font-size:14px">
      <tr><td style="color:#6b7280;padding:5px 0;width:160px">User</td><td style="color:#111827;font-weight:700">Alex Johnson</td></tr>
      <tr><td style="color:#6b7280;padding:5px 0">User Email</td><td style="color:#111827">alex.johnson@example.com</td></tr>
      <tr><td style="color:#6b7280;padding:5px 0">Osmio ID Pair</td><td style="color:#111827;font-family:monospace;font-size:12px">OSMIO-FND-2024-00847</td></tr>
      <tr><td style="color:#6b7280;padding:5px 0">Date &amp; Time</td><td style="color:#111827;font-weight:600">Monday, 28 April 2026 · 10:00 AM</td></tr>
      <tr><td style="color:#6b7280;padding:5px 0">Documents Submitted</td><td style="color:#111827;font-size:13px">Government ID · Liveness Check · Proof of Address</td></tr>
      <tr><td style="color:#6b7280;padding:5px 0">Meeting Link</td><td><a href="#" style="color:#0077a8;font-weight:600">meet.osmio.id/att-001</a></td></tr>
      <tr><td style="color:#6b7280;padding:5px 0">Reference</td><td style="color:#111827;font-family:monospace;font-size:13px">ATT-2026-01024</td></tr>
    </table>
  </div>
  <div style="text-align:center;margin:24px 0">
    <a href="admin.html#off-schedule" style="background:#7c3aed;color:#fff;padding:12px 28px;border-radius:8px;font-weight:700;font-size:14px;text-decoration:none;display:inline-block">View in My Schedule</a>
  </div>
</div>
<div style="background:#f0f2f7;padding:14px 28px;border-radius:0 0 10px 10px;text-align:center">
  <p style="color:#9ca3af;font-size:11px;margin:0">OSMIO Identity Authority · osmio.id</p>
</div>
</div>`
      },
      {
        id:'email_o002', from:'no-reply@osmio.id', fromName:'OSMIO Scheduling', to:'d.rajan@osmio.id',
        subject:'New Assignment: Thomas Mbeki · Wed 6 May, 10:00 AM',
        date:'2026-04-24T10:00:00', read:true, tag:'new-assignment',
        body:`<div style="font-family:Inter,Arial,sans-serif;max-width:580px;margin:0 auto">
<div style="background:#12121e;padding:20px 28px;border-radius:10px 10px 0 0;display:flex;align-items:center;gap:10px">
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00b4d8" stroke-width="2.5" stroke-linecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
  <span style="color:#fff;font-size:16px;font-weight:800">OSMIO</span>
  <span style="color:#6a8a99;font-size:12px;margin-left:4px">Officer Portal</span>
</div>
<div style="padding:28px;background:#fff;border:1px solid #e2e6ef;border-top:none">
  <div style="display:inline-block;background:#ede9fe;color:#7c3aed;font-size:12px;font-weight:700;padding:4px 12px;border-radius:20px;margin-bottom:16px">New Assignment</div>
  <h2 style="color:#111827;font-size:20px;margin:0 0 8px">You have been assigned a new attestation session</h2>
  <p style="color:#374151;font-size:14px;line-height:1.6;margin:0 0 20px">Hi Divya, you have a new attestation session assigned for early May.</p>
  <div style="background:#f8f9fc;border:1px solid #e2e6ef;border-radius:8px;padding:20px;margin:0 0 16px">
    <table style="width:100%;border-collapse:collapse;font-size:14px">
      <tr><td style="color:#6b7280;padding:5px 0;width:160px">User</td><td style="color:#111827;font-weight:700">Thomas Mbeki</td></tr>
      <tr><td style="color:#6b7280;padding:5px 0">User Email</td><td style="color:#111827">t.mbeki@example.com</td></tr>
      <tr><td style="color:#6b7280;padding:5px 0">Osmio ID Pair</td><td style="color:#111827;font-family:monospace;font-size:12px">OSMIO-FND-2025-04102</td></tr>
      <tr><td style="color:#6b7280;padding:5px 0">Date &amp; Time</td><td style="color:#111827;font-weight:600">Wednesday, 6 May 2026 · 10:00 AM</td></tr>
      <tr><td style="color:#6b7280;padding:5px 0">Documents</td><td style="color:#111827;font-size:13px">Government ID · Liveness Check</td></tr>
      <tr><td style="color:#6b7280;padding:5px 0">Meeting Link</td><td><a href="#" style="color:#0077a8;font-weight:600">meet.osmio.id/att-006</a></td></tr>
      <tr><td style="color:#6b7280;padding:5px 0">Reference</td><td style="color:#111827;font-family:monospace;font-size:13px">ATT-2026-01020</td></tr>
    </table>
  </div>
</div>
<div style="background:#f0f2f7;padding:14px 28px;border-radius:0 0 10px 10px;text-align:center">
  <p style="color:#9ca3af;font-size:11px;margin:0">OSMIO Identity Authority · osmio.id</p>
</div>
</div>`
      },
      {
        id:'email_o003', from:'no-reply@osmio.id', fromName:'OSMIO System', to:'d.rajan@osmio.id',
        subject:'Your availability has been updated',
        date:'2026-04-22T09:10:00', read:true, tag:'availability',
        body:`<div style="font-family:Inter,Arial,sans-serif;max-width:580px;margin:0 auto">
<div style="background:#12121e;padding:20px 28px;border-radius:10px 10px 0 0;display:flex;align-items:center;gap:10px">
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00b4d8" stroke-width="2.5" stroke-linecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
  <span style="color:#fff;font-size:16px;font-weight:800">OSMIO</span>
  <span style="color:#6a8a99;font-size:12px;margin-left:4px">Officer Portal</span>
</div>
<div style="padding:28px;background:#fff;border:1px solid #e2e6ef;border-top:none">
  <div style="display:inline-block;background:#dcfce7;color:#16a34a;font-size:12px;font-weight:700;padding:4px 12px;border-radius:20px;margin-bottom:16px">Availability Updated</div>
  <h2 style="color:#111827;font-size:20px;margin:0 0 8px">Your availability has been saved</h2>
  <p style="color:#374151;font-size:14px;line-height:1.6;margin:0 0 20px">Hi Divya, your availability preferences have been updated successfully. Supervisors will see your updated schedule when assigning attestation sessions.</p>
  <div style="background:#f8f9fc;border:1px solid #e2e6ef;border-radius:8px;padding:20px;margin:0 0 20px">
    <div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#6b7280;margin-bottom:12px">Changes Saved</div>
    <p style="color:#374151;font-size:13.5px;margin:0;line-height:1.6">Marked as unavailable: <strong>Mon 28 Apr, 1:00 PM – 5:00 PM</strong> and <strong>Wed 6 May, 1:00 PM – 3:30 PM</strong>. All other slots remain available.</p>
  </div>
</div>
<div style="background:#f0f2f7;padding:14px 28px;border-radius:0 0 10px 10px;text-align:center">
  <p style="color:#9ca3af;font-size:11px;margin:0">OSMIO Identity Authority · osmio.id</p>
</div>
</div>`
      }
    ],

    'c.walsh@osmio.id': [
      {
        id:'email_c001', from:'no-reply@osmio.id', fromName:'OSMIO Scheduling', to:'c.walsh@osmio.id',
        subject:'New Assignment: Sarah Chen · Tue 29 Apr, 2:00 PM',
        date:'2026-04-24T11:00:00', read:false, tag:'new-assignment',
        body:`<div style="font-family:Inter,Arial,sans-serif;max-width:580px;margin:0 auto">
<div style="background:#12121e;padding:20px 28px;border-radius:10px 10px 0 0;display:flex;align-items:center;gap:10px">
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00b4d8" stroke-width="2.5" stroke-linecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
  <span style="color:#fff;font-size:16px;font-weight:800">OSMIO</span>
  <span style="color:#6a8a99;font-size:12px;margin-left:4px">Officer Portal</span>
</div>
<div style="padding:28px;background:#fff;border:1px solid #e2e6ef;border-top:none">
  <div style="display:inline-block;background:#dbeafe;color:#1d4ed8;font-size:12px;font-weight:700;padding:4px 12px;border-radius:20px;margin-bottom:16px">New Assignment</div>
  <h2 style="color:#111827;font-size:20px;margin:0 0 8px">You have been assigned a new attestation session</h2>
  <p style="color:#374151;font-size:14px;line-height:1.6;margin:0 0 20px">Hi Connor, you have a new attestation session scheduled for this week.</p>
  <div style="background:#f8f9fc;border:1px solid #e2e6ef;border-radius:8px;padding:20px;margin:0 0 16px">
    <table style="width:100%;border-collapse:collapse;font-size:14px">
      <tr><td style="color:#6b7280;padding:5px 0;width:160px">User</td><td style="color:#111827;font-weight:700">Sarah Chen</td></tr>
      <tr><td style="color:#6b7280;padding:5px 0">User Email</td><td style="color:#111827">s.chen@example.com</td></tr>
      <tr><td style="color:#6b7280;padding:5px 0">Osmio ID Pair</td><td style="color:#111827;font-family:monospace;font-size:12px">OSMIO-FND-2025-01203</td></tr>
      <tr><td style="color:#6b7280;padding:5px 0">Date &amp; Time</td><td style="color:#111827;font-weight:600">Tuesday, 29 April 2026 · 2:00 PM</td></tr>
      <tr><td style="color:#6b7280;padding:5px 0">Documents</td><td style="color:#111827;font-size:13px">Government ID · Liveness Check</td></tr>
      <tr><td style="color:#6b7280;padding:5px 0">Meeting Link</td><td><a href="#" style="color:#0077a8;font-weight:600">meet.osmio.id/att-002</a></td></tr>
      <tr><td style="color:#6b7280;padding:5px 0">Reference</td><td style="color:#111827;font-family:monospace;font-size:13px">ATT-2026-01019</td></tr>
    </table>
  </div>
  <div style="text-align:center;margin:24px 0">
    <a href="admin.html#off-schedule" style="background:#0077a8;color:#fff;padding:12px 28px;border-radius:8px;font-weight:700;font-size:14px;text-decoration:none;display:inline-block">View in My Schedule</a>
  </div>
</div>
<div style="background:#f0f2f7;padding:14px 28px;border-radius:0 0 10px 10px;text-align:center">
  <p style="color:#9ca3af;font-size:11px;margin:0">OSMIO Identity Authority · osmio.id</p>
</div>
</div>`
      },
      {
        id:'email_c002', from:'no-reply@osmio.id', fromName:'OSMIO System', to:'c.walsh@osmio.id',
        subject:'Leave approved: Tuesday 5 May 2026',
        date:'2026-04-20T14:00:00', read:true, tag:'availability',
        body:`<div style="font-family:Inter,Arial,sans-serif;max-width:580px;margin:0 auto">
<div style="background:#12121e;padding:20px 28px;border-radius:10px 10px 0 0;display:flex;align-items:center;gap:10px">
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00b4d8" stroke-width="2.5" stroke-linecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
  <span style="color:#fff;font-size:16px;font-weight:800">OSMIO</span>
  <span style="color:#6a8a99;font-size:12px;margin-left:4px">Officer Portal</span>
</div>
<div style="padding:28px;background:#fff;border:1px solid #e2e6ef;border-top:none">
  <div style="display:inline-block;background:#dcfce7;color:#16a34a;font-size:12px;font-weight:700;padding:4px 12px;border-radius:20px;margin-bottom:16px">Approved</div>
  <h2 style="color:#111827;font-size:20px;margin:0 0 8px">Your day-off has been recorded</h2>
  <p style="color:#374151;font-size:14px;line-height:1.6;margin:0 0 20px">Hi Connor, your unavailability for <strong>Tuesday 5 May 2026</strong> has been saved. No sessions will be assigned to you on that day.</p>
</div>
<div style="background:#f0f2f7;padding:14px 28px;border-radius:0 0 10px 10px;text-align:center">
  <p style="color:#9ca3af;font-size:11px;margin:0">OSMIO Identity Authority · osmio.id</p>
</div>
</div>`
      }
    ],

    'm.webb@osmio.id': [
      {
        id:'email_m001', from:'no-reply@osmio.id', fromName:'OSMIO Scheduling', to:'m.webb@osmio.id',
        subject:'New Assignment: Priya Sharma · Tue 5 May, 11:00 AM',
        date:'2026-04-23T09:00:00', read:false, tag:'new-assignment',
        body:`<div style="font-family:Inter,Arial,sans-serif;max-width:580px;margin:0 auto">
<div style="background:#12121e;padding:20px 28px;border-radius:10px 10px 0 0;display:flex;align-items:center;gap:10px">
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00b4d8" stroke-width="2.5" stroke-linecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
  <span style="color:#fff;font-size:16px;font-weight:800">OSMIO</span>
  <span style="color:#6a8a99;font-size:12px;margin-left:4px">Officer Portal</span>
</div>
<div style="padding:28px;background:#fff;border:1px solid #e2e6ef;border-top:none">
  <div style="display:inline-block;background:#dcfce7;color:#16a34a;font-size:12px;font-weight:700;padding:4px 12px;border-radius:20px;margin-bottom:16px">New Assignment</div>
  <h2 style="color:#111827;font-size:20px;margin:0 0 8px">You have been assigned a new attestation session</h2>
  <p style="color:#374151;font-size:14px;line-height:1.6;margin:0 0 20px">Hi Marcus, a new session has been assigned to you.</p>
  <div style="background:#f8f9fc;border:1px solid #e2e6ef;border-radius:8px;padding:20px;margin:0 0 16px">
    <table style="width:100%;border-collapse:collapse;font-size:14px">
      <tr><td style="color:#6b7280;padding:5px 0;width:160px">User</td><td style="color:#111827;font-weight:700">Priya Sharma</td></tr>
      <tr><td style="color:#6b7280;padding:5px 0">User Email</td><td style="color:#111827">p.sharma@example.com</td></tr>
      <tr><td style="color:#6b7280;padding:5px 0">Osmio ID Pair</td><td style="color:#111827;font-family:monospace;font-size:12px">OSMIO-FND-2025-03155</td></tr>
      <tr><td style="color:#6b7280;padding:5px 0">Date &amp; Time</td><td style="color:#111827;font-weight:600">Tuesday, 5 May 2026 · 11:00 AM</td></tr>
      <tr><td style="color:#6b7280;padding:5px 0">Documents</td><td style="color:#111827;font-size:13px">Government ID · Liveness Check</td></tr>
      <tr><td style="color:#6b7280;padding:5px 0">Meeting Link</td><td><a href="#" style="color:#0077a8;font-weight:600">meet.osmio.id/att-004</a></td></tr>
      <tr><td style="color:#6b7280;padding:5px 0">Reference</td><td style="color:#111827;font-family:monospace;font-size:13px">ATT-2026-01015</td></tr>
    </table>
  </div>
  <div style="text-align:center;margin:24px 0">
    <a href="admin.html#off-schedule" style="background:#065f46;color:#fff;padding:12px 28px;border-radius:8px;font-weight:700;font-size:14px;text-decoration:none;display:inline-block">View in My Schedule</a>
  </div>
</div>
<div style="background:#f0f2f7;padding:14px 28px;border-radius:0 0 10px 10px;text-align:center">
  <p style="color:#9ca3af;font-size:11px;margin:0">OSMIO Identity Authority · osmio.id</p>
</div>
</div>`
      },
      {
        id:'email_m002', from:'no-reply@osmio.id', fromName:'OSMIO Scheduling', to:'m.webb@osmio.id',
        subject:"This week's schedule: 28 Apr – 2 May (1 session)",
        date:'2026-04-24T08:00:00', read:true, tag:'schedule',
        body:`<div style="font-family:Inter,Arial,sans-serif;max-width:580px;margin:0 auto">
<div style="background:#12121e;padding:20px 28px;border-radius:10px 10px 0 0;display:flex;align-items:center;gap:10px">
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00b4d8" stroke-width="2.5" stroke-linecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
  <span style="color:#fff;font-size:16px;font-weight:800">OSMIO</span>
  <span style="color:#6a8a99;font-size:12px;margin-left:4px">Officer Portal</span>
</div>
<div style="padding:28px;background:#fff;border:1px solid #e2e6ef;border-top:none">
  <h2 style="color:#111827;font-size:20px;margin:0 0 8px">Your schedule this week</h2>
  <p style="color:#374151;font-size:14px;line-height:1.6;margin:0 0 20px">Hi Marcus, you have <strong>1 session</strong> this week. Your next confirmed session is on <strong>Tuesday 5 May</strong>.</p>
  <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin:0 0 20px;font-size:13.5px;color:#374151">
    No sessions scheduled for the week of <strong>28 Apr – 2 May</strong>. Enjoy a quiet week!
  </div>
</div>
<div style="background:#f0f2f7;padding:14px 28px;border-radius:0 0 10px 10px;text-align:center">
  <p style="color:#9ca3af;font-size:11px;margin:0">OSMIO Identity Authority · osmio.id</p>
</div>
</div>`
      }
    ]
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
      label: 'Liveliness Check',
      description: 'Automated liveliness check',
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
