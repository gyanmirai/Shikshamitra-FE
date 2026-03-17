'use client';

import type { RootState } from 'src/redux/store';
import type { AccuralPolicyType } from 'src/enums/accuralPolicyType';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import type { IColumn } from 'src/components/customizabaleTable/types';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { capitalize } from 'lodash';
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
import { useConfirmWithUndo } from 'src/hooks/useConfirmWithUndo';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import ColorPickerCircle from 'src/components/static-color/colorPickerCircle';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { SubjectColorIndicator } from 'src/components/subject-color/SubejctColor';
import { Box, Grid, Button, TextField, Typography, DialogActions } from '@mui/material';
import {
  leaveApi,
  useGetLeaveTypesQuery,
  useDeleteLeaveTypeMutation,
  useCreateLeaveTypeMutation,
  useUpdateLeaveTypeMutation,
} from 'src/redux/hr/leaveApi';

export interface ILeavePolicy {
  id: string;
  creationTime: string;
  creatorId: string;
  lastModificationTime: string;
  lastModifierId: string;
  isDeleted: boolean;
  deleterId: string;
  deletionTime: string;
  title: string;
  leaveType: string;
  leaveCount: number;
  accuralPolicyType: AccuralPolicyType;
  maxLeavePerYear: number;
  paidType: string;
  carryForward: boolean;
  encashmentAllowed: boolean;
  encashmentTiming?: 'next_payroll' | 'year_end';
  requiresApproval: boolean;
  description: string;
  isActive: boolean;
}

const LeaveType = () => {
  // const dialog = useBoolean(false);
  const confirm = useBoolean(false);
  const [editData, setEditData] = useState<any>(null);
  const dispatch = useDispatch();
  const leaveTypeDialog = useBoolean(false);
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const { academicYearId } = useSelector((state: RootState) => state.globalState);
  const {
    data: leavePolicyData,
    refetch,
    isLoading,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetLeaveTypesQuery,
    params: { academicYearId: academicYearId?.id },
  });
  const [deleteLeavePolicy, { isLoading: isDeleteLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeleteLeaveTypeMutation,
  });

  const handleClose = (_e: any, isSubmit?: boolean) => {
    const resetState = () => {
      setEditData(null);
      dispatch(setIsChanges(false));
    };

    if (isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'))) {
      leaveTypeDialog.onFalse();
      resetState();
    } else if (!isChanges) {
      leaveTypeDialog.onFalse();
      setEditData(null);
    }
  };

  const { confirmWithUndo } = useConfirmWithUndo();

  const tableData = useMemo(
    () =>
      leavePolicyData?.items.map((item: ILeavePolicy) => ({
        ...item,
        leaveDays: item?.maxLeavePerYear?.toString(),
        isCarryForward: item.carryForward ? 'Yes' : 'No',
        // accrualRateString: AccurateRateType[item.accrualRate],
        // color: item.color,
      })) || [],
    [leavePolicyData?.items]
  );

  const columns: IColumn[] = useMemo(
    () => [
      {
        id: 'name',
        label: 'Leave Type',
        render: (value, row) => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SubjectColorIndicator color={row.color || '#ccc'} />
            <Typography variant="body2" fontSize={13}>
              {value || '-'}
            </Typography>
          </Box>
        ),
      },
      {
        id: 'action',
        label: 'Actions',
        isSort: false,
        isFilter: false,
        minWidth: 60,
        align: 'left',
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
                leaveTypeDialog.onTrue();
              }}
            />
          );
        },
      },
    ],
    [confirm, leaveTypeDialog]
  );
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CustomBreadcrumbs
        heading="Leave Type"
        links={[
          { name: 'HR/Staff', href: '/hr/dashboard/' },
          { name: 'Attendance & Leave Management', href: '' },
          { name: 'Setting' },
          { name: 'Leave Type', href: '' },
        ]}
        description="Define and manage various leave types available to employees, such as sick leave, casual leave, and paid time off."
        action={
          <Button
            sx={{ width: '160px' }}
            startIcon={<Add />}
            variant="contained"
            size="small"
            onClick={leaveTypeDialog.onTrue}
          >
            Leave Type
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
            Are you sure you want to delete <strong>{editData?.leaveType}</strong>?
          </>
        }
        action={
          <LoadingButton
            variant="contained"
            loading={isDeleteLoading}
            color="error"
            size="small"
            onClick={async () => {
              confirmWithUndo({
                item: editData,
                onOptimisticRemove: (dispatchFn, setDeleteIndex) =>
                  dispatchFn(
                    leaveApi.util.updateQueryData('getLeaveTypes', undefined, (draft: any) => {
                      const index = draft.items?.findIndex((b: any) => b.id === editData?.id);
                      setDeleteIndex(index);
                      if (index !== -1) {
                        draft.items.splice(index, 1);
                      }
                    })
                  ),
                onUndoRestore: (dispatchFn, index) => refetch(),
                onCommit: () => deleteLeavePolicy(editData?.id),
              });
              confirm.onFalse();
              setEditData(null);
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
          onClick={leaveTypeDialog.onTrue}
          variant="contained"
          size="small"
        >
          Leave Policy
        </Button>
      </Box> */}
      <CustomizableTable
        noDataText={
          <>
            No Leave Type Found{' '}
            <Box
              onClick={() => {
                leaveTypeDialog.onTrue();
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
              Leave Type
            </Box>
          </>
        }
        isLoading={isLoading}
        tableId="leave-policy-table"
        columns={columns}
        data={tableData || []}
      />

      <CustomDialog
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            {editData ? 'Update Leave Type' : 'Add Leave Type'}
            <CustomTooltip
              arrow
              placement="right"
              title={
                editData
                  ? 'Update the leave type name and color to modify existing leave settings'
                  : 'Create a new leave type and assign a color to distinguish it from other leaves'
              }
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
        open={leaveTypeDialog.value}
        handleClose={() => {
          leaveTypeDialog.onFalse();
          setEditData(null);
        }}
      >
        <LeaveTypeForm handleClose={handleClose} editData={editData} />
      </CustomDialog>
    </Box>
  );
};
export default LeaveType;

const LeaveTypeForm = ({
  handleClose,
  editData,
}: {
  handleClose: (e: any, isSubmit?: boolean) => void;
  editData: any | null;
}) => {
  const { academicYearId } = useSelector((state: RootState) => state.globalState);

  const [addLeavePolicy, { isLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useCreateLeaveTypeMutation,
  });

  const [updateLeavePolicy, { isLoading: isUpdateLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateLeaveTypeMutation,
  });

  // const { data: roles, isLoading: isRolesLoading } = useQueryAndMutation({
  //   type: 'query',
  //   currentQueryAndMutation: useGetRolesQuery,
  // });

  const formik = useFormik({
    initialValues: {
      name: editData?.name || '',
      description: editData?.description || '',
      color: editData?.color || '',
    },
    validationSchema: Yup.object().shape({
      name: Yup.string()
        .required('Leave Type name is required')
        .min(1, 'Name must be at least 1 character'),
      description: Yup.string(),
      color: Yup.string()
        .required('Color is required')
        .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid color format'),
    }),
    onSubmit: async (values) => {
      try {
        const payload = {
          name: values.name,
          description: values.description || undefined,
          color: values.color,
        };

        if (editData) {
          await updateLeavePolicy({
            leaveTypeId: editData.id,
            body: payload,
          });
          shikshaMitraToast.success({ message: 'Leave Type updated successfully' });
        } else {
          await addLeavePolicy({
            academicYearId: academicYearId?.id,
            body: payload,
          });
          shikshaMitraToast.success({ message: 'Leave Type added successfully' });
        }
        handleClose(null, true);
        formik.resetForm();
      } catch (error) {
        console.error('Failed to save leave type:', error);
        shikshaMitraToast.error({
          message: editData ? 'Failed to update leave type' : 'Failed to add leave type',
        });
      }
    },
  });

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <DialogScrollContent>
        <Grid container spacing={3}>
          <Grid size={12}>
            <ShakingTextField error={formik.touched.name && Boolean(formik.errors.name)}>
              <TextField
                name="name"
                label="Leave Type Name *"
                value={formik.values.name}
                onChange={(e) => {
                  const newValue = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                  formik.setFieldValue('name', capitalize(newValue));
                }}
                size="small"
                fullWidth
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={(formik.touched.name && formik.errors.name) as string}
              />
            </ShakingTextField>
          </Grid>

          {/* <Grid size={12}>
            <ShakingTextField
              error={formik.touched.description && Boolean(formik.errors.description)}
            >
              <TextField
                name="description"
                label="Description"
                value={formik.values.description}
                onChange={formik.handleChange}
                size="small"
                fullWidth
                multiline
                rows={3}
                error={formik.touched.description && Boolean(formik.errors.description)}
                helperText={(formik.touched.description && formik.errors.description) as string}
              />
            </ShakingTextField>
          </Grid> */}

          {/* <Grid item xs={12}>
            <ShakingTextField
              error={formik.touched.leaveTypeShortName && Boolean(formik.errors.leaveTypeShortName)}
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
                  (formik.touched.leaveTypeShortName && formik.errors.leaveTypeShortName) as string
                }
              />
            </ShakingTextField>
          </Grid> */}

          {/* <Grid item xs={12}>
            <ShakingTextField error={formik.touched.leaveDays && Boolean(formik.errors.leaveDays)}>
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
          </Grid> */}

          {/* <Grid item xs={12}>
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
          </Grid> */}

          <Grid size={12}>
            <ShakingTextField error={formik.touched.color && Boolean(formik.errors.color)}>
              <Typography
                variant="subtitle2"
                sx={{ mb: 1 }}
                color={formik.touched.color && formik.errors.color ? 'error.main' : 'text.primary'}
              >
                Leave Type Color *
              </Typography>
              <ColorPickerCircle
                onSelect={(color: string) => formik.setFieldValue('color', color)}
                initialColor={formik.values.color}
              />
              {/* <MuiColorInput
                format="hex"
                value={formik.values.color}
                onChange={(color) => formik.setFieldValue('color', color)}
                fullWidth
                placeholder="Color *"
                label="Color *"
                size="small"
                error={formik.touched.color && Boolean(formik.errors.color)}
                helperText={(formik.touched.color && formik.errors.color) as string}
              /> */}
            </ShakingTextField>
          </Grid>
        </Grid>
      </DialogScrollContent>

      <DialogActions>
        <Button
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
          onClick={handleClose}
          variant="outlined"
          size="small"
          type="button"
        >
          Cancel
        </Button>
        <LoadingButton
          startIcon={
            <Iconify
              icon={editData ? GlobalIcons.edit : GlobalIcons.submit}
              width={editData ? 16 : 20}
              height={editData ? 16 : 20}
            />
          }
          loading={isUpdateLoading || isLoading}
          onClick={(e: any) => formik.handleSubmit(e)}
          variant="contained"
          size="small"
          form="dialog-form"
          type="submit"
        >
          {editData ? 'Update' : 'Submit'}
        </LoadingButton>
      </DialogActions>
    </BackPopUpChecked>
  );
};
