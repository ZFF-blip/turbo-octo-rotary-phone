/* ============================================================
 * app.js — 个人工作台 交互逻辑
 * 模块：首页(天气) / 工作(四象限·项目·今日·周报·看板·动态)
 *       / 生活(减脂计划·饮水·饮食·运动)
 *       / 学习(知识卡片·心理探秘·技能视频站)
 *       / 财务(便捷记账) / 复盘(每日·自动报告)
 * ============================================================ */
(function () {
  'use strict';
  const S = window.Store, U = window.Util;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));

  /* ---------- 分类元数据 ---------- */
  const WORK_SUB = ['党建', '宣传', '法务'];
  const LIFE_SUB = ['饮食', '运动'];
  const STUDY_SUB = ['知识', '技能', '心理'];
  const FIN_FLOW = ['收入', '支出'];
  const FIN_CAT_IN = ['工资', '兼职', '理财', '红包', '其他'];
  const FIN_CAT_OUT = ['餐饮', '交通', '购物', '居住', '娱乐', '医疗', '学习', '其他'];
  const STATUS = { todo: '待办', doing: '进行中', done: '已完成' };
  const STATUS_COLOR = { todo: '#9ca3af', doing: '#f59e0b', done: '#10b981' };

  /* ---------- 知识卡片内容 ---------- */
  const KNOWLEDGE = {
    '法律': [
      { t: '数据权益司法保护新规则', b: '最高法第47批指导案例（262–267号，2025）确立：对数据集合实质性投入形成的经营性利益按"谁投入、谁贡献、谁受益"保护；未经许可抓取搬运他人数据集合可构成不正当竞争（262号）；经用户授权在合理范围转移关联账号数据则不构成（263号）。' },
      { t: '反不正当竞争法"数据专条"', b: '修订后《反不正当竞争法》第13条第3款自2025年10月15日施行，首次对侵害数据权益的不正当竞争行为作专门规定。此后数据抓取、屏蔽等行为应依该条认定，而非泛用其他条款。' },
      { t: '新《公司法》董事责任与信义义务', b: '重构董事责任体系：在资本核查、财务资助、关联交易等场景中明确信义义务与责任边界。实控人、董监高责任持续加重，中介机构"看门人"义务强化，倒逼企业建立全链条风险防控。' },
      { t: '企业合同风控三要点', b: '①签约前查主体资格与信用（国家企业信用信息公示系统）；②核心条款避免"大概/左右"等模糊表述；③留存交货、验收、对账单等证据，质量异议须在约定期内提出并固定样品，否则可能败诉。' },
      { t: '数据产权分置与交易合同', b: '数据持有权是使用权、经营权的基础，来源合法性关乎整条交易合规。数据流通交易示范文本将"核查数据来源"列为首要环节，并多维度设定质量标准（规范性/完整性/准确性/一致性/时效性/可访问性）。' },
      { t: '个人信息保护"必需"边界', b: '指导案例265/266号细化"告知—同意"规则：收集画像信息非提供服务所必需的，且未提供不同意后的替代登录方式，即侵害权益；"先享后付"为评估信用所必需且已告知、给选择的，不构成侵害。' },
      { t: '算法治理合规义务', b: '算法推荐、深度合成须履行备案、告知与透明度义务；应建立算法风险防范、安全运行、监督检查机制与应急处置，避免"大数据杀熟"等合规风险。' },
      { t: '平台账号交付与执行', b: '指导案例267号明确：交付账号密码应同时依法变更实名认证信息；被执行人未履责的，申请执行人可申请法院向平台发协助执行通知书，完成实名信息变更，实质性维护胜诉权益。' }
    ],
    '宣传': [
      { t: '5W1H 选题法', b: 'Who（对象）/ What（内容）/ When（时机）/ Where（渠道）/ Why（目的）/ How（形式），逐一拆解再动笔。' },
      { t: '标题公式', b: '数字 + 痛点 + 利益，例如「3个方法让活动阅读量翻倍」，比平铺直叙更易点击。' },
      { t: '传播漏斗', b: '曝光 → 兴趣 → 信任 → 行动，逐层转化。每一层都要设计对应的钩子与行动指令。' },
      { t: '黄金三秒', b: '封面决定点击，开头3秒决定留存。把最重要信息前置，避免铺垫过长。' },
      { t: '舆情应对', b: '快讲事实、慎讲结论、统一口径、持续跟进。先回应情绪再回应事实，避免对抗。' },
      { t: '讲故事框架', b: '背景—冲突—转折—结局。人在故事里更易共情，干巴巴的数据不如一个真实案例打动人。' },
      { t: '金句提炼', b: '把长道理压成一句可复述的话，例如"与其更好，不如不同"。金句提升传播与记忆度。' }
    ],
    '公文写作': [
      { t: '公文"做眼"之功', b: '好公文贵在"文眼"。鼓动型要气势昂扬（如毛泽东政协开幕词"让反动派在我们面前发抖罢"）；点拨型要推心置腹、藏真性情；警醒型要旗帜鲜明、必要时猛击一掌。把一般的话变成有冲击力的话，是硬功夫。' },
      { t: '十大排比金句公式', b: '气势胜于文采。不字诀（不畏…不惧…不负…）、更字诀（更明确/更有力/更显著）、从…到…、坚持体、以…为…、数字体、在…上发力、没有…只有…、要字令——按场景套用，材料瞬间提格。' },
      { t: '金句赏析·治国', b: '"不谋全局者，不足以谋一域"——想做好局部须从全局出发；"立善法于天下，则天下治；立善法于一国，则一国治"——越是强调法治，越要提高立法质量。' },
      { t: '金句赏析·修身', b: '"才者，德之资也；德者，才之帅也"——德为才之统帅；"大事难事看担当，顺境逆境看襟度"——识人看担当与胸襟；"鱼因馋而上钩，权因欲而失守"——慎用手中权力。' },
      { t: '经典句式（一）', b: '"以XX为契机，推动XX再上新台阶"；"只有…，才能…"（强调意义）；"把…作为…的关键一招"。这三式常用于部署与总结，结构稳、气势足。' },
      { t: '经典句式（二）', b: '"在…上迈出实质性步伐"；"绝不允许借…之名，行…之实"；"干出了…，干出了…，干出了…"（成绩排比）。句式是骨架，填实内容才立得住。' },
      { t: '名章探讨·毛泽东名句', b: '"星星之火，可以燎原""枪杆子里面出政权"——切中肯綮、令人醍醐灌顶的"金句"方能长久回响。金句不是抖机灵，而是深研究后的探骊得珠；写作须回归真调研。' },
      { t: '开门见山与精简取舍', b: '浙江宣传："不求通篇皆锦绣，但愿几句入人心。"落笔前先定核心问题与主要信息，避免累赘；精简不等于一味求短，要像庄子所言"凫胫虽短，续之则忧"。' }
    ]
  };
  const MIND = [
    { t: '首因效应', b: '第一印象会锚定后续判断。重要场合（面试、汇报）要精心设计开场与仪表。' },
    { t: '近因效应', b: '最近接收的信息记忆更牢。沟通结尾要重申重点，留下好印象。' },
    { t: '破窗效应', b: '环境中的小失序若不及时纠正，会诱发更大的失序。及时修补"第一扇破窗"。' },
    { t: '自我决定论', b: '自主、胜任、归属是人类三大内在动机来源。安排任务时多给选择权与反馈。' },
    { t: '情绪粒度', b: '能细分情绪（恼火/失望/委屈）的人，比只说"不开心"的人更易调节情绪。' },
    { t: '延迟满足', b: '棉花糖实验中能等待的孩子长期表现更好，但前提是环境安全、信任可靠。' },
    { t: '认知重构', b: '情绪来自对事件的解释而非事件本身。把"我完了"换成"这是个挑战"，感受会不同。' },
    { t: '峰终定律', b: '人对体验的记忆由"高峰"和"结尾"决定，而非平均。结束一次对话或活动，留一个好收尾。' },
    { t: '斯坦福棉花糖实验再解读', b: '后续研究发现：能否延迟满足更多取决于"是否相信承诺会兑现"，而非单纯意志力。信任环境很关键。' },
    { t: '聚光灯效应', b: '我们常以为别人都在盯着自己的失误，其实他人注意远比想象少。放轻松，没那么多人看。' }
  ];
  const SKILL_SITES = {
    '视频剪辑': [
      { n: 'B站·剪辑教程合集', u: 'https://search.bilibili.com/all?keyword=视频剪辑教程', d: '海量免费剪辑入门到进阶' },
      { n: '影视飓风', u: 'https://space.bilibili.com/250520432', d: '专业拍摄与剪辑思路' },
      { n: '剪映官方教程', u: 'https://search.bilibili.com/all?keyword=剪映教程', d: '手机剪辑最快上手' }
    ],
    'P图': [
      { n: 'B站·Photoshop教程', u: 'https://search.bilibili.com/all?keyword=Photoshop教程', d: '从抠图到调色系统课' },
      { n: '李涛PS教程', u: 'https://search.bilibili.com/all?keyword=李涛PS教程', d: '理解图层与色彩原理' },
      { n: '站酷 ZCOOL', u: 'https://www.zcool.com.cn', d: '设计灵感与素材社区' }
    ],
    '编程': [
      { n: '菜鸟教程', u: 'https://www.runoob.com', d: '多语言速查与示例' },
      { n: 'MDN 中文', u: 'https://developer.mozilla.org/zh-CN/', d: 'Web 技术权威文档' },
      { n: 'freeCodeCamp 中文', u: 'https://www.freecodecamp.org/chinese/', d: '项目式免费学编程' },
      { n: 'LeetCode 力扣', u: 'https://leetcode.cn', d: '算法与面试刷题' },
      { n: 'B站·黑马程序员', u: 'https://search.bilibili.com/all?keyword=黑马程序员', d: '体系化实战课程' }
    ]
  };

  /* ---------- 每日知识轮播（确定性：同一天所有设备一致） ---------- */
  const FLAT_KNOWLEDGE = (() => {
    const out = [];
    Object.keys(KNOWLEDGE).forEach(cat => KNOWLEDGE[cat].forEach(c => out.push({ cat, card: c })));
    return out;
  })();
  function dailyCards() {
    const doy = U.dayOfYear(new Date());
    const ki = ((doy % FLAT_KNOWLEDGE.length) + FLAT_KNOWLEDGE.length) % FLAT_KNOWLEDGE.length;
    const mi = ((doy + 3) % MIND.length + MIND.length) % MIND.length; // 偏移，避免与知识卡同日节律相同
    return {
      k: FLAT_KNOWLEDGE[ki], kKey: 'K' + ki,
      m: MIND[mi], mKey: 'M' + mi
    };
  }

  /* ---------- RSS 自动资讯（零 token，带静态兜底） ---------- */
  // 免重部署：直接读 GitHub 公开仓库的 raw feeds.json（Actions 每天 06:00 自动刷新）
  const FEEDS_URL = (window.FEEDS_URL || 'https://raw.githubusercontent.com/ZFF-blip/turbo-octo-rotary-phone/main/feeds.json');
  let _feeds = { day: null, data: null, inflight: null };
  function esc(s) {
    return (s == null ? '' : String(s)).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  }
  function loadFeeds() {
    const day = U.today();
    if (_feeds.day === day && _feeds.data) return Promise.resolve(_feeds.data);
    if (_feeds.inflight) return _feeds.inflight;
    const grab = (url) => fetch(url + (/\?/.test(url) ? '&' : '?') + 't=' + Date.now())
      .then(r => r.ok ? r.json() : null)
      .catch(() => null);
    const remote = FEEDS_URL && FEEDS_URL !== 'feeds.json';
    // 远程（GitHub raw 等）抓取失败 → 回退到本地部署的 feeds.json，避免空白
    _feeds.inflight = grab(FEEDS_URL)
      .then(d => (d && d.categories) ? d : (remote ? grab('feeds.json') : null))
      .then(d => { _feeds.day = day; _feeds.data = d; _feeds.inflight = null; return d; });
    return _feeds.inflight;
  }
  function rssItemsHTML(items, limit) {
    if (!items || !items.length) return '<div class="empty">今日 RSS 源暂无更新，已用内置知识卡兜底</div>';
    return items.slice(0, limit).map(it => `
      <a class="rss-item" href="${esc(it.link)}" target="_blank" rel="noopener">
        <span class="rss-item__t">${esc(it.title)}</span>
        <span class="rss-item__meta">${esc(it.source || 'RSS')} · ${it.date ? U.fmtDate(new Date(it.date)) : ''}</span>
      </a>`).join('');
  }

  /* ---------- 全局状态 ---------- */
  const state = {
    tab: 'home',
    sub: { work: 'overview', life: 'diet', study: 'knowledge' },
    filter: {},
    form: null
  };
  let lastViewKey = ''; // 仅当 tab/sub 变化时才把滚动条复位到顶部，避免操作后页面跳动

  /* ============================================================
   * 工具：提示 / 弹窗 / 表单
   * ============================================================ */
  let toastTimer = null;
  function toast(msg) {
    const el = $('#toast'); el.textContent = msg; el.hidden = false;
    clearTimeout(toastTimer); toastTimer = setTimeout(() => { el.hidden = true; }, 1800);
  }
  function openModal(title, html) {
    $('#modalTitle').textContent = title; $('#modalBody').innerHTML = html;
    $('#modal').hidden = false;
  }
  function closeModal() { $('#modal').hidden = true; $('#modalBody').innerHTML = ''; }
  function openSheet() { $('#sheet').hidden = false; }
  function closeSheet() { $('#sheet').hidden = true; state.form = null; }

  /* ============================================================
   * 渲染入口
   * ============================================================ */
  function render() {
    // 更新底部高亮
    $$('.tabbar__item').forEach(b => b.classList.toggle('is-active', b.dataset.tab === state.tab));
    const sub = state.sub[state.tab] || '';
    let html = '';
    try {
      switch (state.tab) {
        case 'home': html = viewHome(); break;
        case 'work': html = viewWork(sub); break;
        case 'life': html = viewLife(sub); break;
        case 'study': html = viewStudy(sub); break;
        case 'side': html = viewFinance(); break;
        case 'review': html = viewReview(sub); break;
        default: html = viewHome();
      }
    } catch (err) {
      console.error('[render] 视图渲染出错：', err);
      html = `<div style="padding:24px;margin:12px;border:1px solid #ef4444;border-radius:14px;background:#fff5f5;color:#b91c1c;line-height:1.8">
        ⚠️ 本页渲染出错：${U.escape(err && err.message ? err.message : String(err))}<br>
        <small style="color:#ef4444">请截图反馈，或下拉刷新页面重试</small></div>`;
    }
    const view = $('#view');
    const key = state.tab + '|' + sub;
    view.innerHTML = html;
    if (key !== lastViewKey) { view.scrollTop = 0; lastViewKey = key; }
    window.__render = render;
  }

  /* ============================================================
   * 首页 + 天气
   * ============================================================ */
  function viewHome() {
    const today = U.today();
    const greet = greetByHour();
    const reviewToday = S.byTab('review').find(r => (r.due || U.key(r.createdAt)) === today);
    const doneHabits = S.habits().filter(h => S.habitChecked(h.id, today)).length;
    const totalHabits = S.habits().length;
    const habitPct = totalHabits ? Math.round(doneHabits / totalHabits * 100) : 0;
    const reviewPct = reviewToday ? 100 : 0;
    const overall = Math.round((habitPct + reviewPct) / 2);

    const stats = [
      { n: S.records().filter(r => r.tab === 'work' && r.status === 'done').length, l: '已完成工作' },
      { n: S.byTab('review').length, l: '复盘数' },
      { n: S.goals().filter(g => g.current >= g.target).length + '/' + S.goals().length, l: '达标目标' },
      { n: S.byTab('work').filter(r => r.kind === 'report').length, l: '阶段总结' }
    ];

    // 最近动态
    const recent = S.records().slice().sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0)).slice(0, 6);

    return `
    <section class="hero">
      <div class="hero__top">
        <div>
          <div class="hero__greet">${greet}，</div>
          <div class="hero__date">${U.fmtDate(today)} · 个人工作台</div>
        </div>
        ${ringSvg(overall, overall + '%')}
      </div>
      <div class="hero__weather" id="heroWeather">
        <span class="hw-ico" id="hwIco">⛅</span>
        <span class="hw-txt" id="hwTxt">点击右上角获取天气</span>
      </div>
    </section>

    <div class="stat-row4">
      ${stats.map(s => `<div class="stat4"><b>${s.n}</b><span>${s.l}</span></div>`).join('')}
    </div>

    ${reviewToday ? '' : `
    <button class="cta-card" data-act="add" data-tab="review">
      <span class="cta-card__ico">📝</span>
      <span><b>今天还没写复盘</b><br><small>花2分钟回顾一下</small></span>
      <span class="cta-card__go">去写 ›</span>
    </button>`}

    <div class="section-bar"><h2>今日心情</h2></div>
    <div class="mood-quick" id="moodQuick">
      ${[['😫',1],['😟',2],['😐',3],['🙂',4],['😄',5]].map(([e,m]) =>
        `<button class="mood-emo" data-act="mood" data-m="${m}" data-e="${e}">${e}</button>`).join('')}
    </div>

    <div class="section-bar"><h2>我的习惯</h2><span class="more" data-act="add" data-tab="habit">＋习惯</span></div>
    ${S.habits().length ? `<div class="habit-list">` + S.habits().map(h => {
      const on = S.habitChecked(h.id, today);
      return `<div class="habit-row">
        <span class="habit-emo" style="background:${h.color}22;color:${h.color}">${h.emoji}</span>
        <span class="habit-name">${U.escape(h.name)}</span>
        <span class="habit-streak">🔥${S.habitStreak(h.id)}</span>
        <button class="habit-chk ${on ? 'on' : ''}" data-act="habit" data-id="${h.id}" data-date="${today}">${on ? '✓' : ''}</button>
      </div>`;
    }).join('') + `</div>` : `<div class="empty">还没有习惯，点右上角添加</div>`}

    <div class="section-bar"><h2>我的目标</h2><span class="more" data-act="add" data-tab="goal">＋目标</span></div>
    ${S.goals().length ? S.goals().map(g => {
      const pct = Math.round((g.current / g.target) * 100);
      return `<div class="goal-row" data-act="goalview" data-id="${g.id}">
        <div class="goal-row__top"><span>${U.escape(g.title)}</span><span style="color:${g.color}">${pct}%</span></div>
        <div class="bar"><i style="width:${pct}%;background:${g.color}"></i></div>
      </div>`;
    }).join('') : `<div class="empty">还没有目标</div>`}

    <div class="section-bar"><h2>今日学习</h2><span class="more" data-act="tab" data-tab="study">去学习 ›</span></div>
    ${learningHomeWidget()}

    <div class="section-bar"><h2>最近动态</h2></div>
    ${recent.length ? recent.map(r => `<div class="dyn">
      <span class="dyn-dot" style="background:${tabColor(r.tab)}"></span>
      <span class="dyn-t">${U.escape(r.title || '(无标题)')}</span>
      <span class="dyn-s">${r.sub || tabName(r.tab)}</span>
    </div>`).join('') : `<div class="empty">暂无动态</div>`}

    <div class="section-bar"><h2>快捷入口</h2></div>
    <div class="action-grid action-grid--home">
      ${[['work','💼','工作'],['life','🌿','生活'],['study','📚','学习'],['side','💰','财务'],['review','📝','复盘']]
        .map(([t,i,n]) => `<button class="action-cell" data-act="tab" data-tab="${t}"><span>${i}</span>${n}</button>`).join('')}
    </div>`;
  }
  function greetByHour() {
    const h = new Date().getHours();
    if (h < 6) return '夜深了'; if (h < 11) return '早上好'; if (h < 13) return '中午好';
    if (h < 18) return '下午好'; return '晚上好';
  }
  function tabName(t) { return { work: '工作', life: '生活', study: '学习', side: '财务', review: '复盘' }[t] || t; }
  function tabColor(t) { return { work: '#4f46e5', life: '#10b981', study: '#f59e0b', side: '#ec4899', review: '#06b6d4' }[t] || '#888'; }

  // 首页「今日学习」卡片：展示今日知识卡 + 心理卡 + 连续学习天数
  function learnCalendarHTML(months) {
    const map = {};
    S.learning().forEach(e => { map[e.date] = (map[e.date] || 0) + 1; });
    const now = new Date();
    const wd = ['一', '二', '三', '四', '五', '六', '日'];
    let html = '';
    for (let m = months - 1; m >= 0; m--) {
      const d = new Date(now.getFullYear(), now.getMonth() - m, 1);
      const y = d.getFullYear(), mo = d.getMonth();
      const firstDay = (new Date(y, mo, 1).getDay() + 6) % 7; // 周一为首列
      const days = new Date(y, mo + 1, 0).getDate();
      let cells = '';
      for (let i = 0; i < firstDay; i++) cells += '<span class="lcal__cell lcal__cell--empty"></span>';
      for (let day = 1; day <= days; day++) {
        const key = U.key(new Date(y, mo, day));
        const n = map[key] || 0;
        const lvl = n >= 2 ? 2 : n === 1 ? 1 : 0;
        const isToday = key === U.today();
        cells += `<span class="lcal__cell ${lvl ? 'is-' + lvl : ''} ${isToday ? 'is-today' : ''}" title="${key}${n ? ' · 已学' + n + '张' : ''}">${day}</span>`;
      }
      html += `<div class="lcal">
        <div class="lcal__mo">${y}年${mo + 1}月</div>
        <div class="lcal__wd">${wd.map(w => `<span>${w}</span>`).join('')}</div>
        <div class="lcal__grid">${cells}</div>
      </div>`;
    }
    return `<div class="lcal-wrap">${html}</div>`;
  }
  function learnCalSection(months) {
    return `<div class="section-bar"><h2>📅 学习日历</h2>
      <span class="lcal-legend"><i class="lg lg0"></i>未<i class="lg lg1"></i>1张<i class="lg lg2"></i>2张</span></div>
      ${learnCalendarHTML(months)}`;
  }
  function learningHomeWidget() {
    const d = dailyCards(); const today = U.today();
    const kL = S.isLearned(today, d.kKey), mL = S.isLearned(today, d.mKey);
    const all = kL && mL;
    return `
    <div class="learn-widget ${all ? 'is-done' : ''}">
      <div class="learn-widget__hd">
        <span class="learn-widget__streak">🔥 ${S.learningStreak()} 天连续学习</span>
        <span class="learn-widget__total">累计 ${S.learningTotal()} 张</span>
      </div>
      <div class="learn-widget__item ${kL ? 'on' : ''}" data-act="learn" data-key="${d.kKey}" data-date="${today}">
        <span class="learn-widget__tag">知识</span>
        <span class="learn-widget__t">${d.k.card.t}</span>
        <span class="learn-widget__chk">${kL ? '✓' : ''}</span>
      </div>
      <div class="learn-widget__item ${mL ? 'on' : ''}" data-act="learn" data-key="${d.mKey}" data-date="${today}">
        <span class="learn-widget__tag">心理</span>
        <span class="learn-widget__t">${d.m.t}</span>
        <span class="learn-widget__chk">${mL ? '✓' : ''}</span>
      </div>
      ${all ? '<div class="learn-widget__done">🎉 今日学习已完成，明天自动更新</div>' : '<div class="learn-widget__hint">点上方卡片即可「标为已学」</div>'}
      <div class="learn-widget__cal">${learnCalendarHTML(1)}</div>
      <div id="rssHomeSlot" class="rss-box rss-box--mini"><div class="empty">正在拉取今日资讯…</div></div>
    </div>`;
    loadFeeds().then(f => {
      const el = document.getElementById('rssHomeSlot'); if (!el) return;
      const c = (f && f.categories) || {};
      const mixed = [].concat(c['法律'] || [], c['心理'] || [])
        .sort((a, b) => (b.date || 0) - (a.date || 0)).slice(0, 3);
      el.innerHTML = '<div class="rss-box__hd">📰 今日资讯 · RSS 自动抓取</div>' + rssItemsHTML(mixed, 3);
    });
  }

  /* ---------- 天气 ---------- */
  const WMO = {
    0: ['☀️', '晴'], 1: ['🌤️', '晴间多云'], 2: ['⛅', '多云'], 3: ['☁️', '阴'],
    45: ['🌫️', '雾'], 48: ['🌫️', '雾凇'], 51: ['🌦️', '毛毛雨'], 53: ['🌦️', '毛毛雨'], 55: ['🌦️', '毛毛雨'],
    61: ['🌧️', '小雨'], 63: ['🌧️', '中雨'], 65: ['🌧️', '大雨'], 66: ['🌧️', '冻雨'], 67: ['🌧️', '冻雨'],
    71: ['🌨️', '小雪'], 73: ['🌨️', '中雪'], 75: ['🌨️', '大雪'], 77: ['🌨️', '雪粒'],
    80: ['🌧️', '阵雨'], 81: ['🌧️', '阵雨'], 82: ['⛈️', '强阵雨'],
    85: ['🌨️', '阵雪'], 86: ['🌨️', '阵雪'], 95: ['⛈️', '雷暴'], 96: ['⛈️', '雷暴伴雹'], 99: ['⛈️', '强雷暴']
  };
  function wmo(code) { return WMO[code] || ['🌡️', '未知']; }
  async function fetchWeather() {
    const city = S.getWeatherCity() || '北京';
    try {
      const ctrl = new AbortController();
      const to = setTimeout(() => ctrl.abort(), 6000);
      const g = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=zh&format=json`, { signal: ctrl.signal });
      clearTimeout(to);
      const gd = await g.json();
      const loc = gd.results && gd.results[0];
      const lat = loc ? loc.latitude : 39.9042, lon = loc ? loc.longitude : 116.4074;
      const name = loc ? loc.name : city;
      const c = setTimeout(() => ctrl.abort(), 6000);
      const f = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&timezone=auto`, { signal: ctrl.signal });
      clearTimeout(c);
      const fd = await f.json();
      const cur = fd.current;
      const [ico, txt] = wmo(cur.weather_code);
      const suggest = weatherSuggest(cur.weather_code, cur.temperature_2m, cur.apparent_temperature);
      $('#weatherIcon').textContent = ico;
      $('#weatherTemp').textContent = Math.round(cur.temperature_2m) + '°';
      const hw = $('#heroWeather');
      if (hw) hw.innerHTML = `<span class="hw-ico">${ico}</span><span class="hw-txt">${name} ${Math.round(cur.temperature_2m)}° · 湿度${cur.relative_humidity_2m}% · ${txt}<br><small>${suggest}</small></span>`;
      $('#weatherChip').title = name + ' 天气';
    } catch (e) {
      $('#weatherIcon').textContent = '📍';
      $('#weatherTemp').textContent = city;
    }
  }
  function weatherSuggest(code, t, at) {
    if ([95, 96, 99, 82, 81, 80, 65, 63, 61].includes(code)) return '今天有雨，记得带伞 ☔';
    if (t <= 5) return '气温偏低，注意保暖 🧣';
    if (t >= 32) return '天气炎热，注意防暑防晒 ☀️';
    if (at !== null && at < t - 3) return '体感比实际更冷，多穿一件';
    if ([0, 1].includes(code)) return '天气晴好，适宜户外与运动 🌞';
    return '天气平稳，祝一天顺利';
  }

  /* ============================================================
   * 工作模块
   * ============================================================ */
  function viewWork(sub) {
    const tabs = [['overview', '概览'], ['quadrant', '四象限'], ['projects', '项目总览'], ['today', '今日待办'], ['weekly', '本周周报'], ['kanban', '项目看板'], ['activity', '最近动态']];
    const subBar = `<div class="subnav">` + tabs.map(([k, n]) =>
      `<button class="subnav__i ${state.sub.work === k ? 'on' : ''}" data-act="sub" data-tab="work" data-sub="${k}">${n}</button>`).join('') + `</div>`;
    let body = '';
    if (sub === 'overview') body = workOverview();
    else if (sub === 'quadrant') body = workQuadrant();
    else if (sub === 'projects') body = workProjects();
    else if (sub === 'today') body = workToday();
    else if (sub === 'weekly') body = workWeekly();
    else if (sub === 'kanban') body = workKanban();
    else if (sub === 'activity') body = workActivity();
    return subBar + body;
  }
  function workOverview() {
    const recs = S.byTab('work').filter(r => r.kind !== 'report');
    const todo = recs.filter(r => r.status === 'todo').length;
    const doing = recs.filter(r => r.status === 'doing').length;
    const done = recs.filter(r => r.status === 'done').length;
    const overdue = recs.filter(r => r.due && r.due < U.today() && r.status !== 'done').length;
    const today = U.today();
    const focus = recs.filter(r => (r.important || r.urgent || (r.due && r.due <= today)) && r.status !== 'done')
      .sort((a, b) => (b.important ? 1 : 0) - (a.important ? 1 : 0) || (b.urgent ? 1 : 0) - (a.urgent ? 1 : 0))
      .slice(0, 4);
    const projects = S.projects().filter(p => p.status !== 'done');
    return `
    <div class="work-hero">
      <div class="work-hero__title">我的工作台</div>
      <div class="work-pills">
        <div class="work-pill" style="--pc:#9ca3af"><b>${todo}</b><span>待办</span></div>
        <div class="work-pill" style="--pc:#3b82f6"><b>${doing}</b><span>进行中</span></div>
        <div class="work-pill" style="--pc:#10b981"><b>${done}</b><span>已完成</span></div>
        <div class="work-pill" style="--pc:#ef4444"><b>${overdue}</b><span>逾期</span></div>
      </div>
    </div>
    <div class="section-bar"><h2>🔥 今日聚焦</h2><button class="link-btn" data-act="sub" data-tab="work" data-sub="today">全部 ›</button></div>
    ${focus.length ? focus.map(r => taskCard(r)).join('') : '<div class="empty">今天没有需要聚焦的任务，去「四象限」安排一下</div>'}
    <div class="section-bar"><h2>📁 进行中项目</h2><button class="link-btn" data-act="sub" data-tab="work" data-sub="projects">全部 ›</button></div>
    ${projects.length ? projects.slice(0, 3).map(p => projectMini(p)).join('') : '<div class="empty">还没有项目，点右上角创建</div>'}
    <div class="work-quick">
      <div class="work-quick__t" data-act="sub" data-tab="work" data-sub="weekly">📝<span>本周周报</span></div>
      <div class="work-quick__t" data-act="sub" data-tab="work" data-sub="kanban">🗂<span>项目看板</span></div>
      <div class="work-quick__t" data-act="sub" data-tab="work" data-sub="activity">🕘<span>最近动态</span></div>
      <div class="work-quick__t" data-act="sub" data-tab="work" data-sub="quadrant">🎯<span>四象限</span></div>
    </div>`;
  }
  function taskCard(r) {
    const done = r.status === 'done';
    const meta = [r.sub, r.due ? ('📅' + r.due) : ''].filter(Boolean).join(' · ');
    return `<div class="wtask ${done ? 'done' : ''}" data-act="edit" data-id="${r.id}">
      <button class="wtask__chk" data-act="cycle" data-id="${r.id}">${done ? '✓' : ''}</button>
      <div class="wtask__main">
        <div class="wtask__t">${U.escape(r.title)}</div>
        ${meta ? `<div class="wtask__m">${meta}</div>` : ''}
      </div>
      <div class="wtask__tags">${r.important ? '<span class="wtask__imp">重要</span>' : ''}${r.urgent ? '<span class="wtask__urg">紧急</span>' : ''}</div>
    </div>`;
  }
  function projectMini(p) {
    const prog = S.projectProgress(p.id);
    return `<div class="wproj" data-act="project" data-id="${p.id}">
      <div class="wproj__top"><span class="wproj__dot" style="background:${p.color}"></span><b>${U.escape(p.name)}</b><span class="wproj__pct">${prog}%</span></div>
      <div class="bar"><i style="width:${prog}%;background:${p.color}"></i></div>
    </div>`;
  }
  function workQuadrant() {
    const recs = S.byTab('work').filter(r => r.kind !== 'report');
    const qs = [
      { key: 'q1', t: '重要且紧急', s: '立即做', c: '#ef4444', f: r => r.important && r.urgent },
      { key: 'q2', t: '重要不紧急', s: '计划做', c: '#f59e0b', f: r => r.important && !r.urgent },
      { key: 'q3', t: '不重要但紧急', s: '速决/委派', c: '#3b82f6', f: r => !r.important && r.urgent },
      { key: 'q4', t: '不重要不紧急', s: '减少做', c: '#9ca3af', f: r => !r.important && !r.urgent }
    ];
    return `<div class="quad">
      ${qs.map(q => {
        const items = recs.filter(q.f);
        return `<div class="quad__cell" style="--qc:${q.c}">
          <div class="quad__hd"><b>${q.t}</b><span>${q.s}</span>
            <button class="quad__add" data-act="add" data-tab="work" data-imp2="${q.key === 'q1' || q.key === 'q2' ? 1 : 0}" data-urg="${q.key === 'q1' || q.key === 'q3' ? 1 : 0}">＋</button>
          </div>
          <div class="quad__list">
            ${items.length ? items.map(r => taskLine(r)).join('') : `<div class="quad__empty">—</div>`}
          </div>
        </div>`;
      }).join('')}
    </div>`;
  }
  function taskLine(r) {
    const st = STATUS[r.status] || '待办';
    return `<div class="task" data-act="edit" data-id="${r.id}">
      <span class="task-dot" style="background:${STATUS_COLOR[r.status]}"></span>
      <span class="task-t">${U.escape(r.title)}</span>
      <span class="task-sub">${r.sub || ''}</span>
      <button class="task-cycle" data-act="cycle" data-id="${r.id}" title="切换状态">${st}</button>
    </div>`;
  }
  function workProjects() {
    const ps = S.projects();
    return `<div class="mod-head">
        <div><b>项目总览</b><span>${ps.length} 个项目</span></div>
        <button class="btn btn--sm" data-act="add" data-tab="project">＋项目</button>
      </div>
      ${ps.length ? ps.map(p => {
        const prog = S.projectProgress(p.id);
        const tasks = S.byTab('work').filter(r => r.project === p.id && r.kind !== 'report');
        const done = tasks.filter(r => r.status === 'done').length;
        return `<div class="proj-card" data-act="project" data-id="${p.id}">
          <div class="proj-card__top">
            <span class="proj-dot" style="background:${p.color}"></span>
            <b>${U.escape(p.name)}</b>
            <span class="proj-status ${p.status === 'done' ? 'done' : ''}">${p.status === 'done' ? '已结项' : '进行中'}</span>
          </div>
          <div class="bar"><i style="width:${prog}%;background:${p.color}"></i></div>
          <div class="proj-card__meta">进度 ${prog}% · 任务 ${done}/${tasks.length}</div>
        </div>`;
      }).join('') : `<div class="empty">还没有项目，点右上角创建</div>`}`;
  }
  function workToday() {
    const today = U.today();
    const recs = S.byTab('work').filter(r => r.kind !== 'report');
    const overdue = recs.filter(r => r.due && r.due < today && r.status !== 'done');
    const dueToday = recs.filter(r => r.due === today);
    const doing = recs.filter(r => r.status === 'doing');
    const block = (title, list) => `<div class="today-grp"><div class="today-grp__t">${title}（${list.length}）</div>
      ${list.length ? list.map(r => taskLine(r)).join('') : `<div class="empty">—</div>`}</div>`;
    return `<div class="mod-head"><div><b>今日待办</b><span>${U.fmtDate(today)}</span></div>
        <button class="btn btn--sm" data-act="add" data-tab="work" data-due="today">＋任务</button></div>
      ${block('🔴 已逾期', overdue)}
      ${block('📌 今天截止', dueToday)}
      ${block('🚧 进行中', doing)}
      <div class="today-grp"><button class="btn btn--block" data-act="add" data-tab="work" data-due="today">＋ 添加今日任务</button></div>`;
  }
  function workWeekly() {
    const [a, b] = U.weekRange(new Date());
    const recs = S.byTab('work').filter(r => r.kind !== 'report' && (r.createdAt || 0) >= Date.parse(a) && (r.createdAt || 0) <= Date.parse(b + 'T23:59:59'));
    const done = recs.filter(r => r.status === 'done');
    const overdue = S.byTab('work').filter(r => r.kind !== 'report' && r.due && r.due < U.today() && r.status !== 'done');
    const bySub = {};
    recs.forEach(r => { bySub[r.sub] = (bySub[r.sub] || 0) + 1; });
    const reports = S.byTab('work').filter(r => r.kind === 'report');
    const text = `本周（${a} ~ ${b}）共记录工作 ${recs.length} 项，已完成 ${done.length} 项，完成率 ${recs.length ? Math.round(done.length / recs.length * 100) : 0}%。`
      + (Object.keys(bySub).length ? `其中「${Object.entries(bySub).map(([k, v]) => k + v + '项').join('、')}」。`
      : '暂未细分方向。')
      + (overdue.length ? `当前有 ${overdue.length} 项已逾期，建议优先推进：${overdue.slice(0, 3).map(r => r.title).join('、')}。` : '无逾期任务，节奏良好。');
    return `<div class="mod-head"><div><b>本周周报</b><span>${a}~${b}</span></div>
        <button class="btn btn--sm" data-act="saveweekly" data-text="${U.escape(text)}">保存周报</button></div>
      <div class="rep-insight">${text}</div>
      <div class="mini-stat">
        <div><b>${recs.length}</b><span>记录</span></div>
        <div><b>${done.length}</b><span>完成</span></div>
        <div><b style="color:#ef4444">${overdue.length}</b><span>逾期</span></div>
      </div>
      ${Object.keys(bySub).length ? `<div class="rep-sub">方向分布：` + Object.entries(bySub).map(([k, v]) => `<span class="chip">${k} ${v}</span>`).join('') + `</div>` : ''}
      <div class="section-bar"><h2>历史周报（${reports.length}）</h2></div>
      ${reports.length ? reports.slice().reverse().map(r => `<div class="rep-hist" data-act="edit" data-id="${r.id}">
        <div class="rep-hist__t">${U.escape(r.title)}</div>
        <div class="rep-hist__b">${U.escape((r.extra && r.extra.text || '').slice(0, 60))}…</div>
      </div>`).join('') : `<div class="empty">暂无保存的周报</div>`}`;
  }
  function workKanban() {
    const recs = S.byTab('work').filter(r => r.kind !== 'report');
    const cols = ['todo', 'doing', 'done'];
    return `<div class="mod-head"><div><b>项目看板</b><span>${recs.length} 任务</span></div>
        <button class="btn btn--sm" data-act="add" data-tab="work">＋任务</button></div>
      <div class="kanban">
        ${cols.map(c => {
          const list = recs.filter(r => r.status === c);
          return `<div class="kanban__col">
            <div class="kanban__hd" style="color:${STATUS_COLOR[c]}">${STATUS[c]} <i>${list.length}</i></div>
            ${list.length ? list.map(r => `<div class="kanban__card" data-act="edit" data-id="${r.id}">
              <div class="kanban__t">${U.escape(r.title)}</div>
              <div class="kanban__m">${r.sub || ''} ${r.project ? '· ' + (S.projectById(r.project) || {}).name : ''}</div>
              <button class="kanban__move" data-act="cycle" data-id="${r.id}">› 推进</button>
            </div>`).join('') : `<div class="kanban__empty">拖入任务</div>`}
          </div>`;
        }).join('')}
      </div>`;
  }
  function workActivity() {
    const recs = S.byTab('work').filter(r => r.kind !== 'report').slice().sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0)).slice(0, 25);
    return `<div class="mod-head"><div><b>最近动态</b><span>工作流</span></div></div>
      ${recs.length ? recs.map(r => `<div class="dyn">
        <span class="dyn-dot" style="background:${STATUS_COLOR[r.status]}"></span>
        <span class="dyn-t">${U.escape(r.title)}</span>
        <span class="dyn-s">${r.sub || ''} · ${U.fmtDate(U.key(r.updatedAt || r.createdAt))}</span>
      </div>`).join('') : `<div class="empty">暂无动态</div>`}`;
  }

  /* ============================================================
   * 生活模块：减脂计划 + 饮水 + 饮食 + 运动
   * ============================================================ */
  function viewLife(sub) {
    const tabs = [['diet', '饮食'], ['sport', '运动']];
    const subBar = `<div class="subnav">` + tabs.map(([k, n]) =>
      `<button class="subnav__i ${state.sub.life === k ? 'on' : ''}" data-act="sub" data-tab="life" data-sub="${k}">${n}</button>`).join('') + `</div>`;
    if (sub === 'sport') return subBar + lifeSport();
    return subBar + lifeDiet();
  }
  function lifeDiet() {
    const prof = S.getProfile();
    const nut = S.computeNutrition(prof);
    const today = U.today();
    const waterMl = S.getWater(today);
    const waterPct = Math.min(100, Math.round(waterMl / 2500 * 100));
    const meals = S.byTab('life').filter(r => r.sub === '饮食');
    const mealKcal = meals.filter(r => (r.due || U.key(r.createdAt)) === today).reduce((s, r) => s + (+((r.extra && r.extra.kcal) || 0)), 0);
    return `
    <div class="mod-head"><div><b>饮食 · 减脂计划</b></div>
      <button class="btn btn--sm" data-act="editprofile">设置身体数据</button></div>

    ${nut ? `
    <div class="diet-plan">
      <div class="diet-plan__row">
        <div class="dp-card"><b>${nut.target}</b><span>每日减脂千卡</span></div>
        <div class="dp-card"><b>${nut.tdee}</b><span>每日消耗 TDEE</span></div>
        <div class="dp-card"><b>${nut.bmr}</b><span>基础代谢 BMR</span></div>
      </div>
      <div class="diet-plan__row diet-plan__row--nut">
        <div class="nut"><b>${nut.protein}g</b><span>蛋白质</span><i style="background:#ef4444;width:${Math.round(nut.protein*4/nut.target*100)}%"></i></div>
        <div class="nut"><b>${nut.carb}g</b><span>碳水</span><i style="background:#f59e0b;width:${Math.round(nut.carb*4/nut.target*100)}%"></i></div>
        <div class="nut"><b>${nut.fat}g</b><span>脂肪</span><i style="background:#10b981;width:${Math.round(nut.fat*9/nut.target*100)}%"></i></div>
        <div class="nut"><b>${nut.fiber}g</b><span>膳食纤维</span><i style="background:#6366f1;width:30%"></i></div>
      </div>
      <div class="diet-plan__note">按 ${prof.gender === 'female' ? '女性' : '男性'} · ${prof.height}cm · ${prof.weight}kg · ${prof.age}岁 · 活动系数${prof.activity} 计算，每日赤字约500千卡。</div>
    </div>` : `<div class="diet-plan diet-plan--empty">完善身体数据后，自动计算减脂所需热量与营养分配。<button class="btn btn--primary btn--sm" data-act="editprofile">去设置</button></div>`}

    <div class="water-card">
      <div class="water-card__l">
        <b>💧 今日饮水</b>
        <span>${waterMl} / 2500 ml</span>
      </div>
      ${ringSvg(waterPct, waterPct + '%', true)}
      <div class="water-btns">
        <button data-act="water" data-ml="250">+250</button>
        <button data-act="water" data-ml="500">+500</button>
        <button data-act="waterset" data-ml="${waterMl}">设定</button>
      </div>
      ${waterPct >= 100 ? `<div class="water-ok">✅ 已达标</div>` : ''}
    </div>

    <div class="mod-head"><div><b>今日饮食</b><span>已记 ${mealKcal} 千卡</span></div>
      <button class="btn btn--sm" data-act="add" data-tab="life" data-sub="饮食">＋记录</button></div>
    ${meals.length ? meals.slice().reverse().map(r => simpleCard(r, (r.extra && r.extra.kcal) ? '🔥' + (r.extra.kcal) + 'kcal' : '')).join('') : `<div class="empty">还没有饮食记录</div>`}
    `;
  }
  function lifeSport() {
    const today = U.today();
    const ex = S.byTab('life').filter(r => r.sub === '运动');
    const todayMin = ex.filter(r => (r.due || U.key(r.createdAt)) === today).reduce((s, r) => s + (+((r.extra && r.extra.duration) || 0)), 0);
    return `
    <div class="mod-head"><div><b>运动记录</b><span>今日 ${todayMin} 分钟</span></div>
      <button class="btn btn--sm" data-act="add" data-tab="life" data-sub="运动">＋记录</button></div>
    ${ex.length ? ex.slice().reverse().map(r => simpleCard(r, (r.extra && r.extra.duration) ? '⏱' + (r.extra.duration) + '分' : '')).join('') : `<div class="empty">还没有运动记录</div>`}
    `;
  }

  /* ============================================================
   * 学习模块：知识卡片 / 心理探秘 / 技能视频站
   * ============================================================ */
  function viewStudy(sub) {
    const tabs = [['knowledge', '知识卡片'], ['mind', '心理探秘'], ['skill', '技能视频']];
    const subBar = `<div class="subnav">` + tabs.map(([k, n]) =>
      `<button class="subnav__i ${state.sub.study === k ? 'on' : ''}" data-act="sub" data-tab="study" data-sub="${k}">${n}</button>`).join('') + `</div>`;
    if (sub === 'mind') return subBar + studyCards(MIND, '心理探秘 · 每天懂一点自己');
    if (sub === 'skill') return subBar + studySkill();
    return subBar + studyKnowledge();
  }
  function studyKnowledge() {
    const d = dailyCards();
    const today = U.today();
    const learned = S.isLearned(today, d.kKey);
    let html = `
    <div class="daily-card ${learned ? 'is-learned' : ''}">
      <div class="daily-card__hd"><span>📅 今日知识卡 · ${U.fmtDate(new Date())}</span>
        <span class="daily-card__auto">每日 0 点自动更新</span></div>
      <div class="daily-card__cat">${d.k.cat}</div>
      <div class="daily-card__t">${d.k.card.t}</div>
      <div class="daily-card__b">${d.k.card.b}</div>
      <button class="btn ${learned ? 'btn--ok' : 'btn--primary'} btn--block" data-act="learn" data-key="${d.kKey}" data-date="${today}">
        ${learned ? '✓ 今日已学' : '✓ 标为已学'}</button>
    </div>`;
    html += learnCalSection(2);
    const groups = Object.keys(KNOWLEDGE);
    html += `<div class="mod-head"><div><b>知识卡片</b><span>法律 · 宣传 · 公文</span></div>
      <button class="btn btn--sm" data-act="add" data-tab="study" data-sub="知识">＋笔记</button></div>`;
    groups.forEach(g => {
      html += `<div class="kc-group">${g}</div>`;
      html += KNOWLEDGE[g].map((c, i) => `<div class="kc">
        <div class="kc__t">${c.t}</div>
        <div class="kc__b">${c.b}</div>
        <div class="kc__tag">${g} · 第${i + 1}条</div>
      </div>`).join('');
    });
    // 用户自己的知识笔记
    const notes = S.byTab('study').filter(r => r.sub === '知识');
    if (notes.length) {
      html += `<div class="kc-group">我的笔记</div>`;
      html += notes.slice().reverse().map(r => simpleCard(r, '笔记')).join('');
    }
    // RSS 每日资讯（异步注入，抓取失败不影响上方内置卡片）
    html += `<div class="mod-head"><div><b>📰 RSS 每日资讯</b><span>自动抓取 · 零 token</span></div></div>`;
    html += `<div id="rssSlot" class="rss-box"><div class="empty">正在拉取最新资讯…</div></div>`;
    loadFeeds().then(f => {
      const el = document.getElementById('rssSlot'); if (!el) return;
      const items = (f && f.categories && f.categories['法律']) || [];
      el.innerHTML = rssItemsHTML(items, 8);
    });
    return html;
  }
  function studyCards(list, title) {
    const d = dailyCards();
    const today = U.today();
    const learned = S.isLearned(today, d.mKey);
    let html = `
    <div class="daily-card daily-card--mind ${learned ? 'is-learned' : ''}">
      <div class="daily-card__hd"><span>📅 今日心理卡 · ${U.fmtDate(new Date())}</span>
        <span class="daily-card__auto">每日 0 点自动更新</span></div>
      <div class="daily-card__cat">心理探秘</div>
      <div class="daily-card__t">${d.m.t}</div>
      <div class="daily-card__b">${d.m.b}</div>
      <button class="btn ${learned ? 'btn--ok' : 'btn--primary'} btn--block" data-act="learn" data-key="${d.mKey}" data-date="${today}">
        ${learned ? '✓ 今日已学' : '✓ 标为已学'}</button>
    </div>`;
    html += learnCalSection(2) + `<div class="mod-head"><div><b>${title}</b></div></div>`;
    // 心理 RSS 每日资讯（异步注入）
    html += `<div class="mod-head"><div><b>📰 心理 RSS 每日资讯</b><span>自动抓取 · 零 token</span></div></div>`;
    html += `<div id="rssSlotMind" class="rss-box"><div class="empty">正在拉取最新资讯…</div></div>`;
    loadFeeds().then(f => {
      const el = document.getElementById('rssSlotMind'); if (!el) return;
      const items = (f && f.categories && f.categories['心理']) || [];
      el.innerHTML = rssItemsHTML(items, 8);
    });
    return html + list.map((c, i) => `<div class="kc kc--mind">
        <div class="kc__t">${c.t}</div>
        <div class="kc__b">${c.b}</div>
        <div class="kc__tag">心理 · 第${i + 1}条</div>
      </div>`).join('');
  }
  function studySkill() {
    let html = `<div class="mod-head"><div><b>技能学习 · 视频站</b><span>点开即学</span></div></div>`;
    Object.keys(SKILL_SITES).forEach(cat => {
      html += `<div class="kc-group">${cat}</div>`;
      html += SKILL_SITES[cat].map(s => `<a class="skill-link" href="${s.u}" target="_blank" rel="noopener">
        <span class="skill-link__ico">▶</span>
        <span class="skill-link__t">${s.n}</span>
        <span class="skill-link__d">${s.d}</span>
        <span class="skill-link__go">↗</span>
      </a>`).join('');
    });
    html += `<div class="kc-group">我的技能练习</div>`;
    const notes = S.byTab('study').filter(r => r.sub === '技能');
    html += notes.length ? notes.slice().reverse().map(r => simpleCard(r, '练习')).join('')
      : `<div class="empty">还没记录练习，点下方＋记录</div>`;
    html += `<button class="btn btn--block" data-act="add" data-tab="study" data-sub="技能">＋ 记录一次技能练习</button>`;
    return html;
  }

  /* ============================================================
   * 财务模块（原副业）：便捷记账
   * ============================================================ */
  function viewFinance() {
    const today = U.today();
    const [a, b] = U.monthRange(new Date());
    const recs = S.byTab('side');
    const month = recs.filter(r => (r.due || U.key(r.createdAt)) >= a && (r.due || U.key(r.createdAt)) <= b);
    const income = month.filter(r => (r.extra && r.extra.flow) === '收入').reduce((s, r) => s + (+(r.extra && r.extra.amount) || 0), 0);
    const expense = month.filter(r => (r.extra && r.extra.flow) === '支出').reduce((s, r) => s + (+(r.extra && r.extra.amount) || 0), 0);
    const net = income - expense;
    // 分类支出
    const byCat = {};
    month.filter(r => (r.extra && r.extra.flow) === '支出').forEach(r => {
      const c = (r.extra && r.extra.category) || '其他'; byCat[c] = (byCat[c] || 0) + (+(r.extra && r.extra.amount) || 0);
    });
    const catData = Object.entries(byCat).map(([k, v]) => ({ label: k, value: v }));
    // 每日趋势
    const days = {};
    month.filter(r => (r.extra && r.extra.flow) === '支出').forEach(r => {
      const d = (r.due || U.key(r.createdAt)); days[d] = (days[d] || 0) + (+(r.extra && r.extra.amount) || 0);
    });
    const trendData = [];
    for (let i = 0; i < 14; i++) { const d = new Date(); d.setDate(d.getDate() - (13 - i)); const k = U.key(d); trendData.push({ label: (d.getMonth() + 1) + '/' + d.getDate(), value: days[k] || 0 }); }
    return `
    <div class="mod-head"><div><b>个人财务</b><span>本月</span></div></div>
    <button class="finance-quick" data-act="add" data-tab="side">
      <span class="fq-ico">＋</span><span class="fq-t">记一笔</span>
    </button>
    <div class="finance-sum">
      <div class="fs"><b style="color:#10b981">¥${income.toFixed(0)}</b><span>收入</span></div>
      <div class="fs"><b style="color:#ef4444">¥${expense.toFixed(0)}</b><span>支出</span></div>
      <div class="fs"><b style="color:#4f46e5">¥${net.toFixed(0)}</b><span>结余</span></div>
    </div>
    ${catData.length ? `<div class="section-bar"><h2>支出构成</h2></div>` + donutSvg(catData) : ''}
    <div class="section-bar"><h2>近14天支出</h2></div>
    ${barsSvg(trendData, '#ec4899')}
    <div class="section-bar"><h2>本月明细</h2><span class="more" data-act="add" data-tab="side">＋</span></div>
    ${month.length ? month.slice().reverse().map(r => {
      const flow = (r.extra && r.extra.flow); const amt = (r.extra && r.extra.amount) || 0;
      const sign = flow === '收入' ? '+' : '-';
      const col = flow === '收入' ? '#10b981' : '#ef4444';
      return `<div class="fin-row" data-act="edit" data-id="${r.id}">
        <span class="fin-cat">${(r.extra && r.extra.category) || flow}</span>
        <span class="fin-note">${U.escape(r.title || '')}</span>
        <span class="fin-amt" style="color:${col}">${sign}¥${amt}</span>
      </div>`;
    }).join('') : `<div class="empty">本月还没有记账</div>`}
    `;
  }

  /* ============================================================
   * 复盘模块：每日 + 自动报告
   * ============================================================ */
  function viewReview(sub) {
    const today = U.today();
    const todayRec = S.byTab('review').find(r => (r.due || U.key(r.createdAt)) === today);
    let html = `<div class="mod-head"><div><b>每日复盘</b><span>${U.fmtDate(today)}</span></div>
      <button class="btn btn--sm" data-act="autoreport">📑 自动报告</button></div>`;
    if (todayRec) {
      html += `<div class="rev-card" data-act="edit" data-id="${todayRec.id}">
        <div class="rev-card__top"><b>今日复盘</b><span class="rev-stars">${'★'.repeat(todayRec.rating || 0)}${'☆'.repeat(5 - (todayRec.rating || 0))}</span></div>
        <div class="rev-card__row"><b>✅ 完成</b><span>${U.escape(todayRec.extra && todayRec.extra.done || '（未填写）')}</span></div>
        <div class="rev-card__row"><b>🎯 明日</b><span>${U.escape(todayRec.extra && todayRec.extra.plan || '（未填写）')}</span></div>
        <div class="rev-card__row"><b>💡 感悟</b><span>${U.escape(todayRec.extra && todayRec.extra.reflect || '（未填写）')}</span></div>
      </div>`;
    } else {
      html += `<button class="btn btn--primary btn--block" data-act="add" data-tab="review">＋ 写今日复盘</button>`;
    }
    html += `<div class="section-bar"><h2>历史复盘（${S.byTab('review').length}）</h2></div>`;
    const hist = S.byTab('review').slice().reverse();
    html += hist.length ? hist.map(r => `<div class="rep-hist" data-act="edit" data-id="${r.id}">
      <div class="rep-hist__t">${U.fmtDate(r.due || U.key(r.createdAt))} · ${'★'.repeat(r.rating || 0)}</div>
      <div class="rep-hist__b">${(r.extra && U.escape((r.extra.done || '').slice(0, 40))) || '（无内容）'}</div>
    </div>`).join('') : `<div class="empty">还没有复盘</div>`;
    return html;
  }

  /* ============================================================
   * 自动复盘报告
   * ============================================================ */
  function buildAutoReport(range) {
    let a, b, label;
    if (range === 'week') { [a, b] = U.weekRange(new Date()); label = '本周'; }
    else if (range === 'month') { [a, b] = U.monthRange(new Date()); label = '本月'; }
    else if (range === 'quarter') { [a, b] = U.quarterRange(new Date()); label = '本季度'; }
    else { a = '1970-01-01'; b = U.today(); label = '全部'; }
    const inRange = r => { const d = (r.due || U.key(r.createdAt)); return d >= a && d <= b; };
    const recs = S.records().filter(inRange);
    const work = recs.filter(r => r.tab === 'work' && r.kind !== 'report');
    const done = work.filter(r => r.status === 'done');
    const overdue = S.byTab('work').filter(r => r.kind !== 'report' && r.due && r.due < U.today() && r.status !== 'done');
    const study = recs.filter(r => r.tab === 'study');
    const studyMin = study.reduce((s, r) => s + (+(r.extra && r.extra.duration) || 0), 0);
    const ex = recs.filter(r => r.tab === 'life' && r.sub === '运动');
    const exMin = ex.reduce((s, r) => s + (+(r.extra && r.extra.duration) || 0), 0);
    const fin = recs.filter(r => r.tab === 'side');
    const income = fin.filter(r => (r.extra && r.extra.flow) === '收入').reduce((s, r) => s + (+(r.extra && r.extra.amount) || 0), 0);
    const expense = fin.filter(r => (r.extra && r.extra.flow) === '支出').reduce((s, r) => s + (+(r.extra && r.extra.amount) || 0), 0);
    // 习惯完成率
    const days = range === 'week' ? 7 : range === 'month' ? 30 : range === 'quarter' ? 90 : 30;
    let habitPct = 0, ht = 0;
    S.habits().forEach(h => { habitPct += S.habitRate(h.id, days); ht++; });
    habitPct = ht ? Math.round(habitPct / ht) : 0;
    const goals = S.goals();
    const goalPct = goals.length ? Math.round(goals.reduce((s, g) => s + Math.min(100, Math.round(g.current / g.target * 100)), 0) / goals.length) : 0;
    const moods = S.moodTrend(7).filter(m => m.mood);
    const avgMood = moods.length ? (moods.reduce((s, m) => s + m.mood, 0) / moods.length).toFixed(1) : '—';

    // 分类分布
    const byTab = {};
    recs.forEach(r => { byTab[r.tab] = (byTab[r.tab] || 0) + 1; });
    const catData = Object.entries(byTab).map(([k, v]) => ({ label: tabName(k), value: v, color: tabColor(k) }));
    // 周活跃
    const weekData = [];
    for (let i = 6; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); const k = U.key(d); weekData.push({ label: '周' + ((d.getDay() + 6) % 7 + 1), value: recs.filter(r => (r.due || U.key(r.createdAt)) === k).length }); }

    const insights = [];
    insights.push(`${label}共记录 ${recs.length} 条。工作 ${work.length} 项，完成 ${done.length} 项（完成率 ${work.length ? Math.round(done.length / work.length * 100) : 0}%）。`);
    if (overdue.length) insights.push(`⚠️ 有 ${overdue.length} 项工作已逾期，建议优先处理：${overdue.slice(0, 3).map(r => r.title).join('、')}。`);
    else insights.push('✅ 当前无逾期任务，节奏良好。');
    insights.push(`📚 学习时长累计 ${studyMin} 分钟；🏃 运动累计 ${exMin} 分钟；💰 收支：收入¥${income.toFixed(0)} / 支出¥${expense.toFixed(0)}，结余¥${(income - expense).toFixed(0)}。`);
    insights.push(`🔥 习惯平均完成率 ${habitPct}%；🎯 目标平均进度 ${goalPct}%；😊 近7日平均情绪 ${avgMood}/5。`);
    if (habitPct < 60) insights.push('习惯坚持度偏低，建议从最小可执行动作开始，降低启动门槛。');
    if (studyMin < 60) insights.push('学习投入偏少，可设定每日固定时段（如通勤）微学习。');
    if (exMin < 90) insights.push('运动量未达每周150分钟建议，适当增加到每周3次中强度运动。');

    return { label, stats: { recs: recs.length, workDone: done.length, workRate: work.length ? Math.round(done.length / work.length * 100) : 0, studyMin, exMin, income, expense, net: income - expense, habitPct, goalPct, avgMood }, catData, weekData, insights };
  }
  function viewAutoReport(range) {
    range = range || 'week';
    const r = buildAutoReport(range);
    const ranges = [['week', '本周'], ['month', '本月'], ['quarter', '本季度'], ['all', '全部']];
    return `<div class="mod-head"><div><b>自动复盘报告</b><span>${r.label}</span></div>
      <button class="btn btn--sm" data-act="savereport" data-range="${range}">保存报告</button></div>
    <div class="subnav subnav--center">${ranges.map(([k, n]) => `<button class="subnav__i ${range === k ? 'on' : ''}" data-act="reportrange" data-range="${k}">${n}</button>`).join('')}</div>
    <div class="mini-stat">
      <div><b>${r.stats.recs}</b><span>总记录</span></div>
      <div><b>${r.stats.workRate}%</b><span>工作完成率</span></div>
      <div><b>${r.stats.habitPct}%</b><span>习惯完成</span></div>
      <div><b>${r.stats.exMin}</b><span>运动(分)</span></div>
    </div>
    <div class="mini-stat">
      <div><b>¥${r.stats.net.toFixed(0)}</b><span>净收</span></div>
      <div><b>${r.stats.studyMin}</b><span>学习(分)</span></div>
      <div><b>${r.stats.goalPct}%</b><span>目标进度</span></div>
      <div><b>${r.stats.avgMood}</b><span>平均情绪</span></div>
    </div>
    ${r.catData.length ? `<div class="section-bar"><h2>分类分布</h2></div>` + donutSvg(r.catData) : ''}
    <div class="section-bar"><h2>每日活跃</h2></div>
    ${barsSvg(r.weekData, '#06b6d4')}
    <div class="section-bar"><h2>自动洞察</h2></div>
    <div class="rep-insight">${r.insights.map(t => `<p>${t}</p>`).join('')}</div>`;
  }

  /* ============================================================
   * 通用卡片
   * ============================================================ */
  function simpleCard(r, badge) {
    return `<div class="card" data-act="edit" data-id="${r.id}">
      <div class="card__title">${U.escape(r.title || '(无标题)')}</div>
      <div class="card__meta">${U.fmtDate(r.due || U.key(r.createdAt))}${badge ? ' · ' + badge : ''}${r.note ? ' · ' + U.escape(r.note.slice(0, 20)) : ''}</div>
    </div>`;
  }
  function ringSvg(pct, label, small) {
    const r = small ? 26 : 30, c = 2 * Math.PI * r, off = c * (1 - pct / 100);
    const col = pct >= 100 ? '#10b981' : '#4f46e5';
    return `<svg class="ring ${small ? 'ring--sm' : ''}" viewBox="0 0 80 80">
      <circle cx="40" cy="40" r="${r}" fill="none" stroke="#eef0f6" stroke-width="8"/>
      <circle cx="40" cy="40" r="${r}" fill="none" stroke="${col}" stroke-width="8" stroke-linecap="round"
        stroke-dasharray="${c}" stroke-dashoffset="${off}" transform="rotate(-90 40 40)"/>
      <text x="40" y="44" class="ring__num">${label}</text>
    </svg>`;
  }
  function donutSvg(data) {
    const total = data.reduce((s, d) => s + d.value, 0) || 1;
    const R = 52, r = 32, cx = 60, cy = 60, C = 2 * Math.PI * ((R + r) / 2);
    let acc = 0; const segs = data.map(d => {
      const frac = d.value / total, len = frac * C, col = d.color || '#4f46e5';
      const seg = `<circle cx="${cx}" cy="${cy}" r="${(R + r) / 2}" fill="none" stroke="${col}" stroke-width="${R - r}"
        stroke-dasharray="${len} ${C - len}" stroke-dashoffset="${-acc}" transform="rotate(-90 ${cx} ${cy})"/>`;
      acc += len; return seg;
    }).join('');
    const legend = data.map(d => `<div class="donut-lg"><i style="background:${d.color || '#4f46e5'}"></i>${d.label} ${Math.round(d.value / total * 100)}%</div>`).join('');
    return `<div class="donut-wrap"><svg class="donut" viewBox="0 0 120 120">${segs}<text x="60" y="64" class="donut__num">${total}</text></svg>
      <div class="donut-leg">${legend}</div></div>`;
  }
  function barsSvg(data, color) {
    const max = Math.max(1, ...data.map(d => d.value));
    return `<div class="bars">${data.map(d => `<div class="bars__c">
      <div class="bars__bar" style="height:${Math.round(d.value / max * 90)}px;background:${color}"></div>
      <div class="bars__l">${d.label}</div></div>`).join('')}</div>`;
  }

  /* ============================================================
   * 表单：简单 / 详细
   * ============================================================ */
  function openForm(ctx) {
    // ctx: {tab, sub, rec, mode:'simple'|'detailed', preset:{}}
    const detailed = ctx.mode === 'detailed' || !!ctx.rec;
    const draft = ctx.rec ? Object.assign({}, ctx.rec, { extra: Object.assign({}, ctx.rec.extra) }) : { extra: {} };
    if (ctx.preset) Object.assign(draft, ctx.preset);
    if (ctx.rec && ctx.rec.extra) {
      draft.amount = ctx.rec.extra.amount; draft.flow = ctx.rec.extra.flow;
      draft.category = ctx.rec.extra.category; draft.account = ctx.rec.extra.account;
      draft.kcal = ctx.rec.extra.kcal; draft.duration = ctx.rec.extra.duration;
      draft.done = ctx.rec.extra.done; draft.plan = ctx.rec.extra.plan; draft.reflect = ctx.rec.extra.reflect;
    }
    state.form = { ctx, detailed, draft };
    renderForm();
    openSheet();
  }
  function renderForm() {
    const f = state.form; const { tab, sub, rec } = f.ctx; const d = f.draft;
    const title = rec ? '编辑' : '新增';
    $('#sheetTitle').textContent = title;
    let html = '';
    // 标题（通用）
    const titleLabel = tab === 'side' ? '备注' : (tab === 'review' ? '标题（可选）' : '标题');
    html += `<label class="fld"><span>标题</span><input id="f_title" value="${U.escape(d.title || '')}" placeholder="${tab === 'side' ? '如：午饭/打车' : '一句话描述'}"></label>`;

    if (tab === 'work') html += workForm(d, f.detailed);
    else if (tab === 'life') html += lifeForm(d, sub, f.detailed);
    else if (tab === 'study') html += studyForm(d, sub, f.detailed);
    else if (tab === 'side') html += financeForm(d, f.detailed);
    else if (tab === 'review') html += reviewForm(d, f.detailed);
    else if (tab === 'project') html += projectForm(d, f.detailed);
    else if (tab === 'habit') html += habitForm(d, f.detailed);
    else if (tab === 'goal') html += goalForm(d, f.detailed);

    html += `<div class="sheet__actions">
      ${f.detailed ? '' : `<button class="btn btn--ghost" id="toDetailed">详细填写 ▾</button>`}
      <button class="btn btn--primary" id="saveForm">保存</button>
    </div>`;
    if (rec) html += `<button class="btn btn--danger btn--block" id="delForm">删除这条</button>`;
    $('#sheetBody').innerHTML = html;
  }
  function workForm(d, det) {
    let h = `<div class="chips">
      ${WORK_SUB.map(s => `<button class="chip ${d.sub === s ? 'on' : ''}" data-f="sub" data-v="${s}">${s}</button>`).join('')}
    </div>
    <div class="toggle2">
      <button class="tg ${d.important ? 'on' : ''}" data-f="important">⭐ 重要</button>
      <button class="tg ${d.urgent ? 'on' : ''}" data-f="urgent">⏰ 紧急</button>
    </div>`;
    if (det) {
      const projs = S.projects();
      h += `<label class="fld"><span>所属项目</span><select id="f_project">
        <option value="">（无）</option>
        ${projs.map(p => `<option value="${p.id}" ${d.project === p.id ? 'selected' : ''}>${U.escape(p.name)}</option>`).join('')}
      </select></label>`;
      h += `<div class="chips"><span class="chips__lbl">状态</span>
        ${Object.entries(STATUS).map(([k, v]) => `<button class="chip ${d.status === k ? 'on' : ''}" data-f="status" data-v="${k}">${v}</button>`).join('')}
      </div>`;
      h += `<label class="fld"><span>截止日期</span><input id="f_due" type="date" value="${d.due || ''}"></label>`;
      h += `<label class="fld"><span>备注</span><textarea id="f_note" rows="2" placeholder="补充说明">${U.escape(d.note || '')}</textarea></label>`;
    }
    return h;
  }
  function lifeForm(d, sub, det) {
    if (sub === '运动') {
      let h = `<label class="fld"><span>运动类型</span><input id="f_title" value="${U.escape(d.title || '')}" placeholder="如：跑步/力量/瑜伽"></label>`;
      h += `<label class="fld"><span>时长(分钟)</span><input id="f_duration" type="number" inputmode="numeric" value="${d.duration || ''}" placeholder="30"></label>`;
      if (det) h += `<label class="fld"><span>消耗(千卡)</span><input id="f_kcal" type="number" inputmode="numeric" value="${d.kcal || ''}" placeholder="可选"></label>
        <label class="fld"><span>日期</span><input id="f_due" type="date" value="${d.due || ''}"></label>`;
      return h;
    }
    // 饮食
    let h = `<label class="fld"><span>食物</span><input id="f_title" value="${U.escape(d.title || '')}" placeholder="如：鸡胸肉沙拉"></label>`;
    h += `<label class="fld"><span>热量(千卡)</span><input id="f_kcal" type="number" inputmode="numeric" value="${d.kcal || ''}" placeholder="约 350"></label>`;
    if (det) h += `<label class="fld"><span>餐次</span><select id="f_meal">
        ${['早餐', '午餐', '晚餐', '加餐'].map(m => `<option ${d.meal === m ? 'selected' : ''}>${m}</option>`).join('')}
      </select></label>
      <label class="fld"><span>日期</span><input id="f_due" type="date" value="${d.due || ''}"></label>`;
    return h;
  }
  function studyForm(d, sub, det) {
    let h = `<div class="chips">
      ${STUDY_SUB.map(s => `<button class="chip ${d.sub === s ? 'on' : ''}" data-f="sub" data-v="${s}">${s === '知识' ? '知识' : s === '技能' ? '技能' : '心理'}</button>`).join('')}
    </div>`;
    if (sub === '技能') {
      h += `<label class="fld"><span>技能方向</span><input id="f_title" value="${U.escape(d.title || '')}" placeholder="如：剪映/PS/Python"></label>`;
      h += `<label class="fld"><span>时长(分钟)</span><input id="f_duration" type="number" inputmode="numeric" value="${d.duration || ''}"></label>`;
      if (det) h += noteField(d);
    } else if (sub === '心理') {
      h += `<label class="fld"><span>主题</span><input id="f_title" value="${U.escape(d.title || '')}" placeholder="如：拖延/焦虑"></label>`;
      h += noteField(d);
    } else {
      h += `<label class="fld"><span>主题</span><input id="f_title" value="${U.escape(d.title || '')}" placeholder="如：诉讼时效"></label>`;
      h += noteField(d);
    }
    if (det && sub !== '技能') {
      h += `<label class="fld"><span>时长(分钟)</span><input id="f_duration" type="number" inputmode="numeric" value="${d.duration || ''}"></label>`;
    }
    return h;
  }
  function noteField(d) { return `<label class="fld"><span>笔记/感悟</span><textarea id="f_note" rows="3" placeholder="记录要点或收获">${U.escape(d.note || '')}</textarea></label>`; }
  function financeForm(d, det) {
    const flow = d.flow || '支出';
    const cats = flow === '收入' ? FIN_CAT_IN : FIN_CAT_OUT;
    let h = `<div class="toggle2">
      <button class="tg ${flow === '收入' ? 'on' : ''}" data-f="flow" data-v="收入">＋收入</button>
      <button class="tg ${flow === '支出' ? 'on' : ''}" data-f="flow" data-v="支出">－支出</button>
    </div>
    <div class="keypad-out" id="f_amount">${d.amount || '0'}</div>
    <div class="keypad">
      ${['1','2','3','4','5','6','7','8','9','.','0','⌫'].map(k => `<button data-kp="${k}">${k}</button>`).join('')}
    </div>
    <div class="chips"><span class="chips__lbl">分类</span>
      ${cats.map(c => `<button class="chip ${d.category === c ? 'on' : ''}" data-f="category" data-v="${c}">${c}</button>`).join('')}
    </div>`;
    if (det) {
      h += `<label class="fld"><span>账户</span><select id="f_account">
        ${['现金', '微信', '支付宝', '银行卡', '其他'].map(a => `<option ${d.account === a ? 'selected' : ''}>${a}</option>`).join('')}
      </select></label>
      <label class="fld"><span>日期</span><input id="f_due" type="date" value="${d.due || ''}"></label>`;
    }
    return h;
  }
  function reviewForm(d, det) {
    let h = `<label class="fld"><span>今日完成</span><textarea id="f_done" rows="2" placeholder="做了哪些事">${U.escape(d.done || '')}</textarea></label>
      <label class="fld"><span>明日计划</span><textarea id="f_plan" rows="2" placeholder="准备做什么">${U.escape(d.plan || '')}</textarea></label>
      <label class="fld"><span>感悟 / 问题</span><textarea id="f_reflect" rows="2" placeholder="想法、卡点">${U.escape(d.reflect || '')}</textarea></label>
      <div class="stars" id="f_stars">
        ${[1,2,3,4,5].map(n => `<button data-star="${n}" class="${n <= (d.rating || 0) ? 'on' : ''}">${n <= (d.rating || 0) ? '★' : '☆'}</button>`).join('')}
      </div>`;
    return h;
  }
  function projectForm(d, det) {
    const colors = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#06b6d4', '#ef4444'];
    let h = `<label class="fld"><span>项目名称</span><input id="f_title" value="${U.escape(d.name || '')}" placeholder="如：党建宣传季"></label>
      <label class="fld"><span>描述</span><textarea id="f_note" rows="2" placeholder="一句话目标">${U.escape(d.desc || '')}</textarea></label>
      <div class="chips"><span class="chips__lbl">颜色</span>
        ${colors.map(c => `<button class="chip" data-f="color" data-v="${c}" style="background:${c};width:22px;height:22px;padding:0"></button>`).join('')}
      </div>`;
    if (det) h += `<div class="chips"><span class="chips__lbl">状态</span>
        <button class="chip ${d.status !== 'done' ? 'on' : ''}" data-f="status" data-v="active">进行中</button>
        <button class="chip ${d.status === 'done' ? 'on' : ''}" data-f="status" data-v="done">已结项</button></div>`;
    return h;
  }
  function habitForm(d, det) {
    const emojis = ['✅', '📚', '💪', '🏃', '🧘', '💧', '🌙', '🥗', '✍️', '🎯'];
    const colors = ['#4f46e5', '#10b981', '#f59e0b', '#ec4899', '#06b6d4'];
    let h = `<label class="fld"><span>习惯名称</span><input id="f_title" value="${U.escape(d.name || '')}" placeholder="如：每天读书30分"></label>
      <div class="chips"><span class="chips__lbl">图标</span>
        ${emojis.map(e => `<button class="chip ${d.emoji === e ? 'on' : ''}" data-f="emoji" data-v="${e}">${e}</button>`).join('')}</div>
      <div class="chips"><span class="chips__lbl">颜色</span>
        ${colors.map(c => `<button class="chip" data-f="color" data-v="${c}" style="background:${c};width:22px;height:22px;padding:0"></button>`).join('')}</div>`;
    return h;
  }
  function goalForm(d, det) {
    let h = `<label class="fld"><span>目标</span><input id="f_title" value="${U.escape(d.title || '')}" placeholder="如：存够1万元"></label>
      <div class="fld-row">
        <label class="fld"><span>目标值</span><input id="f_target" type="number" inputmode="numeric" value="${d.target || 100}"></label>
        <label class="fld"><span>单位</span><input id="f_unit" value="${U.escape(d.unit || '')}" placeholder="元/次"></label>
      </div>`;
    if (det) h += `<label class="fld"><span>当前进度</span><input id="f_current" type="number" inputmode="numeric" value="${d.current || 0}"></label>
      <label class="fld"><span>截止日</span><input id="f_due" type="date" value="${d.due || ''}"></label>`;
    return h;
  }

  /* ---------- 表单保存 ---------- */
  function saveForm() {
    const f = state.form; if (!f) return;
    const { tab, sub, rec } = f.ctx; const d = f.draft;
    const get = id => { const el = $('#f_' + id); return el ? el.value.trim() : (d[id] || ''); };
    const patch = { tab };
    if (tab === 'project') {
      const p = { name: get('title') || '未命名项目', desc: get('note'), color: d.color || '#6366f1', status: d.status || 'active' };
      if (rec) S.updateProject(rec.id, p); else S.addProject(p);
      afterSave();
      return;
    }
    if (tab === 'habit') {
      const h = { name: get('title') || '新习惯', emoji: d.emoji || '✅', color: d.color || '#4f46e5' };
      if (rec) S.updateHabit(rec.id, h); else S.addHabit(h);
      afterSave();
      return;
    }
    if (tab === 'goal') {
      const g = { title: get('title') || '新目标', target: +get('target') || 100, current: +get('current') || 0, unit: get('unit'), due: get('due') };
      if (rec) S.updateGoal(rec.id, g); else S.addGoal(g);
      afterSave();
      return;
    }
    patch.title = get('title');
    patch.sub = d.sub || sub || '';
    patch.note = get('note');
    patch.due = get('due') || U.today();
    patch.extra = patch.extra || {};
    if (tab === 'work') {
      patch.sub = d.sub || '党建';
      patch.important = !!d.important; patch.urgent = !!d.urgent;
      patch.status = d.status || 'todo'; patch.project = d.project || '';
    } else if (tab === 'life') {
      patch.sub = sub;
      if (sub === '饮食') { patch.extra.kcal = +get('kcal') || 0; patch.meal = get('meal'); }
      else { patch.extra.duration = +get('duration') || 0; patch.extra.kcal = +get('kcal') || 0; }
    } else if (tab === 'study') {
      patch.sub = d.sub || '知识';
      patch.extra.duration = +get('duration') || 0;
    } else if (tab === 'side') {
      patch.extra.flow = d.flow || '支出';
      patch.extra.amount = +(d.amount || 0);
      patch.extra.category = d.category || (patch.extra.flow === '收入' ? '其他' : '其他');
      patch.extra.account = d.account || '微信';
      if (!patch.title) patch.title = patch.extra.category;
    } else if (tab === 'review') {
      patch.extra = { done: get('done'), plan: get('plan'), reflect: get('reflect') };
      patch.rating = +(d.rating || 0);
      patch.due = get('due') || U.today();
    }
    if (rec) S.update(rec.id, patch); else S.add(patch);
    afterSave();
  }
  function afterSave() {
    closeSheet();
    if (window.Sync && Sync.cfg.enabled) Sync.push();
    render();
    toast('已保存');
  }

  /* ============================================================
   * 事件绑定（委托）
   * ============================================================ */
  function handleAction(e) {
    const t = e.target.closest('[data-act]');
    if (!t) return;
    // 弹窗/表单内的 data-act 由各自的监听器处理，避免重复触发
    if (t.closest('#modal') || t.closest('#sheet')) return;
    const act = t.dataset.act;
    const tab = t.dataset.tab;
    // 切换底部标签
    if (act === 'tab') { state.tab = tab; render(); return; }
    if (act === 'sub') { state.sub[tab] = t.dataset.sub; render(); return; }

    if (act === 'add') {
      const preset = {};
      if (t.dataset.imp2) preset.important = true;
      if (t.dataset.urg) preset.urgent = true;
      if (t.dataset.due === 'today') preset.due = U.today();
      openForm({ tab, sub: t.dataset.sub, mode: 'simple', preset });
      return;
    }
    if (act === 'edit') { const r = S.byId(t.dataset.id); if (r) { openForm({ tab: r.tab === 'side' ? 'side' : (r.tab === 'work' ? 'work' : r.tab), sub: r.sub, rec: r, mode: 'detailed' }); } return; }

    if (act === 'cycle') {
      const r = S.byId(t.dataset.id); if (!r) return;
      const order = ['todo', 'doing', 'done'];
      const nx = order[(order.indexOf(r.status) + 1) % 3];
      S.update(r.id, { status: nx });
      if (Sync.cfg.enabled) Sync.push();
      render(); return;
    }
    if (act === 'habit') {
      S.toggleHabit(t.dataset.id, t.dataset.date || U.today());
      if (Sync.cfg.enabled) Sync.push();
      render(); return;
    }
    if (act === 'mood') {
      S.setMood({ date: U.today(), mood: +t.dataset.m, emoji: t.dataset.e });
      if (Sync.cfg.enabled) Sync.push();
      render(); return;
    }
    if (act === 'water') { S.addWater(U.today(), +t.dataset.ml); if (Sync.cfg.enabled) Sync.push(); render(); toast('已记录饮水'); return; }
    if (act === 'waterset') { openWaterSet(); return; }
    if (act === 'goalview') { openGoalView(t.dataset.id); return; }
    if (act === 'project') { openProject(t.dataset.id); return; }
    if (act === 'editprofile') { openProfile(); return; }
    if (act === 'autoreport') { openAutoReport(); return; }
    if (act === 'learn') {
      const now = S.toggleLearned(t.dataset.date || U.today(), t.dataset.key);
      if (Sync.cfg.enabled) Sync.push();
      render();
      toast(now ? '已记录今日学习 ✓' : '已取消今日学习');
      return;
    }
    if (act === 'saveweekly') { S.add({ tab: 'work', sub: '周报', kind: 'report', title: '周报 ' + U.today(), extra: { text: t.dataset.text } }); if (Sync.cfg.enabled) Sync.push(); render(); toast('周报已保存'); return; }
  }

  /* ---------- 弹窗类 ---------- */
  function openProject(id) {
    if (!id) { openForm({ tab: 'project', mode: 'simple' }); return; }
    const p = S.projectById(id); if (!p) return;
    const tasks = S.byTab('work').filter(r => r.project === id && r.kind !== 'report');
    openModal('项目 · ' + p.name, `
      <div class="proj-detail">
        <div class="proj-detail__bar"><div class="bar"><i style="width:${S.projectProgress(id)}%;background:${p.color}"></i></div><span>${S.projectProgress(id)}%</span></div>
        <div class="chips"><button class="chip ${p.status !== 'done' ? 'on' : ''}" data-pcmd="pstatus" data-v="active">进行中</button>
          <button class="chip ${p.status === 'done' ? 'on' : ''}" data-pcmd="pstatus" data-v="done">已结项</button></div>
        <div class="section-bar"><h2>任务（${tasks.length}）</h2><span class="more" data-pcmd="padd">＋</span></div>
        ${tasks.length ? tasks.map(r => taskLine(r)).join('') : `<div class="empty">暂无任务</div>`}
        <button class="btn btn--danger btn--block" data-pcmd="pdel">删除项目</button>
      </div>`);
  }
  function openGoalView(id) {
    const g = S.goalById(id); if (!g) return;
    const pct = Math.min(100, Math.round(g.current / g.target * 100));
    openModal('目标 · ' + g.title, `
      <div class="goal-detail">
        <div class="bar big"><i style="width:${pct}%;background:${g.color}"></i></div>
        <div class="goal-detail__num">${g.current} / ${g.target} ${g.unit}</div>
        <div class="fld-row">
          <button class="btn btn--primary" data-gcmd="gadd" data-v="-10">－10</button>
          <button class="btn btn--primary" data-gcmd="gadd" data-v="10">＋10</button>
          <input id="gstep" class="mini-input" type="number" value="10" style="width:60px">
          <button class="btn btn--primary" data-gcmd="gaddcustom">＋自定义</button>
        </div>
        <button class="btn btn--danger btn--block" data-gcmd="gdel">删除目标</button>
      </div>`);
  }
  function openProfile() {
    const p = S.getProfile();
    openModal('身体数据（用于减脂计算）', `
      <label class="fld"><span>性别</span><select id="pf_gender">
        <option value="male" ${p.gender !== 'female' ? 'selected' : ''}>男</option>
        <option value="female" ${p.gender === 'female' ? 'selected' : ''}>女</option></select></label>
      <div class="fld-row">
        <label class="fld"><span>身高(cm)</span><input id="pf_h" type="number" value="${p.height || 170}"></label>
        <label class="fld"><span>体重(kg)</span><input id="pf_w" type="number" value="${p.weight || 65}"></label>
      </div>
      <div class="fld-row">
        <label class="fld"><span>年龄</span><input id="pf_age" type="number" value="${p.age || 30}"></label>
        <label class="fld"><span>活动量</span><select id="pf_act">
          ${[['1.2', '久坐'], ['1.375', '轻度'], ['1.55', '中度'], ['1.725', '高度'], ['1.9', '极高']].map(([v, n]) => `<option value="${v}" ${(+p.activity || 1.55) === +v ? 'selected' : ''}>${n}</option>`).join('')}
        </select></label>
      </div>
      <button class="btn btn--primary btn--block" id="pfSave">保存</button>`);
  }
  function openWaterSet() {
    const cur = S.getWater(U.today());
    openModal('设定今日饮水', `
      <div class="fld-row">
        <input id="wsVal" class="mini-input" type="number" value="${cur}" style="flex:1">
        <span>ml（目标2500）</span>
      </div>
      <div class="chips"><button class="chip" data-ws="0">清零</button><button class="chip" data-ws="2500">达标</button></div>
      <button class="btn btn--primary btn--block" id="wsSave">保存</button>`);
  }
  function openAutoReport() {
    openModal('自动复盘报告', viewAutoReport(state.reportRange || 'week'));
  }

  /* ============================================================
   * 表单内交互（委托到 sheetBody / modal）
   * ============================================================ */
  function bindFormInteractions() {
    // sheet 内的所有交互统一委托到 #sheetBody（表单每次重渲染都会重建内部元素，
    // 若只在启动时绑定会因元素不存在而永久失效，导致“保存/删除/展开详细”按钮点了没反应）
    $('#sheetBody').addEventListener('click', e => {
      if (e.target.closest('#toDetailed')) { state.form.detailed = true; renderForm(); return; }
      if (e.target.closest('#saveForm')) { saveForm(); return; }
      if (e.target.closest('#delForm')) {
        const r = state.form.ctx.rec; if (r) { S.remove(r.id); if (Sync.cfg.enabled) Sync.push(); }
        closeSheet(); render(); toast('已删除'); return;
      }
      const chip = e.target.closest('[data-f]');
      if (chip) {
        const f = chip.dataset.f, v = chip.dataset.v;
        state.form.draft[f] = (f === 'important' || f === 'urgent') ? !state.form.draft[f] : v;
        if (f === 'flow') { state.form.draft.flow = v; state.form.draft.category = ''; }
        if (f === 'color' && state.form.ctx.tab === 'project') state.form.draft.color = v;
        renderForm(); return;
      }
      const kp = e.target.closest('[data-kp]');
      if (kp) {
        let cur = String(state.form.draft.amount || '0');
        const k = kp.dataset.kp;
        if (k === '⌫') cur = cur.length > 1 ? cur.slice(0, -1) : '0';
        else if (k === '.') cur = cur.includes('.') ? cur : cur + '.';
        else cur = (cur === '0' ? k : cur + k);
        state.form.draft.amount = cur;
        const out = $('#f_amount'); if (out) out.textContent = cur;
        return;
      }
      const star = e.target.closest('[data-star]');
      if (star) { state.form.draft.rating = +star.dataset.star; renderForm(); return; }
    });
    $('#sheetBody').addEventListener('input', e => {
      const id = e.target.id;
      if (id === 'f_title') state.form.draft.title = e.target.value;
      if (id === 'f_note') state.form.draft.note = e.target.value;
      if (id === 'f_due') state.form.draft.due = e.target.value;
      if (id === 'f_project') state.form.draft.project = e.target.value;
      if (id === 'f_duration') state.form.draft.duration = e.target.value;
      if (id === 'f_kcal') state.form.draft.kcal = e.target.value;
      if (id === 'f_meal') state.form.draft.meal = e.target.value;
      if (id === 'f_account') state.form.draft.account = e.target.value;
      if (id === 'f_done') state.form.draft.done = e.target.value;
      if (id === 'f_plan') state.form.draft.plan = e.target.value;
      if (id === 'f_reflect') state.form.draft.reflect = e.target.value;
    });
  }

  function bindModalInteractions() {
    // 统一委托到 #modalBody：弹窗内容每次 openModal 都会重建，若只在启动时绑定按钮会因元素
    // 不存在而永久失效，导致“保存身体数据 / 设定饮水 / 同步设置保存”点了没反应。
    $('#modalBody').addEventListener('click', e => {
      // 自动报告：切换区间 / 保存
      const rr = e.target.closest('[data-act="reportrange"]');
      if (rr) { $('#modalBody').innerHTML = viewAutoReport(rr.dataset.range); return; }
      const sv = e.target.closest('[data-act="savereport"]');
      if (sv) {
        const rep = buildAutoReport(sv.dataset.range);
        S.add({ tab: 'review', sub: '报告', kind: 'report', title: '复盘报告 ' + U.today(), rating: 0, extra: { text: rep.insights.join('\n'), stats: rep.stats } });
        if (Sync.cfg.enabled) Sync.push(); closeModal(); render(); toast('报告已保存'); return;
      }
      // 项目弹窗命令
      const pc = e.target.closest('[data-pcmd]');
      if (pc) {
        const cmd = pc.dataset.pcmd, id = currentModalProjectId;
        if (cmd === 'pstatus') { S.updateProject(id, { status: pc.dataset.v }); openProject(id); if (Sync.cfg.enabled) Sync.push(); }
        if (cmd === 'padd') { closeModal(); openForm({ tab: 'work', mode: 'simple', preset: { project: id } }); }
        if (cmd === 'pdel') { S.removeProject(id); closeModal(); render(); if (Sync.cfg.enabled) Sync.push(); }
        return;
      }
      const gc = e.target.closest('[data-gcmd]');
      if (gc) {
        const id = currentModalGoalId, g = S.goalById(id); if (!g) return;
        if (gc.dataset.gcmd === 'gadd') S.addGoalProgress(id, +gc.dataset.v);
        if (gc.dataset.gcmd === 'gaddcustom') { const v = +($('#gstep').value || 0); S.addGoalProgress(id, v); }
        if (gc.dataset.gcmd === 'gdel') { S.removeGoal(id); closeModal(); render(); if (Sync.cfg.enabled) Sync.push(); return; }
        openGoalView(id); if (Sync.cfg.enabled) Sync.push();
        return;
      }
      const ws = e.target.closest('[data-ws]');
      if (ws) { $('#wsVal').value = ws.dataset.ws; return; }
      // 身体数据保存（减脂计算）
      if (e.target.closest('#pfSave')) {
        S.setProfile({
          gender: $('#pf_gender').value, height: +$('#pf_h').value, weight: +$('#pf_w').value,
          age: +$('#pf_age').value, activity: +$('#pf_act').value
        });
        closeModal(); render(); if (Sync.cfg.enabled) Sync.push(); toast('身体数据已保存'); return;
      }
      // 饮水设定保存
      if (e.target.closest('#wsSave')) {
        S.setWater(U.today(), +($('#wsVal').value || 0)); closeModal(); render(); if (Sync.cfg.enabled) Sync.push(); toast('饮水已设定'); return;
      }
      // 同步设置：关闭 / 保存
      if (e.target.closest('#syncClose')) { closeModal(); return; }
      if (e.target.closest('#syncSave')) {
        Sync.update({
          enabled: $('#syncOn').checked,
          url: $('#syncUrl').value.trim(),
          room: $('#syncRoom').value.trim()
        });
        toast('同步已更新'); setTimeout(closeModal, 600); return;
      }
    });
  }
  let currentModalProjectId = null, currentModalGoalId = null;

  /* ============================================================
   * 启动 / 绑定
   * ============================================================ */
  function bindGlobal() {
    $$('.tabbar__item').forEach(b => b.addEventListener('click', () => { state.tab = b.dataset.tab; render(); }));
    document.addEventListener('click', handleAction);
    // FAB 动作面板
    $('#fab').addEventListener('click', openActionSheet);
    $('#actionCancel').addEventListener('click', () => { $('#actionSheet').hidden = true; });
    $('#actionSheet').addEventListener('click', e => { if (e.target.id === 'actionSheet') $('#actionSheet').hidden = true; });
    // 表单关闭
    $('#sheetClose').addEventListener('click', closeSheet);
    $('#sheet').addEventListener('click', e => { if (e.target.id === 'sheet') closeSheet(); });
    // 弹窗关闭
    $('#modalClose').addEventListener('click', () => { currentModalProjectId = null; currentModalGoalId = null; closeModal(); });
    $('#modal').addEventListener('click', e => { if (e.target.id === 'modal') { currentModalProjectId = null; currentModalGoalId = null; closeModal(); } });
    // 导出/导入
    $('#exportBtn').addEventListener('click', () => {
      const blob = new Blob([S.exportJSON()], { type: 'application/json' });
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
      a.download = 'workbench-' + U.today() + '.json'; a.click(); toast('已导出');
    });
    $('#importBtn').addEventListener('click', () => $('#importFile').click());
    $('#importFile').addEventListener('change', e => {
      const file = e.target.files[0]; if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try { const n = S.importJSON(reader.result); toast(`已导入 ${n} 条记录`); if (Sync.cfg.enabled) Sync.push(); render(); }
        catch (err) { toast('导入失败：' + err.message); }
      };
      reader.readAsText(file);
    });
    // 天气
    $('#weatherChip').addEventListener('click', async () => {
      const city = prompt('输入城市名（如：上海、广州）：', S.getWeatherCity() || '北京');
      if (city) { S.setWeatherCity(city); fetchWeather(); }
    });
    // 同步
    $('#syncBtn').addEventListener('click', openSyncModal);
    bindFormInteractions();
    bindModalInteractions();
  }

  function openActionSheet() {
    const items = [
      ['work', '💼', '工作记录'], ['project', '🗂️', '项目'], ['life', '🌿', '饮食'], ['sport', '🏃', '运动'],
      ['water', '💧', '饮水+250'], ['study', '📚', '学习笔记'], ['side', '💰', '记一笔'], ['review', '📝', '复盘'],
      ['habit', '✅', '习惯'], ['goal', '🎯', '目标'], ['mood', '😊', '心情']
    ];
    $('#actionGrid').innerHTML = items.map(([t, i, n]) => {
      if (t === 'water') return `<button class="action-cell" data-act="water" data-ml="250"><span>${i}</span>${n}</button>`;
      if (t === 'mood') return `<button class="action-cell" data-act="mood" data-m="4" data-e="🙂"><span>${i}</span>${n}</button>`;
      if (t === 'sport') return `<button class="action-cell" data-act="add" data-tab="life" data-sub="运动"><span>${i}</span>${n}</button>`;
      return `<button class="action-cell" data-act="add" data-tab="${t}"><span>${i}</span>${n}</button>`;
    }).join('');
    $('#actionSheet').hidden = false;
  }

  /* ---------- 同步设置弹窗 ---------- */
  function openSyncModal() {
    const c = Sync.cfg;
    openModal('多端同步', `
      <div class="switch-row"><span>启用同步</span><input type="checkbox" id="syncOn" ${c.enabled ? 'checked' : ''}></div>
      <label class="fld"><span>服务器地址</span><input id="syncUrl" placeholder="http://192.168.1.50:8787" value="${U.escape(c.url || '')}"></label>
      <label class="fld"><span>房间密钥</span><input id="syncRoom" placeholder="自定义一串字符" value="${U.escape(c.room || '')}"></label>
      <div class="sync-status">状态：<span id="syncStatusText">未同步</span></div>
      <div class="modal__actions">
        <button class="btn btn--ghost" id="syncClose">关闭</button>
        <button class="btn btn--primary" id="syncSave">保存并同步</button>
      </div>`);
    currentModalProjectId = null; currentModalGoalId = null;
    $('#syncClose').addEventListener('click', closeModal);
    $('#syncSave').addEventListener('click', () => {
      Sync.update({
        enabled: $('#syncOn').checked,
        url: $('#syncUrl').value.trim(),
        room: $('#syncRoom').value.trim()
      });
      toast('同步已更新');
      setTimeout(closeModal, 600);
    });
  }

  /* ---------- 项目/目标弹窗 id 记录 ---------- */
  const _openProject = openProject;
  openProject = function (id) { currentModalProjectId = id; _openProject(id); };
  const _openGoalView = openGoalView;
  openGoalView = function (id) { currentModalGoalId = id; _openGoalView(id); };

  /* ============================================================
   * 启动
   * ============================================================ */
  bindGlobal();
  render();
  fetchWeather();
  if (window.Sync) Sync.init();
})();
