'use client';

import type { RootState } from 'src/redux/store';
import type {
  AdmissionWorkflow,
  CreateUpdateAdmissionWorkflow,
} from 'src/redux/student/admissions/admission-workflows-api';

import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { useBoolean } from 'src/hooks/use-boolean';
import { shikshaMitraToast } from 'src/components/toast';
import { hasGrantedPermission } from 'src/utils/permissions';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import {
  useCloneAdmissionWorkflowMutation,
  useCreateAdmissionWorkflowMutation,
  useDeleteAdmissionWorkflowMutation,
  useArchiveAdmissionWorkflowMutation,
  useCreateAdmissionWorkflowVersionMutation,
} from 'src/redux/student/admissions/admission-workflows-api';

export type WorkflowDetails = Pick<CreateUpdateAdmissionWorkflow, 'name' | 'code' | 'description'>;
export type PendingWorkflowConfirmation = { workflow: AdmissionWorkflow; action: 'archive' | 'delete' } | null;

export function useWorkflowListActions() {
  const router = useRouter();
  const createDialog = useBoolean();
  const cloneDialog = useBoolean();
  const [cloneSource, setCloneSource] = useState<AdmissionWorkflow | null>(null);
  const [pendingConfirmation, setPendingConfirmation] = useState<PendingWorkflowConfirmation>(null);
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const allowed = {
    canCreate: hasGrantedPermission(permissions, 'Students.Admissions.Workflows.Add'),
    canEdit: hasGrantedPermission(permissions, 'Students.Admissions.Workflows.Add'),
    canDelete: hasGrantedPermission(permissions, 'Students.Admissions.Workflows.Delete'),
    canClone: hasGrantedPermission(permissions, 'Students.Admissions.Workflows.Add'),
    canCreateVersion: hasGrantedPermission(permissions, 'Students.Admissions.Workflows.Add'),
    canArchive: hasGrantedPermission(permissions, 'Students.Admissions.Workflows.Delete'),
    canViewUsage: hasGrantedPermission(permissions, 'Students.Admissions.Workflows.View'),
  };
  const [createWorkflow, createState] = useCreateAdmissionWorkflowMutation();
  const [cloneWorkflow, cloneState] = useCloneAdmissionWorkflowMutation();
  const [createVersion] = useCreateAdmissionWorkflowVersionMutation();
  const [archiveWorkflow, archiveState] = useArchiveAdmissionWorkflowMutation();
  const [deleteWorkflow, deleteState] = useDeleteAdmissionWorkflowMutation();
  const navigate = (workflow: AdmissionWorkflow, usage = false) =>
    router.push(`/student/admissions/settings/workflows/${workflow.id}${usage ? '?panel=usage' : ''}`);
  const runAction = async (action: () => Promise<AdmissionWorkflow | void>, message: string, goToResult = false) => {
    try {
      const result = await action();
      shikshaMitraToast.success({ message });
      if (goToResult && result && 'id' in result) navigate(result);
    } catch (error) {
      shikshaMitraToast.error({ message: parseApiProblemDetail(error).detail || 'Unable to complete the workflow action.' });
      throw error;
    }
  };
  const create = (values: WorkflowDetails) => runAction(() => createWorkflow({ ...values, stages: [], transitions: [] }).unwrap(), 'Workflow draft created', true);
  const clone = async (values: WorkflowDetails) => {
    if (cloneSource) await runAction(() => cloneWorkflow({ id: cloneSource.id, body: values }).unwrap(), 'Workflow cloned', true);
  };
  const openClone = (workflow: AdmissionWorkflow) => { setCloneSource(workflow); cloneDialog.onTrue(); };
  const confirm = async () => {
    if (!pendingConfirmation) return;
    const { workflow, action } = pendingConfirmation;
    await runAction(
      () => action === 'delete' ? deleteWorkflow({ id: workflow.id, concurrencyStamp: workflow.concurrencyStamp }).unwrap() : archiveWorkflow({ id: workflow.id, concurrencyStamp: workflow.concurrencyStamp }).unwrap(),
      action === 'delete' ? 'Workflow draft deleted' : 'Workflow archived'
    );
    setPendingConfirmation(null);
  };

  return {
    allowed, createDialog, cloneDialog, cloneSource, setCloneSource, pendingConfirmation,
    setPendingConfirmation, createState, cloneState, archiveState, deleteState, navigate,
    create, clone, openClone, confirm,
    createVersion: (workflow: AdmissionWorkflow) => runAction(() => createVersion(workflow.id).unwrap(), 'New workflow version created', true),
  };
}
