import { useFormik } from 'formik';
import { MuiColorInput } from 'mui-color-input';
import React, { useState, useCallback } from 'react';

import { Add } from '@mui/icons-material';
import {
  Box,
  Grid,
  Button,
  Switch,
  MenuItem,
  MenuList,
  TextField,
  DialogActions,
  FormControlLabel,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

const LeavePolicy = () => {
  const dialog = useBoolean(false);
  const [editData, setEditData] = useState<any>(null);
  const actions = useCallback(
    ({ popover }: any, row: any) => (
      <MenuList>
        <MenuItem
          onClick={() => {
            // confirm.onTrue();
            popover.onClose();
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
    [dialog]
  );
  const handleClose = () => {
    setEditData(null);
    dialog.onFalse();
  };
  return (
    <Box>
      <Box display="flex" justifyContent="flex-end" alignItems="center">
        <Button startIcon={<Add />} onClick={dialog.onTrue} variant="contained">
          Create Leave Policy
        </Button>
      </Box>
      <CustomizableTable
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
            id: 'carryForward',
            label: 'Carry Forward',
            render(value, row) {
              return value ? 'Yes' : 'No';
            },
          },
          {
            id: 'accrualRate',
            label: 'Accrual Rate',
          },
          {
            id: 'color',
            label: 'Color',
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
              return <ThreeDotsActions actions={(props) => actions(props, row)} />;
            },
          },
        ]}
        data={[
          {
            leaveType: 'Annual Leave',
            leaveDays: 20,
            carryForward: true,
            accrualRate: 'monthly',
            color: '#4CAF50',
          },
          {
            leaveType: 'Sick Leave',
            leaveDays: 10,
            carryForward: false,
            accrualRate: 'quarterly',
            color: '#F44336',
          },
          {
            leaveType: 'Maternity Leave',
            leaveDays: 90,
            carryForward: false,
            accrualRate: 'monthly',
            color: '#E91E63',
          },
          {
            leaveType: 'Casual Leave',
            leaveDays: 5,
            carryForward: true,
            accrualRate: 'quarterly',
            color: '#FF9800',
          },
        ]}
      />

      <CustomDialog title="Leave Policy" open={dialog.value} handleClose={handleClose}>
        <LeavePolicyForm handleClose={handleClose} editData={editData} />
      </CustomDialog>
    </Box>
  );
};

export default LeavePolicy;

const LeavePolicyForm = ({ handleClose, editData }: any) => {
  const formik = useFormik({
    initialValues: {
      leaveType: editData?.leaveType || '',
      leaveDays: editData?.leaveDays || '',
      carryForward: editData?.carryForward || false,
      accrualRate: editData?.accrualRate || 'monthly',
      color: editData?.color || 'white',
    },
    onSubmit: () => {},
  });

  return (
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
              name="leaveType"
              label="Leave Type Name"
              value={formik.values.leaveType}
              onChange={formik.handleChange}
              size="small"
              fullWidth
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              name="leaveDays"
              label="LeaveDays"
              value={formik.values.leaveDays}
              onChange={formik.handleChange}
              size="small"
              fullWidth
            />
          </Grid>
          <Grid item xs={12}>
            <CustomSelect
              options={[
                { id: 'monthly', name: 'monthly' },
                { id: 'quarterly', name: 'Quarterly' },
              ]}
              label="Accrual Rate"
              labelKey="name"
              valueKey="id"
              fullWidth
              formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
              value={formik.values.accrualRate}
              onChange={(val) => formik.setFieldValue('accrualRate', val)}
            />
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
          <Grid item xs={12}>
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
        </Grid>
      </Scrollbar>
      <DialogActions>
        <Button onClick={handleClose} variant="outlined">
          Cancel
        </Button>
        <Button onClick={handleClose} variant="contained">
          Save
        </Button>
      </DialogActions>
    </form>
  );
};
