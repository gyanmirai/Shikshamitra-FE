import { it, expect, describe } from 'vitest';

import { formatQuestionBankAdvancedFilterLabel } from './question-bank-filter-labels';

describe('formatQuestionBankAdvancedFilterLabel', () => {
  it('maps approved and draft status enums to user-facing labels', () => {
    expect(formatQuestionBankAdvancedFilterLabel('status', 3)).toBe('Status: Approved');
    expect(formatQuestionBankAdvancedFilterLabel('status', 1)).toBe('Status: Draft');
  });

  it('maps other enum-backed filters and preserves plain values', () => {
    expect(formatQuestionBankAdvancedFilterLabel('difficultyLevel', '2')).toBe(
      'Difficulty: Medium'
    );
    expect(formatQuestionBankAdvancedFilterLabel('topicName', 'Algebra')).toBe('Topic: Algebra');
  });
});
