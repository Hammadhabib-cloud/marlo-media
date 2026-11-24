// usage: node render.js still t1,t2,...   |   node render.js scenes [idA,idB]
const http = require('http'), fs = require('fs'), path = require('path'), { spawn } = require('child_process');
const { chromium } = require('playwright');
const root = process.cwd(), FPS = 30, PORT = +(process.env.PORT || 8941);
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.woff2': 'font/woff2' };
const srv = http.createServer((q, r) => { const f = path.join(root, decodeURIComponent(q.url.split('?')[0]).replace(/^\/$/, '/index.html')); fs.readFile(f, (e, b) => { if (e) { r.writeHead(404); r.end(); } else { r.writeHead(200, { 'content-type': mime[path.extname(f)] || 'application/octet-stream' }); r.end(b); } }); });
(async () => {
  await new Promise(k => srv.listen(PORT, k));
  const br = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist', '--enable-unsafe-swiftshader'] });
  const pg = await br.newPage({ viewport: { width: 1080, height: 1920 } });
  pg.on('pageerror', e => console.log('PAGEERR', e.message)); pg.on('console', m => { if (m.type() === 'error') console.log('CON', m.text()); });
  await pg.goto(`http://localhost:${PORT}/index.html`);
  await pg.waitForFunction('window.ready===true', null, { timeout: 120000 });
  const [mode, arg] = process.argv.slice(2);
  if (mode === 'sheet') { const b = await pg.evaluate(() => window.charSheet()); fs.writeFileSync(path.join(root, 'Marlo_Character_Sheet.png'), Buffer.from(b, 'base64')); console.log('sheet ok'); }
  else if (mode === 'still') {
    fs.mkdirSync(path.join(root, 'stills'), { recursive: true });
    for (const t of arg.split(',').map(Number)) { const t0 = Date.now(); const b = await pg.evaluate(t => window.renderAt(t), t); fs.writeFileSync(path.join(root, `stills/t${String(t).padStart(5, '0')}.jpg`), Buffer.from(b, 'base64')); console.log('t', t, Date.now() - t0, 'ms'); }
  } else {
    fs.mkdirSync(path.join(root, 'parts'), { recursive: true });
    const list = await pg.evaluate(() => window.sceneList);
    const want = arg ? arg.split(',') : null;
    for (let si = 0; si < list.length; si++) {
      const s = list[si]; if (want && !want.includes(s.id)) continue;
      const final = path.join(root, `parts/${String(si).padStart(2, '0')}_${s.id}.mp4`);
      if (fs.existsSync(final) && !want) { console.log('skip', s.id); continue; }
      const tmp = final.replace(/\.mp4$/, '.tmp.mp4');
      const f0 = Math.round(s.start * FPS), f1 = Math.round(s.end * FPS);
      const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-', '-c:v', 'libx264', '-crf', '18', '-preset', 'veryfast', '-pix_fmt', 'yuv420p', '-r', String(FPS), tmp], { stdio: ['pipe', 'inherit', 'inherit'] });
      const done = new Promise(k => ff.on('exit', k));
      await pg.evaluate(id => window.dropOthers(id), s.id);
      const t0 = Date.now();
      for (let f = f0; f < f1; f++) {
        const b = await pg.evaluate(t => window.renderAt(t), (f + .5) / FPS);
        if (!ff.stdin.write(Buffer.from(b, 'base64'))) await new Promise(k => ff.stdin.once('drain', k));
      }
      ff.stdin.end(); const code = await done;
      if (code === 0) fs.renameSync(tmp, final);
      console.log('scene', s.id, f1 - f0, 'frames', Math.round((Date.now() - t0) / (f1 - f0)), 'ms/f', 'exit', code);
    }
  }
  await br.close(); srv.close();
})().catch(e => { console.error(e); process.exit(1); });
