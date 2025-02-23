import { describe, expect, test } from 'vitest';

import runIndexAt from '../../src/attributedString/runIndexAt';

const string = {
  string: 'hello world',
  runs: [
    { start: 0, end: 6, attributes: {} }, // 'hello '
    { start: 6, end: 12, attributes: {} }, // 'world'
  ],
};

describe('attributeString runIndexAt operator', () => {
  test('should get index at start of first run', () => {
    const result = runIndexAt(0, string);
    expect(result).toBe(0);
  });

  test('should get index at end of first run', () => {
    const result = runIndexAt(5, string);
    expect(result).toBe(0);
  });

  test('should get index at start of last run', () => {
    const result = runIndexAt(6, string);
    expect(result).toBe(1);
  });

  test('should get index at end of last run', () => {
    const result = runIndexAt(11, string);
    expect(result).toBe(1);
  });

  test('should get -1 at invalid index', () => {
    const result = runIndexAt(12, string);
    expect(result).toBe(-1);
  });
});
