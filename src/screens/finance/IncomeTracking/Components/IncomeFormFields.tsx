import type { Dayjs } from 'dayjs';
import type { FormikProps } from 'formik';

import dayjs from 'dayjs';
import { DatePicker } from '@mui/x-date-pickers';
import { Iconify } from 'src/components/iconify';
import React from 'react';
import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';
import NumericFormatCustom from 'src/components/custom-numeric-format';
import {
  Grid,
  Accordion,
  TextField,
  Typography,
  AccordionDetails,
  AccordionSummary,
} from '@mui/material';

import type { IIncomeFormValues } from '../types';

interface IncomeFormFieldsProps {
  formik: FormikProps<IIncomeFormValues>;
  incomeCategoryOptions: any[];
  paymentMethodOptions: { value: number; label: string }[];
  currentYear: { startDate: string; endDate: string } | null;
  incomeOptionsLoading: boolean;
  expandedPanels: Record<string, boolean>;
  onAccordionToggle: (panel: string) => void;
}

const IncomeFormFields: React.FC<IncomeFormFieldsProps> = ({
  formik,
  incomeCategoryOptions,
  paymentMethodOptions,
  currentYear,
  incomeOptionsLoading,
  expandedPanels,
  onAccordionToggle,
}) => {
  return (
    <>
      {/* Section: Income Details */}
      <Accordion
        expanded={expandedPanels.incomeDetails}
        onChange={() => onAccordionToggle('incomeDetails')}
        disableGutters
        elevation={0}
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: '8px !important',
          mb: 1.5,
          '&:before': { display: 'none' },
        }}
      >
        <AccordionSummary expandIcon={<Iconify icon="mdi:chevron-down" />}>
          <Typography variant="subtitle2" fontWeight={700}>
            Income Details
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3}>
            {/* Income Category */}
            <Grid size={{ xs: 12, md: 6 }}>
              <ShakingTextField error={!!(formik.touched.categoryId && formik.errors.categoryId)}>
                <CustomSelect
                  label="Income Category *"
                  options={incomeCategoryOptions || []}
                  value={formik.values.categoryId}
                  isLoading={incomeOptionsLoading}
                  onChange={(val: any) => {
                    formik.setFieldValue('categoryId', val);
                    formik.setFieldValue('categoryTags', []);
                    formik.setFieldTouched('categoryId', false);
                  }}
                  labelKey="name"
                  valueKey="id"
                  error={!!(formik.touched.categoryId && formik.errors.categoryId)}
                  helperText={(formik.touched.categoryId && formik.errors.categoryId) as string}
                  formControlProps={{ fullWidth: true }}
                />
              </ShakingTextField>
            </Grid>

            {/* Income Name */}
            <Grid size={{ xs: 12, md: 6 }}>
              <ShakingTextField error={!!(formik.touched.name && formik.errors.name)}>
                <TextField
                  fullWidth
                  size="small"
                  label="Income Name *"
                  name="name"
                  value={formik.values.name}
                  onChange={(e) => {
                    const value = e.target.value
                      .replace(/[^a-zA-Z0-9\s]/g, '')
                      .split(' ')
                      .map((word) =>
                        word ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : ''
                      )
                      .join(' ');
                    formik.setFieldValue('name', value);
                  }}
                  error={!!(formik.touched.name && formik.errors.name)}
                  helperText={formik.touched.name && formik.errors.name}
                />
              </ShakingTextField>
            </Grid>

            {/* Amount */}
            <Grid size={{ xs: 12, md: 6 }}>
              <ShakingTextField error={!!(formik.touched.amount && formik.errors.amount)}>
                <NumericFormatCustom
                  size="small"
                  fullWidth
                  label="Amount *"
                  name="amount"
                  value={formik.values.amount || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    let val = e.target.value;
                    val = val.replace(/[₹,\s]/g, '');
                    formik.setFieldValue('amount', Number(val));
                  }}
                  error={!!(formik.touched.amount && formik.errors.amount)}
                  helperText={formik.touched.amount && formik.errors.amount}
                  sx={{
                    width: '100%',
                    padding: '0',
                    borderRadius: 1,
                  }}
                />
              </ShakingTextField>
            </Grid>

            {/* Payment Method */}
            <Grid size={{ xs: 12, md: 6 }}>
              <ShakingTextField
                error={!!(formik.touched.paymentMethod && formik.errors.paymentMethod)}
              >
                <CustomSelect
                  label="Payment Method *"
                  options={paymentMethodOptions}
                  value={formik.values.paymentMethod}
                  onChange={(val: any) => {
                    formik.setFieldValue('paymentMethod', val);
                  }}
                  labelKey="label"
                  valueKey="value"
                  error={!!(formik.touched.paymentMethod && formik.errors.paymentMethod)}
                  helperText={
                    (formik.touched.paymentMethod && formik.errors.paymentMethod) as string
                  }
                  formControlProps={{ fullWidth: true }}
                />
              </ShakingTextField>
            </Grid>

            {/* Payment Date */}
            <Grid size={{ xs: 12, md: 6 }}>
              <ShakingTextField error={!!(formik.touched.paymentDate && formik.errors.paymentDate)}>
                <DatePicker
                  label="Payment Date *"
                  value={formik.values.paymentDate}
                  onChange={(newValue: Dayjs | null) =>
                    formik.setFieldValue('paymentDate', newValue)
                  }
                  minDate={currentYear ? dayjs(currentYear.startDate) : undefined}
                  maxDate={currentYear ? dayjs(currentYear.endDate) : undefined}
                  format="DD/MM/YYYY"
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: 'small',
                      error: !!(formik.touched.paymentDate && formik.errors.paymentDate),
                      helperText: (formik.touched.paymentDate &&
                        formik.errors.paymentDate) as string,
                    },
                  }}
                />
              </ShakingTextField>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Section: Additional Notes */}
      <Accordion
        expanded={expandedPanels.additionalNotes}
        onChange={() => onAccordionToggle('additionalNotes')}
        disableGutters
        elevation={0}
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: '8px !important',
          mb: 1.5,
          '&:before': { display: 'none' },
        }}
      >
        <AccordionSummary expandIcon={<Iconify icon="mdi:chevron-down" />}>
          <Typography variant="subtitle2" fontWeight={700}>
            Additional Notes
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <TextField
            fullWidth
            multiline
            minRows={3}
            label="Notes"
            name="notes"
            value={formik.values.notes}
            onChange={formik.handleChange}
          />
        </AccordionDetails>
      </Accordion>
    </>
  );
};

/**
 * Memoization Justification:
 * This component renders many fields. We want to avoid re-rendering
 * if props (formik state passed down, options) are stable.
 * Note: Formik changes on every keystroke, so this might still re-render often
 * unless we use FastField or equivalent, but React.memo helps if parent state changes
 * unrelated to formik.
 */
export default React.memo(IncomeFormFields);
