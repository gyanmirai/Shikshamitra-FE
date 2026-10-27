import type {
  SalaryTemplateRule,
  SalaryTemplateComponentCatalogItem,
} from 'src/redux/hr/salary-template-api';

export const earningRoles = ['ORDINARY', 'BASIC', 'DEARNESS_ALLOWANCE', 'BALANCING_EARNING'];
export const deductionRoles = ['ORDINARY', 'EMPLOYEE_PROVIDENT_FUND', 'PROFESSIONAL_TAX'];

const editableFormulas = [
  'PERCENTAGE_OF_GROSS',
  'PERCENTAGE_OF_BASIC',
  'PERCENTAGE_OF_COMPONENT',
  'FIXED_AMOUNT',
];

const automaticFormulaSemanticTypes: Record<string, string> = {
  REMAINDER_OF_GROSS: 'BALANCING_EARNING',
  EMPLOYEE_PROVIDENT_FUND: 'EMPLOYEE_PROVIDENT_FUND',
  PROFESSIONAL_TAX: 'PROFESSIONAL_TAX',
};

export const getFormulaOptions = (rule: SalaryTemplateRule) =>
  rule.lineKind === 'EARNING'
    ? [...editableFormulas, 'REMAINDER_OF_GROSS']
    : [...editableFormulas, 'EMPLOYEE_PROVIDENT_FUND', 'PROFESSIONAL_TAX'];

export const formulaAcceptsValue = (formulaType: string) => editableFormulas.includes(formulaType);

export const getAutomaticFormulaSemanticType = (formulaType: string) =>
  automaticFormulaSemanticTypes[formulaType] || null;

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
  formulaType:
    component.calculationType === 'PERCENTAGE'
      ? component.calculationBase === 'GROSS'
        ? 'PERCENTAGE_OF_GROSS'
        : 'PERCENTAGE_OF_COMPONENT'
      : 'FIXED_AMOUNT',
  value: component.defaultValue ?? 0,
  basisCode: null,
  basisComponentId:
    component.calculationBase === 'GROSS' ? null : (component.basisComponentId ?? null),
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
            ? ['FIXED_AMOUNT', 'PERCENTAGE_OF_GROSS'].includes(rule.formulaType)
              ? rule.formulaType
              : 'PERCENTAGE_OF_GROSS'
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
    value: acceptsValue
      ? semanticType === 'BASIC'
        ? ['FIXED_AMOUNT', 'PERCENTAGE_OF_GROSS'].includes(rule.formulaType)
          ? rule.value
          : 60
        : 0
      : null,
    basisCode: null,
    basisComponentId: null,
  };
};

export const applyFormulaType = (
  rule: SalaryTemplateRule,
  formulaType: string
): SalaryTemplateRule => {
  const automaticSemanticType = getAutomaticFormulaSemanticType(formulaType);
  const acceptsValue = formulaAcceptsValue(formulaType);
  const currentSemanticRequiresAutomaticFormula = [
    'BALANCING_EARNING',
    'EMPLOYEE_PROVIDENT_FUND',
    'PROFESSIONAL_TAX',
  ].includes(rule.semanticType);
  const basicSupportsFormula = ['PERCENTAGE_OF_GROSS', 'FIXED_AMOUNT'].includes(formulaType);
  let { semanticType } = rule;
  if (automaticSemanticType) {
    semanticType = automaticSemanticType;
  } else if (
    currentSemanticRequiresAutomaticFormula ||
    (rule.semanticType === 'BASIC' && !basicSupportsFormula)
  ) {
    semanticType = 'ORDINARY';
  }

  return {
    ...rule,
    semanticType,
    formulaType,
    value: acceptsValue ? (rule.value ?? 0) : null,
    basisCode: null,
    basisComponentId: formulaType === 'PERCENTAGE_OF_COMPONENT' ? rule.basisComponentId : null,
  };
};

export const normalizeRuleOrder = (rules: SalaryTemplateRule[]) => {
  const ordered = [
    ...rules.filter((rule) => rule.lineKind === 'EARNING'),
    ...rules.filter((rule) => rule.lineKind === 'DEDUCTION'),
  ];
  return ordered.map((rule, displayOrder) => ({ ...rule, displayOrder }));
};

export const getSaveIssues = (rules: SalaryTemplateRule[]) => {
  const issues: string[] = [];
  const basicCount = rules.filter((rule) => rule.semanticType === 'BASIC').length;
  const balanceCount = rules.filter((rule) => rule.semanticType === 'BALANCING_EARNING').length;
  const pfCount = rules.filter((rule) => rule.semanticType === 'EMPLOYEE_PROVIDENT_FUND').length;
  const ptCount = rules.filter((rule) => rule.semanticType === 'PROFESSIONAL_TAX').length;

  if (basicCount !== 1) issues.push('Choose Basic as the payroll purpose for exactly one earning.');
  if (balanceCount > 1) issues.push('Keep at most one auto-balancing earning.');
  if (pfCount > 1) issues.push('Only one Staff PF deduction is allowed.');
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
    if (
      rule.lineKind === 'EARNING' &&
      rule.formulaType === 'PERCENTAGE_OF_COMPONENT' &&
      rules.some(
        (candidate) =>
          candidate.componentId === rule.basisComponentId &&
          candidate.formulaType === 'REMAINDER_OF_GROSS'
      )
    ) {
      issues.push(
        'An earning cannot depend on the gross remainder because that creates a circular calculation.'
      );
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
