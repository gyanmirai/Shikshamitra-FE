// import { isValidPhoneNumber } from 'react-phone-number-input/input';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useMemo, useState } from 'react';

import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Tab, Box, Grid, Card, Stack, Button, TextField, CardContent } from '@mui/material';

import { useTabs } from 'src/hooks/use-tabs';

import { Iconify } from 'src/components/iconify';
import { CustomTabs } from 'src/components/custom-tabs';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

import { generalFormFields } from '../enrollment/register/GeneralFormFields';
import {
  familyFields,
  medicalFields,
  bankDetailsFields,
  communicationFields,
  previousSchoolFields,
  additionalDetailsFields,
} from '../enrollment/register/register-fields';
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
  { value: 'admission', label: 'Family Information' },
  { value: 'communication', label: 'Communication' },
  { value: 'additionalDetails', label: 'Additional Details' },
  { value: 'medicalRecords', label: 'Medical Records' },
  { value: 'previousSchool', label: 'Previous School Details' },
  { value: 'bankDetails', label: 'Parents Bank Details' },
];

export function StudentInformation(props: StudentTabsComponentType) {
  const { student } = props;
  const [isEdit, setIsEdit] = useState(false);
  // const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  // const dispatch = useDispatch();
  const onSubmit = (_val: any) => {};
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
    validationSchema: Yup.object().shape({}),
    onSubmit: (values) => {
      onSubmit(values);
    },
  });

  const tabs = useTabs('general');
  const activeTabIndex = useMemo(
    () => TABS.findIndex((tab) => tab.value === tabs.value),
    [tabs.value]
  );

  // useEffect(() => {
  //   if (isChanges) {
  //     // dispatch(setIsChanges(false));
  //     // setEditData(null);
  //   } else {
  //     // formDialog.onFalse();
  //     // setEditData(null);
  //   }
  // }, [dispatch, isChanges, tabs.value]);

  return (
    <Box
      sx={
        {
          // '& input': { fontSize: '12px' },
          // '& label': { fontSize: '12px' },
        }
      }
    >
      <BackPopUpChecked initialValues={initialValues} currentValues={formik.values}>
        <Box component="form" onSubmit={formik.handleSubmit}>
          <Card
            sx={{
              px: 1,
              '& *': { fontSize: '13px !important', '& svg': { fontSize: '18px !important' } },
            }}
          >
            <CustomTabs
              value={tabs.value}
              onChange={tabs.onChange}
              variant="fullWidth"
              slotProps={{
                tab: {
                  px: 0,

                  // fontSize: '12px'
                },
              }}
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
            <Box sx={{ backgroundColor: (theme) => theme.palette.background.paper }}>
              <CardContent
                sx={{
                  width: '100%',
                  p: 0,
                  '& .Mui-disabled': {
                    cursor: 'no-drop',
                  },
                  '& .MuiInputLabel-shrink.Mui-disabled': {
                    color: (theme) => `${theme.palette.text.disabled} !important`,
                  },
                }}
              >
                {/* <Scrollbar sx={{ width: '100%' }}> */}
                <Grid container spacing={2} p={2}>
                  {fields[activeTabIndex].map((field: FieldsType) => (
                    <Grid
                      item
                      xs={[1].includes(activeTabIndex) ? 12 : 3}
                      md={[1].includes(activeTabIndex) ? 12 : 3}
                      key={field.name}
                      {...(field.gridProps || {})}
                    >
                      {field.renderComp ? (
                        field.renderComp({ formik, field, isEdit })
                      ) : field.type === 'date' ? (
                        <DatePicker
                          label={field.label}
                          name={field.name}
                          value={formik.values[field.name]}
                          format="DD/MM/YYYY"
                          onChange={(newValue) => formik.setFieldValue(field.name, newValue)}
                          disabled={!isEdit}
                          slotProps={{
                            textField: {
                              placeholder: field.placeholder,
                              fullWidth: true,
                              size: 'small',
                              helperText: formik.touched[field.name] && formik.errors[field.name],
                              error:
                                formik.touched[field.name] && Boolean(formik.errors[field.name]),
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
                {/* </Scrollbar> */}
              </CardContent>
            </Box>
          </Card>
        </Box>
      </BackPopUpChecked>
    </Box>
  );
}
