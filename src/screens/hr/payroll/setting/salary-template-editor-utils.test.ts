import type { SalaryTemplateRule } from 'src/redux/hr/salary-template-api';

import { it, expect, describe } from 'vitest';

import {
  getSaveIssues,
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
  it.each(['Basic Salary', 'Teaching pay'])(
    'keeps explicit Basic purpose independent of the name %s and preserves a fixed amount',
    (name) => {
      const ordinary = createTemplateRule(
        { ...component, name, calculationType: 'AMOUNT', defaultValue: 50000 },
        0
      );
      expect(ordinary.semanticType).toBe('ORDINARY');
      expect(applySemanticType(ordinary, 'BASIC')).toMatchObject({
        componentId: ordinary.componentId,
        semanticType: 'BASIC',
        formulaType: 'FIXED_AMOUNT',
        value: 50000,
      });
    }
  );
  it('rejects an earning based on the remainder but allows a deduction based on it', () => {
    const basic = applySemanticType(createTemplateRule(component, 0), 'BASIC');
    const remainder = applySemanticType(
      createTemplateRule({ ...component, componentId: 'remainder' }, 1),
      'BALANCING_EARNING'
    );
    const dependent: SalaryTemplateRule = {
      ...createTemplateRule({ ...component, componentId: 'dependent' }, 2),
      formulaType: 'PERCENTAGE_OF_COMPONENT',
      value: 10,
      basisComponentId: 'remainder',
    };
    expect(getSaveIssues([basic, remainder, dependent])).toContain(
      'An earning cannot depend on the gross remainder because that creates a circular calculation.'
    );
    expect(getSaveIssues([basic, remainder, { ...dependent, lineKind: 'DEDUCTION' }])).toEqual([]);
  });

  it('allows Basic at 100% with PF and no balancing earning', () => {
    const basic = { ...applySemanticType(createTemplateRule(component, 0), 'BASIC'), value: 100 };
    const pf = applySemanticType(
      createTemplateRule({ ...component, componentId: 'pf', lineKind: 'DEDUCTION' }, 1),
      'EMPLOYEE_PROVIDENT_FUND'
    );
    expect(getSaveIssues([basic, pf])).toEqual([]);
  });
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
    expect(basic).toMatchObject({ formulaType: 'FIXED_AMOUNT', value: 0 });
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

  it.each(['EMPLOYEE_PROVIDENT_FUND', 'PROFESSIONAL_TAX'])(
    'makes a derived %s deduction editable when changed to a manual amount',
    (semanticType) => {
      const automatic = applySemanticType(
        createTemplateRule({ ...component, componentId: 'deduction', lineKind: 'DEDUCTION' }, 1),
        semanticType
      );
      const manual = applyFormulaType(automatic, 'FIXED_AMOUNT');
      expect(manual).toMatchObject({
        semanticType: 'ORDINARY',
        formulaType: 'FIXED_AMOUNT',
        value: 0,
      });
      expect(formulaAcceptsValue(manual.formulaType)).toBe(true);
    }
  );

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

  it('requires exactly one Basic and permits at most one balancing earning', () => {
    const basic = applySemanticType(createTemplateRule(component, 0), 'BASIC');
    const balance = applySemanticType(
      createTemplateRule({ ...component, componentId: 'earning-2', name: 'Special Allowance' }, 1),
      'BALANCING_EARNING'
    );

    expect(getSaveIssues([])).toEqual([
      'Choose Basic as the payroll purpose for exactly one earning.',
    ]);
    expect(getSaveIssues([basic, balance])).toEqual([]);
    expect(getSaveIssues([basic, balance, { ...balance, componentId: 'another' }])).not.toEqual([]);
  });

  it('reports missing basis and invalid percentage values', () => {
    const rule = {
      ...createTemplateRule(component, 0),
      formulaType: 'PERCENTAGE_OF_COMPONENT',
      value: 101,
    };

    expect(getSaveIssues([rule])).toContain('Percentage values cannot exceed 100%.');
    expect(getSaveIssues([rule])).toContain(
      'Choose a basis component for every component percentage formula.'
    );
  });
});
