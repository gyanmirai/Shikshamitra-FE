'use client';

import type { RootState } from 'src/redux/store';
import type { AdmissionWorkflow } from 'src/redux/student/admissions/admission-workflows-api';

import { useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { useBoolean } from 'src/hooks/use-boolean';
import { shikshaMitraToast } from 'src/components/toast';
import { studentPaths } from 'src/constants/student-menu';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { usePendingNavigation } from 'src/hooks/use-pending-navigation';
import {
  useLazyGetAdmissionWorkflowQuery,
  useCloneAdmissionWorkflowMutation,
  useCreateAdmissionWorkflowMutation,
  useDeleteAdmissionWorkflowMutation,
  useReopenAdmissionWorkflowMutation,
  useArchiveAdmissionWorkflowMutation,
  useCreateAdmissionWorkflowVersionMutation,
} from 'src/redux/student/admissions/admission-workflows-api';

import { getAdmissionWorkflowTemplate } from '../workflow-template';
import { useWorkflowListPublish } from './use-workflow-list-publish';
import { DUPLICATE_WORKFLOW_NAME_CODE } from '../workflow-name-error';
import { workflowArchiveErrorMessage } from './workflow-archive-error';
import { getAdmissionWorkflowAccess, isAdmissionWorkflowPublishable } from '../workflow-access';

import type { WorkflowDetails } from '../admission-workflow-dialog';

export type PendingWorkflowConfirmation = {
  workflow: AdmissionWorkflow;
  action: 'archive' | 'delete' | 'reopen' | 'createVersion' | 'publish';
} | null;

type ExistingDraftNotice = { workflowName: string; draftId: string } | null;

function getExistingWorkflowDraftId(error: unknown) {
  if (!error || typeof error !== 'object') return null;
  const payload = (error as { data?: unknown }).data;
  if (!payload || typeof payload !== 'object') return null;
  const body = payload as Record<string, unknown>;
  const errorInfo =
    body.error && typeof body.error === 'object' ? (body.error as Record<string, unknown>) : null;
  const businessData =
    errorInfo?.data && typeof errorInfo.data === 'object'
      ? (errorInfo.data as Record<string, unknown>)
      : body.data && typeof body.data === 'object'
        ? (body.data as Record<string, unknown>)
        : null;
  const draftId = businessData?.DraftId ?? businessData?.draftId;
  return typeof draftId === 'string' && draftId.trim() ? draftId : null;
}

export function useWorkflowListActions(returnTo?: string) {
  const router = useRouter();
  const withReturn = (href: string) =>
    returnTo ? href + (href.includes('?') ? '&' : '?') + new URLSearchParams({ returnTo }) : href;
  const navigation = usePendingNavigation(router.push);
  const createDialog = useBoolean();
  const createCloseRef = useRef<(() => void) | null>(null);
  const cloneDialog = useBoolean();
  const [cloneSource, setCloneSource] = useState<AdmissionWorkflow | null>(null);
  const [openingCreatedWorkflow, setOpeningCreatedWorkflow] = useState(false);
  const [pendingConfirmation, setPendingConfirmation] = useState<PendingWorkflowConfirmation>(null);
  const [confirmationNotice, setConfirmationNotice] = useState<string | null>(null);
  const [confirmationBusy, setConfirmationBusy] = useState(false);
  const [existingDraftNotice, setExistingDraftNotice] = useState<ExistingDraftNotice>(null);
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const workflowAccess = getAdmissionWorkflowAccess(permissions);
  const publication = useWorkflowListPublish(workflowAccess.canManage);
  const allowed = {
    canCreate: workflowAccess.canManage,
    canEdit: workflowAccess.canManage,
    canDelete: workflowAccess.canDelete,
    canCreateVersion: workflowAccess.canManage,
    canArchive: workflowAccess.canManage,
    canReopen: workflowAccess.canManage,
    canViewUsage: workflowAccess.canView,
    canPublish: workflowAccess.canManage,
  };
  const [createWorkflow, createState] = useCreateAdmissionWorkflowMutation();
  const [cloneWorkflow, cloneState] = useCloneAdmissionWorkflowMutation();
  const [createWorkflowVersion] = useCreateAdmissionWorkflowVersionMutation();
  const [creatingVersionId, setCreatingVersionId] = useState<string | null>(null);
  const [archiveWorkflow] = useArchiveAdmissionWorkflowMutation();
  const [reopenWorkflow] = useReopenAdmissionWorkflowMutation();
  const confirmingRef = useRef(false);
  const [deleteWorkflow] = useDeleteAdmissionWorkflowMutation();
  const [getLatestWorkflow] = useLazyGetAdmissionWorkflowQuery();
  const navigate = (workflow: AdmissionWorkflow, panel?: 'preview' | 'usage') =>
    navigation.navigate(
      workflow.id,
      withReturn(
        `${studentPaths.enrollment.settings.workflows}/${workflow.id}${panel ? `?panel=${panel}` : ''}`
      )
    );
  const create = async ({
    starterJourney,
    registrationFormDefinitionId,
    defaultInquiryFormDefinitionId,
    ...values
  }: WorkflowDetails) => {
    try {
      const journey =
        starterJourney && starterJourney !== 'empty'
          ? getAdmissionWorkflowTemplate(starterJourney, registrationFormDefinitionId ?? undefined)
          : { stages: [], transitions: [] };
      const result = await createWorkflow({
        ...values,
        ...journey,
        defaultInquiryFormDefinitionId: defaultInquiryFormDefinitionId || null,
      }).unwrap();
      shikshaMitraToast.success({ message: 'Workflow draft created' });
      setOpeningCreatedWorkflow(true);
      router.push(withReturn(`${studentPaths.enrollment.settings.workflows}/${result.id}?setup=1`));
    } catch (error) {
      setOpeningCreatedWorkflow(false);
      const problem = parseApiProblemDetail(error);
      if (problem.errorCode !== DUPLICATE_WORKFLOW_NAME_CODE) {
        shikshaMitraToast.error({
          message: problem.detail || 'Unable to create the workflow draft.',
        });
      }
      throw error;
    }
  };
  const clone = async (values: WorkflowDetails) => {
    if (!cloneSource) return undefined;
    try {
      const result = await cloneWorkflow({ id: cloneSource.id, body: values }).unwrap();
      shikshaMitraToast.success({ message: 'Workflow cloned' });
      return () => {
        if (result?.id) navigate(result);
      };
    } catch (error) {
      const problem = parseApiProblemDetail(error);
      if (problem.errorCode !== DUPLICATE_WORKFLOW_NAME_CODE) {
        shikshaMitraToast.error({
          message: problem.detail || 'Unable to complete the workflow action.',
        });
      }
      throw error;
    }
  };
  const openClone = (workflow: AdmissionWorkflow) => {
    setCloneSource(workflow);
    cloneDialog.onTrue();
  };
  const requestConfirmation = (
    workflow: AdmissionWorkflow,
    action: NonNullable<PendingWorkflowConfirmation>['action']
  ) => {
    if (confirmingRef.current) return;
    setConfirmationNotice(null);
    setPendingConfirmation({ workflow, action });
  };
  const clearConfirmation = () => {
    setConfirmationNotice(null);
    setPendingConfirmation(null);
  };
  const showLatestWorkflow = (
    workflow: AdmissionWorkflow,
    action: NonNullable<PendingWorkflowConfirmation>['action']
  ) => {
    setPendingConfirmation({ workflow, action });
    setConfirmationNotice(
      'This workflow changed after the list was loaded. The latest version is now loaded. Review and confirm the action again.'
    );
  };
  const confirm = async () => {
    if (!pendingConfirmation || confirmingRef.current) return;
    confirmingRef.current = true;
    setConfirmationBusy(true);
    setConfirmationNotice(null);
    const { workflow, action } = pendingConfirmation;
    try {
      if (action === 'publish') {
        const published = await publication.publish(workflow, (validated) =>
          setPendingConfirmation({ workflow: validated, action })
        );
        if (published) clearConfirmation();
        return;
      }
      if (action === 'createVersion') {
        if (!allowed.canCreateVersion || ![1, 2, 7].includes(workflow.status)) return;
        setExistingDraftNotice(null);
        setCreatingVersionId(workflow.id);
        const result = await createWorkflowVersion(workflow.id).unwrap();
        shikshaMitraToast.success({ message: 'New workflow version created' });
        clearConfirmation();
        navigate(result);
        return;
      }
      const latest = await getLatestWorkflow(workflow.id, false).unwrap();
      if (latest.concurrencyStamp !== workflow.concurrencyStamp) {
        showLatestWorkflow(latest, action);
        return;
      }

      if (action === 'delete') {
        await deleteWorkflow({
          id: latest.id,
          concurrencyStamp: latest.concurrencyStamp,
        }).unwrap();
      } else if (action === 'reopen') {
        await reopenWorkflow({ id: latest.id, concurrencyStamp: latest.concurrencyStamp }).unwrap();
      } else {
        await archiveWorkflow({
          id: latest.id,
          concurrencyStamp: latest.concurrencyStamp,
        }).unwrap();
      }
      shikshaMitraToast.success({
        message:
          action === 'delete'
            ? 'Workflow draft deleted'
            : action === 'reopen'
              ? 'Workflow reopened'
              : 'Workflow archived',
      });
      clearConfirmation();
    } catch (error) {
      const problem = parseApiProblemDetail(error);
      if (action === 'createVersion') {
        const draftId = getExistingWorkflowDraftId(error);
        if (problem.errorCode === 'Admissions.WorkflowDraftRequired' && draftId) {
          setExistingDraftNotice({ workflowName: workflow.name, draftId });
          clearConfirmation();
        } else {
          shikshaMitraToast.error({
            message: problem.detail || 'Unable to create the workflow draft.',
          });
        }
        return;
      }
      if (action === 'archive' && problem.errorCode === 'Admissions.WorkflowInUse') {
        setConfirmationNotice(workflowArchiveErrorMessage(error));
        return;
      }
      if (problem.errorCode === 'Admissions.WorkflowConcurrencyConflict') {
        try {
          const latest = await getLatestWorkflow(workflow.id, false).unwrap();
          showLatestWorkflow(latest, action);
          return;
        } catch (refreshError) {
          shikshaMitraToast.error({ message: parseApiProblemDetail(refreshError).detail });
          return;
        }
      }
      shikshaMitraToast.error({
        message: problem.detail || 'Unable to complete the workflow action.',
      });
    } finally {
      confirmingRef.current = false;
      setConfirmationBusy(false);
      if (action === 'createVersion') setCreatingVersionId(null);
    }
  };

  return {
    publishingId: publication.publishingId,
    allowed,
    createDialog,
    createCloseRef,
    cloneDialog,
    cloneSource,
    setCloneSource,
    pendingConfirmation,
    confirmationNotice,
    existingDraftNotice,
    dismissExistingDraftNotice: () => setExistingDraftNotice(null),
    openExistingDraft: () => {
      if (!existingDraftNotice) return;
      navigation.navigate(
        existingDraftNotice.draftId,
        withReturn(`${studentPaths.enrollment.settings.workflows}/${existingDraftNotice.draftId}`)
      );
      setExistingDraftNotice(null);
    },
    confirmationBusy,
    requestConfirmation,
    closeConfirmation: () => {
      if (!confirmingRef.current) clearConfirmation();
    },
    createState,
    openingCreatedWorkflow,
    cloneState,
    navigate,
    pendingNavigationId: navigation.pendingKey,
    create,
    clone,
    openClone,
    confirm,
    creatingVersionId,
    createVersion: (workflow: AdmissionWorkflow) => {
      if (allowed.canCreateVersion && [1, 2, 7].includes(workflow.status))
        requestConfirmation(workflow, 'createVersion');
    },
    publish: (workflow: AdmissionWorkflow) => {
      if (allowed.canPublish && isAdmissionWorkflowPublishable(workflow.status))
        requestConfirmation(workflow, 'publish');
    },
  };
}
