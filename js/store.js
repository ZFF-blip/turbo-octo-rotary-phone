/* ============================================================
 * store.js — 个人工作台 本地数据层（localStorage）
 * 集合：records / habits / goals / moods / projects / water / profile
 * ============================================================ */
(function () {
  'use strict';
  const KEY = 'pwb_state_v3';
  const WEATHER_CITY_KEY = 'pwb_weather_city';

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) return normalize(JSON.parse(raw));
    } catch (e) { /* ignore */ }
    return normalize({});
  }
  function normalize(s) {
    s = s || {};
    return {
      records: Array.isArray(s.records) ? s.records : [],
      habits: Array.isArray(s.habits) ? s.habits : [],
      goals: Array.isArray(s.goals) ? s.goals : [],
      moods: Array.isArray(s.moods) ? s.moods : [],
      projects: Array.isArray(s.projects) ? s.projects : [],
      water: Array.isArray(s.water) ? s.water : [],
      profile: s.profile && typeof s.profile === 'object' ? s.profile : {},
      learning: Array.isArray(s.learning) ? s.learning : []
    };
  }
  let state = load();
  function save() { localStorage.setItem(KEY, JSON.stringify(state)); }
  function uid(p) { return (p || 'r') + Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }

  const Util = {
    today() { return this.key(new Date()); },
    key(d) {
      const x = new Date(d);
      const p = n => String(n).padStart(2, '0');
      return x.getFullYear() + '-' + p(x.getMonth() + 1) + '-' + p(x.getDate());
    },
    pad(n) { return String(n).padStart(2, '0'); },
    // 一周起始（周一）
    weekStart(d) {
      const x = new Date(d); x.setHours(0, 0, 0, 0);
      const day = (x.getDay() + 6) % 7;
      x.setDate(x.getDate() - day);
      return x;
    },
    // 某日所属周一 ~ 周日 的 [起,止]（含当天）
    weekRange(d) {
      const s = this.weekStart(d);
      const e = new Date(s); e.setDate(s.getDate() + 6);
      return [this.key(s), this.key(e)];
    },
    monthRange(d) {
      const x = new Date(d);
      const s = new Date(x.getFullYear(), x.getMonth(), 1);
      const e = new Date(x.getFullYear(), x.getMonth() + 1, 0);
      return [this.key(s), this.key(e)];
    },
    quarterRange(d) {
      const x = new Date(d);
      const q = Math.floor(x.getMonth() / 3);
      const s = new Date(x.getFullYear(), q * 3, 1);
      const e = new Date(x.getFullYear(), q * 3 + 3, 0);
      return [this.key(s), this.key(e)];
    },
    inRange(dateStr, a, b) { return dateStr >= a && dateStr <= b; },
    daysBetween(a, b) {
      const d1 = new Date(a), d2 = new Date(b);
      return Math.round((d2 - d1) / 86400000);
    },
    // 一年中的第几天（用于每日确定性轮播）
    dayOfYear(d) {
      const x = new Date(d);
      const start = new Date(x.getFullYear(), 0, 0);
      return Math.floor((x - start) / 86400000);
    },
    escape(s) {
      return String(s == null ? '' : s).replace(/[&<>"']/g, c => (
        { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
      ));
    },
    fmtDate(d) {
      const x = new Date(d);
      return (x.getMonth() + 1) + '月' + x.getDate() + '日';
    }
  };

  const Store = {
    /* ---------- 通用记录 records ---------- */
    records() { return state.records; },
    all() { return state.records; },
    add(rec) {
      const base = {
        id: uid(), tab: 'work', sub: '', title: '', note: '',
        status: 'todo', priority: 'mid', due: '', project: '', tag: '',
        important: false, urgent: false,
        createdAt: Date.now(), updatedAt: Date.now(), extra: {}
      };
      const r = Object.assign(base, rec);
      if (!r.extra) r.extra = {};
      state.records.push(r); save(); return r;
    },
    update(id, patch) {
      const i = state.records.findIndex(r => r.id === id);
      if (i === -1) return null;
      state.records[i] = Object.assign({}, state.records[i], patch, { updatedAt: Date.now() });
      save(); return state.records[i];
    },
    remove(id) {
      const before = state.records.length;
      state.records = state.records.filter(r => r.id !== id);
      save(); return before - state.records.length;
    },
    replaceAll(arr) { state.records = arr || []; save(); },
    clearAll() { state.records = []; save(); },
    byTab(tab) { return state.records.filter(r => r.tab === tab); },
    byId(id) { return state.records.find(r => r.id === id) || null; },

    /* ---------- 习惯 habits ---------- */
    habits() { return state.habits; },
    habitById(id) { return state.habits.find(h => h.id === id) || null; },
    addHabit(h) {
      const rec = Object.assign({
        id: uid('h'), name: '新习惯', emoji: '✅', color: '#4f46e5',
        log: {}, createdAt: Date.now()
      }, h);
      if (!rec.log) rec.log = {};
      state.habits.push(rec); save(); return rec;
    },
    updateHabit(id, patch) {
      const i = state.habits.findIndex(h => h.id === id);
      if (i === -1) return null;
      state.habits[i] = Object.assign({}, state.habits[i], patch);
      save(); return state.habits[i];
    },
    removeHabit(id) {
      state.habits = state.habits.filter(h => h.id !== id); save();
    },
    toggleHabit(id, date) {
      const h = this.habitById(id); if (!h) return;
      if (h.log[date]) delete h.log[date];
      else h.log[date] = { at: Date.now() };
      save();
    },
    habitChecked(id, date) {
      const h = this.habitById(id); return !!(h && h.log[date]);
    },
    habitStreak(id) {
      const h = this.habitById(id); if (!h) return 0;
      let n = 0; const d = new Date();
      while (h.log[Util.key(d)]) { n++; d.setDate(d.getDate() - 1); }
      return n;
    },
    habitRate(id, days) {
      const h = this.habitById(id); if (!h) return 0;
      const today = new Date(); let c = 0;
      for (let i = 0; i < days; i++) {
        const d = new Date(today); d.setDate(d.getDate() - i);
        if (h.log[Util.key(d)]) c++;
      }
      return Math.round(c / days * 100);
    },
    habitHeatmap(id, weeks) {
      const h = this.habitById(id); if (!h) return [];
      const res = []; const today = new Date();
      // 对齐到周日结尾
      const end = new Date(today);
      const offset = end.getDay();
      end.setDate(end.getDate() + (6 - offset));
      for (let w = weeks - 1; w >= 0; w--) {
        const col = [];
        for (let i = 0; i < 7; i++) {
          const d = new Date(end); d.setDate(end.getDate() - (w * 7 + (6 - i)));
          const k = Util.key(d);
          col.push({ date: k, checked: !!h.log[k], future: d > today });
        }
        res.push(col);
      }
      return res;
    },

    /* ---------- 目标 goals ---------- */
    goals() { return state.goals; },
    goalById(id) { return state.goals.find(g => g.id === id) || null; },
    addGoal(g) {
      const rec = Object.assign({
        id: uid('g'), title: '新目标', target: 100, current: 0, unit: '',
        deadline: '', color: '#10b981', createdAt: Date.now()
      }, g);
      state.goals.push(rec); save(); return rec;
    },
    updateGoal(id, patch) {
      const i = state.goals.findIndex(g => g.id === id);
      if (i === -1) return null;
      state.goals[i] = Object.assign({}, state.goals[i], patch);
      save(); return state.goals[i];
    },
    removeGoal(id) { state.goals = state.goals.filter(g => g.id !== id); save(); },
    addGoalProgress(id, delta) {
      const g = this.goalById(id); if (!g) return 0;
      g.current = Math.max(0, Math.min(g.target, (+g.current || 0) + (+delta || 0)));
      save(); return g.current;
    },

    /* ---------- 心情 moods ---------- */
    moods() { return state.moods; },
    getMood(date) { return state.moods.find(m => m.date === date) || null; },
    setMood(m) {
      const i = state.moods.findIndex(x => x.date === m.date);
      const rec = Object.assign({ date: Util.today(), mood: 3, emoji: '😐', note: '' }, m);
      if (i === -1) state.moods.push(rec); else state.moods[i] = rec;
      save(); return rec;
    },
    moodTrend(n) {
      const out = [], today = new Date();
      for (let i = n - 1; i >= 0; i--) {
        const d = new Date(today); d.setDate(d.getDate() - i);
        const k = Util.key(d);
        const m = this.getMood(k);
        out.push({ date: k, mood: m ? m.mood : null, emoji: m ? m.emoji : '' });
      }
      return out;
    },

    /* ---------- 项目 projects ---------- */
    projects() { return state.projects; },
    projectById(id) { return state.projects.find(p => p.id === id) || null; },
    addProject(p) {
      const rec = Object.assign({
        id: uid('p'), name: '新项目', color: '#6366f1', desc: '',
        status: 'active', createdAt: Date.now(), updatedAt: Date.now()
      }, p);
      state.projects.push(rec); save(); return rec;
    },
    updateProject(id, patch) {
      const i = state.projects.findIndex(p => p.id === id);
      if (i === -1) return null;
      state.projects[i] = Object.assign({}, state.projects[i], patch, { updatedAt: Date.now() });
      save(); return state.projects[i];
    },
    removeProject(id) {
      state.projects = state.projects.filter(p => p.id !== id);
      // 解绑记录里的 project
      state.records.forEach(r => { if (r.project === id) r.project = ''; });
      save();
    },
    // 项目进度：有任务则按完成率，否则用存储 progress
    projectProgress(id) {
      const tasks = state.records.filter(r => r.tab === 'work' && r.project === id);
      if (!tasks.length) return 0;
      const done = tasks.filter(r => r.status === 'done').length;
      return Math.round(done / tasks.length * 100);
    },

    /* ---------- 饮水 water ---------- */
    water() { return state.water; },
    getWater(date) {
      const w = state.water.find(x => x.date === date);
      return w ? w.ml : 0;
    },
    addWater(date, ml) {
      const i = state.water.findIndex(x => x.date === date);
      if (i === -1) state.water.push({ date, ml: ml, updatedAt: Date.now() });
      else { state.water[i].ml += ml; state.water[i].updatedAt = Date.now(); }
      save();
    },
    setWater(date, ml) {
      const i = state.water.findIndex(x => x.date === date);
      if (i === -1) state.water.push({ date, ml, updatedAt: Date.now() });
      else { state.water[i].ml = ml; state.water[i].updatedAt = Date.now(); }
      save();
    },

    /* ---------- 个人档案 profile / 营养 ---------- */
    getProfile() { return state.profile || {}; },
    setProfile(p) { state.profile = Object.assign({}, state.profile, p); save(); return state.profile; },
    computeNutrition(profile) {
      const p = Object.assign({ gender: 'male', height: 170, weight: 65, age: 30, activity: 1.55 }, profile || {});
      const w = +p.weight || 0, h = +p.height || 0, age = +p.age || 0, act = +p.activity || 1.55;
      if (!w || !h) return null;
      const bmr = p.gender === 'female'
        ? (10 * w + 6.25 * h - 5 * age - 161)
        : (10 * w + 6.25 * h - 5 * age + 5);
      const tdee = bmr * act;
      const target = Math.max(1200, Math.round(tdee - 500)); // 减脂：赤字 500
      const protein = Math.round(w * 1.8);          // g
      const fatKcal = tdee * 0.25, fat = Math.round(fatKcal / 9); // g
      const carbKcal = target - protein * 4 - fatKcal;
      const carb = Math.max(0, Math.round(carbKcal / 4)); // g
      return {
        bmr: Math.round(bmr), tdee: Math.round(tdee), target,
        protein, fat, carb,
        fiber: 25, water: 2500
      };
    },

    /* ---------- 学习打卡 learning（每日知识/心理卡） ---------- */
    learning() { return state.learning; },
    getLearning(date) { return state.learning.find(x => x.date === date) || null; },
    isLearned(date, key) { const l = this.getLearning(date); return !!(l && l.ids.indexOf(key) >= 0); },
    toggleLearned(date, key) {
      let l = this.getLearning(date);
      if (!l) { l = { date, ids: [] }; state.learning.push(l); }
      const i = l.ids.indexOf(key);
      let nowLearned;
      if (i >= 0) { l.ids.splice(i, 1); nowLearned = false; }
      else { l.ids.push(key); nowLearned = true; }
      save(); return nowLearned;
    },
    // 连续学习天数（从今天往前，任一天有打卡即计）
    learningStreak() {
      let n = 0; const d = new Date();
      while (true) {
        const l = this.getLearning(Util.key(d));
        if (l && l.ids.length) { n++; d.setDate(d.getDate() - 1); }
        else break;
      }
      return n;
    },
    // 累计学习过的不同卡片数
    learningTotal() {
      const set = new Set();
      state.learning.forEach(l => (l.ids || []).forEach(id => set.add(id)));
      return set.size;
    },

    /* ---------- 全量状态 / 同步 / 导入导出 ---------- */
    fullState() {
      return JSON.parse(JSON.stringify({
        records: state.records, habits: state.habits, goals: state.goals,
        moods: state.moods, projects: state.projects, water: state.water,
        profile: state.profile, learning: state.learning
      }));
    },
    loadState(s) {
      if (!s || typeof s !== 'object') return;
      const n = normalize(s);
      state.records = n.records; state.habits = n.habits; state.goals = n.goals;
      state.moods = n.moods; state.projects = n.projects; state.water = n.water;
      state.profile = n.profile; state.learning = n.learning; save();
    },
    exportJSON() { return JSON.stringify(this.fullState(), null, 2); },
    importJSON(str) {
      const data = JSON.parse(str);
      if (!data || typeof data !== 'object') throw new Error('格式错误');
      let count = 0;
      if (Array.isArray(data.records)) { state.records = data.records; count += data.records.length; }
      if (Array.isArray(data.habits)) state.habits = data.habits;
      if (Array.isArray(data.goals)) state.goals = data.goals;
      if (Array.isArray(data.moods)) state.moods = data.moods;
      if (Array.isArray(data.projects)) state.projects = data.projects;
      if (Array.isArray(data.water)) state.water = data.water;
      if (data.profile) state.profile = data.profile;
      if (Array.isArray(data.learning)) state.learning = data.learning;
      save(); return count;
    },

    /* ---------- 天气城市 ---------- */
    getWeatherCity() { try { return localStorage.getItem(WEATHER_CITY_KEY) || '北京'; } catch (e) { return '北京'; } },
    setWeatherCity(c) { try { localStorage.setItem(WEATHER_CITY_KEY, c); } catch (e) {} }
  };

  // 暴露到全局
  if (typeof window !== 'undefined') {
    window.Store = Store;
    window.Util = Util;
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Store, Util };
  }
})();
