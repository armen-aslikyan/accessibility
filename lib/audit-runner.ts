import { spawn } from "child_process";
import path from "path";
import fs from "fs";

const LOG_DIR = path.join(process.cwd(), "logs");

function openLogFd(auditId: string): number {
  fs.mkdirSync(LOG_DIR, { recursive: true });
  return fs.openSync(path.join(LOG_DIR, `${auditId}.log`), "a");
}

export function triggerAudit(auditId: string, url: string, viewport?: string): void {
  const scriptPath = path.join(process.cwd(), "scripts", "run-audit.js");
  const args = [scriptPath, auditId, url];
  if (viewport) args.push(viewport);
  const logFd = openLogFd(auditId);
  const child = spawn("node", args, {
    detached: true,
    stdio: ["ignore", logFd, logFd],
    env: { ...process.env },
  });
  child.unref();
  fs.closeSync(logFd);
}

export function triggerSiteAudit(auditId: string, url: string, maxDepth: number, maxUrls: number): void {
  const scriptPath = path.join(process.cwd(), "scripts", "run-site-audit.js");
  const logFd = openLogFd(auditId);
  const child = spawn("node", [scriptPath, auditId, url, String(maxDepth), String(maxUrls)], {
    detached: true,
    stdio: ["ignore", logFd, logFd],
    env: { ...process.env },
  });
  child.unref();
  fs.closeSync(logFd);
}
