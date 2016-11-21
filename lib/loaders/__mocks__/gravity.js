console.log('mocks/gravity.js');

import { join } from 'path';
import { existsSync, readFileSync } from 'fs';

const FIXTURES_ROOT = join(__dirname, '../../../test/fixtures/antigravity/fixtures/gravity/api/v1');
const CACHE = {};

export default function gravity(v1EndpointPath) {
  return new Promise((resolve, reject) => {
    try {
      resolve(gravity.mockForPath(v1EndpointPath));
    } catch (error) {
      reject(error);
    }
  });
}

/* Support authenticated call without really doing anything. */
gravity.with = () => gravity;

gravity.mockForPath = (v1EndpointPath) => {
  if (CACHE[v1EndpointPath]) {
    return CACHE[v1EndpointPath];
  }
  const path = join(FIXTURES_ROOT, `${v1EndpointPath}.json`);
  if (!existsSync(path)) {
    throw new Error(`No Gravity fixture exists for endpoint: ${v1EndpointPath}`);
  }
  const data = readFileSync(path, { encoding: 'utf-8' });
  const payload = JSON.parse(data);
  CACHE[v1EndpointPath] = payload;
  return payload;
};

gravity.setMockForPath = (v1EndpointPath, mock) => CACHE[v1EndpointPath] = mock;

gravity.resetMockForPath = (v1EndpointPath) => delete CACHE[v1EndpointPath];
