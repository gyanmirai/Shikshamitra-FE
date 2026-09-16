import type { RootState } from 'src/redux/store';
import type { AdmissionFormSectionVerification } from 'src/redux/student/admissions/admission-form-stage-api';

import { useState } from 'react';
import { useSelector } from 'react-redux';
import { shikshaMitraToast } from 'src/components/toast';
import { hasGrantedPermission } from 'src/utils/permissions';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import {
  useGetAdmissionFormStageQuery,
  useVerifyAdmissionFormSectionMutation,
  useRequestAdmissionFormCorrectionMutation,
} from 'src/redux/student/admissions/admission-form-stage-api';

export type FormStageAction =
  | { type: 'revoke'; section: AdmissionFormSectionVerification }
  | { type: 'correction' };

export function useApplicationFormStage({
  applicationId,
  stageId,
  advancing,
}: {
  applicationId: string;
  stageId: string;
  advancing: boolean;
}) {
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const query = useGetAdmissionFormStageQuery({ applicationId, stageId });
  const [verify, verifyState] = useVerifyAdmissionFormSectionMutation();
  const [correct, correctionState] = useRequestAdmissionFormCorrectionMutation();
  const [action, setAction] = useState<FormStageAction | null>(null);
  const summary = query.currentData;
  const busy = verifyState.isLoading || correctionState.isLoading || query.isFetching || advancing;

  const run = async (operation: () => Promise<unknown>, message: string) => {
    try {
      await operation();
      shikshaMitraToast.success({ message });
      setAction(null);
    } catch (error) {
      shikshaMitraToast.error({
        message: parseApiProblemDetail(error).detail || 'Unable to update the Form stage',
      });
    }
  };
  const verifySection = (section: AdmissionFormSectionVerification) =>
    summary
      ? run(
          () =>
            verify({
              applicationId,
              stageId,
              sectionId: section.sectionId,
              concurrencyStamp: summary.concurrencyStamp,
              verified: true,
            }).unwrap(),
          `${section.sectionName} verified`
        )
      : Promise.resolve();
  const submitReason = (reason: string) => {
    if (!summary || !action) return Promise.resolve();
    if (action.type === 'correction') {
      return run(
        () => correct({ applicationId, stageId, concurrencyStamp: summary.concurrencyStamp, reason }).unwrap(),
        'Application reopened for correction'
      );
    }
    return run(
      () =>
        verify({
          applicationId,
          stageId,
          sectionId: action.section.sectionId,
          concurrencyStamp: summary.concurrencyStamp,
          verified: false,
          reason,
        }).unwrap(),
      `${action.section.sectionName} reopened`
    );
  };

  return {
    action,
    setAction,
    summary,
    busy,
    query,
    verifySection,
    submitReason,
    canEdit: hasGrantedPermission(permissions, 'Students.Admissions.Applications.Add'),
    canReopen: hasGrantedPermission(permissions, 'Students.Admissions.Applications.Add'),
  };
}
