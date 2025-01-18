'use client';

import type { RootState } from 'src/redux/store';
import type { Organization } from 'src/types/school';
import type { UsePopoverReturn } from 'src/components/custom-popover';
import type { PayrollStructureType } from 'src/enums/payroll-structure-tyep';

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

import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetPayElementsQuery } from 'src/redux/payElement/payElementApi';
import {
  useAddPayrollStructureMutation,
  useDeletePayrollStructureMutation,
  useUpdatePayrollStructureMutation,
  useGetPayrollStructureByOrganizationQuery,
} from 'src/redux/payrollStructure/payrollStructureApi';

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

  const { data: payrollStructure, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetPayrollStructureByOrganizationQuery,
    params: organization,
    options: {
      skip: !organization,
    },
  });

  console.log(payrollStructure, 'payrollStructure');

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
          onChange={(val) => setOrganization(val as string)}
          labelKey="name"
          valueKey="id"
          formControlProps={{ sx: { maxWidth: '250px', width: '100%' } }}
          disabled={!medium}
        />
        <Button variant="contained" startIcon={<Search />}>
          Search
        </Button>
      </Box>
      {organization && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Sections
              title="Earning"
              data={payrollStructure || []}
              isLoading={isLoading}
              type={0}
              organization={organization}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Sections
              title="Deduction"
              data={payrollStructure || []}
              isLoading={isLoading}
              type={1}
              organization={organization}
            />
          </Grid>
          {/* <Grid item xs={12} md={6}>
            
            </Grid> */}
        </Grid>
      )}
    </Box>
  );
};
export default EmployeeSalaryStructureScreen;

export const Sections = ({
  title,
  data,
  type,
  organization,
  isLoading = false,
}: {
  title?: string;
  data?: any;
  type: PayrollStructureType;
  organization: string;
  isLoading?: boolean;
}) => {
  const dialog = useBoolean();
  const confirm = useBoolean(false);
  const [editData, setEditData] = useState<any>(null);
  const [deleteInformation, setDeleteInformation] = useState<any>(null);

  const [deletePayrollStructure, { isLoading: isDeleteLoading }] = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useDeletePayrollStructureMutation,
  });

  const actions = useCallback(
    // eslint-disable-next-line react/no-unused-prop-types
    ({ popover }: { popover: UsePopoverReturn }, row: any) => (
      <MenuList>
        <MenuItem
          onClick={() => {
            setDeleteInformation(row);
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
  const handleClose = () => {
    setEditData(null);
    dialog.onFalse();
  };

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
          tableId="payroll-structure"
          isFilter={false}
          isPagination={false}
          isSearch={false}
          isShowedDense={false}
          isLoading={isLoading}
          columns={[
            { id: 'payElement.name', label: 'Type' },
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
                  <ThreeDotsActions
                    placement="right-top"
                    showDeleteIcon
                    showEditIcon
                    showThreeDots={false}
                    handleEditClick={() => {
                      setEditData(row);
                      dialog.onTrue();
                    }}
                    handleDeleteClick={() => {
                      setDeleteInformation(row);
                      confirm.onTrue();
                    }}
                  />
                );
              },
            },
          ]}
          data={data?.filter((i: any) => i.payrollStructureType === type) || []}
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
            loading={isDeleteLoading}
            color="error"
            onClick={async () => {
              await deletePayrollStructure(deleteInformation?.id || '');
              confirm.onFalse();
              setEditData(null);
              setDeleteInformation(null);
            }}
          >
            Delete
          </LoadingButton>
        }
      />
      <CustomDialog title="Add Structure" open={dialog.value} handleClose={handleClose}>
        <SectionForm
          handleClose={handleClose}
          type={type}
          organization={organization}
          editData={editData}
        />
      </CustomDialog>
    </Paper>
  );
};

export const SectionForm = ({ handleClose, type, organization, editData }: any) => {
  const [addStructure, { isLoading }] = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useAddPayrollStructureMutation,
  });

  const [updateStructure, { isLoading: isUpdateLoading }] = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useUpdatePayrollStructureMutation,
  });

  const { data: payElements } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetPayElementsQuery,
  });
  const { values, handleChange, handleSubmit, setFieldValue } = useFormik({
    initialValues: {
      type: editData?.payElementId || '',
      amount: editData?.amount || '',
    },
    onSubmit: async (val) => {
      if (editData) {
        await updateStructure({
          id: editData?.id || '',
          body: {
            educationMediumStageId: organization,
            payElementId: val.type,
            payrollStructureType: type,
            amount: val.amount,
          },
        });
      } else {
        await addStructure({
          educationMediumStageId: organization,
          payElementId: val.type,
          payrollStructureType: type,
          amount: val.amount,
        });
      }
      handleClose();
    },
  });

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ bgcolor: 'background.neutral', p: 2 }}>
      <Stack spacing={2} direction="column" sx={{ bgcolor: 'background.neutral' }}>
        <CustomSelect
          label="Select Type"
          options={payElements?.items || []}
          labelKey="name"
          valueKey="id"
          value={values?.type}
          onChange={(val) => setFieldValue('type', val)}
          formControlProps={{ sx: { maxWidth: 'unset', width: '100%' } }}
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
      <DialogActions>
        <Button variant="outlined" onClick={handleClose}>
          Cancel
        </Button>
        <LoadingButton loading={isUpdateLoading || isLoading} variant="contained" type="submit">
          Submit
        </LoadingButton>
      </DialogActions>
    </Box>
  );
};
