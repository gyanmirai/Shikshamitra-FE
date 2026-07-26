import { it, expect, describe } from 'vitest';

import {
  isEarningComponentDependencyError,
  getEligibleEarningDependencyOptions,
} from './earning-component-dependency-options';

describe('getEligibleEarningDependencyOptions', () => {
  const components = [
    { id: 'basic', earningComponentName: 'Basic' },
    {
      id: 'housing',
      earningComponentName: 'Housing',
      selectedEarningComponentId: 'basic',
    },
    {
      id: 'allowance',
      earningComponentName: 'Allowance',
      selectedEarningComponentId: 'housing',
    },
    { id: 'bonus', earningComponentName: 'Bonus' },
  ];

  it('excludes the component being edited and every component that depends on it', () => {
    expect(
      getEligibleEarningDependencyOptions(components, 'basic').map((component) => component.id)
    ).toEqual(['bonus']);
  });

  it('retains unrelated valid earning components', () => {
    expect(
      getEligibleEarningDependencyOptions(components, 'housing').map((component) => component.id)
    ).toEqual(['basic', 'bonus']);
  });

  it('excludes a pre-existing cyclic or broken dependency chain', () => {
    const invalidComponents = [
      { id: 'cycle-a', selectedEarningComponentId: 'cycle-b' },
      { id: 'cycle-b', selectedEarningComponentId: 'cycle-a' },
      { id: 'broken', selectedEarningComponentId: 'missing' },
      { id: 'valid' },
    ];

    expect(
      getEligibleEarningDependencyOptions(invalidComponents).map((component) => component.id)
    ).toEqual(['valid']);
  });
});

describe('isEarningComponentDependencyError', () => {
  it('recognizes the stable backend dependency validation codes', () => {
    expect(isEarningComponentDependencyError('HR:Payroll:030035')).toBe(true);
    expect(isEarningComponentDependencyError('HR:Payroll:030036')).toBe(true);
    expect(isEarningComponentDependencyError('HR:Payroll:030037')).toBe(true);
    expect(isEarningComponentDependencyError('HR:Payroll:030001')).toBe(false);
  });
});
