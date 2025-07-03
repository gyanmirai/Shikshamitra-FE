import type { RootState } from 'src/redux/store';
import type { UseBooleanReturn } from 'src/hooks/use-boolean';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import React, { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { LoadingButton } from '@mui/lab';
import { DatePicker } from '@mui/x-date-pickers';
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
  FormControlLabel,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { GlobalIcons } from 'src/utils/icons';

import { AccurateRateType } from 'src/enums/accurate-rate';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import {
  useGetEmployeeLeavePolicyQuery,
  useDeleteEmployeeLeavePolicyMutation,
} from 'src/redux/employee/employeeApi';

import { Iconify } from 'src/components/iconify/iconify';
import CustomTooltip from 'src/components/custom-tooltip';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';

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
    if (isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'))) {
      dispatch(setIsChanges(false));
      dialog.onFalse();
      setEditData(null);
    } else if (!isChanges) {
      dialog.onFalse();
      setEditData(null);
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
            Are you sure you want to delete <strong>{editData?.leaveType || 'this policy'}</strong>?
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
          },
          {
            id: 'accrualEndDate',
            label: 'Accrual End Date',
            minWidth: '16vw',
            align: 'left',
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
          setEditData(null);
        }}
      >
        <LeavePolicyForm handleClose={handleClose} editData={editData} />
      </CustomDialog>
    </Box>
  );
};
export default LeavePolicy;

const roles = ['Employee', 'Manager'];
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
  policyTitle: Yup.string().required('Required'),
  applicableRoles: Yup.string().required('Required'),
  leaveType: Yup.string().required('Required'),
  maxLeavePerYear: Yup.number().required('Required'),
  accrualMethod: Yup.string().required('Required'),
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
    },
  });

  return (
    <>
      <DialogScrollContent>
        <SectionCard title="General Policy Information">
          <Grid item xs={12} sm={4}>
            <TextField
              size="small"
              fullWidth
              label="Policy Title"
              {...formik.getFieldProps('policyTitle')}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small">
              <InputLabel id="applicable-roles-label">Applicable Roles</InputLabel>
              <Select
                labelId="applicable-roles-label"
                label="Applicable Roles"
                name="applicableRoles"
                value={formik.values.applicableRoles}
                onChange={formik.handleChange}
              >
                {roles.map((role) => (
                  <MenuItem key={role} value={role}>
                    {role}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small">
              <InputLabel id="leave-type-label">Leave Type</InputLabel>
              <Select
                labelId="leave-type-label"
                label="Leave Type"
                name="leaveType"
                value={formik.values.leaveType}
                onChange={formik.handleChange}
              >
                {leaveTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              size="small"
              fullWidth
              label="Maximum Leaves per Year"
              type="number"
              {...formik.getFieldProps('maxLeavePerYear')}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Leave Accrual Method</InputLabel>
              <Select
                name="accrualMethod"
                value={formik.values.accrualMethod}
                onChange={formik.handleChange}
                label="Leave Accrual Method"
              >
                {accrualMethods.map((method) => (
                  <MenuItem key={method} value={method}>
                    {method}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <DatePicker
              slotProps={{ textField: { size: 'small', fullWidth: true } }}
              label="Accrual Start Date"
              value={formik.values.accrualStartDate}
              onChange={(val) => formik.setFieldValue('accrualStartDate', val)}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <DatePicker
              slotProps={{ textField: { size: 'small', fullWidth: true } }}
              label="Accrual End Date"
              value={formik.values.accrualEndDate}
              onChange={(val) => formik.setFieldValue('accrualEndDate', val)}
            />
          </Grid>
        </SectionCard>

        <SectionCard title="Leave Eligibility Rules">
          <Grid item xs={12}>
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

          <Grid item xs={4}>
            <TextField
              size="small"
              fullWidth
              label="No. of Days Before Leave Allowed"
              type="number"
              {...formik.getFieldProps('daysBeforeAllowed')}
            />
          </Grid>
          <Grid item xs={8} display="flex" gap={2}>
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
          <Grid item xs={4}>
            <TextField
              size="small"
              label="Max Days Per Application"
              fullWidth
              {...formik.getFieldProps('maxDaysPerApplication')}
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              size="small"
              label="Minimum Leave Duration"
              fullWidth
              {...formik.getFieldProps('minLeaveDuration')}
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              size="small"
              label="Min Days Between Applications"
              fullWidth
              {...formik.getFieldProps('minDaysBetweenApplications')}
            />
          </Grid>
          <Grid item xs={4}>
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
          <Grid item xs={12}>
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
            <Grid item xs={4}>
              <TextField
                size="small"
                label="Max Carry Forward"
                fullWidth
                {...formik.getFieldProps('maxCarryForward')}
              />
            </Grid>
          )}

          <Grid item xs={8} display="flex" gap={2}>
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

            {formik.values.encashmentAllowed && (
              <FormControl sx={{ flexGrow: 1 }} size="small">
                <InputLabel>Encashment Month</InputLabel>
                <Select
                  label="Encashment Month"
                  name="encashmentMonth"
                  value={formik.values.encashmentMonth}
                  onChange={formik.handleChange}
                >
                  {months.map((month) => (
                    <MenuItem key={month} value={month}>
                      {month}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </Grid>
        </SectionCard>

        <SectionCard title="Application Timeline">
          <Grid item xs={4}>
            <TextField
              size="small"
              label="Leave Apply Advance Days Allowed"
              fullWidth
              {...formik.getFieldProps('applyAdvanceDays')}
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              size="small"
              label="Leave Cancellation Deadline"
              fullWidth
              {...formik.getFieldProps('cancelDeadline')}
            />
          </Grid>
        </SectionCard>

        <SectionCard title="Additional Leave Rules">
          <Grid item xs={4}>
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
          </Grid>
          <Grid item xs={4}>
            <FormControlLabel
              control={
                <Checkbox
                  size="small"
                  checked={formik.values.sandwichRule}
                  onChange={(e) => {
                    formik.handleChange(e);
                    if (!e.target.checked) {
                      formik.setFieldValue('sandwichCount', ''); // Optional: reset field
                    }
                  }}
                  name="sandwichRule"
                />
              }
              label="Sandwich Rule Applied?"
            />
          </Grid>

          {formik.values.sandwichRule && (
            <Grid item xs={4}>
              <TextField
                size="small"
                label="Sandwich Allowed Count (per month)"
                fullWidth
                {...formik.getFieldProps('sandwichCount')}
              />
            </Grid>
          )}
        </SectionCard>

        <SectionCard title="Description & Notes">
          <Grid item xs={12}>
            <TextField
              size="small"
              label="Description / Notes"
              fullWidth
              multiline
              minRows={3}
              {...formik.getFieldProps('notes')}
            />
          </Grid>
        </SectionCard>
      </DialogScrollContent>

      <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
        <Button
          size="small"
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
          variant="outlined"
          onClick={handleClose}
        >
          Cancel
        </Button>
        <LoadingButton
          size="small"
          startIcon={<Iconify icon={GlobalIcons.submit} />}
          variant="contained"
          type="submit"
        >
          {editData ? 'Update' : 'Submit'}
        </LoadingButton>
      </DialogActions>
    </>
  );
};
