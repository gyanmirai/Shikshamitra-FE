import type { AdmissionDocumentRequirementPolicy } from 'src/redux/student/admissions/admission-document-policy';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import CustomTooltip from 'src/components/custom-tooltip';
import { Box, Paper, Stack, IconButton, Typography } from '@mui/material';

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
  onEdit: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onRemove: () => void;
}) {
  return (
    <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1 }}>
      <Stack spacing={1}>
        <Stack direction="row" alignItems="flex-start" spacing={1}>
          <Box sx={{ pt: 0.5, color: 'text.secondary', flexShrink: 0 }}>
            <Iconify icon="mdi:file-document-outline" width={20} />
          </Box>
          <Stack spacing={0.75} sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle2" sx={{ overflowWrap: 'anywhere' }}>
              {item.name}
            </Typography>
            <Stack direction="row" alignItems="center" flexWrap="wrap" gap={1}>
              <Label>
                {item.requirement === 'conditional'
                  ? 'Conditional'
                  : item.requirement === 'required'
                    ? 'Required'
                    : 'Optional'}
              </Label>
              <Typography variant="caption" color="text.secondary">
                {collectionLabels[item.collectionMode]}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {item.standardIds
                  ? `${item.standardIds.length} selected ${item.standardIds.length === 1 ? 'class' : 'classes'}`
                  : 'All classes'}
              </Typography>
            </Stack>
          </Stack>
          {!readOnly && (
            <Stack direction="row" sx={{ flexShrink: 0 }}>
              <CustomTooltip title="Edit requirement">
                <IconButton
                  size="small"
                  aria-label={`Edit ${item.name}`}
                  onClick={onEdit}
                  sx={{ width: 44, height: 44 }}
                >
                  <Iconify icon="mdi:pencil-outline" width={20} />
                </IconButton>
              </CustomTooltip>
              <CustomTooltip title="Remove requirement">
                <IconButton
                  size="small"
                  color="error"
                  aria-label={`Remove ${item.name}`}
                  onClick={onRemove}
                  sx={{ width: 44, height: 44 }}
                >
                  <Iconify icon="mdi:delete-outline" width={20} />
                </IconButton>
              </CustomTooltip>
            </Stack>
          )}
        </Stack>
        {item.description && (
          <Typography variant="body2" color="text.secondary" sx={{ overflowWrap: 'anywhere' }}>
            {item.description}
          </Typography>
        )}
        {item.collectionMode !== 'original' && (
          <Typography variant="caption" color="text.secondary">
            {item.allowedExtensions.join(', ').toUpperCase()} · Up to {item.maxFileSizeMb} MB
          </Typography>
        )}
      </Stack>
    </Paper>
  );
}
