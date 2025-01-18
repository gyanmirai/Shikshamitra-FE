import { useFormik } from 'formik';
import React, { useMemo, useState, useCallback } from 'react';

import { LoadingButton } from '@mui/lab';
import { Add } from '@mui/icons-material';
import {
  Box,
  Grid,
  Button,
  MenuItem,
  MenuList,
  Checkbox,
  TextField,
  DialogActions,
  InputAdornment,
  FormControlLabel,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { TimeUnitType } from 'src/enums/time-units';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { EmployeeAttendanceStatus } from 'src/enums/employee-attendance-status';
import {
  useGetStudentAttendanceRuleQuery,
  useAddStudentAttendanceRuleMutation,
  useDeleteStudentAttendanceRuleMutation,
  useUpdateStudentAttendanceRuleMutation,
} from 'src/redux/student/attendance-rule/attendance-rule-api';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

const AttendanceRule = () => {
  const confirm = useBoolean();
  const dialog = useBoolean(false);
  const [editData, setEditData] = useState<any>(null);
  const [deleteInformation, setDeleteInformation] = useState<any>(null);
  const actions = useCallback(
    ({ popover }: any, row: any) => (
      <MenuList>
        <MenuItem
          onClick={() => {
            confirm.onTrue();
            popover.onClose();
            setDeleteInformation(row);
          }}
          sx={{ color: 'error.main' }}
        >
          <Iconify icon="solar:trash-bin-trash-bold" sx={{ height: '16px', width: '16px' }} />
          Delete
        </MenuItem>

        <MenuItem
          onClick={() => {
            setEditData(row);
            dialog.onTrue();
            popover.onClose();
          }}
        >
          <Iconify icon="solar:pen-bold" sx={{ height: '16px', width: '16px' }} />
          Edit
        </MenuItem>
      </MenuList>
    ),
    [confirm, dialog]
  );
  const { data, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetStudentAttendanceRuleQuery,
  });

  const [deleteRule, { isLoading: isDeleteLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeleteStudentAttendanceRuleMutation,
  });
  const handleClose = () => {
    setEditData(null);
    dialog.onFalse();
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
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button startIcon={<Add />} size="small" variant="contained" onClick={dialog.onTrue}>
          Add Rule
        </Button>
      </Box>

      <CustomizableTable
        tableId="attendance-rule-table"
        isLoading={isLoading}
        columns={[
          { label: 'Name', id: 'name' },
          { label: 'Type', id: 'typeValue' },
          { label: 'Late Threshold', id: 'lateThreshold', minWidth: 140 },
          { label: 'Late Threshold Unit', id: 'lateThresholdUnitValue', minWidth: '180px' },
          { label: 'Half Day Threshold', id: 'halfDayThreshold', minWidth: '200px', align: 'left' },
          {
            label: 'Half Day Threshold Unit',
            id: 'halfDayThresholdUnitValue',
            minWidth: '200px',
          },
          {
            label: 'Enable Notification',
            id: 'enableNotification',
            minWidth: '200px',
            align: 'left',
          },
          {
            label: 'Actions',
            id: 'action',
            isSort: false,
            render(value, row) {
              return (
                <ThreeDotsActions
                  placement="right-top"
                  // actions={(props) => actions(props, row)}
                  showThreeDots={false}
                  showEditIcon
                  showDeleteIcon
                  handleEditClick={() => {
                    setEditData(row);
                    dialog.onTrue();
                  }}
                  handleDeleteClick={() => {
                    confirm.onTrue();
                    setDeleteInformation(row);
                  }}
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
        content="Are you sure want to delete?"
        action={
          <LoadingButton
            loading={isDeleteLoading}
            variant="contained"
            color="error"
            onClick={() => {
              deleteRule(deleteInformation?.id);
              confirm.onFalse();
            }}
          >
            Delete
          </LoadingButton>
        }
      />

      <CustomDialog title="Add Rule" open={dialog.value} handleClose={handleClose}>
        <AttendanceRuleForm handleClose={handleClose} editData={editData} />
      </CustomDialog>
    </>
  );
};

export default AttendanceRule;

interface AttendanceRuleFormProps {
  handleClose: () => void;
  editData: any;
}

const AttendanceRuleForm = ({ handleClose, editData }: AttendanceRuleFormProps) => {
  const [addRule, { isLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddStudentAttendanceRuleMutation,
  });

  const [updateRule, { isLoading: isUpdateLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateStudentAttendanceRuleMutation,
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
        handleClose();
      } catch (error) {
        console.log(error);
      }
    },
  });
  return (
    <Box>
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
                onChange={(val) => formik.setFieldValue('type', val as string)}
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
                        onChange={(val) => formik.setFieldValue('lateThresholdUnit', val as string)}
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
                        onChange={(val) =>
                          formik.setFieldValue('halfDayThresholdUnit', val as string)
                        }
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
                label="Enable notification for Upper Authority if the rule is violated."
              />
            </Grid>
          </Grid>
        </Scrollbar>
        <DialogActions>
          <LoadingButton loading={isLoading || isUpdateLoading} type="submit" variant="contained">
            Submit
          </LoadingButton>
        </DialogActions>
      </form>
    </Box>
  );
};
