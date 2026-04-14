import { fetch } from "expo/fetch";

async function createOrFetchWallet(body) {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  try {
    const response = await fetch(`${process.env.CREATE_OR_FETCH_WALLET_API}`, {
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
    if (!body.user) {
      return Response.json({ result: null, error: "Missing user identifier" }, { status: 400 });
    }
    const response = await createOrFetchWallet(body);
    if (response === null) {
      return Response.json({ result: null, error: "Wallet creation failed" }, { status: 502 });
    }
    return Response.json({ result: response.result ?? null, error: null });
  } catch {
    return Response.json({ result: null, error: "Invalid request" }, { status: 400 });
  }
}
