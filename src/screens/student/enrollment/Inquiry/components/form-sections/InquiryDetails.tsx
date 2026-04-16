import type { FormikProps } from 'formik';

import { DatePicker } from '@mui/x-date-pickers';
import CustomSelect from 'src/components/custom-select';
// Components
import ShakingTextField from 'src/components/shaking-text-field';
import { Card, Grid, Divider, Skeleton, Typography } from '@mui/material';

import type { IInquiryFormValues } from '../../type';

interface InquiryDetailsProps {
  formik: FormikProps<IInquiryFormValues>;
  data: {
    inquiryPreference: any;
  };
  loading: {
    inquiryPrefrenceLoading: boolean;
    isGetLoading: boolean;
  };
  actions: {
    dialog: { onTrue: () => void };
  };
}

export const InquiryDetails = ({ formik, data, loading, actions }: InquiryDetailsProps) => {
  const { values, touched, errors, setFieldValue, setFieldTouched } = formik;
  const { inquiryPreference } = data;
  const { inquiryPrefrenceLoading, isGetLoading } = loading;

  if (isGetLoading) {
    return (
      <Card sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Typography variant="h6" fontWeight={600} color="text.primary">
          Inquiry Details
        </Typography>
        <Divider sx={{ my: 2, borderStyle: 'dashed' }} />
        <Grid container spacing={2.5}>
          {[1, 2].map((item) => (
            <Grid size={{ xs: 12, md: 6 }} key={item}>
              <Skeleton variant="rectangular" height={40} sx={{ borderRadius: 1 }} />
            </Grid>
          ))}
        </Grid>
      </Card>
    );
  }

  return (
    <Card
      sx={{
        p: 3,
        mb: 3,
        borderRadius: 2,
        boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.08)',
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Typography variant="h6" fontWeight={600} color="text.primary">
        Inquiry Details
      </Typography>
      <Divider sx={{ my: 2, borderStyle: 'dashed', borderColor: 'divider' }} />

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, md: 6 }}>
          <ShakingTextField error={!!(touched.dateOfInquiry && errors.dateOfInquiry)}>
            <DatePicker
              label="Date of Inquiry"
              name="dateOfInquiry"
              value={values.dateOfInquiry}
              format="DD-MM-YYYY"
              disablePast
              onChange={(newValue) => {
                setFieldValue('dateOfInquiry', newValue);
                setFieldTouched('dateOfInquiry', true);
              }}
              slotProps={{
                textField: {
                  size: 'small',
                  fullWidth: true,
                  helperText: touched.dateOfInquiry && (errors.dateOfInquiry as string),
                  error: touched.dateOfInquiry && Boolean(errors.dateOfInquiry),
                },
              }}
            />
          </ShakingTextField>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <CustomSelect
            label="Inquiry Preference"
            name="inquiryPreferences"
            isLoading={inquiryPrefrenceLoading}
            options={inquiryPreference?.items || []}
            value={values.inquiryPreferences}
            labelKey="preferenceName"
            valueKey="id"
            onChange={(value) => {
              setFieldValue('inquiryPreferences', value);
              setFieldTouched('inquiryPreferences', true);
            }}
            formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
            addOtherItemOnClick={actions.dialog.onTrue}
          />
        </Grid>
      </Grid>
    </Card>
  );
};
