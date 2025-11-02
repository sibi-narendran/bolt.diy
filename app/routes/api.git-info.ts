/*
import { json } from '@remix-run/cloudflare';
import { execSync } from 'child_process';
import { existsSync } from 'fs';

export async function loader() {
  try {
    if (existsSync('.git')) {
      const commit = execSync('git rev-parse HEAD').toString().trim();
      const branch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();

      return json({ commit, branch });
    }
  } catch (error) {
    console.error('Error getting git info:', error);
  }

  return json({ commit: null, branch: null });
}
*/

// Temporarily disabled to allow Cloudflare deployment.
// This file uses Node.js APIs (fs, child_process) that are not available in the Pages environment.
import { json } from '@remix-run/cloudflare';

export async function loader() {
  return json({ commit: null, branch: null, error: "Not available in this environment" });
}
