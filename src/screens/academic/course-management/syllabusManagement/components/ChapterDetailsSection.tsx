import type { FormikProps } from 'formik';

import dayjs from 'dayjs';
import { Iconify } from 'src/components/iconify';
import { Grid, Stack, InputAdornment } from '@mui/material';
import ShakingTextField from 'src/components/shaking-text-field';
import { FormSectionCard } from 'src/components/form-section-card';
import { CustomDateRangePicker } from 'src/components/custom-date-range-picker';
import { LanguageInputField } from 'src/screens/academic/components/language-typing';

import { ChapterNumberField } from './ChapterNumberField';
import { ChapterPublicationSection } from './ChapterPublicationSection';
import { AdditionalFieldsActionButton } from './AdditionalFieldsActionButton';

import type { IChapterFormValues } from '../type';

interface ChapterDetailsSectionProps {
  formik: FormikProps<IChapterFormValues>;
  isEditing: boolean;
  academicYearStart?: string | null;
  academicYearEnd?: string | null;
  additionalFieldsCount: number;
  onOpenAdditionalFields: () => void;
}

export function ChapterDetailsSection({
  formik,
  isEditing,
  academicYearStart,
  academicYearEnd,
  additionalFieldsCount,
  onOpenAdditionalFields,
}: ChapterDetailsSectionProps) {
  const startDateError =
    formik.touched.startDate || Boolean(formik.values.startDate)
      ? formik.errors.startDate
      : undefined;
  const endDateError =
    formik.touched.endDate || Boolean(formik.values.endDate) ? formik.errors.endDate : undefined;
  const dateError = startDateError || endDateError;
  const dateHelperText =
    dateError ||
    (academicYearStart && academicYearEnd
      ? `Choose dates within ${dayjs(academicYearStart).format('DD/MM/YYYY')} – ${dayjs(academicYearEnd).format('DD/MM/YYYY')}`
      : 'Choose the expected teaching start and end dates.');

  return (
    <Stack spacing={1.5} mb={2.5}>
      <FormSectionCard
        icon="mdi:book-open-page-variant-outline"
        title="Chapter details"
        description="Enter the chapter identity and its expected teaching window."
      >
        <Grid container spacing={1.5}>
          <Grid size={{ xs: 12, md: 6 }}>
            <ChapterNumberField
              value={formik.values.chapterNo}
              error={formik.touched.chapterNo ? formik.errors.chapterNo : undefined}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <ShakingTextField
              error={Boolean(formik.touched.chapterName && formik.errors.chapterName)}
            >
              <LanguageInputField
                fullWidth
                label="Chapter Name *"
                name="chapterName"
                placeholder="e.g. Introduction to Algebra"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Iconify
                        icon="mdi:book-open-variant"
                        width={15}
                        sx={{ color: 'text.disabled' }}
                      />
                    </InputAdornment>
                  ),
                }}
                value={formik.values.chapterName}
                onChange={(event) => formik.setFieldValue('chapterName', event.target.value)}
                size="small"
                error={Boolean(formik.touched.chapterName && formik.errors.chapterName)}
                helperText={formik.touched.chapterName && formik.errors.chapterName}
              />
            </ShakingTextField>
          </Grid>

          <Grid size={12}>
            <ShakingTextField error={Boolean(dateError)}>
              <CustomDateRangePicker
                required
                label="Expected teaching dates"
                title="Select expected teaching dates"
                value={[formik.values.startDate, formik.values.endDate]}
                dateFormat="DD/MM/YYYY"
                minDate={academicYearStart ? dayjs(academicYearStart) : undefined}
                maxDate={academicYearEnd ? dayjs(academicYearEnd) : undefined}
                disablePast={!isEditing}
                error={Boolean(dateError)}
                helperText={dateHelperText}
                onChange={([startDate, endDate]) => {
                  formik.setFieldValue('startDate', startDate);
                  formik.setFieldValue('endDate', endDate);
                  formik.setFieldTouched('startDate', true, false);
                  formik.setFieldTouched('endDate', true, false);
                }}
              />
            </ShakingTextField>
          </Grid>
        </Grid>
      </FormSectionCard>

      <ChapterPublicationSection formik={formik} />

      <FormSectionCard
        icon="mdi:text-box-plus-outline"
        title="Additional chapter details"
        descriptionTooltip="Add planning, learning outcomes, resources, notes, and assessment details."
        action={
          <AdditionalFieldsActionButton
            configuredCount={additionalFieldsCount}
            onClick={onOpenAdditionalFields}
          />
        }
      />
    </Stack>
  );
}
