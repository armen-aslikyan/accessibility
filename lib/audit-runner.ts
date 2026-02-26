import { spawn } from 'child_process';
import path from 'path';

export function triggerAudit(auditId: string, url: string, viewport?: string): void {
  const scriptPath = path.join(process.cwd(), 'scripts', 'run-audit.js');
  const args = [scriptPath, auditId, url];
  if (viewport) args.push(viewport);
  const child = spawn('node', args, {
    detached: true,
    stdio: 'ignore',
    env: { ...process.env },
  });
  child.unref();
}

export function triggerSiteAudit(
  auditId: string,
  url: string,
  maxDepth: number,
  maxUrls: number,
): void {
  const scriptPath = path.join(process.cwd(), 'scripts', 'run-site-audit.js');
  const child = spawn('node', [scriptPath, auditId, url, String(maxDepth), String(maxUrls)], {
    detached: true,
    stdio: 'ignore',
    env: { ...process.env },
  });
  child.unref();
}
