const http = require('http'), fs = require('fs'), path = require('path'); const { chromium } = require('playwright'); const root = process.cwd(), PORT = +(process.env.TPORT || 8942);
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.woff2': 'font/woff2' };
const srv = http.createServer((q, r) => { const f = path.join(root, decodeURIComponent(q.url.split('?')[0])); fs.readFile(f, (e, b) => { if (e) { r.writeHead(404); r.end(); return; } r.writeHead(200, { 'content-type': mime[path.extname(f)] || 'application/octet-stream' }); r.end(b); }); });
(async () => { await new Promise(k => srv.listen(PORT, k)); const br = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist', '--enable-unsafe-swiftshader'] });
  fs.mkdirSync(path.join(root, 'thumbs'), { recursive: true });
  for (const [ep, v, n] of (process.argv[2] || '1,2,3').split(',').flatMap(e => [[+e, 0, 'Ep' + e + '_Thumbnail_16x9'], [+e, 1, 'Ep' + e + '_Thumbnail_Vertical']])) {
    const pg = await br.newPage({ viewport: { width: 1200, height: 1000 } }); pg.on('pageerror', e => console.log('PAGEERR', e.message)); pg.on('console', m => { if (m.type() === 'error') console.log('CON', m.text()); });
    await pg.goto(`http://localhost:${PORT}/thumb.html`); await pg.waitForFunction('window.ready===true', null, { timeout: 120000 });
    const b = await pg.evaluate(([e, v]) => window.thumb(e, !!v), [ep, v]); fs.writeFileSync(path.join(root, 'thumbs', n + '.png'), Buffer.from(b, 'base64')); console.log(n); await pg.close();
  } await br.close(); srv.close(); })();
