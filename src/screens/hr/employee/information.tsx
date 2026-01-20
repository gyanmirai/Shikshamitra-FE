// import { isValidPhoneNumber } from 'react-phone-number-input/input';

import { useFormik } from 'formik';
import { useTabs } from 'src/hooks/use-tabs';
import { CustomTabs } from 'src/components/custom-tabs';
import { shikshaMitraToast } from 'src/components/toast';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Tab, Box, Card, Grid, TextField } from '@mui/material';
import ShakingTextField from 'src/components/shaking-text-field';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { FormSlider } from 'src/screens/student/enrollment/register/register-form';
import {
  useGetBankDetailsQuery,
  useUpdateEmployeeMutation,
  useGetWorkExperienceQuery,
  useGetBasicInformationQuery,
  useUpdateBankDetailsMutation,
  useGetFamilyInformationQuery,
  useGetAdditionalInformationQuery,
  useUpdateFamilyInformationMutation,
  useUpdateExperienceInformationMutation,
  useUpdateAdditionalInformationMutation,
  useGetReportingManagerByEmployeeIdQuery,
  useUpdateReportingManagerByEmployeeIdMutation,
} from 'src/redux/employee/employeeApi';

// import {
//   FamilyFields,
//   PayrollFields,

import type { RootState } from 'src/redux/store';

import { useSelector } from 'react-redux';
import { Scrollbar } from 'src/components/scrollbar';
import { LoadingScreen } from 'src/components/loading-screen';
import { dateFormat, dateConvertor } from 'src/utils/dateConvertor';

import { infoValidations } from './employee-form-validation';
//   WorkExperienceFields,
import { FamilyFields } from './employee-form-fields/FamilyFields';
import { PayrollFields } from './employee-form-fields/PayrollFields';
import { InformationFields } from './employee-form-fields/InformationFields';
import { WorkExperienceFields } from './employee-form-fields/WorkExperienceFields';
import { AssignReportingManager } from './employee-form-fields/AssignReportingManager';
import { AdditionalDetailsFields } from './employee-form-fields/AdditionalDetailsFields';
import { AcademicPermissionFields } from './employee-form-fields/AcademicPermissionFields';
// } from './employee-form-fields';
import {
  payrollInitialValues,
  workExperienceInitialValues,
  familyInformationInitialValues,
  additionalDetailsInitialValues,
  personalInformationInitialValues,
  assignReportingManagerInitialValues,
} from './employee-form';

//   InformationFields,
import type { FieldsType } from './employee-form-fields/types';

const fields = [
  InformationFields,
  FamilyFields,
  AdditionalDetailsFields,
  WorkExperienceFields,
  PayrollFields,
  AssignReportingManager,
  AcademicPermissionFields,
];
// const fields = [InformationFields];

const TABS = [
  { value: 'personalInformation', label: 'Personal Information' },
  { value: 'familyInformation', label: 'Family Information' },
  { value: 'additionalFields', label: 'Additional Information' },
  { value: 'workExperience', label: 'Work Experience' },
  { value: 'payroll', label: 'Payroll' },
  { value: 'assignReportingManager', label: 'Assign Reporting Manager' },
  //   { value: 'performanceAndDevelopment', label: 'Performance and Development' },
];

const EmployeeInformation = ({ editData }: { editData: any }) => {
  const tabs = useTabs('personalInformation');
  // Find the index of the active tab based on the current tab value
  const activeTabIndex = useMemo(
    () => TABS.findIndex((tab) => tab.value === tabs.value),
    [tabs.value]
  );
  // State to control edit mode
  const [isEdit, setIsEdit] = useState(false);
  useSelector((state: RootState) => state.confirmPopup);

  const [isBackClick, setIsBackClick] = useState(false);

  // Custom hook for handling employee update mutation
  const [updateEmployee] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateEmployeeMutation,
    isThrowError: true,
  });

  const [updateFamilyInfo] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateFamilyInformationMutation,
    isThrowError: true,
  });

  const [updateExperienceInfo] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateExperienceInformationMutation,
    isThrowError: true,
  });

  const [updateBankDetails] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateBankDetailsMutation,
    isThrowError: true,
  });
  const [updateAdditionalInfo] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateAdditionalInformationMutation,
    isThrowError: true,
  });

  const [updateReportingManager] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateReportingManagerByEmployeeIdMutation,
    isThrowError: true,
  });

  // Handler for updateFamilyInformation
  const handleFamilyInformation = useCallback(
    async (values: any, formik: any) => {
      const res = await updateFamilyInfo({
        employeeId: values.employeeId,
        body: {
          fatherDetails: {
            name: values.fatherName,
            occupation: values.fatherOccupation,
            mobileNo: values.fatherContactNo,
            address1: values.fatherAddress1,
            address2: values.fatherAddress2,
            address3: values.fatherAddress3,
            country: { name: values?.fatherCountry?.name, isoCode: values?.fatherCountry?.isoCode },
            state: { name: values?.fatherState?.name, isoCode: values?.fatherState?.isoCode },
            city: values?.fatherCity?.name,
            pincode: String(values.fatherPinCode),
          },
          motherDetails: {
            name: values.motherName,
            occupation: values.motherOccupation,
            mobileNo: values.motherContactNo,
            address1: values.motherAddress1,
            address2: values.motherAddress2,
            address3: values.motherAddress3,

            country: { name: values?.motherCountry?.name, isoCode: values?.motherCountry?.isoCode },
            state: { name: values?.motherState?.name, isoCode: values?.motherState?.isoCode },

            city: values?.motherCity?.name,
            pincode: String(values.motherPinCode),
          },
          spouseDetails: {
            name: values.spouseName,
            occupation: values.spouseOccupation,
            mobileNo: values.spouseContactNo,
            address1: values.spouseAddress1,
            address2: values.spouseAddress2,
            address3: values.spouseAddress3,
            country: { name: values?.spouseCountry?.name, isoCode: values?.spouseCountry?.isoCode },
            state: { name: values?.spouseState?.name, isoCode: values?.spouseState?.isoCode },
            city: values?.spouseCity?.name,
            pincode: String(values.spousePinCode),
          },
        },
      }).unwrap();
      return res;
    },
    [updateFamilyInfo]
  );

  // Handler for updateEmployee
  const handelUpdateEmployee = useCallback(
    async (values: any, formik: any, id: any) => {
      try {
        const res = await updateEmployee({
          id,
          body: {
            lastName: values.lastName,
            firstName: values.firstName,
            middleName: values.middleName,
            shortName: values.shortName,
            employeeStatusType: values.employeeStatusType,
            dob: dateConvertor(values.dob.format(dateFormat)),
            familyCaste: values.familyCast,
            casteType: values.castType,
            gender: values.gender,
            religion: values.religion,
            maritalStatus: values.maritalStatus,
            bloodGroup: values.bloodGroup,
            mobileNo: values.mobileNo,
            secondaryMobileNo: values.secondaryMobileNo,
            email: values.email,
            department: values.department,
            doj: dateConvertor(values.dateOfJoining.format(dateFormat)),
            isTeaching: values.employeeGroup === 0,
            // qualification: values.qualification,
            roleId: values.role,
            // identificationMark1: values.identificationMark1,
            address1: values.addressLine1,
            address2: values.addressLine2,
            address3: values.addressLine3,
            country: { name: values?.country?.name, isoCode: values?.country?.isoCode },
            city: values?.city?.name,
            state: { name: values?.state?.name, isoCode: values?.state?.isoCode },
            pincode: `${values.pincode}`,
            // educationMediumStageId: values.organization,
            shiftId: values.shift,
          },
        }).unwrap();

        return res;
      } catch (error) {
        throw new Error(error);
      }
    },
    [updateEmployee]
  );

  // Handler for tab changes - resets edit mode when switching tabs
  const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
    const newIndex = TABS.findIndex((tab) => tab.value === newValue);
    if (activeTabIndex > newIndex) {
      setIsBackClick(true);
    } else {
      setIsBackClick(false);
    }
    formik.resetForm();
    setIsEdit(false);
    tabs.setValue(newValue);
  };

  // handler TO update experience
  const handleWorkExperience = useCallback(
    async (values: any, formik: any) => {
      const res = await updateExperienceInfo({
        employeeId: values.employeeId,
        body: values.experiences.map((i: any) => ({
          ...i,
          mediumStageName: i.mediumStageName,
          designation: i.designation,
          department: i.department,
          country: {
            name: i.country.name,
            isoCode: i.country.isoCode,
          },
          state: {
            name: i.state.name,
            isoCode: i.state.isoCode,
          },
          city: i.city.name,
          startDate: i.startDate ? dateConvertor(i.startDate.format(dateFormat)) : null,
          endDate: i.endDate ? dateConvertor(i.endDate.format(dateFormat)) : null,
        })),
      }).unwrap();
      return res;
    },
    [updateExperienceInfo]
  );

  // Handler for updateBankDetailsInformation
  const handleBankDetailsInformation = useCallback(
    async (values: any, formik: any) => {
      const res = updateBankDetails({
        employeeId: values.employeeId,
        body: {
          bankDetails: {
            bankName: values.bankName,
            branchName: values.branchName,
            accountHolderName: values.accountHolderName,
            accountNumber: values.accountNumber,
            ifscCode: values.ifscCode,
          },

          salaryDetails: {
            pfRuleId: values.pfRuleId,
            epfNumber: values.epfNumber,
            uanNumber: values.uanNumber,
            basicSalary: values.basicSalary,
            punchId: values.punchId,
            tdsPercentage: values.tdsPercentage,
            tdsAmount: values.tdsAmount,
          },

          earningComponents: values.earningComponents,
          deductionComponents: values.deductionComponents,
        },
      }).unwrap();
      return res;
    },
    [updateBankDetails]
  );

  const handleAdditionalDetails = useCallback(
    async (values: any, formik: any) => {
      const res = await updateAdditionalInfo({
        employeeId: values.employeeId,
        body: {
          bplCardNo: values.bplCardNo,
          personWithDisability: values.personWithDisability === 'Yes',
          secondLanguage: values.secondLanguage,
          isLibraryMember: values.libraryMember,
          isTransportMember: values.transportMember,
        },
      }).unwrap();
      return res;
    },
    [updateAdditionalInfo]
  );

  const handleReportingManager = useCallback(
    async (values: any, formik: any, id: any) => {
      const res = await updateReportingManager({
        id: values.employeeId,
        body: {
          reportingManagerId: values?.reportingManager?.id,
        },
      }).unwrap();
      return res;
    },
    [updateReportingManager]
  );

  // submit handler
  const onSubmit = async (_val: any) => {
    try {
      if (activeTabIndex === 0) {
        await handelUpdateEmployee(formik.values, formik, editData?.id);
        shikshaMitraToast.success({ message: 'Employee Details updated successfully' });
      } else if (activeTabIndex === 1) {
        await handleFamilyInformation(formik.values, formik);
        shikshaMitraToast.success({ message: 'Family Details updated successfully' });
      } else if (activeTabIndex === 2) {
        await handleAdditionalDetails(formik.values, formik);
        shikshaMitraToast.success({ message: 'Additional Details updated successfully' });
      } else if (activeTabIndex === 3) {
        await handleWorkExperience(formik.values, formik);
        shikshaMitraToast.success({ message: 'Work Experience  updated successfully' });
      } else if (activeTabIndex === 4) {
        await handleBankDetailsInformation(formik.values, formik);
        shikshaMitraToast.success({ message: 'Bank Details updated successfully' });
      } else if (activeTabIndex === 5) {
        await handleReportingManager(formik.values, formik, editData?.id);
        shikshaMitraToast.success({ message: 'Assign Reporting Manager updated successfully' });
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Initialize formik with combined initial values from all form sections
  const formik = useFormik({
    initialValues: {
      ...personalInformationInitialValues(),
      ...familyInformationInitialValues(),
      ...additionalDetailsInitialValues(),
      ...workExperienceInitialValues(),
      ...payrollInitialValues(),
      ...assignReportingManagerInitialValues(),
    },
    // Use validation schema based on active tab
    validationSchema: infoValidations[activeTabIndex],

    onSubmit: async (values, { setSubmitting }) => {
      await onSubmit(values);
      setSubmitting(false);
    },
  });
  return (
    <Box
      sx={{
        height: '100%',
      }}
      // sx={{
      //   '& input': { fontSize: '12px' },
      //   '& label': { fontSize: '12px' },
      // }}
    >
      {/* <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}> */}
      <form onSubmit={formik.handleSubmit} style={{ height: '100%' }}>
        <Card
          sx={{
            px: 0,
            display: 'flex',
            flexDirection: 'row',
            height: '100%', // Ensure there's enough height for vertical tabs
            // '& *': { fontSize: '13px !important', '& svg': { fontSize: '18px !important' } },
          }}
        >
          <Box sx={{ borderRight: 1, borderColor: 'divider', minWidth: 240, maxWidth: 240 }}>
            <CustomTabs
              orientation="vertical"
              variant="scrollable"
              value={tabs.value}
              onChange={handleTabChange}
              sx={{ borderRight: 1, borderColor: 'divider', height: '100%' }}
              // slotProps={{ tab: { px: 0 } }}
            >
              {TABS.map((tab) => (
                <Tab
                  key={tab.value}
                  value={tab.value}
                  label={tab.label}
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    textAlign: 'left',
                    justifyContent: 'start',
                  }}
                />
              ))}
            </CustomTabs>
          </Box>

          <Scrollbar
            sx={{ flexGrow: 1, width: 'calc(100% - 240px)', height: '100%', overflow: 'auto' }}
          >
            <ViewInformationScreen
              isBackClick={isBackClick}
              activeTabIndex={activeTabIndex}
              allFields={fields}
              formik={formik}
              editData={editData}
              isEdit={isEdit}
            />
          </Scrollbar>
          {/* </CardContent>
          </Card> */}
        </Card>
      </form>
      {/* </BackPopUpChecked> */}
    </Box>
  );
};

export default EmployeeInformation;

const ViewInformationScreen = ({
  isBackClick,
  activeTabIndex,
  allFields,
  formik,
  editData,
  isEdit,
}: any) => {
  const initializedStepsRef = React.useRef<Record<number, boolean>>({});
  const { data: basicDetails, isLoading: basicDetailsLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetBasicInformationQuery,
    params: editData?.id,
    options: {
      skip: !(editData?.id && activeTabIndex === 0),
    },
  });

  const { data: familyDetails, isLoading: familyDetailsLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetFamilyInformationQuery,
    params: editData?.id,
    options: {
      skip: !(editData?.id && activeTabIndex === 1),
    },
  });
  const { data: additionalDetails, isLoading: additionalDetailsLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetAdditionalInformationQuery,
    params: editData?.id,
    options: {
      skip: !(editData?.id && activeTabIndex === 2),
    },
  });
  const { data: workExperience, isLoading: workExperienceLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetWorkExperienceQuery,
    params: editData?.id,
    options: {
      skip: !(editData?.id && activeTabIndex === 3),
    },
  });
  const { data: bankDetails, isLoading: bankDetailsLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetBankDetailsQuery,
    params: editData?.id,
    options: {
      skip: !(editData?.id && activeTabIndex === 4),
    },
  });

  const { data: reportingManagerDetails, isLoading: reportingManagerDetailsLoading } =
    useQueryAndMutation({
      type: 'query',
      currentQueryAndMutation: useGetReportingManagerByEmployeeIdQuery,
      params: editData?.id,
      options: {
        skip: !(editData?.id && activeTabIndex === 5),
      },
    });

  useEffect(() => {
    if (initializedStepsRef.current[activeTabIndex]) return;
    if (basicDetails && activeTabIndex === 0) {
      formik.setValues((pre: any) => ({
        ...pre,
        ...personalInformationInitialValues(basicDetails),
      }));
      initializedStepsRef.current[activeTabIndex] = true;
    } else if (familyDetails && activeTabIndex === 1) {
      formik.setValues((pre: any) => ({
        ...pre,
        ...familyInformationInitialValues(familyDetails),
      }));
      initializedStepsRef.current[activeTabIndex] = true;
    } else if (additionalDetails && activeTabIndex === 2) {
      formik.setValues((pre: any) => ({
        ...pre,
        ...additionalDetailsInitialValues(additionalDetails),
      }));
      initializedStepsRef.current[activeTabIndex] = true;
    } else if (workExperience && activeTabIndex === 3) {
      formik.setValues((pre: any) => ({
        ...pre,
        ...workExperienceInitialValues(workExperience),
      }));
      initializedStepsRef.current[activeTabIndex] = true;
    } else if (bankDetails && activeTabIndex === 4) {
      formik.setValues((pre: any) => ({
        ...pre,
        ...payrollInitialValues(bankDetails),
      }));
      initializedStepsRef.current[activeTabIndex] = true;
    } else if (reportingManagerDetails && activeTabIndex === 5) {
      formik.setValues((pre: any) => ({
        ...pre,
        ...assignReportingManagerInitialValues(reportingManagerDetails),
      }));
      initializedStepsRef.current[activeTabIndex] = true;
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    basicDetails,
    familyDetails,
    additionalDetails,
    workExperience,
    bankDetails,
    reportingManagerDetails,
    activeTabIndex,
  ]);

  return (
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
      {basicDetailsLoading ||
      familyDetailsLoading ||
      additionalDetailsLoading ||
      workExperienceLoading ||
      bankDetailsLoading ||
      reportingManagerDetailsLoading ? (
        <LoadingScreen />
      ) : (
        <Grid container spacing={2} p={2}>
          {' '}
          {allFields[activeTabIndex].map((field: FieldsType, index: number) => (
            <Grid
              size={{
                xs: [1, 2, 3].includes(activeTabIndex) ? 12 : 4,
                md: [1, 2, 3].includes(activeTabIndex) ? 12 : 4,
              }}
              key={field.name}
              {...field.gridProps}
              mb="15px"
            >
              {field.renderComp ? (
                field.renderComp({
                  formik,
                  field,
                  editData,
                })
              ) : field.type === 'date' ? (
                <ShakingTextField
                  error={
                    formik.touched[field.name as keyof typeof formik.values] &&
                    Boolean(formik.errors[field.name as keyof typeof formik.values])
                  }
                >
                  <DatePicker
                    label={field.label}
                    name={field.name}
                    // @ts-ignore
                    value={formik.values[field.name as number] as any}
                    format="DD-MM-YYYY"
                    onChange={(newValue) => formik.setFieldValue(field.name, newValue)}
                    sx={{
                      ...((field?.sx as any) || {}),
                    }}
                    disabled={!isEdit}
                    slotProps={{
                      textField: {
                        placeholder: field.placeholder,
                        fullWidth: true,
                        size: 'small',
                        helperText:
                          formik.touched[field.name as keyof typeof formik.values] &&
                          formik.errors[field.name as keyof typeof formik.values]
                            ? String(formik.errors[field.name as keyof typeof formik.values])
                            : undefined,
                        error:
                          formik.touched[field.name as keyof typeof formik.values] &&
                          Boolean(formik.errors[field.name as keyof typeof formik.values]),
                      },
                    }}
                  />
                </ShakingTextField>
              ) : (
                <ShakingTextField
                  error={
                    formik.touched[field.name as keyof typeof formik.values] &&
                    Boolean(formik.errors[field.name as keyof typeof formik.values])
                  }
                >
                  <TextField
                    key={field.name}
                    type={field.type}
                    size="small"
                    label={field.label}
                    name={field.name}
                    disabled={!isEdit}
                    placeholder={field.placeholder}
                    value={formik.values[field.name as keyof typeof formik.values]}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched[field.name as keyof typeof formik.values] &&
                      Boolean(formik.errors[field.name as keyof typeof formik.values])
                    }
                    helperText={
                      formik.touched[field.name as keyof typeof formik.values] &&
                      formik.errors[field.name as keyof typeof formik.values]
                        ? String(formik.errors[field.name as keyof typeof formik.values])
                        : undefined
                    }
                    fullWidth
                    sx={{ ...(field?.sx || {}) }}
                    {...(field?.otherProps || {})}
                  />
                </ShakingTextField>
              )}
            </Grid>
          ))}{' '}
        </Grid>
      )}
    </FormSlider>
  );
};
