import type { LibraryPolicyOptions, LibraryPolicyVersion } from 'src/redux/library/policy-types';

import { Alert } from '@mui/material';
import { useUnsavedNavigation } from 'src/hooks/use-unsaved-navigation';

import { PolicyScope } from './PolicyScope';
import { PolicyTerms } from './PolicyTerms';
import { PolicyStatus } from './PolicyStatus';
import { PolicyIdentity } from './PolicyIdentity';
import { LibraryFormDrawer } from './LibraryFormDrawer';
import { PolicyPresetFields } from './PolicyPresetFields';
import { usePolicyDraftEditor } from './usePolicyDraftEditor';

export function PolicyDraftDrawer({
  item,
  academicYearId,
  options,
  onClose,
}: {
  item?: LibraryPolicyVersion;
  academicYearId: string;
  options: LibraryPolicyOptions;
  onClose: () => void;
}) {
  const { formik, error, editSnapshot } = usePolicyDraftEditor(academicYearId, onClose, item);
  const guard = useUnsavedNavigation(formik.dirty, {
    blockNavigation: formik.isSubmitting,
    guardContextChanges: true,
    onNavigationApproved: onClose,
  });
  const close = () => guard.requestNavigation(onClose);
  const globalBlocked =
    !options.canManageGlobalPolicies &&
    !formik.values.educationMediumStageId &&
    !formik.values.standardId;
  return (
    <>
      <LibraryFormDrawer
        title={
          editSnapshot?.status === 0
            ? 'Edit Borrowing Policy'
            : editSnapshot
              ? 'Create Next Policy Version'
              : 'Create Borrowing Policy'
        }
        status={<PolicyStatus status={0} />}
        help="Submit saves a draft only. Publishing is separate. Automatic policies require a configured Library calendar; manual policies use explicitly entered dates."
        busy={formik.isSubmitting}
        onClose={close}
        onSubmit={formik.submitForm}
        submitDisabled={globalBlocked || !formik.dirty}
      >
        {error && <Alert severity="error">{error}</Alert>}
        <Alert severity="info">
          This draft will not change borrowing, reservations, or existing loans.
        </Alert>
        {!editSnapshot && <PolicyPresetFields formik={formik} />}
        <PolicyIdentity
          formik={formik}
          canManageGlobalPolicies={options.canManageGlobalPolicies}
          roleLocked={Boolean(editSnapshot)}
        />
        <PolicyScope formik={formik} options={options} />
        <PolicyTerms formik={formik} />
      </LibraryFormDrawer>
      {guard.confirmation}
    </>
  );
}
