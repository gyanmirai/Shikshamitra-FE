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
    <Paper component="li" variant="outlined" sx={{ p: 1.5, borderRadius: 1, listStyle: 'none' }}>
      <Stack spacing={1}>
        <Stack direction="row" alignItems="flex-start" spacing={1}>
          <Box
            sx={{
              p: 1,
              bgcolor: 'background.neutral',
              borderRadius: 1,
              color: 'text.secondary',
              flexShrink: 0,
              display: 'flex',
            }}
          >
            <Iconify icon="mdi:file-document-outline" width={20} />
          </Box>
          <Stack spacing={0.75} sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle2" sx={{ overflowWrap: 'anywhere' }}>
              {item.name}
            </Typography>
            <Stack direction="row" alignItems="center" flexWrap="wrap" gap={1}>
              <Label color={item.requirement === 'conditional' ? 'warning' : 'default'}>
                {item.requirement === 'conditional'
                  ? 'Conditional'
                  : item.requirement === 'required'
                    ? 'Required'
                    : 'Optional'}
              </Label>
            </Stack>
          </Stack>
          {!readOnly && (
            <Stack direction="row" sx={{ flexShrink: 0 }}>
              <CustomTooltip title="Edit requirement">
                <IconButton size="small" aria-label={`Edit ${item.name}`} onClick={onEdit}>
                  <Iconify icon="mdi:pencil-outline" width={20} />
                </IconButton>
              </CustomTooltip>
              <CustomTooltip title="Remove requirement">
                <IconButton
                  size="small"
                  color="error"
                  aria-label={`Remove ${item.name}`}
                  onClick={onRemove}
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
        <Stack direction="row" flexWrap="wrap" useFlexGap gap={1} sx={{ color: 'text.secondary' }}>
          <Typography variant="caption">{collectionLabels[item.collectionMode]}</Typography>
          <Typography variant="caption">
            ·{' '}
            {item.standardIds
              ? `${item.standardIds.length} selected ${item.standardIds.length === 1 ? 'class' : 'classes'}`
              : 'All classes'}
          </Typography>
          {item.collectionMode !== 'original' && (
            <Typography variant="caption" sx={{ overflowWrap: 'anywhere' }}>
              · {item.allowedExtensions.join(', ').toUpperCase()} · Up to {item.maxFileSizeMb} MB
            </Typography>
          )}
        </Stack>
      </Stack>
    </Paper>
  );
}
