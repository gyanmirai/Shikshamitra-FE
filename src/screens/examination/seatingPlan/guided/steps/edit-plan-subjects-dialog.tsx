import type { SeatingPlanGroupDto } from 'src/redux/academicAPI/ExaminationApi/ScheduleExamApi/seat-allocation-v2.types';

import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import { LoadingButton } from '@mui/lab';
import { useMemo, useState } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import FormControlLabel from '@mui/material/FormControlLabel';

import type { GuidedStepProps } from '../types';

export function EditPlanSubjectsDialog({
  plan,
  workspace,
  workflow,
  onClose,
}: GuidedStepProps & { plan: SeatingPlanGroupDto; onClose: () => void }) {
  const originalIds = useMemo(
    () => plan.subjects.map((subject) => subject.examSubjectId),
    [plan.subjects]
  );
  const [name, setName] = useState(plan.name);
  const [selectedIds, setSelectedIds] = useState(originalIds);
  const [submitting, setSubmitting] = useState(false);
  const owners = useMemo(
    () =>
      new Map(
        workspace.plans.flatMap((ownerPlan) =>
          ownerPlan.subjects.map((subject) => [subject.examSubjectId, ownerPlan] as const)
        )
      ),
    [workspace.plans]
  );
  const subjectsChanged =
    selectedIds.length !== originalIds.length ||
    originalIds.some((id) => !selectedIds.includes(id));

  const toggle = (subjectId: string) => {
    setSelectedIds((current) =>
      current.includes(subjectId)
        ? current.filter((id) => id !== subjectId)
        : [...current, subjectId]
    );
  };

  const save = async () => {
    if (selectedIds.length === 0) return;
    setSubmitting(true);
    try {
      await workflow.updatePlanSubjects(plan, name, selectedIds);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open fullWidth maxWidth="sm" onClose={submitting ? undefined : onClose}>
      <DialogTitle>Edit plan subjects</DialogTitle>
      <DialogContent>
        <Stack spacing={1.5} sx={{ pt: 0.5 }}>
          <TextField
            size="small"
            fullWidth
            label="Plan name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            inputProps={{ maxLength: 128 }}
          />
          {workspace.availableSubjects.map((subject) => {
            const owner = owners.get(subject.examSubjectId);
            const ownedByAnotherPlan = Boolean(owner && owner.seatingPlanId !== plan.seatingPlanId);
            return (
              <FormControlLabel
                key={subject.examSubjectId}
                disabled={ownedByAnotherPlan}
                control={
                  <Checkbox
                    size="small"
                    checked={selectedIds.includes(subject.examSubjectId)}
                    onChange={() => toggle(subject.examSubjectId)}
                  />
                }
                label={
                  ownedByAnotherPlan
                    ? `${subject.subjectName} — already in ${owner?.name}`
                    : subject.subjectName
                }
              />
            );
          })}
          {subjectsChanged && plan.allocatedStudents > 0 && (
            <Alert severity="warning">
              Changing this group clears its {plan.allocatedStudents} saved seat assignments so no
              student remains attached to the wrong subjects.
            </Alert>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button
          size="small"
          color="inherit"
          variant="outlined"
          disabled={submitting}
          onClick={onClose}
        >
          Cancel
        </Button>
        <LoadingButton
          size="small"
          variant="contained"
          loading={submitting}
          disabled={selectedIds.length === 0 || (!subjectsChanged && name.trim() === plan.name)}
          onClick={save}
        >
          Save subject group
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
