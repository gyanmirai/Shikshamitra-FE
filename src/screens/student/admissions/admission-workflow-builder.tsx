'use client';

import type { RootState } from 'src/redux/store';
import type {
  AdmissionWorkflowStage,
  AdmissionWorkflowTransition,
} from 'src/redux/student/admissions/admission-workflows-api';

import { Box } from '@mui/material';
import { useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useBoolean } from 'src/hooks/use-boolean';
import { shikshaMitraToast } from 'src/components/toast';
import { studentPaths } from 'src/constants/student-menu';
import { useRouter, useSearchParams } from 'next/navigation';
import { readStageConfiguration } from 'src/redux/student/admissions/admission-assessment-policy';
import {
  useGetAdmissionFormQuery,
  useGetAdmissionFormsQuery,
} from 'src/redux/student/admissions/admission-forms-api';
import {
  useGetAdmissionWorkflowQuery,
  useGetAdmissionWorkflowUsageQuery,
  useGetAdmissionWorkflowVersionsQuery,
  useGetAdmissionWorkflowStageTypesQuery,
} from 'src/redux/student/admissions/admission-workflows-api';

import { duplicateStage } from './workflow-builder-utils';
import { getAdmissionWorkflowAccess } from './workflow-access';
import { findMatchingWorkflowTemplate } from './workflow-template';
import { AdmissionWorkflowDialog } from './admission-workflow-dialog';
import { useAdmissionDefinitionOptions } from './use-admission-definition-options';
import { WorkflowSidePanel } from './workflow-builder/components/workflow-side-panel';
import { useWorkflowBuilderDraft } from './workflow-builder/hooks/use-workflow-builder-draft';
import { WorkflowBuilderCanvas } from './workflow-builder/components/workflow-builder-canvas';
import { WorkflowSetupProgress } from './workflow-builder/components/workflow-setup-progress';
import { WorkflowBuilderEditors } from './workflow-builder/components/workflow-builder-editors';
import { useWorkflowBuilderCommands } from './workflow-builder/hooks/use-workflow-builder-commands';
import { WorkflowBuilderPageState } from './workflow-builder/components/workflow-builder-page-state';
import { WorkflowStandardTemplateDialog } from './workflow-builder/components/workflow-standard-template-dialog';
import {
  WorkflowBuilderHeader,
  WorkflowLifecycleActions,
} from './workflow-builder/components/workflow-builder-header';

import type { WorkflowDetails } from './admission-workflow-dialog';

type Props = { workflowId: string };

export default function AdmissionWorkflowBuilder({ workflowId }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const createSetup = searchParams.get('setup') === '1';
  const standardTemplateDialog = useBoolean();
  const detailsDialog = useBoolean();
  const detailsCloseRef = useRef<(() => void) | null>(null);
  const [detailsInitialValues, setDetailsInitialValues] = useState<WorkflowDetails | null>(null);
  const { fetchInquiryForms, fetchRegistrationForms } = useAdmissionDefinitionOptions(
    standardTemplateDialog.value || detailsDialog.value
  );
  const [pendingRouteSourceId, setPendingRouteSourceId] = useState<string | null>(null);
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const workflowAccess = getAdmissionWorkflowAccess(permissions);
  const canEdit = workflowAccess.canManage;
  const canPublish = workflowAccess.canManage;
  const canCreateVersion = workflowAccess.canManage;
  const canViewUsage = workflowAccess.canView;
  const workflowQuery = useGetAdmissionWorkflowQuery(workflowId);
  const stageTypesQuery = useGetAdmissionWorkflowStageTypesQuery();
  const publishedFormsQuery = useGetAdmissionFormsQuery({ status: 1, maxResultCount: 100 });
  const usageQuery = useGetAdmissionWorkflowUsageQuery(workflowId, { skip: !canViewUsage });
  const versionsQuery = useGetAdmissionWorkflowVersionsQuery(workflowId);
  const workflow = workflowQuery.data;
  const draft = useWorkflowBuilderDraft(
    workflow,
    searchParams.get('panel') === 'usage' ? 'usage' : null
  );
  const registrationStageConfigurationJson = [...draft.stages]
    .sort((left, right) => left.displayOrder - right.displayOrder)
    .find((stage) => stage.stageType === 1)?.configurationJson;
  const selectedRegistrationFormDefinitionId = readStageConfiguration(
    registrationStageConfigurationJson
  )?.formDefinitionId;
  const currentRegistrationFormDefinitionId =
    typeof selectedRegistrationFormDefinitionId === 'string'
      ? selectedRegistrationFormDefinitionId
      : null;
  const defaultInquiryFormQuery = useGetAdmissionFormQuery(
    draft.defaultInquiryFormDefinitionId ?? '',
    {
      skip: !standardTemplateDialog.value || !draft.defaultInquiryFormDefinitionId,
    }
  );
  const registrationFormQuery = useGetAdmissionFormQuery(
    currentRegistrationFormDefinitionId ?? '',
    {
      skip:
        (!standardTemplateDialog.value && !detailsDialog.value) ||
        !currentRegistrationFormDefinitionId,
    }
  );
  const commands = useWorkflowBuilderCommands(workflowId, workflow, draft);
  const statusReadOnly = Boolean(workflow && ![0, 3].includes(workflow.status));
  const readOnly = !canEdit || !workflow || statusReadOnly;

  if (workflowQuery.isLoading) {
    return <WorkflowBuilderPageState state="loading" />;
  }
  if (workflowQuery.isError || !workflow) {
    return <WorkflowBuilderPageState state="error" onRetry={() => workflowQuery.refetch()} />;
  }
  const canPublishCurrent = canPublish && [0, 3, 5, 6].includes(workflow.status);
  const requestPublish = async () => {
    if (!canPublishCurrent) return;
    const published = await commands.publish();
    if (published) router.push(studentPaths.enrollment.settings.workflows);
  };
  const openAddTransition = (stage: AdmissionWorkflowStage) => {
    if (
      readOnly ||
      stage.isTerminalStage ||
      commands.updateState.isLoading ||
      commands.publishState.isLoading
    )
      return;
    const outgoing = draft.transitions.filter((item) => item.fromStageId === stage.id);
    if (outgoing.some((item) => item.isDefault)) return;
    if (!draft.addStage(stageTypesQuery.data ?? [])) {
      shikshaMitraToast.warning({
        message: 'No selectable stage type is available for the next stage.',
      });
      return;
    }
    setPendingRouteSourceId(stage.id);
  };
  const openEditTransition = (transition: AdmissionWorkflowTransition) => {
    draft.setEditingTransition(transition);
    draft.setTransitionDrawerOpen(true);
  };
  const openDetails = () => {
    if (readOnly || commands.updateState.isLoading || commands.publishState.isLoading) return;
    const details = commands.getCurrentDetails();
    if (!details) return;
    setDetailsInitialValues({
      name: details.name,
      code: details.code,
      description: details.description,
      registrationFormDefinitionId: currentRegistrationFormDefinitionId,
      defaultInquiryFormDefinitionId: draft.defaultInquiryFormDefinitionId,
    });
    detailsDialog.onTrue();
  };

  return (
    <Box
      sx={{
        minWidth: 0,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
        height: 1,
      }}
    >
      <WorkflowBuilderHeader
        workflow={workflow}
        detailsOpen={detailsDialog.value}
        afterBreadcrumb={
          !readOnly && !detailsDialog.value ? (
            <WorkflowSetupProgress
              onBackToDetails={openDetails}
              disabled={commands.updateState.isLoading || commands.publishState.isLoading}
            />
          ) : undefined
        }
        readOnlyReason={statusReadOnly ? 'status' : !canEdit ? 'permission' : undefined}
        onBack={
          detailsDialog.value
            ? () => detailsCloseRef.current?.()
            : createSetup && !readOnly
              ? openDetails
              : () => router.push(studentPaths.enrollment.settings.workflows)
        }
      >
        {!detailsDialog.value && (
          <WorkflowBuilderCanvas
            dirty={draft.dirty}
            canUndo={draft.canUndo}
            canRedo={draft.canRedo}
            onUndo={draft.undo}
            onRedo={draft.redo}
            footerActions={
              <WorkflowLifecycleActions
                dirty={draft.dirty}
                readOnly={readOnly}
                canPublish={canPublishCurrent}
                saving={commands.updateState.isLoading}
                validating={commands.validateState.isLoading}
                publishing={commands.publishState.isLoading}
                onSave={commands.saveDraft}
                onPublish={requestPublish}
              />
            }
            stages={draft.stages}
            transitions={draft.transitions}
            readOnly={readOnly || commands.publishState.isLoading || commands.updateState.isLoading}
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
            onAddTransition={openAddTransition}
            onEditTransition={openEditTransition}
            onDeleteTransition={(id) => {
              draft.recordHistory();
              draft.setTransitions((current) => current.filter((item) => item.id !== id));
              draft.markDirty();
            }}
          />
        )}
      </WorkflowBuilderHeader>
      <AdmissionWorkflowDialog
        inline
        open={detailsDialog.value && !readOnly}
        onClose={detailsDialog.onFalse}
        saving={commands.updateState.isLoading}
        closeRequestRef={detailsCloseRef}
        currentJourney={{ stages: draft.stages, transitions: draft.transitions }}
        initialRegistrationForm={registrationFormQuery.data}
        fetchRegistrationForms={fetchRegistrationForms}
        title="Edit workflow name and description"
        submitLabel="Save & continue"
        initialValues={
          detailsInitialValues ?? {
            name: workflow.name,
            code: workflow.code,
            description: workflow.description,
            registrationFormDefinitionId: currentRegistrationFormDefinitionId,
            defaultInquiryFormDefinitionId: draft.defaultInquiryFormDefinitionId,
          }
        }
        onSave={async (details) => {
          const saved = await commands.saveDetails(details);
          setDetailsInitialValues({
            name: saved.name,
            code: saved.code,
            description: saved.description,
          });
        }}
      />
      <WorkflowStandardTemplateDialog
        open={standardTemplateDialog.value && !readOnly}
        initialTemplateId={findMatchingWorkflowTemplate(draft.stages)}
        initialInquiryFormDefinitionId={draft.defaultInquiryFormDefinitionId}
        initialInquiryForm={defaultInquiryFormQuery.data}
        initialRegistrationFormDefinitionId={currentRegistrationFormDefinitionId}
        initialRegistrationForm={registrationFormQuery.data}
        fetchInquiryForms={fetchInquiryForms}
        fetchRegistrationForms={fetchRegistrationForms}
        onClose={standardTemplateDialog.onFalse}
        onApply={(templateId, formDefinitionId, inquiryFormDefinitionId) => {
          if (!readOnly)
            draft.applyWorkflowTemplate(templateId, formDefinitionId, inquiryFormDefinitionId);
        }}
        onOpenFormBuilder={() => router.push(studentPaths.enrollment.settings.forms)}
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
          setPendingRouteSourceId(null);
        }}
        onCloseTransition={() => {
          draft.setTransitionDrawerOpen(false);
          draft.setEditingTransition(null);
        }}
        onCloseDelete={() => draft.setStageToDelete(null)}
        onSaveStage={(stage) => {
          draft.saveStage(stage, !pendingRouteSourceId, pendingRouteSourceId ?? undefined);
          setPendingRouteSourceId(null);
        }}
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
        governanceLoading={false}
        onClose={() => draft.setSidePanel(null)}
      />
    </Box>
  );
}
