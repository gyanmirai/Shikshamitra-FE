import { it, expect, describe } from 'vitest';

import { grossSalaryOption, getCalculationBase } from './payroll-calculation-base';
import { applySemanticType, createTemplateRule } from './salary-template-editor-utils';

describe('built-in Gross Salary', () => {
  it('sends a system base without a component identifier', () => {
    expect(getCalculationBase('Percentage', grossSalaryOption.id)).toEqual({
      calculationBase: 'GROSS', componentId: null,
    });
    expect(getCalculationBase('Percentage', 'component-1')).toEqual({
      calculationBase: 'COMPONENT', componentId: 'component-1',
    });
    expect(getCalculationBase('Amount', grossSalaryOption.id)).toEqual({
      calculationBase: 'COMPONENT', componentId: null,
    });
  });

  it.each(['EARNING', 'DEDUCTION'] as const)('carries %s component defaults into the template', (lineKind) => {
    const rule = createTemplateRule({
      componentId: 'component-1', name: 'Gross percentage', lineKind,
      calculationType: 'PERCENTAGE', calculationBase: 'GROSS', defaultValue: 75,
    }, 0);
    expect(rule).toMatchObject({ formulaType: 'PERCENTAGE_OF_GROSS', value: 75, basisComponentId: null });
    if (lineKind === 'EARNING') {
      expect(applySemanticType(rule, 'BASIC')).toMatchObject({ semanticType: 'BASIC', value: 75 });
    }
  });
});
