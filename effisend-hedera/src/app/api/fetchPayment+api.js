import { fetch } from "expo/fetch";

async function fetchPayment(jsonBody) {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  try {
    const response = await fetch(`${process.env.FETCH_PAYMENT_URL_API}`, {
      method: "POST",
      headers: myHeaders,
      body: JSON.stringify(jsonBody),
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
    if (!body.nonce && !body.user) {
      return Response.json({ result: null, error: "Missing nonce or user" }, { status: 400 });
    }
    const response = await fetchPayment(body);
    if (response === null) {
      return Response.json({ result: null, error: "Payment fetch failed" }, { status: 502 });
    }
    return Response.json({ result: response.result ?? null, error: null });
  } catch {
    return Response.json({ result: null, error: "Invalid request" }, { status: 400 });
  }
}
