import type { AdmissionFormField } from 'src/redux/student/admissions/admission-forms-api';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import { Iconify } from 'src/components/iconify';
import Typography from '@mui/material/Typography';

import { FIELD_TYPES, fieldTypeIcon } from '../form-dialog-model';

export function FieldPropertiesHeader({
  field,
  sectionName,
}: {
  field: AdmissionFormField;
  sectionName?: string;
}) {
  const fieldType = FIELD_TYPES.find(([, value]) => value === field.fieldType)?.[0] ?? 'Field';
  return (
    <Box sx={{ p: 1.5, flexShrink: 0, borderBottom: 1, borderColor: 'divider' }}>
      <Typography variant="overline" color="text.secondary">
        Field settings
      </Typography>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 0.5 }}>
        <Iconify icon={fieldTypeIcon(field.fieldType)} sx={{ color: 'primary.main' }} />
        <Typography variant="subtitle1" sx={{ overflowWrap: 'anywhere' }}>
          {field.label || 'Untitled field'}
        </Typography>
      </Stack>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: 'block', mt: 0.25, overflowWrap: 'anywhere' }}
      >
        In {sectionName || 'Untitled section'}
      </Typography>
      <Stack direction="row" gap={0.75} flexWrap="wrap" sx={{ mt: 1 }}>
        <Chip size="small" label={fieldType} variant="outlined" />
        <Chip
          size="small"
          label={field.bindingType === 0 ? 'Student field' : 'Custom field'}
          color={field.bindingType === 0 ? 'info' : 'default'}
          variant="soft"
        />
      </Stack>
    </Box>
  );
}
