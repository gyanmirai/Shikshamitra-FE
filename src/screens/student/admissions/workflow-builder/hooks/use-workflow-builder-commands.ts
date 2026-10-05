'use client';

import type { AdmissionWorkflow } from 'src/redux/student/admissions/admission-workflows-api';

import { useRef } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import {
  useUpdateAdmissionWorkflowMutation,
  usePublishAdmissionWorkflowMutation,
  useValidateAdmissionWorkflowMutation,
} from 'src/redux/student/admissions/admission-workflows-api';

import { normalizeAdmissionWorkflowFormStages } from '../../workflow-builder-utils';
import { getWorkflowDetailsJourney } from '../workflow-details-journey';

import type { useWorkflowBuilderDraft } from './use-workflow-builder-draft';
import type { WorkflowDetails } from '../../admission-workflow-dialog';

type Draft = ReturnType<typeof useWorkflowBuilderDraft>;

export function useWorkflowBuilderCommands(
  workflowId: string,
  workflow: AdmissionWorkflow | undefined,
  draft: Draft
) {
  const [updateWorkflow, updateState] = useUpdateAdmissionWorkflowMutation();
  const [validateWorkflow, validateState] = useValidateAdmissionWorkflowMutation();
  const [publishWorkflow, publishState] = usePublishAdmissionWorkflowMutation();
  const savedDetails = useRef<(WorkflowDetails & { workflowId: string }) | null>(null);
  const getCurrentDetails = (): WorkflowDetails | null => {
    if (!workflow) return null;
    return savedDetails.current?.workflowId === workflow.id ? savedDetails.current : workflow;
  };

  const showError = (error: unknown, fallback: string) => {
    shikshaMitraToast.error({ message: parseApiProblemDetail(error).detail || fallback });
  };
  const saveCurrentGraph = async (details?: WorkflowDetails) => {
    if (!workflow) throw new Error('Workflow is not loaded.');
    const currentDetails =
      details ??
      (savedDetails.current?.workflowId === workflow.id ? savedDetails.current : workflow);
    const journey = details
      ? getWorkflowDetailsJourney(details, draft.stages, draft.transitions)
      : { stages: draft.stages, transitions: draft.transitions };
    const result = await updateWorkflow({
      id: workflow.id,
      body: {
        name: currentDetails.name,
        code: currentDetails.code,
        description: currentDetails.description,
        defaultInquiryFormDefinitionId: draft.defaultInquiryFormDefinitionId,
        concurrencyStamp: draft.loadedStamp || workflow.concurrencyStamp,
        stages: normalizeAdmissionWorkflowFormStages(journey.stages),
        transitions: journey.transitions,
      },
    }).unwrap();
    savedDetails.current = {
      workflowId: workflow.id,
      name: result.name,
      code: result.code,
      description: result.description,
    };
    draft.setLoadedStamp(result.concurrencyStamp);
    draft.setStages(result.stages);
    draft.setTransitions(result.transitions);
    draft.setDefaultInquiryFormDefinitionId(result.defaultInquiryFormDefinitionId ?? null);
    draft.setValidation(null);
    draft.setDirty(false);
    return result;
  };
  const saveDraft = async () => {
    if (!workflow) return null;
    try {
      const result = await saveCurrentGraph();
      shikshaMitraToast.success({ message: 'Workflow draft saved' });
      return result;
    } catch (error) {
      showError(error, 'Unable to save the workflow draft.');
      return null;
    }
  };
  const saveDetails = async (details: WorkflowDetails) => {
    try {
      const result = await saveCurrentGraph(details);
      shikshaMitraToast.success({ message: 'Workflow details and journey saved' });
      return result;
    } catch (error) {
      showError(error, 'Unable to save the workflow details.');
      throw error;
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
      if (result.isValid)
        shikshaMitraToast.success({ message: 'Workflow is valid and ready to publish' });
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

  return {
    saveDraft,
    saveDetails,
    getCurrentDetails,
    validateSavedWorkflow,
    publish,
    updateState,
    validateState,
    publishState,
  };
}
