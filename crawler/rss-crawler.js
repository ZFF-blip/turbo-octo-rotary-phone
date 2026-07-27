#!/usr/bin/env node
'use strict';
/*
 * rss-crawler.js — 零依赖 RSS/Atom 爬虫
 * 抓取 feeds.config.json 中配置的免费源（含微信公众号 RSS 镜像），
 * 解析后按类目合并去重、按日期取最新 N 条，写入 ../feeds.json。
 * 不调用任何 LLM / 大模型 API —— 完全零 token。
 *
 * 用法： node crawler/rss-crawler.js
 * 定时： 见 .github/workflows/rss.yml（每日自动跑并提交 feeds.json）
 */
const fs = require('fs');
const path = require('path');

const CONFIG = path.join(__dirname, 'feeds.config.json');
const OUTPUT = path.join(__dirname, '..', 'feeds.json');
const PER_CAT = 10;     // 每个类目保留的最新条数
const TIMEOUT = 12000;  // 单源抓取超时（ms）

/* ---------- 工具：解码 / 去标签 ---------- */
function decode(s) {
  if (!s) return '';
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, n) => String.fromCharCode(parseInt(n, 16)))
    .replace(/&amp;/g, '&');
}
function stripHtml(s) {
  return decode(s || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}
function pick(block, re) { const m = block.match(re); return m ? m[1] : ''; }

/* ---------- 抓取单源 ---------- */
async function fetchFeed(url) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIMEOUT);
  try {
    const r = await fetch(url, {
      signal: ctrl.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (personal-workbench rss-crawler)' }
    });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return await r.text();
  } finally { clearTimeout(t); }
}

/* ---------- 解析 RSS 2.0 / Atom ---------- */
function parseFeed(xml, sourceName) {
  const items = [];
  const isAtom = /<feed[\s>]/.test(xml);
  const blocks = xml.match(isAtom
    ? /<entry[\s>][\s\S]*?<\/entry>/gi
    : /<item[\s>][\s\S]*?<\/item>/gi) || [];
  for (const b of blocks) {
    const title = decode(pick(b, /<title[^>]*>([\s\S]*?)<\/title>/i));
    let link = '';
    const atomLink = b.match(/<link\b[^>]*?href="([^"]+)"[^>]*>/i);
    if (atomLink) link = atomLink[1];
    else link = decode(pick(b, /<link[^>]*>([\s\S]*?)<\/link>/i));
    const desc =
      pick(b, /<description[^>]*>([\s\S]*?)<\/description>/i) ||
      pick(b, /<summary[^>]*>([\s\S]*?)<\/summary>/i) ||
      pick(b, /<content:encoded[^>]*>([\s\S]*?)<\/content:encoded>/i) ||
      pick(b, /<content[^>]*>([\s\S]*?)<\/content>/i);
    const summary = stripHtml(desc).slice(0, 200);
    const dateRaw =
      pick(b, /<pubDate[^>]*>([\s\S]*?)<\/pubDate>/i) ||
      pick(b, /<published[^>]*>([\s\S]*?)<\/published>/i) ||
      pick(b, /<updated[^>]*>([\s\S]*?)<\/updated>/i) ||
      pick(b, /<dc:date[^>]*>([\s\S]*?)<\/dc:date>/i);
    const date = dateRaw ? Date.parse(decode(dateRaw)) : 0;
    if (title && link) items.push({ title, link, summary, date, source: sourceName });
  }
  return items;
}

/* ---------- 主流程 ---------- */
(async () => {
  let cfg;
  try { cfg = JSON.parse(fs.readFileSync(CONFIG, 'utf8')); }
  catch (e) { console.error('读取配置失败：', e.message); process.exit(1); }

  const cats = Object.keys(cfg).filter(k => !k.startsWith('_'));
  const out = { updated: new Date().toISOString(), categories: {} };

  for (const cat of cats) {
    const list = cfg[cat] || [];
    let merged = [];
    for (const f of list) {
      try {
        const xml = await fetchFeed(f.url);
        const items = parseFeed(xml, f.name || cat);
        merged = merged.concat(items);
        console.log(`  ✓ ${cat} / ${f.name} : ${items.length} 条`);
      } catch (e) {
        console.log(`  ✗ ${cat} / ${f.name} : ${e.message}（已跳过）`);
      }
    }
    // 去重（按链接）
    const seen = new Set();
    merged = merged.filter(it => {
      if (!it.link || seen.has(it.link)) return false;
      seen.add(it.link); return true;
    });
    merged.sort((a, b) => (b.date || 0) - (a.date || 0));
    out.categories[cat] = merged.slice(0, PER_CAT);
  }

  fs.writeFileSync(OUTPUT, JSON.stringify(out, null, 2));
  const total = Object.values(out.categories).reduce((s, a) => s + a.length, 0);
  console.log(`\n完成：写入 ${OUTPUT}（共 ${total} 条，更新于 ${out.updated}）`);
})();
