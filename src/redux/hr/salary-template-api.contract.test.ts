import { it, expect, describe } from 'vitest';

import {
  salaryTemplateEndpoint,
  buildCreateSalaryTemplateRequest,
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

  it('creates a blank draft without accepting client-defined rules', () => {
    expect(
      buildCreateSalaryTemplateRequest({ name: 'Gujarat Staff', description: 'Flexible draft' })
    ).toEqual({
      url: '/payroll/salary-templates',
      method: 'POST',
      body: { name: 'Gujarat Staff', description: 'Flexible draft' },
    });
  });

  it('sends the calculation basis, amount, PF rule, and Gujarat statutory profile', () => {
    expect(
      buildSalaryTemplateCalculationRequest({
        templateVersionId: 'version-1',
        salaryBasis: 'TAKE_HOME',
        monthlyAmount: 25990,
        pfRuleId: 'pf-rule-1',
      })
    ).toEqual({
      url: '/payroll/salary-templates/versions/version-1/calculate',
      method: 'POST',
      body: {
        salaryBasis: 'TAKE_HOME',
        monthlyAmount: 25990,
        pfRuleId: 'pf-rule-1',
        statutoryProfile: 'IN-GJ',
      },
    });
  });
});
