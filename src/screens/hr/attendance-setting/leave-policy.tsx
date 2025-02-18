import { useFormik } from 'formik';
import { MuiColorInput } from 'mui-color-input';
import React, { useMemo, useState } from 'react';

import { LoadingButton } from '@mui/lab';
import { Add } from '@mui/icons-material';
import {
  Box,
  Grid,
  Radio,
  Button,
  Switch,
  TextField,
  RadioGroup,
  Typography,
  DialogActions,
  FormControlLabel,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import useQueryAndMutation from 'src/redux/customQueryAndMutation';
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
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

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

const LeavePolicy = () => {
  const dialog = useBoolean(false);
  const confirm = useBoolean(false);
  const [editData, setEditData] = useState<any>(null);
  console.log('🚀 ~ file: leave-policy.tsx:55 ~ LeavePolicy ~ editData:', editData);

  const { data: leavePolicyData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetEmployeeLeavePolicyQuery,
  });

  const [deleteLeavePolicy, { isLoading: isDeleteLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeleteEmployeeLeavePolicyMutation,
  });

  const handleClose = () => {
    setEditData(null);
    dialog.onFalse();
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
        content="Are you sure want to delete?"
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
            Delete
          </LoadingButton>
        }
      />
      <Box display="flex" justifyContent="flex-end" alignItems="center">
        <Button startIcon={<Add />} onClick={dialog.onTrue} variant="contained">
          Leave Policy
        </Button>
      </Box>
      <CustomizableTable
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
            label: 'Action',
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
            id: '1',
            leaveType: 'Annual Leave',
            leaveDays: '20',
            isCarryForward: 'Yes',
            accrualRateString: 'Monthly',
            color: '#FF5733',
            carryForward: true,
            accrualRate: 0,
          },
          {
            id: '2',
            leaveType: 'Sick Leave',
            leaveDays: '10',
            isCarryForward: 'No',
            accrualRateString: 'Yearly',
            color: '#33FF57',
            carryForward: false,
            accrualRate: 1,
          },
          {
            id: '3',
            leaveType: 'Maternity Leave',
            leaveDays: '90',
            isCarryForward: 'No',
            accrualRateString: 'Yearly',
            color: '#3357FF',
            carryForward: false,
            accrualRate: 1,
          },
        ]}
      />

      <CustomDialog
        maxWidth="md"
        title="Leave Policy"
        open={dialog.value}
        handleClose={handleClose}
      >
        <LeavePolicyForm handleClose={handleClose} editData={editData} />
      </CustomDialog>
    </Box>
  );
};
export default LeavePolicy;

const LeavePolicyForm = ({ handleClose, editData }: any) => {
  const [tableData, setTableData] = useState([
    {
      id: 1,
      leaveDurationUpto: '',
      priorDaysRequired: '',
      maximumAdvanceDaysLimit: '',
    },
    {
      id: 2,
      leaveDurationUpto: '',
      priorDaysRequired: '',
      maximumAdvanceDaysLimit: '',
    },
  ]);

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
  const formik = useFormik({
    initialValues: {
      leaveType: editData?.leaveType || '',
      leaveDays: editData?.leaveDays || 0,
      carryForward: editData?.carryForward || false,
      accrualRate: editData?.accrualRate ?? AccurateRateType.Monthly,
      color: editData?.color || 'white',
    },
    onSubmit: async (values) => {
      try {
        if (editData) {
          await updateLeavePolicy({
            id: editData.id,
            body: {
              leaveType: values.leaveType,
              leaveDays: values.leaveDays,
              carryForward: values.carryForward,
              accrualRate: values.accrualRate,
              color: values.color,
            },
          });
        } else {
          await addLeavePolicy({
            leaveType: values.leaveType,
            leaveDays: values.leaveDays,
            carryForward: values.carryForward,
            accrualRate: values.accrualRate,
            color: values.color,
          });
        }
        handleClose();
        formik.resetForm();
      } catch (error) {
        console.log(error);
      }
    },
  });

  // const handleInputChange = (e: any, id: any, field: any) => {
  //   setData((prevData) =>
  //     prevData.map((row) => (row.id === id ? { ...row, [field]: e.target.value } : row))
  //   );
  // };

  // const handleDeleteRow = (id: any) => {
  //   setData((prevData) => prevData.filter((row) => row.id !== id));
  // };

  const handleInputChange = (e: any, rowId: any, field: any) => {
    const { value } = e.target;
    setTableData((prevData) =>
      prevData.map((row) => (row.id === rowId ? { ...row, [field]: value } : row))
    );
  };

  const handleAddRow = () => {
    const newId = Math.max(...tableData.map((row) => row.id)) + 1;
    setTableData([
      ...tableData,
      {
        id: newId,
        leaveDurationUpto: '',
        priorDaysRequired: '',
        maximumAdvanceDaysLimit: '',
      },
    ]);
  };

  const handleDeleteRow = (id: any) => {
    setTableData((prevData) => prevData.filter((row) => row.id !== id));
  };

  return (
    <form onSubmit={formik.handleSubmit}>
      <Scrollbar
        sx={{
          p: 3,
          bgcolor: 'background.neutral',
        }}
      >
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              name="leaveType"
              label="Leave Type Name"
              value={formik.values.leaveType}
              onChange={formik.handleChange}
              size="small"
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              name="leaveDays"
              label="LeaveDays"
              value={formik.values.leaveDays}
              onChange={formik.handleChange}
              size="small"
              type="number"
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <CustomSelect
              options={AccurateRateTypeArray}
              label="Accrual Rate"
              fullWidth
              formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
              value={formik.values.accrualRate}
              onChange={(val) => formik.setFieldValue('accrualRate', val)}
            />
          </Grid>
          <Grid item xs={12} md={6}>
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
          <Grid item xs={12} md={6}>
            <MuiColorInput
              format="hex"
              value={formik.values.color}
              onChange={(color) => formik.setFieldValue('color', color)}
              fullWidth
              placeholder="color"
              label="Color"
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom>
              Is Negative Balance Allowed
            </Typography>
            <RadioGroup
              row
              // value={rubricType}
              // onChange={(e) => setRubricType(e.target.value as 'predefined' | 'custom')}
            >
              <FormControlLabel value="Yes" control={<Radio />} label="Yes" />
              <FormControlLabel value="No" control={<Radio />} label="No" />
            </RadioGroup>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom>
              Is Half Day Leave Allowed
            </Typography>
            <RadioGroup
              row
              // value={rubricType}
              // onChange={(e) => setRubricType(e.target.value as 'predefined' | 'custom')}
            >
              <FormControlLabel value="Yes" control={<Radio />} label="Yes" />
              <FormControlLabel value="No" control={<Radio />} label="No" />
            </RadioGroup>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom>
              Is Leave Cancellation Allowed
            </Typography>
            <RadioGroup
              row
              // value={rubricType}
              // onChange={(e) => setRubricType(e.target.value as 'predefined' | 'custom')}
            >
              <FormControlLabel value="Yes" control={<Radio />} label="Yes" />
              <FormControlLabel value="No" control={<Radio />} label="No" />
            </RadioGroup>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom>
              Is This Leave Encashable
            </Typography>
            <RadioGroup
              row
              // value={rubricType}
              // onChange={(e) => setRubricType(e.target.value as 'predefined' | 'custom')}
            >
              <FormControlLabel value="Yes" control={<Radio />} label="Yes" />
              <FormControlLabel value="No" control={<Radio />} label="No" />
            </RadioGroup>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom>
              Do You Want to Consider the Week off as Leave if it is adjoining a Leave
            </Typography>
            <RadioGroup
              row
              // value={rubricType}
              // onChange={(e) => setRubricType(e.target.value as 'predefined' | 'custom')}
            >
              <FormControlLabel value="Yes" control={<Radio />} label="Yes" />
              <FormControlLabel value="No" control={<Radio />} label="No" />
            </RadioGroup>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              Do You Want to Consider the Holiday as Leave if it is adjoining a Leave
            </Typography>
            <RadioGroup
              row
              // value={rubricType}
              // onChange={(e) => setRubricType(e.target.value as 'predefined' | 'custom')}
            >
              <FormControlLabel value="Yes" control={<Radio />} label="Yes" />
              <FormControlLabel value="No" control={<Radio />} label="No" />
            </RadioGroup>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle2">Credit Rule</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <CustomSelect
              label="When Do You Want this Leave to be Credited"
              value=""
              onChange={(val) => {}}
              options={[
                { value: 'monthly', label: 'Monthly' },
                { value: 'quarterly', label: 'Quarterly' },
                { value: 'half-yearly', label: 'Half-Yearly' },
                { value: 'yearly', label: 'Yearly' },
              ]}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Leave Credit Card"
              name=""
              value=""
              onChange={() => {}}
              size="small"
              fullWidth
            />
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle2">Leave Request Criteria</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              Is This Leave Type Allowed to be Applied only in Advance
            </Typography>
            <RadioGroup
              row
              // value={rubricType}
              // onChange={(e) => setRubricType(e.target.value as 'predefined' | 'custom')}
            >
              <FormControlLabel value="Yes" control={<Radio />} label="Yes" />
              <FormControlLabel value="No" control={<Radio />} label="No" />
            </RadioGroup>
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyItem: 'flex-end' }}>
              <Button
                variant="contained"
                onClick={handleAddRow}
                size="small"
                startIcon={<Add />}
                className="mb-4"
              >
                Row
              </Button>
            </Box>

            <CustomizableTable
              isFilter={false}
              isPagination={false}
              isShowedDense={false}
              isSearch={false}
              tableId="leave-form-table"
              columns={[
                {
                  id: 'leaveDurationUpto',
                  label: 'Leave Duration Upto',
                  minWidth: '195px',
                  align: 'left',
                  render: (value, row) => (
                    <TextField
                      size="small"
                      label="Enter Leave Duration"
                      value={row.leaveDurationUpto}
                      onChange={(e) => handleInputChange(e, row.id, 'leaveDurationUpto')}
                      sx={{ width: '100%' }}
                    />
                  ),
                },
                {
                  id: 'priorDaysRequired',
                  label: 'Prior Days Required',
                  minWidth: '195px',
                  align: 'left',
                  render: (value, row) => (
                    <TextField
                      label="Enter Prior Days Required"
                      name={`priorDaysRequired-${row.id}`}
                      value={row.priorDaysRequired}
                      onChange={(e) => handleInputChange(e, row.id, 'priorDaysRequired')}
                      size="small"
                      fullWidth
                    />
                  ),
                },
                {
                  id: 'maximumAdvanceDaysLimit',
                  label: 'Maximum Advance Days Limit',
                  minWidth: '265px',
                  align: 'left',
                  render: (value, row) => (
                    <TextField
                      label="Enter Maximum Advance Days Limit"
                      name={`maximumAdvanceDaysLimit-${row.id}`}
                      value={row.maximumAdvanceDaysLimit}
                      onChange={(e) => handleInputChange(e, row.id, 'maximumAdvanceDaysLimit')}
                      size="small"
                      fullWidth
                    />
                  ),
                },
                {
                  id: 'actions',
                  label: 'Actions',
                  isSort: false,
                  render: (value, row) => (
                    <ThreeDotsActions
                      showThreeDots={false}
                      showDeleteIcon
                      handleDeleteClick={() => handleDeleteRow(row.id)}
                      placement="right-top"
                    />
                  ),
                },
              ]}
              data={tableData}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom>
              Is Back Dated Leave Request Allowed?
            </Typography>
            <RadioGroup
              row
              // value={rubricType}
              // onChange={(e) => setRubricType(e.target.value as 'predefined' | 'custom')}
            >
              <FormControlLabel value="Yes" control={<Radio />} label="Yes" />
              <FormControlLabel value="No" control={<Radio />} label="No" />
            </RadioGroup>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField label="30" name="" value="" onChange={() => {}} size="small" fullWidth />
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom>
              Is Document Required for this Leave
            </Typography>
            <RadioGroup
              row
              // value={rubricType}
              // onChange={(e) => setRubricType(e.target.value as 'predefined' | 'custom')}
            >
              <FormControlLabel value="Yes" control={<Radio />} label="Yes" />
              <FormControlLabel value="No" control={<Radio />} label="No" />
            </RadioGroup>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle2">Leave Request Limits</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom>
              Maximum No. of Requests employee can apply in tenure
            </Typography>
            <RadioGroup
              row
              // value={rubricType}
              // onChange={(e) => setRubricType(e.target.value as 'predefined' | 'custom')}
            >
              <FormControlLabel value="No Limit" control={<Radio />} label="No Limit" />
              <FormControlLabel value="Set Limit" control={<Radio />} label="Set Limit" />
            </RadioGroup>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom>
              Maximum No. of Requests employee can apply in Year
            </Typography>
            <RadioGroup
              row
              // value={rubricType}
              // onChange={(e) => setRubricType(e.target.value as 'predefined' | 'custom')}
            >
              <FormControlLabel value="No Limit" control={<Radio />} label="No Limit" />
              <FormControlLabel value="Set Limit" control={<Radio />} label="Set Limit" />
            </RadioGroup>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField label="05" name="" value="" onChange={() => {}} size="small" fullWidth />
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom>
              Maximum No. of Requests employee can apply in Month
            </Typography>
            <RadioGroup
              row
              // value={rubricType}
              // onChange={(e) => setRubricType(e.target.value as 'predefined' | 'custom')}
            >
              <FormControlLabel value="No Limit" control={<Radio />} label="No Limit" />
              <FormControlLabel value="Set Limit" control={<Radio />} label="Set Limit" />
            </RadioGroup>
          </Grid>
        </Grid>
      </Scrollbar>
      <DialogActions>
        <Button onClick={handleClose} variant="outlined">
          Cancel
        </Button>
        <LoadingButton loading={isUpdateLoading || isLoading} type="submit" variant="contained">
          Save
        </LoadingButton>
      </DialogActions>
    </form>
  );
};
