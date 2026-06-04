import type { RootState } from 'src/redux/store';

import dayjs from 'dayjs';
import { Add } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { varAlpha } from 'src/theme/styles';
import { useBoolean } from 'src/hooks/use-boolean';
import { formatCurrency } from 'src/utils/cureencyFormater';
import ThreeDotsActions from 'src/components/three-dots-actions';
import ShakingTextField from 'src/components/shaking-text-field';
import CustomizableTable from 'src/components/customizabaleTable';
import NumericFormatCustom from 'src/components/custom-numeric-format';
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
import { isSalaryComponentFixed, isPercentageSalaryComponent } from '../salary-utils';

import type { FieldsType } from './types';

export const RenderComponents = ({ formik, name, label, type, showTempAdd = false }: any) => {
  const { values } = formik;
  const components = values[name] || [];
  const isDialogOpen = useBoolean();
  const isAddingTemp = useBoolean(false);

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
    if (isAddingTemp.value) {
      isAddingTemp.onFalse();
    }
  };

  const handleAddTemp = (selectedValues: any) => {
    const updatedComponents = [...components, selectedValues];
    formik.setFieldValue(name, updatedComponents);
    isAddingTemp.onFalse();
  };

  const handleRemove = (index: number) => {
    const updatedComponents = components.filter((_: any, i: number) => i !== index);
    formik.setFieldValue(name, updatedComponents);
  };

  // Build table rows — attach original index for edit/delete
  const tableRows = components.map((c: any, idx: number) => ({
    _idx: idx,
    _raw: c,
    name: c?.earningComponentName || c?.deductionComponentName || c?.name || '-',
    amount: c?.amount ?? 0,
    percentage: c?.percentage ?? null,
    isFixed: isSalaryComponentFixed(c),
    isPercentage: isPercentageSalaryComponent(c),
    isTemp: !!c?.isTemp,
    applicableMonth: c?.applicableMonth,
  }));

  const accentColor = type === 'earning' ? 'success' : 'error';

  return (
    <Paper
      elevation={0}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        mt: 1,
        border: (theme) => `1px solid ${theme.vars.palette.divider}`,
        borderRadius: 2,
        overflow: 'hidden',
      }}
    >
      {/* Accent strip */}
      <Box
        sx={{
          height: '4px',
          background: (theme) =>
            type === 'earning'
              ? `linear-gradient(90deg, ${theme.palette.success.main}, ${theme.palette.success.light})`
              : `linear-gradient(90deg, ${theme.palette.error.main}, ${theme.palette.error.light})`,
        }}
      />

      {/* Header */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        px={2}
        py={1.5}
        sx={{ bgcolor: (t) => varAlpha(t.vars.palette[accentColor].mainChannel, 0.04) }}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <Box
            sx={{
              width: 4,
              height: 22,
              borderRadius: 1,
              bgcolor: `${accentColor}.main`,
              flexShrink: 0,
            }}
          />
          <Typography variant="subtitle1" fontWeight={700}>
            {label}
          </Typography>
          <Chip
            label={components.length}
            size="small"
            color={accentColor}
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
            color={accentColor}
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
            <Typography variant="body2" color="text.secondary">
              No {type} components added yet. Click the button above to add.
            </Typography>
          }
          columns={[
            {
              id: 'name',
              label: 'Component',
              render(value: any, row: any) {
                return (
                  <Box display="flex" flexDirection="column" gap={0.5} py={0.5}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Box
                        sx={{
                          width: 3,
                          height: 16,
                          borderRadius: 0.5,
                          bgcolor: row.isTemp
                            ? 'warning.main'
                            : type === 'earning'
                              ? 'success.main'
                              : 'error.main',
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
                          display: 'inline-block',
                          width: 'fit-content',
                          ml: 2,
                        }}
                      >
                        📅 {dayjs(row.applicableMonth).format('MMM YYYY')}
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
                      label={row.percentage != null ? `${row.percentage}%` : '—'}
                      size="small"
                      color="info"
                      variant="soft"
                      sx={{ fontWeight: 600, fontSize: '0.78rem' }}
                    />
                  );
                }
                if (row.isFixed) {
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
                    showDeleteIcon
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
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const isEditable = useBoolean(isMainForm);
  const policyEffectiveDate = values.dateOfJoining?.format
    ? values.dateOfJoining.format('YYYY-MM-DD')
    : dayjs().format('YYYY-MM-DD');
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
  const activePayrollPolicies = (payrollPolicies?.items || []).filter(
    (item) => item.status === 'active'
  );
  const activeAttendancePolicies = (attendancePolicies?.items || []).filter(
    (item) => item.status === 'active'
  );

  const handleSave = async (): Promise<void | false | undefined> => {
    const validation = await formik.validateForm();
    await formik?.submitForm?.();
    if (Object.keys(validation).length > 0) return false;

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
              p: 1.5,
              border: (theme) => `1px solid ${theme.vars.palette.divider}`,
              borderRadius: 1,
              bgcolor: (theme) => theme.vars.palette.background.neutral,
            }}
          >
            <Box display="flex" justifyContent="space-between" gap={1.5} flexWrap="wrap">
              <Typography variant="subtitle2" fontWeight={700}>
                Policy Assignment
              </Typography>
              <Chip
                size="small"
                color={policyPreview?.policySource === 'default' ? 'default' : 'primary'}
                label={isPreviewLoading ? 'Resolving...' : policyPreview?.policySource || 'Default'}
              />
            </Box>
            <Grid container spacing={1.25} sx={{ mt: 1 }}>
              <Grid size={{ xs: 12, md: 3 }}>
                <Typography variant="caption" color="text.secondary">
                  Payroll Policy
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {policyPreview?.payrollPolicy?.name || '-'}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <Typography variant="caption" color="text.secondary">
                  Attendance Policy
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {policyPreview?.attendancePolicy?.name || '-'}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <Typography variant="caption" color="text.secondary">
                  Payroll Calendar
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {policyPreview?.payrollWorkCalendarPolicy?.name || '-'}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <Typography variant="caption" color="text.secondary">
                  Attendance Calendar
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {policyPreview?.attendanceWorkCalendarPolicy?.name || '-'}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Typography variant="caption" color="text.secondary">
                  Source
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {policyPreview?.matchedTargetDisplayName ||
                    policyPreview?.matchedTargetKey ||
                    policyPreview?.policySource ||
                    '-'}
                  {policyPreview?.matchedPriority != null
                    ? ` · Priority ${policyPreview.matchedPriority}`
                    : ''}
                </Typography>
              </Grid>
            </Grid>
            {!policyPreview && !isPreviewLoading ? (
              <Alert severity="info" sx={{ mt: 1.5 }}>
                Select employee scope fields and joining date to preview effective policies.
              </Alert>
            ) : null}
            <Divider sx={{ my: 1.5 }} />
            <FormControlLabel
              control={
                <Switch
                  checked={Boolean(values.policyOverrideEnabled)}
                  disabled={!isEditable.value}
                  onChange={(event) =>
                    formik.setFieldValue('policyOverrideEnabled', event.target.checked)
                  }
                />
              }
              label="Override for this employee"
            />
            {values.policyOverrideEnabled ? (
              <Grid container spacing={1.5}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Payroll Policy *</InputLabel>
                    <Select
                      label="Payroll Policy *"
                      value={values.policyOverridePayrollPolicyId || ''}
                      disabled={!isEditable.value}
                      onChange={(event) =>
                        formik.setFieldValue('policyOverridePayrollPolicyId', event.target.value)
                      }
                      error={
                        Boolean(formik.touched.policyOverridePayrollPolicyId) &&
                        Boolean(formik.errors.policyOverridePayrollPolicyId)
                      }
                    >
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
                    ) : null}
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Attendance Policy *</InputLabel>
                    <Select
                      label="Attendance Policy *"
                      value={values.policyOverrideAttendancePolicyId || ''}
                      disabled={!isEditable.value}
                      onChange={(event) =>
                        formik.setFieldValue('policyOverrideAttendancePolicyId', event.target.value)
                      }
                      error={
                        Boolean(formik.touched.policyOverrideAttendancePolicyId) &&
                        Boolean(formik.errors.policyOverrideAttendancePolicyId)
                      }
                    >
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
                    ) : null}
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    size="small"
                    fullWidth
                    type="date"
                    label="Effective From *"
                    InputLabelProps={{ shrink: true }}
                    disabled={!isEditable.value}
                    value={values.policyOverrideEffectiveFrom || policyEffectiveDate}
                    onChange={(event) =>
                      formik.setFieldValue('policyOverrideEffectiveFrom', event.target.value)
                    }
                    error={
                      Boolean(formik.touched.policyOverrideEffectiveFrom) &&
                      Boolean(formik.errors.policyOverrideEffectiveFrom)
                    }
                    helperText={
                      formik.touched.policyOverrideEffectiveFrom &&
                      formik.errors.policyOverrideEffectiveFrom
                    }
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
            ) : null}
          </Paper>
        </Grid>
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
              type="number"
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
                min: 0,
              }}
              error={formik.touched.accountNumber && Boolean(formik.errors.accountNumber)}
              helperText={formik.touched.accountNumber && formik.errors.accountNumber}
            />
          </ShakingTextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
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
            />
          </ShakingTextField>
        </Grid>
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
              label="EPF Number"
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

        <Grid size={{ xs: 12, sm: 4 }}>
          <ShakingTextField error={formik.touched.punchId && Boolean(formik.errors.punchId)}>
            <TextField
              size="small"
              fullWidth
              disabled={!isEditable.value}
              label="Punch Id"
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
                formik.touched.totalWorkingHourPerMonth && formik.errors.totalWorkingHourPerMonth
              }
            />
          </ShakingTextField>
        </Grid>
      </SectionCard>
      Leave Center
      <Grid container spacing={1}>
        <Grid size={{ xs: 12, md: 6 }}>
          <RenderComponents
            formik={formik}
            name="earningComponents"
            label="Earning Components"
            type="earning"
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <RenderComponents
            formik={formik}
            name="deductionComponents"
            label="Deduction Components"
            type="deduction"
          />
        </Grid>
      </Grid>
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
