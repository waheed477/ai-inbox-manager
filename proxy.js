const http = require('http');
const httpProxy = require('http-proxy');

// Create proxy server
const proxy = httpProxy.createProxyServer({});

// Target ports
const BACKEND = 'http://localhost:3000';
const FRONTEND = 'http://localhost:5173';

const server = http.createServer((req, res) => {
  const url = req.url;

  // Route /api to backend, everything else to frontend
  if (url.startsWith('/api/')) {
    proxy.web(req, res, { target: BACKEND });
  } else {
    proxy.web(req, res, { target: FRONTEND });
  }
});

// Handle proxy errors
proxy.on('error', (err, req, res) => {
  console.error('Proxy error:', err);
  res.writeHead(502);
  res.end('Bad gateway');
});

// Listen on Hugging Face's default port
server.listen(7860, () => {
  console.log('Reverse proxy running on port 7860');
});