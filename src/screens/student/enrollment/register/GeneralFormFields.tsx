import { useBoolean } from 'src/hooks/use-boolean';
import { Box, Card, Grid, Divider, Skeleton, Typography } from '@mui/material';

import StudentSection from './components/StudentSection';
import AddressSection from './components/AddressSection';
import ContactDetailsSection from './components/ContactDetailsSection';
import IdentificationSection from './components/IdentificationSection';
import InquiryAdmissionSection from './components/InquiryAdmissionSection';

import type { FieldsType } from './type';
import type { FormikLike, GeneralFormValues } from './components/section-types';

interface GeneralFormProps {
  formik: FormikLike<GeneralFormValues>;
  isMainForm?: boolean;
  isLoading?: boolean;
}

const RenderGeneralFormFields = (props: GeneralFormProps) => {
  const { formik, isMainForm = false, isLoading } = props;

  const isGeneralFormEditable = useBoolean(isMainForm);
  const isStudentDetailsEditable = useBoolean(isMainForm);
  const isContactDetailsEditable = useBoolean(isMainForm);
  const isIdentificationEditable = useBoolean(isMainForm);
  const isAddressEditable = useBoolean(isMainForm);
  const isPreviousSchoolEditable = useBoolean(isMainForm);

  if (isLoading) {
    return (
      <>
        <Card sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Typography variant="h6" fontWeight={600} color="text.primary">
            Inquiry & Admission
          </Typography>
          <Divider sx={{ my: 2, borderStyle: 'dashed' }} />
          <Grid container spacing={2.5}>
            {[1, 2, 3, 4, 5].map((item) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={item}>
                <Skeleton variant="rectangular" height={40} sx={{ borderRadius: 1 }} />
              </Grid>
            ))}
          </Grid>
        </Card>
        <Card sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Typography variant="h6" fontWeight={600} color="text.primary">
            Student
          </Typography>
          <Divider sx={{ my: 2, borderStyle: 'dashed' }} />
          <Grid container spacing={2.5}>
            {[1, 2, 3, 4].map((item) => (
              <Grid size={{ xs: 12, sm: 4 }} key={item}>
                <Skeleton variant="rectangular" height={40} sx={{ borderRadius: 1 }} />
              </Grid>
            ))}
            <Grid size={{ xs: 12, sm: 8 }}>
              <Skeleton variant="rectangular" height={40} sx={{ borderRadius: 1 }} />
            </Grid>
          </Grid>
        </Card>
        <Card sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Typography variant="h6" fontWeight={600} color="text.primary">
            Contact Details
          </Typography>
          <Divider sx={{ my: 2, borderStyle: 'dashed' }} />
          <Grid container spacing={2.5}>
            {[1, 2, 3, 4].map((item) => (
              <Grid size={{ xs: 12, sm: 4 }} key={item}>
                <Skeleton variant="rectangular" height={40} sx={{ borderRadius: 1 }} />
              </Grid>
            ))}
            <Grid size={{ xs: 12, sm: 8 }}>
              <Skeleton variant="rectangular" height={40} sx={{ borderRadius: 1 }} />
            </Grid>
          </Grid>
        </Card>
      </>
    );
  }

  // const { data: basicDetails, isLoading: basicDetailsLoading } = useQueryAndMutation({
  //   type: 'query',
  //   currentQueryAndMutation: useGetBasicDetailsQuery,
  //   params: {
  //     studentId: editData?.studentId,
  //   },
  //   options: {
  //     skip: !editData?.studentId,
  //   },
  // });
  // const hasInitialized = useRef(false);
  // useEffect(() => {
  //   if (!hasInitialized.current && basicDetails?.data && !basicDetailsLoading) {
  //     console.log('=========called=======');
  //     resetForm({ values: { ...generalFieldsInitialValues(basicDetails.data) } });
  //     hasInitialized.current = true;
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [basicDetails?.data?.standardId, basicDetailsLoading]);

  // console.log(basicDetails, 'basicDetails', formik);

  const handleSave = async (): Promise<void | false | undefined> => {
    const validation = await formik.validateForm();
    await formik?.submitForm?.();
    if (Object.keys(validation).length > 0) return false;

    formik.resetForm({ values: formik.values });
    return undefined;
  };
  const handleCancel = () => {
    formik.resetForm();
  };

  return (
    <Box>
      <InquiryAdmissionSection
        formik={formik}
        isMainForm={isMainForm}
        isEdit={isGeneralFormEditable}
        onSave={handleSave}
        onCancel={handleCancel}
      />
      <StudentSection
        formik={formik}
        isMainForm={isMainForm}
        isEdit={isStudentDetailsEditable}
        onSave={handleSave}
        onCancel={handleCancel}
      />
      <ContactDetailsSection
        formik={formik}
        isMainForm={isMainForm}
        isEdit={isContactDetailsEditable}
        onSave={handleSave}
        onCancel={handleCancel}
      />
      <IdentificationSection
        formik={formik}
        isMainForm={isMainForm}
        isEdit={isIdentificationEditable}
        onSave={handleSave}
        onCancel={handleCancel}
      />
      <AddressSection
        formik={formik}
        isMainForm={isMainForm}
        isEdit={isAddressEditable}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    </Box>
  );
};

export const generalFormFields: FieldsType[] = [
  {
    name: 'inquiryNo',
    label: 'Inquiry No',
    type: 'text',
    otherProps: { disabled: true, autoFocus: true },
    gridProps: { size: { xs: 12, md: 12 } },
    renderComp(props) {
      return <RenderGeneralFormFields {...props} />;
    },
  },
];
