import * as Yup from 'yup';
import { useFormik } from 'formik';
import React, { useState } from 'react';
import { LoadingButton } from '@mui/lab';
import { Add } from '@mui/icons-material';
import { Iconify } from 'src/components/iconify';
import { hrPaths } from 'src/constants/hr-menus';
import { useBoolean } from 'src/hooks/use-boolean';
import CustomDialog from 'src/components/customDialog';
import CustomTooltip from 'src/components/custom-tooltip';
import { formatCurrency } from 'src/utils/cureencyFormater';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import NumericFormatCustom from 'src/components/custom-numeric-format';
import { useHrTableQuery } from 'src/screens/hr/hooks/use-hr-table-query';
import { useHrTableExport } from 'src/screens/hr/hooks/use-hr-table-export';
import {
  SetupEditorBody,
  SetupEditorActions,
  useHrSetupEditorState,
} from 'src/screens/hr/setup/hr-setup-editor-context';
import {
  Box,
  Stack,
  Button,
  Switch,
  TextField,
  Typography,
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
    setEditData(null);
    dialog.onFalse();
  };

  const tableData = PFData?.items || [];
  return (
    <Box sx={{ height: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
      <CustomBreadcrumbs
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

export const ProfessionalTaxForm = ({
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

  useHrSetupEditorState({
    dirty: formik.dirty,
    busy: isLoading || isUpdatePFLoading || formik.isSubmitting,
    save: formik.submitForm,
  });

  return (
    <Box component="form" onSubmit={formik.handleSubmit}>
      <SetupEditorBody>
        <Stack spacing={2} sx={{ p: 2 }}>
          <TextField
            fullWidth
            size="small"
            label="Jurisdiction"
            value={formik.values.jurisdictionCode}
            disabled
          />
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
      </SetupEditorBody>
      <SetupEditorActions>
        <DialogActions>
          <Button
            size="small"
            variant="outlined"
            startIcon={<Iconify icon="mdi:close" />}
            onClick={handleClose}
          >
            Cancel
          </Button>
          <LoadingButton
            size="small"
            startIcon={<Iconify icon="mdi:content-save-outline" />}
            loading={isLoading || isUpdatePFLoading}
            variant="contained"
            type="submit"
          >
            Save
          </LoadingButton>
        </DialogActions>
      </SetupEditorActions>
    </Box>
  );
};
