// import { isValidPhoneNumber } from 'react-phone-number-input/input';

import { useFormik } from 'formik';
import { useTabs } from 'src/hooks/use-tabs';
import { Category } from 'src/enums/studnet-category';
import { useMemo, useState, useCallback } from 'react';
import { CustomTabs } from 'src/components/custom-tabs';
import { shikshaMitraToast } from 'src/components/toast';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { getBase64String } from 'src/utils/get-base64-string';
import { Tab, Box, Grid, Card, TextField } from '@mui/material';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { dateFormat, dateConvertor } from 'src/utils/dateConvertor';
import {
  useUpdateBasicDetailsMutation,
  useUpdateFamilyDetailsMutation,
  useUpdateParentBankDetailsMutation,
  useUpdatePreviousSchoolDetailsMutation,
  useUpdateStudentMedicalDetailsMutation,
  useUpdateStudentAdditionalDetailsMutation,
  useUpdateStudentCommunicationDetailsMutation,
} from 'src/redux/student/registration/registration-api';

import { FormSlider } from '../enrollment/register/register-form';
import { familyFields } from '../enrollment/register/register-fields';
import { generalFormFields } from '../enrollment/register/GeneralFormFields';
import { medicalFields } from '../enrollment/register/render-medical-details';
import { bankDetailsFields } from '../enrollment/register/render-bank-details';
import { communicationFields } from '../enrollment/register/render-communication';
import { previousSchoolFields } from '../enrollment/register/render-previous-details';
import { additionalDetailsFields } from '../enrollment/register/render-additional-details';
import {
  bankDetailsValidation,
  familyFieldsValidation,
  generalFieldValidation,
  previousSchoolValidation,
  medicalDetailsValidations,
  additionalDetailsValidations,
  communicationFieldsValidation,
} from '../enrollment/register/register-form-validation';
import {
  bankDetailsInitialValues,
  familyFieldsInitialValues,
  generalFieldsInitialValues,
  medicalFieldsInitialValues,
  additionalDetailsInitialValues,
  CommunicationFieldsInitialValues,
  previousSchoolFieldsInitialValues,
} from '../enrollment/register/initialvalues';

import type { StudentTabsComponentType } from '.';
import type { FieldsType } from '../enrollment/register/type';

export const fields = [
  generalFormFields,
  familyFields,
  communicationFields,
  additionalDetailsFields,
  medicalFields,
  previousSchoolFields,
  bankDetailsFields,
];

const TABS = [
  { value: 'general', label: 'General' },
  { value: 'admission', label: 'Family' },
  { value: 'communication', label: 'Communication' },
  { value: 'additionalDetails', label: 'Additional Details' },
  { value: 'medicalRecords', label: 'Medical Records' },
  { value: 'previousSchool', label: 'Prev. School Details' },
  { value: 'bankDetails', label: 'Bank Details' },
];

export const validationSchemas = [
  generalFieldValidation,
  familyFieldsValidation,
  communicationFieldsValidation,
  additionalDetailsValidations,
  medicalDetailsValidations,
  previousSchoolValidation,
  bankDetailsValidation,
];

export function StudentInformation(props: StudentTabsComponentType) {
  const { student, refetch } = props;
  const editData = student;
  const [isEdit, setIsEdit] = useState(false);
  const tabs = useTabs('general');
  const activeTabIndex = useMemo(
    () => TABS.findIndex((tab) => tab.value === tabs.value),
    [tabs.value]
  );

  const [updateBasicDetails] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateBasicDetailsMutation,
  });
  const [updateFamilyDetails] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateFamilyDetailsMutation,
  });
  const [updateCommunicationDetails] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateStudentCommunicationDetailsMutation,
  });
  const [updateMedicalDetails] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateStudentMedicalDetailsMutation,
  });
  const [updatePreviousSchoolDetails] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdatePreviousSchoolDetailsMutation,
  });
  const [updateAdditionDetails] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateStudentAdditionalDetailsMutation,
  });
  const [updateBankDetails] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateParentBankDetailsMutation,
  });

  // const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  // const dispatch = useDispatch();
  const handleGeneralFormSubmit = useCallback(
    async (values: any, formik: any) => {
      try {
        if (editData) {
          await updateBasicDetails({
            id: editData?.id || values?.id,
            body: {
              formNumber: values.formNo,
              firstName: values.firstName,
              middleName: values.middleName,
              lastName: values.lastName,
              previousSchoolName: values.previousSchool,

              dateOfBirth: dateConvertor(values.dob?.format(dateFormat) || '') || '',
              genderType: values.gender,
              primaryContactNumber: values.primaryContactNumber,
              secondaryContactNumber: values.secondaryContactNumber,

              academicYearId: values.academicYear,
              educationBoardId: values.board,
              educationMediumId: values.medium,
              standardId: values.class,
              // userId: values.userId || res?.id,
              profilePicture: values.photo ? getBase64String(values.photo) : '',
              // mobileNo: values.mobileNo,
              email: values.email,
              aadhaarNo: String(values.adharNo),
              religion: values.religion,
              familyCast: values.familyCast,
              castType: values.castCategory,
              motherTongue: values.motherTongue,
              nationality: values.nationality,
              birthPlace: values.birthPlace,
              temporaryGr: +values.temporaryGr,
              remarks: values.remarks,
              addressLine1: values.addressLine1,
              addressLine2: values.addressLine2,
              addressLine3: values.addressLine3,
              city: values?.city?.name,
              state: { name: values?.state?.name, isoCode: values?.state?.isoCode },
              country: { name: values?.country?.name, isoCode: values?.country?.isoCode },
              pinCode: String(values.pinCode),
              inquiryPreferenceId: values.inquiryPreference,
              village: values.village,
              apparId: values.apparId,
              panNo: values.panNo,
              userId: editData?.userId,
              lastClassPassed: values.lastClassPassed,
            },
          }).unwrap();
        }
      } catch (error) {
        throw new Error(error);
      }
    },
    [editData, updateBasicDetails]
  );
  const handleFamilyFormSubmit = useCallback(
    async (values: any, formik: any) => {
      try {
        await updateFamilyDetails({
          id: editData?.id || values?.id,
          body: {
            fatherDetails: {
              name: values.fatherName,
              dateOfBirth: values.fatherDob
                ? dateConvertor(values.fatherDob?.format(dateFormat) || '') || ''
                : null,
              occupation: values.fatherOccupation,
              qualification: values.fatherQualification,
              contactNo: values.fatherContactNo,
              email: values.fatherEmail,
              passOutYear: +values.fatherPassOutYear,
              officeNo: values.fatherOfficeNo,
              officeAddress1: values.fatherOfficeAddress1,
              officeAddress2: values.fatherOfficeAddress2,
              officeAddress3: values.fatherOfficeAddress3,
              designation: values.fatherDesignation,
              organisation: values.fatherOrganization,
              aadhaarNo: String(values.fatherAadharNo),
              remarks: values.fatherRemarks,
              address1: values.fatherAddress1,
              address2: values.fatherAddress2,
              address3: values.fatherAddress3,
            },
            motherDetails: {
              name: values.motherName,
              dateOfBirth: values.motherDob
                ? dateConvertor(values.motherDob?.format(dateFormat) || '') || ''
                : null,
              occupation: values.motherOccupation,
              qualification: values.motherQualification,
              contactNo: values.motherContactNo,
              email: values.motherEmail,
              passOutYear: +values.motherPassOutYear,
              officeNo: values.motherOfficeNo,
              officeAddress1: values.motherOfficeAddress1,
              officeAddress2: values.motherOfficeAddress2,
              officeAddress3: values.motherOfficeAddress3,
              designation: values.motherDesignation,
              organisation: values.motherOrganization,
              aadhaarNo: String(values.motherAadharNo),
              remarks: values.motherRemarks,
              address: values.motherAddress,
            },
            guardianDetails: {
              name: values.guardianName,
              dateOfBirth: values.guardianDob
                ? dateConvertor(values.guardianDob?.format(dateFormat) || '') || ''
                : null,
              occupation: values.guardianOccupation,
              qualification: values.guardianQualification,
              contactNo: values.guardianContactNo,
              email: values.guardianEmail,
              passOutYear: +values.guardianPassOutYear,
              officeNo: values.guardianOfficeNo,
              officeAddress1: values.guardianOfficeAddress1,
              officeAddress2: values.guardianOfficeAddress2,
              officeAddress3: values.guardianOfficeAddress3,
              designation: values.guardianDesignation,
              organisation: values.guardianOrganization,
              aadhaarNo: String(values.guardianAadharNo),
              remarks: values.guardianRemarks,
              address1: values.guardianAddress1,
              address2: values.guardianAddress2,
              address3: values.guardianAddress3,
            },
          },
        }).unwrap();
      } catch (error) {
        throw new Error(error);
      }
    },
    [editData?.id, updateFamilyDetails]
  );
  const handleCommunicationFormSubmit = useCallback(
    async (values: any, formik: any) => {
      try {
        await updateCommunicationDetails({
          id: editData?.id || values?.id,
          body: {
            primaryContactNo: values.primaryContactNumber,
            parentContactNo: values.parentContactNumber,
            parentEmail: values.parentEmail,
            studentContactNo: values.studentContactNo,
            studentEmail: values.studentEmail,
            whatsAppNo: values.whatsAppContactNo,
            localAddress: values.localAddress,
            localCountryName: values?.localCountry?.name || '',
            localCountryIsoCode: values?.localCountry?.isoCode || '',
            localStateName: values?.localState?.name || '',
            localStateIsoCode: values?.localState?.isoCode || '',
            localCity: values.localCity.name,
            localPinCode: values.localPincode,
            permanentAddress: values.permanentAddress,
            permanentCountryName: values?.permanentCountry?.name || '',
            permanentCountryIsoCode: values?.permanentCountry?.isoCode || '',

            permanentStateName: values?.permanentState?.name || '',
            permanentStateIsoCode: values?.permanentState?.isoCode || '',

            permanentCity: values?.permanentCity?.name,
            permanentPinCode: values.permanentPincode,
            emergencyAddress: values.emergencyAddress,
            emergencyStateName: values.emergencyState?.name || '',
            emergencyStateIsoCode: values.emergencyState?.isoCode || '',
            emergencyCountryName: values.emergencyCountry?.name || '',
            emergencyCountryIsoCode: values.emergencyCountry?.isoCode || '',

            emergencyCity: values?.emergencyCity?.name,
            emergencyPinCode: values.emergencyPincode,
            remarks: values.remarks,
          },
        }).unwrap();
      } catch (error) {
        throw new Error(error);
      }
    },
    [editData?.id, updateCommunicationDetails]
  );
  const handleMedicalFormSubmit = useCallback(
    async (values: any, formik: any) => {
      try {
        await updateMedicalDetails({
          id: editData?.id || values?.id,
          body: {
            weight: +values.weight,
            height: +values.height,
            bodyMassIndex: +values.bmi,
            haemoglobin: +values.haemoglobin,
            allergies: values.allergies,
            covidVaccination: values.covidVaccination,
            childImmunisation: values.childImmunisation,
            immunisationRemarks: values.immunisationRemarks,
          },
        }).unwrap();
      } catch (error) {
        throw new Error(error);
      }
    },
    [editData?.id, updateMedicalDetails]
  );
  const handlePreviousSchoolFormSubmit = useCallback(
    async (values: any, formik: any) => {
      try {
        await updatePreviousSchoolDetails({
          id: editData?.id || values?.id,
          body: {
            previousSchoolName: values.schoolName,
            previousSchoolAddress: values.schoolAddress,
            previousSchoolBoard: values.schoolBoard,
            previousSchoolMedium: values.schoolMedium,
            tcNo: values.tcNumber,
            lastClassPassed: String(values.lastClassPassed),
            percentage: +values.percentage,
          },
        }).unwrap();
      } catch (error) {
        throw new Error(error);
      }
    },
    [editData?.id, updatePreviousSchoolDetails]
  );

  const handleBankDetailsFormSubmit = useCallback(
    async (values: any, formik: any) => {
      try {
        await updateBankDetails({
          id: editData?.id || values?.id,
          body: {
            bankName: values.bankName,
            branchName: values.branchName,
            accountHolderName: values.accountHolderName,
            accountNumber: values.accountNo,
            ifscCode: values.ifscCode,
          },
        }).unwrap();
      } catch (error) {
        throw new Error(error);
      }
    },
    [editData?.id, updateBankDetails]
  );
  const handleAdditionalDetailsFormSubmit = useCallback(
    async (values: any, formik: any) => {
      try {
        await updateAdditionDetails({
          id: editData?.id || values?.id,
          body: {
            category: values.category,
            rightToEducation: values.category === Category.Rte,
            bplStudent: values.bplStudent,
            bplCardNo: values.bplCardNo,
            personWithDisability: values.personWithDisability,
            secondLanguage: values.secondLanguage,
            emergencyContactNo: values.emergencyContactNo,
            singleParentChild: values.singleParentChild,
            singleChild: values.singleChild,
            sponsorName: values.sponsorStudent.id,
          },
        }).unwrap();
      } catch (error) {
        throw new Error(error);
      }
    },
    [editData?.id, updateAdditionDetails]
  );

  const onSubmit = async (values: any) => {
    try {
      if (activeTabIndex === 0) {
        await handleGeneralFormSubmit(values, formik);
        shikshaMitraToast.success({ message: 'Student details updated successfully' });
      } else if (activeTabIndex === 2) {
        await handleFamilyFormSubmit(values, formik);
        shikshaMitraToast.success({ message: 'Family details updated successfully' });
      } else if (activeTabIndex === 3) {
        await handleCommunicationFormSubmit(values, formik);
        shikshaMitraToast.success({ message: 'Communication details updated successfully' });
      } else if (activeTabIndex === 4) {
        await handleAdditionalDetailsFormSubmit(values, formik);
        shikshaMitraToast.success({ message: 'Additional details updated successfully' });
      } else if (activeTabIndex === 5) {
        await handleMedicalFormSubmit(values, formik);
        shikshaMitraToast.success({ message: 'Medical details updated successfully' });
      } else if (activeTabIndex === 6) {
        await handlePreviousSchoolFormSubmit(values, formik);
        shikshaMitraToast.success({ message: 'Previous school details updated successfully' });
      } else if (activeTabIndex === 7) {
        await handleBankDetailsFormSubmit(values, formik);
        shikshaMitraToast.success({
          message: `Registration for ${student?.firstName} ${student?.lastName} updated successfully`,
        });
      }
    } catch (error) {
      console.log(error);
    } finally {
      // setIsLoading(false);
    }
  };
  const initialValues = useMemo(
    () => ({
      ...generalFieldsInitialValues(student),
      ...familyFieldsInitialValues(student),
      ...CommunicationFieldsInitialValues(student),
      ...additionalDetailsInitialValues(student),
      ...medicalFieldsInitialValues(student),
      ...previousSchoolFieldsInitialValues(student),
      ...bankDetailsInitialValues(student),
    }),
    [student]
  );

  const formik: any = useFormik({
    initialValues,
    validationSchema: validationSchemas[activeTabIndex],
    onSubmit: async (values, { setSubmitting }) => {
      await onSubmit(values);
      setSubmitting(false);
      refetch?.();
    },
  });

  // useEffect(() => {
  //   if (isChanges) {
  //     // dispatch(setIsChanges(false));
  //     // setEditData(null);
  //   } else {
  //     // formDialog.onFalse();
  //     // setEditData(null);
  //   }
  // }, [dispatch, isChanges, tabs.value]);
  const [isBackClick, setIsBackClick] = useState(false);
  const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
    const newIndex = TABS.findIndex((tab) => tab.value === newValue);
    if (activeTabIndex > newIndex) {
      setIsBackClick(true);
    } else {
      setIsBackClick(false);
    }
    setIsEdit(false);
    tabs.setValue(newValue);
  };
  return (
    <Box>
      {/* <BackPopUpChecked initialValues={initialValues} currentValues={formik.values}> */}
      <form onSubmit={formik.handleSubmit}>
        <Card sx={{ px: 0 }}>
          <CustomTabs value={tabs.value} onChange={handleTabChange} variant="fullWidth" sx={{}}>
            {TABS.map((tab) => (
              <Tab
                key={tab.value}
                value={tab.value}
                label={tab.label}
                sx={{ px: '10px !important' }}
              />
            ))}
          </CustomTabs>
          <FormSlider
            steps={TABS}
            isBackClick={isBackClick}
            step={activeTabIndex}
            containerProps={{
              sx: {
                p: 0,
              },
            }}
          >
            <Grid container spacing={2} p={2}>
              {fields[activeTabIndex].map((field: FieldsType) => (
                <Grid
                  size={{
                    xs: [1].includes(activeTabIndex) ? 12 : 3,
                    md: [1].includes(activeTabIndex) ? 12 : 3,
                  }}
                  key={field.name}
                  {...(field.gridProps || {})}
                >
                  {field.renderComp ? (
                    field.renderComp({ formik, field, isEdit, isMainForm: false })
                  ) : field.type === 'date' ? (
                    <DatePicker
                      label={field.label}
                      name={field.name}
                      value={formik.values[field.name]}
                      format="DD-MM-YYYY"
                      onChange={(newValue) => formik.setFieldValue(field.name, newValue)}
                      disabled={!isEdit}
                      slotProps={{
                        textField: {
                          placeholder: field.placeholder,
                          fullWidth: true,
                          size: 'small',
                          helperText: formik.touched[field.name] && formik.errors[field.name],
                          error: formik.touched[field.name] && Boolean(formik.errors[field.name]),
                        },
                      }}
                    />
                  ) : (
                    <TextField
                      key={field.name}
                      type={field.type}
                      size="small"
                      label={field.label}
                      name={field.name}
                      placeholder={field.placeholder}
                      value={formik.values[field.name]}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched[field.name] && Boolean(formik.errors[field.name])}
                      helperText={formik.touched[field.name] && formik.errors[field.name]}
                      fullWidth
                      disabled={!isEdit}
                      // sx={{ maxWidth: '200px', width: '100%', ...(field?.sx || {}) }}
                      {...(field?.otherProps || {})}
                    />
                  )}
                </Grid>
              ))}
            </Grid>
          </FormSlider>
        </Card>
      </form>
      {/* </BackPopUpChecked> */}
    </Box>
  );
}
