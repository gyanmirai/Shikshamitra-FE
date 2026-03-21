/* eslint-disable react/no-this-in-sfc */
import type { Dayjs } from 'dayjs';
import type { RootState } from 'src/redux/store';

import dayjs from 'dayjs';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import React, { useEffect } from 'react';
import { LoadingButton } from '@mui/lab';
import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { DatePicker } from '@mui/x-date-pickers';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import CustomSelect from 'src/components/custom-select';
import FileUploader from 'src/components/custom-upload';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import { convertBase64Format } from 'src/utils/base64Formate';
import ShakingTextField from 'src/components/shaking-text-field';
import { DialogScrollContent } from 'src/components/custom-dialog';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { dateFormat, dateConvertor } from 'src/utils/dateConvertor';
import { Grid, Button, TextField, DialogActions } from '@mui/material';
import { EmployeeLeaveStatusType } from 'src/enums/employee-leave-status';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { info, error, primary, success, warning, secondary } from 'src/theme/core/palette';
import { useGetLeaveRequestsQuery, useCreateLeaveRequestMutation } from 'src/redux/hr/leaveApi';

import type { TabComponentType } from '.';

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

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
  // Mutation hook for adding new leave request
  const [addLeave, { isLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useCreateLeaveRequestMutation,
  });

  // Query hook to fetch employee leave policy data
  const { data: leaveRequestData, isLoading: isLeaveRequestLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetLeaveRequestsQuery,
  });
  const { currentYear, currentMedium } = useSelector((state: RootState) => state.globalState);

  // Handler to remove a single file attachment
  // const handleRemoveFile = useCallback((setFieldValue: (field: string, value: any) => void) => {
  //   setFieldValue('docs', '');
  // }, []);

  const {
    initialValues,
    errors,
    touched,
    setFieldValue,
    values,
    handleSubmit,
    handleBlur,
    resetForm,
    isSubmitting,
  } = useFormik({
    initialValues: {
      leaveTypeId: editData?.leaveTypeId || '',
      reason: editData?.reason || editData?.description || '',
      startDate: editData?.startDate ? dayjs(editData?.startDate) : null,
      endDate: editData?.endDate ? dayjs(editData?.endDate) : null,
      rejectionReason: editData?.rejectionReason || '',
      status: editData?.status,
      docs: editData?.attachment ? convertBase64Format(editData?.attachment) : '',
    },
    validationSchema: Yup.object().shape({
      leaveTypeId: Yup.string().required('Leave Type is required'),
      startDate: Yup.mixed()
        .required('Start Date is required')
        .test(
          'is-valid-dayjs',
          'Start Date must be a valid date',
          (value) => value && dayjs(value as any).isValid()
        )
        .test(
          'min-date',
          (value) =>
            `Start Date must be on or after ${dayjs(currentYear?.startDate).format('DD/MM/YYYY')}`,
          (value) => {
            if (!currentYear?.startDate) return false;
            return value && dayjs(value as any).isSameOrAfter(dayjs(currentYear.startDate), 'day');
          }
        )
        .test(
          'max-date',
          (value) =>
            `Start Date must be on or before ${dayjs(currentYear?.endDate).format('DD/MM/YYYY')}`,
          (value) => {
            if (!currentYear?.endDate) return false;
            return value && dayjs(value as any).isSameOrBefore(dayjs(currentYear.endDate), 'day');
          }
        ),

      endDate: Yup.mixed()
        .required('End Date is required')
        .test(
          'is-valid-dayjs',
          'End Date must be a valid date',
          (value) => value && dayjs(value as any).isValid()
        )
        // eslint-disable-next-line func-names
        .test('is-after-start-date', 'End Date cannot be before Start Date', function (value) {
          const { startDate } = this.parent;
          if (!value || !startDate) return true;
          return dayjs(value as any).isSameOrAfter(dayjs(startDate));
        })
        .test(
          'min-date',
          (value) =>
            `End Date must be on or after ${dayjs(currentYear?.startDate).format('DD/MM/YYYY')}`,
          (value) => {
            if (!currentYear?.startDate) return false;
            return value && dayjs(value as any).isSameOrAfter(dayjs(currentYear.startDate), 'day');
          }
        )
        .test(
          'max-date',
          (value) =>
            `End Date must be on or before ${dayjs(currentYear?.endDate).format('DD/MM/YYYY')}`,
          (value) => {
            if (!currentYear?.endDate) return false;
            return value && dayjs(value as any).isSameOrBefore(dayjs(currentYear.endDate), 'day');
          }
        ),
      reason: Yup.string()
        .min(5, 'Reason must be at least 5 characters')
        .max(500, 'Reason must not exceed 500 characters')
        .required('Reason for leave is required'),
      status: Yup.string().nullable(),
      rejectionReason: Yup.string().when('status', {
        is: EmployeeLeaveStatusType.Rejected,
        then: (schema) => schema.required('Rejection reason is required'),
        otherwise: (schema) => schema.nullable(),
      }),
    }),
    onSubmit: async (formValues: FormValues, { setSubmitting }) => {
      try {
        setSubmitting(true);
        if (editData) {
          // await updateLeaveStatus({
          //   leaveRequestId: editData.id,
          //   body: {
          //     status:
          //       formValues.status === EmployeeLeaveStatusType.Rejected
          //         ? 'REJECTED'
          //         : formValues.status === EmployeeLeaveStatusType.Approved
          //           ? 'APPROVED'
          //           : 'REVIEWED',
          //     remarks: formValues.rejectionReason || undefined,
          //   },
          // });
        } else {
          await addLeave({
            mediumStageId: currentMedium?.id,
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
        resetForm();
      } catch (e) {
        console.error(e);
      } finally {
        setSubmitting(false);
      }
    },
  });

  useEffect(() => {
    if (!editData) {
      resetForm();
    }
  }, [editData, resetForm]);
  return (
    <>
      <DialogScrollContent>
        <BackPopUpChecked initialValues={initialValues} currentValues={values}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <ShakingTextField error={!!touched.leaveTypeId && !!errors.leaveTypeId}>
                <CustomSelect
                  isLoading={isLeaveRequestLoading}
                  options={leaveRequestData?.items || []}
                  label="Leave Type *"
                  value={values.leaveTypeId}
                  name="leaveTypeId"
                  valueKey="id"
                  disabled={!!editData || isLeaveRequestLoading}
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
                  disabled={!!editData || !currentYear}
                  format="DD/MM/YYYY"
                  disablePast
                  minDate={dayjs(currentYear?.startDate)}
                  maxDate={dayjs(currentYear?.endDate)}
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
                  disabled={!!editData || !currentYear}
                  format="DD/MM/YYYY"
                  disablePast
                  minDate={values.startDate || dayjs(currentYear?.startDate)}
                  maxDate={dayjs(currentYear?.endDate)}
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

            <Grid size={{ xs: 12 }}>
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
            <Grid size={{ xs: 12 }}>
              <FileUploader
                disabled={!!editData}
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
          onClick={(e) => {
            handleClose?.(e, false);
            resetForm();
          }}
        >
          Cancel
        </Button>
        {!editData && (
          <LoadingButton
            loading={isSubmitting || isLoading}
            startIcon={<Iconify icon={GlobalIcons.submit} width={20} height={20} />}
            onClick={(e: any) => {
              handleSubmit(e);
            }}
            type="submit"
            size="small"
            variant="contained"
          >
            Submit
          </LoadingButton>
        )}

        {editData && values.status !== EmployeeLeaveStatusType.Approved && (
          <LoadingButton
            // loading={isUpdateStatusLoading}
            onClick={(e: any) => {
              handleSubmit(e);
            }}
            startIcon={<Iconify icon={GlobalIcons.submit} />}
            // disabled={isUpdateStatusLoading}
            size="small"
          >
            {values.status === EmployeeLeaveStatusType.Rejected ? 'Approve' : 'Update Status'}
          </LoadingButton>
        )}
      </DialogActions>
    </>
  );
};

export default AddLeaveRequest;
