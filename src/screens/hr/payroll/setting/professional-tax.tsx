import * as Yup from 'yup';
import { useFormik } from 'formik';
import { LoadingButton } from '@mui/lab';
import { Add } from '@mui/icons-material';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { hrPaths } from 'src/constants/hr-menus';
import React, { useState, useEffect } from 'react';
import { useBoolean } from 'src/hooks/use-boolean';
import { formatCurrency } from 'src/utils/cureencyFormater';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ShakingTextField from 'src/components/shaking-text-field';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { FormSectionCard } from 'src/components/form-section-card';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import NumericFormatCustom from 'src/components/custom-numeric-format';
import { useHrTableQuery } from 'src/screens/hr/hooks/use-hr-table-query';
import { useHrTableExport } from 'src/screens/hr/hooks/use-hr-table-export';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import {
  Box,
  Grid,
  Alert,
  Stack,
  Button,
  Switch,
  TextField,
  DialogActions,
  FormControlLabel,
} from '@mui/material';
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
  const [tableQuery, setTableQuery] = useState({ page: 1, pageSize: 20, search: '' });
  const exportTable = useHrTableExport('hr-professional-tax', tableQuery);
  const dialog = useBoolean();
  const confirm = useBoolean();
  const [formBusy, setFormBusy] = useState(false);

  const [editData, setEditData] = useState<null | IProfessionalTaxRange>(null);
  const {
    data: PFData,
    isLoading,
    error: tableError,
    isFetching: tableFetching,
    refetch: retryTable,
    tableProps: operationalTableProps,
  } = useHrTableQuery(
    {
      table: 'hr-professional-tax',
      genericSearch: true,
      query: tableQuery,
      page: tableQuery.page - 1,
      size: tableQuery.pageSize,
      resetPage: () => setTableQuery((current) => ({ ...current, page: 1 })),
    },
    useQueryAndMutation({
      type: 'query',
      currentQueryAndMutation: useGetProfessionalTaxQuery,
      params: tableQuery,
    })
  );
  const [deletePF, { isLoading: isPFDeleteLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeleteProfessionalTaxMutation,
  });

  const handleClose = () => {
    if (formBusy) return;
    setEditData(null);
    dialog.onFalse();
  };

  const tableData = PFData?.items || [];
  return (
    <Box sx={{ height: 1, minHeight: 0, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
      <CustomBreadcrumbs
        sx={{ flexShrink: 0 }}
        slotProps={{
          heading: {},
          moreLink: {},
          breadcrumbs: {},
          action: { alignSelf: { xs: 'flex-end', md: 'center' } },
        }}
        heading="Professional tax"
        description="Manage effective-dated professional tax salary ranges."
        links={[
          { name: 'Payroll Management', href: hrPaths.payroll.root },
          { name: 'Professional tax' },
        ]}
        action={
          <Button size="small" startIcon={<Add />} variant="contained" onClick={dialog.onTrue}>
            Add tax range
          </Button>
        }
      />
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
            size="small"
            variant="contained"
            loading={isPFDeleteLoading}
            color="error"
            onClick={async () => {
              await deletePF(editData?.id || '');
              confirm.onFalse();
              setEditData(null);
            }}
          >
            Delete
          </LoadingButton>
        }
      />
      <CustomizableTable
        showColumns
        showExport
        showFullScreen
        exportScope="all"
        noDataText={
          <>
            No Tax Range Found{' '}
            <Button size="small" onClick={dialog.onTrue} startIcon={<Add />}>
              Add tax range
            </Button>
          </>
        }
        tableId="professional-table"
        tableTitle="Professional tax ranges"
        onExport={exportTable}
        error={tableError}
        onRetry={retryTable}
        serverSidePagination
        isSearch={false}
        page={tableQuery.page - 1}
        rowsPerPage={tableQuery.pageSize}
        totalCount={PFData?.totalCount || 0}
        onServerPagination={(page, pageSize) =>
          setTableQuery((current) => ({ ...current, page, pageSize }))
        }

        wrapperProps={{ sx: { flex: 1, minHeight: 0, overflow: 'hidden' } }}
        tableContainerProps={{ sx: { height: 1 } }}
        isLoading={isLoading || tableFetching}
        columns={[
          { id: 'jurisdictionCode', label: 'Jurisdiction' },
          { id: 'effectiveFrom', label: 'Effective from' },
          {
            id: 'fromSalary',
            label: 'From salary',
            align: 'right',
            filterType: 'number',
            render(value, row) {
              return row.fromSalary == null ? '-' : formatCurrency(row.fromSalary);
            },
          },
          {
            id: 'toSalary',
            label: 'To salary',
            align: 'right',
            filterType: 'number',
            render(value, row) {
              return row.toSalary == null ? 'No upper limit' : formatCurrency(row.toSalary);
            },
          },
          {
            id: 'taxAmount',
            label: 'Tax Amount',
            align: 'right',
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
            stickyPosition: 'right' as const,

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
        {...operationalTableProps}
      />
      <CustomDialog
        open={dialog.value}
        handleClose={handleClose}
        hasForm={false}
        disableClose={formBusy}
        maxWidth="sm"
        title={editData ? 'Edit Tax Range' : 'Add Tax Range'}
        titleInfo="Set the effective dates and salary range for a professional tax deduction."
      >
        <ProfessionalTaxForm
          handleClose={handleClose}
          editData={editData}
          onBusyChange={setFormBusy}
        />
      </CustomDialog>
    </Box>
  );
};

export default ProfessionalTax;

const ProfessionalTaxForm = ({
  handleClose,
  editData,
  onBusyChange,
}: {
  editData: IProfessionalTaxRange | null;
  handleClose: () => void;
  onBusyChange: (busy: boolean) => void;
}) => {
  const [formError, setFormError] = useState('');
  const [addPf, { isLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddProfessionalTaxMutation,
    popupConfig: {
      success: true,
      successMessage: 'Professional Tax created successfully',
    },
  });
  const [updatePF, { isLoading: isUpdatePFLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateProfessionalTaxMutation,
    popupConfig: {
      success: true,
      successMessage: 'Professional Tax updated successfully',
    },
  });
  const busy = isLoading || isUpdatePFLoading;
  useEffect(() => {
    onBusyChange(busy);
    return () => onBusyChange(false);
  }, [busy, onBusyChange]);
  const formik = useFormik({
    initialValues: {
      jurisdictionCode: editData?.jurisdictionCode || 'IN-GJ',
      effectiveFrom: editData?.effectiveFrom?.slice(0, 10) || '2022-04-01',
      effectiveTo: editData?.effectiveTo?.slice(0, 10) || '',
      fromSalary: editData?.fromSalary?.toString() ?? '',
      toSalary: editData?.toSalary?.toString() ?? '',
      taxAmount: editData?.taxAmount?.toString() ?? '',
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
      setFormError('');
      try {
        if (editData) {
          await updatePF({
            id: editData.id,
            body: {
              jurisdictionCode: values.jurisdictionCode,
              effectiveFrom: values.effectiveFrom,
              effectiveTo: values.effectiveTo || null,
              fromSalary: Number(values.fromSalary),
              toSalary: values.toSalary ? Number(values.toSalary) : null,
              taxAmount: Number(values.taxAmount),
              isActive: values.isActive,
              deductInCessationMonth: values.deductInCessationMonth,
            },
          }).unwrap();
        } else {
          await addPf({
            jurisdictionCode: values.jurisdictionCode,
            effectiveFrom: values.effectiveFrom,
            effectiveTo: values.effectiveTo || null,
            fromSalary: Number(values.fromSalary),
            toSalary: values.toSalary ? Number(values.toSalary) : null,
            taxAmount: Number(values.taxAmount),
            isActive: values.isActive,
            deductInCessationMonth: values.deductInCessationMonth,
          }).unwrap();
        }
        handleClose();
      } catch (error) {
        setFormError(parseApiProblemDetail(error).detail);
      }
    },
  });

  return (
    <Box component="form" noValidate onSubmit={formik.handleSubmit}>
      <DialogScrollContent>
        {formError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {formError}
          </Alert>
        )}
        <Box
          component="fieldset"
          disabled={busy}
          inert={busy || undefined}
          aria-busy={busy}
          sx={{ border: 0, p: 0, m: 0, minWidth: 0 }}
        >
          <FormSectionCard
            title="Tax Range Details"
            icon={GlobalIcons.receiptIcon}
            descriptionTooltip="Define the effective period, salary limits, and tax amount. An empty upper salary limit means there is no maximum."
          >
            <Grid container spacing={2}>
              <Grid size={12}>
                <TextField
                  fullWidth
                  size="small"
                  label="Jurisdiction"
                  value={formik.values.jurisdictionCode}
                  disabled
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <ShakingTextField
                  error={Boolean(formik.touched.effectiveFrom && formik.errors.effectiveFrom)}
                >
                  <TextField
                    fullWidth
                    size="small"
                    type="date"
                    label="Effective from"
                    required
                    {...formik.getFieldProps('effectiveFrom')}
                    InputLabelProps={{ shrink: true }}
                    error={Boolean(formik.touched.effectiveFrom && formik.errors.effectiveFrom)}
                    helperText={formik.touched.effectiveFrom && formik.errors.effectiveFrom}
                  />
                </ShakingTextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  size="small"
                  type="date"
                  label="Effective to"
                  {...formik.getFieldProps('effectiveTo')}
                  InputLabelProps={{ shrink: true }}
                  helperText="Optional"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <ShakingTextField
                  error={Boolean(formik.touched.fromSalary && formik.errors.fromSalary)}
                >
                  <NumericFormatCustom
                    valueIsNumericString
                    roundToWholeRupees={false}
                    decimalScale={2}
                    fullWidth
                    size="small"
                    label="From salary"
                    required
                    name="fromSalary"
                    value={formik.values.fromSalary}
                    onBlur={formik.handleBlur}
                    onValueChange={({ value }, { source }) => {
                      if (source === 'event') formik.setFieldValue('fromSalary', value);
                    }}
                    error={Boolean(formik.touched.fromSalary && formik.errors.fromSalary)}
                    helperText={formik.touched.fromSalary && formik.errors.fromSalary}
                  />
                </ShakingTextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <NumericFormatCustom
                  valueIsNumericString
                  roundToWholeRupees={false}
                  decimalScale={2}
                  fullWidth
                  size="small"
                  label="To salary"
                  name="toSalary"
                  value={formik.values.toSalary}
                  onBlur={formik.handleBlur}
                  onValueChange={({ value }, { source }) => {
                    if (source === 'event') formik.setFieldValue('toSalary', value);
                  }}
                  error={Boolean(formik.touched.toSalary && formik.errors.toSalary)}
                  helperText={(formik.touched.toSalary && formik.errors.toSalary) || 'Optional'}
                />
              </Grid>
              <Grid size={12}>
                <ShakingTextField
                  error={Boolean(formik.touched.taxAmount && formik.errors.taxAmount)}
                >
                  <NumericFormatCustom
                    valueIsNumericString
                    roundToWholeRupees={false}
                    decimalScale={2}
                    fullWidth
                    size="small"
                    label="Tax amount"
                    required
                    name="taxAmount"
                    value={formik.values.taxAmount}
                    onBlur={formik.handleBlur}
                    onValueChange={({ value }, { source }) => {
                      if (source === 'event') formik.setFieldValue('taxAmount', value);
                    }}
                    error={Boolean(formik.touched.taxAmount && formik.errors.taxAmount)}
                    helperText={formik.touched.taxAmount && formik.errors.taxAmount}
                  />
                </ShakingTextField>
              </Grid>
              <Grid size={12}>
                <Stack spacing={1}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formik.values.isActive}
                        onChange={(_, checked) => formik.setFieldValue('isActive', checked)}
                      />
                    }
                    label="Active rule"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formik.values.deductInCessationMonth}
                        onChange={(_, checked) =>
                          formik.setFieldValue('deductInCessationMonth', checked)
                        }
                      />
                    }
                    label="Deduct in employment cessation month"
                  />
                </Stack>
              </Grid>
            </Grid>
          </FormSectionCard>
        </Box>
      </DialogScrollContent>
      <DialogActions>
        <Button
          size="small"
          variant="outlined"
          disabled={busy}
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
          onClick={handleClose}
        >
          Cancel
        </Button>
        <LoadingButton
          size="small"
          startIcon={<Iconify icon={GlobalIcons.submit} />}
          loading={isLoading || isUpdatePFLoading}
          variant="contained"
          type="submit"
        >
          Submit
        </LoadingButton>
      </DialogActions>
    </Box>
  );
};
