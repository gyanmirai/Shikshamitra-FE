import type {
  CalculatedSalaryLine,
  SalaryTemplateCalculation,
} from 'src/redux/hr/salary-template-api';

type ExistingComponent = Record<string, unknown> & { isTemp?: boolean };

const normalizeSemanticType = (value: string) => value.replaceAll('_', '').toUpperCase();

const toEmployeeComponent = (
  line: CalculatedSalaryLine,
  isEarning: boolean,
  pfRuleId?: string | null
) => ({
  id: null,
  componentId: line.componentId,
  name: line.name,
  earningComponentName: isEarning ? line.name : undefined,
  deductionComponentName: isEarning ? undefined : line.name,
  amount: line.amount,
  isFixed: true,
  isTemp: false,
  componentType: 'Fixed',
  dependOn: normalizeSemanticType(line.semanticType) === 'BASIC' ? 'Basic' : 'None',
  isEarning,
  usesMasterValue: false,
  semanticType: line.semanticType,
  statutoryRuleId:
    normalizeSemanticType(line.semanticType) === 'EMPLOYEEPROVIDENTFUND' ? pfRuleId || null : null,
});

export function buildAppliedSalaryStructure(
  result: SalaryTemplateCalculation,
  existingEarnings: ExistingComponent[] = [],
  existingDeductions: ExistingComponent[] = []
) {
  return {
    earningComponents: [
      ...result.earnings.map((line) => toEmployeeComponent(line, true, result.pfRuleId)),
      ...existingEarnings.filter((line) => line.isTemp),
    ],
    deductionComponents: [
      ...result.deductions.map((line) => toEmployeeComponent(line, false, result.pfRuleId)),
      ...existingDeductions.filter((line) => line.isTemp),
    ],
    pfRule: result.pfRuleId || null,
    quotedSalaryBasis: result.salaryBasis,
    quotedMonthlyAmount: result.quotedMonthlyAmount,
    sourceSalaryTemplateId: result.templateId,
    sourceSalaryTemplateVersionId: result.templateVersionId,
    sourceSalaryTemplateVersion: result.templateVersion,
    salaryGeneratedAt: result.generatedAt,
    wasModifiedAfterGeneration: false,
  };
}
