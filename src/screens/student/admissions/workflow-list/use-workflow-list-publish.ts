import type { AppDispatch } from 'src/redux/store';
import type { AdmissionWorkflow } from 'src/redux/student/admissions/admission-workflows-api';

import { useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { api } from 'src/redux/service';
import { shikshaMitraToast } from 'src/components/toast';
import { studentAdmissionsCrmType } from 'src/redux/tagTypes';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import {
  useLazyGetAdmissionWorkflowQuery,
  useUpdateAdmissionWorkflowMutation,
  usePublishAdmissionWorkflowMutation,
  useValidateAdmissionWorkflowMutation,
} from 'src/redux/student/admissions/admission-workflows-api';

import { isAdmissionWorkflowPublishable } from '../workflow-access';
import { normalizeAdmissionWorkflowStages } from '../workflow-builder-utils';

/** Publishes saved journeys through the builder's normalization, validation and fresh-stamp sequence. */
export function useWorkflowListPublish(canPublish: boolean) {
  const dispatch = useDispatch<AppDispatch>();
  const active = useRef(false);
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [loadWorkflow] = useLazyGetAdmissionWorkflowQuery();
  const [updateWorkflow] = useUpdateAdmissionWorkflowMutation();
  const [validateWorkflow] = useValidateAdmissionWorkflowMutation();
  const [publishWorkflow] = usePublishAdmissionWorkflowMutation();

  const publish = async (row: AdmissionWorkflow) => {
    if (!canPublish || active.current || !isAdmissionWorkflowPublishable(row.status)) return;
    active.current = true;
    setPublishingId(row.id);
    const loadLatest = async () => {
      const request = loadWorkflow(row.id, false);
      try {
        return await request.unwrap();
      } finally {
        request.unsubscribe();
      }
    };
    try {
      const latest = await loadLatest();
      if (
        latest.concurrencyStamp !== row.concurrencyStamp ||
        !isAdmissionWorkflowPublishable(latest.status)
      ) {
        dispatch(
          api.util.invalidateTags([
            { type: studentAdmissionsCrmType.admissionWorkflow, id: 'LIST' },
          ])
        );
        shikshaMitraToast.warning({
          message:
            'This workflow changed after the list was loaded. Review the latest version before publishing.',
        });
        return;
      }
      // Only editable drafts may receive the builder's compatibility upgrade.
      // Approved and scheduled graphs remain immutable through validation/publication.
      const stages = [0, 3].includes(latest.status)
        ? normalizeAdmissionWorkflowStages(latest.stages)
        : latest.stages;
      if (stages.some((stage, index) => stage !== latest.stages[index])) {
        await updateWorkflow({
          id: latest.id,
          body: {
            name: latest.name,
            code: latest.code,
            description: latest.description,
            defaultInquiryFormDefinitionId: latest.defaultInquiryFormDefinitionId,
            concurrencyStamp: latest.concurrencyStamp,
            stages,
            transitions: latest.transitions,
          },
        }).unwrap();
      }
      const validation = await validateWorkflow(row.id).unwrap();
      if (!validation.isValid) {
        shikshaMitraToast.warning({
          message: `Fix before publishing:\n${validation.issues.map((issue) => issue.message).join('\n')}`,
          alertProps: { sx: { '& .MuiAlert-message': { whiteSpace: 'pre-line' } } },
        });
        return;
      }
      // Validation updates the stamp. The server still enforces status and concurrent writes.
      const current = await loadLatest();
      if (!isAdmissionWorkflowPublishable(current.status)) {
        dispatch(
          api.util.invalidateTags([
            { type: studentAdmissionsCrmType.admissionWorkflow, id: 'LIST' },
          ])
        );
        shikshaMitraToast.warning({
          message: 'This workflow is no longer available to publish. Review the latest version.',
        });
        return;
      }
      await publishWorkflow({
        id: current.id,
        concurrencyStamp: current.concurrencyStamp,
      }).unwrap();
      if (validation.issues.length) {
        shikshaMitraToast.warning({
          message: `Workflow published with warnings:\n${validation.issues.map((issue) => issue.message).join('\n')}`,
          alertProps: { sx: { '& .MuiAlert-message': { whiteSpace: 'pre-line' } } },
        });
      } else {
        shikshaMitraToast.success({ message: 'Workflow published' });
      }
    } catch (error) {
      shikshaMitraToast.error({
        message: parseApiProblemDetail(error).detail || 'Unable to publish the workflow.',
      });
    } finally {
      active.current = false;
      setPublishingId(null);
    }
  };

  return { publish, publishingId };
}
