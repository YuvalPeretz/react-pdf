import { describe, expect, test } from 'vitest';

import runAt from '../../src/attributedString/runAt';

const string = {
  string: 'hello world',
  runs: [
    { start: 0, end: 6, attributes: {} }, // 'hello '
    { start: 6, end: 12, attributes: {} }, // 'world'
  ],
};

describe('attributeString runAt operator', () => {
  test('should get index at start of first run', () => {
    const result = runAt(0, string);
    expect(result).toBe(string.runs[0]);
  });

  test('should get index at end of first run', () => {
    const result = runAt(5, string);
    expect(result).toBe(string.runs[0]);
  });

  test('should get index at start of last run', () => {
    const result = runAt(6, string);
    expect(result).toBe(string.runs[1]);
  });

  test('should get index at end of last run', () => {
    const result = runAt(11, string);
    expect(result).toBe(string.runs[1]);
  });

  test('should get -1 at invalid index', () => {
    const result = runAt(12, string);
    expect(result).toBeFalsy();
  });
});
