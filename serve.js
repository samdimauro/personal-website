const http = require('http');
const fs = require('fs');
const path = require('path');
const dir = path.dirname(__filename);
const mime = { '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.pdf': 'application/pdf' };

function tryPaths(base, candidates, res) {
  const fp = candidates.shift();
  if (!fp) { res.writeHead(404); res.end('Not found'); return; }
  fs.readFile(path.join(base, fp), (err, data) => {
    if (err) { tryPaths(base, candidates, res); return; }
    const ext = path.extname(fp);
    res.writeHead(200, { 'Content-Type': mime[ext] || 'text/plain' });
    res.end(data);
  });
}

http.createServer((req, res) => {
  const raw = req.url === '/' ? '/index.html' : req.url.split('?')[0];
  const candidates = [raw, raw + '.html', raw + '/index.html'];
  tryPaths(dir, candidates, res);
}).listen(process.env.PORT || 3001, () => console.log('Serving on ' + (process.env.PORT || 3001)));
