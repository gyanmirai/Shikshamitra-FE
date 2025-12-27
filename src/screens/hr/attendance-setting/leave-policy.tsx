'use client';

import type { RootState } from 'src/redux/store';

// Removed dayjs since date fields are no longer part of simplified form
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { LoadingButton } from '@mui/lab';
import { Add } from '@mui/icons-material';
import { GlobalIcons } from 'src/utils/icons';
import React, { useMemo, useState } from 'react';
import { useBoolean } from 'src/hooks/use-boolean';
import { useDispatch, useSelector } from 'react-redux';
import { Iconify } from 'src/components/iconify/iconify';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import ShakingTextField from 'src/components/shaking-text-field';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import {
  useGetEmployeeLeavePolicyQuery,
  useAddEmployeeLeavePolicyMutation,
  useDeleteEmployeeLeavePolicyMutation,
  useUpdateEmployeeLeavePolicyMutation,
} from 'src/redux/employee/employeeApi';
import {
  Box,
  Grid,
  Button,
  Select,
  Divider,
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

import type { ILeavePolicy } from './leave-type';

// Interface removed due to simplified static table usage.

const LeavePolicy = () => {
  // const dialog = useBoolean(false);
  const confirm = useBoolean(false);
  const [editData, setEditData] = useState<any>(null);
  const dispatch = useDispatch();
  const leavePolicyDialog = useBoolean(false);
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  // Removed leave policy fetch – using static sample data for simplified form.

  const { data: leavePolicyData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetEmployeeLeavePolicyQuery,
  });

  const [deleteLeavePolicy, { isLoading: isDeleteLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeleteEmployeeLeavePolicyMutation,
  });

  const tableData = useMemo(() => leavePolicyData?.items || [], [leavePolicyData?.items]);

  const handleClose = (_e: any, isSubmit?: boolean) => {
    const resetState = () => {
      setTimeout(() => {
        setEditData(null);
        dispatch(setIsChanges(false));
      }, 200); // Adjust based on your dialog close animation duration
    };

    if (isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'))) {
      leavePolicyDialog.onFalse();
      resetState();
    } else if (!isChanges) {
      leavePolicyDialog.onFalse();
      setTimeout(() => {
        setEditData(null);
      }, 200);
    }
  };

  // Derived table data (kept inline in CustomizableTable for simplified form) – remove unused mapping.
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CustomBreadcrumbs
        heading="Leave Policy"
        description="Define and manage leave policies for your organization to ensure smooth attendance and leave management."
        links={[
          { name: 'Hr', href: '/hr/dashboard/' },
          { name: 'Attendance & Leave Management' },
          { name: 'Setting' },
          { name: 'Leave Policy' },
        ]}
        action={
          <Button
            sx={{ width: '160px' }}
            startIcon={<Add />}
            onClick={leavePolicyDialog.onTrue}
            variant="contained"
            size="small"
          >
            Leave Policy
          </Button>
        }
      />
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
          onClick={leavePolicyDialog.onTrue}
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
                leavePolicyDialog.onTrue();
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
            label: 'Name',
            minWidth: '12vw',
            align: 'left',
            sticky: true,
          },
          {
            id: 'leaveType',
            label: 'Leave Type',
            minWidth: '11vw',
            align: 'left',
          },
          {
            id: 'maxLeavePerYear',
            label: 'Maximum Per year',
            minWidth: '17vw',
            align: 'left',
          },
          {
            id: 'carryForward',
            label: 'Carry Forward',
            minWidth: '16vw',
            align: 'left',
            render: (value) => (value ? 'Yes' : 'No'),
          },
          {
            id: 'encashmentAllowed',
            label: 'Encashable',
            minWidth: '16vw',
            align: 'left',
            render: (value) => (value ? 'Yes' : 'No'),
          },
          {
            id: 'paidType',
            label: 'Paid Type',
            minWidth: '16vw',
            align: 'left',
            filterType: 'date',
          },
          {
            id: 'requiresApproval',
            label: 'Requires Approval',
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
                    leavePolicyDialog.onTrue();
                  }}
                />
              );
            },
          },
        ]}
        data={tableData}
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
        open={leavePolicyDialog.value}
        handleClose={() => {
          leavePolicyDialog.onFalse();
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

const leaveTypes = ['Sick Leave', 'Casual Leave', 'Earned Leave'];
const paidTypes = ['Paid', 'Unpaid'];
// Simplified validation schema per new requirements
const validationSchema = Yup.object({
  policyTitle: Yup.string().required('Policy title is required'),
  leaveType: Yup.string().required('Leave type is required'),
  maxLeavePerYear: Yup.number()
    .typeError('Must be a number')
    .integer('Must be an integer')
    .min(0, 'Cannot be negative')
    .required('Maximum leave per year is required'),

  requiresApproval: Yup.boolean(),

  paidType: Yup.string().required('Paid type is required'),
  carryForward: Yup.boolean(),
  encashmentAllowed: Yup.boolean(),

  description: Yup.string().max(1000, 'Description cannot exceed 1000 characters'),
});

export const LeavePolicyForm = ({
  handleClose,
  editData,
}: {
  handleClose: (e: any, isSubmit?: boolean) => void;
  editData: ILeavePolicy | null;
}) => {
  const [addLeavePolicy, { isLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddEmployeeLeavePolicyMutation,
  });

  const [updateLeavePolicy, { isLoading: isUpdateLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateEmployeeLeavePolicyMutation,
  });
  const formik = useFormik({
    initialValues: {
      policyTitle: editData?.title || '',
      leaveType: editData?.leaveType || '',
      maxLeavePerYear: editData?.maxLeavePerYear?.toString() || '',
      paidType: editData?.paidType || 'Paid',
      carryForward: editData?.carryForward ?? false,
      encashmentAllowed: editData?.encashmentAllowed ?? false,
      requiresApproval: editData?.requiresApproval ?? false,
      description: editData?.description || '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        const payload = {
          policyTitle: values.policyTitle,
          leaveType: values.leaveType,
          maxLeavePerYear: Number(values.maxLeavePerYear),
          paidType: values.paidType,
          carryForward: values.carryForward,
          encashmentAllowed: values.encashmentAllowed,
          requiresApproval: values.requiresApproval,
          description: values.description || undefined,
        };

        if (!editData) {
          await addLeavePolicy(payload);
          shikshaMitraToast.success({
            message: `Leave policy ${values.policyTitle} added successfully`,
          });
        } else {
          await updateLeavePolicy({
            id: editData.id,
            body: payload,
          });
          shikshaMitraToast.success({
            message: `Leave policy ${values.policyTitle} updated successfully`,
          });
        }
        handleClose(null, true);
      } catch (error) {
        console.error('Failed to save leave policy:', error);
        shikshaMitraToast.error({
          message: editData ? 'Failed to update leave policy' : 'Failed to add leave policy',
        });
      }
    },
  });

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <DialogScrollContent>
        <SectionCard title="Leave Policy Details">
          <Grid size={{ xs: 6 }}>
            <ShakingTextField error={!!(formik.touched.policyTitle && formik.errors.policyTitle)}>
              <TextField
                size="small"
                fullWidth
                label="Policy Name *"
                error={formik.touched.policyTitle && Boolean(formik.errors.policyTitle)}
                helperText={
                  (formik.touched.policyTitle && (formik.errors.policyTitle as string)) || ''
                }
                {...formik.getFieldProps('policyTitle')}
              />
            </ShakingTextField>
          </Grid>
          <Grid size={{ xs: 6 }}>
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
                  fullWidth
                >
                  {leaveTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
                {formik.touched.leaveType && formik.errors.leaveType && (
                  <FormHelperText>{formik.errors.leaveType as string}</FormHelperText>
                )}
              </FormControl>
            </ShakingTextField>
          </Grid>
          <Grid size={{ xs: 6 }}>
            <ShakingTextField
              error={!!(formik.touched.maxLeavePerYear && formik.errors.maxLeavePerYear)}
            >
              <TextField
                size="small"
                fullWidth
                label="Maximum Days per Year *"
                type="number"
                onKeyDown={(e) => {
                  if (['e', 'E', '+', '-', '.'].includes(e.key)) {
                    e.preventDefault();
                  }
                }}
                error={formik.touched.maxLeavePerYear && Boolean(formik.errors.maxLeavePerYear)}
                helperText={
                  (formik.touched.maxLeavePerYear && (formik.errors.maxLeavePerYear as string)) ||
                  ''
                }
                {...formik.getFieldProps('maxLeavePerYear')}
              />
            </ShakingTextField>
          </Grid>
          <Grid size={{ xs: 6 }}>
            <ShakingTextField error={!!(formik.touched.paidType && formik.errors.paidType)}>
              <FormControl
                fullWidth
                size="small"
                error={formik.touched.paidType && Boolean(formik.errors.paidType)}
              >
                <InputLabel id="paid-type-label">Paid Type *</InputLabel>
                <Select
                  labelId="paid-type-label"
                  label="Paid Type *"
                  name="paidType"
                  value={formik.values.paidType}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  fullWidth
                >
                  {paidTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
                {formik.touched.paidType && formik.errors.paidType && (
                  <FormHelperText>{formik.errors.paidType as string}</FormHelperText>
                )}
              </FormControl>
            </ShakingTextField>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Divider />
          </Grid>
          <Grid size={{ xs: 6 }} display="flex" flexDirection="column">
            <FormControlLabel
              control={
                <Checkbox
                  size="small"
                  checked={formik.values.carryForward}
                  onChange={formik.handleChange}
                  name="carryForward"
                />
              }
              sx={{ mt: -2 }}
              label="Carry Forward"
            />
            <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5, pt: 0 }}>
              Allow unused leaves to carry forward to next year
            </Typography>
          </Grid>
          <Grid size={{ xs: 6 }} display="flex" flexDirection="column">
            <FormControlLabel
              control={
                <Checkbox
                  size="small"
                  checked={formik.values.encashmentAllowed}
                  onChange={formik.handleChange}
                  name="encashmentAllowed"
                />
              }
              sx={{ mt: -2 }}
              label="Encashable"
            />
            <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
              Allow employees to encash unused leaves
            </Typography>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Divider />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <FormControlLabel
              control={
                <Checkbox
                  size="small"
                  checked={formik.values.requiresApproval}
                  onChange={formik.handleChange}
                  name="requiresApproval"
                />
              }
              sx={{ mt: -2 }}
              label="Requires approval from supervisor"
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <ShakingTextField error={!!(formik.touched.description && formik.errors.description)}>
              <TextField
                size="small"
                fullWidth
                multiline
                minRows={3}
                label="Description"
                error={formik.touched.description && Boolean(formik.errors.description)}
                helperText={
                  (formik.touched.description && (formik.errors.description as string)) || ''
                }
                {...formik.getFieldProps('description')}
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
          loading={isLoading || isUpdateLoading}
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
