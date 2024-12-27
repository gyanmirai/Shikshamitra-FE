// import { isValidPhoneNumber } from 'react-phone-number-input/input';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useMemo, useState } from 'react';

import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Tab, Box, Card, Grid, Stack, Button, TextField, CardContent } from '@mui/material';

import { useTabs } from 'src/hooks/use-tabs';

import { Iconify } from 'src/components/iconify';
import { CustomTabs } from 'src/components/custom-tabs';

import {
  FamilyFields,
  PayrollFields,
  InformationFields,
  WorkExperienceFields,
} from './employee-form-fields';
import {
  payrollInitialValues,
  workExperienceInitialValues,
  familyInformationInitialValues,
  personalInformationInitialValues,
} from './employee-form';

import type { FieldsType } from './employee-form-fields';

const fields = [InformationFields, FamilyFields, WorkExperienceFields, PayrollFields];

const TABS = [
  { value: 'personalInformation', label: 'Personal Information' },
  { value: 'familyInformation', label: 'Family Information' },
  { value: 'workExperience', label: 'Work Experience' },
  { value: 'payroll', label: 'Payroll' },
  //   { value: 'performanceAndDevelopment', label: 'Performance and Development' },
];

export function EmployeeInformation({ editData }: { editData: any }) {
  const [isEdit, setIsEdit] = useState(false);
  const onSubmit = (_val: any) => {};
  const formik = useFormik({
    initialValues: {
      ...personalInformationInitialValues(editData),
      ...familyInformationInitialValues(editData),
      ...workExperienceInitialValues(editData),
      ...payrollInitialValues(editData),
    },
    validationSchema: Yup.object().shape({}),
    onSubmit: (values) => {
      onSubmit(values);
    },
  });

  const tabs = useTabs('personalInformation');
  const activeTabIndex = useMemo(
    () => TABS.findIndex((tab) => tab.value === tabs.value),
    [tabs.value]
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
            px: 1,
            // '& *': { fontSize: '13px !important', '& svg': { fontSize: '18px !important' } },
          }}
        >
          <CustomTabs
            value={tabs.value}
            onChange={tabs.onChange}
            variant="fullWidth"
            slotProps={{ tab: { px: 0 } }}
          >
            {TABS.map((tab) => (
              <Tab key={tab.value} value={tab.value} label={tab.label} />
            ))}
          </CustomTabs>

          <Stack direction="row" justifyContent="flex-end" sx={{ my: 1 }}>
            <Button
              startIcon={
                <Iconify
                  icon={isEdit ? 'icon-park-solid:save' : 'solar:pen-bold'}
                  sx={{ cursor: 'pointer', height: '18px', width: '18px' }}
                />
              }
              onClick={() => {
                setIsEdit(!isEdit);
                // popover.onClose();
              }}
            >
              {isEdit ? 'Save' : 'Edit'}
            </Button>
          </Stack>
          <Card sx={{ backgroundColor: (theme) => theme.palette.background.paper }}>
            <CardContent
              sx={{
                width: '100%',
                p: 2,
                '& .Mui-disabled': {
                  // color: (theme) => `${theme.palette.text.primary} !important`,
                  '-webkit-text-fill-color': 'unset',
                  cursor: 'no-drop',
                },
                '& .MuiInputLabel-shrink.Mui-disabled': {
                  // color: (theme) => `${theme.palette.text.disabled} !important`,
                },
              }}
            >
              <Grid container spacing={2}>
                {' '}
                {fields[activeTabIndex].map((field: FieldsType, index: number) => (
                  <Grid
                    item
                    xs={[1, 2].includes(activeTabIndex) ? 12 : 4}
                    md={[1, 2].includes(activeTabIndex) ? 12 : 4}
                    key={field.name}
                  >
                    {field.renderComp ? (
                      field.renderComp({ formik, field, disabled: !isEdit })
                    ) : field.type === 'date' ? (
                      <DatePicker
                        label={field.label}
                        name={field.name}
                        value={formik.values[field.name as keyof typeof formik.values]}
                        format="DD/MM/YYYY"
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
                    ) : (
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
                    )}
                  </Grid>
                ))}{' '}
              </Grid>
            </CardContent>
          </Card>
        </Card>
      </form>
    </Box>
  );
}
