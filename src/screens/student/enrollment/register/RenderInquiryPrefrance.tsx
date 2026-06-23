import { useMemo } from 'react';
import { Alert } from '@mui/material';
import { useSelector } from 'react-redux';
import { useBoolean } from 'src/hooks/use-boolean';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetInquiryPreferenceQuery } from 'src/redux/student/inquiry-preference/inquiry-preference-api';

import { InquiryPreferenceForm } from '../setting/inquiryPreference';
import {
  buildInquirySourceOptions,
  resolveInquirySourceAcademicYearId,
} from '../setting/inquiry-source-utils';

const RenderInquiryPrefrance = ({ formik, ...props }: { formik: any } & any) => {
  const { currentYear } = useSelector((state: any) => state.globalState);
  const inquirySourceAcademicYearId = resolveInquirySourceAcademicYearId(
    formik.values.academicYear,
    currentYear?.id
  );
  const { data: inquiryPreference, isLoading: inquiryPrefrenceLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetInquiryPreferenceQuery,
    params: {
      academicYearId: inquirySourceAcademicYearId,
      isActive: true,
      maxResultCount: 1000,
    },
    options: {
      skip: !inquirySourceAcademicYearId,
    },
  });
  const dialog = useBoolean();
  const selectedInquirySourceId = formik.values.inquiryPreference;
  const selectedInquirySourceName =
    formik.values.inquiryPreferenceName || formik.initialValues?.inquiryPreferenceName;
  const inquirySourceOptions = useMemo(
    () =>
      buildInquirySourceOptions(
        inquiryPreference?.items || [],
        selectedInquirySourceId,
        selectedInquirySourceName
      ),
    [inquiryPreference?.items, selectedInquirySourceId, selectedInquirySourceName]
  );
  const isSelectedInquirySourceInactive = inquirySourceOptions.some(
    (item: any) => item.id === selectedInquirySourceId && item.isActive === false
  );

  return (
    <>
      <CustomSelect
        label="Inquiry Source"
        name="inquiryPreference"
        isLoading={inquiryPrefrenceLoading}
        options={inquirySourceOptions}
        value={formik.values.inquiryPreference || ''}
        labelKey="preferenceName"
        valueKey="id"
        multiple={false}
        disabled={props?.disabled}
        onChange={(value) => formik.setFieldValue('inquiryPreference', value)}
        helperText={
          isSelectedInquirySourceInactive
            ? 'This inquiry source is inactive. Keep it unchanged or choose an active source.'
            : undefined
        }
        helperTextProps={{ sx: { color: 'warning.main' } }}
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
        Add Inquiry Source
      </Typography> */}
      {isSelectedInquirySourceInactive && (
        <Alert severity="warning" sx={{ mt: 1 }}>
          Existing inactive source is retained until changed.
        </Alert>
      )}
      <CustomDialog open={dialog.value} handleClose={dialog.onFalse} title="Inquiry Source">
        <InquiryPreferenceForm
          handleClose={dialog.onFalse}
          editData={null}
          academicYearId={inquirySourceAcademicYearId}
        />
      </CustomDialog>
    </>
  );
};
export default RenderInquiryPrefrance;
