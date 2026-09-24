import type { FormikProps } from 'formik';

import { Iconify } from 'src/components/iconify';
import CustomTooltip from 'src/components/custom-tooltip';
import { Box, Grid, Alert, Typography } from '@mui/material';
import ShakingTextField from 'src/components/shaking-text-field';
import ColorPickerCircle from 'src/components/static-color/colorPickerCircle';
import { LanguageInputField } from 'src/screens/academic/components/language-typing';

import type { SubjectFormValues } from '../initialValues';

interface SubjectConfigurationFieldsProps {
  formik: FormikProps<SubjectFormValues>;
  isUsed: boolean;
}

export function SubjectConfigurationFields({ formik, isUsed }: SubjectConfigurationFieldsProps) {
  return (
    <>
      <Grid size={{ xs: 12 }}>
        <ShakingTextField
          error={Boolean(formik.touched.subjectColor && formik.errors.subjectColor)}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 0.5 }}>
            <Typography
              variant="subtitle2"
              color={
                formik.touched.subjectColor && formik.errors.subjectColor
                  ? 'error.main'
                  : 'text.primary'
              }
            >
              Subject Color *
            </Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title="This subject color is used throughout the system to visually identify this subject."
            >
              <Box component="span" sx={{ display: 'inline-flex' }}>
                <Iconify
                  icon="lucide:info"
                  sx={{ cursor: 'pointer' }}
                  color="info.main"
                  width={18}
                  height={18}
                />
              </Box>
            </CustomTooltip>
          </Box>
          <ColorPickerCircle
            onSelect={(color: string) => formik.setFieldValue('subjectColor', color)}
            initialColor={formik.values.subjectColor}
          />
        </ShakingTextField>
      </Grid>

      <Grid size={{ xs: 12 }}>
        <LanguageInputField
          fullWidth
          multiline
          minRows={2}
          label="Description"
          name="description"
          size="small"
          value={formik.values.description}
          onChange={formik.handleChange}
          error={formik.touched.description && Boolean(formik.errors.description)}
          helperText={formik.touched.description && formik.errors.description}
          inputProps={{ maxLength: 500 }}
        />
      </Grid>

      {/* <Grid size={{ xs: 12 }}>
        <Typography variant="subtitle2" fontWeight={700}>
          Settings
        </Typography>
      </Grid>

      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField
          fullWidth
          type="number"
          label="Sort Order"
          name="sortOrder"
          size="small"
          value={formik.values.sortOrder}
          onChange={formik.handleChange}
          error={formik.touched.sortOrder && Boolean(formik.errors.sortOrder)}
          helperText={formik.touched.sortOrder && formik.errors.sortOrder}
          inputProps={{ min: 1, max: 999999 }}
        />
      </Grid> */}

      {isUsed && (
        <Grid size={{ xs: 12 }}>
          <Alert severity="warning">
            This subject is already used in academic modules. Major changes may affect existing
            records.
          </Alert>
        </Grid>
      )}
    </>
  );
}
