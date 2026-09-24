import type { AdmissionFormField } from 'src/redux/student/admissions/admission-forms-api';

import Box from '@mui/material/Box';
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
    <Box sx={{ p: 2, flexShrink: 0 }}>
      <Typography component="h3" variant="h6">
        Field settings
      </Typography>
      <Stack direction="row" alignItems="center" spacing={1.25} sx={{ mt: 1.5 }}>
        <Box
          sx={{
            width: 36,
            height: 36,
            display: 'grid',
            flexShrink: 0,
            placeItems: 'center',
            border: 1,
            borderColor: 'divider',
            borderRadius: 1,
            color: 'text.secondary',
          }}
        >
          <Iconify icon={fieldTypeIcon(field.fieldType)} width={21} />
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="subtitle1" sx={{ overflowWrap: 'anywhere' }}>
            {field.label || 'Untitled field'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {sectionName || 'Untitled section'} · {fieldType}
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
}
