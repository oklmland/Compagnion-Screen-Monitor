import fs from 'fs';
import path from 'path';

export function getFanRPM(): number[] {
  const rpms: number[] = [];
  try {
    const base = '/sys/class/hwmon';
    const hwmons = fs.readdirSync(base);
    for (const hwmon of hwmons) {
      const hwmonPath = path.join(base, hwmon);
      try {
        const files = fs.readdirSync(hwmonPath);
        for (const file of files) {
          if (!file.match(/^fan\d+_input$/)) continue;
          const rpm = parseInt(fs.readFileSync(path.join(hwmonPath, file), 'utf-8').trim());
          if (rpm > 0 && rpm < 20000) rpms.push(rpm);
        }
      } catch { /* skip */ }
    }
  } catch { /* /sys not available */ }
  return rpms;
}

// Diagnostic une fois au démarrage : liste les hwmon et signale l'absence de
// capteur ventilateur (fréquent sur mini PC AMD sans pilote nct6775 chargé).
export function logFanProbe(): void {
  try {
    const base = '/sys/class/hwmon';
    const names: string[] = [];
    let fanInputs = 0;
    for (const hwmon of fs.readdirSync(base)) {
      try {
        names.push(fs.readFileSync(path.join(base, hwmon, 'name'), 'utf-8').trim());
        fanInputs += fs.readdirSync(path.join(base, hwmon)).filter((f) => /^fan\d+_input$/.test(f)).length;
      } catch { /* skip */ }
    }
    console.log(`[fans] hwmon présents : ${names.join(', ') || '(aucun)'} — capteurs ventilateur : ${fanInputs}`);
    if (fanInputs === 0) {
      console.log('[fans] Aucun capteur RPM exposé. Essayez : sudo modprobe nct6775 (puis sudo sensors-detect).');
    }
  } catch { /* /sys absent */ }
}
