import React from 'react';
import { Box, Grid, TextField } from '@mui/material';

interface Medium {
  name: string;
  code: string;
  description?: string;
}

interface EducationMediumSetupProps {
  values: {
    medium: Medium;
  };
  errors: any;
  touched: any;
  handleChange: (e: React.ChangeEvent<any>) => void;
  handleBlur: (e: React.FocusEvent<any>) => void;
  setFieldValue: (field: string, value: any) => void;
}

const EducationMediumSetup: React.FC<EducationMediumSetupProps> = ({
  values,
  errors,
  touched,
  handleChange,
  handleBlur,
  setFieldValue,
}) => (
  <Box sx={{ mt: 2, width: '100%' }}>
    <Grid container spacing={2}>
      <Grid size={{ xs: 6, md: 4 }}>
        <TextField
          size="small"
          fullWidth
          name="medium.name"
          label="Medium Name"
          value={values.medium.name}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched?.medium?.name && Boolean(errors?.medium?.name)}
          helperText={touched?.medium?.name && errors?.medium?.name}
        />
      </Grid>
    </Grid>
  </Box>
);

export default EducationMediumSetup;
