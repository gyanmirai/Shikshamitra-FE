'use client';

import type { AdmissionWorkflow } from 'src/redux/student/admissions/admission-workflows-api';

import { shikshaMitraToast } from 'src/components/toast';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import {
  useUpdateAdmissionWorkflowMutation,
  usePublishAdmissionWorkflowMutation,
  useValidateAdmissionWorkflowMutation,
} from 'src/redux/student/admissions/admission-workflows-api';

import { normalizeAdmissionWorkflowFormStages } from '../../workflow-builder-utils';

import type { useWorkflowBuilderDraft } from './use-workflow-builder-draft';

type Draft = ReturnType<typeof useWorkflowBuilderDraft>;

export function useWorkflowBuilderCommands(
  workflowId: string,
  workflow: AdmissionWorkflow | undefined,
  draft: Draft
) {
  const [updateWorkflow, updateState] = useUpdateAdmissionWorkflowMutation();
  const [validateWorkflow, validateState] = useValidateAdmissionWorkflowMutation();
  const [publishWorkflow, publishState] = usePublishAdmissionWorkflowMutation();

  const showError = (error: unknown, fallback: string) => {
    shikshaMitraToast.error({ message: parseApiProblemDetail(error).detail || fallback });
  };
  const saveDraft = async () => {
    if (!workflow) return null;
    try {
      const stages = normalizeAdmissionWorkflowFormStages(draft.stages);
      const result = await updateWorkflow({
        id: workflow.id,
        body: {
          name: workflow.name,
          code: workflow.code,
          description: workflow.description,
          concurrencyStamp: draft.loadedStamp || workflow.concurrencyStamp,
          stages,
          transitions: draft.transitions,
        },
      }).unwrap();
      draft.setLoadedStamp(result.concurrencyStamp);
      draft.setStages(result.stages);
      draft.setTransitions(result.transitions);
      draft.setDirty(false);
      shikshaMitraToast.success({ message: 'Workflow draft saved' });
      return result;
    } catch (error) {
      showError(error, 'Unable to save the workflow draft.');
      return null;
    }
  };
  const validateSavedWorkflow = async () => {
    const normalizedStages = normalizeAdmissionWorkflowFormStages(draft.stages);
    const requiresFormStageUpgrade = normalizedStages.some(
      (stage, index) => stage !== draft.stages[index]
    );
    if ((draft.dirty || requiresFormStageUpgrade) && !(await saveDraft())) return null;
    try {
      const result = await validateWorkflow(workflowId).unwrap();
      draft.setValidation(result);
      draft.setSidePanel('validation');
      if (result.isValid) shikshaMitraToast.success({ message: 'Workflow is valid and ready to publish' });
      return result;
    } catch (error) {
      showError(error, 'Unable to validate the workflow.');
      return null;
    }
  };
  const publish = async () => {
    const result = await validateSavedWorkflow();
    if (!result?.isValid || !workflow) return;
    try {
      await publishWorkflow({
        id: workflow.id,
        concurrencyStamp: draft.loadedStamp || workflow.concurrencyStamp,
      }).unwrap();
      shikshaMitraToast.success({ message: 'Workflow published' });
      draft.setSidePanel(null);
    } catch (error) {
      showError(error, 'Unable to publish the workflow.');
    }
  };

  return { saveDraft, validateSavedWorkflow, publish, updateState, validateState, publishState };
}
