import type { AdmissionInquiryQualificationCriterion } from 'src/redux/student/admissions/admission-inquiry-policy';

import { useState } from 'react';
import { Chip, Paper, Stack, Button, Typography } from '@mui/material';

import { ReviewChecklistDialog } from './review-checklist-dialog';

export function InquiryQualificationChecklist({
  value,
  disabled,
  onChange,
}: {
  value: AdmissionInquiryQualificationCriterion[];
  disabled: boolean;
  onChange: (value: AdmissionInquiryQualificationCriterion[]) => void;
}) {
  const [editing, setEditing] = useState<{
    index: number;
    item: AdmissionInquiryQualificationCriterion;
  } | null>(null);
  const add = () => {
    const codes = new Set(value.map((item) => item.code));
    let index = 1;
    while (codes.has(`QUALIFY_${index}`)) index += 1;
    setEditing({ index: -1, item: { code: `QUALIFY_${index}`, name: '', required: true } });
  };
  return (
    <Stack spacing={1}>
      <Typography variant="subtitle2">Qualification checklist · {value.length} of 30</Typography>
      {!value.length && (
        <Typography variant="body2" color="text.secondary">
          Add the facts staff should confirm before marking an inquiry qualified.
        </Typography>
      )}
      {value.map((item, index) => (
        <Paper key={item.code} variant="outlined" sx={{ p: 1 }}>
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
            <Typography variant="body2" sx={{ flex: 1, overflowWrap: 'anywhere' }}>
              {item.name}
            </Typography>
            <Chip size="small" label={item.required ? 'Required' : 'Optional'} />
            {!disabled && (
              <Button
                size="small"
                aria-label={`Edit ${item.name}`}
                onClick={() => setEditing({ index, item })}
              >
                Edit
              </Button>
            )}
            {!disabled && (
              <Button
                size="small"
                color="error"
                aria-label={`Remove ${item.name}`}
                onClick={() => onChange(value.filter((_, position) => position !== index))}
              >
                Remove
              </Button>
            )}
          </Stack>
        </Paper>
      ))}
      {!disabled && (
        <Button size="small" variant="outlined" disabled={value.length >= 30} onClick={add}>
          Add qualification item
        </Button>
      )}
      {editing && (
        <ReviewChecklistDialog
          context="qualification"
          initial={editing.item}
          existingCodes={value
            .filter((_, index) => index !== editing.index)
            .map((item) => item.code)}
          onClose={() => setEditing(null)}
          onSave={(item) =>
            onChange(
              editing.index < 0
                ? [...value, item]
                : value.map((entry, index) => (index === editing.index ? item : entry))
            )
          }
        />
      )}
    </Stack>
  );
}
