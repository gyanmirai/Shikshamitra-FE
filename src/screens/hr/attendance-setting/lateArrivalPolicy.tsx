'use client';

import React, { useCallback } from 'react';

import { LoadingButton } from '@mui/lab';
import { Add } from '@mui/icons-material';
import { TimePicker } from '@mui/x-date-pickers';
import { Box, Grid, Button, MenuList, MenuItem, TextField, DialogActions } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

const LateArrivalPolicy = () => {
  const leaveRuleDialog = useBoolean();
  const assignEmployeeDialog = useBoolean();

  const actions = useCallback(
    ({ popover: pop, row }: any) => (
      <MenuList>
        <MenuItem
          onClick={() => {
            assignEmployeeDialog.onTrue();
            pop.onClose();
          }}
        >
          {' '}
          <Iconify icon="mdi:arrow-right-bold" />
          Assign Employee
        </MenuItem>
      </MenuList>
    ),
    [assignEmployeeDialog]
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          startIcon={<Add />}
          size="small"
          onClick={() => {
            leaveRuleDialog.onTrue();
          }}
        >
          Leave Rule
        </Button>
      </Box>
      <CustomizableTable
        tableId="late-arrival-policy-table"
        columns={[
          { id: 'policyName', label: 'Policy Name' },
          { id: 'gracePeriod', label: 'Grace Period' },
          { id: 'thresHold', label: 'ThresHold(Day)' },
          { id: 'penaltyAmount', label: 'Penalty Amount' },
          {
            id: 'actions',
            label: 'Actions',
            render(value: any, row: any) {
              return (
                <ThreeDotsActions
                  actions={(prop) => actions({ ...prop, row })}
                  placement="right-top"
                />
              );
            },
          },
        ]}
        data={[
          {
            id: 1,
            policyName: 'Standard Late Policy',
            gracePeriod: '10 minutes',
            thresHold: '3 Days',
            penaltyAmount: '$5',
          },
          {
            id: 2,
            policyName: 'Strict Late Policy',
            gracePeriod: '5 minutes',
            thresHold: '2 Days',
            penaltyAmount: '$10',
          },
          {
            id: 3,
            policyName: 'Flexible Late Policy',
            gracePeriod: '15 minutes',
            thresHold: '5 Days',
            penaltyAmount: '$2',
          },
          {
            id: 4,
            policyName: 'Zero Tolerance Policy',
            gracePeriod: '0 minutes',
            thresHold: '1 Day',
            penaltyAmount: '$20',
          },
        ]}
      />
      <CustomDialog
        open={leaveRuleDialog.value}
        handleClose={leaveRuleDialog.onFalse}
        title="Update Progress"
      >
        <LateArrivalPolicyForm />
      </CustomDialog>

      <CustomDialog
        open={assignEmployeeDialog.value}
        handleClose={assignEmployeeDialog.onFalse}
        title="Assign Employees"
      >
        <AssignEmployeeForm />
      </CustomDialog>
    </Box>
  );
};

export default LateArrivalPolicy;

const LateArrivalPolicyForm = () => (
  <Box display="flex" flexDirection="column" gap={2}>
    <form onSubmit={() => {}}>
      <Scrollbar sx={{ p: 2, height: '200px' }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField size="small" name="policyName" onChange={() => {}} label="Policy Name" />
          </Grid>
          <Grid item xs={12} md={6}>
            <TimePicker
              label="Grace Period (Min)"
              name="gracePeriod"
              slotProps={{ textField: { size: 'small' } }}
              sx={{ minWidth: '180px', width: '100%' }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              name="lateArrivalThreshold"
              size="small"
              onChange={() => {}}
              label="Late Arrival Threshold(Days)"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              name="penaltyAmount"
              onChange={() => {}}
              label="Penalty Amount"
              size="small"
            />
          </Grid>
        </Grid>
      </Scrollbar>
      <DialogActions>
        <Button variant="outlined" size="small" onClick={() => {}}>
          Cancel
        </Button>
        <LoadingButton
          // loading={isLoading || isUpdateLoading}
          type="submit"
          variant="contained"
          size="small"
        >
          Save
        </LoadingButton>
      </DialogActions>
    </form>
  </Box>
);

const AssignEmployeeForm = () => (
  <Box display="flex" flexDirection="column" gap={2}>
    <form onSubmit={() => {}}>
      <Scrollbar sx={{ p: 2, height: '150px' }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <CustomSelect
              label="Organizations"
              name="organizations"
              value=""
              options={[
                { value: 'pre-primary', label: 'Pre-Primary' },
                { value: 'primary', label: 'Primary' },
                { value: 'secondary', label: 'Secondary' },
              ]}
              onChange={() => {}}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomSelect
              label="Employees"
              name="employees"
              value=""
              options={[
                { value: 'abc', label: 'ABC' },
                { value: 'xyz', label: 'XYZ' },
                { value: 'pqr', label: 'PQR' },
              ]}
              onChange={() => {}}
            />
          </Grid>
        </Grid>
      </Scrollbar>
      <DialogActions>
        <Button variant="outlined" size="small" onClick={() => {}}>
          Cancel
        </Button>
        <LoadingButton
          // loading={isLoading || isUpdateLoading}
          type="submit"
          variant="contained"
          size="small"
        >
          Save
        </LoadingButton>
      </DialogActions>
    </form>
  </Box>
);
