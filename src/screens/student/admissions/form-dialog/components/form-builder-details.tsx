import type { FormikProps } from 'formik';
import type { CreateUpdateAdmissionForm } from 'src/redux/student/admissions/admission-forms-api';

import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { Box, Stack, Paper, Button, Typography } from '@mui/material';

import { FormBuilderDetailFields } from './form-builder-detail-fields';
import { getRegistrationFormTemplate } from '../registration-form-template';

type Props = { formik: FormikProps<CreateUpdateAdmissionForm>; editing: boolean };

export function FormBuilderDetails({ formik, editing }: Props) {
  const replaceTemplate = useBoolean();
  const applyTemplate = () => {
    formik.setValues(getRegistrationFormTemplate());
    formik.setTouched({});
    replaceTemplate.onFalse();
  };
  return (
    <Stack spacing={2} sx={{ width: 1, maxWidth: 1000, mx: 'auto', p: { xs: 1.5, sm: 3 } }}>
      {!editing && (
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: 'background.neutral' }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            alignItems={{ sm: 'center' }}
            justifyContent="space-between"
          >
            <Box>
              <Typography variant="subtitle2">Start with a ready-made form</Typography>
              <Typography variant="body2" color="text.secondary">
                Use the registration template, then adjust its sections and fields in the next step.
              </Typography>
            </Box>
            <Button
              type="button"
              size="small"
              variant="outlined"
              startIcon={<Iconify icon="mdi:clipboard-text-outline" />}
              onClick={() => (formik.dirty ? replaceTemplate.onTrue() : applyTemplate())}
              sx={{ flexShrink: 0 }}
            >
              Use registration template
            </Button>
          </Stack>
        </Paper>
      )}
      <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 }, borderRadius: 2 }}>
        <Typography variant="subtitle1" sx={{ mb: 2 }}>
          Form details
        </Typography>
        <FormBuilderDetailFields formik={formik} />
      </Paper>
      <Typography variant="body2" color="text.secondary">
        Next, add the questions and information you want applicants to provide. Nothing is published
        when you save a draft.
      </Typography>
      <ConfirmDialog
        open={replaceTemplate.value}
        onClose={replaceTemplate.onFalse}
        title="Replace this draft with the template?"
        content="This replaces the form details, sections, and fields you have entered with the registration template."
        action={
          <Button variant="contained" onClick={applyTemplate}>
            Use template
          </Button>
        }
      />
    </Stack>
  );
}
