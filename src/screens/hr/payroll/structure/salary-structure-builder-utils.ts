import type {
  CalculatedSalaryLine,
  SalaryTemplateCalculation,
} from 'src/redux/hr/salary-template-api';

type ExistingComponent = Record<string, unknown> & { isTemp?: boolean };

export type EffectiveDateRange = {
  effectiveFrom?: string | null;
  effectiveTo?: string | null;
};

export function getLocalMonthKey(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export function isEffectiveForMonth(
  rule: EffectiveDateRange,
  monthKey: string
): boolean {
  const [year, month] = monthKey.split('-').map(Number);
  if (!year || !month || month < 1 || month > 12) return false;

  const monthStart = `${monthKey}-01`;
  const monthEnd = `${monthKey}-${String(new Date(year, month, 0).getDate()).padStart(2, '0')}`;
  return (
    (!rule.effectiveFrom || rule.effectiveFrom.slice(0, 10) <= monthEnd) &&
    (!rule.effectiveTo || rule.effectiveTo.slice(0, 10) >= monthStart)
  );
}

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
      ...result.deductions
        .filter((line) => line.persistable)
        .map((line) => toEmployeeComponent(line, false, result.pfRuleId)),
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
