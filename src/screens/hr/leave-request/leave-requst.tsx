/* eslint-disable react/no-this-in-sfc */
import type { Dayjs } from 'dayjs';
import type { RootState } from 'src/redux/store';

import dayjs from 'dayjs';
import React from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { LoadingButton } from '@mui/lab';
import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { Editor } from 'src/components/editor';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import FileUploader from 'src/components/custom-upload';
import { convertBase64Format } from 'src/utils/base64Formate';
import ShakingTextField from 'src/components/shaking-text-field';
import { DialogScrollContent } from 'src/components/customDialog';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { dateFormat, dateConvertor } from 'src/utils/dateConvertor';
import { Grid, Button, Typography, DialogActions } from '@mui/material';
import { EmployeeLeaveStatusType } from 'src/enums/employee-leave-status';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { DatePicker, DateTimePicker, MobileTimePicker } from '@mui/x-date-pickers';
import { info, error, primary, success, warning, secondary } from 'src/theme/core/palette';
import {
  useAddEmployeeLeaveMutation,
  useGetEmployeeLeavePolicyQuery,
  useEmployeeLeaveRequestStatusMutation,
} from 'src/redux/employee/employeeApi';

import type { TabComponentType } from '.';

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
  handleClose?: (e: any, isSubmit: boolean) => void;
};

interface FormValues {
  leaveType: string;
  isHalfDay: boolean;
  startDate: Dayjs | null;
  endDate: Dayjs | null;
  description: string;
  status?: number;
  rejectionReason: string;
  startTime: Dayjs | null;
  endTime: Dayjs | null;
  docs: string;
}

const AddLeaveRequest = (props: AddLeaveRequestProps) => {
  // Destructure props to get editData and handleClose
  const { editData, handleClose } = props;
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  // Mutation hook for changing leave request status
  const [changeStatus, { isLoading: isChangeStatusLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useEmployeeLeaveRequestStatusMutation,
  });

  // Get employee data from redux store
  const { employee } = useSelector((state: RootState) => state.auth);

  // Mutation hook for adding new leave request
  const [addLeave, { isLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddEmployeeLeaveMutation,
    popupConfig: {
      success: true,
      successMessage: 'Leave request added successfully',
    },
  });

  // Query hook to fetch employee leave policy data
  const { data: leavePolicyData, isLoading: isLeavePolicyLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetEmployeeLeavePolicyQuery,
  });

  // Handler to remove a single file attachment
  // const handleRemoveFile = useCallback((setFieldValue: (field: string, value: any) => void) => {
  //   setFieldValue('docs', '');
  // }, []);

  const { initialValues, errors, touched, setFieldValue, values, handleSubmit, handleBlur } =
    useFormik({
      initialValues: {
        leaveType: editData?.leaveTypeId || '',
        description: editData?.description || '',
        startDate: editData?.startDate ? dayjs(editData?.startDate) : null,
        endDate: editData?.endDate ? dayjs(editData?.endDate) : null,
        isHalfDay: editData?.halfDay || false,
        rejectionReason: editData?.rejectionReason || '',
        status: editData?.status || 0,
        startTime: editData?.startTime ? dayjs(editData?.startTime) : null,
        endTime: editData?.endTime ? dayjs(editData?.endTime) : null,

        docs: editData?.attachment ? convertBase64Format(editData?.attachment) : '',
      },
      validationSchema: Yup.object().shape({
        leaveType: Yup.string().required('Leave Type is required'),
        // isHalfDay: Yup.boolean(),
        startDate: Yup.mixed()
          .test(
            'is-valid-dayjs',
            'Start Date is required',
            (value) => value && dayjs(value as any).isValid()
          )
          .required('Start Date is required'),
        endDate: Yup.mixed()
          .nullable()
          .when('isHalfDay', {
            is: true,
            then: (schema) => schema.nullable(),
            otherwise: (schema) =>
              schema
                .test('is-valid-dayjs', 'End Date is required', (value) => {
                  if (!value) return false;
                  return dayjs(value as any).isValid();
                })
                .required('End Date is required')
                // eslint-disable-next-line func-names
                .test('endDate', 'End Date must be after or equal to start date', function (value) {
                  const { startDate } = this.parent;
                  if (startDate && value) {
                    const start = dayjs(startDate as any);
                    const end = dayjs(value as any);
                    return end.isAfter(start) || end.isSame(start);
                  }
                  return true;
                })
                // eslint-disable-next-line func-names
                .test('endDate-before', 'End Date cannot be before start date', function (value) {
                  const { startDate } = this.parent;
                  if (startDate && value) {
                    const start = dayjs(startDate as any);
                    const end = dayjs(value as any);
                    return !end.isBefore(start);
                  }
                  return true;
                }),
          }),
        description: Yup.string().required('Leave Description is required'),
        status: editData ? Yup.string().required('Status is required') : Yup.string().nullable(),
        rejectionReason: Yup.string().test(
          'rejectionReason',
          'Rejection reason is required',
          // eslint-disable-next-line func-names
          function (value) {
            const { status } = this.parent;
            if (editData && status === EmployeeLeaveStatusType.Rejected) {
              return !!value || this.createError({ message: 'Rejection reason is required' });
            }
            return true;
          }
        ),
      }),
      onSubmit: async (formValues: FormValues, { resetForm }) => {
        try {
          if (editData) {
            await changeStatus({
              id: editData.id,
              body: {
                status: EmployeeLeaveStatusType.Rejected,
                rejectionReason: formValues.rejectionReason,
              },
            });
          } else {
            await addLeave({
              // userId: userInfo.sub,
              employeeId: employee.id,
              leaveTypeId: formValues.leaveType,

              halfDay: formValues.isHalfDay,
              startDate: dateConvertor(
                dayjs(formValues.startDate, 'DD-MM-YYYY HH:mm:ss').format(dateFormat)
              ),
              ...(!formValues.isHalfDay
                ? {
                    endDate: dateConvertor(
                      dayjs(formValues.endDate, 'DD-MM-YYYY HH:mm:ss').format(dateFormat)
                    ),
                  }
                : {}),
              description: formValues.description,
              attachment: formValues.docs.replace(/^data:\w+\/[\w-]+;base64,/, ''),
            });
          }
          handleClose?.(null, true);
        } catch (e) {
          console.error(e);
        }
      },
    });
  return (
    <>
      <DialogScrollContent>
        <BackPopUpChecked initialValues={initialValues} currentValues={values}>
          <Grid container spacing={3}>
            <Grid size={12}>
              <ShakingTextField error={!!touched.leaveType && !!errors.leaveType}>
                <CustomSelect
                  isLoading={isLeavePolicyLoading}
                  options={leavePolicyData?.items || []}
                  label="Leave Type *"
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
              </ShakingTextField>
            </Grid>

            {/* <Grid size={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    name="isHalfDay"
                    checked={values.isHalfDay}
                    disabled={editData}
                    sx={{ p: 0 }}
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
            </Grid> */}
            {values.isHalfDay ? (
              <>
                <Grid size={12}>
                  <DatePicker
                    label="Date *"
                    onChange={(value) => setFieldValue('startDate', value)}
                    format="DD-MM-YYYY"
                    views={['year', 'month', 'day']}
                    minDate={dayjs(currentYear?.startDate)}
                    maxDate={dayjs(currentYear?.endDate)}
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
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField error={touched.startTime && Boolean(errors.startTime)}>
                    <MobileTimePicker
                      label="Start time *"
                      onChange={(value) => setFieldValue('startTime', value)}
                      value={values.startTime}
                      disabled={editData}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          size: 'small',
                          helperText: touched.startTime && errors.startTime,
                          error: touched.startTime && Boolean(errors.startTime),
                        },
                      }}
                    />
                  </ShakingTextField>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField error={touched.endTime && Boolean(errors.endTime)}>
                    <MobileTimePicker
                      label="End Time *"
                      onChange={(value) => setFieldValue('endTime', value)}
                      format="HH:mm:ss"
                      views={['hours', 'minutes', 'seconds']}
                      value={values.endTime}
                      disabled={editData}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          size: 'small',
                          helperText: touched.endTime && errors.endTime,
                          error: touched.endTime && Boolean(errors.endTime),
                        },
                      }}
                    />
                  </ShakingTextField>
                </Grid>
              </>
            ) : (
              <>
                <Grid size={12}>
                  <ShakingTextField error={touched.startDate && Boolean(errors.startDate)}>
                    <DateTimePicker
                      label="Start Date *"
                      disablePast
                      onChange={(value) => setFieldValue('startDate', value)}
                      format="DD-MM-YYYY HH:mm"
                      minDate={dayjs(currentYear?.startDate)}
                      maxDate={dayjs(currentYear?.endDate)}
                      // views={['year', 'month', 'day']}
                      value={values.startDate}
                      disabled={editData}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          size: 'small',
                          name: 'startDate',
                          helperText: touched.startDate && errors.startDate,
                          error: touched.startDate && Boolean(errors.startDate),
                          onBlur: handleBlur,
                        },
                      }}
                    />
                  </ShakingTextField>
                </Grid>
                <Grid size={12}>
                  <ShakingTextField error={touched.endDate && Boolean(errors.endDate)}>
                    <DateTimePicker
                      label="End Date *"
                      disablePast
                      onChange={(value) => setFieldValue('endDate', value)}
                      format="DD-MM-YYYY HH:mm"
                      // views={['year', 'month', 'day']}
                      minDate={dayjs(currentYear?.startDate)}
                      maxDate={dayjs(currentYear?.endDate)}
                      value={values.endDate}
                      disabled={editData}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          size: 'small',
                          name: 'endDate',
                          onBlur: handleBlur,
                          helperText: touched.endDate && errors.endDate,
                          error: touched.endDate && Boolean(errors.endDate),
                        },
                      }}
                    />
                  </ShakingTextField>
                </Grid>
              </>
            )}

            <Grid size={12}>
              <Typography variant="subtitle2" gutterBottom sx={{ pl: 0.5 }}>
                Leave Description *
              </Typography>
              <ShakingTextField error={touched.description && Boolean(errors.description)}>
                <Editor
                  onChange={(value) => {
                    setFieldValue('description', value);
                  }}
                  value={values.description}
                  placeholder="Leave Description *"
                  error={touched.description && Boolean(errors.description)}
                  helperText={touched.description && errors.description}
                  editable={!editData}
                  sx={{ height: '100%' }}
                  slotProps={{
                    wrap: {
                      height: '100%',
                      position: 'relative',
                    },
                  }}
                />
              </ShakingTextField>
            </Grid>
            <Grid size={12}>
              <FileUploader
                disabled={editData}
                // @ts-ignore
                value={values.docs}
                multiple={false}
                onChange={(value) => {
                  // const reader = new FileReader();
                  setFieldValue('docs', value);
                  // reader.readAsDataURL(value as File);
                  // reader.readAsDataURL(value as File);
                  // reader.onload = () => {
                  //   const base64String = reader.result;
                  // };
                }}
                primaryText="Please Upload Your File"
                secondaryText="Maximum file size is 5MB"
              />
              {/* <UploadBox
                value={values.docs}
                disabled={editData}
                // onRemove={() => handleRemoveFile(setFieldValue)}
                isPreview
                placeholder={
                  <Stack spacing={0.5} alignItems="center">
                    <Iconify icon="eva:cloud-upload-fill" width={40} />
                    <Typography variant="body2">Upload Document</Typography>
                    <Typography variant="body2" sx={{ fontSize: '12px' }}>
                      Please upload an image or PDF file (maximum size: 5MB)
                    </Typography>
                  </Stack>
                }
                sx={{ py: 1, flexGrow: 1, height: 'auto', width: '100%', mb: 2 }}
                onDrop={(acceptedFiles) => {
                  const file = acceptedFiles?.[0];

                  if (!file) return;
                  const reader = new FileReader();
                  reader.readAsDataURL(file);
                  reader.onload = () => {
                    const base64String = reader.result;
                    setFieldValue('docs', base64String);
                  };
                }}
              /> */}
              {/* <UploadButton
                onChange={(e) => {
                  const file = e?.target?.files?.[0];
                  
                  if (!file) return;
                  const reader = new FileReader();
                  reader.readAsDataURL(file);
                  reader.onload = () => {
                    const base64String = reader.result;
                    setFieldValue('docs', base64String);
                  };
                }}
                fileInputProps={{
                  accept: 'image/*,.pdf',
                }}
                variant="outlined"
                fullWidth
                disabled={editData}
              >
                Upload Document
              </UploadButton> */}
              {/* {values.docs && (
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    height: 70,
                    width: 70,
                    borderRadius: 1,
                    boxShadow: 'var(--shadows-2)',
                    gap: 1,
                    mt: 1,
                    position: 'relative',
                  }}
                >
                  <Box height="100%" width="100%">
                    {values.docs.includes('data:image') ? (
                      <img
                        src={values.docs}
                        alt="imagefile"
                        style={{ height: '100%', width: '100%' }}
                      />
                    ) : (
                      <Iconify
                        icon="mdi:file-pdf"
                        sx={{
                          color: 'error.main',
                          cursor: 'pointer',
                          width: '100%',
                          height: '100%',
                        }}
                        onClick={() => {
                          window.open(values.docs, '_blank');
                        }}
                      />
                    )}
                  </Box>
                  <Iconify
                    icon="mdi:close"
                    width={16}
                    sx={{
                      position: 'absolute',
                      top: -8,
                      right: -8,
                      cursor: 'pointer',
                      color: 'grey.600',
                    }}
                    onClick={() => handleRemoveFile(setFieldValue)}
                  />
                </Box>
              )} */}

              {/* <Upload
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
                onDelete={() => handleRemoveFile(setFieldValue)}
                onRemoveAll={() => handleRemoveAllFiles(values, setFieldValue)}
                disabled={editData}
              /> */}
            </Grid>
          </Grid>
        </BackPopUpChecked>
      </DialogScrollContent>
      <DialogActions>
        <Button
          variant="outlined"
          size="small"
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
          onClick={() => {
            handleClose?.(null, false);
          }}
        >
          Cancel
        </Button>
        {!editData && (
          <Button
            startIcon={<Iconify icon={GlobalIcons.submit} width={20} height={20} />}
            onClick={(e: any) => {
              handleSubmit(e);
            }}
            type="submit"
            size="small"
            variant="contained"
            disabled={isLoading}
          >
            Submit
          </Button>
        )}

        {values.status === EmployeeLeaveStatusType.Rejected && (
          <LoadingButton
            loading={isChangeStatusLoading}
            onClick={(e: any) => {
              handleSubmit(e);
            }}
            startIcon={<Iconify icon={GlobalIcons.submit} />}
            disabled={isChangeStatusLoading}
            size="small"
          >
            Approve
          </LoadingButton>
        )}
      </DialogActions>
    </>
  );
};

export default AddLeaveRequest;
