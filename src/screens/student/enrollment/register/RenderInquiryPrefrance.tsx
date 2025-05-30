import { Typography } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetInquiryPreferenceQuery } from 'src/redux/student/inquiry-preference/inquiry-preference-api';

import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';

import { InquiryPreferenceForm } from '../setting/inquiryPreference';

const RenderInquiryPrefrance = ({ formik, ...props }: { formik: any } & any) => {
  const { data: inquiryPreference, isLoading: inquiryPrefrenceLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetInquiryPreferenceQuery,
  });
  const dialog = useBoolean();

  return (
    <>
      <CustomSelect
        label="Inquiry Type"
        name="inquiryPreference"
        isLoading={inquiryPrefrenceLoading}
        options={inquiryPreference?.items || []}
        value={formik.values.inquiryPreference}
        labelKey="preferenceName"
        valueKey="id"
        multiple={false}
        onChange={(value) => formik.setFieldValue('inquiryPreference', value)}
        formControlProps={{
          fullWidth: true,
          sx: {
            maxWidth: 'unset',
          },
        }}
      />
      <Typography
        variant="body2"
        fontWeight={500}
        textAlign="right"
        color="primary.main"
        fontSize={12}
        sx={{ cursor: 'pointer' }}
        onClick={() => {
          dialog.onTrue();
        }}
      >
        Add Inquiry Type
      </Typography>
      <CustomDialog open={dialog.value} handleClose={dialog.onFalse} title="Inquiry Preference">
        <InquiryPreferenceForm handleClose={dialog.onFalse} editData={null} />
      </CustomDialog>
    </>
  );
};
export default RenderInquiryPrefrance;
