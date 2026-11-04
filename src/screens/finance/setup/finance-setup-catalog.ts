import { financePaths, financePermissions } from 'src/constants/finance-menu';

export const financeSetupStages = [
  { key: 'accounts', title: 'Accounts Setup' },
  { key: 'fees', title: 'Fee Settings' },
  { key: 'policies', title: 'Policies & Rules' },
  { key: 'structures', title: 'Fee Structures' },
  { key: 'assignment', title: 'Student Fee Assignment' },
  { key: 'operations', title: 'Finance Workflows' },
  { key: 'review', title: 'Review & Finish' },
] as const;

export type FinanceSetupStageKey = (typeof financeSetupStages)[number]['key'];

export const financeSetupSettings = [
  {
    key: 'income-categories',
    stage: 'accounts',
    title: 'Income Categories',
    description: 'Start by defining how school income is classified in Accounts.',
    path: financePaths.accounts.settings.incomeCategories,
    permission: financePermissions.accounts.settings.incomeCategory,
    instructions: [
      'Review the income categories available for the selected academic year.',
      'Create the categories your school needs, such as school fees, transport fees or other income.',
      'Keep the categories you intend to use active. You will select them when configuring fee heads, charges and late fees.',
    ],
    note: 'Selecting the stored None category is valid when you intentionally want an amount excluded from Accounts income. Leaving a required selection blank is different.',
  },
  {
    key: 'expense-categories',
    stage: 'accounts',
    title: 'Expense Categories',
    description: 'Classify school expenses and establish the category used for refund payouts.',
    path: financePaths.accounts.settings.expenseCategories,
    permission: financePermissions.accounts.settings.expenseCategory,
    instructions: [
      'Review or create the expense categories your school will use.',
      'Keep the required categories active for manual expenses and refund routing.',
      'Choose the appropriate expense category later in Refund Policy and payout approval.',
    ],
    note: 'The stored None category intentionally excludes an amount from Accounts expenses. It does not remove the original payment evidence.',
  },
  {
    key: 'bank-accounts',
    stage: 'accounts',
    title: 'Bank Accounts',
    description: 'Prepare school bank accounts for noncash receipts, payments and cash deposits.',
    path: financePaths.accounts.settings.bankAccounts,
    permission: financePermissions.accounts.settings.bankAccount,
    instructions: [
      'Review the school bank accounts available in this academic-year context.',
      'Add or update the bank details using the Bank Accounts form and verify the account information.',
      'Keep the receiving and paying accounts active. Noncash collections and applicable payouts must select an eligible school bank account.',
    ],
    note: 'Cash collections do not require a receiving bank. Do not duplicate an existing bank account merely to complete this guide.',
  },
  {
    key: 'fee-categories',
    stage: 'fees',
    title: 'Fee Categories & Heads',
    description: 'Create the fee categories and the individual fee heads students will be charged.',
    path: financePaths.fees.settings.feeCategory,
    permission: `${financePermissions.fees.settings.feeCategory}.View`,
    instructions: [
      'Create a fee category for each meaningful group of school fees.',
      'Add fee heads through the Fee Category form and choose the Income Category for each head.',
      'Review active fee heads before using them in payment schedules, policies and fee structures.',
    ],
    note: 'Configure Income Categories first. Fee heads remain the source of the charge identity used in structures, collections and reports.',
  },
  {
    key: 'payment-terms',
    stage: 'fees',
    title: 'Payment Terms',
    description: 'Define installment schedules before pricing fee structures.',
    path: financePaths.fees.settings.paymentTerms,
    permission: `${financePermissions.fees.settings.paymentTerms}.View`,
    instructions: [
      'Choose the applicable education board and review its configured date window.',
      'Create the installment periods, names, allocation percentages, due dates and demand-date rules. Allocations must total 100%.',
      'Activate the valid schedule and review the default Payment Term for each applicable board.',
    ],
    note: 'Payment Terms define the schedule. Collection Policy controls collection and late-fee behaviour. Dates must use the configured board calendar.',
  },
  {
    key: 'charge-categories',
    stage: 'fees',
    title: 'Charge Categories',
    description: 'Prepare categories for additional charges when your school needs them.',
    path: financePaths.fees.settings.chargeCategory,
    permission: `${financePermissions.fees.settings.chargeCategory}.View`,
    instructions: [
      'Identify the types of additional charges your school records.',
      'Create each required Charge Category and choose its Income Category.',
      'Keep the category active before creating a charge request. The charge workflow resolves its income mapping from this category.',
    ],
    note: 'This is needed for Charges. You can defer it if the school is not using additional charges.',
  },
  {
    key: 'concession-types',
    stage: 'fees',
    title: 'Concession Types',
    description: 'Define the concession types and supporting evidence your school accepts.',
    path: financePaths.fees.settings.concessionType,
    permission: `${financePermissions.fees.settings.concessionType}.View`,
    instructions: [
      'Create the concession types used by the school for this academic year.',
      'Configure the evidence definitions required by each type, where applicable.',
      'Keep applicable types active before preparing concession policy and request workflows.',
    ],
    note: 'Concession setup is needed when the school uses concessions; it should not force a concession onto every fee assignment.',
  },
  {
    key: 'collection-policy',
    stage: 'policies',
    title: 'Collection Policy',
    description: 'Set the rules applied when collecting student fees and charges.',
    path: financePaths.policies.collectionPolicy,
    permission: financePermissions.policies.collectionPolicy,
    instructions: [
      'Review payment and allocation rules, late-fee calculations and permitted waiver behaviour.',
      'Choose the late-fee Income Category where required and configure whether fees and charges use combined or separate receipts.',
      'Validate and activate the policy version to use in the fee structure.',
    ],
    note: 'Income Categories should be ready first. Receipt grouping is configured here; inactive posting tools are not setup prerequisites.',
  },
  {
    key: 'refund-policy',
    stage: 'policies',
    title: 'Refund Policy',
    description:
      'Prepare refund eligibility and payout defaults before the school accepts refund requests.',
    path: financePaths.policies.refundPolicy,
    permission: financePermissions.policies.refundPolicy,
    instructions: [
      'Review eligibility rules, limits and applicable effective dates.',
      'Select the Expense Category and default paying bank where required.',
      'Activate the valid policy version and select the appropriate version when creating a fee structure.',
    ],
    note: 'Expense Categories and applicable paying bank accounts come first. A policy does not by itself make an unpaid or unverified amount refundable.',
  },
  {
    key: 'concession-policy',
    stage: 'policies',
    title: 'Concession Policy',
    description: 'Define eligibility, calculation, limits and approvals for concessions.',
    path: financePaths.policies.concessionPolicy,
    permission: financePermissions.policies.concessionPolicy,
    instructions: [
      'Review applicable concession types, eligible fees and evidence requirements.',
      'Configure calculation, limits and approval rules using the policy form.',
      'Activate the applicable version and review policy selection in the student assignment or concession context.',
    ],
    note: 'Use the existing policy selection rules. Do not apply a concession or alter student balances simply to finish setup.',
  },
  {
    key: 'proration-policy',
    stage: 'policies',
    title: 'Proration Policy',
    description:
      'Configure recurring-fee treatment for joining and early withdrawal, where applicable.',
    path: financePaths.policies.prorationPolicy,
    permission: financePermissions.policies.prorationPolicy,
    instructions: [
      'Review the recurring fee heads that need joining-date or withdrawal rules.',
      'Configure and preview admission and early-withdrawal behaviour independently.',
      'Activate the intended academic-year default before the affected admission or fee preparation.',
    ],
    note: 'Proration uses the academic-year default and saved policy snapshots. It is not attached separately to each fee structure, and a new default does not rewrite old fees.',
  },
  {
    key: 'fee-structures',
    stage: 'structures',
    title: 'Fee Structures',
    description:
      'Combine the configured heads, prices, schedules and policies for the intended academic groups.',
    path: financePaths.fees.settings.feeStructure,
    permission: financePermissions.fees.settings.feeStructureActions.view,
    instructions: [
      'Choose the intended academic scope and create the appropriate fee structure.',
      'Add fee heads, amounts, optional selections and the required active Payment Term versions.',
      'Select applicable policy versions, preview the schedule and publish the validated structure.',
      'Check coverage for every class or group that needs fees. Finding one published structure does not prove that all classes are covered.',
    ],
    note: 'Fee Categories and heads, Payment Terms and applicable policy versions must be ready before publication. Preserve historical versions already used by students.',
  },
] as const;

export type FinanceSetupSettingKey = (typeof financeSetupSettings)[number]['key'];
export type FinanceSetupPosition = {
  stage: FinanceSetupStageKey;
  setting: FinanceSetupSettingKey | null;
};

export const financeWorkflowGuides = [
  {
    title: 'Notifications',
    path: financePaths.notification,
    permission: financePermissions.notification,
    description:
      'Review the available Finance communication options, audience and academic-year context. Opening or finishing this guide does not send notifications.',
  },
  {
    title: 'Collections & Receipts',
    path: financePaths.fees.collections,
    permission: `${financePermissions.fees.collections}.View`,
    description:
      'Assign student fees first. Review collectible installments, policy rules and the receiving bank for noncash payments. Verify the generated receipt and payment status.',
  },
  {
    title: 'Charges',
    path: financePaths.fees.charges,
    permission: financePermissions.fees.chargeActions.view,
    description:
      'Prepare active Charge Categories and income mappings. Create the request, review its students and amounts, obtain the required approval, then collect eligible charges.',
  },
  {
    title: 'Concessions',
    path: financePaths.fees.concessions,
    permission: financePermissions.fees.concessionActions.view,
    description:
      'Review the student fee context, applicable policy, type and evidence. Submit for the required approval and inspect the recorded benefit.',
  },
  {
    title: 'Refunds',
    path: financePaths.feeRefund,
    permission: financePermissions.fees.refundActions.view,
    description:
      'Check the applicable refund policy and verified refundable paid balance. Submit, review and approve the request before recording and confirming its payout.',
  },
  {
    title: 'Income',
    path: financePaths.incomeTracking,
    permission: `${financePermissions.accounts.income}.View`,
    description:
      'Review automatically recorded source income. Use manual income only for a separate income event, with its category, payment method and bank where applicable.',
  },
  {
    title: 'Expenses',
    path: financePaths.expenseTracking,
    permission: `${financePermissions.accounts.expense}.View`,
    description:
      'Prepare expense categories and payment routing. Review available funds and supporting details; confirmed refund payouts appear through their source workflow.',
  },
  {
    title: 'Cash Management',
    path: financePaths.accounts.cashManagement,
    permission: `${financePermissions.accounts.cashManagement}.View`,
    description:
      'Review recorded cash, approval requirements and available balance. Use the existing deposit workflow to transfer eligible cash to a school bank account.',
  },
  {
    title: 'Reconciliation',
    path: financePaths.accounts.reconciliation,
    permission: `${financePermissions.accounts.reconciliation}.View`,
    description:
      'Have an authorized reviewer verify eligible pending payments against their instrument and bank evidence. Resolve discrepancies through the owning workflow.',
  },
  {
    title: 'Receipts',
    path: financePaths.fees.invoicesAndReceipts,
    permission: `${financePermissions.fees.invoicesAndReceipts}.View`,
    description:
      'Review and download the saved numbered receipt from its payment evidence. Preserve the original receipt when using an authorized correction workflow.',
  },
  {
    title: 'Reports',
    path: financePaths.reports,
    permission: financePermissions.reports,
    description:
      'Select the academic year, academic scope and dates. Review the report filters and statuses before previewing or exporting recorded Finance data.',
  },
  {
    title: 'Audit Trail',
    path: financePaths.auditTrail,
    permission: financePermissions.auditTrail,
    description:
      'Review who configured or changed records, the recorded reason and the related financial evidence. Audit access remains separately permission controlled.',
  },
] as const;
