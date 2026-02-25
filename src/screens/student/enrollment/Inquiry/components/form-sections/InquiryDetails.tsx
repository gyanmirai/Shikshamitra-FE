import type { FormikProps } from 'formik';

import { DatePicker } from '@mui/x-date-pickers';
import { Card, Grid, Divider, Typography } from '@mui/material';
// Components
import ShakingTextField from 'src/components/shaking-text-field';
import { PaginatedSearchSelect } from 'src/components/paginated-search-select';

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
        <Typography color="text.secondary">Loading...</Typography>
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
              readOnly
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
          {/* <CustomSelect
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
          /> */}
          <PaginatedSearchSelect
            label="Inquiry Preference"
            fetchOptions={async (query) => {
              const items = inquiryPreference?.items || [];
              const filtered = items.filter((item: any) =>
                item?.preferenceName?.toLowerCase().includes(query.toLowerCase())
              );
              return {
                data: filtered.map((item: any) => ({
                  label: item.preferenceName,
                  id: item.id,
                })),
                hasMore: false,
              };
            }}
            value={
              values.inquiryPreferences
                ? {
                    label:
                      inquiryPreference?.items?.find((b: any) => b.id === values.inquiryPreferences)
                        ?.preferenceName || '',
                    id: values.inquiryPreferences,
                  }
                : null
            }
            isOptionEqualToValue={(option, value) => option.id === value?.id}
            getOptionLabel={(option: any) => option?.label || ''}
            renderOption={(prop, option: any) => (
              <li {...prop} key={option.id}>
                {option.label}
              </li>
            )}
            minChars={0}
            onChange={(_, value: any) => {
              setFieldValue('inquiryPreferences', value?.id || '');
            }}
            error={!!(touched.inquiryPreferences && errors.inquiryPreferences)}
            helperText={(touched.inquiryPreferences && errors.inquiryPreferences) || ''}
            fullWidth
            sx={{ maxWidth: 'unset' }}
            size="small"
          />
        </Grid>
      </Grid>
    </Card>
  );
};
