import { it, expect, describe } from 'vitest';

import {
  parseEditableAdmissionVisibilityRule,
  serializeEditableAdmissionVisibilityRule,
} from './field-visibility-rules';

describe('admission form visual visibility rules', () => {
  it('reads a supported simple rule', () => {
    expect(
      parseEditableAdmissionVisibilityRule(
        '{"field":"HAS_SIBLING","operator":"Equals","value":true}'
      )
    ).toEqual({
      rule: { field: 'HAS_SIBLING', operator: 'Equals', value: true },
    });
  });

  it('does not present a grouped rule as a simple condition', () => {
    expect(
      parseEditableAdmissionVisibilityRule(
        '{"all":[{"field":"AGE","operator":"GreaterThan","value":5}]}'
      )
    ).toEqual({ rule: null, error: 'The saved visibility rule uses an advanced format.' });
  });

  it('reports invalid JSON without replacing it', () => {
    expect(parseEditableAdmissionVisibilityRule('{invalid')).toEqual({
      rule: null,
      error: 'The saved visibility rule contains invalid JSON.',
    });
  });

  it('serializes supported values without changing their type', () => {
    expect(
      serializeEditableAdmissionVisibilityRule({
        field: 'HAS_SIBLING',
        operator: 'Equals',
        value: true,
      })
    ).toBe('{"field":"HAS_SIBLING","operator":"Equals","value":true}');
  });
});
