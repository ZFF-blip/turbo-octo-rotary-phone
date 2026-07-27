/* ============================================================
 * 个人工作台 - 多端同步客户端
 * 通过一台可访问的同步服务器（sync-server.js）在手机/电脑间同步。
 * 配置：服务器地址 + 房间密钥（两端填相同即可共享同一份数据）。
 * ============================================================ */
(function () {
  'use strict';
  const KEY = 'pwb_sync_v1';
  let cfg = load();
  let timer = null, busy = false;

  function load() {
    try { return Object.assign({ enabled: false, url: '', room: '' }, JSON.parse(localStorage.getItem(KEY)) || {}); }
    catch (e) { return { enabled: false, url: '', room: '' }; }
  }
  function save() { localStorage.setItem(KEY, JSON.stringify(cfg)); }

  function statusEl() { return document.getElementById('syncStatusText'); }
  function setStatus(s) { const el = statusEl(); if (el) el.textContent = s; }

  function buildUrl() {
    const base = (cfg.url || '').replace(/\/+$/, '');
    return base + '/?room=' + encodeURIComponent(cfg.room);
  }

  async function pull() {
    if (!cfg.enabled || !cfg.url || !cfg.room) return null;
    if (busy) return null;
    busy = true; setStatus('同步中…');
    try {
      const res = await fetch(buildUrl(), { cache: 'no-store' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const remote = await res.json();
      const changed = merge(remote);
      setStatus('已同步 · ' + time());
      if (changed && window.__render) window.__render();
      return remote;
    } catch (e) {
      setStatus('同步失败：' + e.message);
      return null;
    } finally { busy = false; }
  }

  async function push() {
    if (!cfg.enabled || !cfg.url || !cfg.room) return;
    if (busy) { return; }
    busy = true; setStatus('同步中…');
    try {
      const payload = Store.fullState();
      const res = await fetch(buildUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      setStatus('已同步 · ' + time());
    } catch (e) {
      setStatus('同步失败：' + e.message);
    } finally { busy = false; }
  }

  // 按 id/date 合并每个集合，冲突时保留 updatedAt/createdAt 较新者
  function merge(remote) {
    if (!remote || typeof remote !== 'object') return false;
    const merged = {
      records: mergeArr(remote.records, Store.records(), 'id'),
      habits: mergeArr(remote.habits, Store.habits(), 'id'),
      goals: mergeArr(remote.goals, Store.goals(), 'id'),
      moods: mergeArr(remote.moods, Store.moods(), 'date'),
      projects: mergeArr(remote.projects, Store.projects(), 'id'),
      water: mergeArr(remote.water, Store.water(), 'date'),
      learning: mergeArr(remote.learning, Store.learning(), 'date')
    };
    const changed = merged.records.changed || merged.habits.changed ||
                    merged.goals.changed || merged.moods.changed ||
                    merged.projects.changed || merged.water.changed ||
                    merged.learning.changed;
    if (changed) Store.loadState({
      records: merged.records.arr, habits: merged.habits.arr,
      goals: merged.goals.arr, moods: merged.moods.arr,
      projects: merged.projects.arr, water: merged.water.arr,
      profile: remote.profile || Store.getProfile(),
      learning: merged.learning.arr
    });
    return changed;
  }
  function mergeArr(remoteArr, localArr, idKey) {
    if (!Array.isArray(remoteArr)) return { arr: localArr, changed: false };
    const map = new Map(localArr.map(r => [r[idKey], r]));
    let changed = false;
    remoteArr.forEach(r => {
      if (!r || !r[idKey]) return;
      const cur = map.get(r[idKey]);
      if (!cur) { map.set(r[idKey], r); changed = true; }
      else {
        const rt = r.updatedAt || r.createdAt || 0;
        const ct = cur.updatedAt || cur.createdAt || 0;
        if (rt > ct) { map.set(r[idKey], r); changed = true; }
      }
    });
    return { arr: Array.from(map.values()), changed };
  }

  function time() {
    const d = new Date();
    const p = n => String(n).padStart(2, '0');
    return `${p(d.getHours())}:${p(d.getMinutes())}`;
  }

  function startTimer() {
    if (timer) { clearInterval(timer); timer = null; }
    if (cfg.enabled) timer = setInterval(() => pull(), 30000);
  }

  function init() {
    if (cfg.enabled) {
      pull();
      startTimer();
    }
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && cfg.enabled) pull();
    });
  }

  window.Sync = {
    get cfg() { return cfg; },
    save, pull, push, init, startTimer, setStatus,
    update(patch) {
      Object.assign(cfg, patch); save(); startTimer();
      if (cfg.enabled) pull();
    }
  };
})();
