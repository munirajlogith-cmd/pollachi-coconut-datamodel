/**
 * Pollachi Coconut Information System - Backend Server
 * 
 * Features:
 * 1. RESTful APIs for dataset retrieval and persistence.
 * 2. Role-based Authentication with session tokens.
 * 3. File System synchronization: Dynamic reads and writes on 'data/pollachi_datasets.json'.
 * 4. Static asset delivery with Cache-Control headers.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 5000;
const DATA_FILE = path.join(__dirname, 'data', 'pollachi_datasets.json');
const CSV_FILE = path.join(__dirname, 'data', 'pollachi_datasets.csv');

// Authorized Credentials (Student Access)
const VALID_USERS = [
  { username: 'student', password: 'student123', name: 'Student', role: 'student' },
  { username: 'admin', password: 'admin123', name: 'Student', role: 'student' },
  { username: 'user', password: 'user123', name: 'Student', role: 'student' }
];

const activeSessions = new Set(['session-student-token']);

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.csv': 'text/csv; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

function getRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        resolve(body);
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Cache-Control': 'no-cache, no-store, must-revalidate'
  });
  res.end(JSON.stringify(data));
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    return res.end();
  }

  // POST /api/auth/login
  if (pathname === '/api/auth/login' && method === 'POST') {
    const { username, password } = await getRequestBody(req);
    const user = VALID_USERS.find(
      u => u.username.toLowerCase() === (username || '').toLowerCase() && u.password === password
    );

    if (user) {
      const token = `token-${user.role}-${Date.now()}`;
      activeSessions.add(token);
      return sendJson(res, 200, {
        success: true,
        message: 'Authentication successful',
        token,
        user: {
          username: user.username,
          name: user.name,
          role: user.role
        }
      });
    } else {
      return sendJson(res, 401, {
        success: false,
        message: 'Invalid User ID or Password.'
      });
    }
  }

  // GET /api/auth/status
  if (pathname === '/api/auth/status' && method === 'GET') {
    const authHeader = req.headers['authorization'] || '';
    const token = authHeader.replace('Bearer ', '');
    if (activeSessions.has(token) || token.startsWith('token-')) {
      return sendJson(res, 200, {
        authenticated: true,
        role: 'student',
        username: 'student',
        name: 'Student'
      });
    }
    return sendJson(res, 200, { authenticated: false });
  }

  // GET /api/coconut/data
  if (pathname === '/api/coconut/data' && method === 'GET') {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const fileContent = fs.readFileSync(DATA_FILE, 'utf8');
        const jsonData = JSON.parse(fileContent);
        return sendJson(res, 200, {
          success: true,
          lastModified: fs.statSync(DATA_FILE).mtime,
          data: jsonData
        });
      } else {
        return sendJson(res, 404, { success: false, message: 'Dataset file not found' });
      }
    } catch (err) {
      return sendJson(res, 500, { success: false, message: 'File system error', error: err.message });
    }
  }

  // POST /api/coconut/update
  if (pathname === '/api/coconut/update' && method === 'POST') {
    try {
      const updatedData = await getRequestBody(req);
      if (!updatedData || !updatedData.yearly_data) {
        return sendJson(res, 400, { success: false, message: 'Invalid payload structure' });
      }

      updatedData.metadata = updatedData.metadata || {};
      updatedData.metadata.last_updated = new Date().toISOString();

      fs.writeFileSync(DATA_FILE, JSON.stringify(updatedData, null, 2), 'utf8');

      if (Array.isArray(updatedData.yearly_data)) {
        const header = "Year,Area_Ha,Production_Cr_Nuts,Yield_Per_Palm,Copra_Price_Qtl,Tender_Price_Nut,Drip_Irrigation_Pct,Daily_Harvest_Lakhs\n";
        const rows = updatedData.yearly_data.map(d =>
          [d.year, d.area_ha || d.areaHa, d.production_cr || d.productionCr, d.yield_per_palm || d.yieldPalm, d.copra_price_qtl || d.copraPrice, d.tender_price_nut || d.tenderPrice, d.drip_pct || d.dripPct, d.daily_harvest_lakhs || d.dailyHarvestLakh].join(',')
        ).join('\n');
        fs.writeFileSync(CSV_FILE, header + rows, 'utf8');
      }

      return sendJson(res, 200, {
        success: true,
        message: 'Records successfully updated and saved to disk.',
        data: updatedData
      });
    } catch (err) {
      return sendJson(res, 500, { success: false, message: 'Update failed', error: err.message });
    }
  }

  // GET /api/weather/live
  if (pathname === '/api/weather/live' && method === 'GET') {
    const weatherUrl = "https://api.open-meteo.com/v1/forecast?latitude=10.6586&longitude=77.0084&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&timezone=auto";
    const fallback = {
      current: { temperature_2m: 29.0, relative_humidity_2m: 68, wind_speed_10m: 12.0, precipitation: 0.0, weather_code: 2 }
    };

    try {
      const https = require('https');
      https.get(weatherUrl, apiRes => {
        let raw = '';
        apiRes.on('data', c => { raw += c; });
        apiRes.on('end', () => {
          try {
            return sendJson(res, 200, JSON.parse(raw));
          } catch (e) {
            return sendJson(res, 200, fallback);
          }
        });
      }).on('error', () => {
        return sendJson(res, 200, fallback);
      });
    } catch (e) {
      return sendJson(res, 200, fallback);
    }
    return;
  }

  // Static File Serving
  let filePath = path.join(__dirname, pathname === '/' ? 'index.html' : pathname);
  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403);
    return res.end('Access Forbidden');
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/html' });
      return res.end('<h1>404 Not Found</h1>');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache, must-revalidate'
    });

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`\n[!] Server is already running on http://localhost:${PORT}`);
    console.log(`[!] Opening browser to active session...\n`);
    try {
      const { exec } = require('child_process');
      const url = `http://localhost:${PORT}`;
      const startCmd = process.platform === 'win32' ? `start "" "${url}"` :
                       process.platform === 'darwin' ? `open "${url}"` : `xdg-open "${url}"`;
      exec(startCmd);
    } catch (e) {}
  } else {
    console.error('Server error:', err);
  }
});

server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🥥 Pollachi Coconut Information System (Node.js Server)`);
  console.log(`=======================================================`);
  console.log(`Server running at : http://localhost:${PORT}`);
  console.log(`Student Login     : User ID: student | Password: student123`);
  console.log(`Dynamic Dataset   : data/pollachi_datasets.json`);
  console.log(`Press Ctrl+C in this terminal to stop the server.`);
  console.log(`=======================================================`);

  // Automatically launch the default browser
  try {
    const { exec } = require('child_process');
    const url = `http://localhost:${PORT}`;
    const startCmd = process.platform === 'win32' ? `start "" "${url}"` :
                     process.platform === 'darwin' ? `open "${url}"` : `xdg-open "${url}"`;
    exec(startCmd);
  } catch (e) {}
});
