#!/usr/bin/env node
/**
 * Cross-platform env prefix for npm scripts (Windows cmd.exe does not support `VAR=1 cmd`).
 *
 * Usage: node scripts/run-with-env.mjs KEY=value [KEY2=value2 ...] -- <command> [args...]
 */
import { spawn } from "node:child_process";
import process from "node:process";

const argv = process.argv.slice(2);
const sep = argv.indexOf("--");
if (sep === -1) {
  process.stderr.write(
    "usage: node scripts/run-with-env.mjs KEY=value [KEY2=value2 ...] -- <command> [args...]\n",
  );
  process.exit(2);
}

const envPairs = argv.slice(0, sep);
const cmdParts = argv.slice(sep + 1);
if (cmdParts.length === 0) {
  process.stderr.write("run-with-env: missing command after --\n");
  process.exit(2);
}

const env = { ...process.env };
for (const pair of envPairs) {
  const eq = pair.indexOf("=");
  if (eq <= 0 || !/^[A-Za-z_][A-Za-z0-9_]*$/.test(pair.slice(0, eq))) {
    process.stderr.write(`run-with-env: invalid assignment ${JSON.stringify(pair)}\n`);
    process.exit(2);
  }
  const key = pair.slice(0, eq);
  env[key] = pair.slice(eq + 1);
}

const [command, ...args] = cmdParts;
const child = spawn(command, args, { stdio: "inherit", env, shell: false });
child.on("error", (err) => {
  process.stderr.write(`run-with-env: failed to spawn ${command}: ${String(err)}\n`);
  process.exit(1);
});
child.on("exit", (code, signal) => {
  if (signal) {
    process.exit(1);
  }
  process.exit(code ?? 1);
});
