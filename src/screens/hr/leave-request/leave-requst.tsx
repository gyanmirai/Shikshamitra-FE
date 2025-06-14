/* eslint-disable react/no-this-in-sfc */
import type { Dayjs } from 'dayjs';
import type { RootState } from 'src/redux/store';

import dayjs from 'dayjs';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import React, { useCallback } from 'react';

import { LoadingButton } from '@mui/lab';
import { DateTimePicker } from '@mui/x-date-pickers';
import {
  Box,
  Grid,
  Button,
  Tooltip,
  Checkbox,
  Typography,
  DialogActions,
  FormControlLabel,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { GlobalIcons } from 'src/utils/icons';
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
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import SubmitButton from 'src/components/submit-button';
import UploadButton from 'src/components/upload-button';
import ShakingTextField from 'src/components/shaking-text-field';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

import { LeavePolicyForm } from '../attendance-setting/leave-policy';

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
  // Destructure props to get editData and handleClose
  const { editData, handleClose } = props;

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

  // Configuration for file upload component
  const uploadProps = {
    multiple: true,
    accept: { 'image/*': [] },
  };

  // Handler to remove a single file attachment
  const handleRemoveFile = useCallback((setFieldValue: (field: string, value: any) => void) => {
    setFieldValue('docs', '');
  }, []);

  // Handler to remove all file attachments
  const handleRemoveAllFiles = useCallback(
    (values: FormValues, setFieldValue: (field: string, value: any) => void) => {
      setFieldValue('docs', '');
    },
    []
  );

  const addLeaveTypeDialog = useBoolean();

  const handleCloseLeavePolicy = (_e: any, isSubmit?: boolean) => {
    addLeaveTypeDialog.onFalse();
  };

  const { initialValues, errors, touched, setFieldValue, values, handleSubmit } = useFormik({
    initialValues: {
      leaveType: editData?.leaveTypeId || '',
      description: editData?.description || '',
      startDate: editData?.startDate ? dayjs(editData?.startDate) : null,
      endDate: editData?.endDate ? dayjs(editData?.endDate) : null,
      isHalfDay: editData?.halfDay || false,
      rejectionReason: editData?.rejectionReason || '',
      status: editData?.status || 0,

      docs: editData?.attachment ? convertBase64Format(editData?.attachment) : '',
    },
    validationSchema: Yup.object().shape({
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
          resetForm();
        }
        handleClose?.();
      } catch (e) {
        console.log(e);
      }
    },
  });
  return (
    <>
      <DialogScrollContent>
        <BackPopUpChecked initialValues={initialValues} currentValues={values}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
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
                  addOtherItemText="Add Leave Type"
                  addOtherItemOnClick={() => {
                    addLeaveTypeDialog.onTrue();
                  }}
                />
              </ShakingTextField>
              {addLeaveTypeDialog.value && (
                <CustomDialog
                  title={
                    <Box display="flex" flexDirection="row" gap={1} alignItems="center">
                      <Typography variant="h5">Leave Policy</Typography>
                      <Tooltip
                        arrow
                        placement="right"
                        title="In this dialog, you can create a leave policy by setting rules for different leave types (e.g., sick, casual), leave entitlements, and approval workflows."
                      >
                        <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
                      </Tooltip>
                    </Box>
                  }
                  open={addLeaveTypeDialog.value}
                  handleClose={() => {
                    addLeaveTypeDialog.onFalse();
                  }}
                >
                  <LeavePolicyForm handleClose={handleCloseLeavePolicy} editData={[]} />
                </CustomDialog>
              )}
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    name="isHalfDay"
                    checked={values.isHalfDay}
                    disabled={editData}
                    sx={{ py: 0, pl: 1.5 }}
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
            <Grid item xs={12}>
              <ShakingTextField error={touched.startDate && Boolean(errors.startDate)}>
                <DateTimePicker
                  label={values.isHalfDay ? 'Date and Time *' : 'Start Date and Time *'}
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
              </ShakingTextField>
            </Grid>
            {!values.isHalfDay && (
              <Grid item xs={12}>
                <ShakingTextField error={touched.endDate && Boolean(errors.endDate)}>
                  <DateTimePicker
                    label="End Date and Time *"
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
                </ShakingTextField>
              </Grid>
            )}

            <Grid item xs={12}>
              <ShakingTextField error={touched.description && Boolean(errors.description)}>
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
                      position: 'relative',
                    },
                  }}
                />
              </ShakingTextField>
            </Grid>
            <Grid item xs={12}>
              <UploadButton
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
              </UploadButton>
              {values.docs && (
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
              )}

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
            handleClose?.();
          }}
        >
          Cancel
        </Button>
        {!editData && (
          <SubmitButton
            loading={isLoading}
            onClick={() => {
              handleSubmit();
            }}
          />
        )}

        {values.status === EmployeeLeaveStatusType.Rejected && (
          <LoadingButton
            loading={isChangeStatusLoading}
            onClick={() => {
              handleSubmit();
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
