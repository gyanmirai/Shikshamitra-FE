import type { RootState } from 'src/redux/store';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { capitalize } from 'lodash';
import { MuiColorInput } from 'mui-color-input';
import React, { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { LoadingButton } from '@mui/lab';
import {
  Box,
  Grid,
  Button,
  Switch,
  Tooltip,
  TextField,
  Typography,
  Autocomplete,
  DialogActions,
  FormControlLabel,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { GlobalIcons } from 'src/utils/icons';

import { useGetRolesQuery } from 'src/redux/role/roleApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { AccurateRateType, AccurateRateTypeArray } from 'src/enums/accurate-rate';
import {
  useGetEmployeeLeavePolicyQuery,
  useAddEmployeeLeavePolicyMutation,
  useUpdateEmployeeLeavePolicyMutation,
  useDeleteEmployeeLeavePolicyMutation,
} from 'src/redux/employee/employeeApi';

import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import { Iconify } from 'src/components/iconify/iconify';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import ShakingTextField from 'src/components/shaking-text-field';
import CustomizableTable from 'src/components/customizabaleTable';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

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

const LeavePolicy = ({ leavePolicyDialog: dialog }: any) => {
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
        content="Are you sure you want to delete?"
        action={
          <LoadingButton
            variant="contained"
            loading={isDeleteLoading}
            color="error"
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
            id: 'leaveType',
            label: 'Leave Type',
          },
          {
            id: 'leaveDays',
            label: 'Leave Days',
            filterType: 'number',
          },
          {
            id: 'isCarryForward',
            label: 'Carry Forward',
          },
          {
            id: 'accrualRateString',
            label: 'Accrual Rate',
          },
          {
            id: 'color',
            label: 'Color',
            isSort: false,
            isFilter: false,

            render(value, row) {
              return (
                <Box
                  sx={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    backgroundColor: value,
                  }}
                />
              );
            },
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
        data={tableData || []}
      />

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

export const LeavePolicyForm = ({
  handleClose,
  editData,
}: {
  handleClose: (e: any, isSubmit?: boolean) => void;
  editData: any | null;
}) => {
  const [addLeavePolicy, { isLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddEmployeeLeavePolicyMutation,
    popupConfig: {
      successMessage: 'Leave Policy created successfully',
      success: true,
    },
  });

  const [updateLeavePolicy, { isLoading: isUpdateLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateEmployeeLeavePolicyMutation,
  });

  const { data: roles, isLoading: isRolesLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetRolesQuery,
  });

  const formik = useFormik({
    initialValues: {
      leaveType: editData?.leaveType || '',
      leaveTypeShortName: editData?.leaveTypeShortName || '',
      leaveDays: editData?.leaveDays || 0,
      carryForward: editData?.carryForward || false,
      accrualRate: editData?.accrualRate ?? AccurateRateType.Monthly,
      color: editData?.color || 'white',
      roles: editData?.roles || [],
      fieldType: editData?.fieldType || 'paid',
    },
    validationSchema: Yup.object().shape({
      leaveType: Yup.string().required('Leave type is required'),
      leaveTypeShortName: Yup.string().required('Leave type short name is required'),
      leaveDays: Yup.number()
        .required('Leave days is required')
        .min(1, 'Leave days must be greater than 0'),
      color: Yup.string().required('Color is required'),
      roles: Yup.array().min(1, 'At least one role must be selected'),
      fieldType: Yup.string().required('Field type is required'),
    }),
    onSubmit: async (values) => {
      try {
        if (editData) {
          await updateLeavePolicy({
            id: editData.id,
            body: {
              leaveType: values.leaveType,
              leaveTypeShortName: values.leaveTypeShortName,
              leaveDays: values.leaveDays,
              carryForward: values.carryForward,
              accrualRate: values.accrualRate,
              color: values.color,
              roles: values.roles,
              fieldType: values.fieldType,
            },
          });
        } else {
          await addLeavePolicy({
            leaveType: values.leaveType,
            leaveTypeShortName: values.leaveTypeShortName,
            leaveDays: values.leaveDays,
            carryForward: values.carryForward,
            accrualRate: values.accrualRate,
            color: values.color,
            roles: values.roles,
            fieldType: values.fieldType,
          });
        }
        handleClose(null, true);
        formik.resetForm();
      } catch (error) {
        console.log(error);
      }
    },
  });

  const fieldTypeOptions = [
    { value: 'paid', label: 'Paid Leave' },
    { value: 'unpaid', label: 'Unpaid Leave' },
    { value: 'sick', label: 'Sick Leave' },
    { value: 'casual', label: 'Casual Leave' },
    { value: 'earned', label: 'Earned Leave' },
  ];

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <form onSubmit={formik.handleSubmit}>
        <Scrollbar sx={{ p: 3, bgcolor: 'background.neutral' }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <ShakingTextField
                error={formik.touched.leaveType && Boolean(formik.errors.leaveType)}
              >
                <Autocomplete
                  options={[
                    { value: 'Annual Leave', label: 'Annual Leave' },
                    { value: 'Sick Leave', label: 'Sick Leave' },
                    { value: 'Casual Leave', label: 'Casual Leave' },
                    { value: 'Maternity Leave', label: 'Maternity Leave' },
                    { value: 'Paternity Leave', label: 'Paternity Leave' },
                    { value: 'Bereavement Leave', label: 'Bereavement Leave' },
                    { value: 'Study Leave', label: 'Study Leave' },
                    { value: 'Unpaid Leave', label: 'Unpaid Leave' },
                    { value: 'Compensatory Leave', label: 'Compensatory Leave' },
                    { value: 'Marriage Leave', label: 'Marriage Leave' },
                  ]}
                  freeSolo
                  fullWidth
                  value={
                    formik.values.leaveType
                      ? { value: formik.values.leaveType, label: formik.values.leaveType }
                      : null
                  }
                  onChange={(event, newValue) => {
                    if (typeof newValue === 'string') {
                      formik.setFieldValue('leaveType', capitalize(newValue));
                      // @ts-ignore
                    } else if (newValue && newValue.inputValue) {
                      // User typed a new value
                      // @ts-ignore
                      formik.setFieldValue('leaveType', capitalize(newValue.inputValue));
                    } else if (newValue) {
                      formik.setFieldValue('leaveType', newValue.value);
                    } else {
                      formik.setFieldValue('leaveType', '');
                    }
                  }}
                  getOptionLabel={(option) => {
                    if (typeof option === 'string') return option;
                    // @ts-ignore
                    if (option.inputValue) return option.inputValue;
                    return option.label;
                  }}
                  filterOptions={(options, params) => {
                    const filtered = options.filter((option) =>
                      option.label.toLowerCase().includes(params.inputValue.toLowerCase())
                    );

                    const isExisting = options.some(
                      (option) => option.label.toLowerCase() === params.inputValue.toLowerCase()
                    );

                    if (params.inputValue !== '' && !isExisting) {
                      filtered.push({
                        // @ts-ignore
                        inputValue: params.inputValue,
                        label: `Add "${params.inputValue}"`,
                      });
                    }

                    return filtered;
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Leave Type *"
                      error={formik.touched.leaveType && Boolean(formik.errors.leaveType)}
                      helperText={(formik.touched.leaveType && formik.errors.leaveType) as string}
                      size="small"
                    />
                  )}
                />
              </ShakingTextField>
            </Grid>

            <Grid item xs={12}>
              <ShakingTextField
                error={
                  formik.touched.leaveTypeShortName && Boolean(formik.errors.leaveTypeShortName)
                }
              >
                <TextField
                  name="leaveTypeShortName"
                  label="Leave Type Short Name *"
                  value={formik.values.leaveTypeShortName}
                  onChange={formik.handleChange}
                  size="small"
                  fullWidth
                  error={
                    formik.touched.leaveTypeShortName && Boolean(formik.errors.leaveTypeShortName)
                  }
                  helperText={
                    (formik.touched.leaveTypeShortName &&
                      formik.errors.leaveTypeShortName) as string
                  }
                />
              </ShakingTextField>
            </Grid>

            <Grid item xs={12}>
              <ShakingTextField
                error={formik.touched.leaveDays && Boolean(formik.errors.leaveDays)}
              >
                <TextField
                  name="leaveDays"
                  label="Leave Days *"
                  value={formik.values.leaveDays}
                  onChange={formik.handleChange}
                  size="small"
                  type="number"
                  fullWidth
                  error={formik.touched.leaveDays && Boolean(formik.errors.leaveDays)}
                  helperText={(formik.touched.leaveDays && formik.errors.leaveDays) as string}
                />
              </ShakingTextField>
            </Grid>

            <Grid item xs={12}>
              <ShakingTextField
                error={formik.touched.fieldType && Boolean(formik.errors.fieldType)}
              >
                <CustomSelect
                  options={fieldTypeOptions}
                  label="Field Type *"
                  fullWidth
                  formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
                  value={formik.values.fieldType}
                  onChange={(val) => formik.setFieldValue('fieldType', val)}
                  error={formik.touched.fieldType && Boolean(formik.errors.fieldType)}
                  helperText={(formik.touched.fieldType && formik.errors.fieldType) as string}
                />
              </ShakingTextField>
            </Grid>

            <Grid item xs={12}>
              <ShakingTextField error={formik.touched.roles && Boolean(formik.errors.roles)}>
                <Autocomplete
                  multiple
                  options={roles?.items || []}
                  getOptionLabel={(option) => option.name || ''}
                  value={formik.values.roles}
                  onChange={(event, newValue) => {
                    formik.setFieldValue('roles', newValue);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Roles *"
                      error={formik.touched.roles && Boolean(formik.errors.roles)}
                      helperText={(formik.touched.roles && formik.errors.roles) as string}
                      size="small"
                    />
                  )}
                  size="small"
                  fullWidth
                />
              </ShakingTextField>
            </Grid>

            <Grid item xs={12}>
              <ShakingTextField
                error={formik.touched.accrualRate && Boolean(formik.errors.accrualRate)}
              >
                <CustomSelect
                  options={AccurateRateTypeArray}
                  label="Accrual Rate *"
                  fullWidth
                  formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
                  value={formik.values.accrualRate}
                  onChange={(val) => formik.setFieldValue('accrualRate', val)}
                  error={formik.touched.accrualRate && Boolean(formik.errors.accrualRate)}
                  helperText={(formik.touched.accrualRate && formik.errors.accrualRate) as string}
                />
              </ShakingTextField>
            </Grid>

            <Grid item xs={12}>
              <ShakingTextField error={formik.touched.color && Boolean(formik.errors.color)}>
                <MuiColorInput
                  format="hex"
                  value={formik.values.color}
                  onChange={(color) => formik.setFieldValue('color', color)}
                  fullWidth
                  placeholder="Color *"
                  label="Color *"
                  size="small"
                  error={formik.touched.color && Boolean(formik.errors.color)}
                  helperText={(formik.touched.color && formik.errors.color) as string}
                />
              </ShakingTextField>
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    name="carryForward"
                    checked={formik.values.carryForward}
                    onChange={formik.handleChange}
                  />
                }
                label="Enable Carry Forward"
              />
            </Grid>
          </Grid>
        </Scrollbar>
        <DialogActions>
          <Button
            startIcon={<Iconify icon={GlobalIcons.cancel} />}
            onClick={handleClose}
            variant="outlined"
            size="small"
          >
            Cancel
          </Button>
          <LoadingButton
            startIcon={<Iconify icon={GlobalIcons.submit} />}
            loading={isUpdateLoading || isLoading}
            type="submit"
            variant="contained"
            size="small"
          >
            Submit
          </LoadingButton>
        </DialogActions>
      </form>
    </BackPopUpChecked>
  );
};
