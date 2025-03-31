/* eslint-disable react/no-this-in-sfc */
import type { Dayjs } from 'dayjs';
import type { RootState } from 'src/redux/store';

import dayjs from 'dayjs';
import * as Yup from 'yup';
import { useSelector } from 'react-redux';
import React, { useCallback } from 'react';
import { Form, Field, Formik } from 'formik';

import { LoadingButton } from '@mui/lab';
import { DateTimePicker } from '@mui/x-date-pickers';
import { Grid, Checkbox, TextField, DialogActions, FormControlLabel } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { convertBase64Format } from 'src/utils/base64Formate';
import { dateFormat, dateConvertor } from 'src/utils/dateConvertor';

import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { EmployeeLeaveStatusType } from 'src/enums/employee-leave-status';
import { info, error, primary, success, warning, secondary } from 'src/theme/core/palette';
import {
  useAddEmployeeLeaveMutation,
  useGetEmployeeLeavePolicyQuery,
  useEmployeeLeaveRequestStatusMutation,
} from 'src/redux/employee/employeeApi';

import { Editor } from 'src/components/editor';
import { Upload } from 'src/components/upload';
import { Scrollbar } from 'src/components/scrollbar';
import CustomSelect from 'src/components/custom-select';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

import type { TabComponentType } from '.';

export const leaveTypes = [
  { value: 'sick', label: 'Sick Leave' },
  { value: 'personal', label: 'Personal Leave' },
  { value: 'maternity', label: 'Maternity Leave' },
  { value: 'paternity', label: 'Paternity Leave' },
  { value: 'bereavement', label: 'Bereavement Leave' },
  { value: 'marriage', label: 'Marriage Leave' },
  { value: 'study', label: 'Study Leave' },
  { value: 'unpaid', label: 'Unpaid Leave' },
  { value: 'compensatory', label: 'Compensatory Leave' },
  { value: 'medical', label: 'Medical Leave' },
  { value: 'emergency', label: 'Emergency Leave' },
];

// ----------------------------------------------------------------------

export const CALENDAR_COLOR_OPTIONS = [
  primary.main,
  secondary.main,
  info.main,
  info.darker,
  success.main,
  warning.main,
  error.main,
  error.darker,
];
type AddLeaveRequestProps = TabComponentType & {
  editData?: any;
  handleClose?: () => void;
};

interface FormValues {
  leaveType: string;
  isHalfDay: boolean;
  startDate: Dayjs | null;
  endDate: Dayjs | null;
  description: string;
  status?: number;
  rejectionReason: string;

  docs: string;
}

const AddLeaveRequest = (props: AddLeaveRequestProps) => {
  const { editData, handleClose } = props;
  const leaveRequestModal = useBoolean();
  const [changeStatus, { isLoading: isChangeStatusLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useEmployeeLeaveRequestStatusMutation,
  });

  const { employee } = useSelector((state: RootState) => state.auth);

  const [addLeave, { isLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddEmployeeLeaveMutation,
    popupConfig: {
      success: true,
      successMessage: 'Leave request added successfully',
    },
  });
  const { data: leavePolicyData, isLoading: isLeavePolicyLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetEmployeeLeavePolicyQuery,
  });

  const uploadProps = {
    multiple: true,
    accept: { 'image/*': [] },
  };

  const handleRemoveFile = useCallback(
    (
      inputFile: File | string,
      values: FormValues,
      setFieldValue: (field: string, value: any) => void
    ) => {
      setFieldValue('docs', '');
    },
    []
  );

  const handleRemoveAllFiles = useCallback(
    (values: FormValues, setFieldValue: (field: string, value: any) => void) => {
      setFieldValue('docs', '');
    },
    []
  );

  return (
    <Formik
      enableReinitialize
      validateOnChange
      initialValues={{
        leaveType: editData?.leaveTypeId || '',
        description: editData?.description || '',
        startDate: editData?.startDate ? dayjs(editData?.startDate) : null,
        endDate: editData?.endDate ? dayjs(editData?.endDate) : null,
        isHalfDay: editData?.halfDay || false,
        rejectionReason: editData?.rejectionReason || '',
        status: editData?.status || 0,

        docs: editData?.attachment ? convertBase64Format(editData?.attachment) : '',
      }}
      validationSchema={Yup.object().shape({
        leaveType: Yup.string().required('Leave type is required'),
        isHalfDay: Yup.boolean(),
        startDate: Yup.date().required('Start date is required'),
        endDate: Yup.string()
          .nullable()
          .test('endDate', '', function (value) {
            const { isHalfDay } = this.parent;
            const { startDate } = this.parent;
            if (isHalfDay) return true;
            if (startDate && value) {
              const fullStartDate = dayjs(startDate);
              const endDate = dayjs(value);

              const isAfter = endDate.isAfter(fullStartDate);

              return isAfter || this.createError({ message: 'End date must be after start date' });
            }
            if (!value && !isHalfDay) {
              return this.createError({ message: 'End date is required' });
            }
            return true;
          }),
        description: Yup.string().required('Description is required'),
        status: editData ? Yup.string().required('Status is required') : Yup.string().nullable(),
        rejectionReason: Yup.string().test(
          'rejectionReason',
          'Rejection reason is required',
          function (value) {
            const { status } = this.parent;
            if (editData && status === EmployeeLeaveStatusType.Rejected) {
              return !!value || this.createError({ message: 'Rejection reason is required' });
            }
            return true;
          }
        ),
        // color: Yup.string().required('Color is required'),
      })}
      onSubmit={async (values: FormValues, { setSubmitting, resetForm }) => {
        try {
          if (editData) {
            await changeStatus({
              id: editData.id,
              body: {
                status: EmployeeLeaveStatusType.Rejected,
                rejectionReason: values.rejectionReason,
              },
            });
          } else {
            await addLeave({
              // userId: userInfo.sub,
              employeeId: employee.id,
              leaveTypeId: values.leaveType,

              halfDay: values.isHalfDay,
              startDate: dateConvertor(
                dayjs(values.startDate, 'DD-MM-YYYY HH:mm:ss').format(dateFormat)
              ),
              ...(!values.isHalfDay
                ? {
                    endDate: dateConvertor(
                      dayjs(values.endDate, 'DD-MM-YYYY HH:mm:ss').format(dateFormat)
                    ),
                  }
                : {}),
              description: values.description,
              attachment: values.docs.replace(/^data:\w+\/[\w-]+;base64,/, ''),
            });
            resetForm();
          }
          handleClose?.();
        } catch (errors) {
          console.log(errors);
        }
      }}
    >
      {({ initialValues, errors, touched, setFieldValue, values, submitForm }) => (
        <Form>
          <BackPopUpChecked initialValues={initialValues} currentValues={values}>
            <Scrollbar sx={{ p: 2, height: '30vh' }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <CustomSelect
                    isLoading={isLeavePolicyLoading}
                    options={leavePolicyData?.items || []}
                    label="Leave Type"
                    value={values.leaveType}
                    name="leaveType"
                    valueKey="id"
                    disabled={editData}
                    labelKey="leaveType"
                    error={!!touched.leaveType && !!errors.leaveType}
                    helperText={(touched.leaveType && errors.leaveType) || ''}
                    onChange={(value) => {
                      setFieldValue('leaveType', value);
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Field
                        name="isHalfDay"
                        as={Checkbox}
                        checked={values.isHalfDay}
                        disabled={editData}
                        onChange={(e: any) => {
                          setFieldValue('isHalfDay', e.target.checked);
                          if (e.target.checked) {
                            setFieldValue('endDate', null);
                          }
                        }}
                      />
                    }
                    label="Half Day"
                  />
                </Grid>
                <Grid item xs={values.isHalfDay ? 12 : 6}>
                  <DateTimePicker
                    label={values.isHalfDay ? 'Date and Time' : 'Start Date and Time'}
                    onChange={(value) => setFieldValue('startDate', value)}
                    format="DD-MM-YYYY HH:mm:ss"
                    value={values.startDate}
                    disabled={editData}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        size: 'small',
                        helperText: touched.startDate && errors.startDate,
                        error: touched.startDate && Boolean(errors.startDate),
                      },
                    }}
                  />
                </Grid>
                {!values.isHalfDay && (
                  <Grid item xs={6}>
                    <DateTimePicker
                      label="End Date and Time"
                      onChange={(value) => setFieldValue('endDate', value)}
                      value={values.endDate}
                      format="DD-MM-YYYY HH:mm:ss"
                      disabled={editData}
                      slotProps={{
                        textField: {
                          fullWidth: true,

                          size: 'small',
                          helperText: touched.endDate && errors.endDate,
                          error: touched.endDate && Boolean(errors.endDate),
                        },
                      }}
                    />
                  </Grid>
                )}
                {/* <Grid item xs={12}>
            <ColorPicker
              selected={values.color}
              onSelectColor={(color) => {
                setFieldValue('color', color);
              }}
              colors={CALENDAR_COLOR_OPTIONS}
              slotProps={{
                button: {
                  disabled: editData,
                },
              }}
              error={touched.color && Boolean(errors.color)}
              helperText={(touched.color && errors.color) || ''}
              disabled={editData}
            />
          </Grid> */}
                <Grid item xs={6}>
                  <Upload
                    {...uploadProps}
                    thumbnail
                    value={values.docs}
                    onDrop={(acceptedFiles) => {
                      const file = acceptedFiles[0];
                      const reader = new FileReader();
                      reader.readAsDataURL(file);
                      reader.onload = () => {
                        const base64String = reader.result;
                        setFieldValue('docs', base64String);
                      };
                    }}
                    multiple={false}
                    onRemove={(file) => handleRemoveFile(file, values, setFieldValue)}
                    onRemoveAll={() => handleRemoveAllFiles(values, setFieldValue)}
                    disabled={editData}
                  />
                </Grid>
                <Grid item xs={6}>
                  <Editor
                    onChange={(value) => {
                      setFieldValue('description', value);
                    }}
                    value={values.description}
                    placeholder="Leave description"
                    error={touched.description && Boolean(errors.description)}
                    helperText={touched.description && errors.description}
                    editable={!editData}
                    sx={{ height: '100%' }}
                    slotProps={{
                      wrap: {
                        height: '100%',
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12} display="flex" justifyContent="flex-end">
                  {editData && (
                    <>
                      {editData.status !== EmployeeLeaveStatusType.Rejected && (
                        <LoadingButton
                          loading={isChangeStatusLoading}
                          variant="contained"
                          size="small"
                          color="primary"
                          onClick={async () => {
                            setFieldValue('status', EmployeeLeaveStatusType.Approved);
                            // submitForm();
                            await changeStatus({
                              id: editData.id,
                              body: {
                                status: EmployeeLeaveStatusType.Approved,
                                rejectionReason: '',
                              },
                            });
                            handleClose?.();
                          }}
                          style={{ marginRight: '10px' }}
                        >
                          Approve
                        </LoadingButton>
                      )}
                      <LoadingButton
                        variant="contained"
                        size="small"
                        color="error"
                        onClick={() => {
                          setFieldValue('status', EmployeeLeaveStatusType.Rejected);
                        }}
                      >
                        Reject
                      </LoadingButton>
                    </>
                  )}
                </Grid>
                {values.status === EmployeeLeaveStatusType.Rejected && (
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      variant="outlined"
                      value={values.rejectionReason}
                      label="Rejection Reason"
                      onChange={(e) => setFieldValue('rejectionReason', e.target.value)}
                      error={touched.rejectionReason && Boolean(errors.rejectionReason)}
                      helperText={touched.rejectionReason && errors.rejectionReason}
                      sx={{ my: 1 }}
                    />
                  </Grid>
                )}
              </Grid>
            </Scrollbar>
            <DialogActions>
              {!editData && (
                <LoadingButton loading={isLoading} type="submit" variant="contained">
                  Submit
                </LoadingButton>
              )}

              {values.status === EmployeeLeaveStatusType.Rejected && (
                <LoadingButton
                  loading={isChangeStatusLoading}
                  variant="contained"
                  type="submit"
                  sx={{ mt: 2 }}
                >
                  Submit
                </LoadingButton>
              )}
            </DialogActions>
          </BackPopUpChecked>
        </Form>
      )}
    </Formik>
  );
};

export default AddLeaveRequest;
