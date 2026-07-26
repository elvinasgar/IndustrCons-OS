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
  { group: 'Şirkət İdarəetməsi', items: [
    { key: 'companies', label: 'Şirkətlər / Müştərilər' },
    { key: 'contacts', label: 'Kontaktlar', soon:true },
    { key: 'company-docs', label: 'Sənədlər', soon:true },
  ]},
  { group: 'Layihə İdarəetməsi', items: [
    { key: 'projects', label: 'Layihələr' },
    { key: 'gantt', label: 'Qrafik / Gantt Chart', soon:true },
    { key: 'milestones', label: 'Mərhələlər & Tapşırıqlar', soon:true },
    { key: 'site-camp', label: 'Sahə Düşərgəsi Planlaması', soon:true },
  ]},
  { group: 'Smeta & BOQ', items: [
    { key: 'boq', label: 'BOQ Modulu' },
    { key: 'takeoff', label: 'Kəmiyyət Hesablanması', soon:true },
    { key: 'cost-estimation', label: 'Xərc Qiymətləndirməsi', soon:true },
  ]},
  { group: 'Satınalma & Anbar', items: [
    { key: 'procurement', label: 'Satınalma / RFQ', soon:true },
    { key: 'materials', label: 'Material İdarəetməsi', soon:true },
    { key: 'equipment', label: 'Avadanlıq Reyestri', soon:true },
  ]},
  { group: 'İnsan Resursları', items: [
    { key: 'workforce', label: 'İşçi Qüvvəsi', soon:true },
    { key: 'hr', label: 'HR & Davamiyyət', soon:true },
    { key: 'payroll', label: 'Əmək Haqqı', soon:true },
  ]},
  { group: 'Mühəndislik', items: [
    { key: 'drawings', label: 'Çertyojlar', soon:true },
    { key: 'rfi', label: 'RFI', soon:true },
    { key: 'submittals', label: 'Submittals', soon:true },
    { key: 'method-statement', label: 'Metod Bəyanatı', soon:true },
  ]},
  { group: 'Keyfiyyət & Təhlükəsizlik', items: [
    { key: 'qaqc', label: 'QA/QC & İTP', soon:true },
    { key: 'inspection', label: 'Yoxlamalar', soon:true },
    { key: 'hse', label: 'HSE' },
  ]},
  { group: 'Maliyyə', items: [
    { key: 'finance', label: 'Büdcə & Ödənişlər', soon:true },
    { key: 'cashflow', label: 'Cash Flow', soon:true },
  ]},
  { group: 'Alətlər', items: [
    { key: 'calculators', label: 'Kalkulyatorlar Mərkəzi' },
    { key: 'ai-assistant', label: 'AI Köməkçi', soon:true },
    { key: 'documents', label: 'Sənəd Mərkəzi', soon:true },
    { key: 'bim', label: 'BIM Mərkəzi', soon:true },
  ]},
  { group: 'Hesabatlar', items: [
    { key: 'reports', label: 'Hesabatlar', soon:true },
    { key: 'analytics', label: 'Analitika', soon:true },
  ]},
];

const VIEW_META = {
  dashboard: ['Dashboard', 'Layihələrinizə ümumi baxış'],
  companies: ['Şirkət İdarəetməsi', 'Müştəri, podratçı və təchizatçı reyestri'],
  projects: ['Layihələr', 'Bütün aktiv və tamamlanmış layihələr'],
  boq: ['BOQ Modulu', 'İş həcmi cədvəli və qiymətləndirmə'],
  calculators: ['Kalkulyatorlar Mərkəzi', 'Mühəndis hesablama alətləri'],
  hse: ['HSE', 'Sahə təhlükəsizliyi qeydiyyatı'],
};

let currentView = 'dashboard';

function renderView(key) {
  currentView = key;
  const content = document.getElementById('content');
  let html;
  if (typeof MODULES[key] === 'function' && ['dashboard','companies','projects','boq','calculators','hse'].includes(key)) {
    html = MODULES[key]();
  } else {
    const item = NAV.flatMap(g => g.items).find(i => i.key === key);
    html = MODULES.soon(item ? item.label : 'Modul');
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
  closeMobileNav();
}

function navigateTo(key) { renderView(key); }

function buildNav() {
  const wrap = document.getElementById('navGroups');
  wrap.innerHTML = NAV.map((g, gi) => `
    <div class="nav-group ${gi === 0 ? 'open' : ''}" data-gi="${gi}">
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
  buildNav();
  renderView('dashboard');

  document.getElementById('themeToggle').onclick = toggleTheme;
  document.getElementById('mobileNavToggle').onclick = openMobileNav;
  document.getElementById('sidebarScrim').onclick = closeMobileNav;
  document.getElementById('modalBackdrop').onclick = (e) => { if (e.target.id === 'modalBackdrop') closeModal(); };
  document.getElementById('notifBtn').onclick = () => showToast('3 yeni bildiriş var (demo)');

  document.getElementById('globalSearch').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') showToast('Axtarış: "' + e.target.value + '" (demo)');
  });
});
