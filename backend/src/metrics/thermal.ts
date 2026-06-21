import fs from 'fs';
import path from 'path';

function readThermalZones(): number[] {
  const temps: number[] = [];
  try {
    const base = '/sys/class/thermal';
    const zones = fs.readdirSync(base).filter(d => d.startsWith('thermal_zone'));
    for (const zone of zones) {
      try {
        const type = fs.readFileSync(path.join(base, zone, 'type'), 'utf-8').trim();
        if (type === 'x86_pkg_temp' || type === 'k10temp' || type.includes('cpu') || type.includes('acpi')) {
          const raw = fs.readFileSync(path.join(base, zone, 'temp'), 'utf-8').trim();
          const celsius = parseInt(raw) / 1000;
          if (celsius > 0 && celsius < 120) temps.push(celsius);
        }
      } catch { /* skip unavailable zone */ }
    }
  } catch { /* /sys not available in container */ }
  return temps;
}

function readHwmonTemp(driverName: string): number | null {
  try {
    const base = '/sys/class/hwmon';
    const hwmons = fs.readdirSync(base);
    for (const hwmon of hwmons) {
      try {
        const name = fs.readFileSync(path.join(base, hwmon, 'name'), 'utf-8').trim();
        if (name === driverName) {
          const temp = fs.readFileSync(path.join(base, hwmon, 'temp1_input'), 'utf-8').trim();
          return Math.round(parseInt(temp) / 1000);
        }
      } catch { /* skip */ }
    }
  } catch { /* skip */ }
  return null;
}

export function getCpuTempC(): number {
  const k10 = readHwmonTemp('k10temp');
  if (k10 !== null) return k10;
  const zones = readThermalZones();
  if (zones.length > 0) return Math.round(Math.max(...zones));
  return 0;
}

export function getGpuTempC(): number {
  const amdgpu = readHwmonTemp('amdgpu');
  if (amdgpu !== null) return amdgpu;
  return 0;
}
