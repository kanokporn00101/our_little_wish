// เซิร์ฟเวอร์เล็ก ๆ สำหรับ "กระทงน้อยของเรา" — ไม่ต้องติดตั้งแพ็กเกจเพิ่ม
// รัน: node server.js   แล้วเปิด http://localhost:3000
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const DATA_FILE = process.env.DATA_FILE || path.join(__dirname, 'data.json');
const STYLES = ['lotus', 'white', 'leaf', 'fortune'];
const MAX_PER_ROOM = 12;
const KEEP_MS = 7 * 24 * 3600 * 1000;
const PUBLIC_FILES = new Set(['index.html', 'style.css', 'script.js', 'music.mp3']);
const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mp3': 'audio/mpeg' };

let rooms = {};
try { rooms = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); } catch (e) { rooms = {}; }

function prune() {
  const now = Date.now();
  for (const code of Object.keys(rooms)) {
    rooms[code] = rooms[code].filter(k => now - k.at < KEEP_MS);
    if (!rooms[code].length) delete rooms[code];
  }
}
let timer = null;
function save() {
  clearTimeout(timer);
  timer = setTimeout(() => { prune(); fs.writeFile(DATA_FILE, JSON.stringify(rooms), () => {}); }, 400);
}
const clean = (s, n) => String(s == null ? '' : s).replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, n);
const validRoom = c => /^[\w\u4e00-\u9fa5\u0e00-\u0e7f-]{1,24}$/.test(c);

function send(res, code, obj) {
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(obj));
}

http.createServer((req, res) => {
  const url = new URL(req.url, 'http://x');
  const m = url.pathname.match(/^\/api\/rooms\/([^/]+)$/);
  if (m) {
    let code; try { code = decodeURIComponent(m[1]); } catch (e) { return send(res, 400, { error: 'bad room' }); }
    if (!validRoom(code)) return send(res, 400, { error: 'bad room' });
    if (req.method === 'GET') return send(res, 200, { krathongs: rooms[code] || [] });
    if (req.method === 'POST') {
      let body = '';
      req.on('data', d => { body += d; if (body.length > 4096) req.destroy(); });
      req.on('end', () => {
        let j; try { j = JSON.parse(body); } catch (e) { return send(res, 400, { error: 'bad json' }); }
        const id = clean(j.id, 40);
        if (!/^[\w-]{8,40}$/.test(id)) return send(res, 400, { error: 'bad id' });
        const list = rooms[code] = rooms[code] || [];
        const old = list.find(k => k.id === id);
        if (old) return send(res, 200, { krathong: old }); // ปล่อยได้ใบเดียว ไม่เขียนทับ
        if (list.length >= MAX_PER_ROOM) return send(res, 429, { error: 'room full' });
        const wish = clean(j.wish, 200);
        if (!wish) return send(res, 400, { error: 'empty wish' });
        const k = { id, name: clean(j.name, 16) || '无名', style: STYLES.includes(j.style) ? j.style : 'lotus', wish, at: Date.now() };
        list.push(k); save();
        send(res, 201, { krathong: k });
      });
      return;
    }
    return send(res, 405, { error: 'method' });
  }
  // ไฟล์หน้าเว็บ
  let name = url.pathname === '/' ? 'index.html' : url.pathname.slice(1);
  if (!PUBLIC_FILES.has(name)) { res.writeHead(404); return res.end('Not found'); }
  fs.readFile(path.join(__dirname, name), (err, buf) => {
    if (err) { res.writeHead(404); return res.end('Not found'); }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(name)] || 'application/octet-stream' });
    res.end(buf);
  });
}).listen(PORT, () => console.log('กระทงน้อยของเรา: http://localhost:' + PORT));
