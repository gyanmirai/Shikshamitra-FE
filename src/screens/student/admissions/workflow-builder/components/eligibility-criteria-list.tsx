import type { AdmissionForm } from 'src/redux/student/admissions/admission-forms-api';
import type { AdmissionWorkflowStage } from 'src/redux/student/admissions/admission-workflows-api';
import type { AdmissionEligibilityCriterion } from 'src/redux/student/admissions/admission-eligibility-policy';

import { useState } from 'react';
import { Label } from 'src/components/label';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { Paper, Stack, Button, Typography } from '@mui/material';
import { createEligibilityCriterion } from 'src/redux/student/admissions/admission-eligibility-policy';

import { ELIGIBILITY_KIND_OPTIONS } from './eligibility-criterion-basics';
import { EligibilityCriterionDialog } from './eligibility-criterion-dialog';

export function EligibilityCriteriaList({
  criteria,
  onChange,
  readOnly,
  ...props
}: {
  criteria: AdmissionEligibilityCriterion[];
  onChange: (value: AdmissionEligibilityCriterion[]) => void;
  forms: AdmissionForm[];
  stages: AdmissionWorkflowStage[];
  stageOrder: number;
  readOnly: boolean;
}) {
  const [editing, setEditing] = useState<{
    index: number;
    value: AdmissionEligibilityCriterion;
  } | null>(null);
  const [removing, setRemoving] = useState<number | null>(null);
  const add = () => {
    let index = 1;
    const codes = new Set(criteria.map((criterion) => criterion.code));
    while (codes.has(`CRITERION_${index}`)) index += 1;
    setEditing({ index: -1, value: createEligibilityCriterion(`CRITERION_${index}`) });
  };
  return (
    <Stack spacing={1}>
      <Typography variant="subtitle2">Eligibility criteria · {criteria.length} of 30</Typography>
      {!criteria.length && (
        <Typography variant="body2" color="text.secondary">
          Add the checks your school needs. Every configured criterion must pass or have an approved
          exception.
        </Typography>
      )}
      {criteria.map((criterion, index) => (
        <Paper key={criterion.code} variant="outlined" sx={{ p: 1.5, borderRadius: 1 }}>
          <Stack spacing={1}>
            <Typography variant="subtitle2">{criterion.name}</Typography>
            <Label sx={{ alignSelf: 'flex-start' }}>
              {ELIGIBILITY_KIND_OPTIONS.find((item) => item.value === criterion.kind)?.label}
            </Label>
            {criterion.failureMessage && (
              <Typography variant="body2" color="text.secondary">
                {criterion.failureMessage}
              </Typography>
            )}
            <Stack direction="row" spacing={1}>
              <Button
                size="small"
                aria-label={`${readOnly ? 'View' : 'Edit'} ${criterion.name}`}
                onClick={() => setEditing({ index, value: criterion })}
              >
                {readOnly ? 'View criterion' : 'Edit criterion'}
              </Button>
              {!readOnly && (
                <Button
                  size="small"
                  color="error"
                  aria-label={`Remove ${criterion.name}`}
                  onClick={() => setRemoving(index)}
                >
                  Remove
                </Button>
              )}
            </Stack>
          </Stack>
        </Paper>
      ))}
      {!readOnly && (
        <Button size="small" variant="outlined" disabled={criteria.length >= 30} onClick={add}>
          Add eligibility criterion
        </Button>
      )}
      {editing && (
        <EligibilityCriterionDialog
          {...props}
          initial={editing.value}
          readOnly={readOnly}
          existingCodes={criteria
            .filter((_, index) => index !== editing.index)
            .map((item) => item.code.toUpperCase())}
          onClose={() => setEditing(null)}
          onSave={(value) =>
            onChange(
              editing.index < 0
                ? [...criteria, value]
                : criteria.map((item, index) => (index === editing.index ? value : item))
            )
          }
        />
      )}
      <ConfirmDialog
        open={removing !== null}
        onClose={() => setRemoving(null)}
        title="Remove eligibility criterion?"
        content="This changes the current draft. Existing application evaluations remain available."
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              onChange(criteria.filter((_, index) => index !== removing));
              setRemoving(null);
            }}
          >
            Remove criterion
          </Button>
        }
      />
    </Stack>
  );
}
