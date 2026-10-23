import type { FormikProps } from 'formik';

import { useId } from 'react';
import { Iconify } from 'src/components/iconify';
import HelpTooltip from 'src/components/help-tooltip';
import ShakingTextField from 'src/components/shaking-text-field';
import ColorPickerCircle from 'src/components/static-color/colorPickerCircle';
import { Box, Grid, MenuItem, TextField, Typography, FormHelperText } from '@mui/material';

import type { ElectiveSubjectFormValues } from './initialValues';

interface ElectiveGroupDetailsFieldsProps {
  formik: FormikProps<ElectiveSubjectFormValues>;
}

const groupTypeOptions = [
  'Language',
  'Skill Subject',
  'Optional Subject',
  'Vocational Subject',
  'Activity Subject',
  'Stream Elective',
  'Custom',
];

export function ElectiveGroupDetailsFields({ formik }: ElectiveGroupDetailsFieldsProps) {
  const colorErrorId = useId();
  const colorError = Boolean(formik.touched.color && formik.errors.color);
  return (
    <Grid container spacing={1.5}>
      <Grid size={{ xs: 12 }}>
        <ShakingTextField error={Boolean(formik.touched.name && formik.errors.name)}>
          <TextField
            fullWidth
            label="Elective group name"
            required
            name="name"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            size="small"
            value={formik.values.name}
            error={formik.touched.name && Boolean(formik.errors.name)}
            helperText={formik.touched.name && formik.errors.name}
          />
        </ShakingTextField>
      </Grid>

      <Grid size={{ xs: 12 }}>
        <ShakingTextField error={Boolean(formik.touched.groupType && formik.errors.groupType)}>
          <TextField
            select
            fullWidth
            size="small"
            label="Group type"
            required
            name="groupType"
            value={formik.values.groupType}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.groupType && Boolean(formik.errors.groupType)}
            helperText={formik.touched.groupType && formik.errors.groupType}
          >
            {groupTypeOptions.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>
        </ShakingTextField>
      </Grid>

      <Grid size={{ xs: 12 }}>
        <ShakingTextField error={Boolean(formik.touched.color && formik.errors.color)}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 0.5 }}>
            <Typography
              variant="subtitle2"
              color={formik.touched.color && formik.errors.color ? 'error.main' : 'text.primary'}
            >
              Elective Group Color *
            </Typography>
            <HelpTooltip
              label="Elective group color information"
              arrow
              placement="right"
              title="Used throughout the system to visually identify this elective group."
            >
              <Box component="span" sx={{ display: 'inline-flex' }}>
                <Iconify icon="lucide:info" color="info.main" width={18} height={18} />
              </Box>
            </HelpTooltip>
          </Box>
          <ColorPickerCircle
            ariaLabel="Elective group color (required)"
            invalid={colorError}
            describedBy={colorError ? colorErrorId : undefined}
            onSelect={(color: string) => formik.setFieldValue('color', color)}
            initialColor={formik.values.color}
          />
          {formik.touched.color && formik.errors.color && (
            <FormHelperText id={colorErrorId} error role="alert">
              {formik.errors.color}
            </FormHelperText>
          )}
        </ShakingTextField>
      </Grid>

      <Grid size={{ xs: 12 }}>
        <TextField
          fullWidth
          multiline
          minRows={2}
          size="small"
          label="Description"
          name="description"
          value={formik.values.description}
          onChange={formik.handleChange}
        />
      </Grid>
    </Grid>
  );
}
