import { fetchWithRetries } from "../../core/fetchWithRetry";

async function fetchFaceID(body) {
  const myHeaders = new Headers();
  myHeaders.append("X-API-Key", process.env.AI_URL_API_KEY);
  myHeaders.append("Content-Type", "application/json");
  try {
    const response = await fetchWithRetries(
      `${process.env.FACEID_API}fetch`,
      {
        method: "POST",
        headers: myHeaders,
        body: JSON.stringify(body),
        redirect: "follow",
      },
      { retries: 3, delay: 3000 }
    );
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    if (!body.image) {
      return Response.json({ result: null, error: "Missing image data" }, { status: 400 });
    }
    const response = await fetchFaceID(body);
    if (response === null) {
      return Response.json({ result: null, error: "Face ID lookup failed" }, { status: 502 });
    }
    return Response.json({ result: response.result ?? null, error: null });
  } catch {
    return Response.json({ result: null, error: "Invalid request" }, { status: 400 });
  }
}
