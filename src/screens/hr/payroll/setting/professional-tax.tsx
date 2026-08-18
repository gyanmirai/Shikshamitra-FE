import * as Yup from 'yup';
import { useFormik } from 'formik';
import React, { useState } from 'react';
import { LoadingButton } from '@mui/lab';
import { Add } from '@mui/icons-material';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomTooltip from 'src/components/custom-tooltip';
import { formatCurrency } from 'src/utils/cureencyFormater';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import NumericFormatCustom from 'src/components/custom-numeric-format';
import { Box, Stack, Button, Switch, TextField, Typography, DialogActions, FormControlLabel } from '@mui/material';
import {
  useGetProfessionalTaxQuery,
  useAddProfessionalTaxMutation,
  useDeleteProfessionalTaxMutation,
  useUpdateProfessionalTaxMutation,
} from 'src/redux/ProfessionalTax/ProfessionalTaxApi';

interface IProfessionalTaxRange {
  id: string;
  creationTime: string;
  creatorId: string;
  lastModificationTime: string;
  lastModifierId: string;
  tenantId: string;
  jurisdictionCode: string;
  effectiveFrom: string;
  effectiveTo?: string | null;
  fromSalary: number;
  toSalary?: number | null;
  taxAmount: number;
  isActive: boolean;
  deductInCessationMonth: boolean;
}
const ProfessionalTax = () => {
  const dialog = useBoolean();
  const confirm = useBoolean();

  const [editData, setEditData] = useState<null | IProfessionalTaxRange>(null);
  const { data: PFData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetProfessionalTaxQuery,
  });
  const [deletePF, { isLoading: isPFDeleteLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeleteProfessionalTaxMutation,
  });

  const handleClose = () => {
    setEditData(null);
    dialog.onFalse();
  };

  const tableData = PFData?.items || [];
  return (
    <Box>
      <ConfirmDialog
        open={confirm.value}
        onClose={() => {
          setEditData(null);
          confirm.onFalse();
        }}
        title="Delete"
        content="Are you sure you want to delete?"
        action={
          <LoadingButton
            variant="contained"
            loading={isPFDeleteLoading}
            color="error"
            onClick={async () => {
              await deletePF(editData?.id || '');
              confirm.onFalse();
              setEditData(null);
            }}
          >
            Yes
          </LoadingButton>
        }
      />
      <Box display="flex" justifyContent="flex-end" alignItems="center">
        <Button startIcon={<Add />} variant="contained" onClick={dialog.onTrue}>
          Tax Range
        </Button>
      </Box>
      <CustomizableTable
        noDataText={
          <>
            No Tax Range Found{' '}
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
              Tax Range
            </Box>
          </>
        }
        tableId="professional-table"
        isLoading={isLoading}
        columns={[
          { id: 'jurisdictionCode', label: 'Jurisdiction' },
          { id: 'effectiveFrom', label: 'Effective from' },
          {
            id: 'fromSalary',
            label: 'From salary',
            filterType: 'number',
            render(value, row) {
              return value == null ? 'No upper limit' : formatCurrency(value);
            },
          },
          {
            id: 'toSalary',
            label: 'To salary',
            filterType: 'number',
            render(value, row) {
              return formatCurrency(value);
            },
          },
          {
            id: 'taxAmount',
            label: 'Tax Amount',
            filterType: 'number',
            render(value, row) {
              return formatCurrency(value);
            },
          },
          {
            id: 'deductInCessationMonth',
            label: 'Cessation month',
            render(value) {
              return value ? 'Deduct' : 'Do not deduct';
            },
          },
          {
            id: 'action',
            label: 'Action',
            isSort: false,
            isFilter: false,
            sticky: true,

            minWidth: '140px',
            render(value, row) {
              return (
                <ThreeDotsActions
                  showEditIcon
                  showDeleteIcon
                  showThreeDots={false}
                  handleEditClick={() => {
                    setEditData(row as IProfessionalTaxRange);
                    dialog.onTrue();
                  }}
                  handleDeleteClick={() => {
                    setEditData(row as IProfessionalTaxRange);
                    confirm.onTrue();
                  }}
                />
              );
            },
          },
        ]}
        data={tableData || []}
      />
      <CustomDialog
        open={dialog.value}
        handleClose={handleClose}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">Create New Tax Range</Typography>
            <CustomTooltip
              arrow
              placement="right"
              title="In this section, you can create a Professional Tax entry by setting the tax range, allowing for customized tax deductions based on salary brackets."
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
      >
        <ProfessionalTaxForm handleClose={handleClose} editData={editData} />
      </CustomDialog>
    </Box>
  );
};

export default ProfessionalTax;

const numberConvertor = (value: string | number): number => {
  if (typeof value === 'string') {
    const matches = value.match(/\d+/g);
    return matches ? +matches.join('') : 0;
  }

  return value;
};

const ProfessionalTaxForm = ({
  handleClose,
  editData,
}: {
  editData: IProfessionalTaxRange | null;
  handleClose: () => void;
}) => {
  const [addPf, { isLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddProfessionalTaxMutation,
    isThrowError: true,
    popupConfig: {
      success: true,
      successMessage: 'Professional Tax created successfully',
    },
  });
  const [updatePF, { isLoading: isUpdatePFLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateProfessionalTaxMutation,
    isThrowError: true,
    popupConfig: {
      success: true,
      successMessage: 'Professional Tax updated successfully',
    },
  });
  const formik = useFormik({
    initialValues: {
      jurisdictionCode: editData?.jurisdictionCode || 'IN-GJ',
      effectiveFrom: editData?.effectiveFrom?.slice(0, 10) || '2022-04-01',
      effectiveTo: editData?.effectiveTo?.slice(0, 10) || '',
      fromSalary: editData?.fromSalary || '',
      toSalary: editData?.toSalary || '',
      taxAmount: editData?.taxAmount || '',
      isActive: editData?.isActive ?? true,
      deductInCessationMonth: editData?.deductInCessationMonth ?? true,
    },
    validationSchema: Yup.object().shape({
      jurisdictionCode: Yup.string().oneOf(['IN-GJ']).required('Jurisdiction is required'),
      effectiveFrom: Yup.string().required('Effective date is required'),
      fromSalary: Yup.string().required('From salary is required'),
      toSalary: Yup.string().nullable(),
      taxAmount: Yup.string().required('Tax amount is required'),
    }),
    onSubmit: async (values) => {
      try {
        if (editData) {
          await updatePF({
            id: editData.id,
            body: {
              jurisdictionCode: values.jurisdictionCode,
              effectiveFrom: values.effectiveFrom,
              effectiveTo: values.effectiveTo || null,
              fromSalary: numberConvertor(values.fromSalary),
              toSalary: values.toSalary ? numberConvertor(values.toSalary) : null,
              taxAmount: numberConvertor(values.taxAmount),
              isActive: values.isActive,
              deductInCessationMonth: values.deductInCessationMonth,
            },
          });
        } else {
          await addPf({
            jurisdictionCode: values.jurisdictionCode,
            effectiveFrom: values.effectiveFrom,
            effectiveTo: values.effectiveTo || null,
            fromSalary: numberConvertor(values.fromSalary),
            toSalary: values.toSalary ? numberConvertor(values.toSalary) : null,
            taxAmount: numberConvertor(values.taxAmount),
            isActive: values.isActive,
            deductInCessationMonth: values.deductInCessationMonth,
          });
        }
        handleClose();
      } catch (error) {
        console.error(error);
      }
    },
  });

  return (
    <Box component="form" onSubmit={formik.handleSubmit}>
      <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral' }}>
        <Stack spacing={2} sx={{ p: 2 }}>
          <TextField fullWidth size="small" label="Jurisdiction" value={formik.values.jurisdictionCode} disabled />
          <TextField
            fullWidth
            size="small"
            type="date"
            label="Effective from"
            name="effectiveFrom"
            value={formik.values.effectiveFrom}
            onChange={formik.handleChange}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            fullWidth
            size="small"
            type="date"
            label="Effective to"
            name="effectiveTo"
            value={formik.values.effectiveTo}
            onChange={formik.handleChange}
            InputLabelProps={{ shrink: true }}
            helperText="Optional"
          />

          <NumericFormatCustom
            size="small"
            label="From Salary"
            name="fromSalary"
            value={formik.values.fromSalary}
            onChange={formik.handleChange}
            error={formik.touched.fromSalary && Boolean(formik.errors.fromSalary)}
            helperText={formik.touched.fromSalary && formik.errors.fromSalary}
          />
          <FormControlLabel
            control={<Switch checked={formik.values.isActive} onChange={(_, checked) => formik.setFieldValue('isActive', checked)} />}
            label="Active rule"
          />
          <FormControlLabel
            control={
              <Switch
                checked={formik.values.deductInCessationMonth}
                onChange={(_, checked) => formik.setFieldValue('deductInCessationMonth', checked)}
              />
            }
            label="Deduct in employment cessation month"
          />
          <NumericFormatCustom
            size="small"
            label="To Salary"
            name="toSalary"
            value={formik.values.toSalary}
            onChange={formik.handleChange}
            error={formik.touched.toSalary && Boolean(formik.errors.toSalary)}
            helperText={formik.touched.toSalary && formik.errors.toSalary}
          />
          <NumericFormatCustom
            size="small"
            label="Tax Amount"
            name="taxAmount"
            value={formik.values.taxAmount}
            onChange={formik.handleChange}
            error={formik.touched.taxAmount && Boolean(formik.errors.taxAmount)}
            helperText={formik.touched.taxAmount && formik.errors.taxAmount}
          />
        </Stack>
      </Scrollbar>
      <DialogActions>
        <Button variant="outlined" onClick={handleClose}>
          Cancel
        </Button>
        <LoadingButton loading={isLoading || isUpdatePFLoading} variant="contained" type="submit">
          Save
        </LoadingButton>
      </DialogActions>
    </Box>
  );
};
