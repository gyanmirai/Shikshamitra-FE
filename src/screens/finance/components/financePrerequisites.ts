import { instituteSetupPaths } from 'src/constants/institute-setup';
import { financePaths, financePermissions } from 'src/constants/finance-menu';

interface PrerequisiteDefinition {
  title: string;
  description: string;
  actionLabel: string;
  href: string;
  permissions: string[];
}

const setting = (base: string) => [
  `${base.replace(/\.View$/, '')}.View`,
  `${base.replace(/\.View$/, '')}.Add`,
];

export const financePrerequisiteCatalog = {
  'fee-head': {
    title: 'Add fee heads to get started',
    description: 'Create an active fee head for this academic year, then return to continue.',
    actionLabel: 'Add fee head',
    href: financePaths.fees.settings.feeCategory,
    permissions: setting(financePermissions.fees.settings.feeCategory),
  },
  'fee-category': {
    title: 'Add a fee category first',
    description: 'A fee category is needed before you can add this fee head.',
    actionLabel: 'Add fee category',
    href: financePaths.fees.settings.feeCategory,
    permissions: setting(financePermissions.fees.settings.feeCategory),
  },
  'income-category': {
    title: 'Add an income category first',
    description: 'No active income category is available for this academic year.',
    actionLabel: 'Add income category',
    href: financePaths.accounts.settings.incomeCategories,
    permissions: setting(financePermissions.accounts.settings.incomeCategory),
  },
  'expense-category': {
    title: 'Add an expense category first',
    description: 'No active expense category is available for this academic year.',
    actionLabel: 'Add expense category',
    href: financePaths.accounts.settings.expenseCategories,
    permissions: setting(financePermissions.accounts.settings.expenseCategory),
  },
  'bank-account': {
    title: 'Add a bank account first',
    description: 'No active school bank account is available for this academic year.',
    actionLabel: 'Add bank account',
    href: financePaths.accounts.settings.bankAccounts,
    permissions: setting(financePermissions.accounts.settings.bankAccount),
  },
  'payment-term': {
    title: 'Set up payment terms first',
    description: 'Create and activate a payment term for this board and academic year.',
    actionLabel: 'Set up payment terms',
    href: financePaths.fees.settings.paymentTerms,
    permissions: setting(financePermissions.fees.settings.paymentTerms),
  },
  'collection-policy': {
    title: 'Set up a collection policy first',
    description: 'Create and activate a collection policy before publishing this fee structure.',
    actionLabel: 'Set up collection policy',
    href: financePaths.policies.collectionPolicy,
    permissions: [
      financePermissions.policies.collectionPolicyActions.view,
      financePermissions.policies.collectionPolicyActions.create,
    ],
  },
  'fee-structure': {
    title: 'Publish a fee structure first',
    description: 'No published fee structure is available for this class and academic year.',
    actionLabel: 'Set up fee structure',
    href: financePaths.fees.settings.feeStructure,
    permissions: setting(financePermissions.fees.settings.feeStructure),
  },
  'fee-assignment': {
    title: 'Assign a fee structure first',
    description: 'No fees are assigned to this student for the selected academic year.',
    actionLabel: 'Assign fee structure',
    href: financePaths.fees.structureAssign,
    permissions: setting(financePermissions.fees.structureAssign),
  },
  'concession-type': {
    title: 'Add a concession type first',
    description: 'No active concession type is available for this academic year.',
    actionLabel: 'Add concession type',
    href: financePaths.fees.settings.concessionType,
    permissions: setting(financePermissions.fees.settings.concessionType),
  },
  'concession-policy': {
    title: 'Set up a concession policy first',
    description: 'Create and activate a concession policy before creating this request.',
    actionLabel: 'Set up concession policy',
    href: financePaths.policies.concessionPolicy,
    permissions: [
      financePermissions.policies.concessionPolicyActions.view,
      financePermissions.policies.concessionPolicyActions.create,
    ],
  },
  'charge-category': {
    title: 'Add a charge category first',
    description: 'No active charge category is available for this academic year.',
    actionLabel: 'Add charge category',
    href: financePaths.fees.settings.chargeCategory,
    permissions: setting(financePermissions.fees.settings.chargeCategory),
  },
  'refund-policy-assignment': {
    title: 'Assign a refund policy first',
    description:
      'No refund policy is assigned to this payer. Configure it before requesting a refund.',
    actionLabel: 'Manage fee assignment',
    href: financePaths.fees.structureAssign,
    permissions: [
      `${financePermissions.fees.structureAssign}.View`,
      `${financePermissions.fees.structureAssign}.OverridePolicies`,
    ],
  },
  'paid-receipt': {
    title: 'No eligible paid receipt',
    description: 'Review the student payment history before requesting a refund.',
    actionLabel: 'Review collections',
    href: financePaths.fees.collections,
    permissions: [`${financePermissions.fees.collections}.View`],
  },
  'receipt-verification': {
    title: 'Verify this payment first',
    description:
      'This payment is awaiting verification. Verify its receipt before requesting a refund.',
    actionLabel: 'Verify pending receipts',
    href: financePaths.accounts.reconciliation,
    permissions: [
      `${financePermissions.accounts.reconciliation}.View`,
      financePermissions.accounts.reconciliationAdd,
    ],
  },
  'cash-balance': {
    title: 'Not enough available cash',
    description: 'Review the cash balance before recording this expense.',
    actionLabel: 'Review cash balance',
    href: financePaths.accounts.cashManagement,
    permissions: [`${financePermissions.accounts.cashManagement}.View`],
  },
  'adjustment-balance': {
    title: 'No eligible paid fee balance',
    description: 'Review the student fees before creating an adjustment.',
    actionLabel: 'Review collections',
    href: financePaths.fees.collections,
    permissions: [`${financePermissions.fees.collections}.View`],
  },
  'board-calendar': {
    title: 'Set up the board calendar first',
    description: 'No board calendar is available for the selected academic year.',
    actionLabel: 'Open academic setup',
    href: instituteSetupPaths.academicSetup,
    permissions: ['InstituteSetup.AcademicSetup.View', 'InstituteSetup.AcademicSetup.Edit'],
  },
  'board-setup': {
    title: 'Set up the board calendar first',
    description: 'No board is available for the selected academic year.',
    actionLabel: 'Open academic setup',
    href: instituteSetupPaths.academicSetup,
    permissions: ['InstituteSetup.AcademicSetup.View', 'InstituteSetup.AcademicSetup.Add'],
  },
} satisfies Record<string, PrerequisiteDefinition>;

export type FinancePrerequisiteKey = keyof typeof financePrerequisiteCatalog;
export type FinancePrerequisite = {
  key: FinancePrerequisiteKey;
  title?: string;
  description?: string;
  actionLabel?: string;
  href?: string;
};

/** Call only with the unfiltered, current-scope option list owned by the form. */
export function isFinancePrerequisiteMissing({
  options,
  required = true,
  isLoading,
  isFetching,
  isError,
  isUninitialized,
}: {
  options: readonly unknown[] | undefined;
  required?: boolean;
  isLoading?: boolean;
  isFetching?: boolean;
  isError?: boolean;
  isUninitialized?: boolean;
}): boolean {
  return (
    required &&
    options !== undefined &&
    !isLoading &&
    !isFetching &&
    !isError &&
    !isUninitialized &&
    options.length === 0
  );
}
