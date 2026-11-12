"use strict";
module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ message: "Método não permitido." });
  }
  const type = String(req.headers["content-type"] || "");
  if (!type.startsWith("application/json")) return res.status(415).json({ message: "Formato inválido." });
  if (Number(req.headers["content-length"] || "0") > 7000)
    return res.status(413).json({ message: "Conteúdo muito grande." });
  const origin = req.headers.origin;
  const host = String(req.headers["x-forwarded-host"] || req.headers.host || "");
  if (origin && host) {
    try {
      const parsed = new URL(origin);
      if (parsed.protocol !== "https:" || parsed.host !== host)
        return res.status(403).json({ message: "Origem não autorizada." });
    } catch { return res.status(403).json({ message: "Origem não autorizada." }); }
  }
  let body = req.body;
  if (typeof body === "string") { try { body = JSON.parse(body); } catch { body = null; } }
  if (!body || typeof body !== "object" || Array.isArray(body))
    return res.status(400).json({ message: "Dados inválidos." });
  const endpoint = process.env.SUPABASE_URL;
  if (!endpoint || !/^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(endpoint))
    return res.status(503).json({ message: "Formulário temporariamente indisponível." });
  try {
    const forwardedIP = String(req.headers["x-forwarded-for"] || req.headers["x-real-ip"] || "").split(",")[0].trim();
    const response = await fetch(endpoint + "/functions/v1/visionmove-participar", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-forwarded-for": forwardedIP },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(9500)
    });
    let result = {};
    try { result = await response.json(); } catch {}
    return res.status(response.status).json({
      ok: response.ok && result.ok === true,
      ...(!response.ok ? { message: typeof result.message === "string" ? result.message : "Não foi possível salvar agora." } : {})
    });
  } catch(error) {
    console.error("VisionMove form relay failed", error?.name || "error");
    return res.status(503).json({ message: "Serviço indisponível no momento. Tente novamente." });
  }
};
