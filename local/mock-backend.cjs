const http = require("http");
const { randomUUID } = require("crypto");

const PORT = Number(process.env.MOCK_API_PORT || 3001);

const users = new Map();
const payments = new Map();
const rewards = new Map();

let nextAccountNumber = 810000;

const tokenBalances = {
  "0.0.456858": { low: "250000000" }, // USDC
  "0.0.731861": { low: "180000000" }, // SAUCE
  "0.0.1055472": { low: "95000000" }, // USDT
  "0.0.1055477": { low: "4200000000" }, // DAI
  "0.0.1055495": { low: "120000000" }, // LINK
};

function sendJson(res, statusCode, body) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, X-API-Key",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  });
  res.end(JSON.stringify(body));
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
    });
    req.on("end", () => {
      if (!data) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(data));
      } catch (error) {
        reject(error);
      }
    });
    req.on("error", reject);
  });
}

function createAccountId() {
  nextAccountNumber += 1;
  return `0.0.${nextAccountNumber}`;
}

function ensureReward(user) {
  if (!rewards.has(user)) {
    rewards.set(user, 125);
  }
  return rewards.get(user);
}

function getOrCreateUser(user, options = {}) {
  const normalizedUser =
    typeof user === "string" && user.trim() ? user.trim() : `mock_user_${randomUUID().slice(0, 8)}`;

  if (!users.has(normalizedUser)) {
    users.set(normalizedUser, {
      user: normalizedUser,
      accountId: options.accountId || createAccountId(),
      balances: {
        hbar: options.hbar || "245.38000000",
        tokens: { ...tokenBalances },
      },
    });
  }

  ensureReward(normalizedUser);
  return users.get(normalizedUser);
}

function buildBalancePayload(userRecord) {
  return {
    hbar: userRecord.balances.hbar,
    tokens: userRecord.balances.tokens,
    tokenDecimals: {},
  };
}

function buildTransactionHash() {
  return `0.0.999999@${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

function chatReply(message, context) {
  const text = String(message || "").toLowerCase();
  const accountId = context?.accountId || "0.0.000000";

  if (text.includes("balance")) {
    return {
      status: "success",
      message: `Your demo wallet ${accountId} currently shows 245.38 HBAR and a few funded Hedera tokens for local testing.`,
      last_tool: "get_balance_hedera",
    };
  }

  if (text.includes("send") || text.includes("transfer") || text.includes("pay")) {
    return {
      status: "success",
      message: "Local demo mode is active. I can walk you through the payment flow, and the mock backend will confirm transfers instantly.",
      last_tool: "transfer_tokens",
    };
  }

  return {
    status: "success",
    message: "DeSmond local demo mode is online. Ask about balances, rewards, or payment flows and I will respond using mock Hedera data.",
    last_tool: null,
  };
}

getOrCreateUser("face_demo_user", { accountId: "0.0.900001", hbar: "999.00000000" });

const server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") {
    sendJson(res, 204, {});
    return;
  }

  try {
    const { url, method } = req;

    if (method === "GET" && url === "/") {
      sendJson(res, 200, {
        status: "ok",
        message: "FacePay local mock backend is running.",
      });
      return;
    }

    const body = method === "POST" ? await parseBody(req) : {};

    if (method === "POST" && url === "/createOrFetchWallet") {
      const userRecord = getOrCreateUser(body.user);
      sendJson(res, 200, {
        result: {
          user: userRecord.user,
          accountId: userRecord.accountId,
        },
      });
      return;
    }

    if (method === "POST" && url === "/createPayment") {
      const userRecord = getOrCreateUser(body.user);
      payments.set(body.nonce, {
        user: userRecord.user,
        accountId: userRecord.accountId,
      });
      sendJson(res, 200, {
        res: "OK",
      });
      return;
    }

    if (method === "POST" && url === "/fetchPayment") {
      const payment =
        (body.nonce && payments.get(body.nonce)) ||
        (body.user && getOrCreateUser(body.user)) ||
        getOrCreateUser("face_demo_user");

      sendJson(res, 200, {
        result: {
          user: payment.user,
          accountId: payment.accountId,
        },
      });
      return;
    }

    if (method === "POST" && url === "/executePayment") {
      sendJson(res, 200, {
        error: null,
        result: {
          hash: buildTransactionHash(),
        },
      });
      return;
    }

    if (method === "POST" && url === "/hederaGetBalance") {
      const accountId = typeof body.accountId === "string" ? body.accountId.trim() : "";
      const userRecord =
        [...users.values()].find((entry) => entry.accountId === accountId) ||
        getOrCreateUser("face_demo_user");

      sendJson(res, 200, buildBalancePayload(userRecord));
      return;
    }

    if (method === "POST" && url === "/getRewards") {
      const rewardValue = ensureReward(body.accountId || "face_demo_user");
      sendJson(res, 200, {
        rewards: rewardValue,
      });
      return;
    }

    if (method === "POST" && url === "/claimRewards") {
      const key = body.accountId || "face_demo_user";
      const claimed = ensureReward(key);
      rewards.set(key, 0);
      sendJson(res, 200, {
        claimed,
      });
      return;
    }

    if (method === "POST" && url === "/chatWithAgent") {
      sendJson(res, 200, chatReply(body.message, body.context));
      return;
    }

    if (method === "POST" && url === "/faceId/fetchOrSave") {
      if (!body.nonce) {
        sendJson(res, 422, { result: false });
        return;
      }

      getOrCreateUser(body.nonce);
      sendJson(res, 200, { result: true });
      return;
    }

    if (method === "POST" && url === "/faceId/fetch") {
      const demoRecipient = getOrCreateUser("face_demo_user", { accountId: "0.0.900001" });
      sendJson(res, 200, { result: demoRecipient.user });
      return;
    }

    sendJson(res, 404, {
      error: "Not found",
      path: url,
    });
  } catch (error) {
    sendJson(res, 500, {
      error: "Mock backend failure",
      detail: error.message,
    });
  }
});

server.listen(PORT, () => {
  console.log(`FacePay local mock backend listening on http://localhost:${PORT}`);
});
