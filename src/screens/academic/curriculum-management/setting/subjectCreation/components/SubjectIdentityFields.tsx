import type { FormikProps } from 'formik';

import { Iconify } from 'src/components/iconify';
import CustomTooltip from 'src/components/custom-tooltip';
import ShakingTextField from 'src/components/shaking-text-field';
import { Box, Grid, MenuItem, TextField, Typography } from '@mui/material';
import { LanguageInputField } from 'src/screens/academic/components/language-typing';

import {
  SUBJECT_ICONS as subjectIcons,
  SUBJECT_CATEGORIES as subjectCategories,
} from '../type';

import type { SubjectFormValues } from '../initialValues';

interface SubjectIdentityFieldsProps {
  formik: FormikProps<SubjectFormValues>;
}

export function SubjectIdentityFields({ formik }: SubjectIdentityFieldsProps) {
  return (
    <>
      <Grid size={{ xs: 12 }}>
        <Typography variant="subtitle2" fontWeight={700}>
          Basic Details
        </Typography>
      </Grid>

      <Grid size={{ xs: 12 }}>
        <ShakingTextField error={Boolean(formik.touched.subjectName && formik.errors.subjectName)}>
          <LanguageInputField
            fullWidth
            label="Subject Name *"
            name="subjectName"
            size="small"
            value={formik.values.subjectName}
            onChange={(event) => {
              const value = event.target.value
                .split(' ')
                .map((word) =>
                  word ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : ''
                )
                .join(' ');
              formik.setFieldValue('subjectName', value);
            }}
            error={formik.touched.subjectName && Boolean(formik.errors.subjectName)}
            helperText={formik.touched.subjectName && formik.errors.subjectName}
            inputProps={{ maxLength: 100 }}
          />
        </ShakingTextField>
      </Grid>

      <Grid size={{ xs: 12 }}>
        <LanguageInputField
          fullWidth
          label="Display Name"
          name="displayName"
          size="small"
          value={formik.values.displayName}
          onChange={formik.handleChange}
          error={formik.touched.displayName && Boolean(formik.errors.displayName)}
          helperText={formik.touched.displayName && formik.errors.displayName}
          inputProps={{ maxLength: 50 }}
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField
          select
          fullWidth
          label={
            <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
              Subject Category *
              <CustomTooltip
                arrow
                placement="right"
                sx={{ textAlign: 'justify' }}
                title="Grouping only. Academic rules are configured later."
              >
                <Box component="span" sx={{ display: 'inline-flex' }}>
                  <Iconify icon="lucide:info" width={14} height={14} color="info.main" />
                </Box>
              </CustomTooltip>
            </Box>
          }
          name="category"
          size="small"
          value={formik.values.category}
          onChange={formik.handleChange}
          error={formik.touched.category && Boolean(formik.errors.category)}
          helperText={formik.touched.category && formik.errors.category}
        >
          {subjectCategories.map((category) => (
            <MenuItem key={category} value={category}>
              {category}
            </MenuItem>
          ))}
        </TextField>
      </Grid>

      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField
          select
          fullWidth
          label="Subject Icon"
          name="icon"
          size="small"
          value={formik.values.icon}
          onChange={formik.handleChange}
          helperText="Optional"
        >
          <MenuItem value="">None</MenuItem>
          {subjectIcons.map((icon) => (
            <MenuItem key={icon.value} value={icon.value}>
              <Box display="flex" alignItems="center" gap={1}>
                <Iconify icon={icon.icon} width={16} height={16} />
                {icon.label}
              </Box>
            </MenuItem>
          ))}
        </TextField>
      </Grid>
    </>
  );
}
