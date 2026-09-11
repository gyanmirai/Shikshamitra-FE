import type { AdmissionDocumentRequirementPolicy } from 'src/redux/student/admissions/admission-document-policy';

import { Chip, Paper, Stack, Button, Typography } from '@mui/material';

const collectionLabels = {
  upload: 'File upload',
  original: 'Original inspection',
  either: 'Upload or original',
  both: 'Upload and original',
};
export function DocumentRequirementItem({
  item,
  readOnly,
  onEdit,
  onRemove,
}: {
  item: AdmissionDocumentRequirementPolicy;
  readOnly: boolean;
  onEdit: () => void;
  onRemove: () => void;
}) {
  return (
    <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1 }}>
      <Stack spacing={1}>
        <Typography variant="subtitle2">{item.name}</Typography>
        <Stack direction="row" flexWrap="wrap" gap={0.5}>
          <Chip
            size="small"
            label={
              item.requirement === 'conditional'
                ? 'Conditional'
                : item.requirement === 'required'
                  ? 'Required'
                  : 'Optional'
            }
          />
          <Chip size="small" variant="outlined" label={collectionLabels[item.collectionMode]} />
        </Stack>
        {item.description && (
          <Typography variant="body2" color="text.secondary">
            {item.description}
          </Typography>
        )}
        {item.collectionMode !== 'original' && (
          <Typography variant="caption" color="text.secondary">
            {item.allowedExtensions.join(', ').toUpperCase()} · Up to {item.maxFileSizeMb} MB
          </Typography>
        )}
        {!readOnly && (
          <Stack direction="row" spacing={1}>
            <Button size="small" aria-label={`Edit ${item.name}`} onClick={onEdit}>
              Edit requirement
            </Button>
            <Button
              size="small"
              color="error"
              aria-label={`Remove ${item.name}`}
              onClick={onRemove}
            >
              Remove
            </Button>
          </Stack>
        )}
      </Stack>
    </Paper>
  );
}
