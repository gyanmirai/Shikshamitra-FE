import type { SeatingPlanGroupDto } from 'src/redux/academicAPI/ExaminationApi/ScheduleExamApi/seat-allocation-v2.types';

import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import { LoadingButton } from '@mui/lab';
import { useMemo, useState } from 'react';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useBoolean } from 'src/hooks/use-boolean';
import { ConfirmDialog } from 'src/components/confirm-dialog';

import { SubjectOption } from './subject-option';
import { ExistingPlanCard } from './existing-plan-card';
import { EditPlanSubjectsDialog } from './edit-plan-subjects-dialog';
import { ResetSeatingDraftDialog } from './reset-seating-draft-dialog';
import { ExaminationReadinessCard } from './examination-readiness-card';

import type { GuidedStepProps } from '../types';

export function PlanSubjectsStep({ workspace, workflow }: GuidedStepProps) {
  const resetDialog = useBoolean();
  const [editingPlan, setEditingPlan] = useState<SeatingPlanGroupDto>();
  const [deletingPlan, setDeletingPlan] = useState<SeatingPlanGroupDto>();
  /**
   * Memoization Justification:
   * - Subject ownership is reused for every subject option in the plan list.
   * - Keeping the map stable avoids rebuilding the complete plan-to-subject projection on dialog renders.
   */
  const subjectOwnerById = useMemo(
    () =>
      new Map(
        workspace.plans.flatMap((plan) =>
          plan.subjects.map((subject) => [subject.examSubjectId, plan] as const)
        )
      ),
    [workspace.plans]
  );
  const selectedIds = workflow.formik.values.selectedExamSubjectIds;
  const unplannedSubjects = workspace.availableSubjects.filter(
    (subject) => !subjectOwnerById.has(subject.examSubjectId)
  );

  const toggleSubject = (subjectId: string) => {
    if (workflow.selectedPlan) workflow.startNewPlan();
    const baseIds = workflow.selectedPlan ? [] : selectedIds;
    const nextIds = baseIds.includes(subjectId)
      ? baseIds.filter((id) => id !== subjectId)
      : [...baseIds, subjectId];
    workflow.formik.setFieldValue('selectedExamSubjectIds', nextIds);
  };

  const confirmDelete = async () => {
    if (!deletingPlan) return;
    await workflow.deletePlan(deletingPlan);
    setDeletingPlan(undefined);
  };

  return (
    <Stack spacing={2.5} sx={{ p: { xs: 2, md: 3 }, maxWidth: 960 }}>
      <Stack spacing={0.75}>
        <Typography variant="h5">Plan every subject, then publish once</Typography>
        <Typography color="text.secondary">
          Use an individual plan for one subject or a shared plan for multiple subjects that reuse
          the same rooms, rules and seat map. Each subject can belong to exactly one plan.
        </Typography>
      </Stack>

      <ExaminationReadinessCard workflow={workflow} onReset={resetDialog.onTrue} />

      <Stack spacing={1.25}>
        <Typography variant="h6">Existing plans ({workspace.plans.length})</Typography>
        {workspace.plans.length === 0 ? (
          <Alert severity="info">No seating plan has been created for this examination yet.</Alert>
        ) : (
          workspace.plans.map((plan) => (
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
          ))
        )}
        {workflow.selectedPlan?.issues.map((issue) => (
          <Alert key={issue.code} severity={issue.severity === 'blocker' ? 'warning' : 'info'}>
            <strong>{issue.title}.</strong> {issue.message}
          </Alert>
        ))}
      </Stack>

      {!workflow.isPublished && unplannedSubjects.length > 0 && (
        <>
          <Divider />
          <Stack spacing={1.5}>
            <Stack spacing={0.25}>
              <Typography variant="h6">Create another plan</Typography>
              <Typography variant="body2" color="text.secondary">
                Select any subjects that are not already owned by another plan.
              </Typography>
            </Stack>
            <TextField
              label="Plan name (optional)"
              value={workflow.formik.values.planName}
              onChange={(event) => workflow.formik.setFieldValue('planName', event.target.value)}
              error={Boolean(workflow.formik.touched.planName && workflow.formik.errors.planName)}
              helperText={
                workflow.formik.touched.planName && workflow.formik.errors.planName
                  ? String(workflow.formik.errors.planName)
                  : 'Leave blank to generate a name from the selected subjects.'
              }
              inputProps={{ maxLength: 128 }}
              fullWidth
            />
            <Stack spacing={1} aria-label="Subjects available for a seating plan">
              {unplannedSubjects.map((subject) => (
                <SubjectOption
                  key={subject.examSubjectId}
                  subject={subject}
                  owner={subjectOwnerById.get(subject.examSubjectId)}
                  checked={selectedIds.includes(subject.examSubjectId)}
                  onToggle={() => toggleSubject(subject.examSubjectId)}
                />
              ))}
            </Stack>
            {selectedIds.length > 0 && (
              <Alert severity="info">
                {selectedIds.length === 1
                  ? 'Individual plan: this subject gets its own rooms, rules and seat map.'
                  : `Shared plan: these ${selectedIds.length} subjects reuse one seating arrangement.`}
              </Alert>
            )}
          </Stack>
        </>
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
