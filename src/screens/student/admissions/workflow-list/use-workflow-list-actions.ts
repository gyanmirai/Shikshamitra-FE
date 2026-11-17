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

import { getAdmissionWorkflowAccess } from '../workflow-access';
import { getAdmissionWorkflowTemplate } from '../workflow-template';
import { useWorkflowListPublish } from './use-workflow-list-publish';
import { workflowArchiveErrorMessage } from './workflow-archive-error';

import type { WorkflowDetails } from '../admission-workflow-dialog';

export type PendingWorkflowConfirmation = {
  workflow: AdmissionWorkflow;
  action: 'archive' | 'delete' | 'reopen';
} | null;

export function useWorkflowListActions(returnTo?: string) {
  const router = useRouter();
  const withReturn = (href: string) => returnTo ? href + (href.includes('?') ? '&' : '?') + new URLSearchParams({ returnTo }) : href;
  const navigation = usePendingNavigation(router.push);
  const createDialog = useBoolean();
  const createCloseRef = useRef<(() => void) | null>(null);
  const cloneDialog = useBoolean();
  const [cloneSource, setCloneSource] = useState<AdmissionWorkflow | null>(null);
  const [openingCreatedWorkflow, setOpeningCreatedWorkflow] = useState(false);
  const [pendingConfirmation, setPendingConfirmation] = useState<PendingWorkflowConfirmation>(null);
  const [confirmationNotice, setConfirmationNotice] = useState<string | null>(null);
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const workflowAccess = getAdmissionWorkflowAccess(permissions);
  const publication = useWorkflowListPublish(workflowAccess.canManage);
  const allowed = {
    canCreate: workflowAccess.canManage,
    canEdit: workflowAccess.canManage,
    canDelete: workflowAccess.canDelete,
    canClone: workflowAccess.canManage,
    canCreateVersion: workflowAccess.canManage,
    canArchive: workflowAccess.canManage,
    canReopen: workflowAccess.canManage,
    canViewUsage: workflowAccess.canView,
    canPublish: workflowAccess.canManage,
  };
  const [createWorkflow, createState] = useCreateAdmissionWorkflowMutation();
  const [cloneWorkflow, cloneState] = useCloneAdmissionWorkflowMutation();
  const [createVersion] = useCreateAdmissionWorkflowVersionMutation();
  const versionLock = useRef(false);
  const [creatingVersionId, setCreatingVersionId] = useState<string | null>(null);
  const [archiveWorkflow, archiveState] = useArchiveAdmissionWorkflowMutation();
  const [reopenWorkflow, reopenState] = useReopenAdmissionWorkflowMutation();
  const confirmingRef = useRef(false);
  const [deleteWorkflow, deleteState] = useDeleteAdmissionWorkflowMutation();
  const [getLatestWorkflow, latestWorkflowState] = useLazyGetAdmissionWorkflowQuery();
  const navigate = (workflow: AdmissionWorkflow, panel?: 'preview' | 'usage') =>
    navigation.navigate(
      workflow.id,
      withReturn(`${studentPaths.enrollment.settings.workflows}/${workflow.id}${panel ? `?panel=${panel}` : ''}`)
    );
  const runAction = async (
    action: () => Promise<AdmissionWorkflow | void>,
    message: string,
    goToResult = false
  ) => {
    try {
      const result = await action();
      shikshaMitraToast.success({ message });
      if (goToResult && result && 'id' in result) navigate(result);
    } catch (error) {
      shikshaMitraToast.error({
        message: parseApiProblemDetail(error).detail || 'Unable to complete the workflow action.',
      });
      throw error;
    }
  };
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
      shikshaMitraToast.error({
        message: parseApiProblemDetail(error).detail || 'Unable to create the workflow draft.',
      });
      throw error;
    }
  };
  const clone = async (values: WorkflowDetails) => {
    if (cloneSource)
      await runAction(
        () => cloneWorkflow({ id: cloneSource.id, body: values }).unwrap(),
        'Workflow cloned',
        true
      );
  };
  const openClone = (workflow: AdmissionWorkflow) => {
    setCloneSource(workflow);
    cloneDialog.onTrue();
  };
  const requestConfirmation = (
    workflow: AdmissionWorkflow,
    action: NonNullable<PendingWorkflowConfirmation>['action']
  ) => {
    setConfirmationNotice(null);
    setPendingConfirmation({ workflow, action });
  };
  const closeConfirmation = () => {
    setConfirmationNotice(null);
    setPendingConfirmation(null);
  };
  const showLatestWorkflow = (
    workflow: AdmissionWorkflow,
    action: 'archive' | 'delete' | 'reopen'
  ) => {
    setPendingConfirmation({ workflow, action });
    setConfirmationNotice(
      'This workflow changed after the list was loaded. The latest version is now loaded. Review and confirm the action again.'
    );
  };
  const confirm = async () => {
    if (!pendingConfirmation || confirmingRef.current) return;
    confirmingRef.current = true;
    setConfirmationNotice(null);
    const { workflow, action } = pendingConfirmation;
    try {
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
      closeConfirmation();
    } catch (error) {
      const problem = parseApiProblemDetail(error);
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
    }
  };

  return {
    ...publication,
    allowed,
    createDialog,
    createCloseRef,
    cloneDialog,
    cloneSource,
    setCloneSource,
    pendingConfirmation,
    confirmationNotice,
    confirmationRefreshing: latestWorkflowState.isFetching,
    requestConfirmation,
    closeConfirmation,
    createState,
    openingCreatedWorkflow,
    cloneState,
    archiveState,
    reopenState,
    deleteState,
    navigate,
    pendingNavigationId: navigation.pendingKey,
    create,
    clone,
    openClone,
    confirm,
    creatingVersionId,
    createVersion: async (workflow: AdmissionWorkflow) => {
      if (versionLock.current || !allowed.canCreateVersion) return;
      versionLock.current = true;
      setCreatingVersionId(workflow.id);
      try {
        await runAction(
          () => createVersion(workflow.id).unwrap(),
          'New workflow version created',
          true
        );
      } finally {
        versionLock.current = false;
        setCreatingVersionId(null);
      }
    },
  };
}
