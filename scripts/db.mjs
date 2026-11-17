import { spawn } from "node:child_process";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(here, "..");
const dataDir = path.join(projectRoot, ".postgres");
const logFile = path.join(projectRoot, ".postgres-server.log");
const pgBin =
  process.env.PG_BIN ??
  (process.platform === "win32"
    ? "C:\\Program Files\\PostgreSQL\\18\\bin"
    : "/usr/lib/postgresql/18/bin");
const pgCtl = path.join(pgBin, process.platform === "win32" ? "pg_ctl.exe" : "pg_ctl");

const command = process.argv[2] ?? "status";
const args =
  command === "start"
    ? ["-D", dataDir, "-o", "-p 5433 -h 127.0.0.1", "-l", logFile, "-w", "start"]
    : ["-D", dataDir, "-m", "fast", command];

const child = spawn(pgCtl, args, { stdio: "inherit" });
child.on("exit", (code) => process.exit(code ?? 0));
