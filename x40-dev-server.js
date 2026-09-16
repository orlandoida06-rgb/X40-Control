const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 8088;
const ROBOT = "192.168.1.33";
const ROBOT_PORT = 80;
const BUILD = path.join(__dirname, "frontend", "build");

const mime = {
    ".html": "text/html; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon",
    ".woff": "font/woff",
    ".woff2": "font/woff2",
};

function proxyRequest(req, res) {
    const options = {
        hostname: ROBOT,
        port: ROBOT_PORT,
        path: req.url,
        method: req.method,
        headers: {
            ...req.headers,
            host: `${ROBOT}:${ROBOT_PORT}`,
        },
    };

    const proxy = http.request(options, (proxyRes) => {
        res.writeHead(proxyRes.statusCode || 502, proxyRes.headers);
        proxyRes.pipe(res);
    });

    proxy.on("error", (err) => {
        console.error("[PROXY ERROR]", err.message);

        if (!res.headersSent) {
            res.writeHead(502, {
                "Content-Type": "text/plain; charset=utf-8",
            });
        }

        res.end("Robot backend unavailable");
    });

    req.pipe(proxy);
}

function serveFile(req, res) {
    let requestPath;

    try {
        requestPath = decodeURIComponent(req.url.split("?")[0]);
    } catch {
        res.writeHead(400);
        res.end("Bad Request");
        return;
    }

    if (requestPath === "/") {
        requestPath = "/index.html";
    }

    let filePath = path.normalize(
        path.join(BUILD, requestPath)
    );

    if (!filePath.startsWith(BUILD)) {
        res.writeHead(403);
        res.end("Forbidden");
        return;
    }

    fs.stat(filePath, (err, stat) => {
        if (!err && stat.isFile()) {
            res.writeHead(200, {
                "Content-Type":
                    mime[path.extname(filePath)] ||
                    "application/octet-stream",
                "Cache-Control": "no-cache",
            });

            fs.createReadStream(filePath).pipe(res);
            return;
        }

        const index = path.join(BUILD, "index.html");

        res.writeHead(200, {
            "Content-Type": "text/html; charset=utf-8",
            "Cache-Control": "no-cache",
        });

        fs.createReadStream(index).pipe(res);
    });
}

const server = http.createServer((req, res) => {
    console.log(`[${req.method}] ${req.url}`);

    if (req.url.startsWith("/api/")) {
        proxyRequest(req, res);
        return;
    }

    serveFile(req, res);
});

server.on("upgrade", (req, socket, head) => {
    console.log(`[WS] ${req.url}`);

    const robotSocket = require("net").connect(
        ROBOT_PORT,
        ROBOT,
        () => {
            const headers = [
                `${req.method} ${req.url} HTTP/${req.httpVersion}`,
                ...Object.entries(req.headers).map(
                    ([key, value]) => `${key}: ${value}`
                ),
                "",
                "",
            ];

            robotSocket.write(headers.join("\r\n"));
            robotSocket.write(head);

            socket.pipe(robotSocket);
            robotSocket.pipe(socket);
        }
    );

    robotSocket.on("error", (err) => {
        console.error("[WS ERROR]", err.message);
        socket.destroy();
    });

    socket.on("error", () => {
        robotSocket.destroy();
    });
});

server.listen(PORT, "0.0.0.0", () => {
    console.log("");
    console.log("======================================");
    console.log(" X40 CONTROL - FRONTEND DEV SERVER");
    console.log("======================================");
    console.log(`Frontend : http://0.0.0.0:${PORT}`);
    console.log(`Build    : ${BUILD}`);
    console.log(`Robot    : http://${ROBOT}:${ROBOT_PORT}`);
    console.log("API      : PROXY -> robot");
    console.log("SSE      : PROXY -> robot");
    console.log("======================================");
    console.log("");
});
