import { exec } from 'child_process';

/** Exécute une commande shell sans bloquer l'event loop, renvoie stdout trimé. */
export function execAsync(cmd: string, timeoutMs = 2000): Promise<string> {
  return new Promise((resolve, reject) => {
    exec(cmd, { timeout: timeoutMs }, (err, stdout) => {
      if (err) reject(err);
      else resolve(stdout.toString().trim());
    });
  });
}
