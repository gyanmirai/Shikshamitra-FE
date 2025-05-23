'use client';

import type { RootState } from 'src/redux/store';

import { useFormik } from 'formik';
import React, { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { LoadingButton } from '@mui/lab';
import { Add } from '@mui/icons-material';
import {
  Box,
  Grid,
  Button,
  Tooltip,
  Checkbox,
  TextField,
  Typography,
  DialogActions,
  InputAdornment,
  FormControlLabel,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { TimeUnitType } from 'src/enums/time-units';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { EmployeeAttendanceStatus } from 'src/enums/employee-attendance-status';
import {
  useGetEmployeeCustomAttendanceRuleQuery,
  useAddEmployeeCustomAttendanceRuleMutation,
  useUpdateEmployeeCustomAttendanceRuleMutation,
  useDeleteEmployeeCustomAttendanceRuleMutation,
} from 'src/redux/employee/employeeApi';

import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import { Iconify } from 'src/components/iconify/iconify';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

const AttendanceRule = () => {
  const confirm = useBoolean();
  const dialog = useBoolean(false);
  const [editData, setEditData] = useState<any>(null);
  const [deleteInformation, setDeleteInformation] = useState<any>(null);
  const dispatch = useDispatch();
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);

  const { data, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetEmployeeCustomAttendanceRuleQuery,
  });

  const [deleteRule] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeleteEmployeeCustomAttendanceRuleMutation,
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
      data?.items?.map((item: any) => ({
        ...item,
        typeValue: EmployeeAttendanceStatus[item.type],
        lateThresholdUnitValue: TimeUnitType[item.lateThresholdUnit],
        halfDayThresholdUnitValue: TimeUnitType[item.halfDayThresholdUnit],
        enableNotification: item.enableNotificationForUpperAuthority ? 'Yes' : 'No',
      })) || [],
    [data?.items]
  );
  return (
    <>
      <Box display="flex" justifyContent="flex-end" alignItems="center">
        <Button startIcon={<Add />} variant="contained" onClick={dialog.onTrue} size="small">
          Attendance Rule
        </Button>
      </Box>
      <CustomizableTable
        noDataText={
          <>
            No Attendance Rule Found{' '}
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
              Attendance Rule
            </Box>
          </>
        }
        isLoading={isLoading}
        tableId="attendance-rule"
        columns={[
          { label: 'Name', id: 'name' },
          { label: 'Type', id: 'typeValue' },
          { label: 'Late Threshold', id: 'lateThreshold', minWidth: '150px' },
          { label: 'Late Threshold Unit', id: 'lateThresholdUnitValue', minWidth: '180px' },
          { label: 'Half Day Threshold', id: 'halfDayThreshold', minWidth: '180px' },
          { label: 'Half Day Threshold Unit', id: 'halfDayThresholdUnitValue', minWidth: '210px' },
          {
            label: 'Enable Notification',
            id: 'enableNotification',
            minWidth: '180px',
            isFilter: false,

            isSort: false,
          },
          {
            label: 'Actions',
            id: 'action',
            isFilter: false,
            sticky: true,
            isSort: false,
            render(value, row) {
              return (
                <ThreeDotsActions
                  placement="right-top"
                  showDeleteIcon
                  showEditIcon
                  handleDeleteClick={() => {
                    confirm.onTrue();
                    setDeleteInformation(row);
                  }}
                  handleEditClick={() => {
                    setEditData(row);
                    dialog.onTrue();
                  }}
                  showThreeDots={false}
                />
              );
            },
          },
        ]}
        data={tableData}
      />

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content="Are you sure you want to delete?"
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              deleteRule(deleteInformation?.id);
              confirm.onFalse();
            }}
          >
            Yes
          </Button>
        }
      />

      <CustomDialog
        title={
          <Box display="flex" flexDirection="row" gap={2} alignItems="center">
            <Typography variant="h5">Add Rule</Typography>
            <Tooltip
              arrow
              placement="right"
              title="Define the criteria for half-day and late attendance by creating rules here. "
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
        <AttendanceRuleForm handleClose={handleClose} editData={editData} />
      </CustomDialog>
    </>
  );
};

export default AttendanceRule;

interface AttendanceRuleFormProps {
  handleClose: (e: any, isSubmit?: boolean) => void;
  editData: any;
}

const AttendanceRuleForm = ({ handleClose, editData }: AttendanceRuleFormProps) => {
  const [addRule, { isLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddEmployeeCustomAttendanceRuleMutation,
  });

  const [updateRule] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateEmployeeCustomAttendanceRuleMutation,
  });
  const formik = useFormik({
    initialValues: {
      name: editData?.name || '',
      type: editData?.type === undefined ? '' : editData?.type,
      lateThreshold: editData?.lateThreshold || '',
      lateThresholdUnit: editData?.lateThresholdUnit || TimeUnitType.Minutes,
      halfDayThreshold: editData?.halfDayThreshold || '',
      halfDayThresholdUnit: editData?.halfDayThresholdUnit || TimeUnitType.Minutes,
      enableNotification: editData?.enableNotificationForUpperAuthority || false,
    },
    onSubmit: async (values) => {
      try {
        if (editData) {
          await updateRule({
            id: editData.id,
            body: {
              name: values.name,
              type: values.type,
              lateThreshold: values.lateThreshold,
              lateThresholdUnit: values.lateThresholdUnit,
              halfDayThreshold: values.halfDayThreshold,
              halfDayThresholdUnit: values.halfDayThresholdUnit,
              enableNotificationForUpperAuthority: values.enableNotification,
            },
          });
        } else {
          await addRule({
            name: values.name,
            type: values.type,
            lateThreshold: values.lateThreshold,
            lateThresholdUnit: values.lateThresholdUnit,
            halfDayThreshold: values.halfDayThreshold,
            halfDayThresholdUnit: values.halfDayThresholdUnit,
            enableNotificationForUpperAuthority: values.enableNotification,
          });
        }
        handleClose(null, true);
      } catch (error) {
        console.log(error);
      }
    },
  });
  return (
    <Box>
      <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
        <form onSubmit={formik.handleSubmit}>
          <Scrollbar
            sx={{
              p: 3,
              bgcolor: 'background.neutral',
            }}
          >
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  name="name"
                  label="Rule Name"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  size="small"
                  fullWidth
                />
              </Grid>
              <Grid item xs={12}>
                <CustomSelect
                  options={[
                    { id: EmployeeAttendanceStatus.HalfDayLeave, name: 'Half-day' },
                    { id: EmployeeAttendanceStatus.Late, name: 'Late' },
                  ]}
                  label="Attendance Type"
                  labelKey="name"
                  valueKey="id"
                  value={formik.values.type}
                  fullWidth
                  formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
                  onChange={(val) => formik.setFieldValue('type', val)}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Late Threshold"
                  name="lateThreshold"
                  value={formik.values.lateThreshold}
                  onChange={formik.handleChange}
                  size="small"
                  fullWidth
                  sx={{ '& .MuiOutlinedInput-root': { paddingRight: 0 } }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <CustomSelect
                          options={[
                            { id: TimeUnitType.Minutes, name: 'Min' },
                            { id: TimeUnitType.Hours, name: 'Hrs' },
                          ]}
                          label=""
                          labelKey="name"
                          valueKey="id"
                          value={formik.values.lateThresholdUnit}
                          fullWidth
                          formControlProps={{ fullWidth: true }}
                          onChange={(val) => formik.setFieldValue('lateThresholdUnit', val)}
                        />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Half Threshold"
                  name="halfDayThreshold"
                  value={formik.values.halfDayThreshold}
                  onChange={formik.handleChange}
                  size="small"
                  fullWidth
                  sx={{ '& .MuiOutlinedInput-root': { paddingRight: 0 } }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <CustomSelect
                          options={[
                            { id: TimeUnitType.Minutes, name: 'Min' },
                            { id: TimeUnitType.Hours, name: 'Hrs' },
                          ]}
                          label=""
                          labelKey="name"
                          valueKey="id"
                          value={formik.values.halfDayThresholdUnit}
                          fullWidth
                          formControlProps={{ fullWidth: true }}
                          onChange={(val) => formik.setFieldValue('halfDayThresholdUnit', val)}
                        />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formik.values.enableNotification}
                      onChange={formik.handleChange}
                      name="enableNotification"
                    />
                  }
                  label="Enable notification for Upper Authority if the rule is violated to Send notification to relevant authority when rule is violated."
                />
              </Grid>
            </Grid>
          </Scrollbar>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>

            <LoadingButton loading={isLoading} type="submit" variant="contained">
              Submit
            </LoadingButton>
          </DialogActions>
        </form>
      </BackPopUpChecked>
    </Box>
  );
};
