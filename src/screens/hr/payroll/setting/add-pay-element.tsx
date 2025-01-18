import { useFormik } from 'formik';
import React, { useState } from 'react';

import { LoadingButton } from '@mui/lab';
import { Add } from '@mui/icons-material';
import {
  Box,
  Grid,
  Button,
  MenuList,
  Checkbox,
  MenuItem,
  TextField,
  Typography,
  DialogActions,
  InputAdornment,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { formatCurrency } from 'src/utils/cureencyFormater';

import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { PayElementType, PayElementTypeArray } from 'src/enums/pay-element-type';
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
  type: number;
  id: string;
  isEmployeeSpecific: boolean;
  isDependent: boolean;
  dependent: {
    amount: number;
    percentage: boolean;
    elementCode: string;
  };
  isVisibleInPaySlip: boolean;
}

const AddPayElement = () => {
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
        <Button startIcon={<Add />} variant="contained" onClick={dialog.onTrue}>
          Pay Element
        </Button>
      </Box>
      <CustomizableTable
        tableId="pay-element-table"
        isLoading={isLoading}
        columns={[
          { id: 'code', label: 'Code' },
          { id: 'name', label: 'Name' },
          {
            id: 'type',
            label: 'Pay element type',
            render(value, row) {
              return PayElementType[value];
            },
          },
          {
            id: 'dependent.amount',
            label: 'Depend Amount',
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
            label: 'Action',
            id: 'action',
            render: (value, data) => (
              <ThreeDotsActions
                actions={({ popover }) => (
                  <MenuList>
                    <MenuItem
                      onClick={() => {
                        setDeleteInformation(data as PayElement);
                        confirm.onTrue();
                        popover.onClose();
                      }}
                      sx={{ color: 'error.main' }}
                    >
                      <Iconify
                        icon="solar:trash-bin-trash-bold"
                        sx={{ height: '16px', width: '16px' }}
                      />
                      Delete
                    </MenuItem>

                    <MenuItem
                      onClick={() => {
                        setEditData(data as PayElement);
                        dialog.onTrue();
                        popover.onClose();
                      }}
                    >
                      <Iconify icon="solar:pen-bold" sx={{ height: '16px', width: '16px' }} />
                      Edit
                    </MenuItem>
                  </MenuList>
                )}
              />
            ),
          },
        ]}
        data={payElements?.items || []}
      />
      <CustomDialog
        maxWidth="sm"
        title="New Pay Element"
        handleClose={handleClose}
        open={dialog.value}
      >
        <AddPayElementForm
          payElements={payElements?.items || []}
          handleClose={handleClose}
          editData={editData}
        />
      </CustomDialog>
    </Box>
  );
};

export default AddPayElement;

interface AddPayElementFormProps {
  payElements: PayElement[];
  handleClose: () => void;
  editData?: PayElement | null;
}

const AddPayElementForm = ({ payElements, handleClose, editData }: AddPayElementFormProps) => {
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
      code: editData?.code || '',
      name: editData?.name || '',
      payElementType: editData?.type || 0,
      employeeSpecific: editData?.isEmployeeSpecific || false,
      depend: editData?.isDependent || false,
      amount: editData?.dependent?.amount || 0,
      amountOfPercentage: editData?.dependent?.percentage || 0,
      paySlip: editData?.isVisibleInPaySlip || false,
      elementCode: editData?.dependent?.elementCode || '',
    },
    onSubmit: async (val) => {
      try {
        if (editData) {
          await updatePayElement({
            id: editData.id,
            body: {
              code: val.code,
              name: val.name,
              type: val.payElementType,
              isEmployeeSpecific: val.employeeSpecific,
              isDependent: val.depend,
              ...(val.depend
                ? {
                    dependent: {
                      elementCode: val.elementCode,
                      percentage: null,
                      amount: val.amount,
                    },
                  }
                : {}),

              isVisibleInPaySlip: val.paySlip,
            },
          });
        } else {
          await addPayElement({
            code: val.code,
            name: val.name,
            type: val.payElementType,
            isEmployeeSpecific: val.employeeSpecific,
            isDependent: val.depend,
            ...(val.depend
              ? {
                  dependent: {
                    elementCode: val.elementCode,
                    percentage: null,
                    amount: val.amount,
                  },
                }
              : {}),

            isVisibleInPaySlip: val.paySlip,
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
      <form onSubmit={handleSubmit}>
        <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral' }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                name="code"
                label="Code"
                value={values.code}
                onChange={handleChange}
                size="small"
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="name"
                label="Name"
                value={values.name}
                onChange={handleChange}
                size="small"
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <CustomSelect
                options={PayElementTypeArray}
                label="Pay Element Type"
                value={values.payElementType}
                onChange={(val) => setFieldValue('payElementType', val)}
                formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
              />
            </Grid>
            <Grid item xs={12}>
              <Box display="flex" alignItems="center">
                <Checkbox
                  size="small"
                  checked={values.employeeSpecific}
                  onChange={(e) => setFieldValue('employeeSpecific', e.target.checked)}
                />
                <Typography variant="body2">Employee Specific</Typography>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Box display="flex" flexDirection="column" justifyContent="center">
                <Box display="flex" alignItems="center">
                  <Checkbox
                    size="small"
                    checked={values.depend}
                    onChange={(e) => setFieldValue('depend', e.target.checked)}
                  />
                  <Typography variant="body2">Depend</Typography>
                </Box>
                {values.depend && (
                  <Box display="flex" gap={2}>
                    <CustomSelect
                      options={payElements.map((item) => ({
                        label: item.name,
                        value: item.id,
                      }))}
                      label="Depend Name"
                      value={values.elementCode}
                      onChange={(val) => setFieldValue('elementCode', val)}
                      formControlProps={{ sx: { maxWidth: '150px', width: '100%' } }}
                    />
                    <TextField
                      size="small"
                      label="Amount"
                      name="amount"
                      value={values.amount}
                      onChange={handleChange}
                      type="number"
                    />
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
                    />
                  </Box>
                )}
              </Box>
            </Grid>
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
