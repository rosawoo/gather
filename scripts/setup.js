#!/usr/bin/env node
const { execSync, spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const root = path.resolve(__dirname, "..");
const envPath = path.join(root, ".env");
const envExamplePath = path.join(root, ".env.example");

function run(cmd, opts) {
  console.log(`\n> ${cmd}`);
  execSync(cmd, { stdio: "inherit", cwd: root, ...opts });
}

function step(label) {
  console.log(`\n--- ${label} ---`);
}

// 1. .env
step("Environment file");
if (fs.existsSync(envPath)) {
  console.log(".env already exists, skipping copy.");
} else {
  fs.copyFileSync(envExamplePath, envPath);

  // Generate a real AUTH_SECRET
  const secret = crypto.randomBytes(32).toString("base64");
  let env = fs.readFileSync(envPath, "utf8");
  env = env.replace(
    'AUTH_SECRET="generate-with-openssl-rand-base64-32"',
    `AUTH_SECRET="${secret}"`,
  );
  fs.writeFileSync(envPath, env);
  console.log("Created .env from .env.example with a fresh AUTH_SECRET.");
  console.log(
    "Open .env and fill in AUTH_GOOGLE_ID / AUTH_GOOGLE_SECRET to enable sign-in.",
  );
}

// 2. Dependencies
step("Dependencies");
run("npm install");

// 3. Database
step("Database");
run("npx prisma generate");
// Use migrate deploy for non-interactive setup; migrate dev would prompt.
const devDb = path.join(root, "prisma", "dev.db");
if (fs.existsSync(devDb)) {
  console.log("prisma/dev.db already exists, running migrate deploy.");
  run("npx prisma migrate deploy");
} else {
  console.log("Creating database and applying migrations.");
  // migrate dev in non-interactive mode (pipe empty stdin)
  const r = spawnSync("npx", ["prisma", "migrate", "dev", "--name", "init"], {
    stdio: ["pipe", "inherit", "inherit"],
    cwd: root,
  });
  if (r.status !== 0) {
    // Fallback to deploy if dev fails non-interactively
    run("npx prisma migrate deploy");
  }
}

// Done
step("Ready");
console.log("Run `npm run dev` then open http://localhost:3001");
console.log(
  "Phone verification uses bypass code 202600 when Twilio is not configured.",
);
