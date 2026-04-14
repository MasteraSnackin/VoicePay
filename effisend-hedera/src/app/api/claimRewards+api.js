async function claimRewards(body) {
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
    fetch(`${process.env.CLAIM_REWARDS_API}`, requestOptions)
      .then((response) => response.json())
      .then((result) => resolve(result))
      .catch(() => resolve(null));
  });
}

export async function POST(request) {
  try {
    const body = await request.json();
    if (!body.accountId) {
      return Response.json({ result: null, error: "Missing accountId" }, { status: 400 });
    }
    const result = await claimRewards(body);
    if (result === null) {
      return Response.json({ result: null, error: "Rewards claim failed" }, { status: 502 });
    }
    return Response.json({ result, error: null });
  } catch (_e) {
    return Response.json({ result: null, error: "Invalid request" }, { status: 400 });
  }
}
