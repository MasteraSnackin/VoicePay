import { fetchWithRetries } from "../../core/fetchWithRetry";

async function createOrFetchFace(body) {
  const myHeaders = new Headers();
  myHeaders.append("X-API-Key", process.env.AI_URL_API_KEY);
  myHeaders.append("Content-Type", "application/json");
  try {
    const response = await fetchWithRetries(
      `${process.env.FACEID_API}fetchOrSave`,
      {
        method: "POST",
        headers: myHeaders,
        body: JSON.stringify(body),
        redirect: "follow",
      },
      { nullOnStatuses: [422] }
    );
    if (!response || !response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    if (!body.image || !body.nonce) {
      return Response.json({ result: null, error: "Missing image or nonce" }, { status: 400 });
    }
    const result = await createOrFetchFace(body);
    if (result === null) return Response.json({ result: null, error: "Face recognition failed" }, { status: 502 });
    return Response.json({ ...result, error: null });
  } catch {
    return Response.json({ result: null, error: "Invalid request" }, { status: 400 });
  }
}
