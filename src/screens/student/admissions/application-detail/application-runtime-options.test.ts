import { it, expect, describe } from 'vitest';

import {
  parseRuntimeOptionsSource,
  resolveRuntimeOptionsJson,
} from './application-runtime-options';

const dynamicSource = JSON.stringify({ source: 'EducationBoards', parentField: 'AcademicYear' });

describe('application runtime options', () => {
  it('keeps the current dynamic value valid while options load', () => {
    expect(
      JSON.parse(
        resolveRuntimeOptionsJson({
          configuredOptionsJson: dynamicSource,
          currentValue: 'board-id',
          multiple: false,
        })!
      )
    ).toEqual([{ value: 'board-id', label: 'board-id' }]);
  });

  it('does not duplicate a selected value after options resolve', () => {
    expect(
      JSON.parse(
        resolveRuntimeOptionsJson({
          configuredOptionsJson: dynamicSource,
          resolvedOptionsJson: JSON.stringify([{ value: 'board-id', label: 'CBSE' }]),
          currentValue: 'board-id',
          multiple: false,
        })!
      )
    ).toEqual([{ value: 'board-id', label: 'CBSE' }]);
  });

  it('preserves every selected value for a dynamic multi-select', () => {
    expect(
      JSON.parse(
        resolveRuntimeOptionsJson({
          configuredOptionsJson: dynamicSource,
          currentValue: JSON.stringify(['one', 'two']),
          multiple: true,
        })!
      ).map((option: { value: string }) => option.value)
    ).toEqual(['one', 'two']);
  });

  it('leaves static options unchanged and parses dynamic source metadata', () => {
    const staticOptions = JSON.stringify([{ value: 'Yes', label: 'Yes' }]);
    expect(
      resolveRuntimeOptionsJson({
        configuredOptionsJson: staticOptions,
        currentValue: 'Yes',
        multiple: false,
      })
    ).toBe(staticOptions);
    expect(parseRuntimeOptionsSource(dynamicSource)).toEqual({
      source: 'EducationBoards',
      parentField: 'AcademicYear',
    });
  });
});
