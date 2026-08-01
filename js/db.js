/* ==========================================================================
   IndustrCons OS — DB LAYER (localStorage now, swappable for real API later)
   Every module reads/writes through DB.* so migrating to a backend later
   only means changing this one file.
   ========================================================================== */
const DB = (() => {
  const PREFIX = 'icos_';

  function get(key, fallback) {
    try {
      const raw = localStorage.getItem(PREFIX + key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      console.error('DB get error', key, e);
      return fallback;
    }
  }

  function set(key, value) {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
      if (key !== 'seeded' && typeof window !== 'undefined' && typeof window.pulseSaved === 'function') {
        window.pulseSaved();
      }
      return true;
    } catch (e) {
      console.error('DB set error', key, e);
      return false;
    }
  }

  function uid(prefix = 'id') {
    return prefix + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  function seedOnce() {
    if (get('seeded', false)) return;

    set('companies', [
      { id: uid('co'), name: 'Baku Steel Construction MMC', type: 'Podratçı', contact: 'Rəşad Quliyev', phone: '+994 50 123 45 67', rating: 4, city: 'Bakı' },
      { id: uid('co'), name: 'Caspian Development Group', type: 'Sifarişçi', contact: 'Elvin Əsgərov', phone: '+994 77 588 97 27', rating: 5, city: 'Bakı' },
      { id: uid('co'), name: 'Absheron Materials Supply', type: 'Təchizatçı', contact: 'Vüsal Məmmədov', phone: '+994 55 210 88 30', rating: 4, city: 'Sumqayıt' },
      { id: uid('co'), name: 'GeoTech Consulting', type: 'Konsaltinq', contact: 'Nigar Hüseynova', phone: '+994 51 400 12 09', rating: 5, city: 'Bakı' },
    ]);

    set('projects', [
      { id: uid('pr'), name: 'Port Baku Residence Tower B', type: 'Yüksək bina', budget: 12500000, spent: 7800000, progress: 62, status: 'active', start: '2025-03-01', end: '2026-11-30', risk: 'orta' },
      { id: uid('pr'), name: 'Sumqayıt Sənaye Zavodu', type: 'Sənaye', budget: 8300000, spent: 8100000, progress: 91, status: 'active', start: '2024-09-15', end: '2026-08-01', risk: 'aşağı' },
      { id: uid('pr'), name: 'Gəncə Yol Qovşağı', type: 'İnfrastruktur', budget: 4200000, spent: 1150000, progress: 24, status: 'active', start: '2026-01-10', end: '2027-05-20', risk: 'yüksək' },
      { id: uid('pr'), name: 'Xəzər Sahili Anbar Kompleksi', type: 'Kommersiya', budget: 2600000, spent: 2600000, progress: 100, status: 'completed', start: '2024-02-01', end: '2025-12-01', risk: 'aşağı' },
    ]);

    set('boq', [
      { id: uid('bq'), code: '01.010', desc: 'Beton B25 tökülməsi (təməl)', unit: 'm³', qty: 420, unitPrice: 145, },
      { id: uid('bq'), code: '01.020', desc: 'Armatur döşənməsi Ø12-Ø20', unit: 'ton', qty: 38, unitPrice: 1850 },
      { id: uid('bq'), code: '02.010', desc: 'Torpaq qazıntı işləri', unit: 'm³', qty: 1250, unitPrice: 12.5 },
      { id: uid('bq'), code: '03.010', desc: 'Blok hörgü (D-20)', unit: 'm²', qty: 980, unitPrice: 22.4 },
    ]);

    set('hse_incidents', [
      { id: uid('hi'), date: '2026-07-14', type: 'Near Miss', desc: 'Qazma sahəsində qoruyucu maneə əskik idi', severity: 'orta', status: 'bağlı' },
      { id: uid('hi'), date: '2026-07-21', type: 'Toolbox Talk', desc: 'Hündürlükdə iş üzrə gündəlik brifinq', severity: 'aşağı', status: 'bağlı' },
    ]);

    set('tasks', [
      { id: uid('tk'), title: 'Beton nümunələrinin laboratoriya testi', project: 'Port Baku Residence Tower B', due: '2026-07-28', done: false },
      { id: uid('tk'), title: 'Alt-podratçı hesabatlarının yoxlanması', project: 'Sumqayıt Sənaye Zavodu', due: '2026-07-27', done: false },
      { id: uid('tk'), title: 'HSE həftəlik audit', project: 'Gəncə Yol Qovşağı', due: '2026-07-29', done: false },
    ]);

    set('board_tasks', [
      { id: uid('bt'), title: 'Beton nümunə testi planlaşdır', project: 'Port Baku Residence Tower B', assignee: 'R. Quliyev', status: 'todo' },
      { id: uid('bt'), title: 'Armatur çatdırılması yoxla', project: 'Sumqayıt Sənaye Zavodu', assignee: 'V. Məmmədov', status: 'progress' },
      { id: uid('bt'), title: 'Həftəlik HSE audit hesabatı', project: 'Gəncə Yol Qovşağı', assignee: 'N. Hüseynova', status: 'done' },
    ]);

    set('site_diary', [
      { id: uid('sd'), date: '2026-07-25', weather: 'Günəşli, 32°C', manpower: 84, notes: 'Təməl betonlanması tamamlandı, blok B. Heç bir gecikmə yoxdur.' },
    ]);

    set('daily_planner', [
      { id: uid('dp'), date: '2026-07-27', time: '08:00', title: 'Sahə təhlükəsizlik brifinqi', done: false },
      { id: uid('dp'), date: '2026-07-27', time: '11:00', title: 'Alt-podratçı koordinasiya görüşü', done: false },
    ]);

    set('sticky_notes', [
      { id: uid('sn'), text: 'Sement ehtiyatını yoxla — 3 gündən az qalıb', color: '#FF7A1A' },
    ]);

    set('quick_notes', []);

    set('risks', [
      { id: uid('rk'), title: 'Hava şəraiti səbəbi ilə gecikmə', category: 'Cədvəl', likelihood: 3, impact: 4, mitigation: 'Yağışlı mövsüm üçün buferi artır', owner: 'PM', status: 'açıq' },
      { id: uid('rk'), title: 'Polad qiymətlərinin artması', category: 'Maliyyə', likelihood: 4, impact: 3, mitigation: 'Uzunmüddətli təchizat müqaviləsi', owner: 'Satınalma', status: 'izlənilir' },
    ]);

    set('qaqc_checklist', [
      { id: uid('qc'), text: 'Beton kub nümunələri götürülüb və etiketlənib', status: 'pass' },
      { id: uid('qc'), text: 'Armatur bağlama sxemi çertyoja uyğundur', status: 'pending' },
    ]);

    set('safety_checklist', [
      { id: uid('sc'), text: 'Bütün işçilərdə PPE (dəbilqə, jilet, ayaqqabı) var', checked: true },
      { id: uid('sc'), text: 'Qazma zonası ətrafında maneə lenti quraşdırılıb', checked: false },
    ]);

    set('contacts', [
      { id: uid('ct'), name: 'Rəşad Quliyev', company: 'Baku Steel Construction MMC', role: 'Layihə Meneceri', phone: '+994 50 123 45 67', email: 'rashad@bakusteel.az' },
      { id: uid('ct'), name: 'Nigar Hüseynova', company: 'GeoTech Consulting', role: 'Baş Mühəndis', phone: '+994 51 400 12 09', email: 'nigar@geotech.az' },
    ]);

    set('company_docs', [
      { id: uid('cd'), company: 'Baku Steel Construction MMC', title: 'Fəaliyyət Lisenziyası', expiry: '2027-03-01', status: 'aktiv' },
      { id: uid('cd'), company: 'Absheron Materials Supply', title: 'ISO 9001 Sertifikatı', expiry: '2026-09-15', status: 'aktiv' },
    ]);

    set('milestones', [
      { id: uid('ms'), project: 'Port Baku Residence Tower B', title: 'Təməl işlərinin bitməsi', date: '2026-08-15', status: 'gözlənilir' },
      { id: uid('ms'), project: 'Sumqayıt Sənaye Zavodu', title: 'Mexaniki quraşdırmanın başlanması', date: '2026-08-01', status: 'gözlənilir' },
      { id: uid('ms'), project: 'Gəncə Yol Qovşağı', title: 'Torpaq işlərinin bitməsi', date: '2026-09-10', status: 'gecikir' },
    ]);

    set('gantt_tasks', [
      { id: uid('gt'), project: 'Port Baku Residence Tower B', title: 'Təməl qazıntısı', start: '2026-06-01', end: '2026-06-25' },
      { id: uid('gt'), project: 'Port Baku Residence Tower B', title: 'Beton təməl', start: '2026-06-20', end: '2026-07-20' },
      { id: uid('gt'), project: 'Port Baku Residence Tower B', title: 'Karkas quraşdırma', start: '2026-07-18', end: '2026-09-05' },
      { id: uid('gt'), project: 'Sumqayıt Sənaye Zavodu', title: 'Mexaniki quraşdırma', start: '2026-07-05', end: '2026-08-10' },
    ]);

    set('site_camp', [
      { id: uid('sc2'), item: 'Ofis konteyneri (20ft)', qty: 4, unitCost: 1800 },
      { id: uid('sc2'), item: 'Yataqxana konteyneri', qty: 12, unitCost: 2200 },
      { id: uid('sc2'), item: 'Generator (100kVA)', qty: 2, unitCost: 9500 },
      { id: uid('sc2'), item: 'Müvəqqətli yol (m)', qty: 350, unitCost: 24 },
    ]);

    set('takeoff_items', [
      { id: uid('tf'), element: 'Sütun C1 (0.4×0.4×3.2m)', category: 'Beton', qty: 4.096, unit: 'm³' },
      { id: uid('tf'), element: 'Tavan tili (200mm)', category: 'Beton', qty: 128, unit: 'm³' },
    ]);

    set('cost_estimation', {
      labor: 850000, equipment: 420000, indirect: 180000, marginPct: 12, taxPct: 18,
    });

    set('procurement', [
      { id: uid('pc'), item: 'Portland Sement (50kg)', qty: 2000, vendor: 'Absheron Materials Supply', status: 'sifariş verilib', eta: '2026-08-05' },
      { id: uid('pc'), item: 'Armatur Ø16 (12m)', qty: 500, vendor: 'Baku Steel Construction MMC', status: 'təklif mərhələsi', eta: '2026-08-12' },
    ]);

    set('materials_stock', [
      { id: uid('mt'), name: 'Portland Sement (50kg kisə)', unit: 'kisə', qty: 340, minLevel: 200 },
      { id: uid('mt'), name: 'Qum', unit: 'm³', qty: 85, minLevel: 50 },
      { id: uid('mt'), name: 'Armatur Ø12', unit: 'ton', qty: 6, minLevel: 10 },
    ]);

    set('equipment_registry', [
      { id: uid('eq'), name: 'Ekskavator CAT 320', type: 'Ekskavator', status: 'aktiv', hours: 3420, fuel: 'Dizel' },
      { id: uid('eq'), name: 'Beton Mikseri', type: 'Nəqliyyat', status: 'texniki xidmətdə', hours: 1850, fuel: 'Dizel' },
    ]);

    set('workforce_registry', [
      { id: uid('wf'), name: 'Elşən Nəbiyev', role: 'Usta', project: 'Port Baku Residence Tower B', phone: '+994 55 300 12 44', certExpiry: '2026-12-01' },
      { id: uid('wf'), name: 'Toğrul Əliyev', role: 'Qaynaqçı', project: 'Sumqayıt Sənaye Zavodu', phone: '+994 50 244 90 11', certExpiry: '2026-08-20' },
    ]);

    set('access_log', [
      { id: uid('al'), name: 'Elşən Nəbiyev', action: 'giriş', time: '2026-07-27T07:02:00', method: 'QR' },
      { id: uid('al'), name: 'Toğrul Əliyev', action: 'giriş', time: '2026-07-27T07:08:00', method: 'QR' },
    ]);

    set('hr_leave', [
      { id: uid('hl'), name: 'Elşən Nəbiyev', type: 'İllik Məzuniyyət', from: '2026-08-10', to: '2026-08-17', status: 'təsdiqlənib' },
    ]);

    set('payroll', [
      { id: uid('pr2'), name: 'Elşən Nəbiyev', base: 1400, overtimeHrs: 12, overtimeRate: 8, deductions: 140 },
      { id: uid('pr2'), name: 'Toğrul Əliyev', base: 1250, overtimeHrs: 6, overtimeRate: 7.5, deductions: 125 },
    ]);

    set('drawings_register', [
      { id: uid('dr'), code: 'ARC-A-101', title: 'Zirzəmi Planı', discipline: 'Memarlıq', revision: 'C', status: 'təsdiqlənib' },
      { id: uid('dr'), code: 'STR-S-205', title: 'Sütun Bağlama Sxemi', discipline: 'Konstruksiya', revision: 'B', status: 'baxışda' },
    ]);

    set('rfis', [
      { id: uid('rf'), subject: 'Balkon relinq detalı', project: 'Port Baku Residence Tower B', priority: 'yüksək', status: 'açıq', due: '2026-08-02' },
    ]);

    set('submittals', [
      { id: uid('sb'), item: 'Alüminium fasad profili', type: 'Material Submittal', status: 'baxışda' },
    ]);

    set('method_statements', [
      { id: uid('mst'), title: 'Beton Tökmə Metod Bəyanatı', discipline: 'Struktur', status: 'qaralama' },
    ]);

    set('inspections', [
      { id: uid('in'), title: 'Təməl armatur yoxlaması', project: 'Port Baku Residence Tower B', date: '2026-07-24', result: 'keçdi' },
    ]);

    set('documents_center', [
      { id: uid('doc'), name: 'Layihə Xülasəsi.pdf', category: 'Ümumi', project: 'Port Baku Residence Tower B', date: '2026-07-10' },
    ]);

    set('finance_payments', [
      { id: uid('fp'), project: 'Port Baku Residence Tower B', type: 'xərc', desc: 'Beton təchizatı ödənişi', amount: 145000, date: '2026-07-05', status: 'ödənilib' },
      { id: uid('fp'), project: 'Port Baku Residence Tower B', type: 'gəlir', desc: 'Sifarişçi mərhələ ödənişi #4', amount: 620000, date: '2026-07-15', status: 'ödənilib' },
      { id: uid('fp'), project: 'Sumqayıt Sənaye Zavodu', type: 'xərc', desc: 'Mexaniki avadanlıq alışı', amount: 310000, date: '2026-07-20', status: 'gözlənilir' },
      { id: uid('fp'), project: 'Gəncə Yol Qovşağı', type: 'gəlir', desc: 'Avans ödəniş', amount: 420000, date: '2026-01-15', status: 'ödənilib' },
    ]);

    set('workflow_templates', [
      { id: uid('wt'), name: 'İşçi Qəbulu (Worker Onboarding)', company: 'Baku Steel Construction MMC',
        steps: [
          { id: uid('st'), name: 'HR Qeydiyyatı', role: 'HR' },
          { id: uid('st'), name: 'Tibbi Müayinə', role: 'Tibb Məntəqəsi' },
          { id: uid('st'), name: 'HSE Təlimi', role: 'HSE' },
          { id: uid('st'), name: 'Düşərgə Təsdiqi', role: 'Camp Management' },
          { id: uid('st'), name: 'ID Kart', role: 'HR' },
          { id: uid('st'), name: 'Qapı Girişi', role: 'Security' },
        ] },
      { id: uid('wt'), name: 'Material Təsdiqi', company: 'Caspian Development Group',
        steps: [
          { id: uid('st'), name: 'Sorğu Yaradılması', role: 'Texniki Ofis' },
          { id: uid('st'), name: 'Konsultant Baxışı', role: 'Konsultant' },
          { id: uid('st'), name: 'Satınalma Təsdiqi', role: 'Procurement' },
          { id: uid('st'), name: 'Təchizat', role: 'Warehouse' },
        ] },
      { id: uid('wt'), name: 'Faktura Təsdiqi (Invoice Approval)', company: 'Caspian Development Group',
        steps: [
          { id: uid('st'), name: 'Təqdim Edildi', role: 'Podratçı' },
          { id: uid('st'), name: 'Miqdar Yoxlaması', role: 'Texniki Ofis' },
          { id: uid('st'), name: 'Maliyyə Təsdiqi', role: 'Finance' },
          { id: uid('st'), name: 'Ödəniş', role: 'Finance' },
        ] },
    ]);

    set('workflow_instances', [
      { id: uid('wi'), templateId: null, templateName: 'İşçi Qəbulu (Worker Onboarding)', title: 'Elvin Məmmədov — Betoncu', project: 'Port Baku Residence Tower B',
        steps: ['HR Qeydiyyatı','Tibbi Müayinə','HSE Təlimi','Düşərgə Təsdiqi','ID Kart','Qapı Girişi'],
        currentStep: 2, status: 'davam edir',
        history: [
          { step: 'HR Qeydiyyatı', action: 'tamamlandı', by: 'HR Şöbəsi', date: '2026-07-20T09:00:00' },
          { step: 'Tibbi Müayinə', action: 'tamamlandı', by: 'Tibb Məntəqəsi', date: '2026-07-21T11:00:00' },
        ] },
    ]);

    set('activity_log', [
      { id: uid('ac'), text: 'Layihə yaradıldı: Port Baku Residence Tower B', icon: '🏗️', ts: '2026-07-01T08:00:00' },
      { id: uid('ac'), text: 'HSE qeydi əlavə olundu: Near Miss', icon: '🦺', ts: '2026-07-14T10:00:00' },
    ]);

    set('dept_feed', [
      { id: uid('df'), dept: 'HSE', author: 'HSE Meneceri', text: 'Sabahdan bütün sahədə hündürlükdə iş üçün əlavə təhlükəsizlik kəməri tələb olunur.', date: '2026-07-26T08:30:00' },
      { id: uid('df'), dept: 'Planlama', author: 'Baş Planlaşdırıcı', text: 'Blok B üçün beton tökmə cədvəli 2 gün irəli çəkildi.', date: '2026-07-25T14:10:00' },
    ]);

    set('seeded', true);
  }

  return { get, set, uid, seedOnce };
})();

DB.seedOnce();
