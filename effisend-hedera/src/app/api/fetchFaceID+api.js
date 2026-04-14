import { fetchWithRetries } from "../../core/fetchWithRetry";

async function fetchFaceID(body) {
  const myHeaders = new Headers();
  myHeaders.append("X-API-Key", process.env.AI_URL_API_KEY);
  myHeaders.append("Content-Type", "application/json");
  const raw = JSON.stringify(body);
  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
    retry: 3,
    retryDelay: 3000,
  };
  return new Promise((resolve) => {
    fetchWithRetries(`${process.env.FACEID_API}fetch`, requestOptions)
      .then((response) => response.json())
      .then((result) => resolve(result))
      .catch(() => resolve(null));
  });
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
  } catch (_e) {
    return Response.json({ result: null, error: "Invalid request" }, { status: 400 });
  }
}
