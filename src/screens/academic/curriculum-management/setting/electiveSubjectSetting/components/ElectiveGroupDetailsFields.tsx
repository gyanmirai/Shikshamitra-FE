import type { FormikProps } from 'formik';

import { Iconify } from 'src/components/iconify';
import CustomTooltip from 'src/components/custom-tooltip';
import ShakingTextField from 'src/components/shaking-text-field';
import { Box, Grid, MenuItem, TextField, Typography } from '@mui/material';
import ColorPickerCircle from 'src/components/static-color/colorPickerCircle';

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
  return (
    <Grid container spacing={1.5}>
      <Grid size={{ xs: 12 }}>
        <ShakingTextField error={Boolean(formik.touched.name && formik.errors.name)}>
          <TextField
            fullWidth
            label="Elective Group Name *"
            name="name"
            onChange={(event) => {
              const value = event.target.value
                .split(' ')
                .map((word) =>
                  word
                    .split('/')
                    .map((part) =>
                      part ? part.charAt(0).toUpperCase() + part.slice(1).toLowerCase() : ''
                    )
                    .join('/')
                )
                .join(' ');
              formik.setFieldValue('name', value);
            }}
            size="small"
            value={formik.values.name}
            error={formik.touched.name && Boolean(formik.errors.name)}
            helperText={formik.touched.name && formik.errors.name}
          />
        </ShakingTextField>
      </Grid>

      <Grid size={{ xs: 12 }}>
        <TextField
          select
          fullWidth
          size="small"
          label="Group Type *"
          name="groupType"
          value={formik.values.groupType}
          onChange={formik.handleChange}
          error={formik.touched.groupType && Boolean(formik.errors.groupType)}
          helperText={formik.touched.groupType && formik.errors.groupType}
        >
          {groupTypeOptions.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </TextField>
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
            <CustomTooltip
              arrow
              placement="right"
              title="Used throughout the system to visually identify this elective group."
            >
              <Box component="span" sx={{ display: 'inline-flex' }}>
                <Iconify icon="lucide:info" color="info.main" width={18} height={18} />
              </Box>
            </CustomTooltip>
          </Box>
          <ColorPickerCircle
            onSelect={(color: string) => formik.setFieldValue('color', color)}
            initialColor={formik.values.color}
          />
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
