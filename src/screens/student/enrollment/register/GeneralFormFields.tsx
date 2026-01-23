import { Box } from '@mui/material';
import { useBoolean } from 'src/hooks/use-boolean';

import StudentSection from './components/StudentSection';
import AddressSection from './components/AddressSection';
import ContactDetailsSection from './components/ContactDetailsSection';
import IdentificationSection from './components/IdentificationSection';
import PreviousSchoolSection from './components/PreviousSchoolSection';
import InquiryAdmissionSection from './components/InquiryAdmissionSection';

import type { FieldsType } from './type';
import type { FormikLike, GeneralFormValues } from './components/section-types';

interface GeneralFormProps {
  formik: FormikLike<GeneralFormValues>;
  isMainForm?: boolean;
}

const RenderGeneralFormFields = (props: GeneralFormProps) => {
  const { formik, isMainForm = false } = props;

  const isGeneralFormEditable = useBoolean(isMainForm);
  const isStudentDetailsEditable = useBoolean(isMainForm);
  const isContactDetailsEditable = useBoolean(isMainForm);
  const isIdentificationEditable = useBoolean(isMainForm);
  const isAddressEditable = useBoolean(isMainForm);
  const isPreviousSchoolEditable = useBoolean(isMainForm);

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
      <PreviousSchoolSection
        formik={formik}
        isMainForm={isMainForm}
        isEdit={isPreviousSchoolEditable}
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
