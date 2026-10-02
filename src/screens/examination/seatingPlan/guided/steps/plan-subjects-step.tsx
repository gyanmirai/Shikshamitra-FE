import type { SeatingPlanGroupDto } from 'src/redux/academicAPI/ExaminationApi/ScheduleExamApi/seat-allocation-v2.types';

import { useState } from 'react';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import { LoadingButton } from '@mui/lab';
import { useBoolean } from 'src/hooks/use-boolean';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { FormSectionCard } from 'src/components/form-section-card';

import { ExistingPlanCard } from './existing-plan-card';
import { CreatePlanSection } from './create-plan-section';
import { EditPlanSubjectsDialog } from './edit-plan-subjects-dialog';
import { ResetSeatingDraftDialog } from './reset-seating-draft-dialog';
import { ExaminationReadinessCard } from './examination-readiness-card';

import type { GuidedStepProps } from '../types';

export function PlanSubjectsStep({ workspace, workflow }: GuidedStepProps) {
  const resetDialog = useBoolean();
  const [editingPlan, setEditingPlan] = useState<SeatingPlanGroupDto>();
  const [deletingPlan, setDeletingPlan] = useState<SeatingPlanGroupDto>();
  const confirmDelete = async () => {
    if (!deletingPlan) return;
    await workflow.deletePlan(deletingPlan);
    setDeletingPlan(undefined);
  };

  return (
    <Stack spacing={1.5} sx={{ p: 2 }}>
      <ExaminationReadinessCard workflow={workflow} onReset={resetDialog.onTrue} />

      <CreatePlanSection workspace={workspace} workflow={workflow} />
      {workspace.plans.length > 0 && (
        <FormSectionCard
          icon="mdi:format-list-bulleted"
          title={`Existing plans (${workspace.plans.length})`}
          descriptionTooltip="Configure or edit seating for an existing plan, or change its subjects. Only empty plans can be deleted. Use Reset draft seating to remove plans that already contain seat assignments."
        >
          <Stack spacing={1}>
            {workspace.plans.map((plan) => (
              <ExistingPlanCard
                key={plan.seatingPlanId}
                plan={plan}
                selected={workflow.selectedPlan?.seatingPlanId === plan.seatingPlanId}
                isExaminationPublished={workflow.isPublished}
                canEdit={workflow.permissions.canAdd}
                canDelete={workflow.permissions.canDelete}
                onOpen={() => workflow.openPlan(plan)}
                onEdit={() => setEditingPlan(plan)}
                onDelete={() => setDeletingPlan(plan)}
              />
            ))}
            {workflow.selectedPlan?.issues.map((issue) => (
              <Alert key={issue.code} severity={issue.severity === 'blocker' ? 'warning' : 'info'}>
                <strong>{issue.title}.</strong> {issue.message}
              </Alert>
            ))}
          </Stack>
        </FormSectionCard>
      )}

      <ResetSeatingDraftDialog
        open={resetDialog.value}
        workflow={workflow}
        onClose={resetDialog.onFalse}
      />
      {editingPlan && (
        <EditPlanSubjectsDialog
          key={editingPlan.seatingPlanId}
          plan={editingPlan}
          workspace={workspace}
          workflow={workflow}
          onClose={() => setEditingPlan(undefined)}
        />
      )}
      <ConfirmDialog
        open={Boolean(deletingPlan)}
        onClose={() => setDeletingPlan(undefined)}
        title="Delete empty seating plan?"
        content={
          <>
            Delete <strong>{deletingPlan?.name}</strong>? Its subjects become available for another
            plan immediately.
          </>
        }
        action={
          <LoadingButton
            size="small"
            color="error"
            variant="contained"
            loading={workflow.isBusy}
            onClick={confirmDelete}
          >
            Delete plan
          </LoadingButton>
        }
      />
    </Stack>
  );
}
