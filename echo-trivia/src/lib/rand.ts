import crypto from "crypto";

export function generateSeed(): string {
  return crypto.randomBytes(32).toString("hex"); // 32 bytes → 64 hex chars
}

function sha256Hex(s: string): string {
  return crypto.createHash("sha256").update(s).digest("hex");
}

export function hashRoll(seedHex: string, key: string): bigint {
  const h = sha256Hex(`${seedHex}:${key}`);
  return BigInt("0x" + h);
}

export function rollIndex(seedHex: string, key: string, max: number): number {
  if (max <= 0) throw new Error("rollIndex max must be > 0");
  const n = hashRoll(seedHex, key) % BigInt(max);
  return Number(n);
}

export function rollFrom<T>(seedHex: string, key: string, arr: readonly T[]): T {
  return arr[rollIndex(seedHex, key, arr.length)];
}

export function rollSample<T>(seedHex: string, key: string, arr: readonly T[], k: number): T[] {
  if (k <= 0) return [];
  if (k >= arr.length) return [...arr];
  const picked = new Set<number>();
  const out: T[] = [];
  let i = 0;
  while (out.length < k) {
    const idx = rollIndex(seedHex, `${key}#${i++}`, arr.length);
    if (!picked.has(idx)) {
      picked.add(idx);
      out.push(arr[idx]);
    }
  }
  return out;
}

export function rollNumberInRange(seedHex: string, key: string, min: number, max: number, step = 1): number {
  const span = Math.floor((max - min) / step) + 1;
  const idx = rollIndex(seedHex, key, span);
  return min + idx * step;
}
