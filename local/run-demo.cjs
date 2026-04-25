const path = require("path");
const readline = require("readline");
const { spawn } = require("child_process");

const repoDir = path.resolve(__dirname, "..");
const appDir = path.join(repoDir, "facepay");
const npmCmd = process.platform === "win32" ? "npm.cmd" : "npm";
const npxCmd = process.platform === "win32" ? "npx.cmd" : "npx";

const children = [];
let shuttingDown = false;
let expoStarted = false;

function prefixLines(stream, label, onLine) {
  const rl = readline.createInterface({ input: stream });
  rl.on("line", (line) => {
    console.log(`[${label}] ${line}`);
    if (onLine) onLine(line);
  });
  return rl;
}

function shutdown(code = 0) {
  if (shuttingDown) return;
  shuttingDown = true;

  for (const child of children) {
    if (child && !child.killed) {
      child.kill("SIGINT");
    }
  }

  setTimeout(() => process.exit(code), 250);
}

function spawnLogged(command, args, options, label, onStdoutLine) {
  const child = spawn(command, args, {
    ...options,
    stdio: ["ignore", "pipe", "pipe"],
  });

  children.push(child);

  prefixLines(child.stdout, label, onStdoutLine);
  prefixLines(child.stderr, `${label}:err`);

  child.on("exit", (code, signal) => {
    if (shuttingDown) return;
    if (signal === "SIGINT" || signal === "SIGTERM") return;

    console.log(`[${label}] exited with code ${code ?? "null"}`);
    shutdown(code ?? 1);
  });

  return child;
}

function startExpo() {
  if (expoStarted) return;
  expoStarted = true;

  console.log("[demo] Starting Expo web server...");

  spawnLogged(
    npxCmd,
    ["expo", "start", "--web", "--offline"],
    { cwd: appDir, env: process.env },
    "expo",
    (line) => {
      const waitingLine = line.match(/(?:Web is )?Waiting on (http:\/\/\S+)/i);
      if (waitingLine) {
        const url = waitingLine[1];
        console.log("");
        console.log(`[demo] Demo ready at ${url}`);
        console.log("[demo] In the app, use `Try Demo Wallet` on the FaceID screen.");
        console.log("[demo] Use `Reset Demo` in the header to start over.");
        console.log("");
      }
    }
  );
}

console.log("[demo] Starting local mock backend...");

spawnLogged(
  npmCmd,
  ["run", "local-mock-api"],
  { cwd: appDir, env: process.env },
  "mock",
  (line) => {
    if (line.includes("FacePay local mock backend listening")) {
      startExpo();
    }
  }
);

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));
