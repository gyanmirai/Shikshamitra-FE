import type { RootState } from 'src/redux/store';

import dayjs from 'dayjs';
import { useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { setNestedObjectValues } from 'formik';
import { DatePicker } from '@mui/x-date-pickers';
import { useBoolean } from 'src/hooks/use-boolean';
import { formatCurrency } from 'src/utils/cureencyFormater';
import { useGetLeavePoliciesQuery } from 'src/redux/hr/leaveApi';
import ThreeDotsActions from 'src/components/three-dots-actions';
import ShakingTextField from 'src/components/shaking-text-field';
import CustomizableTable from 'src/components/customizabaleTable';
import NumericFormatCustom from 'src/components/custom-numeric-format';
import { Add, Today, Payments, FactCheck, EventAvailable } from '@mui/icons-material';
import {
  useGetPayrollPoliciesQuery,
  useGetAttendancePoliciesQuery,
  useGetPolicyAssignmentPreviewQuery,
} from 'src/redux/hr/hr-policy-api';
import {
  Box,
  Grid,
  Chip,
  Paper,
  Alert,
  Select,
  Button,
  Switch,
  Divider,
  MenuItem,
  TextField,
  Typography,
  InputLabel,
  FormControl,
  FormHelperText,
  FormControlLabel,
} from '@mui/material';

import { RenderPfRules } from './RenderPfRules';
import PayrollComponentDialog from './PayrollComponentDialog';
import { CardActions, SectionCard } from './InformationFields';
import PayrollTempComponentDialog from './PayrollTempComponentDialog';
import { SalaryStructureBuilder } from '../../payroll/structure/SalaryStructureBuilder';
import {
  isSalaryComponentFixed,
  formatApplicableMonthLabel,
  isPercentageSalaryComponent,
} from '../salary-utils';
import {
  resolveEmployeePolicyPreviewDate,
  clearEmployeePolicyOverrideValues,
  hydrateEmployeePolicyOverrideFromPreview,
} from '../employee-policy-override-utils';

import type { FieldsType } from './types';

const getComponentAmount = (item: any) =>
  isPercentageSalaryComponent(item) ? 0 : Number(item?.amount ?? 0);

const getComponentTotal = (items: any[] = []) =>
  items.reduce((total, item) => total + getComponentAmount(item), 0);

const getLeavePolicyName = (item: any) => item?.policyTitle || item?.name || item?.title || '-';
const isActiveLeavePolicy = (item: any) =>
  String(item?.status || '').toLowerCase() === 'active' || item?.isActive === true;

const FieldGroupHeader = ({ title }: { title: string }) => (
  <Grid size={{ xs: 12 }}>
    <Typography variant="overline" color="text.secondary" fontWeight={700}>
      {title}
    </Typography>
  </Grid>
);

const ifscHelperTextSx = {
  mx: '14px',
  mt: 0.75,
  lineHeight: 1.25,
  whiteSpace: 'normal',
  overflowWrap: 'anywhere',
};

const SalarySummaryCard = ({
  label,
  value,
  emphasis = false,
}: {
  label: string;
  value: number;
  emphasis?: boolean;
}) => (
  <Grid size={{ xs: 12, md: 4 }}>
    <Paper
      elevation={0}
      sx={{
        p: 1.5,
        borderRadius: 1,
        border: (theme) => `1px solid ${theme.vars.palette.divider}`,
        borderTop: (theme) =>
          `3px solid ${emphasis ? theme.vars.palette.primary.main : theme.vars.palette.text.disabled
          }`,
        bgcolor: (theme) => theme.vars.palette.background.paper,
      }}
    >
      <Typography variant="caption" color="text.secondary" fontWeight={600}>
        {label}
      </Typography>
      <Typography variant="h6" fontWeight={800} color={emphasis ? 'primary.main' : 'text.primary'}>
        {formatCurrency(value)}
      </Typography>
    </Paper>
  </Grid>
);

export const RenderComponents = ({
  formik,
  name,
  label,
  type,
  showTempAdd = false,
  emptyMessage,
  emptyActionLabel,
}: any) => {
  const { values } = formik;
  const components = values[name] || [];
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
    const updatedComponents = [...components, selectedValues];
    formik.setFieldValue(name, updatedComponents);
    markGeneratedModified();
    isAddingTemp.onFalse();
  };

  const handleRemove = (index: number) => {
    const updatedComponents = components.filter((_: any, i: number) => i !== index);
    formik.setFieldValue(name, updatedComponents);
    markGeneratedModified();
  };

  // Build table rows and attach original index for edit/delete.
  const tableRows = components.map((c: any, idx: number) => ({
    _idx: idx,
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
      String(c?.semanticType || '').replaceAll('_', '').toUpperCase()
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
        </Box>
      </Box>

      <Divider />

      {/* Table */}
      <Box px={1.5} pb={1.5} pt={1} sx={{ flex: 1 }}>
        <CustomizableTable
          tableId={`${name}-components-table`}
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
                  isAddingTemp.onFalse();
                  isDialogOpen.onTrue();
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

      {isDialogOpen.value && (
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

const RenderPayrollFields = (props: any) => {
  const { formik, isMainForm } = props;
  const { values, handleChange } = formik;
  const hasHydratedRef = useRef(false);
  useEffect(() => {
    hasHydratedRef.current = false;
  }, [values.employeeId]);

  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const isEditable = useBoolean(isMainForm);
  const policyEffectiveFallbackDate = values.dateOfJoining
    ? dayjs(values.dateOfJoining).format('YYYY-MM-DD')
    : dayjs().format('YYYY-MM-DD');
  const policyEffectiveDate = resolveEmployeePolicyPreviewDate(values, policyEffectiveFallbackDate);
  const { data: policyPreview, isFetching: isPreviewLoading } = useGetPolicyAssignmentPreviewQuery(
    {
      academicYearId: currentYear?.id,
      date: policyEffectiveDate,
      employeeId: values.employeeId || undefined,
    },
    {
      skip: !currentYear?.id || !policyEffectiveDate || !values.employeeId,
    }
  );
  const { data: payrollPolicies } = useGetPayrollPoliciesQuery(
    { academicYearId: currentYear?.id, maxResultCount: 100 },
    { skip: !currentYear?.id }
  );
  const { data: attendancePolicies } = useGetAttendancePoliciesQuery(
    { academicYearId: currentYear?.id, maxResultCount: 100 },
    { skip: !currentYear?.id }
  );
  const { data: leavePolicies } = useGetLeavePoliciesQuery(
    { academicYearId: currentYear?.id, page: 1, pageSize: 100 },
    { skip: !currentYear?.id }
  );
  const activePayrollPolicies = (payrollPolicies?.items || []).filter(
    (item) => item.status === 'active'
  );
  const activeAttendancePolicies = (attendancePolicies?.items || []).filter(
    (item) => item.status === 'active'
  );
  const activeLeavePolicies = (leavePolicies?.items || []).filter(isActiveLeavePolicy);
  const grossEarnings = getComponentTotal(values.earningComponents || []);
  const totalDeductions = getComponentTotal(values.deductionComponents || []);
  const netSalary = grossEarnings - totalDeductions;
  const policySourceLabel = isPreviewLoading
    ? 'Resolving...'
    : policyPreview?.policySource === 'employee'
      ? 'Employee override'
      : policyPreview?.policySource || 'Default policy';
  const organizationPolicyEnabled = !values.policyOverrideEnabled;
  const policyStatusLabel = organizationPolicyEnabled
    ? 'Following Organization Policies'
    : 'Custom Employee Override Applied';
  const policySourceDetail =
    policyPreview?.matchedTargetDisplayName ||
    policyPreview?.matchedTargetKey ||
    policyPreview?.policySource ||
    'No source resolved yet';
  const policySourcePriority =
    policyPreview?.matchedPriority != null ? `Priority ${policyPreview.matchedPriority}` : null;
  const policySummaryItems = [
    {
      icon: <Payments fontSize="small" />,
      label: 'Payroll Policy',
      value: policyPreview?.payrollPolicy?.name,
    },
    {
      icon: <FactCheck fontSize="small" />,
      label: 'Attendance Policy',
      value: policyPreview?.attendancePolicy?.name,
    },
    {
      icon: <Today fontSize="small" />,
      label: 'Leave Policy',
      value: getLeavePolicyName(policyPreview?.leavePolicy),
    },
    {
      icon: <Today fontSize="small" />,
      label: 'Payroll Calendar',
      value: policyPreview?.payrollWorkCalendarPolicy?.name,
    },
    {
      icon: <EventAvailable fontSize="small" />,
      label: 'Attendance Calendar',
      value: policyPreview?.attendanceWorkCalendarPolicy?.name,
    },
  ];
  const defaultPolicyOverrideEffectiveFrom = policyEffectiveDate || dayjs().format('YYYY-MM-DD');
  const overrideTouchedFields = [
    'policyOverridePayrollPolicyId',
    'policyOverrideAttendancePolicyId',
    'policyOverrideLeavePolicyId',
    'policyOverrideEffectiveFrom',
    'policyOverrideAssignmentReason',
  ];
  const handlePolicyOverrideToggle = (isEnabled: boolean) => {
    formik.setFieldTouched('policyOverrideEnabled', true, false);

    if (isEnabled) {
      formik.setFieldValue('policyOverrideEnabled', true);
      formik.setFieldValue(
        'policyOverrideEffectiveFrom',
        values.policyOverrideEffectiveFrom || defaultPolicyOverrideEffectiveFrom
      );
      overrideTouchedFields.forEach((field) => formik.setFieldTouched(field, false, false));
      return;
    }

    const clearedOverride = clearEmployeePolicyOverrideValues(values);
    Object.entries(clearedOverride).forEach(([field, value]) => {
      formik.setFieldValue(field, value, false);
    });
    overrideTouchedFields.forEach((field) => formik.setFieldTouched(field, false, false));
  };
  useEffect(() => {
    if (!policyPreview) {
      return;
    }

    if (formik.touched.policyOverrideEnabled) {
      if (values.policyOverrideWasEnabled) {
        const hydrated = hydrateEmployeePolicyOverrideFromPreview(
          policyPreview,
          policyEffectiveDate
        );
        const retainedFields = [
          'policyOverrideAssignmentId',
          'policyOverridePayrollPolicyId',
          'policyOverrideAttendancePolicyId',
          'policyOverrideLeavePolicyId',
          'policyOverrideEffectiveFrom',
        ] as const;
        retainedFields.forEach((field) => {
          if (!formik.values[field] && hydrated[field]) {
            formik.setFieldValue(field, hydrated[field], false);
          }
        });
      }
      return;
    }

    if (!hasHydratedRef.current) {
      const hydrated = hydrateEmployeePolicyOverrideFromPreview(policyPreview, policyEffectiveDate);
      Object.entries(hydrated).forEach(([key, value]) => {
        formik.setFieldValue(key, value, false);
      });
      hasHydratedRef.current = true;
    }
  }, [
    formik,
    policyEffectiveDate,
    policyPreview,
    values.policyOverrideAssignmentId,
    values.policyOverrideEnabled,
    values.policyOverrideWasEnabled,
  ]);

  const handleSave = async (): Promise<void | false | undefined> => {
    const validation = await formik.validateForm();
    if (Object.keys(validation).length > 0) {
      formik.setTouched(setNestedObjectValues(validation, true));
      return false;
    }
    await formik?.submitForm?.();
    formik.resetForm({ values: formik.values });
    return undefined;
  };
  const handleCancel = () => {
    formik.resetForm();
  };
  return (
    <Box>
      {!isMainForm && (
        <Box display="flex" justifyContent="flex-end" p={1}>
          <CardActions
            isLoading={formik.isSubmitting}
            isEdit={isEditable}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        </Box>
      )}
      <SectionCard title="Payroll Details">
        <Grid size={{ xs: 12 }}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 1.25, md: 1.5 },
              border: (theme) => `1px solid ${theme.vars.palette.divider}`,
              borderRadius: 1,
              bgcolor: (theme) => theme.vars.palette.background.paper,
            }}
          >
            <Box
              sx={{
                mb: 1.25,
                px: 1.5,
                py: 1,
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                border: (theme) => `1px solid ${theme.vars.palette.divider}`,
                bgcolor: (theme) => theme.vars.palette.background.paper,
              }}
            >
              <Typography variant="body2" color="text.primary" fontWeight={700}>
                {policyStatusLabel}
              </Typography>
            </Box>
            <Box
              display="flex"
              alignItems={{ xs: 'flex-start', sm: 'center' }}
              justifyContent="space-between"
              gap={1}
              flexDirection={{ xs: 'column', sm: 'row' }}
            >
              <Box>
                <Typography variant="subtitle2" fontWeight={700}>
                  Policy Assignment
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {policySourceDetail}
                  {policySourcePriority ? ` - ${policySourcePriority}` : ''}
                </Typography>
              </Box>
              <Box display="flex" gap={1} flexWrap="wrap">
                <Chip size="small" color="default" variant="outlined" label={policySourceLabel} />
              </Box>
            </Box>
            <Grid container spacing={1} sx={{ mt: 1.25 }}>
              {policySummaryItems.map((item) => (
                <Grid key={item.label} size={{ xs: 12, sm: 6, md: 3 }}>
                  <Box
                    display="flex"
                    gap={1}
                    sx={{
                      height: '100%',
                      p: 1.1,
                      borderRadius: 1,
                      border: (theme) => `1px solid ${theme.vars.palette.divider}`,
                      bgcolor: (theme) => theme.vars.palette.background.neutral,
                    }}
                  >
                    <Box
                      sx={{
                        width: 28,
                        height: 28,
                        display: 'grid',
                        placeItems: 'center',
                        borderRadius: 1,
                        bgcolor: (theme) => theme.vars.palette.background.paper,
                        border: (theme) => `1px solid ${theme.vars.palette.divider}`,
                        flexShrink: 0,
                      }}
                    >
                      <Typography component="span" aria-hidden sx={{ display: 'inline-flex' }}>
                        {item.icon}
                      </Typography>
                    </Box>
                    <Box minWidth={0}>
                      <Typography variant="caption" color="text.secondary">
                        {item.label}
                      </Typography>
                      <Typography variant="body2" fontWeight={700} sx={{ mt: 0.1 }}>
                        {item.value || '-'}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>
            {!policyPreview && !isPreviewLoading ? (
              <Alert severity="info" sx={{ mt: 1.5 }}>
                Select employee scope fields and joining date to preview effective policies.
              </Alert>
            ) : null}
            <Divider sx={{ my: 1.25 }} />
            <Box
              display="flex"
              alignItems={{ xs: 'flex-start', sm: 'center' }}
              justifyContent="space-between"
              gap={1}
              flexDirection={{ xs: 'column', sm: 'row' }}
            >
              <Box>
                <Typography variant="subtitle2" fontWeight={700}>
                  Employee Override
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {organizationPolicyEnabled
                    ? 'Using the resolved organization policy chain.'
                    : 'Select employee-specific payroll, attendance, and leave policies.'}
                </Typography>
              </Box>
              <FormControlLabel
                sx={{ m: 0 }}
                control={
                  <Switch
                    checked={organizationPolicyEnabled}
                    disabled={!isEditable.value}
                    onChange={(event) => handlePolicyOverrideToggle(!event.target.checked)}
                  />
                }
                label="Use Organization Policies"
              />
            </Box>
            {values.policyOverrideEnabled ? (
              <Box
                sx={{
                  mt: 1.5,
                  p: 1.5,
                  borderRadius: 1,
                  border: (theme) => `1px solid ${theme.vars.palette.divider}`,
                  bgcolor: (theme) => theme.vars.palette.background.neutral,
                }}
              >
                <Grid container spacing={1.5}>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Payroll Policy *</InputLabel>
                      <Select
                        label="Payroll Policy *"
                        value={values.policyOverridePayrollPolicyId || ''}
                        disabled={!isEditable.value || activePayrollPolicies.length === 0}
                        onChange={(event) =>
                          formik.setFieldValue('policyOverridePayrollPolicyId', event.target.value)
                        }
                        error={
                          Boolean(formik.touched.policyOverridePayrollPolicyId) &&
                          Boolean(formik.errors.policyOverridePayrollPolicyId)
                        }
                      >
                        {activePayrollPolicies.length === 0 ? (
                          <MenuItem value="" disabled>
                            No active payroll policies
                          </MenuItem>
                        ) : null}
                        {activePayrollPolicies.map((item) => (
                          <MenuItem key={item.id} value={item.id}>
                            {item.name}
                          </MenuItem>
                        ))}
                      </Select>
                      {formik.touched.policyOverridePayrollPolicyId &&
                        formik.errors.policyOverridePayrollPolicyId ? (
                        <FormHelperText error>
                          {formik.errors.policyOverridePayrollPolicyId}
                        </FormHelperText>
                      ) : activePayrollPolicies.length === 0 ? (
                        <FormHelperText>No active payroll policies are available.</FormHelperText>
                      ) : null}
                    </FormControl>
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Attendance Policy *</InputLabel>
                      <Select
                        label="Attendance Policy *"
                        value={values.policyOverrideAttendancePolicyId || ''}
                        disabled={!isEditable.value || activeAttendancePolicies.length === 0}
                        onChange={(event) =>
                          formik.setFieldValue(
                            'policyOverrideAttendancePolicyId',
                            event.target.value
                          )
                        }
                        error={
                          Boolean(formik.touched.policyOverrideAttendancePolicyId) &&
                          Boolean(formik.errors.policyOverrideAttendancePolicyId)
                        }
                      >
                        {activeAttendancePolicies.length === 0 ? (
                          <MenuItem value="" disabled>
                            No active attendance policies
                          </MenuItem>
                        ) : null}
                        {activeAttendancePolicies.map((item) => (
                          <MenuItem key={item.id} value={item.id}>
                            {item.name}
                          </MenuItem>
                        ))}
                      </Select>
                      {formik.touched.policyOverrideAttendancePolicyId &&
                        formik.errors.policyOverrideAttendancePolicyId ? (
                        <FormHelperText error>
                          {formik.errors.policyOverrideAttendancePolicyId}
                        </FormHelperText>
                      ) : activeAttendancePolicies.length === 0 ? (
                        <FormHelperText>
                          No active attendance policies are available.
                        </FormHelperText>
                      ) : null}
                    </FormControl>
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Leave Policy *</InputLabel>
                      <Select
                        label="Leave Policy *"
                        value={values.policyOverrideLeavePolicyId || ''}
                        disabled={!isEditable.value || activeLeavePolicies.length === 0}
                        onChange={(event) =>
                          formik.setFieldValue('policyOverrideLeavePolicyId', event.target.value)
                        }
                        error={
                          Boolean(formik.touched.policyOverrideLeavePolicyId) &&
                          Boolean(formik.errors.policyOverrideLeavePolicyId)
                        }
                      >
                        {activeLeavePolicies.length === 0 ? (
                          <MenuItem value="" disabled>
                            No active leave policies
                          </MenuItem>
                        ) : null}
                        {activeLeavePolicies.map((item: any) => (
                          <MenuItem key={item.id} value={item.id}>
                            {getLeavePolicyName(item)}
                          </MenuItem>
                        ))}
                      </Select>
                      {formik.touched.policyOverrideLeavePolicyId &&
                        formik.errors.policyOverrideLeavePolicyId ? (
                        <FormHelperText error>
                          {formik.errors.policyOverrideLeavePolicyId}
                        </FormHelperText>
                      ) : activeLeavePolicies.length === 0 ? (
                        <FormHelperText>No active leave policies are available.</FormHelperText>
                      ) : null}
                    </FormControl>
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <DatePicker
                      label="Effective From *"
                      value={
                        values.policyOverrideEffectiveFrom
                          ? dayjs(values.policyOverrideEffectiveFrom)
                          : null
                      }
                      onChange={(val) => {
                        const formatted = val && val.isValid() ? val.format('YYYY-MM-DD') : '';
                        formik.setFieldValue('policyOverrideEffectiveFrom', formatted);
                        formik.setFieldTouched('policyOverrideEffectiveFrom', true, false);
                      }}
                      format="DD/MM/YYYY"
                      slotProps={{
                        textField: {
                          size: 'small',
                          fullWidth: true,
                          disabled: !isEditable.value,
                          error:
                            Boolean(formik.touched.policyOverrideEffectiveFrom) &&
                            Boolean(formik.errors.policyOverrideEffectiveFrom),
                          helperText:
                            (formik.touched.policyOverrideEffectiveFrom &&
                              (formik.errors.policyOverrideEffectiveFrom as string)) ||
                            '',
                        },
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      size="small"
                      fullWidth
                      label="Assignment Reason"
                      disabled={!isEditable.value}
                      value={values.policyOverrideAssignmentReason || ''}
                      onChange={(event) =>
                        formik.setFieldValue('policyOverrideAssignmentReason', event.target.value)
                      }
                    />
                  </Grid>
                </Grid>
              </Box>
            ) : null}
          </Paper>
        </Grid>
        <FieldGroupHeader title="Bank Details" />
        <Grid size={{ xs: 12, sm: 4 }}>
          <ShakingTextField error={formik.touched.bankName && Boolean(formik.errors.bankName)}>
            <TextField
              size="small"
              fullWidth
              disabled={!isEditable.value}
              label="Bank Name *"
              name="bankName"
              value={values.bankName || ''}
              onChange={(e) => {
                const val = e.target.value;
                const newName = val ? val.charAt(0).toUpperCase() + val.slice(1) : '';
                if (/^[A-Za-z ]*$/.test(newName)) {
                  formik.setFieldValue('bankName', newName);
                }
              }}
              onBlur={(e) => {
                formik.setFieldValue('bankName', e.target.value.trim());
                formik.handleBlur(e);
              }}
              error={formik.touched.bankName && Boolean(formik.errors.bankName)}
              helperText={formik.touched.bankName && formik.errors.bankName}
            />
          </ShakingTextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <ShakingTextField error={formik.touched.branchName && Boolean(formik.errors.branchName)}>
            <TextField
              size="small"
              fullWidth
              disabled={!isEditable.value}
              label="Branch Name"
              name="branchName"
              value={values.branchName || ''}
              onChange={(e) => {
                const val = e.target.value;
                const newName = val ? val.charAt(0).toUpperCase() + val.slice(1) : '';
                if (/^[A-Za-z ]*$/.test(newName)) {
                  formik.setFieldValue('branchName', newName);
                }
              }}
              error={formik.touched.branchName && Boolean(formik.errors.branchName)}
              helperText={formik.touched.branchName && formik.errors.branchName}
            />
          </ShakingTextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <ShakingTextField
            error={formik.touched.accountHolderName && Boolean(formik.errors.accountHolderName)}
          >
            <TextField
              size="small"
              fullWidth
              disabled={!isEditable.value}
              label="Account Holder Name *"
              name="accountHolderName"
              value={values.accountHolderName || ''}
              onChange={(e) => {
                const val = e.target.value;
                const newName = val ? val.charAt(0).toUpperCase() + val.slice(1) : '';
                if (/^[A-Za-z ]*$/.test(newName)) {
                  formik.setFieldValue('accountHolderName', newName);
                }
              }}
              onBlur={(e) => {
                formik.setFieldValue('accountHolderName', e.target.value.trim());
                formik.handleBlur(e);
              }}
              error={formik.touched.accountHolderName && Boolean(formik.errors.accountHolderName)}
              helperText={formik.touched.accountHolderName && formik.errors.accountHolderName}
            />
          </ShakingTextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <ShakingTextField
            error={formik.touched.accountNumber && Boolean(formik.errors.accountNumber)}
          >
            <TextField
              size="small"
              fullWidth
              disabled={!isEditable.value}
              label="Account Number *"
              name="accountNumber"
              value={values.accountNumber || ''}
              onChange={(e) => {
                const { value } = e.target;
                if (value.length <= 18) {
                  formik.setFieldValue('accountNumber', value);
                }
              }}
              onBlur={(e) => {
                formik.setFieldValue('accountNumber', e.target.value.trim());
                formik.handleBlur(e);
              }}
              inputProps={{
                inputMode: 'numeric',
                pattern: '[0-9]*',
              }}
              error={formik.touched.accountNumber && Boolean(formik.errors.accountNumber)}
              helperText={formik.touched.accountNumber && formik.errors.accountNumber}
            />
          </ShakingTextField>
        </Grid>
        <Grid
          size={{ xs: 12, sm: 4 }}
          sx={{ pb: formik.touched.ifscCode && formik.errors.ifscCode ? 5 : 0 }}
        >
          <ShakingTextField error={formik.touched.ifscCode && Boolean(formik.errors.ifscCode)}>
            <TextField
              size="small"
              fullWidth
              disabled={!isEditable.value}
              label="IFSC Code *"
              name="ifscCode"
              value={values.ifscCode || ''}
              onChange={handleChange}
              onBlur={(e) => {
                formik.setFieldValue('ifscCode', e.target.value.trim());
                formik.handleBlur(e);
              }}
              error={formik.touched.ifscCode && Boolean(formik.errors.ifscCode)}
              helperText={formik.touched.ifscCode && formik.errors.ifscCode}
              FormHelperTextProps={{ sx: ifscHelperTextSx }}
            />
          </ShakingTextField>
        </Grid>
        <FieldGroupHeader title="Statutory Details" />
        <Grid size={{ xs: 12, sm: 4 }}>
          <RenderPfRules
            disabled={!isEditable.value}
            formik={formik}
          // value={values.pfRule || ''}
          // onChange={(e) => setFormValues({ ...formValues, pfRule: e.target?.value ?? e })}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <ShakingTextField error={formik.touched.epfNumber && Boolean(formik.errors.epfNumber)}>
            <TextField
              size="small"
              fullWidth
              disabled={!isEditable.value}
              label="PF Number"
              name="epfNumber"
              value={values.epfNumber || ''}
              onChange={handleChange}
              error={formik.touched.epfNumber && Boolean(formik.errors.epfNumber)}
              helperText={formik.touched.epfNumber && formik.errors.epfNumber}
            />
          </ShakingTextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <ShakingTextField error={formik.touched.uanNumber && Boolean(formik.errors.uanNumber)}>
            <TextField
              size="small"
              fullWidth
              disabled={!isEditable.value}
              label="UAN Number"
              name="uanNumber"
              value={values.uanNumber || ''}
              onChange={(e) => {
                const { value } = e.target;
                if (value.length <= 12) {
                  formik.handleChange(e);
                  formik.validateField('uanNumber');
                }
              }}
              error={formik.touched.uanNumber && Boolean(formik.errors.uanNumber)}
              helperText={formik.touched.uanNumber && formik.errors.uanNumber}
            />
          </ShakingTextField>
        </Grid>

        <FieldGroupHeader title="Attendance Integration" />
        <Grid size={{ xs: 12, sm: 4 }}>
          <ShakingTextField error={formik.touched.punchId && Boolean(formik.errors.punchId)}>
            <TextField
              size="small"
              fullWidth
              disabled={!isEditable.value}
              label="Punch ID"
              name="punchId"
              onBlur={(e) => {
                formik.setFieldValue('punchId', e.target.value.trim());
                formik.handleBlur(e);
              }}
              value={values.punchId || ''}
              onChange={handleChange}
              error={formik.touched.punchId && Boolean(formik.errors.punchId)}
              helperText={formik.touched.punchId && formik.errors.punchId}
            />
          </ShakingTextField>
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <ShakingTextField
            error={
              formik.touched.totalWorkingHourPerMonth &&
              Boolean(formik.errors.totalWorkingHourPerMonth)
            }
          >
            <TextField
              size="small"
              fullWidth
              disabled={!isEditable.value}
              label="Total Working Hours (Month)"
              name="totalWorkingHourPerMonth"
              type="number"
              value={values.totalWorkingHourPerMonth || ''}
              onChange={(e) => {
                const { value } = e.target;
                if (value.length <= 3) {
                  formik.handleChange(e);
                }
              }}
              inputProps={{
                min: 0,
              }}
              error={
                formik.touched.totalWorkingHourPerMonth &&
                Boolean(formik.errors.totalWorkingHourPerMonth)
              }
              helperText={
                (formik.touched.totalWorkingHourPerMonth &&
                  formik.errors.totalWorkingHourPerMonth) ||
                'Optional'
              }
            />
          </ShakingTextField>
        </Grid>
      </SectionCard>
      <SectionCard title="Compensation Structure">
        <SalaryStructureBuilder formik={formik} />
        <SalarySummaryCard label="Gross Earnings" value={grossEarnings} />
        <SalarySummaryCard label="Total Deductions" value={totalDeductions} />
        <SalarySummaryCard label="Net Salary" value={netSalary} emphasis />
        <Grid size={{ xs: 12, md: 6 }}>
          <RenderComponents
            formik={formik}
            name="earningComponents"
            label="Earnings"
            type="earning"
            emptyMessage="No earning components added"
            emptyActionLabel="Add Earning"
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <RenderComponents
            formik={formik}
            name="deductionComponents"
            label="Deductions"
            type="deduction"
            emptyMessage="No deduction components added"
            emptyActionLabel="Add Deduction"
          />
        </Grid>
      </SectionCard>
    </Box>
  );
};

export const PayrollFields: FieldsType[] = [
  {
    type: 'text',
    label: 'Bank Name',
    name: 'bankName',
    gridProps: { size: { xs: 12, md: 12 } },
    renderComp(props) {
      return <RenderPayrollFields {...props} />;
    },
  },
];
