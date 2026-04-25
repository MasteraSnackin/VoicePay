import { fetch } from "expo/fetch";

async function executePayment(jsonBody) {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  try {
    const response = await fetch(`${process.env.EXECUTE_PAYMENT_API}`, {
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
    if (!body.user || !body.to || body.amount === undefined) {
      return Response.json({ result: null, error: "Missing required fields" }, { status: 400 });
    }
    const response = await executePayment(body);
    if (response === null) {
      return Response.json({ result: null, error: "Payment execution failed" }, { status: 502 });
    }
    return Response.json({ result: response.result ?? null, error: response.error ?? null });
  } catch {
    return Response.json({ result: null, error: "Invalid request" }, { status: 400 });
  }
}
