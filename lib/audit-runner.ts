import { spawn } from 'child_process';
import path from 'path';

export function triggerAudit(auditId: string, url: string): void {
  const scriptPath = path.join(process.cwd(), 'scripts', 'run-audit.js');
  const child = spawn('node', [scriptPath, auditId, url], {
    detached: true,
    stdio: 'ignore',
    env: { ...process.env },
  });
  child.unref();
}
