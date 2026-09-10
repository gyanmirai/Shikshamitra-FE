'use client';

import type { RootState } from 'src/redux/store';

import { Box } from '@mui/material';
import { useSelector } from 'react-redux';
import { useSearchParams } from 'next/navigation';
import { useBoolean } from 'src/hooks/use-boolean';
import { hasGrantedPermission } from 'src/utils/permissions';
import { useGetAdmissionFormsQuery } from 'src/redux/student/admissions/admission-forms-api';
import {
  useGetAdmissionWorkflowQuery,
  useGetAdmissionWorkflowUsageQuery,
  useGetAdmissionWorkflowVersionsQuery,
  useGetAdmissionWorkflowStageTypesQuery,
} from 'src/redux/student/admissions/admission-workflows-api';

import { duplicateStage } from './workflow-builder-utils';
import { AdmissionQueryError } from './admission-query-error';
import { WorkflowSidePanel } from './workflow-builder/components/workflow-side-panel';
import { useWorkflowBuilderDraft } from './workflow-builder/hooks/use-workflow-builder-draft';
import { WorkflowBuilderCanvas } from './workflow-builder/components/workflow-builder-canvas';
import { WorkflowBuilderHeader } from './workflow-builder/components/workflow-builder-header';
import { WorkflowBuilderLoading } from './workflow-builder/components/workflow-builder-loading';
import { WorkflowBuilderEditors } from './workflow-builder/components/workflow-builder-editors';
import { useWorkflowBuilderCommands } from './workflow-builder/hooks/use-workflow-builder-commands';
import { WorkflowStandardTemplateDialog } from './workflow-builder/components/workflow-standard-template-dialog';

type Props = { workflowId: string };

export default function AdmissionWorkflowBuilder({ workflowId }: Props) {
  const searchParams = useSearchParams();
  const standardTemplateDialog = useBoolean();
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const canEdit = hasGrantedPermission(permissions, 'Students.Admissions.Workflows.Edit');
  const canValidate = hasGrantedPermission(permissions, 'Students.Admissions.Workflows.Validate');
  const canPublish = hasGrantedPermission(permissions, 'Students.Admissions.Workflows.Publish');
  const canViewUsage = hasGrantedPermission(permissions, 'Students.Admissions.Workflows.ViewUsage');
  const workflowQuery = useGetAdmissionWorkflowQuery(workflowId);
  const stageTypesQuery = useGetAdmissionWorkflowStageTypesQuery();
  const formsQuery = useGetAdmissionFormsQuery({ status: 1, maxResultCount: 100 });
  const usageQuery = useGetAdmissionWorkflowUsageQuery(workflowId, { skip: !canViewUsage });
  const versionsQuery = useGetAdmissionWorkflowVersionsQuery(workflowId);
  const workflow = workflowQuery.data;
  const draft = useWorkflowBuilderDraft(
    workflow,
    searchParams.get('panel') === 'usage' ? 'usage' : null
  );
  const commands = useWorkflowBuilderCommands(workflowId, workflow, draft);
  const readOnly = !canEdit || workflow?.status !== 0;

  if (workflowQuery.isLoading) {
    return <WorkflowBuilderLoading />;
  }
  if (workflowQuery.isError || !workflow) {
    return <AdmissionQueryError onRetry={() => workflowQuery.refetch()} />;
  }

  return (
    <Box sx={{ height: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      <WorkflowBuilderHeader
        workflow={workflow}
        dirty={draft.dirty}
        readOnly={readOnly}
        canValidate={canValidate}
        canPublish={canPublish}
        canViewUsage={canViewUsage}
        saving={commands.updateState.isLoading}
        validating={commands.validateState.isLoading}
        publishing={commands.publishState.isLoading}
        onSave={commands.saveDraft}
        onValidate={commands.validateSavedWorkflow}
        onPublish={commands.publish}
        onOpenPanel={draft.setSidePanel}
        onApplyTemplate={standardTemplateDialog.onTrue}
      />
      <WorkflowBuilderCanvas
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
          draft.setStages((current) => duplicateStage(current, stage.id));
          draft.setDirty(true);
        }}
        onDeleteStage={draft.setStageToDelete}
        onDragEnd={draft.handleDragEnd}
        onAddTransition={() => {
          draft.setEditingTransition(null);
          draft.setTransitionDrawerOpen(true);
        }}
        onEditTransition={(transition) => {
          draft.setEditingTransition(transition);
          draft.setTransitionDrawerOpen(true);
        }}
        onDeleteTransition={(id) => {
          draft.setTransitions((current) => current.filter((item) => item.id !== id));
          draft.setDirty(true);
        }}
      />
      <WorkflowStandardTemplateDialog
        open={standardTemplateDialog.value}
        forms={formsQuery.data?.items ?? []}
        onClose={standardTemplateDialog.onFalse}
        onApply={draft.applyRegistrationTemplate}
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
        forms={formsQuery.data?.items ?? []}
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
        stages={draft.stages}
        validation={draft.validation}
        versions={versionsQuery.data}
        usage={usageQuery.data}
        usageLoading={usageQuery.isLoading}
        onClose={() => draft.setSidePanel(null)}
      />
    </Box>
  );
}
