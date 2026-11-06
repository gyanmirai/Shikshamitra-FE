import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import CustomUpload from 'src/components/custom-upload';
import { FormBusyRegion } from 'src/components/form-busy-region';
import ShakingTextField from 'src/components/shaking-text-field';
import { FormSectionCard } from 'src/components/form-section-card';
import ColorPickerCircle from 'src/components/static-color/colorPickerCircle';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { Stack, Button, TextField, FormLabel, FormControl, DialogActions } from '@mui/material';

import { useHouseSettingsForm } from './use-house-settings-form';

import type { HouseSettingsFormProps } from './use-house-settings-form';

export default function HouseSettingsForm({ record, mediumId, onClose }: HouseSettingsFormProps) {
  const { form, busy, canWrite, close, confirmation } = useHouseSettingsForm({
    record,
    mediumId,
    onClose,
  });
  return (
    <>
      <CustomDialog
        open
        title={record ? 'Edit House' : 'Add House'}
        titleInfo="Set the house name, color, optional logo and description for this academic medium."
        handleClose={close}
        disableClose={busy}
        guardUnsavedChanges={false}
        formProps={{
          onSubmit: (event) => {
            event.preventDefault();
            form.submitForm();
          },
          noValidate: true,
        }}
      >
        <DialogScrollContent>
          <FormBusyRegion busy={busy}>
            <FormSectionCard
              title="House Details"
              icon={GlobalIcons.admissionDetails}
              descriptionTooltip="These details identify the house when assigning students and reviewing house records."
            >
              <Stack spacing={2}>
                <ShakingTextField error={Boolean(form.touched.name && form.errors.name)}>
                  <TextField
                    label="House name"
                    name="name"
                    required
                    fullWidth
                    size="small"
                    value={form.values.name}
                    onChange={form.handleChange}
                    onBlur={form.handleBlur}
                    error={Boolean(form.touched.name && form.errors.name)}
                    helperText={form.touched.name && form.errors.name}
                  />
                </ShakingTextField>
                <FormControl required>
                  <FormLabel>House color</FormLabel>
                  <ColorPickerCircle
                    initialColor={form.values.color}
                    onSelect={(color) => form.setFieldValue('color', color)}
                  />
                </FormControl>
                <CustomUpload
                  multiple={false}
                  value={form.values.logoUrl ?? undefined}
                  onChange={(value) => form.setFieldValue('logoUrl', value)}
                  primaryText="Upload house logo"
                  secondaryText="Maximum file size is 3 MB"
                  maxFileSizeMb={3}
                />
                <TextField
                  label="Description"
                  name="description"
                  fullWidth
                  size="small"
                  multiline
                  minRows={3}
                  value={form.values.description}
                  onChange={form.handleChange}
                  onBlur={form.handleBlur}
                />
              </Stack>
            </FormSectionCard>
          </FormBusyRegion>
        </DialogScrollContent>
        <DialogActions>
          <Button
            type="button"
            variant="outlined"
            color="inherit"
            startIcon={<Iconify icon={GlobalIcons.cancel} />}
            disabled={busy}
            onClick={close}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="inherit"
            startIcon={<Iconify icon={GlobalIcons.submit} />}
            loading={busy}
            disabled={busy || !canWrite}
          >
            Submit
          </Button>
        </DialogActions>
      </CustomDialog>
      {confirmation}
    </>
  );
}
