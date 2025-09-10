'use client';

import type { UseBooleanReturn } from 'src/hooks/use-boolean';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import React, { useState } from 'react';
import { LoadingButton } from '@mui/lab';
import { GlobalIcons } from 'src/utils/icons';
import { DatePicker } from '@mui/x-date-pickers';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import CustomTooltip from 'src/components/custom-tooltip';
import { formatCurrency } from 'src/utils/cureencyFormater';
import { PayElementType } from 'src/enums/pay-element-type';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import {
  useGetPayElementsQuery,
  useDeletePayElementMutation,
} from 'src/redux/payElement/payElementApi';
import {
  Box,
  Grid,
  Paper,
  Alert,
  Button,
  MenuItem,
  TextField,
  Typography,
  DialogActions,
} from '@mui/material';

import { SectionCard } from '../../employee/employee-form-fields/InformationFields';

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

const SalaryStructure = ({
  isSalaryStructureOpen: dialog,
}: {
  isSalaryStructureOpen: UseBooleanReturn;
}) => {
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
        content="Are you sure you want to delete?"
        action={
          <Button
            variant="contained"
            size="small"
            color="error"
            onClick={async () => {
              await deletePayElement(deleteInformation?.id);
              confirm.onFalse();
            }}
          >
            Yes
          </Button>
        }
      />
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
        maxWidth="md"
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">Salary Structure</Typography>
            <CustomTooltip
              arrow
              placement="right"
              title="In this section, you can define various salary components such as basic salary, allowances, bonuses, deductions, and more. These components are used to calculate the employee's total salary.."
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
        handleClose={handleClose}
        open={dialog.value}
      >
        <CTCPreviewForm handleClose={handleClose} editData={editData} />
      </CustomDialog>
    </Box>
  );
};

export default SalaryStructure;

const deductionOptions = {
  pf: ['PF Option 1', 'PF Option 2'],
  pt: ['PT Option 1', 'PT Option 2'],
  tds: ['TDS Option 1', 'TDS Option 2'],
  lwf: ['LWF Option 1', 'LWF Option 2'],
  esi: ['ESI Option 1', 'ESI Option 2'],
};

const validationSchema = Yup.object({
  name: Yup.string().required('Required'),
  role: Yup.string().required('Required'),
});

const CTCPreviewForm = ({ handleClose, editData }: { handleClose: () => void; editData: any }) => {
  const formik = useFormik({
    initialValues: {
      name: editData?.name || '',
      role: editData?.role || '',
      fromSalary: editData?.fromSalary || '',
      toSalary: editData?.toSalary || '',
      effectiveFrom: editData?.effectiveFrom || null,
      effectiveTo: editData?.effectiveTo || null,
      sampleCTC: editData?.sampleCTC || '',
      notes: editData?.notes || '',
      pf: editData?.pf || '',
      pt: editData?.pt || '',
      tds: editData?.tds || '',
      lwf: editData?.lwf || '',
      esi: editData?.esi || '',
    },
    validationSchema,
    onSubmit: (values) => {
      console.log(values);
    },
  });

  return (
    <>
      <DialogScrollContent>
        {/* General Info */}
        <SectionCard title="General Information">
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                size="small"
                fullWidth
                label="Name"
                name="name"
                value={formik.values.name}
                onChange={formik.handleChange}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                size="small"
                fullWidth
                label="Role"
                name="role"
                value={formik.values.role}
                onChange={formik.handleChange}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <DatePicker
                label="Template Effective From"
                value={formik.values.effectiveFrom}
                onChange={(date) => formik.setFieldValue('effectiveFrom', date)}
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <DatePicker
                label="Template Effective To"
                value={formik.values.effectiveTo}
                onChange={(date) => formik.setFieldValue('effectiveTo', date)}
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                size="small"
                fullWidth
                label="From Salary"
                name="fromSalary"
                value={formik.values.fromSalary}
                onChange={formik.handleChange}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                size="small"
                fullWidth
                label="To Salary"
                name="toSalary"
                value={formik.values.toSalary}
                onChange={formik.handleChange}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                size="small"
                fullWidth
                label="Sample Annual CTC"
                name="sampleCTC"
                value={formik.values.sampleCTC}
                onChange={formik.handleChange}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                size="small"
                fullWidth
                multiline
                rows={2}
                label="Notes"
                name="notes"
                value={formik.values.notes}
                onChange={formik.handleChange}
              />
            </Grid>
          </Grid>
        </SectionCard>

        {/* Earnings Table */}
        <SectionCard title="Earning">
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField size="small" select fullWidth label="Select Components">
                <MenuItem value="default">Select</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <CustomizableTable
                tableId="salary-comp"
                columns={[
                  { id: 'salaryComponent', label: 'Salary Component' },
                  { id: 'type', label: 'Calculation Type' },
                  { id: 'basedOn', label: 'Based On' },
                  { id: 'amount', label: 'Calculation Percentage/Amount' },
                  { id: 'monthly', label: 'Monthly Amount' },
                  { id: 'yearly', label: 'Yearly Amount' },
                ]}
                data={[
                  {
                    salaryComponent: 'Basic Salary',
                    type: 'Percentage',
                    basedOn: 'CTC',
                    amount: '50%',
                    monthly: '₹25,000',
                    yearly: '₹3,00,000',
                  },
                  {
                    salaryComponent: 'House Rent Allowance',
                    type: 'Percentage',
                    basedOn: 'Basic',
                    amount: '40%',
                    monthly: '₹10,000',
                    yearly: '₹1,20,000',
                  },
                  {
                    salaryComponent: 'Special Allowance',
                    type: 'Fixed',
                    basedOn: 'N/A',
                    amount: '₹8,000',
                    monthly: '₹8,000',
                    yearly: '₹96,000',
                  },
                  {
                    salaryComponent: 'Transport Allowance',
                    type: 'Fixed',
                    basedOn: 'N/A',
                    amount: '₹3,000',
                    monthly: '₹3,000',
                    yearly: '₹36,000',
                  },
                  {
                    salaryComponent: 'Medical Allowance',
                    type: 'Fixed',
                    basedOn: 'N/A',
                    amount: '₹2,000',
                    monthly: '₹2,000',
                    yearly: '₹24,000',
                  },
                ]}
              />
            </Grid>
          </Grid>
        </SectionCard>

        {/* Deduction Section */}
        <SectionCard title="Deduction">
          <Grid container spacing={2}>
            {['pf', 'pt', 'tds', 'lwf', 'esi'].map((field) => (
              <Grid size={{ xs: 12, sm: 6 }} key={field}>
                <TextField
                  size="small"
                  select
                  fullWidth
                  label={`Select ${field.toUpperCase()}`}
                  name={field}
                  value={(formik.values as any)[field]}
                  onChange={formik.handleChange}
                >
                  {deductionOptions[field as keyof typeof deductionOptions].map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            ))}
          </Grid>
        </SectionCard>

        {/* CTC Preview */}
        <SectionCard title="Sample CTC Preview">
          <Grid container spacing={2}>
            {/* Earnings */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f0fdf4' }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Earnings
                </Typography>
                <Grid container>
                  <Grid size={{ xs: 6 }}>
                    <Typography>Basic Salary:</Typography>
                    <Typography>HRA:</Typography>
                    <Typography>Special Allowance:</Typography>
                    <Typography fontWeight="bold" mt={1}>
                      Gross Earning:
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }} textAlign="right">
                    <Typography>₹45,000</Typography>
                    <Typography>₹18,000</Typography>
                    <Typography>₹12,000</Typography>
                    <Typography fontWeight="bold" mt={1}>
                      ₹75,000
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* Deductions */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper variant="outlined" sx={{ p: 2, bgcolor: '#fff7f6' }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Deductions
                </Typography>
                <Grid container>
                  <Grid size={{ xs: 6 }}>
                    <Typography>Provident Fund:</Typography>
                    <Typography>ESI:</Typography>
                    <Typography>TDS:</Typography>
                    <Typography fontWeight="bold" mt={1}>
                      Total Deduction:
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }} textAlign="right">
                    <Typography>₹5,400</Typography>
                    <Typography>₹722</Typography>
                    <Typography>₹1,000</Typography>
                    <Typography fontWeight="bold" mt={1}>
                      ₹7,122
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* Net Payable */}
            <Grid size={{ xs: 12 }}>
              <Alert variant="outlined" severity="success">
                Net Payable ₹67,878
              </Alert>
            </Grid>
          </Grid>
        </SectionCard>
      </DialogScrollContent>

      <DialogActions>
        <Button
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
          size="small"
          onClick={handleClose}
          variant="outlined"
        >
          Cancel
        </Button>
        <LoadingButton
          startIcon={<Iconify icon={GlobalIcons.submit} />}
          size="small"
          type="submit"
          variant="contained"
          onClick={(e: any) => formik.handleSubmit(e)}
        >
          {editData ? 'Update' : 'Submit'}
        </LoadingButton>
      </DialogActions>
    </>
  );
};
