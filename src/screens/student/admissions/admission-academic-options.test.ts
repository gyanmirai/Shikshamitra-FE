import { describe, expect, it } from 'vitest';
import { academicOptionsJson } from './admission-academic-options';

describe('saved academic template compatibility', () => {
  it.each([
    ['CLASS_INTERESTED', { source: 'Standards' }],
    ['CLASS_APPLYING_FOR', { source: 'Standards' }],
    ['CLASS', { source: 'StandardsByMedium', parentField: 'MEDIUM' }],
    ['DIVISION', { source: 'DivisionsByStandard', parentField: 'CLASS' }],
  ])('replaces %s fixed choices at runtime without mutating the saved schema', (code, source) => {
    const field = {
      code: String(code),
      fieldType: 6,
      optionsJson: '[{"value":"Old label","label":"Old label"}]',
    };
    expect(JSON.parse(academicOptionsJson(field)!)).toEqual(source);
    expect(field.optionsJson).toContain('Old label');
  });

  it('preserves explicit sources, unrelated custom choices and previous-school text', () => {
    const configured = {
      code: 'CLASS',
      fieldType: 6,
      optionsJson: '{"source":"StandardsByMediumStage","parentField":"STAGE"}',
    };
    expect(academicOptionsJson(configured)).toBe(configured.optionsJson);
    const previous = { code: 'LAST_CLASS_PASSED', fieldType: 0, optionsJson: undefined };
    expect(academicOptionsJson(previous)).toBeUndefined();
    const custom = { code: 'HOUSE', fieldType: 6, optionsJson: '["Blue","Green"]' };
    expect(academicOptionsJson(custom)).toBe(custom.optionsJson);
  });
});
