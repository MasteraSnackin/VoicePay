import { fetch } from "expo/fetch";

async function createPayment(body) {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  try {
    const response = await fetch(`${process.env.CREATE_PAYMENT_URL_API}`, {
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
    if (!body.nonce || !body.user) {
      return Response.json({ result: null, error: "Missing required fields" }, { status: 400 });
    }
    const result = await createPayment(body);
    if (result === null) {
      return Response.json({ result: null, error: "Payment creation failed" }, { status: 502 });
    }
    return Response.json({ result, error: null });
  } catch {
    return Response.json({ result: null, error: "Invalid request" }, { status: 400 });
  }
}
