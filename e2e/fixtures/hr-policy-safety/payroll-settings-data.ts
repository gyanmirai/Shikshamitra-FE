export const earningComponents = [
  {
    id: 'earning-1',
    componentName: 'Synthetic Basic Pay',
    earningComponentName: 'Synthetic Basic Pay',
    earningType: 'Fixed',
    calculationType: 'Amount',
    amount: 20000,
    visibleInPayslip: true,
  },
];
export const deductionComponents = [
  {
    id: 'deduction-1',
    deductionName: 'Synthetic Deduction',
    deductionComponentName: 'Synthetic Deduction',
    deductionType: 'Fixed',
    calculationType: 'Amount',
    amount: 200,
    visibleInPayslip: true,
  },
];
export const professionalTax = [
  {
    id: 'tax-1',
    jurisdictionCode: 'IN-GJ',
    effectiveFrom: '2026-04-01',
    fromSalary: 12000,
    toSalary: null,
    taxAmount: 200,
    isActive: true,
    deductInCessationMonth: true,
  },
];
export const esiPolicies = [
  {
    id: 'esi-policy-1',
    name: 'Synthetic ESIC Policy',
    code: 'SYN_ESIC',
    isDefault: true,
    isArchived: false,
    concurrencyStamp: 'synthetic-stamp',
    versions: [
      {
        id: 'esi-version-1',
        version: 1,
        effectiveFrom: '2026-04-01',
        employeePercentage: 0.75,
        employerPercentage: 3.25,
        standardWageCeiling: 21000,
        disabilityWageCeiling: 25000,
        employeeShareDailyWageExemption: 176,
        establishmentThreshold: 10,
        exclusionCapPercentage: 50,
        inKindCapPercentage: 15,
        roundingPolicy: 'NextHigherRupee',
        sourceUrl: 'https://example.com/synthetic-policy',
        sourceVerifiedOn: '2026-10-01',
      },
    ],
  },
];
export const salaryTemplates = [
  {
    id: 'template-1',
    name: 'Synthetic Salary Template',
    status: 'ACTIVE',
    isDefault: true,
    activeVersion: 1,
    versionCount: 1,
    updatedAt: '2026-10-01',
    concurrencyStamp: 'synthetic-stamp',
    editableVersion: {
      id: 'template-version-1',
      versionNumber: 1,
      status: 'ACTIVE',
      defaultSalaryBasis: 'GROSS',
      defaultProtectionPolicy: 'PROTECT_GROSS',
      defaultPfApplicable: false,
      defaultPfRuleId: null,
      rules: [],
    },
  },
];
