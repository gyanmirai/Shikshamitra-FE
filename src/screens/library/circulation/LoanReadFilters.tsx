import { useFormik } from 'formik';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import { Box, Grid, Stack, Button } from '@mui/material';

import { schoolDate } from './school-date';
import { loanAsOfDate } from './loan-read-query';
import { useLoanYearChoices } from './useLoanYearChoices';
import { CirculationDateField } from './CirculationDateField';
import { loanFilterSchema, initialLoanFilters } from './loan-filter-form';

export function LoanReadFilters({
  academicYearId,
  asOfDate,
  onApply,
  disabled = false,
}: {
  academicYearId: string;
  asOfDate: string;
  onApply: (year: string, date: string) => void;
  disabled?: boolean;
}) {
  const options = useLoanYearChoices(academicYearId);
  const formik = useFormik({
    initialValues: initialLoanFilters(academicYearId, asOfDate),
    enableReinitialize: true,
    validationSchema: loanFilterSchema,
    validateOnMount: true,
    onSubmit: (values) => onApply(values.academicYearId, schoolDate(values.asOfDate) || ''),
  });
  const showError = Boolean(
    formik.touched.asOfDate || formik.submitCount || loanAsOfDate(asOfDate) === null
  );
  return (
    <Box
      component="form"
      aria-label="Borrowing record filters"
      onSubmit={formik.handleSubmit}
      sx={{ px: 1, py: 1, flexShrink: 0 }}
    >
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <CustomSelect
            label="Recorded loan year"
            name="academicYearId"
            fullWidth
            size="small"
            value={formik.values.academicYearId || 'all'}
            options={options}
            labelKey="name"
            valueKey="id"
            disabled={disabled}
            onChange={(value) =>
              formik.setFieldValue('academicYearId', value === 'all' ? '' : String(value))
            }
            helperText="The saved loan year is independent of the current context. All authorized recorded years are shown by default."
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <CirculationDateField
            label="School as-of date"
            name="asOfDate"
            required={false}
            value={formik.values.asOfDate}
            disabled={disabled}
            onChange={(value) => formik.setFieldValue('asOfDate', value)}
            onBlur={() => formik.setFieldTouched('asOfDate', true)}
            error={showError && formik.errors.asOfDate}
            helperText="Leave empty to use the confirmed Library clock. Unconfirmed due dates remain unclassified."
          />
        </Grid>
      </Grid>
      <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mt: 1 }}>
        <Button
          type="button"
          size="small"
          color="inherit"
          variant="outlined"
          disabled={disabled || (!academicYearId && !asOfDate)}
          startIcon={<Iconify icon={GlobalIcons.resetFilter} />}
          onClick={() => onApply('', '')}
        >
          Clear filters
        </Button>
        <Button
          type="submit"
          size="small"
          color="inherit"
          variant="contained"
          disabled={disabled || !formik.dirty || !formik.isValid}
          startIcon={<Iconify icon={GlobalIcons.applyFilter} />}
        >
          Apply filters
        </Button>
      </Stack>
    </Box>
  );
}
