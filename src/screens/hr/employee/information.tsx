// import { isValidPhoneNumber } from 'react-phone-number-input/input';

import { useFormik } from 'formik';
import { useMemo, useState, useCallback } from 'react';

import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Tab, Box, Card, Grid, Stack, Button, TextField } from '@mui/material';

import { useTabs } from 'src/hooks/use-tabs';

import { GlobalIcons } from 'src/utils/icons';

import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import {
  useUpdateEmployeeMutation,
  useUpdateBankDetailsMutation,
  useUpdateFamilyInformationMutation,
  useUpdateExperienceInformationMutation,
} from 'src/redux/employee/employeeApi';

import { Iconify } from 'src/components/iconify';
import { CustomTabs } from 'src/components/custom-tabs';
import ShakingTextField from 'src/components/shaking-text-field';

import { validations } from './employee-form-validation';
// import {
//   FamilyFields,
//   PayrollFields,
//   WorkExperienceFields,
import { FamilyFields } from './employee-form-fields/FamilyFields';
import { PayrollFields } from './employee-form-fields/PayrollFields';
import { InformationFields } from './employee-form-fields/InformationFields';
import { WorkExperienceFields } from './employee-form-fields/WorkExperienceFields';
// } from './employee-form-fields';
import {
  payrollInitialValues,
  workExperienceInitialValues,
  familyInformationInitialValues,
  personalInformationInitialValues,
} from './employee-form';

//   InformationFields,
import type { FieldsType } from './employee-form-fields/types';

const fields = [InformationFields, FamilyFields, WorkExperienceFields, PayrollFields];
// const fields = [InformationFields];

const TABS = [
  { value: 'personalInformation', label: 'Personal Information' },
  { value: 'familyInformation', label: 'Family Information' },
  { value: 'workExperience', label: 'Work Experience' },
  { value: 'payroll', label: 'Payroll' },
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

  // Empty submit handler
  const onSubmit = (_val: any) => {};

  // Initialize formik with combined initial values from all form sections
  const formik = useFormik({
    initialValues: {
      ...personalInformationInitialValues(editData),
      ...familyInformationInitialValues(editData),
      ...workExperienceInitialValues(editData),
      ...payrollInitialValues(editData),
    },
    // Use validation schema based on active tab
    validationSchema: validations[activeTabIndex],
    onSubmit: (values) => {
      onSubmit(values);
    },
  });

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

  // Handler for updateFamilyInformation
  const handleFamilyInformation = useCallback(
    async (values: any, f: any) => {
      const res = await updateFamilyInfo({
        employeeId: values.employeeId,
        body: {
          fatherDetails: {
            name: values.fatherName,
            occupation: values.fatherOccupation,
            contactNo: values.fatherContactNo,
            address1: values.fatherAddress1,
            address2: values.fatherAddress2,
            address3: values.fatherAddress3,
            countryName: values?.fatherCountry?.name,
            countryIsoCode: values?.fatherCountry?.isoCode,
            stateName: values?.fatherState?.name,
            stateIsoCode: values?.fatherState?.isoCode,
            city: values?.fatherCity?.name,
            pincode: values.fatherPinCode,
          },
          motherDetails: {
            name: values.motherName,
            occupation: values.motherOccupation,
            contactNo: values.motherContactNo,
            address1: values.motherAddress1,
            address2: values.motherAddress2,
            address3: values.motherAddress3,

            countryName: values?.motherCountry?.name,
            countryIsoCode: values?.motherCountry?.isoCode,
            stateName: values?.motherState?.name,
            stateIsoCode: values?.motherState?.isoCode,

            city: values?.motherCity?.name,
            pincode: values.motherPinCode,
          },
          spouseDetails: {
            name: values.spouseName,
            occupation: values.spouseOccupation,
            contactNo: values.spouseContactNo,
            address1: values.spouseAddress1,
            address2: values.spouseAddress2,
            address3: values.spouseAddress3,
            countryName: values?.spouseCountry?.name,
            countryIsoCode: values?.spouseCountry?.isoCode,
            stateName: values?.spouseState?.name,
            stateIsoCode: values?.spouseState?.isoCode,
            city: values?.spouseCity?.name,
            pincode: values.spousePinCode,
          },
        },
      });
      return res;
    },
    [updateFamilyInfo]
  );

  // Handler for updateEmployee
  const handelUpdateEmployee = useCallback(
    async (values: any, empl: any, id: any) => {
      try {
        const res = await updateEmployee({
          id,
          body: {
            // userId: res.data.id,

            // employeeCode: values.code,
            lastName: values.lastName,
            firstName: values.firstName,
            middleName: values.middleName,
            shortName: values.shortName,

            employeeStatusType: values.employeeStatusType,

            dateOfBirth: values.dob.format('YYYY-MM-DD'),
            familyCast: values.familyCast,
            castType: values.castType,
            genderType: values.gender,
            religion: values.religion,
            maritalStatus: values.maritalStatus,
            bloodGroup: values.bloodGroup,
            mobileNo: values.mobileNo,
            email: values.email,

            department: values.department,
            designation: values.designation,
            dateOfJoining: values.dateOfJoining.format('YYYY-MM-DD'),

            employeeGroup: values.employeeGroup,
            qualification: values.qualification,
            roleId: values.role,
            identificationMark1: values.identificationMark1,

            address1: values.addressLine1,
            address2: values.addressLine2,
            address3: values.addressLine3,

            country: { name: values?.country?.name, isoCode: values?.country?.isoCode },
            city: values?.city?.name,
            state: { name: values?.state?.name, isoCode: values?.state?.isoCode },

            pincode: `${values.pincode}`,
            educationMediumStageId: values.organization,
          },
        });

        return res;
      } catch (error) {
        throw new Error(error);
      }
    },
    [updateEmployee]
  );

  // Handler for tab changes - resets edit mode when switching tabs
  const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
    setIsEdit(false);
    tabs.setValue(newValue);
  };

  // handler TO update experience
  const handleWorkExperience = useCallback(
    async (values: any, work: any) => {
      const res = await updateExperienceInfo({
        employeeId: values.employeeId,
        body: values.experiences.map((i: any) => ({
          ...i,
          fromDate: i.fromDate ? i.fromDate.format('YYYY-MM-DD') : null,
          toDate: i.toDate ? i.toDate.format('YYYY-MM-DD') : null,
        })),
      });
      return res;
    },
    [updateExperienceInfo]
  );

  // Handler for updateBankDetailsInformation
  const handleBankDetailsInformation = useCallback(
    async (values: any, bank: any) => {
      const res = updateBankDetails({
        employeeId: values.employeeId,
        body: {
          bankName: values.bankName,
          branchName: values.branchName,
          accountHolderName: values.accountHolderName,
          accountNumber: values.accountNumber,
          ifscCode: values.ifscCode,
        },
      });
      return res;
    },
    [updateBankDetails]
  );
  return (
    <Box
    // sx={{
    //   '& input': { fontSize: '12px' },
    //   '& label': { fontSize: '12px' },
    // }}
    >
      <form onSubmit={formik.handleSubmit}>
        <Card
          sx={{
            px: 0,
            // '& *': { fontSize: '13px !important', '& svg': { fontSize: '18px !important' } },
          }}
        >
          <CustomTabs
            value={tabs.value}
            onChange={handleTabChange}
            variant="fullWidth"
            // slotProps={{ tab: { px: 0 } }}
          >
            {TABS.map((tab) => (
              <Tab key={tab.value} value={tab.value} label={tab.label} />
            ))}
          </CustomTabs>

          <Stack direction="row" justifyContent="flex-end" sx={{ px: 2, pt: 2 }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={
                <Iconify
                  icon={isEdit ? 'icon-park-solid:save' : 'solar:pen-bold'}
                  sx={{ cursor: 'pointer', height: '18px', width: '18px' }}
                />
              }
              onClick={() => {
                setIsEdit(!isEdit);
                if (isEdit) {
                  if (activeTabIndex === 0) {
                    handelUpdateEmployee(formik.values, formik, editData?.id);
                  } else if (activeTabIndex === 1) {
                    handleFamilyInformation(formik.values, formik);
                  } else if (activeTabIndex === 2) {
                    console.log('2');
                    handleWorkExperience(formik.values, formik);
                  } else if (activeTabIndex === 3) {
                    handleBankDetailsInformation(formik.values, formik);
                  } else if (activeTabIndex === 4) {
                    handleBankDetailsInformation(formik.values, formik);
                  }
                }
                // popover.onClose();
              }}
            >
              {isEdit ? 'Save' : 'Edit'}
            </Button>{' '}
            &nbsp;
            {isEdit && (
              <Button
                variant="outlined"
                size="small"
                startIcon={
                  <Iconify
                    icon={isEdit ? GlobalIcons.submit : 'solar:pen-bold'}
                    sx={{ cursor: 'pointer', height: '18px', width: '18px' }}
                  />
                }
                onClick={() => {
                  formik.resetForm({
                    values: {
                      ...personalInformationInitialValues(editData),
                      ...familyInformationInitialValues(editData),
                      ...workExperienceInitialValues(editData),
                      ...payrollInitialValues(editData),
                    },
                  });
                  setIsEdit(false);
                  // popover.onClose();
                }}
              >
                Cancel
              </Button>
            )}
          </Stack>
          {/* <Card
            sx={{ backgroundColor: (theme) => theme.palette.background.paper, boxShadow: 'none' }}
          >
            <CardContent
              sx={{
                width: '100%',
                p: 2,
                // '& .Mui-disabled': {
                //   // color: (theme) => `${theme.palette.text.primary} !important`,
                //   '-webkit-text-fill-color': 'unset',
                //   cursor: 'no-drop',
                // },
                // '& .MuiInputLabel-shrink.Mui-disabled': {
                //   // color: (theme) => `${theme.palette.text.disabled} !important`,
                // },
              }}
            > */}
          <Grid container spacing={2} p={2}>
            {' '}
            {fields[activeTabIndex].map((field: FieldsType, index: number) => (
              <Grid
                item
                xs={[1, 2].includes(activeTabIndex) ? 12 : 4}
                md={[1, 2].includes(activeTabIndex) ? 12 : 4}
                key={field.name}
                {...field.gridProps}
                mb="15px"
              >
                {field.renderComp ? (
                  field.renderComp({
                    formik,
                    field,
                    disabled: !isEdit,
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
                      value={formik.values[field.name as keyof typeof formik.values]}
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
          {/* </CardContent>
          </Card> */}
        </Card>
      </form>
    </Box>
  );
};

export default EmployeeInformation;
