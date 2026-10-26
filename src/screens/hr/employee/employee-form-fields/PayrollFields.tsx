import { Add, Today } from '@mui/icons-material';
import { useBoolean } from 'src/hooks/use-boolean';
import { formatCurrency } from 'src/utils/cureencyFormater';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import NumericFormatCustom from 'src/components/custom-numeric-format';
import { Box, Chip, Paper, Button, Divider, Typography } from '@mui/material';

import PayrollComponentDialog from './PayrollComponentDialog';
import PayrollTempComponentDialog from './PayrollTempComponentDialog';
import { PayrollProfileWorkspace } from '../payroll-profile-workspace';
import {
  isSalaryComponentFixed,
  formatApplicableMonthLabel,
  isPercentageSalaryComponent,
} from '../salary-utils';

import type { FieldsType } from './types';

export const RenderComponents = ({
  formik,
  name,
  label,
  type,
  showTempAdd = false,
  temporaryOnly = false,
  emptyMessage,
  emptyActionLabel,
}: any) => {
  const { values } = formik;
  const allComponents = values[name] || [];
  const components = temporaryOnly
    ? allComponents.filter((component: any) => component.isTemp)
    : allComponents;
  const isDialogOpen = useBoolean();
  const isAddingTemp = useBoolean(false);
  const markGeneratedModified = () => {
    if (values.sourceSalaryTemplateVersionId) {
      formik.setFieldValue('wasModifiedAfterGeneration', true, false);
    }
  };

  const handleAdd = (selectedComponents: any[]) => {
    // Preserve existing temp components so they are not lost when adding from dropdown
    const tempComponents = components.filter((c: any) => !!c?.isTemp);
    const normalized = selectedComponents.map((c: any) => {
      const cComponentId = c._id || c.componentId || c.id;
      const existing = components.find((ex: any) => (ex.componentId || ex.id) === cComponentId);
      return {
        ...c,
        id: existing?.id ?? null,
        componentId: cComponentId,
        amount: existing?.amount ?? (isPercentageSalaryComponent(c) ? null : (c.amount ?? 0)),
        applicableMonth: existing?.applicableMonth ?? null,
      };
    });
    formik.setFieldValue(name, [...tempComponents, ...normalized]);
    markGeneratedModified();
    if (isAddingTemp.value) {
      isAddingTemp.onFalse();
    }
  };

  const handleAddTemp = (selectedValues: any) => {
    const updatedComponents = [...allComponents, selectedValues];
    formik.setFieldValue(name, updatedComponents);
    markGeneratedModified();
    isAddingTemp.onFalse();
  };

  const handleRemove = (index: number) => {
    const updatedComponents = allComponents.filter((_: any, i: number) => i !== index);
    formik.setFieldValue(name, updatedComponents);
    markGeneratedModified();
  };

  // Build table rows and attach original index for edit/delete.
  const tableRows = components.map((c: any) => ({
    _idx: allComponents.indexOf(c),
    _raw: c,
    name: c?.earningComponentName || c?.deductionComponentName || c?.name || '-',
    amount: c?.amount ?? 0,
    percentage: c?.percentage ?? null,
    isFixed: isSalaryComponentFixed(c),
    isPercentage: isPercentageSalaryComponent(c),
    isTemp: !!c?.isTemp,
    isGeneratedOverride: c?.usesMasterValue === false && !c?.isTemp,
    applicableMonth: c?.applicableMonth,
    isStatutory: ['EMPLOYEEPROVIDENTFUND', 'PROFESSIONALTAX'].includes(
      String(c?.semanticType || '')
        .replaceAll('_', '')
        .toUpperCase()
    ),
  }));

  const componentAccentColor = type === 'earning' ? 'primary' : 'error';
  const addActionLabel = emptyActionLabel || (type === 'earning' ? 'Add Earning' : 'Add Deduction');

  return (
    <Paper
      elevation={0}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        mt: 1,
        border: (theme) => `1px solid ${theme.vars.palette.divider}`,
        borderRadius: 1,
        overflow: 'hidden',
      }}
    >
      {/* Accent strip */}
      <Box
        sx={{
          height: '4px',
          background: (theme) =>
            type === 'earning' ? theme.vars.palette.primary.main : theme.vars.palette.error.main,
        }}
      />

      {/* Header */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        px={2}
        py={1.5}
        sx={{ bgcolor: (theme) => theme.vars.palette.background.neutral }}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <Box
            sx={{
              width: 4,
              height: 22,
              borderRadius: 1,
              bgcolor: `${componentAccentColor}.main`,
              flexShrink: 0,
            }}
          />
          <Typography variant="subtitle1" fontWeight={700}>
            {label}
          </Typography>
          <Chip
            label={components.length}
            size="small"
            color={componentAccentColor}
            variant="soft"
            sx={{ height: 20, fontSize: '0.7rem', fontWeight: 700, ml: 0.5 }}
          />
        </Box>

        <Box display="flex" alignItems="center" gap={1}>
          {showTempAdd && (
            <Button
              variant="soft"
              color="warning"
              startIcon={<Add />}
              size="small"
              onClick={() => {
                isAddingTemp.onTrue();
                isDialogOpen.onFalse();
              }}
            >
              Temp {type === 'earning' ? 'Earning' : 'Deduction'}
            </Button>
          )}
          {!temporaryOnly && (
            <Button
              variant="soft"
              color={componentAccentColor}
              startIcon={<Add />}
              onClick={() => {
                isAddingTemp.onFalse();
                isDialogOpen.onTrue();
              }}
              size="small"
            >
              {type === 'earning' ? 'Earning' : 'Deduction'}
            </Button>
          )}
        </Box>
      </Box>

      <Divider />

      {/* Table */}
      <Box px={1.5} pb={1.5} pt={1} sx={{ flex: 1 }}>
        <CustomizableTable
          variant="embedded"
          showColumns
          showExport={false}
          showFullScreen
          exportScope="all"
          tableId={`${name}-components-table`}
          tableTitle={`${name} components`}
          isFilter={false}
          isPagination={false}
          isSearch={false}
          isShowedDense={false}
          data={tableRows}
          noDataText={
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              gap={1}
              py={2}
            >
              <Typography variant="body2" color="text.secondary" fontWeight={600}>
                {emptyMessage || `No ${type} components added`}
              </Typography>
              <Button
                variant="soft"
                color={componentAccentColor}
                startIcon={<Add />}
                size="small"
                onClick={() => {
                  if (temporaryOnly) {
                    isAddingTemp.onTrue();
                  } else {
                    isAddingTemp.onFalse();
                    isDialogOpen.onTrue();
                  }
                }}
              >
                {addActionLabel}
              </Button>
            </Box>
          }
          columns={[
            {
              id: 'name',
              label: 'Component',
              render(value: any, row: any) {
                return (
                  <Box display="flex" flexDirection="column" gap={1} py={0.5}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Box
                        sx={{
                          width: 3,
                          height: 16,
                          borderRadius: 0.5,
                          bgcolor: row.isTemp ? 'warning.main' : 'text.disabled',
                          flexShrink: 0,
                        }}
                      />
                      <Typography variant="body2" fontWeight={600} lineHeight={1.3}>
                        {value}
                      </Typography>
                      {row.isTemp && (
                        <Chip
                          label="Temp"
                          size="small"
                          color="warning"
                          variant="soft"
                          sx={{ height: 18, fontSize: '10px', fontWeight: 700 }}
                        />
                      )}
                      {row.isPercentage && (
                        <Chip
                          label="%"
                          size="small"
                          color="info"
                          variant="soft"
                          sx={{ height: 18, fontSize: '10px', fontWeight: 700 }}
                        />
                      )}
                      {row.isFixed && !row.isPercentage && (
                        <Chip
                          label="Fixed"
                          size="small"
                          color="default"
                          variant="soft"
                          sx={{ height: 18, fontSize: '10px', fontWeight: 600 }}
                        />
                      )}
                      {row.isStatutory && (
                        <Chip
                          label="Rule controlled"
                          size="small"
                          color="secondary"
                          variant="soft"
                          sx={{ height: 18, fontSize: '10px', fontWeight: 700 }}
                        />
                      )}
                    </Box>
                    {row.applicableMonth && (
                      <Typography
                        variant="caption"
                        sx={{
                          bgcolor: 'background.neutral',
                          px: 1,
                          py: 0.25,
                          borderRadius: 1,
                          color: 'text.secondary',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 0.5,
                          width: 'fit-content',
                          ml: 2,
                        }}
                      >
                        <Today sx={{ fontSize: 14 }} />
                        {formatApplicableMonthLabel(row.applicableMonth)}
                      </Typography>
                    )}
                  </Box>
                );
              },
            },
            {
              id: 'amount',
              label: 'Amount / %',
              filterType: 'number',
              filterValue: (_value, row) => (row.isPercentage ? row.percentage : row.amount),
              sortValue: (_value, row) =>
                Number(row.isPercentage ? row.percentage : row.amount) || 0,
              render(value: any, row: any) {
                if (row.isPercentage) {
                  return (
                    <Chip
                      label={row.percentage != null ? `${row.percentage}%` : '-'}
                      size="small"
                      color="info"
                      variant="soft"
                      sx={{ fontWeight: 600, fontSize: '0.78rem' }}
                    />
                  );
                }
                if ((row.isFixed && !row.isGeneratedOverride) || row.isStatutory) {
                  return (
                    <Typography variant="body2" fontWeight={600} color="text.primary">
                      {formatCurrency(value)}
                    </Typography>
                  );
                }
                return (
                  <NumericFormatCustom
                    size="small"
                    variant="outlined"
                    label=""
                    name={`${name}.${row._idx}.amount`}
                    value={value ?? 0}
                    onChange={(e: any) => {
                      let val = e.target.value;
                      val = val.replace(/[₹,\s]/g, '');
                      if (!/^\d*$/.test(val)) return;
                      formik.setFieldValue(
                        `${name}.${row._idx}.amount`,
                        val !== '' ? Number(val) : 0
                      );
                      formik.setFieldTouched(`${name}.${row._idx}.amount`, true, false);
                      markGeneratedModified();
                    }}
                    sx={{
                      width: 120,
                      '& .MuiOutlinedInput-root': { fontSize: '0.85rem' },
                    }}
                  />
                );
              },
            },
            {
              id: 'actions',
              label: '',
              isSort: false,
              isFilter: false,
              sticky: true,
              stickyPosition: 'right' as const,
              minWidth: '56px',
              render(_value: any, row: any) {
                return (
                  <ThreeDotsActions
                    showThreeDots={false}
                    showDeleteIcon={!row.isStatutory}
                    handleDeleteClick={() => handleRemove(row._idx)}
                  />
                );
              },
            },
          ]}
        />
      </Box>

      {!temporaryOnly && isDialogOpen.value && (
        <PayrollComponentDialog
          open={isDialogOpen.value}
          onClose={isDialogOpen.onFalse}
          type={type}
          onAdd={handleAdd}
          values={components}
        />
      )}
      {isAddingTemp.value && (
        <PayrollTempComponentDialog
          open={isAddingTemp.value}
          onClose={isAddingTemp.onFalse}
          type={type}
          onAdd={handleAddTemp}
          initialValues={components}
        />
      )}
    </Paper>
  );
};

export const PayrollFields: FieldsType[] = [
  {
    type: 'text',
    label: 'Payroll',
    name: 'payrollProfile',
    gridProps: { size: { xs: 12, md: 12 } },
    renderComp({ formik, editData }) {
      return (
        <PayrollProfileWorkspace
          key={formik.values.employeeId || editData?.id}
          employeeId={formik.values.employeeId || editData?.id || ''}
          employeeName={
            [formik.values.firstName, formik.values.middleName, formik.values.lastName]
              .filter(Boolean)
              .join(' ') || 'Staff'
          }
        />
      );
    },
  },
];
