import type { AdmissionReviewChecklistItem } from 'src/redux/student/admissions/admission-review-policy';

import { useState } from 'react';
import { Chip, Paper, Stack, Button, Typography } from '@mui/material';

import { ReviewChecklistDialog } from './review-checklist-dialog';

export function ReviewChecklistSettings({
  value,
  disabled,
  onChange,
}: {
  value: AdmissionReviewChecklistItem[];
  disabled: boolean;
  onChange: (value: AdmissionReviewChecklistItem[]) => void;
}) {
  const [editing, setEditing] = useState<{
    index: number;
    item: AdmissionReviewChecklistItem;
  } | null>(null);
  const add = () => {
    const codes = new Set(value.map((item) => item.code));
    let index = 1;
    while (codes.has(`CHECK_${index}`)) index += 1;
    setEditing({ index: -1, item: { code: `CHECK_${index}`, name: '', required: true } });
  };
  return (
    <Stack spacing={1}>
      {value.length >= 25 && (
        <Typography variant="caption" color="text.secondary">
          {value.length} of 30 checklist items
        </Typography>
      )}
      {!value.length && (
        <Typography variant="body2" color="text.secondary">
          Add confirmations staff should complete, or use a recommendation with notes only.
        </Typography>
      )}
      {value.map((item, index) => (
        <Paper key={item.code} variant="outlined" sx={{ p: 1 }}>
          <Stack spacing={1}>
            <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>
              {item.name}
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
              <Chip size="small" label={item.required ? 'Required' : 'Optional'} />
              {!disabled && (
                <>
                  <Button
                    size="small"
                    aria-label={`Edit ${item.name}`}
                    onClick={() => setEditing({ index, item })}
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    aria-label={`Remove ${item.name}`}
                    onClick={() => onChange(value.filter((_, position) => position !== index))}
                  >
                    Remove
                  </Button>
                </>
              )}
            </Stack>
          </Stack>
        </Paper>
      ))}
      {!disabled && (
        <Button size="small" variant="outlined" disabled={value.length >= 30} onClick={add}>
          Add review checklist item
        </Button>
      )}
      {editing && (
        <ReviewChecklistDialog
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
