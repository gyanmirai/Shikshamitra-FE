'use client';

import type { RootState } from 'src/redux/store';

import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useRouter, useSearchParams } from 'next/navigation';
import { Box } from '@mui/material';
import { useBoolean } from 'src/hooks/use-boolean';
import { studentPaths } from 'src/constants/student-menu';
import { shikshaMitraToast } from 'src/components/toast';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { useGetAdmissionFormsQuery } from 'src/redux/student/admissions/admission-forms-api';
import {
  useGetAdmissionWorkflowQuery,
  useGetAdmissionWorkflowUsageQuery,
  useGetAdmissionWorkflowVersionsQuery,
  useGetAdmissionWorkflowStageTypesQuery,
  useApproveAdmissionWorkflowMutation,
  useRejectAdmissionWorkflowMutation,
  useGetAdmissionWorkflowApproversQuery,
  useSubmitAdmissionWorkflowForApprovalMutation,
  useGetAdmissionWorkflowGovernanceHistoryQuery,
  useGetAdmissionWorkflowGovernanceSettingsQuery,
  useCreateAdmissionWorkflowRollbackDraftMutation,
  usePublishAdmissionWorkflowWithGovernanceMutation,
} from 'src/redux/student/admissions/admission-workflows-api';

import type { WorkflowGovernanceActionMode } from './workflow-builder/components/workflow-governance-action-dialog';

import { duplicateStage } from './workflow-builder-utils';
import { getAdmissionWorkflowAccess } from './workflow-access';
import { getWorkflowTemplateDefinition } from './workflow-template';
import { WorkflowSidePanel } from './workflow-builder/components/workflow-side-panel';
import { compareWorkflowVersions } from './workflow-builder/workflow-version-comparison';
import { canDecideAdmissionWorkflow } from './workflow-builder/workflow-governance-permissions';
import { useWorkflowBuilderDraft } from './workflow-builder/hooks/use-workflow-builder-draft';
import { WorkflowBuilderCanvas } from './workflow-builder/components/workflow-builder-canvas';
import { WorkflowBuilderHeader } from './workflow-builder/components/workflow-builder-header';
import { WorkflowBuilderEditors } from './workflow-builder/components/workflow-builder-editors';
import { useWorkflowBuilderCommands } from './workflow-builder/hooks/use-workflow-builder-commands';
import { WorkflowBuilderPageState } from './workflow-builder/components/workflow-builder-page-state';
import { WorkflowStandardTemplateDialog } from './workflow-builder/components/workflow-standard-template-dialog';
import { WorkflowGovernanceActionDialog } from './workflow-builder/components/workflow-governance-action-dialog';

type Props = { workflowId: string };

export default function AdmissionWorkflowBuilder({ workflowId }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const builderView = searchParams.get('view') === 'map' ? 'map' : 'configure';
  const requestedTemplate = getWorkflowTemplateDefinition(searchParams.get('setup'));
  const standardTemplateDialog = useBoolean(Boolean(requestedTemplate));
  const [governanceAction, setGovernanceAction] = useState<WorkflowGovernanceActionMode | null>(
    null
  );
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const currentUserId = useSelector(
    (state: RootState) => state.auth.user?.sub as string | undefined
  );
  const workflowAccess = getAdmissionWorkflowAccess(permissions);
  const canEdit = workflowAccess.canManage;
  const canValidate = workflowAccess.canManage;
  const canPublish = workflowAccess.canManage;
  const canCreateVersion = workflowAccess.canManage;
  const canViewUsage = workflowAccess.canView;
  const hasApprovePermission = workflowAccess.canApprove;
  const hasRollbackPermission = workflowAccess.canRollback;
  const workflowQuery = useGetAdmissionWorkflowQuery(workflowId);
  const stageTypesQuery = useGetAdmissionWorkflowStageTypesQuery();
  const publishedFormsQuery = useGetAdmissionFormsQuery({ status: 1, maxResultCount: 100 });
  const templateFormsQuery = useGetAdmissionFormsQuery(
    { maxResultCount: 100 },
    { skip: !standardTemplateDialog.value }
  );
  const usageQuery = useGetAdmissionWorkflowUsageQuery(workflowId, { skip: !canViewUsage });
  const versionsQuery = useGetAdmissionWorkflowVersionsQuery(workflowId);
  const governanceSettingsQuery = useGetAdmissionWorkflowGovernanceSettingsQuery();
  const approversQuery = useGetAdmissionWorkflowApproversQuery(undefined, {
    skip: governanceAction !== 'submit',
  });
  const workflow = workflowQuery.data;
  const draft = useWorkflowBuilderDraft(
    workflow,
    searchParams.get('panel') === 'usage' ? 'usage' : null
  );
  const commands = useWorkflowBuilderCommands(workflowId, workflow, draft);
  const governanceHistoryQuery = useGetAdmissionWorkflowGovernanceHistoryQuery(workflowId, {
    skip: draft.sidePanel !== 'governance',
  });
  const [submitForApproval, submitState] = useSubmitAdmissionWorkflowForApprovalMutation();
  const [approveWorkflow, approveState] = useApproveAdmissionWorkflowMutation();
  const [rejectWorkflow, rejectState] = useRejectAdmissionWorkflowMutation();
  const [publishWorkflow, governancePublishState] =
    usePublishAdmissionWorkflowWithGovernanceMutation();
  const [createRollbackDraft, rollbackState] = useCreateAdmissionWorkflowRollbackDraftMutation();
  const statusReadOnly = Boolean(workflow && ![0, 3].includes(workflow.status));
  const readOnly = !canEdit || !workflow || statusReadOnly;

  if (workflowQuery.isLoading) {
    return <WorkflowBuilderPageState state="loading" />;
  }
  if (workflowQuery.isError || !workflow) {
    return <WorkflowBuilderPageState state="error" onRetry={() => workflowQuery.refetch()} />;
  }
  const makerCheckerEnabled = governanceSettingsQuery.data?.makerCheckerEnabled ?? false;
  const governanceReady =
    !governanceSettingsQuery.isLoading && Boolean(governanceSettingsQuery.data);
  const canSubmit =
    governanceReady &&
    canEdit &&
    makerCheckerEnabled &&
    (workflow.status === 0 || workflow.status === 3);
  const canApprove = canDecideAdmissionWorkflow(workflow, currentUserId, hasApprovePermission);
  const canPublishCurrent =
    governanceReady &&
    canPublish &&
    ((makerCheckerEnabled && workflow.status === 5) ||
      (!makerCheckerEnabled && [0, 3, 5].includes(workflow.status)));
  const canRollback = hasRollbackPermission && [1, 2, 7].includes(workflow.status);
  const governanceBusy =
    submitState.isLoading ||
    approveState.isLoading ||
    rejectState.isLoading ||
    governancePublishState.isLoading ||
    rollbackState.isLoading;
  const previousPublished = versionsQuery.data
    ?.filter((version) => version.id !== workflow.id && [1, 7].includes(version.status))
    .sort((left, right) => right.version - left.version)[0];
  const publishComparison = previousPublished?.stages.length
    ? compareWorkflowVersions(previousPublished, {
        ...workflow,
        stages: draft.stages,
        transitions: draft.transitions,
      })
    : null;
  const getViewHref = (view: 'configure' | 'map') => {
    const next = new URLSearchParams(searchParams.toString());
    if (view === 'map') next.set('view', 'map');
    else next.delete('view');
    const query = next.toString();
    return `${studentPaths.enrollment.settings.workflows}/${workflowId}${query ? `?${query}` : ''}`;
  };

  return (
    <Box sx={{ height: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      <WorkflowBuilderHeader
        workflow={workflow}
        dirty={draft.dirty}
        readOnly={readOnly}
        readOnlyReason={statusReadOnly ? 'status' : !canEdit ? 'permission' : undefined}
        canValidate={canValidate && [0, 3].includes(workflow.status)}
        canPublish={canPublishCurrent}
        canSubmit={canSubmit}
        canApprove={canApprove}
        canReject={canApprove}
        canRollback={canRollback}
        canViewUsage={canViewUsage}
        saving={commands.updateState.isLoading}
        validating={commands.validateState.isLoading}
        publishing={commands.publishState.isLoading || governanceBusy}
        onSave={commands.saveDraft}
        onValidate={commands.validateSavedWorkflow}
        onPublish={() => setGovernanceAction('publish')}
        onSubmit={() => setGovernanceAction('submit')}
        onApprove={() => setGovernanceAction('approve')}
        onReject={() => setGovernanceAction('reject')}
        onRollback={() => setGovernanceAction('rollback')}
        onOpenPanel={draft.setSidePanel}
        onApplyTemplate={standardTemplateDialog.onTrue}
        canUndo={draft.canUndo}
        canRedo={draft.canRedo}
        onUndo={draft.undo}
        onRedo={draft.redo}
      />
      <WorkflowBuilderCanvas
        view={builderView}
        stages={draft.stages}
        transitions={draft.transitions}
        readOnly={readOnly}
        loadingStageTypes={stageTypesQuery.isLoading}
        issueCountByStage={draft.issueCountByStage}
        onAddStage={() => draft.addStage(stageTypesQuery.data ?? [])}
        onEditStage={(stage) => {
          draft.setEditingStage(stage);
          draft.setStageDrawerOpen(true);
        }}
        onDuplicateStage={(stage) => {
          draft.recordHistory();
          draft.setStages((current) => duplicateStage(current, stage.id));
          draft.markDirty();
        }}
        onDeleteStage={draft.setStageToDelete}
        onDragEnd={draft.handleDragEnd}
        onAddTransition={(stage) => {
          const outgoing = draft.transitions.filter((item) => item.fromStageId === stage.id);
          const destination =
            draft.stages.find(
              (item) => item.id !== stage.id && item.displayOrder > stage.displayOrder
            ) ?? draft.stages.find((item) => item.id !== stage.id);
          if (!destination) return;
          draft.setEditingTransition({
            id: '',
            fromStageId: stage.id,
            toStageId: destination.id,
            priority: Math.max(-1, ...outgoing.map((item) => item.priority)) + 1,
            isDefault: !outgoing.some((item) => item.isDefault),
          });
          draft.setTransitionDrawerOpen(true);
        }}
        onEditTransition={(transition) => {
          draft.setEditingTransition(transition);
          draft.setTransitionDrawerOpen(true);
        }}
        onDeleteTransition={(id) => {
          draft.recordHistory();
          draft.setTransitions((current) => current.filter((item) => item.id !== id));
          draft.markDirty();
        }}
        viewHrefs={{ configure: getViewHref('configure'), map: getViewHref('map') }}
      />
      <WorkflowStandardTemplateDialog
        open={standardTemplateDialog.value}
        forms={templateFormsQuery.data?.items ?? []}
        loading={templateFormsQuery.isLoading || templateFormsQuery.isFetching}
        loadError={templateFormsQuery.isError}
        initialTemplateId={requestedTemplate?.id}
        onClose={standardTemplateDialog.onFalse}
        onApply={draft.applyWorkflowTemplate}
        onRetry={() => {
          templateFormsQuery.refetch();
        }}
        onOpenFormBuilder={() => router.push(studentPaths.enrollment.settings.forms)}
      />
      <WorkflowGovernanceActionDialog
        mode={governanceAction}
        workflowName={
          governanceAction === 'publish' && previousPublished && publishComparison
            ? `${workflow.name} · ${publishComparison.stageChanges.length} stage and ${publishComparison.routeChanges.length} route change(s)`
            : workflow.name
        }
        approvers={approversQuery.data ?? []}
        busy={governanceBusy}
        onClose={() => setGovernanceAction(null)}
        onConfirm={async ({ reason, approverUserId, effectiveAt }) => {
          try {
            let concurrencyStamp = workflow.concurrencyStamp;
            if ((governanceAction === 'submit' || governanceAction === 'publish') && draft.dirty) {
              const saved = await commands.saveDraft();
              if (!saved) return;
              concurrencyStamp = saved.concurrencyStamp;
            }
            if (governanceAction === 'submit' && approverUserId) {
              await submitForApproval({
                id: workflow.id,
                approverUserId,
                changeReason: reason,
                concurrencyStamp,
              }).unwrap();
              shikshaMitraToast.success({ message: 'Workflow submitted for approval' });
            } else if (governanceAction === 'approve') {
              await approveWorkflow({ id: workflow.id, reason, concurrencyStamp }).unwrap();
              shikshaMitraToast.success({ message: 'Workflow approved' });
            } else if (governanceAction === 'reject') {
              await rejectWorkflow({ id: workflow.id, reason, concurrencyStamp }).unwrap();
              shikshaMitraToast.success({ message: 'Workflow returned to draft' });
            } else if (governanceAction === 'publish') {
              await publishWorkflow({
                id: workflow.id,
                changeReason: reason,
                effectiveAt,
                concurrencyStamp,
              }).unwrap();
              shikshaMitraToast.success({
                message: effectiveAt ? 'Workflow publication scheduled' : 'Workflow published',
              });
            } else if (governanceAction === 'rollback') {
              const result = await createRollbackDraft({
                id: workflow.id,
                changeReason: reason,
              }).unwrap();
              shikshaMitraToast.success({ message: 'Rollback draft created' });
              router.push(`${studentPaths.enrollment.settings.workflows}/${result.id}`);
            }
            setGovernanceAction(null);
          } catch (error) {
            shikshaMitraToast.error({
              message:
                parseApiProblemDetail(error).detail || 'Unable to complete the governance action.',
            });
          }
        }}
      />
      <WorkflowBuilderEditors
        stageOpen={draft.stageDrawerOpen}
        transitionOpen={draft.transitionDrawerOpen}
        editingStage={draft.editingStage}
        editingTransition={draft.editingTransition}
        stageToDelete={draft.stageToDelete}
        stages={draft.stages}
        transitions={draft.transitions}
        stageTypes={stageTypesQuery.data ?? []}
        forms={publishedFormsQuery.data?.items ?? []}
        readOnly={readOnly}
        onCloseStage={() => {
          draft.setStageDrawerOpen(false);
          draft.setEditingStage(null);
        }}
        onCloseTransition={() => {
          draft.setTransitionDrawerOpen(false);
          draft.setEditingTransition(null);
        }}
        onCloseDelete={() => draft.setStageToDelete(null)}
        onSaveStage={draft.saveStage}
        onSaveTransition={draft.saveTransition}
        onDeleteStage={draft.deleteStage}
      />
      <WorkflowSidePanel
        panel={draft.sidePanel}
        workflow={workflow}
        stages={draft.stages}
        transitions={draft.transitions}
        validation={draft.validation}
        versions={versionsQuery.data}
        usage={usageQuery.data}
        usageLoading={usageQuery.isLoading}
        canCreateVersion={canCreateVersion}
        governanceHistory={governanceHistoryQuery.data}
        governanceLoading={governanceHistoryQuery.isLoading}
        onClose={() => draft.setSidePanel(null)}
      />
    </Box>
  );
}
