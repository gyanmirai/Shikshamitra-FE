'use client';

import type { RootState } from 'src/redux/store';
import type { Organization } from 'src/types/school';
import type { UsePopoverReturn } from 'src/components/custom-popover';

import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import { useState, useEffect, useCallback } from 'react';

import { LoadingButton } from '@mui/lab';
import { Search } from '@mui/icons-material';
import {
  Box,
  Grid,
  Paper,
  Stack,
  Button,
  MenuList,
  MenuItem,
  TextField,
  Typography,
  DialogActions,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { formatCurrency } from 'src/utils/cureencyFormater';

import { Iconify } from 'src/components/iconify';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

const EmployeeSalaryStructureScreen = () => {
  const [allOrganization, setAllOrganization] = useState<Organization[]>([]);
  const [organization, setOrganization] = useState<string>('');

  const { currentMedium: medium, setCurrentMedium: setMedium } = useSelector(
    (state: RootState) => state.globalState
  );

  useEffect(() => {
    setAllOrganization(medium?.educationMediumStages || []);
    setOrganization(medium?.educationMediumStages?.[0]?.id || '');
  }, [medium]);

  const earningData = [
    { type: 'Basic Salary', amount: 50000 },
    { type: 'House Rent', amount: 10000 },
    { type: 'Medical Allowance', amount: 5000 },
  ];

  const deductionData = [
    { type: 'Income Tax', amount: 5000 },
    { type: 'Provident Fund', amount: 2000 },
    { type: 'Insurance', amount: 1000 },
  ];

  return (
    <Box>
      <CustomBreadcrumbs
        heading="Payroll Structure"
        links={[{ name: 'HR' }, { name: 'Payroll Management' }, { name: 'Payroll Structure' }]}
        sx={{ px: 1, mb: 2 }}
      />
      <Box display="flex" gap={2} flexWrap="wrap" mb={2}>
        <CustomSelect
          options={allOrganization}
          label="Organization"
          value={organization}
          onChange={(val: string | string[]) => setOrganization(val as string)}
          labelKey="name"
          valueKey="id"
          formControlProps={{ sx: { maxWidth: '250px', width: '100%' } }}
          disabled={!medium}
        />
        <Button variant="contained" startIcon={<Search />}>
          Search
        </Button>
      </Box>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Sections title="Earning" data={earningData} />
        </Grid>
        <Grid item xs={12} md={6}>
          <Sections title="Deduction" data={deductionData} />
        </Grid>
        {/* <Grid item xs={12} md={6}>
            
            </Grid> */}
      </Grid>
    </Box>
  );
};
export default EmployeeSalaryStructureScreen;

export const Sections = ({ title, data }: { title?: string; data?: any }) => {
  const dialog = useBoolean();
  const confirm = useBoolean(false);
  const [editData, setEditData] = useState<any>(null);

  const actions = useCallback(
    // eslint-disable-next-line react/no-unused-prop-types
    ({ popover }: { popover: UsePopoverReturn }, row: any) => (
      <MenuList>
        <MenuItem
          onClick={() => {
            confirm.onTrue();
            popover.onClose();
          }}
          sx={{ color: 'error.main' }}
        >
          <Iconify icon="solar:trash-bin-trash-bold" sx={{ height: '16px', width: '16px' }} />
          Delete
        </MenuItem>
        <MenuItem
          onClick={async () => {
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
  return (
    <Paper elevation={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" p={2}>
        <Typography variant="h5">{title}</Typography>
        <Button
          sx={{
            height: '35px',
            width: '35px',
            borderRadius: '50%',
            minWidth: 'unset',
          }}
          variant="contained"
          onClick={dialog.onTrue}
        >
          <Iconify icon="material-symbols:add" width={20} height={20} />
        </Button>
      </Box>
      <Box p={2} pt={0}>
        <CustomizableTable
          columns={[
            { id: 'type', label: 'Type' },
            {
              id: 'amount',
              label: 'Amount',
              render(value, row) {
                return formatCurrency(value);
              },
            },
            {
              id: 'action',
              label: 'Action',
              render(value, row) {
                return (
                  <ThreeDotsActions placement="right-top" actions={(prop) => actions(prop, row)} />
                );
              },
            },
          ]}
          data={data}
        />
      </Box>
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
            loading={false}
            color="error"
            onClick={async () => {
              //   await deleteOrganization(editData?.id || '');
              //   await getData(id);
              confirm.onFalse();
              setEditData(null);
              // isInitial.current = true;
            }}
          >
            Delete
          </LoadingButton>
        }
      />
      <CustomDialog title="Add Structure" open={dialog.value} handleClose={dialog.onFalse}>
        <SectionForm handleClose={dialog.onFalse} />
      </CustomDialog>
    </Paper>
  );
};

export const SectionForm = ({ handleClose }: any) => {
  const { values, handleChange, handleSubmit } = useFormik({
    initialValues: {
      type: '',
      amount: '',
    },
    onSubmit: () => {},
  });

  return (
    <>
      <Box component="form" onSubmit={handleSubmit} sx={{ bgcolor: 'background.neutral', p: 2 }}>
        <Stack spacing={2} direction="column">
          <TextField
            size="small"
            fullWidth
            label="Type"
            name="type"
            value={values?.type}
            onChange={handleChange}
          />
          <TextField
            size="small"
            fullWidth
            label="Amount"
            name="amount"
            value={values?.amount}
            onChange={handleChange}
          />
        </Stack>
      </Box>
      <DialogActions>
        <Button variant="outlined" onClick={handleClose}>
          Cancel
        </Button>
        <Button variant="contained" type="submit">
          Submit
        </Button>
      </DialogActions>
    </>
  );
};
