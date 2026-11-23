'use client';

import type { AdmissionWorkflow } from 'src/redux/student/admissions/admission-workflows-api';

import { useRef, useState } from 'react';
import { isEqual } from 'src/utils/helper';
import { shikshaMitraToast } from 'src/components/toast';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import {
  useLazyGetAdmissionWorkflowQuery,
  useUpdateAdmissionWorkflowMutation,
  usePublishAdmissionWorkflowMutation,
  useValidateAdmissionWorkflowMutation,
  useValidateAdmissionWorkflowPreviewMutation,
} from 'src/redux/student/admissions/admission-workflows-api';

import { getWorkflowFinalStageError } from '../workflow-final-stage';
import { getWorkflowDetailsJourney } from '../workflow-details-journey';
import { DUPLICATE_WORKFLOW_NAME_CODE } from '../../workflow-name-error';
import { normalizeAdmissionWorkflowStages } from '../../workflow-builder-utils';

import type { WorkflowDetails } from '../../admission-workflow-dialog';
import type { useWorkflowBuilderDraft } from './use-workflow-builder-draft';

type Draft = ReturnType<typeof useWorkflowBuilderDraft>;

export function useWorkflowBuilderCommands(
  workflowId: string,
  workflow: AdmissionWorkflow | undefined,
  draft: Draft
) {
  const [updateWorkflow, updateState] = useUpdateAdmissionWorkflowMutation();
  const [validateWorkflow, validateState] = useValidateAdmissionWorkflowMutation();
  const [validatePreview, validatePreviewState] = useValidateAdmissionWorkflowPreviewMutation();
  const [publishWorkflow, publishState] = usePublishAdmissionWorkflowMutation();
  const [loadWorkflow] = useLazyGetAdmissionWorkflowQuery();
  const publishingRef = useRef(false);
  const [publishing, setPublishing] = useState(false);
  const previewRequestRef = useRef<{ abort: () => void } | null>(null);
  const previewVersionRef = useRef(0);
  const currentDetails = useRef<(WorkflowDetails & { workflowId: string }) | null>(null);
  const getCurrentDetails = (): WorkflowDetails | null => {
    if (!workflow) return null;
    return currentDetails.current?.workflowId === workflow.id ? currentDetails.current : workflow;
  };

  const showError = (error: unknown, fallback: string) => {
    shikshaMitraToast.error({ message: parseApiProblemDetail(error).detail || fallback });
  };
  const saveCurrentGraph = async (
    details = getCurrentDetails(),
    journey = { stages: draft.stages, transitions: draft.transitions }
  ) => {
    if (!workflow || !details) throw new Error('Workflow is not loaded.');
    const finalStageError = getWorkflowFinalStageError(journey.stages, journey.transitions);
    if (finalStageError) throw new Error(finalStageError);
    const result = await updateWorkflow({
      id: workflow.id,
      body: {
        name: details.name,
        code: details.code,
        description: details.description,
        defaultInquiryFormDefinitionId: draft.defaultInquiryFormDefinitionId,
        concurrencyStamp: draft.loadedStamp || workflow.concurrencyStamp,
        stages: normalizeAdmissionWorkflowStages(journey.stages),
        transitions: journey.transitions,
      },
    }).unwrap();
    currentDetails.current = {
      workflowId: workflow.id,
      name: result.name,
      code: result.code,
      description: result.description,
    };
    draft.setLoadedStamp(result.concurrencyStamp);
    draft.setStages(result.stages);
    draft.setTransitions(result.transitions);
    draft.setDefaultInquiryFormDefinitionId(result.defaultInquiryFormDefinitionId ?? null);
    // Keep issues visible when saving the same graph. A changed graph needs a fresh preview.
    if (
      !isEqual(result.stages, draft.stages) ||
      !isEqual(result.transitions, draft.transitions) ||
      (result.defaultInquiryFormDefinitionId ?? null) !== draft.defaultInquiryFormDefinitionId
    ) {
      draft.setValidation(null);
    }
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
      if (!workflow) throw new Error('Workflow is not loaded.');
      const journey = getWorkflowDetailsJourney(details, draft.stages, draft.transitions);
      if (getWorkflowFinalStageError(journey.stages, journey.transitions)) {
        const previous = getCurrentDetails();
        currentDetails.current = {
          workflowId: workflow.id,
          name: details.name,
          code: details.code,
          description: details.description,
        };
        if (
          details.name !== previous?.name ||
          details.code !== previous?.code ||
          details.description !== previous?.description ||
          journey.stages !== draft.stages ||
          journey.transitions !== draft.transitions
        ) {
          draft.setStages(journey.stages);
          draft.setTransitions(journey.transitions);
          draft.markDirty();
        }
        return details;
      }
      const result = await saveCurrentGraph(details, journey);
      shikshaMitraToast.success({ message: 'Workflow details and journey saved' });
      return result;
    } catch (error) {
      if (parseApiProblemDetail(error).errorCode !== DUPLICATE_WORKFLOW_NAME_CODE) {
        showError(error, 'Unable to save the workflow details.');
      }
      throw error;
    }
  };
  const validateSavedWorkflow = async (notifySuccess = true) => {
    const normalizedStages = normalizeAdmissionWorkflowStages(draft.stages);
    const requiresFormStageUpgrade = normalizedStages.some(
      (stage, index) => stage !== draft.stages[index]
    );
    try {
      const finalStageError = getWorkflowFinalStageError(normalizedStages, draft.transitions);
      if (finalStageError) throw new Error(finalStageError);
      if (draft.dirty || requiresFormStageUpgrade) await saveCurrentGraph();
      const result = await validateWorkflow(workflowId).unwrap();
      draft.setValidation(result);
      if (result.issues.length > 0 && (!result.isValid || notifySuccess)) {
        shikshaMitraToast.warning({
          message: `${result.isValid ? 'Review workflow warnings:' : 'Fix before publishing:'}\n${result.issues.map((issue) => issue.message).join('\n')}`,
          alertProps: { sx: { '& .MuiAlert-message': { whiteSpace: 'pre-line' } } },
        });
      } else if (result.isValid && notifySuccess) {
        shikshaMitraToast.success({ message: 'Workflow is valid and ready to publish' });
      }
      return result;
    } catch (error) {
      showError(error, 'Unable to validate the workflow.');
      return null;
    }
  };
  const cancelDraftPreview = () => {
    previewVersionRef.current += 1;
    previewRequestRef.current?.abort();
    previewRequestRef.current = null;
  };
  const validateDraftPreview = async () => {
    cancelDraftPreview();
    const requestVersion = previewVersionRef.current;
    const request = validatePreview({
      id: workflowId,
      body: {
        defaultInquiryFormDefinitionId: draft.defaultInquiryFormDefinitionId,
        stages: normalizeAdmissionWorkflowStages(draft.stages),
        transitions: draft.transitions,
      },
    });
    previewRequestRef.current = request;
    try {
      const result = await request.unwrap();
      if (requestVersion !== previewVersionRef.current) return null;
      draft.setValidation(result);
      return result;
    } catch (error) {
      if (requestVersion === previewVersionRef.current) {
        showError(error, 'Unable to check the current workflow draft.');
      }
      return null;
    } finally {
      if (requestVersion === previewVersionRef.current) previewRequestRef.current = null;
    }
  };
  const publish = async () => {
    if (publishingRef.current || !workflow) return null;
    cancelDraftPreview();
    publishingRef.current = true;
    setPublishing(true);
    try {
      const result = await validateSavedWorkflow(false);
      if (!result?.isValid) {
        return null;
      }
      // Validation may update the server stamp. Publish only the freshly loaded version.
      const current = await loadWorkflow(workflowId, false).unwrap();
      draft.setLoadedStamp(current.concurrencyStamp);
      const published = await publishWorkflow({
        id: workflow.id,
        concurrencyStamp: current.concurrencyStamp,
      }).unwrap();
      if (result.issues.length > 0) {
        shikshaMitraToast.warning({
          message: `Workflow published with warnings:\n${result.issues.map((issue) => issue.message).join('\n')}`,
          alertProps: { sx: { '& .MuiAlert-message': { whiteSpace: 'pre-line' } } },
        });
      } else {
        shikshaMitraToast.success({ message: 'Workflow published' });
      }
      draft.setSidePanel(null);
      draft.setDirty(false);
      return published;
    } catch (error) {
      showError(error, 'Unable to publish the workflow.');
      return null;
    } finally {
      publishingRef.current = false;
      setPublishing(false);
    }
  };

  return {
    saveDraft,
    saveDetails,
    getCurrentDetails,
    validateSavedWorkflow,
    validateDraftPreview,
    cancelDraftPreview,
    validatePreviewState,
    publish,
    updateState,
    validateState,
    publishState: { ...publishState, isLoading: publishing || publishState.isLoading },
  };
}
