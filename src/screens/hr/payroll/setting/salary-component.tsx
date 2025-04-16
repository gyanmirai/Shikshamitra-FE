'use client';

import { useFormik } from 'formik';
import React, { useState } from 'react';

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
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { formatCurrency } from 'src/utils/cureencyFormater';

import { PayElementType } from 'src/enums/pay-element-type';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import {
  useGetPayElementsQuery,
  useAddPayElementMutation,
  useDeletePayElementMutation,
  useUpdatePayElementMutation,
} from 'src/redux/payElement/payElementApi';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

interface PayElement {
  code: string;
  name: string;
  componentType: string;
  id: string;
  description: string;
  isEmployeeSpecific: boolean;
  isDependent: boolean;
  dependName: string;
  dependent: {
    amount: number;
    percentage: boolean;
    elementCode: string;
  };
  amount: number;
  amountOfPercentage: number;
  isVisibleInPaySlip: boolean;
}

const SalaryComponent = () => {
  const dialog = useBoolean(false);
  const confirm = useBoolean();
  const [deleteInformation, setDeleteInformation] = useState<PayElement | null>(null);
  const [editData, setEditData] = useState<PayElement | null>(null);

  const { data: payElements, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetPayElementsQuery,
  });
  const [deletePayElement] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeletePayElementMutation,
  });

  const handleClose = () => {
    setEditData(null);
    dialog.onFalse();
  };
  return (
    <Box>
      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content="Are you sure want to delete?"
        action={
          <Button
            variant="contained"
            color="error"
            onClick={async () => {
              await deletePayElement(deleteInformation?.id);
              confirm.onFalse();
            }}
          >
            Delete
          </Button>
        }
      />
      <Box display="flex" justifyContent="flex-end" alignItems="center">
        <Button startIcon={<Add />} size="small" variant="contained" onClick={dialog.onTrue}>
          Salary Component
        </Button>
      </Box>
      <CustomizableTable
        noDataText={
          <>
            No Pay-element Found{' '}
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
              Salary Component
            </Box>
          </>
        }
        searchFieldProps={{
          placeholder: 'Search by Name, Type...',
          label: 'Search by Name, Type....',
          sx: {
            maxWidth: '400px',
            width: '100%',
          },
        }}
        tableId="pay-element-table"
        isLoading={isLoading}
        columns={[
          { id: 'name', label: 'Name' },
          {
            id: 'componentType',
            label: 'Component Type',
            render(value, row) {
              return PayElementType[value];
            },
          },
          {
            id: 'dependName',
            label: 'Depend Name',
          },
          {
            id: 'amount',
            label: 'Amount',
            render(value, row) {
              return formatCurrency(value);
            },
          },
          // { id: 'dependent', label: 'Dependent' },
          {
            id: 'isVisibleInPaySlip',
            label: 'Visible In Pay Slip',
            render(value, row) {
              return value ? 'Yes' : 'No';
            },
          },
          {
            id: 'actions',
            label: 'Actions',
            isSort: false,
            isFilter: false,
            sticky: true,

            minWidth: '140px',
            render(value, row) {
              return (
                <ThreeDotsActions
                  // actions={(prop) => actions({ ...prop, row })}
                  showThreeDots={false}
                  showEditIcon
                  showDeleteIcon
                  handleDeleteClick={() => {
                    setDeleteInformation(row as PayElement);
                    confirm.onTrue();
                  }}
                  handleEditClick={() => {
                    setEditData(row as PayElement);
                    dialog.onTrue();
                  }}
                  placement="right-top"
                />
              );
            },
          },
        ]}
        data={payElements?.items || []}
      />
      <CustomDialog
        maxWidth="sm"
        title={
          <Box display="flex" flexDirection="row" gap={2} alignItems="center">
            <Typography variant="h5">Add Salary Component</Typography>
            <Tooltip
              arrow
              placement="right"
              title="In this section, you can define various salary components such as basic salary, allowances, bonuses, deductions, and more. These components are used to calculate the employee's total salary.."
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </Tooltip>
          </Box>
        }
        handleClose={handleClose}
        open={dialog.value}
      >
        <SalaryComponentForm
          payElements={payElements?.items || []}
          handleClose={handleClose}
          editData={editData}
        />
      </CustomDialog>
    </Box>
  );
};

export default SalaryComponent;

interface SalaryComponentFormProps {
  payElements: PayElement[];
  handleClose: () => void;
  editData?: PayElement | null;
}

const SalaryComponentForm = ({ payElements, handleClose, editData }: SalaryComponentFormProps) => {
  const [addPayElement, { isLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddPayElementMutation,
  });
  const [updatePayElement, { isLoading: isLoadingUpdate }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdatePayElementMutation,
  });

  const { values, setFieldValue, handleChange, handleSubmit } = useFormik({
    initialValues: {
      name: editData?.name || '',
      componentType: editData?.componentType || '',
      description: editData?.description || '',
      depend: editData?.isDependent || false,
      dependName: editData?.dependName || '',
      amount: editData?.dependent?.amount || 0,
      amountOfPercentage: editData?.dependent?.percentage || 0,
      paySlip: editData?.isVisibleInPaySlip || false,
    },
    onSubmit: async (val) => {
      console.log('on submit calls');

      //   try {
      //     if (editData) {
      //       await updatePayElement({
      //         id: editData.id,
      //         body: {
      //           code: val.code,
      //           name: val.name,
      //           type: val.payElementType,
      //           isEmployeeSpecific: val.employeeSpecific,
      //           isDependent: val.depend,
      //           ...(val.depend
      //             ? {
      //                 dependent: {
      //                   elementCode: val.elementCode,
      //                   percentage: null,
      //                   amount: val.amount,
      //                 },
      //               }
      //             : {}),

      //           isVisibleInPaySlip: val.paySlip,
      //         },
      //       });
      //     } else {
      //       await addPayElement({
      //         code: val.code,
      //         name: val.name,
      //         type: val.payElementType,
      //         isEmployeeSpecific: val.employeeSpecific,
      //         isDependent: val.depend,
      //         ...(val.depend
      //           ? {
      //               dependent: {
      //                 elementCode: val.elementCode,
      //                 percentage: null,
      //                 amount: val.amount,
      //               },
      //             }
      //           : {}),

      //         isVisibleInPaySlip: val.paySlip,
      //       });
      //     }
      //     handleClose();
      //   } catch (error) {
      //     console.log(error);
      //   }
      // },
    },
  });

  return (
    <Box>
      <form onSubmit={handleSubmit}>
        <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral' }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                name="name"
                label="Name"
                value={values.name}
                onChange={handleChange}
                size="small"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <CustomSelect
                options={[
                  {
                    value: 'earning',
                    label: 'Earning',
                  },
                  {
                    value: 'deduction',
                    label: 'Deduction',
                  },
                ]}
                label="Component Type"
                value={values.componentType}
                onChange={(val) => setFieldValue('componentType', val)}
                formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="description"
                label="Description"
                value={values.description}
                onChange={handleChange}
                size="small"
                fullWidth
                multiline
                rows={3}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Box display="flex" alignItems="center">
                <Checkbox
                  size="small"
                  checked={values.depend}
                  onChange={(e) => setFieldValue('depend', e.target.checked)}
                />
                <Typography variant="body2">Depend</Typography>
              </Box>
            </Grid>
            {values.depend && (
              <>
                <Grid item xs={12} md={6}>
                  <CustomSelect
                    options={payElements.map((item) => ({
                      label: item.name,
                      value: item.id,
                    }))}
                    label="Depend Name"
                    value={values.dependName}
                    onChange={(val) => setFieldValue('dependName', val)}
                    formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    size="small"
                    label="Amount"
                    name="amount"
                    value={values.amount}
                    onChange={handleChange}
                    type="number"
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    size="small"
                    label="Amount Of Percentage"
                    name="amountOfPercentage"
                    type="number"
                    value={values.amountOfPercentage}
                    onChange={handleChange}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">%</InputAdornment>,
                    }}
                    fullWidth
                  />
                </Grid>
              </>
            )}
            <Grid item xs={12}>
              <Box display="flex" alignItems="center">
                <Checkbox
                  size="small"
                  checked={values.paySlip}
                  onChange={(e) => setFieldValue('paySlip', e.target.checked)}
                />
                <Typography variant="body2">is pay slip generate</Typography>
              </Box>
            </Grid>
          </Grid>
        </Scrollbar>
        <DialogActions>
          <LoadingButton loading={isLoading || isLoadingUpdate} variant="contained" type="submit">
            Save
          </LoadingButton>
        </DialogActions>
      </form>
    </Box>
  );
};
