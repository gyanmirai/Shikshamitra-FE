import type {
  RecordsOutcome,
  RecordsFieldGroup,
  RecordsChangeAction,
} from 'src/redux/student/records/student-records-types';

import * as Yup from 'yup';

export const recordActions: RecordsChangeAction[] = [
  'Identity',
  'Contact',
  'Guardian',
  'Medical',
  'Bank',
  'Additional',
  'PreviousSchool',
  'Placement',
  'Status',
  'Correction',
  'LegacyOverride',
  'Photo',
];
export const recordOutcomes: RecordsOutcome[] = [
  'Promote',
  'Repeat',
  'Hold',
  'Graduate',
  'Withdraw',
  'Transfer',
  'Return',
];
export const sensitiveGroups: RecordsFieldGroup[] = [
  'Identity',
  'Contact',
  'Medical',
  'Bank',
  'Guardian',
];
export const actionLabels: Record<RecordsChangeAction, string> = {
  Identity: 'Name and identity',
  Contact: 'Contact details',
  Guardian: 'Family and guardians',
  Medical: 'Medical details',
  Bank: 'Bank details',
  Additional: 'Additional details',
  PreviousSchool: 'Previous school',
  Placement: 'Class and division',
  Status: 'Student status',
  Correction: 'Correct a previous operation',
  LegacyOverride: 'Historical directory entry',
  Photo: 'Student photo',
};

const roles = Yup.array()
  .of(Yup.string().trim().required('Choose a valid Security role.'))
  .min(1, 'Choose at least one approver role.')
  .max(50)
  .test(
    'distinct',
    'Choose each role once.',
    (values) => new Set(values?.map((value) => value?.toLowerCase())).size === values?.length
  );
const changeRule = Yup.object({
  mode: Yup.string().oneOf(['Direct', 'Approval']).required(),
  requireReason: Yup.boolean().required(),
  stages: Yup.array()
    .of(Yup.object({ roleNames: roles }))
    .max(3, 'Use up to three approval stages.')
    .when('mode', {
      is: 'Approval',
      then: (value) => value.min(1, 'Add at least one approval stage.'),
    }),
  condition: Yup.object({
    isPastDated: Yup.boolean().nullable(),
    isFutureDated: Yup.boolean().nullable(),
    isFormerStudent: Yup.boolean().nullable(),
  })
    .nullable()
    .default(null),
});
const prefix = Yup.string()
  .required('Enter a number prefix.')
  .max(30)
  .matches(/^[a-zA-Z0-9_-]+$/, 'Use letters, digits, hyphens, or underscores.');
const outcomeChecks = Yup.object({
  requireAcademicResult: Yup.boolean().required(),
  requireFinanceClearance: Yup.boolean().required(),
  requireLibraryClearance: Yup.boolean().required(),
  requireTransportClearance: Yup.boolean().required(),
});
export const recordsPolicySchema = Yup.object({
  schemaVersion: Yup.number().oneOf([1]).required(),
  changes: Yup.object(Object.fromEntries(recordActions.map((action) => [action, changeRule]))),
  documents: Yup.object({
    enabledCertificateTypes: Yup.array().of(
      Yup.string().oneOf(['Bonafide', 'Character', 'Leaving', 'FirstTrial'])
    ),
    certificateNumberPrefix: prefix,
    idNumberPrefix: prefix,
    leavingCertificateStage: Yup.string().oneOf(['ApprovedExit', 'EffectiveExit']).required(),
  }),
  provisioning: Yup.object({
    mode: Yup.string().oneOf(['OnboardingOnly', 'Summary', 'Full']).required(),
    allowPlacementEdits: Yup.boolean().required(),
  }),
  access: Yup.object({
    masks: Yup.array().of(
      Yup.object({
        fieldGroup: Yup.string().oneOf(sensitiveGroups).required(),
        allowedRoleNames: Yup.array().of(Yup.string().trim().required()).max(50),
      })
    ),
  }),
  guardianAccess: Yup.object({
    onApprovedChange: Yup.string().oneOf(['SuspendUntilReview', 'KeepUntilReview']).required(),
  }),
  transitions: Yup.object({
    outcomeChecks: Yup.object(
      Object.fromEntries(recordOutcomes.map((outcome) => [outcome, outcomeChecks]))
    ),
    allowPastDates: Yup.boolean().required(),
    allowFutureDates: Yup.boolean().required(),
    maxPastDays: Yup.number().integer().min(0).max(3650).required(),
    maxFutureDays: Yup.number().integer().min(0).max(3650).required(),
    rosterRemovalTiming: Yup.string().oneOf(['Approval', 'EffectiveDate']).required(),
    allowedReturnRoutes: Yup.array()
      .of(Yup.string().oneOf(['ReuseProfile', 'FreshApplication', 'ResumeStage']))
      .min(1, 'Allow at least one return route.')
      .required(),
    defaultReturnRoute: Yup.string()
      .required()
      .test('allowed-default', 'Choose an allowed return route.', function allowed(value) {
        return this.parent.allowedReturnRoutes?.includes(value);
      }),
    annualRenewalMode: Yup.string().oneOf(['DirectEnrollment', 'ShortChecklist']).required(),
    batchExceptionMode: Yup.string().oneOf(['ReadyOnly', 'HoldAll']).required(),
  }),
});

export const settingsTasks = [
  {
    key: 'changes',
    title: 'Change Rules & Approvals',
    description: 'Choose direct edits, review stages, and required reasons.',
    icon: 'mdi:account-edit-outline',
  },
  {
    key: 'documents',
    title: 'Documents & IDs',
    description: 'Choose certificate types, numbering, and leaving-certificate rules.',
    icon: 'mdi:card-account-details-outline',
  },
  {
    key: 'transitions',
    title: 'Year-End & Transitions',
    description: 'Set promotion, exit, renewal, and return rules.',
    icon: 'mdi:school-outline',
  },
  {
    key: 'access',
    title: 'Access & Visibility',
    description: 'Set provisioning access and protect sensitive fields.',
    icon: 'mdi:shield-account-outline',
  },
] as const;
export type RecordsSettingsTask = (typeof settingsTasks)[number]['key'];
