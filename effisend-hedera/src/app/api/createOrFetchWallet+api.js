import { fetch } from "expo/fetch";

async function createOrFetchWallet(body) {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  const raw = JSON.stringify(body);
  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  };
  return new Promise((resolve) => {
    fetch(`${process.env.CREATE_OR_FETCH_WALLET_API}`, requestOptions)
      .then((response) => response.json())
      .then((result) => resolve(result))
      .catch(() => resolve(null));
  });
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
  } catch (_e) {
    return Response.json({ result: null, error: "Invalid request" }, { status: 400 });
  }
}
