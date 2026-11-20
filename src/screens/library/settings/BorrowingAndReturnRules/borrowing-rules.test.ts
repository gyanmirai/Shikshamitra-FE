import { it, expect, describe } from 'vitest';

import { createBorrowingRulesDraft, buildBorrowingRulesPayload } from './borrowing-rules';

describe('canonical borrowing rules', () => {
  it('keeps saved Staff limits and explicit zero without substituting Teacher or defaults', () => {
    const draft = createBorrowingRulesDraft([
      { role: 'Student', maxBooksAtTime: 0, reservationLimit: 0 },
      { role: 'Staff', maxBooksAtTime: 5, reservationLimit: 3 },
    ]);
    expect(buildBorrowingRulesPayload(draft)).toEqual({
      rules: [
        { role: 0, maxBooksAtTime: 0, reservationLimit: 0 },
        { role: 1, maxBooksAtTime: 5, reservationLimit: 3 },
      ],
    });
  });

  it('requires policy input for missing roles rather than silently choosing zero', () => {
    const draft = createBorrowingRulesDraft([
      { role: 'Student', maxBooksAtTime: 3, reservationLimit: 2 },
    ]);
    expect(draft.rules[1]).toEqual({
      role: 1,
      name: 'Staff',
      maxBooksAtTime: '',
      reservationLimit: '',
    });
    expect(() => buildBorrowingRulesPayload(draft)).toThrow();
  });

  it.each(['-1', '1.5', '100', 'invalid'])(
    'rejects invalid policy limit %s before creating a request',
    (value) => {
      const draft = createBorrowingRulesDraft([
        { role: 0, maxBooksAtTime: 3, reservationLimit: 2 },
        { role: 1, maxBooksAtTime: 5, reservationLimit: 3 },
      ]);
      draft.rules[0].maxBooksAtTime = value;
      expect(() => buildBorrowingRulesPayload(draft)).toThrow();
    }
  );
});
