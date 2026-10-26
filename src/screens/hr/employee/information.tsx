// import { isValidPhoneNumber } from 'react-phone-number-input/input';

import { useFormik } from 'formik';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { motion, AnimatePresence } from 'framer-motion';
import { shikshaMitraToast } from 'src/components/toast';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import ShakingTextField from 'src/components/shaking-text-field';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useCustomSearchParams } from 'src/hooks/use-search-param';
import { Box, Card, Grid, Button, TextField } from '@mui/material';
import { dateFormat, dateConvertor } from 'src/utils/dateConvertor';
import React, { useMemo, useState, useEffect, useCallback } from 'react';
import {
  useGetBankDetailsQuery,
  useUpdateEmployeeMutation,
  useGetWorkExperienceQuery,
  useGetBasicInformationQuery,
  useGetFamilyInformationQuery,
  useGetAdditionalInformationQuery,
  useUpdateFamilyInformationMutation,
  useUpdateExperienceInformationMutation,
  useUpdateAdditionalInformationMutation,
  useGetReportingManagerByEmployeeIdQuery,
  useUpdateReportingManagerByEmployeeIdMutation,
} from 'src/redux/hr/employeeApi';

import { infoValidations } from './employee-form-validation';
import { FamilyFields } from './employee-form-fields/FamilyFields';
import { PayrollFields } from './employee-form-fields/PayrollFields';
import { buildWorkExperiencePayload } from './work-experience-payload';
import EmployeeAccountEmailAction from './employee-account-email-action';
import { InformationFields } from './employee-form-fields/InformationFields';
import { WorkExperienceFields } from './employee-form-fields/WorkExperienceFields';
import { buildProfilePersonalInfoUpdatePayload } from './personal-info-update-payload';
import { AssignReportingManager } from './employee-form-fields/AssignReportingManager';
import { AdditionalDetailsFields } from './employee-form-fields/AdditionalDetailsFields';
import { AcademicPermissionFields } from './employee-form-fields/AcademicPermissionFields';
import {
  PayrollSkeleton,
  WorkExperienceSkeleton,
  ReportingManagerSkeleton,
  FamilyInformationSkeleton,
  AdditionalDetailsSkeleton,
  AcademicPermissionSkeleton,
  PersonalInformationSkeleton,
} from './employee-form-skeleton';
import {
  toRawMobile,
  payrollInitialValues,
  workExperienceInitialValues,
  familyInformationInitialValues,
  additionalDetailsInitialValues,
  personalInformationInitialValues,
  assignReportingManagerInitialValues,
} from './employee-form';

//   InformationFields,
import type { FieldsType } from './employee-form-fields/types';

const TabSkeleton = ({ activeTabIndex }: { activeTabIndex: number }) => {
  switch (activeTabIndex) {
    case 0:
      return <PersonalInformationSkeleton />;
    case 1:
      return <FamilyInformationSkeleton />;
    case 2:
      return <AdditionalDetailsSkeleton />;
    case 3:
      return <WorkExperienceSkeleton />;
    case 4:
      return <PayrollSkeleton />;
    case 5:
      return <ReportingManagerSkeleton />;
    case 6:
      return <AcademicPermissionSkeleton />;
    default:
      return null;
  }
};

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
  {
    value: 'personalInformation',
    label: 'Personal Information',
    icon: <Iconify icon="solar:user-id-outline" width={20} />,
  },
  {
    value: 'familyInformation',
    label: 'Family Information',
    icon: <Iconify icon="solar:users-group-rounded-outline" width={20} />,
  },
  {
    value: 'additionalFields',
    label: 'Additional Information',
    icon: <Iconify icon="solar:document-text-outline" width={20} />,
  },
  {
    value: 'workExperience',
    label: 'Work Experience',
    icon: <Iconify icon="solar:case-outline" width={20} />,
  },
  {
    value: 'payroll',
    label: 'Payroll',
    icon: <Iconify icon="solar:wallet-outline" width={20} />,
  },
  {
    value: 'assignReportingManager',
    label: 'Assign Reporting Manager',
    icon: <Iconify icon="solar:user-check-outline" width={20} />,
  },
];

const TabButton = React.memo(
  ({
    tab,
    isSelected,
    onTabChange,
  }: {
    tab: (typeof TABS)[0];
    isSelected: boolean;
    onTabChange: (value: string) => void;
  }) => (
    <Button
      onClick={() => onTabChange(tab.value)}
      variant="text"
      color="inherit"
      startIcon={tab.icon}
      sx={{
        position: 'relative',
        justifyContent: 'flex-start',
        px: 2,
        py: 1.5,
        textAlign: 'left',
        backgroundColor: (theme) => (isSelected ? theme.palette.action.hover : 'transparent'),
        color: isSelected ? 'inherit' : 'text.secondary',
        ...(isSelected
          ? {
              '&::before': {
                content: '""',
                position: 'absolute',
                left: '2px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '4px',
                height: '80%',
                borderLeft: (theme) =>
                  isSelected ? `4px solid ${theme.palette.primary.main}` : 'none',
              },
            }
          : {}),
      }}
    >
      {tab.label}
    </Button>
  )
);

const EmployeeInformation = ({ editData }: { editData: any }) => {
  const { getAllParams, setParam } = useCustomSearchParams({ infoTab: 'personalInformation' });
  const searchParams = getAllParams();

  // Find the index of the active tab based on the current tab value
  const activeTabIndex = useMemo(() => {
    const index = TABS.findIndex(
      (tab) => tab.value === (searchParams.infoTab || 'personalInformation')
    );
    return index === -1 ? 0 : index;
  }, [searchParams.infoTab]);
  // State to control edit mode
  const [isEdit, setIsEdit] = useState(false);

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
    async (values: any, formik: any, id?: any) => {
      const res = await updateFamilyInfo({
        employeeId: values.employeeId || id,
        body: {
          id: values.employeeId || id,
          fatherDetails: {
            name: values.fatherName,
            occupation: values.fatherOccupation,
            mobileNo: toRawMobile(values.fatherContactNo) || null,
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
            mobileNo: toRawMobile(values.motherContactNo) || null,
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
            mobileNo: toRawMobile(values.spouseContactNo) || null,
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
  const handleUpdateEmployee = useCallback(
    async (values: any, formik: any, id: any) => {
      const body = buildProfilePersonalInfoUpdatePayload(values, {
        initialValues: formik.initialValues,
      });

      const res = await updateEmployee({
        id,
        body,
      }).unwrap();

      return res;
    },
    [updateEmployee]
  );

  // Handler for tab changes - resets edit mode when switching tabs
  const handleTabChange = useCallback(
    (tabValue: string) => {
      const newIndex = TABS.findIndex((tab) => tab.value === tabValue);
      if (activeTabIndex > newIndex) {
        setIsBackClick(true);
      } else {
        setIsBackClick(false);
      }
      setIsEdit(false);
      setParam('infoTab', tabValue);
    },
    [activeTabIndex, setParam]
  );

  // handler TO update experience
  const handleWorkExperience = useCallback(
    async (values: any, formik: any, id?: any) => {
      const res = await updateExperienceInfo({
        employeeId: values.employeeId || id,
        body: values.experiences.map((i: any) =>
          buildWorkExperiencePayload(i, (date) => dateConvertor(date.format(dateFormat)))
        ),
      }).unwrap();
      return res;
    },
    [updateExperienceInfo]
  );

  const handleAdditionalDetails = useCallback(
    async (values: any, formik: any, id?: any) => {
      const res = await updateAdditionalInfo({
        employeeId: values.employeeId || id,
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
      const employeeId = values.employeeId || id;
      if (!employeeId) {
        throw new Error('Staff must be saved before reporting manager can be updated.');
      }

      const res = await updateReportingManager({
        id: employeeId,
        body: {
          reportingManagerId: values?.reportingManager,
          reportingManagerKind: values?.reportingManagerKind ?? 'Employee',
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
        await handleUpdateEmployee(formik.values, formik, editData?.id);
        shikshaMitraToast.success({ message: 'Staff details updated successfully' });
      } else if (activeTabIndex === 1) {
        await handleFamilyInformation(formik.values, formik, editData?.id);
        shikshaMitraToast.success({ message: 'Family Details updated successfully' });
      } else if (activeTabIndex === 2) {
        await handleAdditionalDetails(formik.values, formik, editData?.id);
        shikshaMitraToast.success({ message: 'Additional Details updated successfully' });
      } else if (activeTabIndex === 3) {
        await handleWorkExperience(formik.values, formik, editData?.id);
        shikshaMitraToast.success({ message: 'Work Experience  updated successfully' });
      } else if (activeTabIndex === 4) {
        // Payroll profile drawers save independently.
      } else if (activeTabIndex === 5) {
        await handleReportingManager(formik.values, formik, editData?.id);
        shikshaMitraToast.success({ message: 'Assign Reporting Manager updated successfully' });
      }
    } catch (error) {
      console.error(error);
      shikshaMitraToast.error({
        message:
          (error as any)?.data?.message || (error as any)?.error || 'Failed to save staff details',
      });
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
    <Grid
      container
      spacing={1}
      sx={{
        mt: 0,
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: '0',
      }}
    >
      {/* Left Section - Navigation List */}
      <Grid size={{ xs: 12, md: 4, lg: 2.3 }} sx={{ height: '100%' }}>
        <Card sx={{ height: '100%', p: 1 }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
            }}
          >
            {TABS.map((tab) => (
              <TabButton
                key={tab.value}
                tab={tab}
                isSelected={searchParams.infoTab === tab.value}
                onTabChange={handleTabChange}
              />
            ))}
          </Box>
        </Card>
      </Grid>

      {/* Right Section - Content */}
      <Grid size={{ xs: 12, md: 8, lg: 9.7 }} sx={{ height: '100%' }}>
        <Box
          sx={{
            gap: 1,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            minHeight: '0',
          }}
        >
          <Card sx={{ p: 1, flexGrow: 1, height: '100%', overflow: 'hidden' }}>
            <Scrollbar sx={{ height: '100%' }}>
              <Box sx={{ p: 2 }}>
                {activeTabIndex === 0 && !isEdit && editData?.id &&
                  <EmployeeAccountEmailAction employeeId={editData.id} />
                }
                <form onSubmit={formik.handleSubmit}>
                  <ViewInformationScreen
                    isBackClick={isBackClick}
                    activeTabIndex={activeTabIndex}
                    allFields={fields}
                    formik={formik}
                    editData={editData}
                    isEdit={isEdit}
                    setIsEdit={setIsEdit}
                  />
                </form>
              </Box>
            </Scrollbar>
          </Card>
        </Box>
      </Grid>
    </Grid>
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
  setIsEdit,
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
    <AnimatePresence mode="wait">
      <motion.div
        key={activeTabIndex}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.25 }}
        style={{ height: '100%' }}
      >
        <Box sx={{ height: '100%' }}>
          {basicDetailsLoading ||
          familyDetailsLoading ||
          additionalDetailsLoading ||
          workExperienceLoading ||
          bankDetailsLoading ||
          reportingManagerDetailsLoading ? (
            <TabSkeleton activeTabIndex={activeTabIndex} />
          ) : (
            <Grid container spacing={2}>
              {' '}
              {allFields[activeTabIndex]?.map((field: FieldsType, index: number) => (
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
        </Box>
      </motion.div>
    </AnimatePresence>
  );
};
