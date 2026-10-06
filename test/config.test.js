import test from 'node:test';
import assert from 'node:assert/strict';
import config from '../src/config.js';

test('uses a non-conflicting local default backend port', () => {
  assert.equal(config.PORT, 3001);
  assert.equal(config.API_BASE_URL, 'http://localhost:3001/api');
});
