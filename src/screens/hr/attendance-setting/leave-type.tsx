import type { RootState } from 'src/redux/store';
import type { UseBooleanReturn } from 'src/hooks/use-boolean';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { capitalize } from 'lodash';
import React, { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { LoadingButton } from '@mui/lab';
import { Box, Grid, Button, TextField, Typography, DialogActions } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { GlobalIcons } from 'src/utils/icons';

import { useGetRolesQuery } from 'src/redux/role/roleApi';
import { AccurateRateType } from 'src/enums/accurate-rate';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import {
  useGetEmployeeLeavePolicyQuery,
  useAddEmployeeLeavePolicyMutation,
  useUpdateEmployeeLeavePolicyMutation,
  useDeleteEmployeeLeavePolicyMutation,
} from 'src/redux/employee/employeeApi';

import { Iconify } from 'src/components/iconify/iconify';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import ShakingTextField from 'src/components/shaking-text-field';
import CustomizableTable from 'src/components/customizabaleTable';
import ColorPickerCircle from 'src/components/static-color/colorPickerCircle';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { SubjectColorIndicator } from 'src/components/subject-color/SubejctColor';

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

const LeaveType = ({ leaveTypeDialog: dialog }: { leaveTypeDialog: UseBooleanReturn }) => {
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
      }, 200); // Delay matches your dialog close animation
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
            No Leave Type Found{' '}
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
              Leave Type
            </Box>
          </>
        }
        isLoading={isLoading}
        tableId="leave-policy-table"
        columns={[
          {
            id: 'leaveType',
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
          //  {
          //   id: 'leaveTypeShortName',
          //   label: 'Leave Type Short Name',
          // },
          // {
          //   id: 'leaveDays',
          //   label: 'Leave Days',
          //   filterType: 'number',
          // },
          // {
          //   id: 'isCarryForward',
          //   label: 'Carry Forward',
          // },
          // {
          //   id: 'accrualRateString',
          //   label: 'Accrual Rate',
          // },
          // {
          //   id: 'color',
          //   label: 'Color',
          //   isSort: false,
          //   isFilter: false,

          //   render(value, row) {
          //     return (
          //       <Box
          //         sx={{
          //           width: 20,
          //           height: 20,
          //           borderRadius: '50%',
          //           backgroundColor: value,
          //         }}
          //       />
          //     );
          //   },
          // },
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
            {editData ? 'Update Leave Type' : 'Add Leave Type'}
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
          }, 200); // Adjust the delay based on your dialog transition duration
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
  const [addLeavePolicy, { isLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddEmployeeLeavePolicyMutation,
    popupConfig: {
      successMessage: 'Leave Type created successfully',
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
      color: editData?.color || '',
      roles: editData?.roles || [],
      fieldType: editData?.fieldType || 'paid',
    },
    validationSchema: Yup.object().shape({
      leaveType: Yup.string().required('Leave Type is required'),
      color: Yup.string().required('Color is required'),
      // leaveTypeShortName: Yup.string().required('Leave type short name is required'),
      // leaveDays: Yup.number()
      //   .required('Leave days is required')
      //   .min(1, 'Leave days must be greater than 0'),
      // color: Yup.string().required('Color is required'),
      //   roles: Yup.array().min(1, 'At least one role must be selected'),
      //   fieldType: Yup.string().required('Field type is required'),
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
              //   roles: values.roles,
              //   fieldType: values.fieldType,
            },
          });
          shikshaMitraToast.success({ message: 'Leave Type updated successfully' });
        } else {
          await addLeavePolicy({
            leaveType: values.leaveType,
            leaveTypeShortName: values.leaveTypeShortName,
            leaveDays: values.leaveDays,
            carryForward: values.carryForward,
            accrualRate: values.accrualRate,
            color: values.color,
            // roles: values.roles,
            // fieldType: values.fieldType,
          });
          shikshaMitraToast.success({ message: 'Leave Type added successfully' });
        }
        handleClose(null, true);
        formik.resetForm();
      } catch (error) {
        console.log(error);
      }
    },
  });

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <DialogScrollContent>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <ShakingTextField error={formik.touched.leaveType && Boolean(formik.errors.leaveType)}>
              <TextField
                name="leaveType"
                label="Leave Type *"
                value={formik.values.leaveType}
                onChange={(e) => {
                  formik.setFieldValue('leaveType', capitalize(e.target.value));
                }}
                size="small"
                fullWidth
                error={formik.touched.leaveType && Boolean(formik.errors.leaveType)}
                helperText={(formik.touched.leaveType && formik.errors.leaveType) as string}
              />
            </ShakingTextField>
          </Grid>

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

          <Grid item xs={12}>
            <ShakingTextField error={formik.touched.color && Boolean(formik.errors.color)}>
              <Typography
                variant="subtitle2"
                sx={{ mb: 1 }}
                color={formik.touched.color && formik.errors.color ? 'error.main' : 'text.primary'}
              >
                Leave Type Color
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

      <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
        <Button
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
          onClick={handleClose}
          variant="outlined"
          size="small"
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
        >
          {editData ? 'Update' : 'Submit'}
        </LoadingButton>
      </DialogActions>
    </BackPopUpChecked>
  );
};
