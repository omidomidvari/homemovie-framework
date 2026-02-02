/**
 * Simple API to execute JavaScript code in a Node.js VM sandbox
 * WARNING: The vm module is NOT a complete security solution.
 * Never run untrusted code in production without additional isolation.
 */

const http = require('http');
const { VM } = require('vm2'); // vm2 is safer than built-in vm
const url = require('url');

// Server configuration
const PORT = 3000;

// Create HTTP server
const server = http.createServer(async (req, res) => {
    // Allow only POST requests to /run
    const parsedUrl = url.parse(req.url, true);
    if (req.method === 'POST' && parsedUrl.pathname === '/run') {
        let body = '';

        // Collect request body
        req.on('data', chunk => {
            body += chunk;
            // Prevent overly large payloads
            if (body.length > 1e6) {
                req.connection.destroy();
            }
        });

        req.on('end', () => {
            try {
                const { code, timeout } = JSON.parse(body);

                // Validate input
                if (typeof code !== 'string' || code.trim() === '') {
                    throw new Error('Invalid or empty code string.');
                }

                // Create a secure VM instance
                const vm = new VM({
                    timeout: Math.min(timeout || 1000, 5000), // Max 5 seconds
                    sandbox: {} // Empty sandbox
                });

                // Run the code
                const result = vm.run(code);

                // Respond with result
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, result }));
            } catch (err) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: err.message }));
            }
        });
    } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not Found' }));
    }
});

// Start server
server.listen(PORT, () => {
    console.log(`VM API server running at http://localhost:${PORT}`);
});
