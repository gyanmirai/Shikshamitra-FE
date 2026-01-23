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
import { Iconify } from 'src/components/iconify';
import { DatePicker } from '@mui/x-date-pickers';
import CustomSelect from 'src/components/custom-select';
import FileUploader from 'src/components/custom-upload';
import { convertBase64Format } from 'src/utils/base64Formate';
import ShakingTextField from 'src/components/shaking-text-field';
import { DialogScrollContent } from 'src/components/customDialog';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { dateFormat, dateConvertor } from 'src/utils/dateConvertor';
import { Grid, Button, TextField, DialogActions } from '@mui/material';
import { EmployeeLeaveStatusType } from 'src/enums/employee-leave-status';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { info, error, primary, success, warning, secondary } from 'src/theme/core/palette';
import {
  useAddEmployeeLeaveMutation,
  useGetEmployeeLeavePolicyQuery,
  useUpdateEmployeeLeaveMutation,
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
  leaveTypeId: string;
  startDate: Dayjs | null;
  endDate: Dayjs | null;
  reason: string;
  status?: number;
  rejectionReason: string;
  docs: string;
}

const AddLeaveRequest = (props: AddLeaveRequestProps) => {
  // Destructure props to get editData and handleClose
  const { editData, handleClose } = props;
  // Mutation hook for updating leave request status
  const [updateLeaveStatus, { isLoading: isUpdateStatusLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateEmployeeLeaveMutation,
  });

  // Mutation hook for adding new leave request
  const [addLeave, { isLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddEmployeeLeaveMutation,
  });

  // Query hook to fetch employee leave policy data
  const { data: leavePolicyData, isLoading: isLeavePolicyLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetEmployeeLeavePolicyQuery,
  });

  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);

  // Handler to remove a single file attachment
  // const handleRemoveFile = useCallback((setFieldValue: (field: string, value: any) => void) => {
  //   setFieldValue('docs', '');
  // }, []);

  const { initialValues, errors, touched, setFieldValue, values, handleSubmit, handleBlur } =
    useFormik({
      initialValues: {
        leaveTypeId: editData?.leaveTypeId || '',
        reason: editData?.reason || editData?.description || '',
        startDate: editData?.startDate ? dayjs(editData?.startDate) : null,
        endDate: editData?.endDate ? dayjs(editData?.endDate) : null,
        rejectionReason: editData?.rejectionReason || '',
        status: editData?.status || 0,
        docs: editData?.attachment ? convertBase64Format(editData?.attachment) : '',
      },
      validationSchema: Yup.object().shape({
        leaveTypeId: Yup.string().required('Leave Type is required'),
        startDate: Yup.mixed()
          .test(
            'is-valid-dayjs',
            'Start Date is required',
            (value) => value && dayjs(value as any).isValid()
          )
          .required('Start Date is required'),
        endDate: Yup.mixed()
          .test('is-valid-dayjs', 'End Date is required', (value) => {
            if (!value) return false;
            return dayjs(value as any).isValid();
          })
          .required('End Date is required')
          .test(
            'endDate-after-start',
            'End Date must be after or equal to start date',
            function (value) {
              const { startDate } = this.parent;
              if (startDate && value) {
                const start = dayjs(startDate as any);
                const end = dayjs(value as any);
                return end.isAfter(start) || end.isSame(start, 'day');
              }
              return true;
            }
          ),
        reason: Yup.string()
          .min(5, 'Reason must be at least 5 characters')
          .max(500, 'Reason must not exceed 500 characters')
          .required('Reason for leave is required'),
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
      }),
      onSubmit: async (formValues: FormValues, { resetForm }) => {
        try {
          if (editData) {
            await updateLeaveStatus({
              leaveRequestId: editData.id,
              body: {
                status:
                  formValues.status === EmployeeLeaveStatusType.Rejected
                    ? 'REJECTED'
                    : formValues.status === EmployeeLeaveStatusType.Approved
                      ? 'APPROVED'
                      : 'REVIEWED',
                remarks: formValues.rejectionReason || undefined,
              },
            });
          } else {
            await addLeave({
              mediumStageId: medium?.id,
              leaveTypeId: formValues.leaveTypeId,
              startDate: dateConvertor(dayjs(formValues.startDate).format(dateFormat)),
              endDate: dateConvertor(dayjs(formValues.endDate).format(dateFormat)),
              reason: formValues.reason,
              attachment: formValues.docs
                ? formValues.docs.replace(/^data:\w+\/[\w-]+;base64,/, '')
                : undefined,
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
              <ShakingTextField error={!!touched.leaveTypeId && !!errors.leaveTypeId}>
                <CustomSelect
                  isLoading={isLeavePolicyLoading}
                  options={leavePolicyData?.items || []}
                  label="Leave Type *"
                  value={values.leaveTypeId}
                  name="leaveTypeId"
                  valueKey="id"
                  disabled={!!editData}
                  labelKey="leaveType"
                  error={!!touched.leaveTypeId && !!errors.leaveTypeId}
                  helperText={(touched.leaveTypeId && errors.leaveTypeId) || ''}
                  onChange={(value) => {
                    setFieldValue('leaveTypeId', value);
                  }}
                />
              </ShakingTextField>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <ShakingTextField error={!!touched.startDate && !!errors.startDate}>
                <DatePicker
                  label="Start Date *"
                  value={values.startDate}
                  disabled={!!editData}
                  onChange={(value) => setFieldValue('startDate', value)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: 'small',
                      error: !!touched.startDate && !!errors.startDate,
                      helperText: touched.startDate && (errors.startDate as string),
                    },
                  }}
                />
              </ShakingTextField>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <ShakingTextField error={!!touched.endDate && !!errors.endDate}>
                <DatePicker
                  label="End Date *"
                  value={values.endDate}
                  disabled={!!editData}
                  onChange={(value) => setFieldValue('endDate', value)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: 'small',
                      error: !!touched.endDate && !!errors.endDate,
                      helperText: touched.endDate && (errors.endDate as string),
                    },
                  }}
                />
              </ShakingTextField>
            </Grid>

            <Grid size={12}>
              <ShakingTextField error={touched.reason && Boolean(errors.reason)}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  name="reason"
                  label="Reason for leave *"
                  value={values.reason}
                  onChange={(e) => setFieldValue('reason', e.target.value)}
                  disabled={!!editData}
                  error={touched.reason && Boolean(errors.reason)}
                  helperText={touched.reason && errors.reason}
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
            loading={isUpdateStatusLoading}
            onClick={(e: any) => {
              handleSubmit(e);
            }}
            startIcon={<Iconify icon={GlobalIcons.submit} />}
            disabled={isUpdateStatusLoading}
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
