import { it, expect, describe } from 'vitest';

import {
  academicOptionsJson,
  hasBoardClassOptions,
  readBoardClassOptions,
} from './admission-academic-options';

describe('saved academic template compatibility', () => {
  it('adds the Board filter only to standalone class choices, preserving explicit academic cascades', () => {
    expect(
      hasBoardClassOptions({
        code: 'CLASS_INTERESTED',
        fieldType: 6,
        optionsJson: '{"source":"Standards"}',
      })
    ).toBe(true);
    expect(
      hasBoardClassOptions({
        code: 'CLASS',
        fieldType: 6,
        optionsJson: '{"source":"StandardsByMedium","parentField":"MEDIUM"}',
      })
    ).toBe(false);
    expect(
      hasBoardClassOptions({
        code: 'DIVISION',
        fieldType: 6,
        optionsJson: '{"source":"DivisionsByStandard","parentField":"CLASS"}',
      })
    ).toBe(false);
    expect(
      hasBoardClassOptions({
        code: 'CLASS_INTERESTED',
        fieldType: 7,
        optionsJson: '{"source":"Standards"}',
      })
    ).toBe(false);
    const resolved = JSON.stringify([
      { value: 'class-6', label: 'Class 6', boardId: 'cbse', boardLabel: 'CBSE' },
    ]);
    expect(
      hasBoardClassOptions({ code: 'CUSTOM_CLASS', fieldType: 6, optionsJson: resolved })
    ).toBe(true);
    expect(readBoardClassOptions(resolved)[0]).toMatchObject({
      value: 'class-6',
      boardId: 'cbse',
      isActive: true,
    });
    expect(readBoardClassOptions('[{"value":"legacy","label":"Class 6"}]')).toEqual([]);
    expect(readBoardClassOptions('not-json')).toEqual([]);
  });
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
