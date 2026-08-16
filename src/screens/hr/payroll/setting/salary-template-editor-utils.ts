import type {
  SalaryTemplateRule,
  SalaryTemplateComponentCatalogItem,
} from 'src/redux/hr/salary-template-api';

export const earningRoles = ['ORDINARY', 'BASIC', 'DEARNESS_ALLOWANCE', 'BALANCING_EARNING'];
export const deductionRoles = ['ORDINARY', 'EMPLOYEE_PROVIDENT_FUND', 'PROFESSIONAL_TAX'];

const ordinaryFormulas = [
  'PERCENTAGE_OF_GROSS',
  'PERCENTAGE_OF_BASIC',
  'PERCENTAGE_OF_COMPONENT',
  'FIXED_AMOUNT',
];

export const getFormulaOptions = (rule: SalaryTemplateRule) => {
  if (rule.semanticType === 'BASIC') return ['PERCENTAGE_OF_GROSS', 'FIXED_AMOUNT'];
  if (rule.semanticType === 'BALANCING_EARNING') return ['REMAINDER_OF_GROSS'];
  if (rule.semanticType === 'EMPLOYEE_PROVIDENT_FUND') return ['EMPLOYEE_PROVIDENT_FUND'];
  if (rule.semanticType === 'PROFESSIONAL_TAX') return ['PROFESSIONAL_TAX'];
  return ordinaryFormulas;
};

export const getRoleOptions = (lineKind: SalaryTemplateRule['lineKind']) =>
  lineKind === 'EARNING' ? earningRoles : deductionRoles;

export const createTemplateRule = (
  component: SalaryTemplateComponentCatalogItem,
  displayOrder: number
): SalaryTemplateRule => ({
  code: '',
  componentId: component.componentId,
  lineKind: component.lineKind,
  semanticType: 'ORDINARY',
  formulaType: 'FIXED_AMOUNT',
  value: 0,
  basisCode: null,
  basisComponentId: null,
  displayOrder,
});

export const applySemanticType = (
  rule: SalaryTemplateRule,
  semanticType: string
): SalaryTemplateRule => {
  const formulaType =
    semanticType === 'BALANCING_EARNING'
      ? 'REMAINDER_OF_GROSS'
      : semanticType === 'EMPLOYEE_PROVIDENT_FUND'
        ? 'EMPLOYEE_PROVIDENT_FUND'
        : semanticType === 'PROFESSIONAL_TAX'
          ? 'PROFESSIONAL_TAX'
          : semanticType === 'BASIC'
            ? 'PERCENTAGE_OF_GROSS'
            : 'FIXED_AMOUNT';
  const acceptsValue = [
    'PERCENTAGE_OF_GROSS',
    'PERCENTAGE_OF_BASIC',
    'PERCENTAGE_OF_COMPONENT',
    'FIXED_AMOUNT',
  ].includes(formulaType);
  return {
    ...rule,
    semanticType,
    formulaType,
    value: acceptsValue ? (semanticType === 'BASIC' ? 60 : 0) : null,
    basisCode: null,
    basisComponentId: null,
  };
};

export const normalizeRuleOrder = (rules: SalaryTemplateRule[]) => {
  const ordered = [
    ...rules.filter((rule) => rule.lineKind === 'EARNING'),
    ...rules.filter((rule) => rule.lineKind === 'DEDUCTION'),
  ];
  return ordered.map((rule, displayOrder) => ({ ...rule, displayOrder }));
};

export const getPublishIssues = (rules: SalaryTemplateRule[]) => {
  const issues: string[] = [];
  const basicCount = rules.filter((rule) => rule.semanticType === 'BASIC').length;
  const balanceCount = rules.filter((rule) => rule.semanticType === 'BALANCING_EARNING').length;
  const pfCount = rules.filter((rule) => rule.semanticType === 'EMPLOYEE_PROVIDENT_FUND').length;
  const ptCount = rules.filter((rule) => rule.semanticType === 'PROFESSIONAL_TAX').length;

  if (basicCount !== 1) issues.push('Add exactly one Basic earning.');
  if (balanceCount !== 1) issues.push('Add exactly one auto-balancing earning.');
  if (pfCount > 1) issues.push('Only one Employee PF deduction is allowed.');
  if (ptCount > 1) issues.push('Only one Professional Tax deduction is allowed.');

  rules.forEach((rule) => {
    const needsValue =
      rule.formulaType.startsWith('PERCENTAGE') || rule.formulaType === 'FIXED_AMOUNT';
    if (needsValue && (rule.value == null || rule.value < 0)) {
      issues.push('Every fixed or percentage formula needs a non-negative value.');
    }
    if (rule.formulaType.startsWith('PERCENTAGE') && Number(rule.value) > 100) {
      issues.push('Percentage values cannot exceed 100%.');
    }
    if (rule.formulaType === 'PERCENTAGE_OF_COMPONENT' && !rule.basisComponentId) {
      issues.push('Choose a basis component for every component percentage formula.');
    }
  });

  return [...new Set(issues)];
};

export const formatRuleLabel = (value: string) =>
  value
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
