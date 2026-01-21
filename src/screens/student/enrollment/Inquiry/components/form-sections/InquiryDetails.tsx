import type { FormikProps } from 'formik';

import { Grid } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import CustomSelect from 'src/components/custom-select';
// Components
import ShakingTextField from 'src/components/shaking-text-field';

import { CollapsibleFormSection } from '../common/CollapsibleFormSection';

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

  const inquiryDetailsError =
    (!!touched.dateOfInquiry && !!errors.dateOfInquiry) ||
    (!!touched.inquiryPreferences && !!errors.inquiryPreferences);

  if (isGetLoading) {
    return (
      <CollapsibleFormSection title="Inquiry Details" step="Step 2 of 4" error={false}>
        Loading...
      </CollapsibleFormSection>
    );
  }

  return (
    <CollapsibleFormSection title="Inquiry Details" step="Step 2 of 4" error={inquiryDetailsError}>
      <Grid size={{ xs: 12, md: 6 }}>
        <ShakingTextField error={!!(touched.dateOfInquiry && errors.dateOfInquiry) || false}>
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
        <CustomSelect
          label="Inquiry Source / Preference"
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
    </CollapsibleFormSection>
  );
};
