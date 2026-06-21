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
