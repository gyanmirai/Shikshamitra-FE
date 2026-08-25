import type { SalaryTemplateRule } from 'src/redux/hr/salary-template-api';

import { it, expect, describe } from 'vitest';

import {
  getPublishIssues,
  applyFormulaType,
  getFormulaOptions,
  applySemanticType,
  createTemplateRule,
  normalizeRuleOrder,
  formulaAcceptsValue,
} from './salary-template-editor-utils';

const component = {
  componentId: 'earning-1',
  name: 'Basic Salary',
  description: null,
  lineKind: 'EARNING' as const,
};

describe('salary template editor utilities', () => {
  it('creates an ordinary fixed rule and applies constrained semantic formulas', () => {
    const ordinary = createTemplateRule(component, 0);
    const basic = applySemanticType(ordinary, 'BASIC');
    const balance = applySemanticType(ordinary, 'BALANCING_EARNING');

    expect(ordinary).toMatchObject({
      componentId: component.componentId,
      semanticType: 'ORDINARY',
      formulaType: 'FIXED_AMOUNT',
      value: 0,
    });
    expect(basic).toMatchObject({ formulaType: 'PERCENTAGE_OF_GROSS', value: 60 });
    expect(getFormulaOptions(basic)).toContain('FIXED_AMOUNT');
    expect(getFormulaOptions(basic)).toContain('REMAINDER_OF_GROSS');
    expect(balance).toMatchObject({ formulaType: 'REMAINDER_OF_GROSS', value: null });
  });

  it('keeps automatic formulas derived and makes a manual formula editable', () => {
    const balance = applySemanticType(createTemplateRule(component, 0), 'BALANCING_EARNING');
    const fixed = applyFormulaType(balance, 'FIXED_AMOUNT');

    expect(formulaAcceptsValue(balance.formulaType)).toBe(false);
    expect(fixed).toMatchObject({
      semanticType: 'ORDINARY',
      formulaType: 'FIXED_AMOUNT',
      value: 0,
    });
    expect(formulaAcceptsValue(fixed.formulaType)).toBe(true);
  });

  it('normalizes earnings before deductions and assigns stable display order', () => {
    const rules: SalaryTemplateRule[] = [
      {
        ...createTemplateRule(
          { ...component, componentId: 'deduction-1', lineKind: 'DEDUCTION' },
          9
        ),
      },
      { ...createTemplateRule(component, 7) },
    ];

    expect(normalizeRuleOrder(rules).map((rule) => [rule.componentId, rule.displayOrder])).toEqual([
      ['earning-1', 0],
      ['deduction-1', 1],
    ]);
  });

  it('requires exactly one Basic and one balancing earning before publishing', () => {
    const basic = applySemanticType(createTemplateRule(component, 0), 'BASIC');
    const balance = applySemanticType(
      createTemplateRule({ ...component, componentId: 'earning-2', name: 'Special Allowance' }, 1),
      'BALANCING_EARNING'
    );

    expect(getPublishIssues([])).toEqual([
      'Add exactly one Basic earning.',
      'Add exactly one auto-balancing earning.',
    ]);
    expect(getPublishIssues([basic, balance])).toEqual([]);
  });

  it('reports missing basis and invalid percentage values', () => {
    const rule = {
      ...createTemplateRule(component, 0),
      formulaType: 'PERCENTAGE_OF_COMPONENT',
      value: 101,
    };

    expect(getPublishIssues([rule])).toContain('Percentage values cannot exceed 100%.');
    expect(getPublishIssues([rule])).toContain(
      'Choose a basis component for every component percentage formula.'
    );
  });
});
