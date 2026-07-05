async function askClaude(userPrompt, systemPrompt) {
  const response = await fetch("/api/claude", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt: userPrompt, system: systemPrompt }),
  });
  const data = await response.json();
  if (data.error) throw new Error(data.error);
  return data.text;
}
