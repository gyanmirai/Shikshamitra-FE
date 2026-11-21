import type { FormikProps } from 'formik';
import type { RenewalPlan } from 'src/redux/library/loans-api';
import type { LibraryLoan } from 'src/redux/library/circulation-types';

import { Grid } from '@mui/material';
import { GlobalIcons } from 'src/utils/icons';
import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';
import { FormSectionCard } from 'src/components/form-section-card';

import { manualRenewal } from './loan-maintenance-schema';
import { CirculationDateField } from './CirculationDateField';
import { LoanMaintenanceReason } from './LoanMaintenanceReason';

import type { RenewalValues } from './loan-maintenance-types';

export function LoanRenewalFields({
  loan,
  formik,
  disabled,
  plan,
}: {
  loan: LibraryLoan;
  formik: FormikProps<RenewalValues>;
  disabled: boolean;
  plan?: RenewalPlan;
}) {
  return (
    <FormSectionCard
      title="Renewal Details"
      icon={GlobalIcons.refresh}
      descriptionTooltip="Renewal uses the loan's saved borrowing terms. Review the current school calendar and the proposed deadline before confirming."
    >
      <Grid container spacing={2}>
        {loan.role === 1 && (
          <Grid size={12}>
            <ShakingTextField
              error={Boolean(formik.touched.academicYearId && formik.errors.academicYearId)}
            >
              <CustomSelect
                label="Renewal academic year"
                name="academicYearId"
                required
                fullWidth
                size="small"
                value={formik.values.academicYearId}
                options={loan.schoolContext?.academicYears || []}
                labelKey="name"
                valueKey="id"
                disabled={disabled}
                onChange={(value) => formik.setFieldValue('academicYearId', String(value))}
                onBlur={() => formik.setFieldTouched('academicYearId', true)}
                error={Boolean(formik.touched.academicYearId && formik.errors.academicYearId)}
                helperText={
                  formik.touched.academicYearId ? formik.errors.academicYearId : undefined
                }
              />
            </ShakingTextField>
          </Grid>
        )}
        <Grid size={{ xs: 12, sm: manualRenewal(loan) ? 6 : 12 }}>
          <CirculationDateField
            label="School renewal date"
            name="schoolRenewalDate"
            value={formik.values.schoolRenewalDate}
            disabled={disabled}
            error={formik.touched.schoolRenewalDate && formik.errors.schoolRenewalDate}
            onChange={(value) => formik.setFieldValue('schoolRenewalDate', value)}
            onBlur={() => formik.setFieldTouched('schoolRenewalDate', true)}
          />
        </Grid>
        {manualRenewal(loan) && (
          <Grid size={{ xs: 12, sm: 6 }}>
            <CirculationDateField
              label="New due date"
              name="requestedDueDate"
              value={formik.values.requestedDueDate}
              disabled={disabled}
              error={formik.touched.requestedDueDate && formik.errors.requestedDueDate}
              onChange={(value) => formik.setFieldValue('requestedDueDate', value)}
              onBlur={() => formik.setFieldTouched('requestedDueDate', true)}
            />
          </Grid>
        )}
        {plan?.requiresCalendarChangeAcknowledgment && (
          <Grid size={12}>
            <LoanMaintenanceReason
              name="calendarChangeReason"
              label="Calendar change reason"
              required
              value={formik.values.calendarChangeReason}
              disabled={disabled}
              error={formik.touched.calendarChangeReason && formik.errors.calendarChangeReason}
              onChange={(value) => formik.setFieldValue('calendarChangeReason', value)}
              onBlur={() => formik.setFieldTouched('calendarChangeReason', true)}
            />
          </Grid>
        )}
        <Grid size={12}>
          <LoanMaintenanceReason
            name="reason"
            label="Renewal reason"
            value={formik.values.reason}
            disabled={disabled}
            error={formik.touched.reason && formik.errors.reason}
            onChange={(value) => formik.setFieldValue('reason', value)}
            onBlur={() => formik.setFieldTouched('reason', true)}
          />
        </Grid>
      </Grid>
    </FormSectionCard>
  );
}
