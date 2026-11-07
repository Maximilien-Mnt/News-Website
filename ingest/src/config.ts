import { z } from 'zod';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export interface Config {
  SUPABASE_URL: string;
  SUPABASE_SECRET_KEY: string;
  INGEST_WINDOW_HOURS: number;
  INGEST_MAX_ITEMS_PER_FEED: number;
  DRY_RUN: boolean;
}

const __dirname = fileURLToPath(new URL('.', import.meta.url));

function readEnvFile(): Record<string, string> {
  try {
    const envPath = resolve(__dirname, '../../.env');
    const text = readFileSync(envPath, 'utf8');
    const env: Record<string, string> = {};
    for (const line of text.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      env[key] = value;
    }
    return env;
  } catch {
    return {};
  }
}

const envSchema = z.object({
  SUPABASE_URL: z.string().url(),
  SUPABASE_SECRET_KEY: z.string().min(1),
  INGEST_WINDOW_HOURS: z.coerce.number().int().positive().default(48),
  INGEST_MAX_ITEMS_PER_FEED: z.coerce.number().int().positive().default(30),
  DRY_RUN: z.preprocess((val) => val === 'true' || val === true, z.boolean()).default(false),
});

export function loadConfig(): Config {
  const envFromFile = readEnvFile();
  const envFromProcess: Record<string, string> = {};
  for (const key of Object.keys(envSchema.shape)) {
    const v = process.env[key];
    if (v !== undefined) envFromProcess[key] = v;
  }
  const input = { ...envFromFile, ...envFromProcess };
  const parsed = envSchema.parse(input);
  const dryRun = parsed.DRY_RUN || process.argv.includes('--dry-run');
  return { ...parsed, DRY_RUN: dryRun };
}

export const config = loadConfig();