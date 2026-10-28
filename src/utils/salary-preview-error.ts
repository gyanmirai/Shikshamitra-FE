/** Safe recovery copy for salary preview business rules, including older API responses. */
export function salaryPreviewError(code: unknown, data?: Record<string, unknown> | null) {
  const targetMessage =
    'The monthly target cannot be reached with these earning rules and applicable employer contributions. Review the amount and earning rules together: earnings must equal gross, and cost to school must include employer PF/ESIC contributions. Fixed earnings cannot scale automatically.';
  const messages: Record<string, { message: string; fields: string[] }> = {
    'HR:Payroll:CompensationTargetNotSolvable': {
      message: targetMessage,
      fields: ['monthlyAmount', 'rules'],
    },
    'HR:Payroll:SalaryTemplateAllocationMismatch': {
      message:
        'Regular earnings must add up to gross salary. Review the amount and earning rules, or choose an explicit remainder earning when appropriate.',
      fields: ['monthlyAmount', 'rules'],
    },
    'HR:Payroll:SalaryTemplateEarningsExceedGross': {
      message:
        'The earning rules exceed gross salary. Reduce fixed amounts or percentages, or correct the monthly amount before previewing again.',
      fields: ['monthlyAmount', 'rules'],
    },
    'HR:Payroll:PfRuleNotFound': {
      message: 'Choose an available PF rule, then preview again.',
      fields: ['pfRuleId'],
    },
    'HR:Payroll:PfRuleNotEffective': {
      message:
        'The selected PF rule is inactive or does not cover the preview month. Choose a rule effective for that month.',
      fields: ['pfRuleId', 'effectiveMonth'],
    },
    'HR:Payroll:SalaryTemplatePfFormulaRequired': {
      message: 'Add a PF deduction using the Employee Provident Fund formula before applying PF.',
      fields: ['deductions', 'pfRuleId'],
    },
    'HR:Payroll:SalaryTemplateRequiresOneBasic': {
      message:
        'Choose Basic as the payroll purpose of exactly one earning component. Keep its entered amount or percentage.',
      fields: ['rules'],
    },
  };
  const result =
    typeof code === 'string' && Object.hasOwn(messages, code) ? messages[code] : undefined;
  if (!result) return undefined;
  const { target, fixedEarnings, salaryBasis } = data ?? {};
  if (
    code === 'HR:Payroll:CompensationTargetNotSolvable' &&
    (salaryBasis === 'EMPLOYER_COST' || salaryBasis === 'EmployerCost') &&
    typeof target === 'number' &&
    Number.isFinite(target) &&
    target > 0 &&
    typeof fixedEarnings === 'number' &&
    Number.isFinite(fixedEarnings) &&
    fixedEarnings > target &&
    fixedEarnings <= 1_000_000_000
  ) {
    return {
      ...result,
      message: `Fixed earnings total INR ${fixedEarnings.toFixed(2)}, exceeding the monthly cost to school of INR ${target.toFixed(2)} by INR ${(fixedEarnings - target).toFixed(2)}, before employer PF/ESIC contributions. Reduce the fixed earning amounts or set a target that matches earnings plus applicable employer contributions. Employee deductions do not reduce employer cost.`,
    };
  }
  return result;
}
