const http = require("http");
const fs = require("fs/promises");
const path = require("path");
const crypto = require("crypto");

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "0.0.0.0";
const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, "data");
const STUDENT_FILE = path.join(DATA_DIR, "students.json");
const OWNER_FILE = path.join(DATA_DIR, "owners.json");

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml"
};

async function ensureDataFiles() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await createJsonFile(STUDENT_FILE);
  await createJsonFile(OWNER_FILE);
}

async function createJsonFile(filePath) {
  try {
    await fs.access(filePath);
  } catch {
    await fs.writeFile(filePath, "[]\n");
  }
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  res.end(JSON.stringify(payload));
}

function collectBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
        req.destroy();
        reject(new Error("Request body too large"));
      }
    });

    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

async function readJsonArray(filePath) {
  const raw = await fs.readFile(filePath, "utf8");
  const parsed = JSON.parse(raw || "[]");
  return Array.isArray(parsed) ? parsed : [];
}

async function saveLead(filePath, lead) {
  const leads = await readJsonArray(filePath);
  const savedLead = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    ...lead
  };

  leads.push(savedLead);
  await fs.writeFile(filePath, `${JSON.stringify(leads, null, 2)}\n`);
  return savedLead;
}

function parseJson(body) {
  try {
    return JSON.parse(body);
  } catch {
    return null;
  }
}

function cleanText(value) {
  return String(value || "").trim();
}

function validateStudentLead(payload) {
  const lead = {
    name: cleanText(payload.name),
    phone: cleanText(payload.phone),
    budget: cleanText(payload.budget),
    type: cleanText(payload.type),
    timeline: cleanText(payload.timeline)
  };

  if (!lead.name || !lead.phone || !lead.budget || !lead.type) {
    return { error: "Name, phone, budget and stay type are required." };
  }

  return { lead };
}

function validateOwnerLead(payload) {
  const lead = {
    propertyName: cleanText(payload.propertyName),
    ownerPhone: cleanText(payload.ownerPhone),
    propertyType: cleanText(payload.propertyType),
    startingRent: cleanText(payload.startingRent),
    amenities: cleanText(payload.amenities)
  };

  if (!lead.propertyName || !lead.ownerPhone || !lead.propertyType || !lead.startingRent) {
    return { error: "Property name, phone, type and rent are required." };
  }

  return { lead };
}

async function handleApi(req, res) {
  if (req.method === "GET" && req.url === "/api/health") {
    return sendJson(res, 200, { ok: true, service: "veilHostel API" });
  }

  if (req.method === "POST" && req.url === "/api/student-leads") {
    const payload = parseJson(await collectBody(req));
    if (!payload) return sendJson(res, 400, { error: "Invalid JSON." });

    const result = validateStudentLead(payload);
    if (result.error) return sendJson(res, 400, { error: result.error });

    const savedLead = await saveLead(STUDENT_FILE, result.lead);
    return sendJson(res, 201, { message: "Student lead saved.", lead: savedLead });
  }

  if (req.method === "POST" && req.url === "/api/owner-leads") {
    const payload = parseJson(await collectBody(req));
    if (!payload) return sendJson(res, 400, { error: "Invalid JSON." });

    const result = validateOwnerLead(payload);
    if (result.error) return sendJson(res, 400, { error: result.error });

    const savedLead = await saveLead(OWNER_FILE, result.lead);
    return sendJson(res, 201, { message: "Owner lead saved.", lead: savedLead });
  }

  return sendJson(res, 404, { error: "API route not found." });
}

async function serveStatic(req, res) {
  const requestPath = decodeURIComponent(req.url.split("?")[0]);
  const safePath = requestPath === "/" ? "/index.html" : requestPath;
  const filePath = path.normalize(path.join(ROOT, safePath));

  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    return res.end("Forbidden");
  }

  try {
    const data = await fs.readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { "Content-Type": mimeTypes[ext] || "application/octet-stream" });
    res.end(data);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Page not found");
  }
}

async function handleRequest(req, res) {
  try {
    if (req.url.startsWith("/api/")) {
      await handleApi(req, res);
      return;
    }

    await serveStatic(req, res);
  } catch (error) {
    console.error(error);
    sendJson(res, 500, { error: "Server error." });
  }
}

ensureDataFiles().then(() => {
  http.createServer(handleRequest).listen(PORT, HOST, () => {
    console.log(`veilHostel running at http://localhost:${PORT}`);
  });
});
