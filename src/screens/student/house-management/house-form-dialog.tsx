import type { House, SaveHouse } from 'src/redux/student/house-management/house-management-types';

import * as Yup from 'yup';
import { useState } from 'react';
import { useFormik } from 'formik';
import { GlobalIcons } from 'src/utils/icons';
import { MuiColorInput } from 'mui-color-input';
import { Iconify } from 'src/components/iconify';
import { FormBusyRegion } from 'src/components/form-busy-region';
import ShakingTextField from 'src/components/shaking-text-field';
import { FormSectionCard } from 'src/components/form-section-card';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { Alert, Stack, Button, TextField, DialogActions } from '@mui/material';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';

import { useHouseCloseGuard } from './use-house-close-guard';

type Props = {
  academicMediumId: string;
  house?: House;
  onClose: () => void;
  onSave: (values: SaveHouse) => Promise<void>;
};
const schema = Yup.object({
  name: Yup.string()
    .trim()
    .required('Enter a house name.')
    .max(200, 'Use 200 characters or fewer.'),
  color: Yup.string().trim().required('Choose a color.').max(50, 'Use 50 characters or fewer.'),
  logoUrl: Yup.string().trim().max(500, 'Use 500 characters or fewer.'),
  description: Yup.string().max(1000, 'Use 1000 characters or fewer.'),
});
export default function HouseFormDialog({ academicMediumId, house, onSave, onClose }: Props) {
  const [error, setError] = useState('');
  const form = useFormik({
    initialValues: {
      name: house?.name ?? '',
      color: house?.color ?? '',
      logoUrl: house?.logoUrl ?? '',
      description: house?.description ?? '',
    },
    validationSchema: schema,
    onSubmit: async (values) => {
      setError('');
      try {
        await onSave({
          academicMediumId,
          name: values.name.trim(),
          color: values.color.trim(),
          logoUrl: values.logoUrl.trim() || null,
          description: values.description.trim() || null,
        });
        onClose();
      } catch (failure) {
        setError(parseApiProblemDetail(failure).detail);
      }
    },
  });
  const { close, confirmation } = useHouseCloseGuard(form.dirty, form.isSubmitting, onClose);
  const fieldError = (key: keyof typeof form.values) =>
    Boolean((form.touched[key] || form.submitCount) && form.errors[key]);
  return (
    <>
      <CustomDialog
        open
        title={house ? 'Edit House' : 'Create House'}
        titleInfo="House details belong to the selected medium. Students can join from any class in that medium."
        handleClose={close}
        guardUnsavedChanges={false}
        disableClose={form.isSubmitting}
        formProps={{
          onSubmit: (event) => {
            event.preventDefault();
            event.stopPropagation();
            form.handleSubmit();
          },
          noValidate: true,
        }}
      >
        <DialogScrollContent>
          <FormBusyRegion busy={form.isSubmitting}>
            <Stack spacing={2}>
              {error && <Alert severity="error">{error}</Alert>}
              <FormSectionCard
                title="House Details"
                icon={GlobalIcons.building}
                descriptionTooltip="Name and color identify the house. Logo URL and description are optional."
              >
                <ShakingTextField error={fieldError('name')}>
                  <TextField
                    autoFocus
                    required
                    fullWidth
                    size="small"
                    name="name"
                    label="House name"
                    value={form.values.name}
                    onChange={form.handleChange}
                    onBlur={form.handleBlur}
                    error={fieldError('name')}
                    helperText={fieldError('name') ? form.errors.name : undefined}
                  />
                </ShakingTextField>
                <ShakingTextField error={fieldError('color')}>
                  <MuiColorInput
                    required
                    fullWidth
                    size="small"
                    name="color"
                    label="Color"
                    format="hex"
                    value={form.values.color}
                    onChange={(value) => form.setFieldValue('color', value)}
                    onBlur={form.handleBlur}
                    error={fieldError('color')}
                    helperText={fieldError('color') ? form.errors.color : undefined}
                  />
                </ShakingTextField>
                <TextField
                  fullWidth
                  size="small"
                  name="logoUrl"
                  label="Logo URL"
                  value={form.values.logoUrl}
                  onChange={form.handleChange}
                  onBlur={form.handleBlur}
                  error={fieldError('logoUrl')}
                  helperText={fieldError('logoUrl') ? form.errors.logoUrl : undefined}
                />
                <TextField
                  fullWidth
                  multiline
                  minRows={2}
                  size="small"
                  name="description"
                  label="Description"
                  value={form.values.description}
                  onChange={form.handleChange}
                  onBlur={form.handleBlur}
                  error={fieldError('description')}
                  helperText={
                    fieldError('description')
                      ? form.errors.description
                      : `${form.values.description.length}/1000 characters`
                  }
                />
              </FormSectionCard>
            </Stack>
          </FormBusyRegion>
        </DialogScrollContent>
        <DialogActions>
          <Button
            size="small"
            type="button"
            variant="outlined"
            color="inherit"
            disabled={form.isSubmitting}
            onClick={close}
            startIcon={<Iconify icon={GlobalIcons.cancel} />}
          >
            Cancel
          </Button>
          <Button
            size="small"
            type="submit"
            variant="contained"
            color="inherit"
            disabled={form.isSubmitting}
            startIcon={<Iconify icon={GlobalIcons.submit} />}
          >
            Submit
          </Button>
        </DialogActions>
      </CustomDialog>
      {confirmation}
    </>
  );
}
