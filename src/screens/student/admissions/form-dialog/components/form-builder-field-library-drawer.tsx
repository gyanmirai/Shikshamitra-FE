import type {
  AdmissionFormFieldType,
  AdmissionFormSystemFieldMetadata,
} from 'src/redux/student/admissions/admission-forms-api';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import { Iconify } from 'src/components/iconify';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { FormBuilderPalette } from '../form-builder-palette';

import type { AdmissionFieldPreset } from '../form-field-presets';

type Props = {
  open: boolean;
  targetLabel?: string;
  systemFields: AdmissionFormSystemFieldMetadata[];
  loading: boolean;
  error: boolean;
  onRetry: () => void;
  onClose: () => void;
  onAddField: (
    fieldType: AdmissionFormFieldType,
    systemBinding?: string,
    preset?: AdmissionFieldPreset
  ) => void;
};

export function FormBuilderFieldLibraryDrawer({
  open,
  targetLabel,
  systemFields,
  loading,
  error,
  onRetry,
  onClose,
  onAddField,
}: Props) {
  const addField: Props['onAddField'] = (fieldType, systemBinding, preset) => {
    onAddField(fieldType, systemBinding, preset);
    onClose();
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      aria-labelledby="admission-form-field-library-title"
      sx={{ zIndex: (theme) => theme.zIndex.modal + 1 }}
      PaperProps={{ sx: { width: { xs: 1, sm: 440 }, maxWidth: 1 } }}
    >
      <Stack sx={{ height: 1, minHeight: 0 }}>
        <Stack
          direction="row"
          alignItems="flex-start"
          justifyContent="space-between"
          spacing={1}
          sx={{ p: 2 }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography id="admission-form-field-library-title" variant="h6">
              Add a field
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Choose the information applicants should provide
              {targetLabel ? ` in ${targetLabel}` : ''}.
            </Typography>
          </Box>
          <IconButton aria-label="Close field library" onClick={onClose}>
            <Iconify icon="mdi:close" />
          </IconButton>
        </Stack>
        <Divider />

        <Stack spacing={1} sx={{ flex: 1, minHeight: 0, p: 2 }}>
          {error && (
            <Alert
              severity="warning"
              action={
                <Button size="small" onClick={onRetry}>
                  Retry
                </Button>
              }
            >
              Student fields could not load. Custom fields are still available.
            </Alert>
          )}
          {loading && <Alert severity="info">Loading student fields...</Alert>}
          <Box sx={{ flex: 1, minHeight: 0 }}>
            <FormBuilderPalette
              systemFields={systemFields}
              targetLabel={targetLabel}
              onAddField={addField}
            />
          </Box>
        </Stack>
      </Stack>
    </Drawer>
  );
}
