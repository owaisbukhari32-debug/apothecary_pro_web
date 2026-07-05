// api/claude.js
// Vercel serverless function — keeps your Anthropic key hidden.
// The key is read from process.env.ANTHROPIC_API_KEY (set in Vercel dashboard),
// NEVER written in this file and NEVER sent to the browser.

// This file MUST be at:  api/claude.js
// It MUST start with the line below (export default). If GitHub shows
// this file empty or without this line, that is the cause of
// "No exports found in module" — paste this whole file and commit.

export default async function handler(req, res) {
  // Allow the browser page to call this function
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") { res.status(200).end(); return; }
  if (req.method !== "POST") { res.status(405).json({ error: "Method not allowed" }); return; }

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) { res.status(500).json({ error: "Server API key not configured." }); return; }

  try {
    const { system, prompt } = req.body || {};
    if (!prompt) { res.status(400).json({ error: "Missing prompt." }); return; }

    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: system || "",
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await r.json();
    if (data.error) { res.status(502).json({ error: data.error.message || "API error" }); return; }

    const text = (data.content || []).map((i) => (i.type === "text" ? i.text : "")).filter(Boolean).join("\n");
    res.status(200).json({ text });
  } catch (e) {
    res.status(500).json({ error: "Request failed: " + e.message });
  }
}
