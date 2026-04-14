async function chatWithAgent(body) {
  const myHeaders = new Headers();
  myHeaders.append("X-API-Key", process.env.AI_URL_API_KEY);
  myHeaders.append("Content-Type", "application/json");
  try {
    const response = await fetch(`${process.env.AGENT_URL_API}`, {
      method: "POST",
      headers: myHeaders,
      body: JSON.stringify(body),
      redirect: "follow",
    });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    if (!body.message) {
      return Response.json({ result: null, error: "Missing message" }, { status: 400 });
    }
    const result = await chatWithAgent(body);
    if (result === null) return Response.json({ result: null, error: "Agent unavailable" }, { status: 502 });
    return Response.json({ ...result, error: null });
  } catch {
    return Response.json({ result: null, error: "Invalid request" }, { status: 400 });
  }
}
