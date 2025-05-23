import type { Organization } from 'src/types/school';

import React from 'react';
import * as Yup from 'yup';

import { Box, Grid, TextField } from '@mui/material';

interface OrganizationValues {
  name: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
}

const validationSchema = Yup.object().shape({
  name: Yup.string().required('Organization name is required'),
  address: Yup.string().required('Address is required'),
  phone: Yup.string().required('Phone number is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  website: Yup.string().url('Invalid URL'),
});

interface IOrganizationSetupProps {
  values: {
    organization: Organization;
  };
  errors: any;
  touched: any;
  handleChange: (e: React.ChangeEvent<any>) => void;
  handleBlur: (e: React.FocusEvent<any>) => void;
  setFieldValue: (field: string, value: any) => void;
}

const OrganizationSetup: React.FC<IOrganizationSetupProps> = (props: IOrganizationSetupProps) => {
  const { values, errors, touched, handleChange, handleBlur, setFieldValue } = props;

  return (
    <Box sx={{ mt: 2, width: '100%' }}>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <TextField
            size="small"
            name="name"
            label="Organization Name"
            value={values.organization.name}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.organization?.name && Boolean(errors.organization?.name)}
            helperText={touched.organization?.name && errors.organization?.name}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default OrganizationSetup;
