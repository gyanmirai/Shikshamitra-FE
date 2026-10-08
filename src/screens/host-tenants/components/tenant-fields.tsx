import type { FormikProps } from 'formik';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Tooltip from '@mui/material/Tooltip';
import TextField from '@mui/material/TextField';
import { Iconify } from 'src/components/iconify';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import type { TenantFormValues } from '../services/tenant-form';

type Field = {
  name: keyof TenantFormValues;
  label: string;
  max: number;
  optional?: boolean;
  type?: string;
};
const groups: { title: string; help: string; fields: Field[] }[] = [
  {
    title: 'Institute details',
    help: 'Enter the school’s login code and official contact details.',
    fields: [
      { name: 'name', label: 'School code', max: 64 },
      { name: 'instituteName', label: 'Institute name', max: 256 },
      { name: 'email', label: 'Institute email', max: 256, type: 'email' },
      { name: 'contactNumber', label: 'Contact number', max: 32, type: 'tel' },
    ],
  },
  {
    title: 'Address',
    help: 'Enter the school’s postal address. Address lines 2 and 3 are optional.',
    fields: [
      { name: 'address1', label: 'Address line 1', max: 256 },
      { name: 'address2', label: 'Address line 2', max: 256, optional: true },
      { name: 'address3', label: 'Address line 3', max: 256, optional: true },
      { name: 'city', label: 'City', max: 128 },
      { name: 'state', label: 'State', max: 128 },
      { name: 'country', label: 'Country', max: 128 },
      { name: 'postalCode', label: 'Postal code', max: 20 },
    ],
  },
  {
    title: 'Initial school administrator',
    help: 'Creates the school’s first administrator. Share the initial password securely.',
    fields: [
      { name: 'adminEmailAddress', label: 'Administrator email', max: 256, type: 'email' },
      { name: 'adminPassword', label: 'Initial password', max: 128, type: 'password' },
    ],
  },
];
export default function TenantFields({
  formik,
  creating,
  disabled,
}: {
  formik: FormikProps<TenantFormValues>;
  creating: boolean;
  disabled: boolean;
}) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {groups
        .filter((group) => creating || group.title !== 'Initial school administrator')
        .map((group) => (
          <Box key={group.title}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Iconify icon="solar:document-text-outline" sx={{ color: 'text.secondary' }} />
              <Typography variant="subtitle2">{group.title}</Typography>
              <Tooltip title={group.help}>
                <IconButton size="small" aria-label={`About ${group.title}`}>
                  <Iconify icon="solar:info-circle-outline" sx={{ color: 'info.main' }} />
                </IconButton>
              </Tooltip>
            </Box>
            <Grid container spacing={1}>
              {group.fields.map((field) => (
                <Grid key={field.name} size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    size="small"
                    required={!field.optional}
                    label={field.label}
                    name={field.name}
                    id={`tenant-field-${field.name}`}
                    autoFocus={field.name === (creating ? 'name' : 'instituteName')}
                    type={field.type || 'text'}
                    autoComplete={field.type === 'password' ? 'new-password' : 'off'}
                    value={formik.values[field.name]}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    disabled={disabled || (!creating && field.name === 'name')}
                    error={Boolean(formik.touched[field.name] && formik.errors[field.name])}
                    helperText={
                      (formik.touched[field.name] && formik.errors[field.name]) ||
                      (field.name === 'name'
                        ? 'Used to select the school at login. It cannot be changed later.'
                        : field.name === 'adminPassword'
                          ? 'At least 8 characters; the server password policy also applies.'
                          : undefined)
                    }
                    slotProps={{ htmlInput: { maxLength: field.max } }}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
        ))}
    </Box>
  );
}
