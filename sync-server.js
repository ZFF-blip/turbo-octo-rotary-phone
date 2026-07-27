/* ============================================================
 * 个人工作台 - 轻量同步服务器（零依赖 Node）
 * 用法：
 *   node sync-server.js                # 默认端口 8787，数据存 ./sync-data
 *   PORT=9000 node sync-server.js
 * 两端（手机/电脑）在 App 的「同步设置」里填同一个
 *   服务器地址：http://<这台电脑的IP>:8787
 *   房间密钥：任意自定义字符串（两端一致即可共享数据）
 * 说明：房间密钥即命名空间 + 访问口令，知道密钥才能读写该房间。
 * ============================================================ */
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = process.env.PORT || 8787;
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'sync-data');
fs.mkdirSync(DATA_DIR, { recursive: true });

function roomFile(room) {
  const h = crypto.createHash('sha256').update('pwb-sync:' + room).digest('hex');
  return path.join(DATA_DIR, h + '.json');
}

function send(res, code, obj, extra) {
  const headers = Object.assign({
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  }, extra || {});
  res.writeHead(code, headers);
  res.end(JSON.stringify(obj));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let d = '';
    req.on('data', c => { d += c; if (d.length > 50 * 1024 * 1024) req.destroy(); });
    req.on('end', () => resolve(d));
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') { send(res, 204, {}); return; }

  let url;
  try { url = new URL(req.url, 'http://localhost'); } catch (e) { send(res, 400, { error: 'bad url' }); return; }
  const room = url.searchParams.get('room');
  if (!room) { send(res, 400, { error: 'room required' }); return; }
  const file = roomFile(room);

  if (req.method === 'GET') {
    if (fs.existsSync(file)) {
      try { send(res, 200, JSON.parse(fs.readFileSync(file, 'utf8'))); }
      catch (e) { send(res, 200, { records: [] }); }
    } else {
      send(res, 200, { records: [] });
    }
    return;
  }

  if (req.method === 'POST') {
    try {
      const raw = await readBody(req);
      const data = JSON.parse(raw || '{}');
      data.updatedAt = Date.now();
      if (!Array.isArray(data.records)) data.records = [];
      fs.writeFileSync(file, JSON.stringify(data, null, 2));
      send(res, 200, { ok: true, count: data.records.length, updatedAt: data.updatedAt });
    } catch (e) {
      send(res, 400, { error: e.message });
    }
    return;
  }

  send(res, 405, { error: 'method not allowed' });
});

server.listen(PORT, () => {
  console.log('✅ 个人工作台同步服务器已启动');
  console.log('   地址: http://localhost:' + PORT);
  console.log('   数据目录: ' + DATA_DIR);
  console.log('   在 App 的「同步设置」中填入此地址 + 相同房间密钥即可多端同步。');
});
