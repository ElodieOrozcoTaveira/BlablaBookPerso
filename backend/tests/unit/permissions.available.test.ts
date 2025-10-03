import { describe, it, expect } from 'vitest';
import { AVAILABLE_PERMISSIONS } from '../../src/config/permissions.js';

const needed = [
  'UPDATE_LIBRARY','DELETE_LIBRARY',
  'UPDATE_NOTICE','DELETE_NOTICE',
  'UPDATE_RATE','DELETE_RATE',
  'UPDATE_READING_LIST','DELETE_READING_LIST'
];

describe('AVAILABLE_PERMISSIONS completeness', () => {
  it('inclut toutes les permissions ownership spécifiques', () => {
    for (const p of needed) {
      expect(AVAILABLE_PERMISSIONS).toContain(p);
    }
  });
});
