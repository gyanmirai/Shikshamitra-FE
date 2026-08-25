import type { SalaryTemplateCalculation } from 'src/redux/hr/salary-template-api';

import { it, expect, describe } from 'vitest';

import {
  getLocalMonthKey,
  isEffectiveForMonth,
  buildAppliedSalaryStructure,
} from './salary-structure-builder-utils';

const calculation: SalaryTemplateCalculation = {
  templateId: 'template-1',
  templateVersionId: 'version-2',
  templateVersion: 2,
  salaryBasis: 'GROSS',
  protectionPolicy: 'PROTECT_GROSS',
  quotedMonthlyAmount: 30000,
  effectiveMonth: '2026-08-01T00:00:00Z',
  grossSalary: 30000,
  basicSalary: 18000,
  totalDeductions: 1010,
  netSalary: 28990,
  employerContributionTotal: 900,
  employerCost: 30900,
  protectedMonthlyAmount: 30000,
  targetResult: { requested: 30000, achieved: 30000, difference: 0, isExact: true },
  employeeStateInsurance: {
    isConfigured: false,
    isCovered: false,
    canCalculate: false,
    statutoryWages: 0,
    wageCeiling: 0,
    employeeContribution: 0,
    employerContribution: 0,
    governmentContribution: 0,
    issueCodes: [],
  },
  earnings: [
    {
      componentId: 'basic',
      code: 'BASIC',
      name: 'Basic',
      amount: 18000,
      semanticType: 'BASIC',
      formulaType: 'PERCENTAGE_OF_GROSS',
      isStatutory: false,
      lineSource: 'TEMPLATE',
      persistable: true,
    },
  ],
  deductions: [
    {
      componentId: 'pf',
      code: 'EMPLOYEE_PF',
      name: 'PF',
      amount: 900,
      semanticType: 'EMPLOYEE_PROVIDENT_FUND',
      formulaType: 'EMPLOYEE_PROVIDENT_FUND',
      isStatutory: true,
      lineSource: 'SYSTEM_STATUTORY',
      persistable: false,
    },
  ],
  employerContributions: [],
  formulaTrace: [],
  warnings: [],
  pfRuleId: 'pf-rule-1',
  pfRuleVersion: 1,
  professionalTaxProfile: 'IN-GJ',
  generatedAt: '2026-08-13T10:00:00Z',
};

describe('salary structure builder application', () => {

  it('uses the local calendar month instead of UTC', () => {
    expect(getLocalMonthKey(new Date(2026, 7, 1, 0, 15))).toBe('2026-08');
  });

  it('selects PF rules against the full effective month', () => {
    expect(isEffectiveForMonth({ effectiveFrom: '2026-08-20' }, '2026-08')).toBe(true);
    expect(isEffectiveForMonth({ effectiveTo: '2026-07-31' }, '2026-08')).toBe(false);
    expect(isEffectiveForMonth({ effectiveFrom: '2026-09-01' }, '2026-08')).toBe(false);
  });
  it('replaces recurring components, preserves temporary components, and stores provenance', () => {
    const result = buildAppliedSalaryStructure(
      calculation,
      [
        { name: 'Old recurring', isTemp: false },
        { name: 'Temporary bonus', isTemp: true },
      ],
      [
        { name: 'Old deduction', isTemp: false },
        { name: 'One-time recovery', isTemp: true },
      ]
    );

    expect(result.earningComponents.map((line) => line.name)).toEqual(['Basic', 'Temporary bonus']);
    expect(result.earningComponents[0]).toMatchObject({ isFixed: true, usesMasterValue: false });
    expect(result.deductionComponents.map((line) => line.name)).toEqual(['One-time recovery']);
    expect(result).toMatchObject({
      sourceSalaryTemplateId: 'template-1',
      sourceSalaryTemplateVersionId: 'version-2',
      sourceSalaryTemplateVersion: 2,
      quotedMonthlyAmount: 30000,
      wasModifiedAfterGeneration: false,
    });
  });
});
