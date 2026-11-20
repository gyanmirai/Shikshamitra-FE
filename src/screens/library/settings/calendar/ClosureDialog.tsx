import type { LibraryNamedOption } from 'src/redux/library/policy-types';
import type { LibraryCalendarClosure } from 'src/redux/library/calendar-types';

import { LoadingButton } from '@mui/lab';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';
import { FormSectionCard } from 'src/components/form-section-card';
import { useUnsavedNavigation } from 'src/hooks/use-unsaved-navigation';
import { Grid, Alert, Button, TextField, DialogActions } from '@mui/material';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';

import { useClosureEditor } from './useClosureEditor';
import { CalendarDateField } from './CalendarDateField';

export function ClosureDialog({
  academicYearId,
  item,
  sections,
  onClose,
}: {
  academicYearId: string;
  item?: LibraryCalendarClosure;
  sections: LibraryNamedOption[];
  onClose: () => void;
}) {
  const { formik, error } = useClosureEditor(academicYearId, onClose, item);
  const guard = useUnsavedNavigation(formik.dirty, {
    blockNavigation: formik.isSubmitting,
    guardContextChanges: true,
    onNavigationApproved: onClose,
  });
  const close = () => guard.requestNavigation(onClose);
  return (
    <>
      <CustomDialog
        open
        maxWidth="sm"
        title={item ? 'Edit Library Closure' : 'Create Library Closure'}
        titleInfo="Closure dates are inclusive in the Library timezone. Section-specific closures affect calculations for that section."
        handleClose={close}
        disableClose={formik.isSubmitting}
        disableEscapeKeyDown={formik.isSubmitting}
        guardUnsavedChanges={false}
        formProps={{
          onSubmit: (event) => {
            event.preventDefault();
            formik.submitForm();
          },
        }}
      >
        <DialogScrollContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <FormSectionCard
            title="Closure Details"
            icon={GlobalIcons.calendar}
            descriptionTooltip="For example, enter the first and last day of a school holiday. Leave the section as All for a Library-wide closure."
          >
            <Grid container spacing={2}>
              {(['fromDate', 'toDate'] as const).map((name) => (
                <Grid size={{ xs: 12, sm: 6 }} key={name}>
                  <CalendarDateField
                    name={name}
                    label={name === 'fromDate' ? 'Closed from' : 'Closed through'}
                    value={formik.values[name]}
                    error={formik.touched[name] && formik.errors[name]}
                    disabled={formik.isSubmitting}
                    onBlur={formik.handleBlur}
                    onChange={(value) => formik.setFieldValue(name, value)}
                  />
                </Grid>
              ))}
              <Grid size={12}>
                <CustomSelect
                  label="Library section"
                  value={formik.values.sectionId}
                  fullWidth
                  size="small"
                  options={[{ id: '', name: 'All' }, ...sections]}
                  labelKey="name"
                  valueKey="id"
                  isSearch
                  disabled={formik.isSubmitting}
                  onChange={(value) => formik.setFieldValue('sectionId', value)}
                />
              </Grid>
              <Grid size={12}>
                <ShakingTextField error={Boolean(formik.touched.reason && formik.errors.reason)}>
                  <TextField
                    label="Reason"
                    name="reason"
                    required
                    fullWidth
                    size="small"
                    multiline
                    minRows={2}
                    value={formik.values.reason}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    disabled={formik.isSubmitting}
                    error={Boolean(formik.touched.reason && formik.errors.reason)}
                    helperText={formik.touched.reason && formik.errors.reason}
                  />
                </ShakingTextField>
              </Grid>
            </Grid>
          </FormSectionCard>
        </DialogScrollContent>
        <DialogActions>
          <Button
            type="button"
            size="small"
            variant="outlined"
            color="inherit"
            disabled={formik.isSubmitting}
            startIcon={<Iconify icon={GlobalIcons.cancel} />}
            onClick={close}
          >
            Cancel
          </Button>
          <LoadingButton
            type="submit"
            size="small"
            variant="contained"
            color="inherit"
            loading={formik.isSubmitting}
            disabled={!formik.dirty}
            startIcon={<Iconify icon={GlobalIcons.submit} />}
          >
            Submit
          </LoadingButton>
        </DialogActions>
      </CustomDialog>
      {guard.confirmation}
    </>
  );
}
