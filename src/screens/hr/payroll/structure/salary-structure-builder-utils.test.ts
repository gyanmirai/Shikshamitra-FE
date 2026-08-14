import type { SalaryTemplateCalculation } from 'src/redux/hr/salary-template-api';

import { it, expect, describe } from 'vitest';

import { buildAppliedSalaryStructure } from './salary-structure-builder-utils';

const calculation: SalaryTemplateCalculation = {
  templateId: 'template-1',
  templateVersionId: 'version-2',
  templateVersion: 2,
  salaryBasis: 'GROSS',
  quotedMonthlyAmount: 30000,
  grossSalary: 30000,
  basicSalary: 18000,
  totalDeductions: 1010,
  netSalary: 28990,
  employerContributionTotal: 900,
  employerCost: 30900,
  earnings: [
    { componentId: 'basic', code: 'BASIC', name: 'Basic', amount: 18000, semanticType: 'BASIC', formulaType: 'PERCENTAGE_OF_GROSS', isStatutory: false },
  ],
  deductions: [
    { componentId: 'pf', code: 'EMPLOYEE_PF', name: 'PF', amount: 900, semanticType: 'EMPLOYEE_PROVIDENT_FUND', formulaType: 'EMPLOYEE_PROVIDENT_FUND', isStatutory: true },
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
  it('replaces recurring components, preserves temporary components, and stores provenance', () => {
    const result = buildAppliedSalaryStructure(
      calculation,
      [{ name: 'Old recurring', isTemp: false }, { name: 'Temporary bonus', isTemp: true }],
      [{ name: 'Old deduction', isTemp: false }, { name: 'One-time recovery', isTemp: true }]
    );

    expect(result.earningComponents.map((line) => line.name)).toEqual(['Basic', 'Temporary bonus']);
    expect(result.earningComponents[0]).toMatchObject({ isFixed: true, usesMasterValue: false });
    expect(result.deductionComponents.map((line) => line.name)).toEqual(['PF', 'One-time recovery']);
    expect(result.deductionComponents[0]).toMatchObject({ statutoryRuleId: 'pf-rule-1', isFixed: true });
    expect(result).toMatchObject({
      sourceSalaryTemplateId: 'template-1',
      sourceSalaryTemplateVersionId: 'version-2',
      sourceSalaryTemplateVersion: 2,
      quotedMonthlyAmount: 30000,
      wasModifiedAfterGeneration: false,
    });
  });
});
