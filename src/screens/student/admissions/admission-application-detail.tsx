'use client';

import { useParams } from 'next/navigation';
import { Box, Stack, Skeleton } from '@mui/material';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { AdmissionQueryError } from './admission-query-error';
import { FormHistoryCard } from './application-detail/form-history-card';
import { useApplicationDetail } from './application-detail/use-application-detail';
import { TransitionHistoryCard } from './application-detail/transition-history-card';
import { ApplicationRuntimeForm } from './application-detail/application-runtime-form';
import { ApplicationProgressCard } from './application-detail/application-progress-card';
import { AdmissionWorkflowRuntimeActionDialog } from './admission-workflow-runtime-action-dialog';

export default function AdmissionApplicationDetailScreen() {
  const { id } = useParams<{ id: string }>();
  const detail = useApplicationDetail(id);
  const { applicationQuery, formQuery, workflowQuery } = detail;
  const application = applicationQuery.data;
  const form = formQuery.data;
  const workflow = workflowQuery.data;

  if (applicationQuery.isLoading || formQuery.isLoading || workflowQuery.isLoading) {
    return <Stack spacing={2}><Skeleton height={80} /><Skeleton variant="rounded" height={180} /><Skeleton variant="rounded" height={360} /></Stack>;
  }
  if (applicationQuery.isError || formQuery.isError || workflowQuery.isError || !application || !form) {
    return <AdmissionQueryError onRetry={() => { applicationQuery.refetch(); formQuery.refetch(); workflowQuery.refetch(); }} />;
  }
  const currentStage = workflow?.stages.find((stage) => stage.id === workflow.currentStageInstanceId);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <CustomBreadcrumbs
        heading={application.applicationNumber}
        description="Review the configured admission journey, form data, and transition history."
        links={[
          { name: 'Students', href: '/student/dashboard' },
          { name: 'Admissions', href: '/student/admissions' },
          { name: 'Applications', href: '/student/admissions/applications' },
          { name: application.applicationNumber },
        ]}
        sx={{ mb: 1 }}
      />
      <ApplicationProgressCard
        application={application}
        workflow={workflow}
        currentStage={currentStage}
        canAdvance={detail.canAdvance}
        canSkip={detail.canSkip}
        canOverride={detail.canOverride}
        advancing={detail.advanceState.isLoading}
        onAdvance={() => detail.advance()}
        onSkip={() => detail.setRuntimeAction('skip')}
        onOverride={() => detail.setRuntimeAction('override')}
      />
      <TransitionHistoryCard workflow={workflow} />
      <FormHistoryCard history={detail.formHistoryQuery.data ?? []} />
      <ApplicationRuntimeForm
        application={application}
        form={form}
        values={detail.currentValues}
        errors={detail.errors}
        fieldErrors={detail.fieldErrors}
        saving={detail.updateState.isLoading}
        submitting={detail.submitState.isLoading}
        onChange={detail.setFieldValue}
        onBlur={detail.setFieldTouched}
        onValidateStep={detail.validateStep}
        onSave={detail.save}
        onSubmit={detail.submitApplication}
        canReopen={detail.canReopen}
        reopening={detail.reopenState.isLoading}
        onReopen={detail.reopenApplication}
      />
      {detail.runtimeAction && workflow && (
        <AdmissionWorkflowRuntimeActionDialog
          open
          action={detail.runtimeAction}
          transitions={workflow.availableTransitions}
          loading={detail.advanceState.isLoading}
          onClose={() => detail.setRuntimeAction(null)}
          onSubmit={(value) => detail.advance({
            ...value,
            skipCurrentStage: detail.runtimeAction === 'skip',
            adminOverride: detail.runtimeAction === 'override',
          })}
        />
      )}
    </Box>
  );
}
