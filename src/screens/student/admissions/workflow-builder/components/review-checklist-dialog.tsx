import type { AdmissionReviewChecklistItem } from 'src/redux/student/admissions/admission-review-policy';

import { useFormik } from 'formik';
import { StudentFeedback } from 'src/components/student-feedback';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { reviewChecklistItemSchema } from 'src/redux/student/admissions/admission-review-validation';
import {
  Box,
  Stack,
  Button,
  Switch,
  TextField,
  DialogActions,
  FormControlLabel,
} from '@mui/material';

export function ReviewChecklistDialog({
  initial,
  existingCodes,
  onSave,
  onClose,
}: {
  initial: AdmissionReviewChecklistItem;
  existingCodes: string[];
  onSave: (item: AdmissionReviewChecklistItem) => void;
  onClose: () => void;
}) {
  const formik = useFormik({
    initialValues: initial,
    validationSchema: reviewChecklistItemSchema,
    validate: (values) =>
      existingCodes.includes(values.code) ? { code: 'This checklist code is already in use' } : {},
    onSubmit: (values) => {
      onSave({ ...values, name: values.name.trim() });
      onClose();
    },
  });
  const requestClose = () => {
    if (!formik.dirty || window.confirm('You have unsaved changes. Do you want to discard them?'))
      onClose();
  };
  return (
    <CustomDialog
      open
      hasForm={false}
      guardUnsavedChanges={formik.dirty}
      title="Configure review checklist item"
      handleClose={onClose}
      maxWidth="sm"
    >
      <Box
        component="form"
        noValidate
        onSubmit={(event) => {
          event.stopPropagation();
          formik.handleSubmit(event);
        }}
      >
        <DialogScrollContent>
          <Stack spacing={2}>
            <TextField
              fullWidth
              size="small"
              label="Checklist item name *"
              {...formik.getFieldProps('name')}
              error={Boolean(formik.touched.name && formik.errors.name)}
              helperText={formik.touched.name && formik.errors.name}
            />
            <TextField
              fullWidth
              size="small"
              label="Checklist code *"
              {...formik.getFieldProps('code')}
              error={Boolean(formik.touched.code && formik.errors.code)}
              helperText={formik.touched.code && formik.errors.code}
            />
            <FormControlLabel
              label="Required before submitting a recommendation"
              control={
                <Switch
                  size="small"
                  checked={formik.values.required}
                  onChange={(_, checked) => formik.setFieldValue('required', checked)}
                />
              }
            />
            <StudentFeedback notificationKey="STU-0528" presentation="inline" severity="info">
              Staff can record notes for each item. Required items must pass before a recommendation
              can be submitted.
            </StudentFeedback>
          </Stack>
        </DialogScrollContent>
        <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
          <Button size="small" variant="outlined" onClick={requestClose}>
            Cancel
          </Button>
          <Button size="small" variant="contained" type="submit">
            Save checklist item
          </Button>
        </DialogActions>
      </Box>
    </CustomDialog>
  );
}
