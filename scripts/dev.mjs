#!/usr/bin/env node

import { spawnSync, spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { existsSync } from 'node:fs';
import { config as loadEnv } from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

const envFiles = ['.env.local', '.env'];

for (const envFile of envFiles) {
  const envPath = join(projectRoot, envFile);

  if (existsSync(envPath)) {
    loadEnv({ path: envPath, override: false });
  }
}

loadEnv();

const preStartResult = spawnSync('node', ['pre-start.cjs'], {
  cwd: projectRoot,
  stdio: 'inherit',
  env: process.env,
});

if (preStartResult.status !== 0) {
  process.exit(preStartResult.status ?? 1);
}

const remixDev = spawn('remix', ['vite:dev'], {
  cwd: projectRoot,
  stdio: 'inherit',
  env: process.env,
  shell: true,
});

remixDev.on('exit', (code) => {
  process.exit(code ?? 0);
});

