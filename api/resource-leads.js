const crypto = require("crypto");

const json = (res, status, body) => {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(body));
};

const base64url = (input) => Buffer.from(input)
  .toString("base64")
  .replace(/=/g, "")
  .replace(/\+/g, "-")
  .replace(/\//g, "_");

const createJwt = ({ clientEmail, privateKey }) => {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const payload = {
    iss: clientEmail,
    scope: "https://www.googleapis.com/auth/spreadsheets",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now
  };
  const unsigned = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(payload))}`;
  const signer = crypto.createSign("RSA-SHA256");
  signer.update(unsigned);
  signer.end();
  const signature = signer.sign(privateKey)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
  return `${unsigned}.${signature}`;
};

const getAccessToken = async () => {
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!clientEmail || !privateKey) {
    throw new Error("Missing Google service account environment variables.");
  }
  const assertion = createJwt({ clientEmail, privateKey });
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion
    })
  });
  const data = await response.json();
  if (!response.ok || !data.access_token) {
    throw new Error(data.error_description || data.error || "Unable to get Google access token.");
  }
  return data.access_token;
};

const readBody = async (req) => {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
};

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return json(res, 204, {});
  if (req.method !== "POST") return json(res, 405, { ok: false, error: "Method not allowed." });

  try {
    const sheetId = process.env.GOOGLE_SHEET_ID;
    const sheetName = process.env.GOOGLE_SHEET_NAME || "resource_leads";
    if (!sheetId) throw new Error("Missing GOOGLE_SHEET_ID.");

    const body = await readBody(req);
    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim();
    const resource = String(body.resource || "網站資源").trim();
    const page = String(body.page || "").trim();
    const honeypot = String(body.website || "").trim();

    if (honeypot) return json(res, 200, { ok: true });
    if (!name || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return json(res, 400, { ok: false, error: "請填寫有效的 Name 與 email。" });
    }

    const accessToken = await getAccessToken();
    const values = [[
      new Date().toISOString(),
      name,
      email,
      resource,
      page,
      req.headers.referer || "",
      req.headers["user-agent"] || ""
    ]];
    const endpoint = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(sheetId)}/values/${encodeURIComponent(sheetName)}!A:G:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ values })
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error?.message || "Unable to append row.");
    }
    return json(res, 200, { ok: true });
  } catch (error) {
    return json(res, 500, { ok: false, error: error.message || "Server error." });
  }
};
