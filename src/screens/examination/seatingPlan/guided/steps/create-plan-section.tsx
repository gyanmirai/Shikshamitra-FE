import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import ShakingTextField from 'src/components/shaking-text-field';
import { FormSectionCard } from 'src/components/form-section-card';

import { SubjectOption } from './subject-option';

import type { GuidedStepProps } from '../types';

export function CreatePlanSection({ workspace, workflow }: GuidedStepProps) {
  const ownedIds = new Set(
    workspace.plans.flatMap((plan) => plan.subjects.map((subject) => subject.examSubjectId))
  );
  const subjects = workspace.availableSubjects.filter(
    (subject) => !ownedIds.has(subject.examSubjectId)
  );
  const selectedIds = workflow.formik.values.selectedExamSubjectIds;
  const error = Boolean(workflow.formik.touched.planName && workflow.formik.errors.planName);

  if (workflow.isPublished || subjects.length === 0) return null;

  const toggleSubject = (subjectId: string) => {
    if (workflow.selectedPlan) workflow.startNewPlan();
    const baseIds = workflow.selectedPlan ? [] : selectedIds;
    workflow.formik.setFieldValue(
      'selectedExamSubjectIds',
      baseIds.includes(subjectId)
        ? baseIds.filter((id) => id !== subjectId)
        : [...baseIds, subjectId]
    );
  };

  return (
    <FormSectionCard
      icon="mdi:plus"
      title={workspace.plans.length ? 'Create another plan' : 'Create seating plan'}
      descriptionTooltip="Select at least one unplanned subject. One subject creates an individual plan; multiple subjects share rooms, rules and seating. Each subject can belong to only one plan. Leave the name blank to generate it from the selected subjects."
      action={<Chip size="small" variant="outlined" label={`${selectedIds.length} selected`} />}
    >
      <Stack spacing={1}>
        <ShakingTextField error={error}>
          <TextField
            size="small"
            label="Plan name (optional)"
            value={workflow.formik.values.planName}
            onChange={(event) => workflow.formik.setFieldValue('planName', event.target.value)}
            error={error}
            helperText={error ? String(workflow.formik.errors.planName) : undefined}
            inputProps={{ maxLength: 128 }}
            fullWidth
          />
        </ShakingTextField>
        <Stack spacing={1} aria-label="Subjects available for a seating plan">
          {subjects.map((subject) => (
            <SubjectOption
              key={subject.examSubjectId}
              subject={subject}
              checked={selectedIds.includes(subject.examSubjectId)}
              onToggle={() => toggleSubject(subject.examSubjectId)}
            />
          ))}
        </Stack>
      </Stack>
    </FormSectionCard>
  );
}
