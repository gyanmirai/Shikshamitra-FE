import type { House, SaveHouse } from 'src/redux/student/house-management/house-management-types';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useState, useCallback } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import CustomUpload from 'src/components/custom-upload';
import { FormBusyRegion } from 'src/components/form-busy-region';
import ShakingTextField from 'src/components/shaking-text-field';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import ColorPickerCircle, { staticColors } from 'src/components/static-color/colorPickerCircle';
import { Box, Alert, Stack, Button, TextField, DialogActions, FormHelperText } from '@mui/material';
import { useUploadHouseLogoMutation } from 'src/redux/student/house-management/house-management-api';

import { useHouseLogo } from './use-house-logo';
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
  logoFile: Yup.mixed<File>()
    .nullable()
    .test(
      'type',
      'Choose a PNG or JPEG image.',
      (file) => !file || ['image/png', 'image/jpeg'].includes(file.type)
    )
    .test('size', 'Maximum file size is 3 MB.', (file) => !file || file.size <= 3 * 1024 * 1024),
  description: Yup.string().max(1000, 'Use 1000 characters or fewer.'),
});
export default function HouseFormDialog({ academicMediumId, house, onSave, onClose }: Props) {
  const focusName = useCallback(
    (input: HTMLInputElement | null) => input?.focus({ preventScroll: true }),
    []
  );
  const [error, setError] = useState('');
  const [logoError, setLogoError] = useState('');
  const [uploadLogo] = useUploadHouseLogoMutation();
  const form = useFormik({
    initialValues: {
      name: house?.name ?? '',
      color: house?.color ?? '',
      logoUrl: house?.logoUrl ?? '',
      logoFile: null as File | null,
      description: house?.description ?? '',
    },
    validationSchema: schema,
    onSubmit: async (values) => {
      setError('');
      try {
        const logoUrl = values.logoFile
          ? await uploadLogo(values.logoFile).unwrap()
          : values.logoUrl;
        // Keep a completed upload on a failed house save so Retry does not upload it again.
        if (values.logoFile) {
          await form.setValues({ ...values, logoFile: null, logoUrl }, false);
        }
        await onSave({
          academicMediumId,
          name: values.name.trim(),
          color: values.color.trim(),
          logoUrl: logoUrl.trim() || null,
          description: values.description.trim() || null,
        });
        onClose();
      } catch (failure) {
        setError(parseApiProblemDetail(failure).detail);
      }
    },
  });
  const savedLogoPreview = useHouseLogo(form.values.logoUrl);
  const { close, confirmation } = useHouseCloseGuard(form.dirty, form.isSubmitting, onClose);
  const fieldError = (key: keyof typeof form.values) =>
    Boolean((form.touched[key] || form.submitCount) && form.errors[key]);
  return (
    <>
      <CustomDialog
        open
        title={house ? 'Edit House' : 'Add House'}
        maxWidth="sm"
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
            <Stack spacing={3}>
              {error && <Alert severity="error">{error}</Alert>}
              <ShakingTextField error={fieldError('name')}>
                <TextField
                  inputRef={focusName}
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
                <Box
                  sx={{
                    '& > [role="group"]': {
                      display: { sm: 'grid' },
                      gridTemplateColumns: 'repeat(13, 1fr)',
                    },
                  }}
                >
                  <ColorPickerCircle
                    ariaLabel="House color (required)"
                    initialColor={form.values.color}
                    colors={
                      house?.color &&
                      !staticColors.some(
                        (color) => color.toLowerCase() === house.color.toLowerCase()
                      )
                        ? [house.color, ...staticColors]
                        : undefined
                    }
                    disabled={form.isSubmitting}
                    invalid={fieldError('color')}
                    describedBy={fieldError('color') ? 'house-color-error' : undefined}
                    onSelect={(value) => form.setFieldValue('color', value)}
                  />
                </Box>
                {fieldError('color') && (
                  <FormHelperText error id="house-color-error">
                    {form.errors.color}
                  </FormHelperText>
                )}
              </ShakingTextField>
              <CustomUpload
                multiple={false}
                accept="image/png,image/jpeg"
                maxFileSizeMb={3}
                disabled={form.isSubmitting}
                loading={form.isSubmitting && Boolean(form.values.logoFile)}
                primaryText="Please upload your logo"
                secondaryText="PNG or JPEG · Maximum file size is 3 MB"
                dragProps={{ 'aria-label': 'House logo' }}
                value={
                  form.values.logoFile ??
                  (form.values.logoUrl
                    ? {
                        name: 'House logo',
                        filePath: form.values.logoUrl,
                        url: savedLogoPreview,
                        type: 'image/png',
                      }
                    : undefined)
                }
                error={
                  logoError ||
                  (fieldError('logoFile') ? form.errors.logoFile : undefined) ||
                  (fieldError('logoUrl') ? form.errors.logoUrl : undefined)
                }
                onReject={setLogoError}
                onChange={(file) => {
                  if (file instanceof File && !['image/png', 'image/jpeg'].includes(file.type)) {
                    setLogoError('Choose a PNG or JPEG image.');
                    return;
                  }
                  setLogoError('');
                  if (file instanceof File) form.setFieldValue('logoFile', file);
                  else form.setValues({ ...form.values, logoFile: null, logoUrl: '' });
                }}
              />
              <TextField
                fullWidth
                multiline
                minRows={4}
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
