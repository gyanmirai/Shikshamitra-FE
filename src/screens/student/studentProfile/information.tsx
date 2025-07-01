// import { isValidPhoneNumber } from 'react-phone-number-input/input';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useMemo, useState } from 'react';

import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Tab, Box, Grid, Card, TextField } from '@mui/material';

import { useTabs } from 'src/hooks/use-tabs';

import { CustomTabs } from 'src/components/custom-tabs';

import { FormSlider } from '../enrollment/register/register-form';
import { familyFields } from '../enrollment/register/register-fields';
import { generalFormFields } from '../enrollment/register/GeneralFormFields';
import { medicalFields } from '../enrollment/register/render-medical-details';
import { bankDetailsFields } from '../enrollment/register/render-bank-details';
import { communicationFields } from '../enrollment/register/render-communication';
import { previousSchoolFields } from '../enrollment/register/render-previous-details';
import { additionalDetailsFields } from '../enrollment/register/render-additional-details';
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
          <CustomTabs value={tabs.value} onChange={handleTabChange} variant="fullWidth">
            {TABS.map((tab) => (
              <Tab key={tab.value} value={tab.value} label={tab.label} />
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
                  item
                  xs={[1].includes(activeTabIndex) ? 12 : 3}
                  md={[1].includes(activeTabIndex) ? 12 : 3}
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
