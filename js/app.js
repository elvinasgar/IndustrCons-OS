/* ==========================================================================
   IndustrCons OS — APP SHELL
   Navigation config, client-side router, theme + mobile nav + modal/toast
   ========================================================================== */

/* Full IndustrCons OS module map. `key` with a matching MODULES.<key> renderer
   is live; everything else renders a "Tezliklə" placeholder so the full
   information architecture is visible from day one (per the master brief). */
const NAV = [
  { group: 'Ümumi Baxış', items: [
    { key: 'dashboard', label: 'Dashboard', icon:'📊' },
  ]},
  { group: '⚡ Workflow Engine', items: [
    { key: 'workflow-engine', label: 'Workflow Engine' },
    { key: 'timeline', label: 'Rəqəmsal Zaman Xətti' },
    { key: 'dept-feed', label: 'Departament Elanları' },
  ]},
  { group: 'Şirkət İdarəetməsi', items: [
    { key: 'companies', label: 'Şirkətlər / Müştərilər' },
    { key: 'contacts', label: 'Kontaktlar' },
    { key: 'company-docs', label: 'Sənədlər' },
  ]},
  { group: 'Layihə İdarəetməsi', items: [
    { key: 'projects', label: 'Layihələr' },
    { key: 'board', label: 'Kanban Lövhə' },
    { key: 'site-diary', label: 'Sahə Gündəliyi' },
    { key: 'planner', label: 'Gündəlik Planlayıcı' },
    { key: 'risk-register', label: 'Risk Reyestri' },
    { key: 'gantt', label: 'Qrafik / Gantt Chart' },
    { key: 'milestones', label: 'Mərhələlər' },
    { key: 'site-camp', label: 'Sahə Düşərgəsi Planlaması' },
  ]},
  { group: 'Smeta & BOQ', items: [
    { key: 'boq', label: 'BOQ Modulu' },
    { key: 'takeoff', label: 'Kəmiyyət Hesablanması' },
    { key: 'cost-estimation', label: 'Xərc Qiymətləndirməsi' },
  ]},
  { group: 'Satınalma & Anbar', items: [
    { key: 'procurement', label: 'Satınalma / RFQ' },
    { key: 'materials', label: 'Material İdarəetməsi' },
    { key: 'equipment', label: 'Avadanlıq Reyestri' },
  ]},
  { group: 'İnsan Resursları', items: [
    { key: 'workforce', label: 'İşçi Qüvvəsi' },
    { key: 'access-control', label: 'Giriş-Çıxış Nəzarəti (QR/Turnstil)' },
    { key: 'hr', label: 'HR & Davamiyyət' },
    { key: 'payroll', label: 'Əmək Haqqı' },
  ]},
  { group: 'Mühəndislik', items: [
    { key: 'drawings', label: 'Çertyojlar' },
    { key: 'rfi', label: 'RFI' },
    { key: 'submittals', label: 'Submittals' },
    { key: 'method-statement', label: 'Metod Bəyanatı' },
  ]},
  { group: 'Keyfiyyət & Təhlükəsizlik', items: [
    { key: 'qaqc', label: 'QA/QC Checklist' },
    { key: 'safety-checklist', label: 'Təhlükəsizlik Checklist' },
    { key: 'inspection', label: 'İTP & Yoxlamalar' },
    { key: 'hse', label: 'HSE' },
  ]},
  { group: 'Maliyyə', items: [
    { key: 'finance', label: 'Büdcə & Ödənişlər' },
    { key: 'cashflow', label: 'Cash Flow' },
  ]},
  { group: 'Alətlər', items: [
    { key: 'calculators', label: 'Kalkulyatorlar Mərkəzi' },
    { key: 'notes', label: 'Qeydlər (Sticky/Quick)' },
    { key: 'ai-assistant', label: 'AI Köməkçi' },
    { key: 'documents', label: 'Sənəd Mərkəzi' },
    { key: 'bim', label: 'BIM Mərkəzi' },
  ]},
  { group: 'Hesabatlar', items: [
    { key: 'reports', label: 'Hesabatlar' },
    { key: 'analytics', label: 'Analitika' },
  ]},
  { group: 'Sistem', items: [
    { key: 'data', label: 'Data İdarəetməsi (Export/Import)' },
  ]},
];

/* Rich content for not-yet-built modules. Keeps the full IndustrCons OS
   information architecture visible and communicates real product intent
   instead of a bare "coming soon" placeholder. */
const SOON_INFO = {
  'contacts': { icon:'📇', phase:'Faza 2', desc:'Bütün şirkətlərin əlaqədar şəxslərini tək bazada saxlayın və layihələrə bağlayın.',
    features:['Vizit kartı formatında kontakt profili','Zəng/e-poçt tarixçəsi','Layihə və şirkətə görə filtrasiya'] },
  'company-docs': { icon:'🗂️', phase:'Faza 2', desc:'Şirkət səviyyəsində müqavilə, sertifikat və lisenziya sənədlərini saxlayın.',
    features:['Bitmə tarixi olan sənədlərə avtomatik xəbərdarlıq','Versiya tarixçəsi','PDF ön izləmə'] },
  'gantt': { icon:'📅', phase:'Faza 2', desc:'Layihə fəaliyyətlərini vizual qrafik üzərində planlaşdırın və asılılıqları izləyin.',
    features:['Sürüklə-burax fəaliyyət planlaşdırması','Kritik yol (Critical Path) hesablanması','Baseline vs Actual müqayisəsi'] },
  'milestones': { icon:'🚩', phase:'Faza 2', desc:'Layihənin əsas mərhələlərini təyin edin və tamamlanma tarixlərini izləyin.',
    features:['Mərhələ əsaslı bildirişlər','Gecikmə xəbərdarlıqları','Sifarişçi üçün ictimai mərhələ görünüşü'] },
  'site-camp': { icon:'⛺', phase:'Faza 3', desc:'Sahə düşərgəsinin planlaşdırılması: konteynerlər, müvəqqəti yollar, elektrik, su və park sahələri.',
    features:['Drag-drop kampus planlayıcısı (2D)','Konteyner/generator/anbar yerləşdirmə şablonları','Kampus quraşdırma xərc kalkulyatoru'] },
  'takeoff': { icon:'📐', phase:'Faza 2', desc:'Çertyojlardan avtomatik kəmiyyət çıxarılması (beton, armatur, torpaq işləri və s.).',
    features:['PDF/CAD üzərindən ölçmə aləti','Element kitabxanası ilə avtomatik hesablama','Birbaşa BOQ-a ötürmə'] },
  'cost-estimation': { icon:'💵', phase:'Faza 2', desc:'Material, avadanlıq, işçi qüvvəsi və dolayı xərcləri birləşdirərək tam layihə smetası.',
    features:['Xərc kateqoriyaları üzrə bölgü','Mənfəət/vergi ssenari analizi','Cash-flow proqnozu ilə inteqrasiya'] },
  'procurement': { icon:'📦', phase:'Faza 2', desc:'RFQ, tender və satınalma sifarişlərinin idarə olunması.',
    features:['Bir neçə təchizatçıdan təklif müqayisəsi','Sifariş statusu izləmə','Təchizatçı reytinq tarixçəsi'] },
  'materials': { icon:'🏗️', phase:'Faza 2', desc:'Anbar, material tələbi, qəbul və istehlak izləmə.',
    features:['QR kodla material izləmə','Minimum stok xəbərdarlığı','Anbarlar arası transfer'] },
  'equipment': { icon:'🚜', phase:'Faza 2', desc:'Avadanlıq reyestri: yanacaq, texniki xidmət, operator və iş saatları.',
    features:['Texniki xidmət təqvimi','Nasazlıq/breakdown qeydiyyatı','Avadanlıq məşğulluq dərəcəsi'] },
  'workforce': { icon:'👷', phase:'Faza 2', desc:'İşçi qüvvəsinin qeydiyyatı, davamiyyəti və sertifikatları.',
    features:['Gündəlik davamiyyət qeydiyyatı','Sertifikat bitmə tarixi xəbərdarlığı','Sahəyə görə işçi bölgüsü'] },
  'access-control': { icon:'🎫', phase:'Faza 2', desc:'Sahəyə/kampusa daxil olan və çıxan işçilərin real-vaxt sayğacı və qeydiyyatı — turnstil, QR kod və ya kamera əsaslı aşkarlama ilə.',
    features:[
      'Hər işçiyə unikal QR/ID kartı generasiyası',
      'Mobil tətbiq və ya sahə terminalı ilə giriş/çıxış skan etmə',
      'Real-vaxt sayğac: sahədə hazırda neçə nəfər olduğunu göstərir',
      'Gecikmə/erkən çıxış bildirişləri və gündəlik davamiyyət hesabatı',
      'Gələcək genişlənmə: kamera əsaslı insan aşkarlama (computer vision) inteqrasiyası — sahə kamerası/edge-cihaz tələb edir'
    ] },
  'hr': { icon:'🧑‍💼', phase:'Faza 2', desc:'İşə qəbul, məzuniyyət, tibbi və vizasla bağlı sənədlərin idarə olunması.',
    features:['Namizəd izləmə paneli','Məzuniyyət balansı hesablama','Vəzifə iyerarxiyası (Org Chart)'] },
  'payroll': { icon:'💰', phase:'Faza 3', desc:'Əmək haqqı, overtime və bonusların hesablanması.',
    features:['Davamiyyətdən avtomatik hesablama','Vergi/sığorta kəsintiləri','Aylıq əmək haqqı hesabatı'] },
  'drawings': { icon:'📄', phase:'Faza 3', desc:'Çertyoj, spesifikasiya və as-built sənədlərinin versiya idarəetməsi.',
    features:['Versiya tarixçəsi və müqayisə','Təsdiq iş axını (approval workflow)','PDF ön izləmə və annotasiya'] },
  'rfi': { icon:'❓', phase:'Faza 3', desc:'Sorğu (RFI) yaratma, baxış və təsdiq iş axını.',
    features:['Prioritet və son tarix izləmə','Cavab tarixçəsi','Layihəyə görə RFI statistikası'] },
  'submittals': { icon:'📤', phase:'Faza 3', desc:'Material və çertyoj təqdimatlarının (submittal) təsdiq prosesi.',
    features:['Çoxmərhələli təsdiq iş axını','Rədd/təkrar-təqdim tarixçəsi','Konsultant/sifarişçi paylaşımı'] },
  'method-statement': { icon:'📋', phase:'Faza 3', desc:'AI dəstəkli metod bəyanatı yaradıcısı və şablon kitabxanası.',
    features:['AI ilə ilkin qaralama generasiyası','Redaktə edilə bilən şablonlar','Təsdiq iş axını'] },
  'inspection': { icon:'🔍', phase:'Faza 2', desc:'İTP (Inspection Test Plan) və sahə yoxlamalarının planlaşdırılması.',
    features:['Yoxlama təqvimi','Şəkilli defekt/punch-list qeydiyyatı','NCR (uyğunsuzluq) izləmə'] },
  'ai-assistant': { icon:'🤖', phase:'Faza 2', desc:'Tikinti sahəsinə xüsusi AI köməkçi: smeta, risk aşkarlama, sənəd xülasəsi.',
    features:['Layihə datanıza əsaslanan suallara cavab','Risk və gecikmə aşkarlama tövsiyələri','Metod bəyanatı və hesabat qaralaması yaratma'] },
  'documents': { icon:'📁', phase:'Faza 2', desc:'Bütün layihə sənədləri (PDF, Excel, Word, foto, video) üçün mərkəzləşdirilmiş sənəd mərkəzi.',
    features:['Kateqoriya və layihəyə görə strukturlaşdırma','Versiya və təsdiq tarixçəsi','Tam mətn axtarışı'] },
  'bim': { icon:'🧊', phase:'Faza 3', desc:'3D model baxışı və kolliziya (clash) analizi ilə BIM mərkəzi.',
    features:['3D model naviqasiyası brauzerdə','Element məlumat panelləri','Clash report generasiyası'] },
  'reports': { icon:'📊', phase:'Faza 2', desc:'Gündəlik/həftəlik/aylıq layihə, maliyyə, keyfiyyət və təhlükəsizlik hesabatları.',
    features:['Avtomatik PDF hesabat generasiyası','Fərdiləşdirilə bilən şablonlar','E-poçtla planlaşdırılmış göndərmə'] },
  'analytics': { icon:'📈', phase:'Faza 3', desc:'Bütün layihələr üzrə KPI, məhsuldarlıq və proqnoz analitikası.',
    features:['Çoxlayihəli müqayisəli dashboard','Trend və proqnoz qrafikləri','İxrac edilə bilən analitik hesabatlar'] },
};

const VIEW_META = {
  dashboard: ['Dashboard', 'Layihələrinizə ümumi baxış'],
  companies: ['Şirkət İdarəetməsi', 'Müştəri, podratçı və təchizatçı reyestri'],
  projects: ['Layihələr', 'Bütün aktiv və tamamlanmış layihələr'],
  boq: ['BOQ Modulu', 'İş həcmi cədvəli və qiymətləndirmə'],
  calculators: ['Kalkulyatorlar Mərkəzi', 'Mühəndis hesablama alətləri'],
  hse: ['HSE', 'Sahə təhlükəsizliyi qeydiyyatı'],
  board: ['Kanban Lövhə', 'Tapşırıqları vəziyyətə görə izləyin'],
  'site-diary': ['Sahə Gündəliyi', 'Gündəlik sahə hesabatları'],
  planner: ['Gündəlik Planlayıcı', 'Vaxt-bloklu tapşırıqlar'],
  'risk-register': ['Risk Reyestri', 'Ehtimal × Təsir əsasında risk qiymətləndirməsi'],
  qaqc: ['QA/QC Checklist', 'Keyfiyyətə nəzarət yoxlama siyahısı'],
  'safety-checklist': ['Təhlükəsizlik Checklist', 'Sahə təhlükəsizlik yoxlama siyahısı'],
  notes: ['Qeydlər', 'Sticky notes və sürətli qeydlər'],
  data: ['Data İdarəetməsi', 'Ehtiyat nüsxə, bərpa və datanın silinməsi'],
  contacts: ['Kontaktlar', 'Bütün əlaqədar şəxslər tək bazada'],
  'company-docs': ['Şirkət Sənədləri', 'Lisenziya, sertifikat və müqavilə izləmə'],
  gantt: ['Qrafik / Gantt Chart', 'Fəaliyyət planlaması və vaxt xətti'],
  milestones: ['Mərhələlər', 'Layihənin əsas nöqtələri'],
  'site-camp': ['Sahə Düşərgəsi Planlaması', 'Kampus quraşdırma xərc kalkulyatoru'],
  takeoff: ['Kəmiyyət Hesablanması', 'Element əsaslı miqdar çıxarılması'],
  'cost-estimation': ['Xərc Qiymətləndirməsi', 'Tam layihə dəyərinin hesablanması'],
  procurement: ['Satınalma / RFQ', 'Sifariş və təchizatçı izləmə'],
  materials: ['Material İdarəetməsi', 'Anbar stok səviyyəsi'],
  equipment: ['Avadanlıq Reyestri', 'Yanacaq, iş saatı, texniki xidmət'],
  workforce: ['İşçi Qüvvəsi', 'İşçi qeydiyyatı və sertifikatlar'],
  'access-control': ['Giriş-Çıxış Nəzarəti', 'Real-vaxt sahə davamiyyət sayğacı'],
  hr: ['HR & Məzuniyyət', 'Məzuniyyət sorğuları və statusu'],
  payroll: ['Əmək Haqqı', 'Maaş, əlavə iş və kəsintilər'],
  drawings: ['Çertyoj Reyestri', 'Versiya idarəetməsi'],
  rfi: ['RFI', 'Sorğu yaratma və izləmə'],
  submittals: ['Submittals', 'Material və çertyoj təqdimatları'],
  'method-statement': ['Metod Bəyanatı', 'Şablon-əsaslı qaralama generatoru'],
  inspection: ['İTP & Yoxlamalar', 'Sahə yoxlama planı və nəticələri'],
  'ai-assistant': ['AI Köməkçi', 'Layihə datası üzərində sürətli axtarış'],
  documents: ['Sənəd Mərkəzi', 'Bütün layihə sənədləri mərkəzləşdirilmiş'],
  bim: ['BIM Mərkəzi', 'Model naviqasiya demo'],
  reports: ['Hesabatlar', 'Avtomatik layihə xülasəsi'],
  analytics: ['Analitika', 'Çoxlayihəli müqayisəli göstəricilər'],
  finance: ['Büdcə & Ödənişlər', 'Gəlir/xərc əməliyyatlarının izlənməsi'],
  cashflow: ['Cash Flow', 'Aylıq nağd vəsait hərəkəti və proqnoz'],
  'workflow-engine': ['Workflow Engine', 'Konfiqurasiya edilə bilən proses mühərriki — kodlaşdırma tələb etmir'],
  timeline: ['Rəqəmsal Zaman Xətti', 'Layihədə baş verən hər əməliyyatın tarixçəsi'],
  'dept-feed': ['Departament Elanları', 'Şöbələr arası birbaşa kommunikasiya lövhəsi'],
};

let currentView = 'dashboard';
const FLAT_NAV = NAV.flatMap(g => g.items);

/* ---------------------------------------------------------------------------
   ROLE / COMPANY VISIBILITY PROTOTYPE
   This is a UX demo only — it shows what a real multi-tenant permission
   system would look and feel like. It does NOT provide real data security
   (everything still lives in one browser's localStorage). Real enforcement
   requires a backend with authentication + server-side authorization.
   --------------------------------------------------------------------------- */
const ROLES = ['Ana Şirkət', 'Podratçı', 'Subpodratçı', 'Sifarişçi', 'Konsultant', 'Təchizatçı'];

const PERMISSIONS = {
  'Ana Şirkət': null, // null = full access to everything (platform owner)
  'Podratçı': ['dashboard','projects','board','site-diary','planner','risk-register','gantt','milestones','site-camp',
    'boq','takeoff','cost-estimation','materials','equipment','workforce','access-control','hr',
    'qaqc','safety-checklist','hse','inspection','drawings','rfi','submittals','method-statement',
    'procurement','calculators','notes','workflow-engine','timeline','dept-feed','reports','ai-assistant','documents','bim'],
  'Subpodratçı': ['dashboard','board','site-diary','planner','workforce','access-control',
    'qaqc','safety-checklist','hse','inspection','method-statement','materials','equipment',
    'rfi','submittals','calculators','notes','workflow-engine','timeline','dept-feed'],
  'Sifarişçi': ['dashboard','projects','gantt','milestones','rfi','submittals','inspection','drawings',
    'documents','ai-assistant','reports','timeline','dept-feed'],
  'Konsultant': ['dashboard','rfi','submittals','inspection','qaqc','drawings','method-statement',
    'documents','timeline','dept-feed','reports'],
  'Təchizatçı': ['dashboard','procurement','materials','documents','dept-feed','timeline'],
};

let activeRole = 'Ana Şirkət';

function isPermitted(key) {
  const allowed = PERMISSIONS[activeRole];
  return allowed === null || allowed.includes(key);
}

function setActiveRole(role) {
  activeRole = role;
  DB.set('active_role', role);
  updateNavPermissions();
  renderView(currentView);
  showToast('Baxış rolu dəyişdirildi: ' + role + ' (demo — real təhlükəsizlik deyil)');
}

function updateNavPermissions() {
  document.querySelectorAll('.nav-item').forEach(el => {
    const key = el.dataset.key;
    const permitted = isPermitted(key);
    el.classList.toggle('restricted', !permitted);
    const lockSpan = el.querySelector('.lock');
    if (!permitted && !lockSpan) {
      el.insertAdjacentHTML('beforeend', '<span class="lock">🔒</span>');
    } else if (permitted && lockSpan) {
      lockSpan.remove();
    }
  });
}

function renderRestrictedView(key) {
  const item = FLAT_NAV.find(i => i.key === key);
  return `
  <div class="card" style="text-align:center; padding:60px 20px;">
    <div style="font-size:34px; margin-bottom:14px;">🔒</div>
    <h3 style="font-family:var(--font-display); margin-bottom:8px;">Bu modula giriş məhduddur</h3>
    <p style="color:var(--text-faint); font-size:13px; max-width:440px; margin:0 auto;">
      "<strong>${activeRole}</strong>" rolu real sistemdə "<strong>${item ? item.label : key}</strong>" moduluna giriş əldə etmir.
      Bu, çoxşirkətli icazə modelinin necə işləyəcəyini göstərən UX prototipdir — real data ayrılığı yalnız backend qoşulduqda təmin olunacaq.
    </p>
  </div>`;
}

function updateTitleBlock(key) {
  const idx = FLAT_NAV.findIndex(i => i.key === key);
  const item = FLAT_NAV[idx];
  const num = String(idx + 1).padStart(2, '0');
  document.getElementById('tbSheet').textContent = `${num} — ${(item ? item.label : key).toUpperCase()}`;
}

function pulseSaved() {
  const el = document.getElementById('tbSaved');
  el.classList.remove('pulsing');
  void el.offsetWidth; // restart animation
  el.classList.add('pulsing');
}

function renderView(key) {
  currentView = key;
  const content = document.getElementById('content');
  let html;
  const liveModules = [
    'dashboard','companies','projects','boq','calculators','hse',
    'board','site-diary','planner','risk-register','qaqc','safety-checklist','notes','data',
    'contacts','company-docs','gantt','milestones','site-camp',
    'takeoff','cost-estimation','procurement','materials','equipment',
    'workforce','access-control','hr','payroll',
    'drawings','rfi','submittals','method-statement','inspection',
    'ai-assistant','documents','bim','reports','analytics','finance','cashflow',
    'workflow-engine','timeline','dept-feed'
  ];
  if (!isPermitted(key)) {
    html = renderRestrictedView(key);
  } else if (typeof MODULES[key] === 'function' && liveModules.includes(key)) {
    html = MODULES[key]();
  } else {
    html = MODULES.soon(key);
  }
  content.innerHTML = `<div class="view active">${html}</div>`;

  const meta = VIEW_META[key];
  if (meta) {
    document.getElementById('pageTitle').textContent = meta[0];
    document.getElementById('pageSubtitle').textContent = meta[1];
  } else {
    const item = NAV.flatMap(g => g.items).find(i => i.key === key);
    document.getElementById('pageTitle').textContent = item ? item.label : 'IndustrCons OS';
    document.getElementById('pageSubtitle').textContent = 'Bu modul tezliklə aktiv olacaq';
  }

  // sync active nav item
  document.querySelectorAll('.nav-item').forEach(el => el.classList.toggle('active', el.dataset.key === key));
  updateTitleBlock(key);
  closeMobileNav();
}

function navigateTo(key) { renderView(key); }

function buildNav() {
  const wrap = document.getElementById('navGroups');
  wrap.innerHTML = NAV.map((g, gi) => `
    <div class="nav-group ${gi <= 1 ? 'open' : ''}" data-gi="${gi}">
      <div class="nav-group-title" onclick="toggleGroup(${gi})">
        <span>${g.group}</span><span class="chev">▶</span>
      </div>
      <div class="nav-group-items">
        ${g.items.map(i => `
          <div class="nav-item" data-key="${i.key}" onclick="navigateTo('${i.key}')">
            <span class="dot"></span><span>${i.label}</span>
            ${i.soon ? '<span class="soon-tag">SOON</span>' : ''}
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');
}

function toggleGroup(gi) {
  document.querySelector(`.nav-group[data-gi="${gi}"]`).classList.toggle('open');
}

/* ---------------------------------------------------------------- THEME */
function initTheme() {
  const saved = localStorage.getItem('icos_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', saved);
  updateThemeIcon(saved);
}
function toggleTheme() {
  const cur = document.documentElement.getAttribute('data-theme');
  const next = cur === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('icos_theme', next);
  updateThemeIcon(next);
}
function updateThemeIcon(theme) {
  const icon = document.getElementById('themeIcon');
  icon.innerHTML = theme === 'dark'
    ? '<path fill="currentColor" d="M12 18a6 6 0 1 1 0-12 6 6 0 0 1 0 12z"/>'
    : '<path fill="currentColor" d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.4 5.4 0 0 1-7.54-7.54A9 9 0 0 0 12 3z"/>';
}

/* ---------------------------------------------------------------- MOBILE NAV */
function openMobileNav() {
  document.getElementById('sidebar').classList.add('open');
  document.getElementById('sidebarScrim').classList.add('show');
}
function closeMobileNav() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebarScrim').classList.remove('show');
}

/* ---------------------------------------------------------------- MODAL */
function openModal(html) {
  document.getElementById('modalRoot').innerHTML = html;
  document.getElementById('modalBackdrop').classList.add('open');
}
function closeModal() {
  document.getElementById('modalBackdrop').classList.remove('open');
}

/* ---------------------------------------------------------------- TOAST */
let toastTimer;
function showToast(msg) {
  const t = document.getElementById('toast');
  t.innerHTML = `<span class="dot"></span>${msg}`;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
}

/* ---------------------------------------------------------------- INIT */
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  activeRole = DB.get('active_role', 'Ana Şirkət');
  buildNav();
  renderView('dashboard');

  // Role switcher
  const roleSelect = document.getElementById('roleSwitcher');
  roleSelect.innerHTML = ROLES.map(r => `<option value="${r}" ${r===activeRole?'selected':''}>${r}</option>`).join('');
  updateNavPermissions();

  // Title block: date
  const today = new Date();
  document.getElementById('tbDate').textContent = today.toLocaleDateString('az-AZ', { day: '2-digit', month: 'short', year: 'numeric' });

  // Title block: project name (persisted)
  const tbProjectInput = document.getElementById('tbProjectName');
  tbProjectInput.value = DB.get('workspace_project_name', 'Untitled Project');
  tbProjectInput.addEventListener('change', () => {
    DB.set('workspace_project_name', tbProjectInput.value);
    pulseSaved();
  });

  document.getElementById('themeToggle').onclick = toggleTheme;
  document.getElementById('mobileNavToggle').onclick = openMobileNav;
  document.getElementById('sidebarScrim').onclick = closeMobileNav;
  document.getElementById('modalBackdrop').onclick = (e) => { if (e.target.id === 'modalBackdrop') closeModal(); };
  document.getElementById('notifBtn').onclick = () => showToast('3 yeni bildiriş var (demo)');

  document.getElementById('globalSearch').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') showToast('Axtarış: "' + e.target.value + '" (demo)');
  });
});
