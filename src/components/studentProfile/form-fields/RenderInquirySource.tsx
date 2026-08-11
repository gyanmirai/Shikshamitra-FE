import { Alert } from '@mui/material';
import { useSelector } from 'react-redux';
import CustomSelect from 'src/components/custom-select';
import { useGetAdmissionCrmInquirySourcesQuery } from 'src/redux/student/admissions-crm/core-leads-api';
import { resolveInquirySourceAcademicYearId } from 'src/screens/student/enrollment/setting/inquiry-source-utils';

const RenderInquirySource = ({ formik, ...props }: { formik: any } & any) => {
  const { currentYear } = useSelector((state: any) => state.globalState);
  const academicYearId = resolveInquirySourceAcademicYearId(
    formik.values.academicYear,
    currentYear?.id
  );
  const { data, isLoading } = useGetAdmissionCrmInquirySourcesQuery(
    { academicYearId: academicYearId!, includeInactive: true },
    { skip: !academicYearId }
  );
  const selectedId = formik.values.inquirySource;
  const selectedSource = data?.items.find((item) => item.id === selectedId);
  const selectedSourceIsInactive = selectedSource?.isActive === false;

  return (
    <>
      <CustomSelect
        label="Inquiry Source"
        name="inquirySource"
        isLoading={isLoading}
        options={data?.items ?? []}
        value={selectedId || ''}
        labelKey="displayName"
        valueKey="id"
        multiple={false}
        disabled={props?.disabled}
        onChange={(value) => formik.setFieldValue('inquirySource', value)}
        helperText={
          selectedSourceIsInactive
            ? 'This inquiry source is inactive. Keep it unchanged or choose an active source.'
            : undefined
        }
        helperTextProps={{ sx: { color: 'warning.main' } }}
        formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
      />
      {selectedSourceIsInactive && (
        <Alert severity="warning" sx={{ mt: 1 }}>
          Existing inactive source is retained until changed.
        </Alert>
      )}
    </>
  );
};

export default RenderInquirySource;
