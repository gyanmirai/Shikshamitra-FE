import type { Standards } from 'src/types/school';

import React from 'react';
import { Box, Grid, TextField } from '@mui/material';

interface ClassSetupProps {
  values: {
    class: Standards;
  };
  errors: any;
  touched: any;
  handleChange: (e: React.ChangeEvent<any>) => void;
  handleBlur: (e: React.FocusEvent<any>) => void;
  setFieldValue: (field: string, value: any) => void;
}

const ClassSetup: React.FC<ClassSetupProps> = ({
  values,
  errors,
  touched,
  handleChange,
  handleBlur,
  setFieldValue,
}) => (
  <Box sx={{ mt: 2, width: '100%' }}>
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, md: 4 }}>
        <TextField
          fullWidth
          name="class.name"
          label="Class Name"
          value={values.class.name}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.class?.name && Boolean(errors.class?.name)}
          helperText={touched.class?.name && errors.class?.name}
        />
      </Grid>
    </Grid>
  </Box>
);

export default ClassSetup;
