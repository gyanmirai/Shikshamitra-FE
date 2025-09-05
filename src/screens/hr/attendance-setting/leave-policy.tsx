import type { RootState } from 'src/redux/store';
import type { UseBooleanReturn } from 'src/hooks/use-boolean';

import dayjs from 'dayjs';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { LoadingButton } from '@mui/lab';
import { GlobalIcons } from 'src/utils/icons';
import React, { useMemo, useState } from 'react';
import { DatePicker } from '@mui/x-date-pickers';
import { useBoolean } from 'src/hooks/use-boolean';
import { useDispatch, useSelector } from 'react-redux';
import { Iconify } from 'src/components/iconify/iconify';
import CustomTooltip from 'src/components/custom-tooltip';
import { AccurateRateType } from 'src/enums/accurate-rate';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import ShakingTextField from 'src/components/shaking-text-field';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import {
  useGetEmployeeLeavePolicyQuery,
  useDeleteEmployeeLeavePolicyMutation,
} from 'src/redux/employee/employeeApi';
import {
  Box,
  Grid,
  Button,
  Select,
  MenuItem,
  Checkbox,
  TextField,
  Typography,
  InputLabel,
  FormControl,
  DialogActions,
  FormHelperText,
  FormControlLabel,
} from '@mui/material';

import { SectionCard } from '../employee/employee-form-fields/InformationFields';

interface ILeavePolicy {
  id: string;
  creationTime: string;
  creatorId: string;
  lastModificationTime: string;
  lastModifierId: string;
  leaveType: string;
  leaveDays: number;
  carryForward: boolean;
  accrualRate: number;
  color: string;
}

const LeavePolicy = ({ leavePolicyDialog: dialog }: { leavePolicyDialog: UseBooleanReturn }) => {
  // const dialog = useBoolean(false);
  const confirm = useBoolean(false);
  const [editData, setEditData] = useState<any>(null);
  const dispatch = useDispatch();
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const { data: leavePolicyData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetEmployeeLeavePolicyQuery,
  });

  const [deleteLeavePolicy, { isLoading: isDeleteLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeleteEmployeeLeavePolicyMutation,
  });

  const handleClose = (_e: any, isSubmit?: boolean) => {
    const resetState = () => {
      setTimeout(() => {
        setEditData(null);
        dispatch(setIsChanges(false));
      }, 200); // Adjust based on your dialog close animation duration
    };

    if (isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'))) {
      dialog.onFalse();
      resetState();
    } else if (!isChanges) {
      dialog.onFalse();
      setTimeout(() => {
        setEditData(null);
      }, 200);
    }
  };

  const tableData = useMemo(
    () =>
      leavePolicyData?.items.map((item: ILeavePolicy) => ({
        ...item,
        leaveDays: item.leaveDays.toString(),
        isCarryForward: item.carryForward ? 'Yes' : 'No',
        accrualRateString: AccurateRateType[item.accrualRate],
        color: item.color,
      })) || [],
    [leavePolicyData?.items]
  );
  return (
    <Box>
      <ConfirmDialog
        open={confirm.value}
        onClose={() => {
          setEditData(null);
          confirm.onFalse();
        }}
        title="Delete"
        content={
          <>
            Are you sure you want to delete <strong>{editData?.title || 'this policy'}</strong>?
          </>
        }
        action={
          <LoadingButton
            variant="contained"
            loading={isDeleteLoading}
            color="error"
            size="small"
            onClick={async () => {
              await deleteLeavePolicy(editData?.id);
              confirm.onFalse();
            }}
          >
            Yes
          </LoadingButton>
        }
      />
      {/* <Box display="flex" justifyContent="flex-end" alignItems="center">
        <Button
          sx={{ width: '160px' }}
          startIcon={<Add />}
          onClick={dialog.onTrue}
          variant="contained"
          size="small"
        >
          Leave Policy
        </Button>
      </Box> */}
      <CustomizableTable
        noDataText={
          <>
            No Leave Policy Found{' '}
            <Box
              onClick={() => {
                dialog.onTrue();
              }}
              color="primary.main"
              fontWeight={600}
              sx={{
                '&:hover': {
                  cursor: 'pointer',
                  color: 'primary.main',
                  textDecoration: 'underline',
                },
              }}
            >
              Leave Policy
            </Box>
          </>
        }
        isLoading={isLoading}
        tableId="leave-policy-table"
        columns={[
          {
            id: 'title',
            label: 'Policy Title',
            minWidth: '12vw',
            align: 'left',
          },
          {
            id: 'role',
            label: 'Applicable Role',
            filterType: 'number',
            minWidth: '13vw',
            align: 'left',
          },
          {
            id: 'leaveType',
            label: 'Leave Type',
            minWidth: '11vw',
            align: 'left',
          },
          {
            id: 'leaveAccrualMethod',
            label: 'Leave Accrual Method',
            minWidth: '17vw',
            align: 'left',
          },
          {
            id: 'accrualStartDate',
            label: 'Accrual Start Date',
            minWidth: '16vw',
            align: 'left',
            filterType: 'date',
          },
          {
            id: 'accrualEndDate',
            label: 'Accrual End Date',
            minWidth: '16vw',
            align: 'left',
            filterType: 'date',
          },
          {
            id: 'action',
            label: 'Actions',
            isSort: false,
            isFilter: false,
            sticky: true,
            render(value, row) {
              return (
                <ThreeDotsActions
                  showEditIcon
                  showDeleteIcon
                  showThreeDots={false}
                  handleDeleteClick={() => {
                    setEditData(row);
                    confirm.onTrue();
                  }}
                  handleEditClick={() => {
                    setEditData(row);
                    dialog.onTrue();
                  }}
                />
              );
            },
          },
        ]}
        data={[
          {
            id: 1,
            title: 'Annual Leave Policy',
            role: 'Employee',
            leaveType: 'Earned Leave',
            leaveAccrualMethod: 'Monthly',
            accrualStartDate: '01-01-2024',
            accrualEndDate: '31-12-2024',
          },
          {
            id: 2,
            title: 'Sick Leave Policy',
            role: 'Manager',
            leaveType: 'Sick Leave',
            leaveAccrualMethod: 'Yearly',
            accrualStartDate: '01-04-2024',
            accrualEndDate: '31-03-2025',
          },
          {
            id: 3,
            title: 'Casual Leave Policy',
            role: 'Employee',
            leaveType: 'Casual Leave',
            leaveAccrualMethod: 'Monthly',
            accrualStartDate: '01-01-2024',
            accrualEndDate: '31-12-2024',
          },
          {
            id: 4,
            title: 'Maternity Leave Policy',
            role: 'Employee',
            leaveType: 'Maternity Leave',
            leaveAccrualMethod: 'Yearly',
            accrualStartDate: '01-02-2024',
            accrualEndDate: '31-01-2025',
          },
          {
            id: 5,
            title: 'Paternity Leave Policy',
            role: 'Manager',
            leaveType: 'Paternity Leave',
            leaveAccrualMethod: 'Yearly',
            accrualStartDate: '01-03-2024',
            accrualEndDate: '28-02-2025',
          },
        ]}
      />

      <CustomDialog
        maxWidth="md"
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">
              {' '}
              {editData ? 'Update Leave Policy' : 'Add Leave Policy'}
            </Typography>
            <CustomTooltip
              arrow
              placement="right"
              title="In this dialog, you can create a leave policy by setting rules for different leave types (e.g., sick, casual), leave entitlements, and approval workflows."
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
        open={dialog.value}
        handleClose={() => {
          dialog.onFalse();
          setTimeout(() => {
            setEditData(null);
          }, 200); // Adjust timing to match your dialog close animation
        }}
      >
        <LeavePolicyForm handleClose={handleClose} editData={editData} />
      </CustomDialog>
    </Box>
  );
};
export default LeavePolicy;

const roles = ['Employee', 'Manager', 'Principal', 'Clinic staff'];
const leaveTypes = ['Sick Leave', 'Casual Leave', 'Earned Leave'];
const accrualMethods = ['Monthly', 'Yearly'];
const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
const validationSchema = Yup.object({
  policyTitle: Yup.string().required('Policy title is required'),
  applicableRoles: Yup.string().required('Applicable roles are required'),
  leaveType: Yup.string().required('Leave type is required'),
  maxLeavePerYear: Yup.number()
    .typeError('Must be a number')
    .min(0, 'Cannot be negative')
    .required('Maximum leave per year is required'),
  accrualMethod: Yup.string().required('Accrual method is required'),

  accrualStartDate: Yup.mixed()
    .required('Accrual start date is required')
    .test(
      'is-valid-dayjs',
      'Accrual start date must be a valid date',
      (value) => value && dayjs(value as any).isValid()
    ),

  accrualEndDate: Yup.mixed()
    .required('Accrual end date is required')
    .test(
      'is-valid-dayjs',
      'Accrual end date must be a valid date',
      (value) => value && dayjs(value as any).isValid()
    )
    .test('is-after-start', 'End date must be after start date', function (endDate) {
      const startDate = this.parent.accrualStartDate;
      return (
        dayjs(endDate as any).isValid() &&
        dayjs(startDate as any).isValid() &&
        dayjs(endDate as any).isSameOrAfter(dayjs(startDate as any))
      );
    }),

  probationRestriction: Yup.boolean(),

  daysBeforeAllowed: Yup.number().required('Days before allowed is required'),

  isPaid: Yup.boolean(),
  requiresApproval: Yup.boolean(),

  maxDaysPerApplication: Yup.number().required('Max days per application is required'),

  minLeaveDuration: Yup.number().required('Minimum leave duration is required'),

  minDaysBetweenApplications: Yup.number().required(
    'Minimum days between applications is required'
  ),

  allowHalfDay: Yup.boolean(),
  carryForward: Yup.boolean(),

  maxCarryForward: Yup.number().when('carryForward', {
    is: true,
    then: (schema) => schema.required('Max carry forward is required'),
    otherwise: (schema) => schema.notRequired(),
  }),

  encashmentAllowed: Yup.boolean(),

  encashmentMonth: Yup.string().when('encashmentAllowed', {
    is: true,
    then: (schema) => schema.required('Encashment month is required'),
    otherwise: (schema) => schema.notRequired(),
  }),

  applyAdvanceDays: Yup.number().required('Advance application days are required'),

  cancelDeadline: Yup.number().required('Cancellation deadline is required'),

  attachmentRequired: Yup.boolean(),
  sandwichRule: Yup.boolean(),

  sandwichCount: Yup.number().when('sandwichRule', {
    is: true,
    then: (schema) => schema.required('Sandwich count is required'),
    otherwise: (schema) => schema.notRequired(),
  }),

  notes: Yup.string().max(1000, 'Notes cannot exceed 1000 characters'),
});

export const LeavePolicyForm = ({
  handleClose,
  editData,
}: {
  handleClose: (e: any, isSubmit?: boolean) => void;
  editData: any | null;
}) => {
  const formik = useFormik({
    initialValues: {
      policyTitle: '',
      applicableRoles: '',
      leaveType: '',
      maxLeavePerYear: '',
      accrualMethod: '',
      accrualStartDate: null,
      accrualEndDate: null,
      probationRestriction: true,
      daysBeforeAllowed: '',
      isPaid: false,
      requiresApproval: false,
      maxDaysPerApplication: '',
      minLeaveDuration: '',
      minDaysBetweenApplications: '',
      allowHalfDay: false,
      carryForward: true,
      maxCarryForward: '',
      encashmentAllowed: false,
      encashmentMonth: '',
      applyAdvanceDays: '',
      cancelDeadline: '',
      attachmentRequired: false,
      sandwichRule: false,
      sandwichCount: '',
      notes: '',
    },
    validationSchema,
    onSubmit: (values) => {
      console.log(values);
      handleClose(null, true);
    },
  });

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <DialogScrollContent>
        <SectionCard title="General Policy Information">
          <Grid size={{ xs: 12, md: 4 }}>
            <ShakingTextField error={!!(formik.touched.policyTitle && formik.errors.policyTitle)}>
              <TextField
                size="small"
                fullWidth
                label="Policy Title *"
                error={formik.touched.policyTitle && Boolean(formik.errors.policyTitle)}
                helperText={formik.touched.policyTitle && formik.errors.policyTitle}
                {...formik.getFieldProps('policyTitle')}
              />
            </ShakingTextField>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <ShakingTextField
              error={!!(formik.touched.applicableRoles && formik.errors.applicableRoles)}
            >
              <FormControl
                fullWidth
                size="small"
                error={formik.touched.applicableRoles && Boolean(formik.errors.applicableRoles)}
              >
                <InputLabel id="applicable-roles-label">Applicable Roles *</InputLabel>
                <Select
                  labelId="applicable-roles-label"
                  label="Applicable Roles *"
                  name="applicableRoles"
                  value={formik.values.applicableRoles}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                >
                  {roles.map((role) => (
                    <MenuItem key={role} value={role}>
                      {role}
                    </MenuItem>
                  ))}
                </Select>
                {formik.touched.applicableRoles && formik.errors.applicableRoles && (
                  <FormHelperText>{formik.errors.applicableRoles}</FormHelperText>
                )}
              </FormControl>
            </ShakingTextField>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <ShakingTextField error={!!(formik.touched.leaveType && formik.errors.leaveType)}>
              <FormControl
                fullWidth
                size="small"
                error={formik.touched.leaveType && Boolean(formik.errors.leaveType)}
              >
                <InputLabel id="leave-type-label">Leave Type *</InputLabel>
                <Select
                  labelId="leave-type-label"
                  label="Leave Type *"
                  name="leaveType"
                  value={formik.values.leaveType}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                >
                  {leaveTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
                {formik.touched.leaveType && formik.errors.leaveType && (
                  <FormHelperText>{formik.errors.leaveType}</FormHelperText>
                )}
              </FormControl>
            </ShakingTextField>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <ShakingTextField
              error={!!(formik.touched.maxLeavePerYear && formik.errors.maxLeavePerYear)}
            >
              <TextField
                size="small"
                fullWidth
                label="Maximum Leaves per Year *"
                type="number"
                onKeyDown={(e) => {
                  if (['e', 'E', '+', '-', '.'].includes(e.key)) {
                    e.preventDefault();
                  }
                }}
                error={formik.touched.maxLeavePerYear && Boolean(formik.errors.maxLeavePerYear)}
                helperText={formik.touched.maxLeavePerYear && formik.errors.maxLeavePerYear}
                {...formik.getFieldProps('maxLeavePerYear')}
              />
            </ShakingTextField>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <ShakingTextField
              error={!!(formik.touched.accrualMethod && formik.errors.accrualMethod)}
            >
              <FormControl
                fullWidth
                size="small"
                error={formik.touched.accrualMethod && Boolean(formik.errors.accrualMethod)}
              >
                <InputLabel>Leave Accrual Method *</InputLabel>
                <Select
                  name="accrualMethod"
                  value={formik.values.accrualMethod}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  label="Leave Accrual Method *"
                >
                  {accrualMethods.map((method) => (
                    <MenuItem key={method} value={method}>
                      {method}
                    </MenuItem>
                  ))}
                </Select>
                {formik.touched.accrualMethod && formik.errors.accrualMethod && (
                  <FormHelperText>{formik.errors.accrualMethod}</FormHelperText>
                )}
              </FormControl>
            </ShakingTextField>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <ShakingTextField
              error={!!(formik.touched.accrualStartDate && formik.errors.accrualStartDate)}
            >
              <DatePicker
                slotProps={{
                  textField: {
                    size: 'small',
                    fullWidth: true,
                    error:
                      !!(formik.touched.accrualStartDate && formik.errors.accrualStartDate) ||
                      false,
                    helperText: formik.touched.accrualStartDate && formik.errors.accrualStartDate,
                    label: 'Accrual Start Date *',
                  },
                }}
                name="accrualStartDate"
                format="DD-MM-YYYY"
                value={formik.values.accrualStartDate}
                onChange={(val) => formik.setFieldValue('accrualStartDate', val)}
              />
            </ShakingTextField>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <ShakingTextField
              error={!!(formik.touched.accrualEndDate && formik.errors.accrualEndDate)}
            >
              <DatePicker
                slotProps={{
                  textField: {
                    size: 'small',
                    fullWidth: true,
                    error: formik.touched.accrualEndDate && Boolean(formik.errors.accrualEndDate),
                    helperText: formik.touched.accrualEndDate && formik.errors.accrualEndDate,
                    label: 'Accrual End Date *',
                  },
                }}
                name="accrualEndDate"
                format="DD-MM-YYYY"
                value={formik.values.accrualEndDate}
                onChange={(val) => formik.setFieldValue('accrualEndDate', val)}
              />
            </ShakingTextField>
          </Grid>
        </SectionCard>

        <SectionCard title="Leave Eligibility Rules">
          <Grid size={12}>
            <FormControlLabel
              control={
                <Checkbox
                  size="small"
                  checked={formik.values.probationRestriction}
                  onChange={formik.handleChange}
                  name="probationRestriction"
                />
              }
              label="Probation Period Restriction"
            />
          </Grid>

          <Grid size={4}>
            <ShakingTextField
              error={!!(formik.touched.daysBeforeAllowed && formik.errors.daysBeforeAllowed)}
            >
              <TextField
                size="small"
                fullWidth
                label="No. of Days Before Leave Allowed *"
                type="number"
                onKeyDown={(e) => {
                  if (['e', 'E', '+', '-', '.'].includes(e.key)) {
                    e.preventDefault();
                  }
                }}
                error={formik.touched.daysBeforeAllowed && Boolean(formik.errors.daysBeforeAllowed)}
                helperText={formik.touched.daysBeforeAllowed && formik.errors.daysBeforeAllowed}
                {...formik.getFieldProps('daysBeforeAllowed')}
              />
            </ShakingTextField>
          </Grid>
          <Grid size={8} display="flex" gap={2}>
            <FormControlLabel
              control={
                <Checkbox
                  size="small"
                  checked={formik.values.isPaid}
                  onChange={formik.handleChange}
                  name="isPaid"
                />
              }
              label="Is Paid Leave?"
            />
            <FormControlLabel
              control={
                <Checkbox
                  size="small"
                  checked={formik.values.requiresApproval}
                  onChange={formik.handleChange}
                  name="requiresApproval"
                />
              }
              label="Requires Approval?"
            />
          </Grid>
        </SectionCard>

        <SectionCard title="Leave Duration & Application Limits">
          <Grid size={4}>
            <ShakingTextField
              error={
                !!(formik.touched.maxDaysPerApplication && formik.errors.maxDaysPerApplication)
              }
            >
              <TextField
                size="small"
                label="Max Days Per Application *"
                fullWidth
                type="number"
                onKeyDown={(e) => {
                  if (['e', 'E', '+', '-', '.'].includes(e.key)) {
                    e.preventDefault();
                  }
                }}
                error={
                  formik.touched.maxDaysPerApplication &&
                  Boolean(formik.errors.maxDaysPerApplication)
                }
                helperText={
                  formik.touched.maxDaysPerApplication && formik.errors.maxDaysPerApplication
                }
                {...formik.getFieldProps('maxDaysPerApplication')}
              />
            </ShakingTextField>
          </Grid>
          <Grid size={4}>
            <ShakingTextField
              error={!!(formik.touched.minLeaveDuration && formik.errors.minLeaveDuration)}
            >
              <TextField
                size="small"
                type="number"
                label="Minimum Leave Duration *"
                fullWidth
                onKeyDown={(e) => {
                  if (['e', 'E', '+', '-', '.'].includes(e.key)) {
                    e.preventDefault();
                  }
                }}
                error={formik.touched.minLeaveDuration && Boolean(formik.errors.minLeaveDuration)}
                helperText={formik.touched.minLeaveDuration && formik.errors.minLeaveDuration}
                {...formik.getFieldProps('minLeaveDuration')}
              />
            </ShakingTextField>
          </Grid>
          <Grid size={4}>
            <ShakingTextField
              error={
                !!(
                  formik.touched.minDaysBetweenApplications &&
                  formik.errors.minDaysBetweenApplications
                )
              }
            >
              <TextField
                size="small"
                type="number"
                label="Min Days Between Applications *"
                fullWidth
                onKeyDown={(e) => {
                  if (['e', 'E', '+', '-', '.'].includes(e.key)) {
                    e.preventDefault();
                  }
                }}
                error={
                  formik.touched.minDaysBetweenApplications &&
                  Boolean(formik.errors.minDaysBetweenApplications)
                }
                helperText={
                  formik.touched.minDaysBetweenApplications &&
                  formik.errors.minDaysBetweenApplications
                }
                {...formik.getFieldProps('minDaysBetweenApplications')}
              />
            </ShakingTextField>
          </Grid>
          <Grid size={4}>
            <FormControlLabel
              control={
                <Checkbox
                  size="small"
                  checked={formik.values.allowHalfDay}
                  onChange={formik.handleChange}
                  name="allowHalfDay"
                />
              }
              label="Allow Half-Day Leave?"
            />
          </Grid>
        </SectionCard>

        <SectionCard title="Carry Forward & Encashment">
          <Grid size={12}>
            <FormControlLabel
              control={
                <Checkbox
                  size="small"
                  checked={formik.values.carryForward}
                  onChange={formik.handleChange}
                  name="carryForward"
                />
              }
              label="Carry Forward Allowed?"
            />
          </Grid>

          {formik.values.carryForward && (
            <Grid size={4}>
              <ShakingTextField
                error={!!(formik.touched.maxCarryForward && formik.errors.maxCarryForward)}
              >
                <TextField
                  size="small"
                  label="Max Carry Forward *"
                  fullWidth
                  type="number"
                  onKeyDown={(e) => {
                    if (['e', 'E', '+', '-', '.'].includes(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  error={formik.touched.maxCarryForward && Boolean(formik.errors.maxCarryForward)}
                  helperText={formik.touched.maxCarryForward && formik.errors.maxCarryForward}
                  {...formik.getFieldProps('maxCarryForward')}
                />
              </ShakingTextField>
            </Grid>
          )}

          <Grid size={4}>
            <FormControlLabel
              control={
                <Checkbox
                  size="small"
                  checked={formik.values.encashmentAllowed}
                  onChange={formik.handleChange}
                  name="encashmentAllowed"
                />
              }
              label="Encashment Allowed?"
            />
          </Grid>
          <Grid size={4}>
            {formik.values.encashmentAllowed && (
              <ShakingTextField
                error={!!(formik.touched.encashmentMonth && formik.errors.encashmentMonth)}
              >
                <FormControl
                  size="small"
                  fullWidth
                  error={formik.touched.encashmentMonth && Boolean(formik.errors.encashmentMonth)}
                >
                  <InputLabel>Encashment Month *</InputLabel>
                  <Select
                    fullWidth
                    label="Encashment Month *"
                    name="encashmentMonth"
                    value={formik.values.encashmentMonth}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  >
                    {months.map((month) => (
                      <MenuItem key={month} value={month}>
                        {month}
                      </MenuItem>
                    ))}
                  </Select>
                  {formik.touched.encashmentMonth && formik.errors.encashmentMonth && (
                    <FormHelperText>{formik.errors.encashmentMonth}</FormHelperText>
                  )}
                </FormControl>
              </ShakingTextField>
            )}
          </Grid>

          {/* {formik.values.encashmentAllowed && (
            <Grid size={{xs:12,md:4}}>
              <ShakingTextField
                error={!!(formik.touched.encashmentMonth && formik.errors.encashmentMonth)}
              >
                <FormControl
                  // sx={{ flexGrow: 1 }}
                  size="small"
                  error={formik.touched.encashmentMonth && Boolean(formik.errors.encashmentMonth)}
                >
                  <InputLabel>Encashment Month *</InputLabel>
                  <Select
                    label="Encashment Month *"
                    name="encashmentMonth"
                    value={formik.values.encashmentMonth}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    fullWidth
                  >
                    {months.map((month) => (
                      <MenuItem key={month} value={month}>
                        {month}
                      </MenuItem>
                    ))}
                  </Select>
                  {formik.touched.encashmentMonth && formik.errors.encashmentMonth && (
                    <FormHelperText>{formik.errors.encashmentMonth}</FormHelperText>
                  )}
                </FormControl>
              </ShakingTextField>
            </Grid>
          )} */}
        </SectionCard>

        <SectionCard title="Application Timeline">
          <Grid size={4}>
            <ShakingTextField
              error={!!(formik.touched.applyAdvanceDays && formik.errors.applyAdvanceDays)}
            >
              <TextField
                size="small"
                label="Leave Apply Advance Days Allowed *"
                fullWidth
                type="number"
                onKeyDown={(e) => {
                  if (['e', 'E', '+', '-', '.'].includes(e.key)) {
                    e.preventDefault();
                  }
                }}
                error={formik.touched.applyAdvanceDays && Boolean(formik.errors.applyAdvanceDays)}
                helperText={formik.touched.applyAdvanceDays && formik.errors.applyAdvanceDays}
                {...formik.getFieldProps('applyAdvanceDays')}
              />
            </ShakingTextField>
          </Grid>
          <Grid size={4}>
            <ShakingTextField
              error={!!(formik.touched.cancelDeadline && formik.errors.cancelDeadline)}
            >
              <TextField
                size="small"
                type="number"
                label="Leave Cancellation Deadline *"
                fullWidth
                onKeyDown={(e) => {
                  if (['e', 'E', '+', '-', '.'].includes(e.key)) {
                    e.preventDefault();
                  }
                }}
                error={formik.touched.cancelDeadline && Boolean(formik.errors.cancelDeadline)}
                helperText={formik.touched.cancelDeadline && formik.errors.cancelDeadline}
                {...formik.getFieldProps('cancelDeadline')}
              />
            </ShakingTextField>
          </Grid>
        </SectionCard>

        <SectionCard title="Additional Leave Rules">
          <Grid size={4}>
            <FormControlLabel
              control={
                <Checkbox
                  size="small"
                  checked={formik.values.attachmentRequired}
                  onChange={formik.handleChange}
                  name="attachmentRequired"
                />
              }
              label="Attachment Required?"
            />
            {formik.touched.attachmentRequired && formik.errors.attachmentRequired && (
              <FormHelperText error>{formik.errors.attachmentRequired}</FormHelperText>
            )}
          </Grid>
          <Grid size={4}>
            <FormControlLabel
              control={
                <Checkbox
                  size="small"
                  checked={formik.values.sandwichRule}
                  onChange={(e) => {
                    formik.handleChange(e);
                    if (!e.target.checked) {
                      formik.setFieldValue('sandwichCount', '');
                    }
                  }}
                  name="sandwichRule"
                />
              }
              label="Sandwich Rule Applied?"
            />
            {formik.touched.sandwichRule && formik.errors.sandwichRule && (
              <FormHelperText error>{formik.errors.sandwichRule}</FormHelperText>
            )}
          </Grid>

          {formik.values.sandwichRule && (
            <Grid size={4}>
              <ShakingTextField
                error={!!(formik.touched.sandwichCount && formik.errors.sandwichCount)}
              >
                <TextField
                  size="small"
                  label="Sandwich Allowed Count (per month) *"
                  fullWidth
                  type="number"
                  onKeyDown={(e) => {
                    if (['e', 'E', '+', '-', '.'].includes(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  error={formik.touched.sandwichCount && Boolean(formik.errors.sandwichCount)}
                  helperText={formik.touched.sandwichCount && formik.errors.sandwichCount}
                  {...formik.getFieldProps('sandwichCount')}
                />
              </ShakingTextField>
            </Grid>
          )}
        </SectionCard>

        <SectionCard title="Description & Notes">
          <Grid size={12}>
            <ShakingTextField error={!!(formik.touched.notes && formik.errors.notes)}>
              <TextField
                size="small"
                label="Description / Notes"
                fullWidth
                multiline
                minRows={3}
                error={formik.touched.notes && Boolean(formik.errors.notes)}
                helperText={formik.touched.notes && formik.errors.notes}
                {...formik.getFieldProps('notes')}
              />
            </ShakingTextField>
          </Grid>
        </SectionCard>
      </DialogScrollContent>

      <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
        <Button
          size="small"
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
          variant="outlined"
          onClick={() => {
            handleClose(null, false);
          }}
        >
          Cancel
        </Button>
        <LoadingButton
          size="small"
          form="dialog-form"
          onClick={(e: any) => formik.handleSubmit(e)}
          startIcon={
            <Iconify
              icon={editData ? GlobalIcons.edit : GlobalIcons.submit}
              width={editData ? 16 : 20}
              height={editData ? 16 : 20}
            />
          }
          variant="contained"
          type="submit"
        >
          {editData ? 'Update' : 'Submit'}
        </LoadingButton>
      </DialogActions>
    </BackPopUpChecked>
  );
};
