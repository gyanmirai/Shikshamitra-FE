import type {
  SalaryBasis,
  SalaryTemplate,
  ProtectionPolicy,
  SalaryTemplateRule,
} from 'src/redux/hr/salary-template-api';

import * as Yup from 'yup';

import { getSaveIssues, formulaAcceptsValue } from './salary-template-editor-utils';

export type EditorValues = {
  name: string;
  description: string;
  defaultSalaryBasis: SalaryBasis;
  defaultProtectionPolicy: ProtectionPolicy;
  defaultPfApplicable: boolean;
  defaultPfRuleId: string;
  rules: SalaryTemplateRule[];
};

export const initialEditorValues = (template?: SalaryTemplate): EditorValues => ({
  name: template?.name || '',
  description: template?.description || '',
  defaultSalaryBasis: template?.editableVersion.defaultSalaryBasis || 'EMPLOYER_COST',
  defaultProtectionPolicy:
    template?.editableVersion.defaultProtectionPolicy || 'PROTECT_EMPLOYER_COST',
  defaultPfApplicable: template?.editableVersion.defaultPfApplicable || false,
  defaultPfRuleId: template?.editableVersion.defaultPfRuleId || '',
  rules: template?.editableVersion.rules || [],
});

export const editorSchema = Yup.object({
  name: Yup.string().trim().required('Template name is required.').max(160),
  description: Yup.string().trim().max(500),
  defaultSalaryBasis: Yup.string().required(),
  defaultProtectionPolicy: Yup.string().oneOf(['PROTECT_EMPLOYER_COST', 'PROTECT_TAKE_HOME'], 'Choose CTC or take-home protection.').required(),
  defaultPfRuleId: Yup.string().when('defaultPfApplicable', {
    is: true,
    then: (schema) => schema.required('Choose the default PF rule.'),
  }),
  rules: Yup.array().of(
    Yup.object({
      value: Yup.number()
        .nullable()
        .when('formulaType', ([formula], schema) => {
          if (!formulaAcceptsValue(formula)) return schema;
          const value = schema.required('Enter a value.').min(0, 'Enter a non-negative value.');
          return formula.startsWith('PERCENTAGE')
            ? value.max(100, 'Percentage cannot exceed 100%.')
            : value;
        }),
      basisComponentId: Yup.string()
        .nullable()
        .when('formulaType', {
          is: 'PERCENTAGE_OF_COMPONENT',
          then: (schema) => schema.required('Choose a basis component.'),
        }),
    })
  ),
});

export const configurationIssues = (values: EditorValues) => {
  const pfPresent = values.rules.some((rule) => rule.formulaType === 'EMPLOYEE_PROVIDENT_FUND');
  return [
    ...(values.defaultProtectionPolicy === 'PROTECT_GROSS' ? ['Choose CTC or take-home protection before saving a new version.'] : []),
    ...getSaveIssues(values.rules),
    ...(pfPresent && !values.defaultPfRuleId
      ? ['Choose an active PF rule for the PF formula.']
      : []),
    ...(values.defaultPfApplicable && !pfPresent
      ? ['Add a PF deduction when PF applies by default.']
      : []),
    ...values.rules
      .filter(
        (rule) =>
          rule.formulaType === 'PERCENTAGE_OF_COMPONENT' &&
          rule.basisComponentId &&
          !values.rules.some(
            (basis) =>
              basis.componentId === rule.basisComponentId && basis.componentId !== rule.componentId
          )
      )
      .map(() => 'Choose an existing, different basis component.'),
  ];
};

export const formulaSummary = (rule: SalaryTemplateRule, names: Map<string, string>) => {
  const amount = rule.value == null ? 'Not set' : String(rule.value);
  switch (rule.formulaType) {
    case 'PERCENTAGE_OF_GROSS':
      return `${amount}% of Gross Salary`;
    case 'PERCENTAGE_OF_BASIC':
      return `${amount}% of Basic Salary`;
    case 'PERCENTAGE_OF_COMPONENT':
      return `${amount}% of ${names.get(rule.basisComponentId || '') || 'a component to select'}`;
    case 'FIXED_AMOUNT':
      return 'Fixed monthly amount';
    case 'REMAINDER_OF_GROSS':
      return 'Remaining Gross Salary · Calculated automatically';
    case 'EMPLOYEE_PROVIDENT_FUND':
      return 'PF rule · Calculated automatically';
    case 'PROFESSIONAL_TAX':
      return 'Statutory rule · Calculated automatically';
    default:
      return 'Calculated automatically';
  }
};
