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

    set('seeded', true);
  }

  return { get, set, uid, seedOnce };
})();

DB.seedOnce();
