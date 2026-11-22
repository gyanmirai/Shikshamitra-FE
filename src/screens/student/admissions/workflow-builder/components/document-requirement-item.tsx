import type { AdmissionDocumentRequirementPolicy } from 'src/redux/student/admissions/admission-document-policy';

import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import CustomTooltip from 'src/components/custom-tooltip';
import { Box, Chip, Paper, Stack, IconButton, Typography, chipClasses } from '@mui/material';

const collectionLabels = {
  upload: 'File Upload',
  original: 'Original Inspection',
  either: 'Upload or Original',
  both: 'Upload and Original',
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
  const classScope = item.standardIds
    ? `${item.standardIds.length} selected ${item.standardIds.length === 1 ? 'class' : 'classes'}`
    : 'All Classes';
  const formats = item.allowedExtensions.join(', ').toUpperCase();

  return (
    <Paper component="li" variant="outlined" sx={{ p: 1.5, borderRadius: 1, listStyle: 'none' }}>
      <Stack spacing={1}>
        <Stack direction="row" alignItems="center" spacing={1}>
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
            <Iconify icon={GlobalIcons.documentIcon} width={20} />
          </Box>
          <Stack
            direction="row"
            alignItems="center"
            flexWrap="wrap"
            gap={1}
            sx={{ flex: 1, minWidth: 0 }}
          >
            <Typography variant="subtitle2" sx={{ overflowWrap: 'anywhere' }}>
              {item.name}
            </Typography>
            <Label color={item.requirement === 'conditional' ? 'warning' : 'default'}>
              {item.requirement === 'conditional'
                ? 'Conditional'
                : item.requirement === 'required'
                  ? 'Required'
                  : 'Optional'}
            </Label>
          </Stack>
          {!readOnly && (
            <Stack
              direction="row"
              sx={{
                flexShrink: 0,
                '& .MuiIconButton-root': { width: { xs: 44, sm: 30 }, height: { xs: 44, sm: 30 } },
              }}
            >
              <CustomTooltip title="Edit Requirement">
                <IconButton size="small" aria-label={`Edit ${item.name}`} onClick={onEdit}>
                  <Iconify icon={GlobalIcons.edit} width={20} />
                </IconButton>
              </CustomTooltip>
              <CustomTooltip title="Remove Requirement">
                <IconButton
                  size="small"
                  color="error"
                  aria-label={`Remove ${item.name}`}
                  onClick={onRemove}
                >
                  <Iconify icon={GlobalIcons.delete} width={20} />
                </IconButton>
              </CustomTooltip>
            </Stack>
          )}
        </Stack>
        <Stack direction="row" flexWrap="wrap" gap={0.75}>
          <Chip size="small" variant="outlined" label={collectionLabels[item.collectionMode]} />
          <Chip size="small" variant="outlined" label={classScope} />
          {item.collectionMode !== 'original' && (
            <>
              {formats && (
                <Chip
                  size="small"
                  variant="outlined"
                  label={formats}
                  sx={{
                    maxWidth: 1,
                    height: 'auto',
                    minHeight: 24,
                    [`& .${chipClasses.label}`]: { whiteSpace: 'normal', overflowWrap: 'anywhere' },
                  }}
                />
              )}
              <Chip size="small" variant="outlined" label={`Max ${item.maxFileSizeMb} MB`} />
            </>
          )}
        </Stack>
        {item.description && (
          <Typography variant="body2" color="text.secondary" sx={{ overflowWrap: 'anywhere' }}>
            {item.description}
          </Typography>
        )}
      </Stack>
    </Paper>
  );
}
