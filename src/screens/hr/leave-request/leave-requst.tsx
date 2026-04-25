/* eslint-disable react/no-this-in-sfc */
import type { Dayjs } from 'dayjs';
import type { RootState } from 'src/redux/store';

import dayjs from 'dayjs';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import React, { useEffect } from 'react';
import { LoadingButton } from '@mui/lab';
import { useSelector } from 'react-redux';
import { useSession } from 'next-auth/react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { DatePicker } from '@mui/x-date-pickers';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import CustomSelect from 'src/components/custom-select';
import FileUploader from 'src/components/custom-upload';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import ShakingTextField from 'src/components/shaking-text-field';
import { DialogScrollContent } from 'src/components/customDialog';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useLazyGetEmployeeQuery } from 'src/redux/hr/employeeApi';
import { Grid, Button, TextField, DialogActions } from '@mui/material';
import { EmployeeLeaveStatusType } from 'src/enums/employee-leave-status';
import { PaginatedSearchSelect } from 'src/components/paginated-search-select';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { info, error, primary, success, warning, secondary } from 'src/theme/core/palette';
import {
  useGetLeaveTypesQuery,
  useGetLeavePoliciesQuery,
  useCreateLeaveRequestMutation,
  useRejectLeaveRequestMutation,
  useApproveLeaveRequestMutation,
} from 'src/redux/hr/leaveApi';

import {
  SELF_OPTION,
  isAdminFromProfile,
  type EmployeeOption,
  parseApiProblemDetail,
  buildEmployeeSelectOptions,
  LEAVE_TARGET_EMPLOYEE_REQUIRED,
  buildCreateLeaveRequestFormData,
} from './leave-request.utils';

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
type AddLeaveRequestProps = {
  editData?: any;
  handleClose?: (e: any, isSubmit: boolean) => void;
};

interface FormValues {
  employee: { id: string; label: string } | null;
  leavePolicyId: string;
  leaveTypeId: string;
  startDate: Dayjs | null;
  endDate: Dayjs | null;
  reason: string;
  status?: number;
  rejectionReason: string;
  docs: File;
}

const AddLeaveRequest = (props: AddLeaveRequestProps) => {
  // Destructure props to get editData and handleClose
  const { editData, handleClose } = props;
  const [getEmployees] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useLazyGetEmployeeQuery,
  });

  // Mutation hook for adding new leave request
  const [addLeave, { isLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useCreateLeaveRequestMutation,
  });

  // Mutation hooks for approving / rejecting an existing leave request
  const [approveLeave, { isLoading: isApproveLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useApproveLeaveRequestMutation,
  });
  const [rejectLeave, { isLoading: isRejectLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useRejectLeaveRequestMutation,
  });

  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const { data: session } = useSession();
  const isAdminUser = isAdminFromProfile((session as any)?.profile);
  const {
    data: leaveTypesData,
    isLoading: isLeaveTypeLoading,
    isFetching: isLeaveTypeFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetLeaveTypesQuery,
    params: { academicYearId: currentYear?.id },
  });

  const {
    data: leavePoliciesData,
    isLoading: isLeavePolicyLoading,
    isFetching: isLeavePolicyFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetLeavePoliciesQuery,
    params: { academicYearId: currentYear?.id },
  });

  const {
    initialValues,
    errors,
    touched,
    setFieldValue,
    values,
    handleSubmit,
    resetForm,
    isSubmitting,
    setFieldError,
  } = useFormik({
    enableReinitialize: true,
    initialValues: {
      employee: editData?.employeeId
        ? { id: editData.employeeId, label: editData.employeeName || '' }
        : isAdminUser
          ? null
          : SELF_OPTION,
      leavePolicyId: editData?.leavePolicyId || '',
      leaveTypeId: editData?.leaveTypeId || '',
      reason: editData?.reason || editData?.description || '',
      startDate: editData?.startDate ? dayjs(editData?.startDate) : null,
      endDate: editData?.endDate ? dayjs(editData?.endDate) : null,
      rejectionReason: editData?.rejectionReason || '',
      status: editData?.status,
      docs: editData?.attachmentUrl || '',
    },
    validationSchema: Yup.object().shape({
      employee: Yup.object().nullable().required('Employee is required'),
      leavePolicyId: Yup.string().required('Leave Policy is required'),
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
          // --- Update flow: approve or reject the existing leave request ---
          if (formValues.status === EmployeeLeaveStatusType.Rejected) {
            await rejectLeave({
              id: editData.id,
              body: { rejectionReason: formValues.rejectionReason },
            });
          } else {
            // Covers Pending → Approve and re-approving a previously Rejected leave
            await approveLeave({ id: editData.id, body: {} });
          }
        } else {
          // --- Create flow: build multipart/form-data body as per API contract ---
          const formData = buildCreateLeaveRequestFormData({
            employee: formValues.employee as EmployeeOption | null,
            leavePolicyId: formValues.leavePolicyId,
            leaveTypeId: formValues.leaveTypeId,
            startDate: formValues.startDate,
            endDate: formValues.endDate,
            reason: formValues.reason,
            docs: formValues.docs,
          });

          const createResult: any = await addLeave({
            academicYearId: currentYear?.id,
            body: formData,
          });

          if (createResult?.error) {
            const parsedError = parseApiProblemDetail(createResult.error);
            if (parsedError.errorCode === LEAVE_TARGET_EMPLOYEE_REQUIRED) {
              setFieldError('employee', 'Please select an employee to create leave.');
            }
            return;
          }
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
              <ShakingTextField error={!!touched.employee && !!errors.employee}>
                <PaginatedSearchSelect
                  label="Employee *"
                  fetchOptions={async (query, page) => {
                    if (page > 1) return { data: [], hasMore: false };
                    const res = await getEmployees({ search: query }).unwrap();
                    const items: EmployeeOption[] = (
                      Array.isArray(res) ? res : res?.items || []
                    ).map((item: any) => ({
                      label: item.fullName,
                      id: item.id,
                    }));
                    return {
                      data: buildEmployeeSelectOptions(items, isAdminUser),
                      hasMore: false,
                    };
                  }}
                  value={values.employee}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  renderOption={(prop, option: any) => (
                    <li {...prop} key={option.id}>
                      {option.label}
                    </li>
                  )}
                  getOptionLabel={(option: any) => option?.label || ''}
                  minChars={0}
                  onChange={(_, value) => setFieldValue('employee', value)}
                  debounceMs={400}
                  error={!!touched.employee && !!errors.employee}
                  helperText={(touched.employee && (errors.employee as string)) || ''}
                  disabled={!!editData}
                  size="small"
                />
              </ShakingTextField>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <ShakingTextField error={!!touched.leavePolicyId && !!errors.leavePolicyId}>
                <CustomSelect
                  isLoading={isLeavePolicyLoading || isLeavePolicyFetching}
                  options={leavePoliciesData?.items || []}
                  label="Leave Policy *"
                  value={values.leavePolicyId}
                  name="leavePolicyId"
                  valueKey="id"
                  disabled={!!editData}
                  labelKey="policyTitle"
                  error={!!touched.leavePolicyId && !!errors.leavePolicyId}
                  helperText={(touched.leavePolicyId && errors.leavePolicyId) || ''}
                  onChange={(value) => {
                    setFieldValue('leavePolicyId', value);
                  }}
                />
              </ShakingTextField>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <ShakingTextField error={!!touched.leaveTypeId && !!errors.leaveTypeId}>
                <CustomSelect
                  isLoading={isLeaveTypeLoading || isLeaveTypeFetching}
                  options={leaveTypesData?.items || []}
                  label="Leave Type *"
                  value={values.leaveTypeId}
                  name="leaveTypeId"
                  valueKey="id"
                  disabled={!!editData}
                  labelKey="name"
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
                // disabled={!!editData}
                // @ts-ignore
                value={values.docs}
                multiple={false}
                onChange={(value) => {
                  // const reader = new FileReader();
                  console.log('value', value);
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
            loading={isSubmitting || isApproveLoading || isRejectLoading}
            onClick={(e: any) => {
              handleSubmit(e);
            }}
            startIcon={<Iconify icon={GlobalIcons.submit} />}
            disabled={isSubmitting || isApproveLoading || isRejectLoading}
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
