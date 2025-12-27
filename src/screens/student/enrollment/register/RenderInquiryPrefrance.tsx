import { useSelector } from 'react-redux';
import { useBoolean } from 'src/hooks/use-boolean';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetInquiryPreferenceQuery } from 'src/redux/student/inquiry-preference/inquiry-preference-api';

import { InquiryPreferenceForm } from '../setting/inquiryPreference';

const RenderInquiryPrefrance = ({ formik, ...props }: { formik: any } & any) => {
  const { currentYear } = useSelector((state: any) => state.globalState);
  const { data: inquiryPreference, isLoading: inquiryPrefrenceLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetInquiryPreferenceQuery,
    params: {
      academicYearId: currentYear?.id,
    },
    options: {
      skip: !currentYear?.id,
    },
  });
  const dialog = useBoolean();

  return (
    <>
      <CustomSelect
        label="Inquiry Preference"
        name="inquiryPreference"
        isLoading={inquiryPrefrenceLoading}
        options={inquiryPreference?.items || []}
        value={formik.values.inquiryPreference}
        labelKey="preferenceName"
        valueKey="id"
        multiple={false}
        disabled={props?.disabled}
        onChange={(value) => formik.setFieldValue('inquiryPreference', value)}
        formControlProps={{
          fullWidth: true,
          sx: {
            maxWidth: 'unset',
          },
        }}
      />
      {/* <Typography
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
        Add Inquiry Preference
      </Typography> */}
      <CustomDialog open={dialog.value} handleClose={dialog.onFalse} title="Inquiry Preference">
        <InquiryPreferenceForm handleClose={dialog.onFalse} editData={null} />
      </CustomDialog>
    </>
  );
};
export default RenderInquiryPrefrance;
