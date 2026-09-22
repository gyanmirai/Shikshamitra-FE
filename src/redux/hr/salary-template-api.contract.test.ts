import { it, expect, describe } from 'vitest';

import {
  salaryTemplateEndpoint,
  buildSaveSalaryTemplateRequest,
  buildSalaryTemplateCalculationRequest,
  salaryTemplateComponentCatalogEndpoint,
} from './salary-template-api';

describe('salary template API contract', () => {
  it('targets the payroll salary-template endpoint', () => {
    expect(salaryTemplateEndpoint).toBe('/payroll/salary-templates');
    expect(salaryTemplateComponentCatalogEndpoint).toBe(
      '/payroll/salary-templates/component-catalog'
    );
  });

  it('creates a complete active template and updates through the same contract', () => {
    const body = {
      previewToken: 'proof', sampleMonthlyAmount: 20000, sampleEffectiveMonth: '2026-09-01T00:00:00.000Z',
      name: 'Gujarat Staff',
      description: 'Reusable salary setup',
      defaultSalaryBasis: 'EMPLOYER_COST' as const,
      defaultProtectionPolicy: 'PROTECT_EMPLOYER_COST' as const,
      defaultPfApplicable: false,
      defaultPfRuleId: null,
      rules: [],
      idempotencyKey: 'operation-1',
      expectedActiveVersionId: null,
      concurrencyStamp: null,
    };
    expect(
      buildSaveSalaryTemplateRequest(body)
    ).toEqual({
      url: '/payroll/salary-templates',
      method: 'POST',
      body,
    });
    expect(buildSaveSalaryTemplateRequest(body, 'template-1')).toEqual({
      url: '/payroll/salary-templates/template-1',
      method: 'PUT',
      body,
    });
  });

  it('sends quote protection, effective month, employee context, and Gujarat statutory profile', () => {
    expect(
      buildSalaryTemplateCalculationRequest({
        templateVersionId: 'version-1',
        salaryBasis: 'TAKE_HOME',
        protectionPolicy: 'PROTECT_TAKE_HOME',
        monthlyAmount: 25990,
        effectiveMonth: '2026-08-01T00:00:00.000Z',
        employeeId: 'employee-1',
        pfApplicable: true,
        pfRuleId: 'pf-rule-1',
      })
    ).toEqual({
      url: '/payroll/salary-templates/versions/version-1/calculate',
      method: 'POST',
      body: {
        salaryBasis: 'TAKE_HOME',
        protectionPolicy: 'PROTECT_TAKE_HOME',
        monthlyAmount: 25990,
        effectiveMonth: '2026-08-01T00:00:00.000Z',
        employeeId: 'employee-1',
        pfApplicable: true,
        pfRuleId: 'pf-rule-1',
        statutoryProfile: 'IN-GJ',
      },
    });
  });
});
