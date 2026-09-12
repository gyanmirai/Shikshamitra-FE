export type GrantedPermission = {
  name: string;
  isGranted: boolean;
};

export type PermissionName = string | string[];

const FEE_ADJUSTMENT_PERMISSION = 'Finance.Fees.Adjustment';
const FEE_ADJUSTMENT_LEGACY_PREFIX = 'Finance.Adjustment';
const ADMISSIONS_PERMISSION_PREFIX = 'Students.Admissions';
const STUDENT_ONBOARDING_PERMISSION_PREFIX = 'Students.Enrollment.AdmissionsCrm';
const STUDENT_VIEW_ACTIONS = new Set(['View', 'ViewUsage', 'Download']);
const STUDENT_ADD_ACTIONS = new Set([
  'Add',
  'Activate',
  'Advance',
  'AllocateIdentifier',
  'AllocateSeat',
  'Assign',
  'Book',
  'BulkCreate',
  'Clone',
  'Configure',
  'Confirm',
  'Create',
  'CreateVersion',
  'Decide',
  'Edit',
  'Enroll',
  'Evaluate',
  'Extend',
  'Finalize',
  'Issue',
  'Manage',
  'ManageCapacity',
  'ManageSessions',
  'Offer',
  'OverrideCapacity',
  'OverrideWorkflow',
  'Publish',
  'Record',
  'RecordAttendance',
  'RecordResults',
  'Reissue',
  'Renew',
  'Repair',
  'RequestException',
  'Respond',
  'Review',
  'ReviewException',
  'Reopen',
  'Start',
  'Submit',
  'Upload',
  'Validate',
  'Verify',
  'Waitlist',
  'Waive',
]);
const STUDENT_DELETE_ACTIONS = new Set([
  'Delete',
  'Archive',
  'Cancel',
  'Close',
  'Deactivate',
  'Release',
  'Reverse',
  'Withdraw',
]);

const normalizeStudentPermission = (permissionName: string) => {
  if (!permissionName.startsWith(`${ADMISSIONS_PERMISSION_PREFIX}.`)) {
    return permissionName;
  }

  const separatorIndex = permissionName.lastIndexOf('.');
  const permissionBase = permissionName.startsWith('Students.Admissions.Applicants.Notes.')
    ? 'Students.Admissions.Applicants'
    : permissionName.slice(0, separatorIndex);
  const action = permissionName.slice(separatorIndex + 1);
  if (STUDENT_VIEW_ACTIONS.has(action)) return `${permissionBase}.View`;
  if (STUDENT_DELETE_ACTIONS.has(action)) return `${permissionBase}.Delete`;
  if (STUDENT_ADD_ACTIONS.has(action)) return `${permissionBase}.Add`;
  return permissionName;
};

// TODO(student): Remove this development-only bypass after Admissions and Onboarding permissions
// are assigned to local development roles.
const isDevelopmentStudentPermission = (permissionName: string) =>
  process.env.NODE_ENV === 'development' &&
  (permissionName === ADMISSIONS_PERMISSION_PREFIX ||
    permissionName.startsWith(`${ADMISSIONS_PERMISSION_PREFIX}.`) ||
    permissionName === STUDENT_ONBOARDING_PERMISSION_PREFIX ||
    permissionName.startsWith(`${STUDENT_ONBOARDING_PERMISSION_PREFIX}.`));

export const hasGrantedPermission = (
  permissions: GrantedPermission[] | undefined,
  permissionName?: PermissionName
): boolean => {
  if (!permissionName) return false;
  if (Array.isArray(permissionName)) {
    return permissionName.some((name) => hasGrantedPermission(permissions, name));
  }

  if (isDevelopmentStudentPermission(permissionName)) {
    return true;
  }

  if (!permissions?.length) return false;

  const matches = (name: string) =>
    permissions.some(
      (permission) =>
        permission.isGranted && (permission.name === name || permission.name === `${name}.View`)
    );

  if (matches(normalizeStudentPermission(permissionName))) {
    return true;
  }

  // Roles seeded before the Fees.Adjustment namespace fix may still hold Finance.Adjustment.* grants.
  if (
    permissionName === FEE_ADJUSTMENT_PERMISSION ||
    permissionName.startsWith(`${FEE_ADJUSTMENT_PERMISSION}.`)
  ) {
    return permissions.some(
      (permission) =>
        permission.isGranted &&
        (permission.name === FEE_ADJUSTMENT_LEGACY_PREFIX ||
          permission.name.startsWith(`${FEE_ADJUSTMENT_LEGACY_PREFIX}.`))
    );
  }

  return false;
};
