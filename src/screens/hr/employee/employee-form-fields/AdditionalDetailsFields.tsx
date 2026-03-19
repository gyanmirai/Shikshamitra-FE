import ShakingTextField from 'src/components/shaking-text-field';
import {
  Box,
  Grid,
  Switch,
  Select,
  MenuItem,
  TextField,
  InputLabel,
  FormControl,
  FormHelperText,
  FormControlLabel,
} from '@mui/material';

import { SectionCard } from './InformationFields';

import type { FieldsType } from './types';

const AdditionalDetailsAllFields = ({ formik }: any) => (
  <Box>
    <SectionCard title="Additional Details">
      <Grid size={{ xs: 12, sm: 6, md: 6, lg: 4 }}>
        <ShakingTextField error={formik.touched.bplCardNo && Boolean(formik.errors.bplCardNo)}>
          <TextField
            fullWidth
            size="small"
            label="BPL Card No."
            {...formik.getFieldProps('bplCardNo')}
            error={formik.touched.bplCardNo && Boolean(formik.errors.bplCardNo)}
            helperText={formik.touched.bplCardNo && formik.errors.bplCardNo}
          />
        </ShakingTextField>
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 6, lg: 4 }}>
        <ShakingTextField
          error={formik.touched.personWithDisability && Boolean(formik.errors.personWithDisability)}
        >
          <FormControl
            fullWidth
            size="small"
            error={
              formik.touched.personWithDisability && Boolean(formik.errors.personWithDisability)
            }
          >
            <InputLabel>Person with Disability</InputLabel>
            <Select
              label="Person with Disability"
              {...formik.getFieldProps('personWithDisability')}
            >
              <MenuItem value="Yes">Yes</MenuItem>
              <MenuItem value="No">No</MenuItem>
            </Select>
            {formik.touched.personWithDisability && formik.errors.personWithDisability && (
              <FormHelperText>{formik.errors.personWithDisability}</FormHelperText>
            )}
          </FormControl>
        </ShakingTextField>
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 6, lg: 4 }}>
        <ShakingTextField
          error={formik.touched.secondLanguage && Boolean(formik.errors.secondLanguage)}
        >
          <TextField
            fullWidth
            size="small"
            label="Second Language"
            {...formik.getFieldProps('secondLanguage')}
            onChange={(e) => {
              const val = e.target.value;
              const newName = val ? val.charAt(0).toUpperCase() + val.slice(1) : '';
              if (/^[A-Za-z ]*$/.test(newName)) {
                formik.setFieldValue('secondLanguage', newName);
              }
            }}
            error={formik.touched.secondLanguage && Boolean(formik.errors.secondLanguage)}
            helperText={formik.touched.secondLanguage && formik.errors.secondLanguage}
          />
        </ShakingTextField>
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 6, lg: 4 }}>
        <FormControlLabel
          control={
            <Switch
              checked={formik.values.libraryMember}
              onChange={(e, val) => formik.setFieldValue('libraryMember', val)}
              name="libraryMember"
            />
          }
          label="Library Member?"
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 6, lg: 4 }}>
        <FormControlLabel
          control={
            <Switch
              checked={formik.values.transportMember}
              onChange={(e, val) => formik.setFieldValue('transportMember', val)}
              name="transportMember"
            />
          }
          label="Transport Member?"
        />
      </Grid>
    </SectionCard>
  </Box>
);

export const AdditionalDetailsFields: FieldsType[] = [
  {
    type: 'text',
    label: ' ',
    name: ' ',
    gridProps: { size: { xs: 12, md: 12 } },
    renderComp: (props) => <AdditionalDetailsAllFields {...props} />,
  },
];
