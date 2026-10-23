import type { RootState } from 'src/redux/store';

import { useState } from 'react';
import { useSelector } from 'react-redux';
import { shikshaMitraToast } from 'src/components/toast';
import { hasGrantedPermission } from 'src/utils/permissions';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import {
  useGetAdmissionFormStageQuery,
  useRequestAdmissionFormCorrectionMutation,
} from 'src/redux/student/admissions/admission-form-stage-api';

export type FormStageAction = { type: 'correction' };

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
  const [correct, correctionState] = useRequestAdmissionFormCorrectionMutation();
  const [action, setAction] = useState<FormStageAction | null>(null);
  const summary = query.currentData;
  const busy = correctionState.isLoading || query.isFetching || advancing;

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
  const submitReason = (reason: string) => {
    if (!summary || !action) return Promise.resolve();
    return run(
      () =>
        correct({
          applicationId,
          stageId,
          concurrencyStamp: summary.concurrencyStamp,
          reason,
        }).unwrap(),
      'Application reopened for correction'
    );
  };

  return {
    action,
    setAction,
    summary,
    busy,
    query,
    submitReason,
    canReopen: hasGrantedPermission(permissions, 'Students.Admissions.Applications.Add'),
  };
}
