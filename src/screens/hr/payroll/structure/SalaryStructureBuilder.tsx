'use client';

import type { FormikProps } from 'formik';
import type { RootState } from 'src/redux/store';
import type {
  SalaryBasis,
  SalaryRuleOverride,
  SalaryTemplateCalculation,
} from 'src/redux/hr/salary-template-api';

import dayjs from 'dayjs';
import { toast } from 'sonner';
import { createPortal } from 'react-dom';
import { useSelector } from 'react-redux';
import { Iconify } from 'src/components/iconify';
import { ExpandMore } from '@mui/icons-material';
import { useGetPFQuery } from 'src/redux/PF/PFApi';
import { hrPermissions } from 'src/constants/hr-menus';
import { hasGrantedPermission } from 'src/utils/permissions';
import { formatPayrollCurrency } from 'src/utils/payroll-currency';
import { useId, useRef, useMemo, useState, useEffect } from 'react';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import NumericFormatCustom from 'src/components/custom-numeric-format';
import { useUpdateEmployeeStatusMutation } from 'src/redux/hr/employeeApi';
import {
  useGetActiveSalaryTemplatesQuery,
  useCalculateSalaryTemplateMutation,
} from 'src/redux/hr/salary-template-api';
import {
  useGetCompensationRevisionsQuery,
  useSaveEmployeeCompensationMutation,
  useGetEmployeeActivationReadinessQuery,
} from 'src/redux/hr/compensation-revision-api';
import {
  Box,
  Grid,
  Chip,
  Alert,
  Paper,
  Button,
  Select,
  Switch,
  Tooltip,
  Divider,
  MenuItem,
  Skeleton,
  TextField,
  Accordion,
  IconButton,
  Typography,
  InputLabel,
  FormControl,
  FormControlLabel,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';

import { getLocalMonthKey } from './salary-structure-builder-utils';
import { formatPayrollMonth } from '../setting/esi-statutory-utils';
import { EmployeeEsiDetails } from '../setting/employee-esi-details';

type Props = {
  formik: FormikProps<any>;
  employeeId?: string;
  dateOfJoining?: string | null;
  employeeIsActive?: boolean;
  actionContainer?: HTMLElement | null;
  onEditorStateChange?: (state: { dirty: boolean; busy: boolean }) => void;
};

const monthlyPayload = (month: string) => `${month}-01T00:00:00.000Z`;
const newKey = () => globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`;
const contractLabel = (value: string) =>
  value
    .toLowerCase()
    .replaceAll('_', ' ')
    .replace(/(^|\s)\S/g, (letter) => letter.toUpperCase());

function Summary({ label, amount }: { label: string; amount: number }) {
  return (
    <Paper variant="outlined" sx={{ p: 1.5, height: '100%' }}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="h6" sx={{ fontVariantNumeric: 'tabular-nums' }}>
        {formatPayrollCurrency(amount)}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        Annual equivalent: {formatPayrollCurrency(amount * 12)}
      </Typography>
    </Paper>
  );
}

export function SalaryStructureBuilder({
  formik,
  employeeId,
  dateOfJoining,
  employeeIsActive = false,
  actionContainer,
  onEditorStateChange,
}: Props) {
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const canView = hasGrantedPermission(
    permissions,
    hrPermissions.payroll.compensationRevisionActions.view
  );
  const canManage = hasGrantedPermission(
    permissions,
    hrPermissions.payroll.compensationRevisionActions.manage
  );
  const canReadCompensation = canView || canManage;
  const canActivate = hasGrantedPermission(permissions, 'HR.Employee.EmployeeList.Edit');
  const {
    data: templateData,
    isLoading: templatesLoading,
    isFetching: templatesFetching,
    isError: templatesError,
    refetch: refetchTemplates,
  } = useGetActiveSalaryTemplatesQuery(undefined, { refetchOnMountOrArgChange: 30 });
  const { data: pfData, isError: pfRulesError } = useGetPFQuery({});
  const {
    data: revisionData,
    isLoading: revisionsLoading,
    isFetching: revisionsFetching,
    isError: revisionsError,
    refetch: refetchRevisions,
  } = useGetCompensationRevisionsQuery(employeeId || '', {
    skip: !employeeId || !canReadCompensation,
    refetchOnMountOrArgChange: 30,
  });
  const { data: readiness, refetch: refetchReadiness } = useGetEmployeeActivationReadinessQuery(
    employeeId || '',
    { skip: !employeeId || !canActivate }
  );
  const [calculate, calculationState] = useCalculateSalaryTemplateMutation();
  const [saveSalary, saveState] = useSaveEmployeeCompensationMutation();
  const [activateEmployee, activationState] = useUpdateEmployeeStatusMutation();
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [salaryBasis, setSalaryBasis] = useState<SalaryBasis>('EMPLOYER_COST');
  const [effectiveMonth, setEffectiveMonth] = useState(getLocalMonthKey);
  const [monthlyAmount, setMonthlyAmount] = useState(
    Number(formik.values.quotedMonthlyAmount || 0)
  );
  const [pfApplicable, setPfApplicable] = useState(false);
  const [pfRuleId, setPfRuleId] = useState('');
  const [customizing, setCustomizing] = useState(false);
  const [overrides, setOverrides] = useState<SalaryRuleOverride[]>([]);
  const [customizationReason, setCustomizationReason] = useState('');
  const [calculation, setCalculation] = useState<SalaryTemplateCalculation | null>(null);
  const [calculatedSignature, setCalculatedSignature] = useState('');
  const [activationCompleted, setActivationCompleted] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [baseline, setBaseline] = useState<string | null>(null);
  const [esiEditorState, setEsiEditorState] = useState({ dirty: false, busy: false });
  const [savedSignature, setSavedSignature] = useState('');
  const [operationError, setOperationError] = useState('');
  const [hasConflict, setHasConflict] = useState(false);
  const [localBusy, setLocalBusy] = useState(false);
  const [operation, setOperation] = useState<'calculate' | 'save' | null>(null);
  const [amountTouched, setAmountTouched] = useState(false);
  const [reasonTouched, setReasonTouched] = useState(false);
  const reasonInput = useRef<HTMLInputElement>(null);
  const operationPending = useRef(false);
  const initializedRef = useRef('');
  const operationKeyRef = useRef('');
  const operationSignatureRef = useRef('');
  const salaryTemplateLabelId = useId();
  const salaryBasisLabelId = useId();
  const pfRuleLabelId = useId();

  const templates = templateData?.items || [];
  const defaultTemplate = templates.find((template) => template.isDefault) || templates[0];
  const selectedTemplate =
    templates.find((template) => template.id === selectedTemplateId) || defaultTemplate;
  const selectedVersion = selectedTemplate?.editableVersion;
  const pfRules = (pfData?.items || []).filter((rule: any) => rule.isActive);
  const exactMonthRevision = useMemo(
    () =>
      revisionData?.items
        .filter(
          (revision) =>
            revision.status === 'EFFECTIVE' &&
            revision.effectiveMonth.slice(0, 7) === effectiveMonth
        )
        .sort((left, right) => right.revisionNumber - left.revisionNumber)[0],
    [effectiveMonth, revisionData?.items]
  );

  useEffect(() => {
    const initializationKey = employeeId || 'unsaved-employee';
    if (
      revisionsLoading ||
      revisionsFetching ||
      templatesFetching ||
      !selectedTemplate ||
      initializedRef.current === initializationKey
    ) {
      return;
    }
    const source =
      revisionData?.items.find((revision) => revision.isCurrent) || revisionData?.items[0];
    if (source) {
      setSelectedTemplateId(source.sourceSalaryTemplateId || selectedTemplate.id);
      setSalaryBasis(source.salaryBasis);
      setEffectiveMonth(source.effectiveMonth.slice(0, 7));
      setMonthlyAmount(source.quotedMonthlyAmount);
      setPfApplicable(Boolean(source.pfRuleId));
      setPfRuleId(source.pfRuleId || '');
      setOverrides(source.overrides || []);
      setCustomizationReason(source.customizationReason || '');
      setCustomizing(source.isCustomized);
    } else {
      setSelectedTemplateId(selectedTemplate.id);
      setSalaryBasis(selectedTemplate.editableVersion.defaultSalaryBasis);
      setPfApplicable(selectedTemplate.editableVersion.defaultPfApplicable);
      setPfRuleId(selectedTemplate.editableVersion.defaultPfRuleId || '');
      const joining = dateOfJoining;
      if (joining) setEffectiveMonth(dayjs(joining).format('YYYY-MM'));
    }
    initializedRef.current = initializationKey;
    setInitialized(true);
  }, [
    dateOfJoining,
    employeeId,
    revisionData?.items,
    revisionsLoading,
    revisionsFetching,
    templatesFetching,
    selectedTemplate,
  ]);

  useEffect(() => setActivationCompleted(false), [employeeId]);

  const signature = JSON.stringify({
    templateVersionId: selectedVersion?.id,
    salaryBasis,
    effectiveMonth,
    monthlyAmount,
    pfApplicable,
    pfRuleId,
    overrides: customizing ? overrides : [],
    customizationReason: customizing ? customizationReason.trim() : '',
  });
  const busy =
    localBusy || calculationState.isLoading || saveState.isLoading || activationState.isLoading;
  useEffect(() => {
    if (initialized && baseline === null) setBaseline(signature);
  }, [initialized, baseline, signature]);
  useEffect(() => {
    onEditorStateChange?.({
      dirty: (baseline !== null && baseline !== signature) || esiEditorState.dirty,
      busy: busy || esiEditorState.busy,
    });
  }, [baseline, signature, busy, esiEditorState.dirty, esiEditorState.busy, onEditorStateChange]);
  const calculationCurrent = Boolean(calculation && calculatedSignature === signature);

  useEffect(() => {
    if (operationSignatureRef.current && operationSignatureRef.current !== signature) {
      operationKeyRef.current = '';
    }
  }, [signature]);

  const chooseTemplate = (templateId: string) => {
    const template = templates.find((item) => item.id === templateId);
    setSelectedTemplateId(templateId);
    if (template) {
      setSalaryBasis(template.editableVersion.defaultSalaryBasis);
      setPfApplicable(template.editableVersion.defaultPfApplicable);
      setPfRuleId(template.editableVersion.defaultPfRuleId || '');
      setCustomizing(false);
      setOverrides([]);
      setCustomizationReason('');
    }
    setCalculation(null);
  };

  const calculateSalary = async () => {
    if (
      operationPending.current ||
      !canManage ||
      !selectedVersion ||
      !Number.isFinite(monthlyAmount) ||
      monthlyAmount <= 0 ||
      !/^\d{4}-\d{2}$/.test(effectiveMonth) ||
      (pfApplicable && !pfRuleId)
    )
      return;
    operationPending.current = true;
    setOperation('calculate');
    setLocalBusy(true);
    setOperationError('');
    try {
      const result = await calculate({
        templateVersionId: selectedVersion.id,
        salaryBasis,
        monthlyAmount,
        effectiveMonth: monthlyPayload(effectiveMonth),
        employeeId: employeeId || null,
        pfApplicable,
        pfRuleId: pfApplicable ? pfRuleId : null,
        overrides: customizing ? overrides : [],
        customizationReason: customizing ? customizationReason.trim() || null : null,
      }).unwrap();
      setCalculation(result);
      setCalculatedSignature(signature);
    } catch (error: any) {
      setOperationError(parseApiProblemDetail(error).detail);
      setCalculation(null);
    } finally {
      operationPending.current = false;
      setOperation(null);
      setLocalBusy(false);
    }
  };

  const save = async () => {
    if (
      operationPending.current ||
      !canManage ||
      !employeeId ||
      !selectedVersion ||
      !calculationCurrent ||
      !calculation ||
      savedSignature === signature ||
      hasConflict ||
      statutoryBlocked
    )
      return;
    if (customizing && overrides.length > 0 && !customizationReason.trim()) {
      setReasonTouched(true);
      reasonInput.current?.focus();
      return;
    }
    operationPending.current = true;
    setOperation('save');
    setLocalBusy(true);
    setOperationError('');
    operationKeyRef.current ||= newKey();
    operationSignatureRef.current = signature;
    try {
      const result = await saveSalary({
        employeeId,
        body: {
          templateVersionId: selectedVersion.id,
          salaryBasis,
          monthlyAmount,
          effectiveMonth: monthlyPayload(effectiveMonth),
          pfApplicable,
          pfRuleId: pfApplicable ? pfRuleId : null,
          statutoryProfile: 'IN-GJ',
          overrides: customizing ? overrides : [],
          customizationReason: customizing ? customizationReason.trim() || null : null,
          idempotencyKey: operationKeyRef.current,
          expectedRevision: exactMonthRevision?.revisionNumber || null,
        },
      }).unwrap();
      operationKeyRef.current = '';
      setBaseline(signature);
      setSavedSignature(signature);
      if (refetchRevisions) await refetchRevisions();
      toast.success(
        result.isScheduled
          ? `Salary revision ${result.revisionNumber} is scheduled for ${effectiveMonth}.`
          : `Salary revision ${result.revisionNumber} is effective.`
      );
      if (canActivate) {
        await refetchReadiness();
      }
    } catch (error: any) {
      const parsed = parseApiProblemDetail(error);
      if (error?.status === 409) setHasConflict(true);
      setOperationError(
        error?.status === 409
          ? 'Salary changed in another session. Reload the history and review before saving again.'
          : parsed.detail
      );
    } finally {
      operationPending.current = false;
      setOperation(null);
      setLocalBusy(false);
    }
  };

  const activate = async () => {
    if (!employeeId) return;
    try {
      await activateEmployee({
        id: employeeId,
        body: {
          employeeStatusType: 0,
          remarks: 'Activated after payroll setup',
          effectiveDate: null,
        },
      }).unwrap();
      setActivationCompleted(true);
      toast.success('Staff activated.');
      if (canActivate) {
        await refetchReadiness();
      }
    } catch (error: any) {
      toast.error(parseApiProblemDetail(error).detail);
    }
  };

  const setOverride = (componentId: string, formulaType: string, value: number | null) => {
    setOverrides((current) => {
      const next = current.filter((override) => override.componentId !== componentId);
      return [...next, { componentId, formulaType, value, basisComponentId: null }];
    });
    setCalculation(null);
  };

  const resetToTemplate = () => {
    setOverrides([]);
    setCustomizationReason('');
    setCustomizing(false);
    setReasonTouched(false);
    setCalculation(null);
  };

  if (
    templatesLoading ||
    revisionsLoading ||
    (!initialized && (templatesFetching || revisionsFetching))
  ) {
    return (
      <Box aria-busy="true" aria-label="Loading staff salary" display="grid" gap={2.5}>
        <Grid container spacing={2}>
          {[6, 3, 3].map((width, index) => (
            <Grid key={index} size={{ xs: 12, md: width }}>
              <Skeleton width="40%" height={20} />
              <Skeleton variant="rounded" height={40} />
            </Grid>
          ))}
          {['Earnings', 'Deductions'].map((title) => (
            <Grid key={title} size={{ xs: 12, md: 6 }}>
              <Typography variant="subtitle1">{title}</Typography>
              {[0, 1, 2].map((row) => (
                <Skeleton key={row} height={40} />
              ))}
            </Grid>
          ))}
        </Grid>
        <Box display="flex" justifyContent="flex-end">
          <Button size="small" variant="contained" disabled>
            Calculate salary
          </Button>
        </Box>
      </Box>
    );
  }
  if (templatesError && !templateData) {
    return (
      <Box display="grid" gap={2.5}>
        <Alert
          severity="error"
          action={
            <Button size="small" onClick={() => refetchTemplates()}>
              Retry
            </Button>
          }
        >
          Salary templates could not be loaded.
        </Alert>
      </Box>
    );
  }
  if (!templates.length) {
    return (
      <Alert severity="warning">
        Create an active salary template before setting up staff salary.
      </Alert>
    );
  }
  if (!employeeId) {
    return (
      <Alert severity="info">
        Save the staff first. The staff will be created as Inactive, then salary can be set up
        separately.
      </Alert>
    );
  }

  const permittedRules = (selectedVersion?.rules || []).filter((rule) =>
    ['BASIC', 'DEARNESS_ALLOWANCE', 'ORDINARY'].includes(rule.semanticType)
  );
  const statutoryBlocked = calculation
    ? !calculation.employeeStateInsurance.canCalculate ||
      calculation.employeeStateInsurance.issueCodes.some(
        (code) =>
          code !== 'ESI_INSURANCE_NUMBER_REQUIRED' ||
          !calculation.employeeStateInsurance.registrationPending
      )
    : false;
  const amountInvalid = !Number.isFinite(monthlyAmount) || monthlyAmount <= 0;
  const reasonInvalid = customizing && overrides.length > 0 && !customizationReason.trim();
  const currentRevision = revisionData?.items.find((item) => item.isCurrent);
  const employeeName =
    formik.values.fullName ||
    [formik.values.firstName, formik.values.lastName].filter(Boolean).join(' ');
  let footerStatus = 'Calculate to review changes';
  if (busy) {
    footerStatus = operation === 'calculate' ? 'Calculating salary…' : 'Refreshing salary…';
    if (operation === 'save') footerStatus = 'Saving salary…';
    if (activationState.isLoading) footerStatus = 'Activating staff…';
  } else if (!canManage) footerStatus = 'View-only salary';
  else if (hasConflict || revisionsError) footerStatus = 'Review salary history before saving';
  else if (!selectedVersion) footerStatus = 'Choose a salary template';
  else if (amountInvalid) footerStatus = 'Enter an amount greater than zero';
  else if (!/^\d{4}-\d{2}$/.test(effectiveMonth)) footerStatus = 'Choose an effective month';
  else if (pfApplicable && !pfRuleId) footerStatus = 'Choose a PF rule';
  else if (statutoryBlocked) footerStatus = 'Resolve ESIC details before saving';
  else if (savedSignature === signature && calculationCurrent) footerStatus = 'Saved';
  else if (calculationCurrent) {
    footerStatus = reasonInvalid ? 'Add a customization reason before saving' : 'Ready to save';
  }

  const actions = (
    <>
      <Typography
        variant="caption"
        color="text.secondary"
        role="status"
        aria-live="polite"
        sx={
          actionContainer
            ? {
                gridColumn: { xs: '1 / -1', sm: 2 },
                gridRow: 1,
                justifySelf: 'end',
                maxWidth: { xs: 'calc(100% - 72px)', sm: '100%' },
              }
            : { alignSelf: 'center', flexBasis: { xs: '100%', sm: 'auto' } }
        }
      >
        {footerStatus}
      </Typography>
      <Button
        size="small"
        variant="outlined"
        startIcon={<Iconify icon="mdi:calculator" />}
        onClick={calculateSalary}
        loading={operation === 'calculate'}
        loadingPosition="start"
        sx={
          actionContainer
            ? { gridColumn: { xs: 1, sm: 3 }, gridRow: { xs: 2, sm: 1 }, justifySelf: 'end' }
            : undefined
        }
        disabled={
          !canManage ||
          busy ||
          !selectedVersion ||
          !Number.isFinite(monthlyAmount) ||
          monthlyAmount <= 0 ||
          !/^\d{4}-\d{2}$/.test(effectiveMonth) ||
          (pfApplicable && !pfRuleId)
        }
      >
        Calculate salary
      </Button>
      <Button
        size="small"
        variant="contained"
        onClick={save}
        loading={operation === 'save'}
        sx={
          actionContainer
            ? { gridColumn: { xs: 2, sm: 4 }, gridRow: { xs: 2, sm: 1 }, justifySelf: 'end' }
            : undefined
        }
        disabled={
          !canManage ||
          busy ||
          !calculationCurrent ||
          statutoryBlocked ||
          savedSignature === signature ||
          hasConflict ||
          revisionsError
        }
      >
        Save salary
      </Button>
    </>
  );
  return (
    <Box display="grid" gap={2}>
      <Box
        component="fieldset"
        disabled={busy}
        sx={{ border: 0, p: 0, m: 0, minWidth: 0, display: 'grid', gap: 2 }}
      >
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          gap={1}
          flexWrap="wrap"
        >
          {employeeName && (
            <Typography variant="subtitle1" sx={{ overflowWrap: 'anywhere', minWidth: 0 }}>
              {employeeName}
              {formik.values.employeeIdentifier ? ` · ${formik.values.employeeIdentifier}` : ''}
            </Typography>
          )}
          <EmployeeEsiDetails
            onEditorStateChange={setEsiEditorState}
            employeeId={employeeId}
            employeeName={
              [formik.values.firstName, formik.values.lastName].filter(Boolean).join(' ') ||
              'Employee'
            }
            employeeIdentifier={formik.values.employeeIdentifier || ''}
            onSaved={async () => {
              setCalculation(null);
              if (canActivate) await refetchReadiness();
            }}
          />
        </Box>
        {readiness?.blockerCodes.includes('ESI_INSURANCE_NUMBER_REQUIRED') && (
          <Typography variant="body2" color="error.main">
            Enter the staff’s ESIC insurance number before activation.
          </Typography>
        )}
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth size="small" disabled={!canManage || busy}>
              <InputLabel id={salaryTemplateLabelId}>Salary template</InputLabel>
              <Select
                labelId={salaryTemplateLabelId}
                label="Salary template"
                value={selectedTemplate?.id || ''}
                onChange={(event) => chooseTemplate(event.target.value)}
              >
                {templates.map((template) => (
                  <MenuItem key={template.id} value={template.id}>
                    {template.name}
                    {template.isDefault ? ' (School default)' : ''}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              size="small"
              label="Effective month"
              name="effectiveMonth"
              autoComplete="off"
              type="month"
              value={effectiveMonth}
              disabled={!canManage || busy}
              onChange={(event) => {
                setEffectiveMonth(event.target.value);
                setCalculation(null);
              }}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <NumericFormatCustom
              fullWidth
              size="small"
              roundToWholeRupees={false}
              name="monthlyAmount"
              autoComplete="off"
              label={
                salaryBasis === 'EMPLOYER_COST' ? 'Monthly cost to school (CTC)' : 'Monthly salary'
              }
              value={monthlyAmount || ''}
              allowNegative
              isAllowed={() => true}
              disabled={!canManage || busy}
              onValueChange={({ floatValue }, { source }) => {
                if (source !== 'event') return;
                setMonthlyAmount(floatValue ?? 0);
                setCalculation(null);
              }}
              onBlur={() => setAmountTouched(true)}
              error={amountTouched && amountInvalid}
              helperText={
                amountTouched && amountInvalid ? 'Enter an amount greater than zero.' : ''
              }
              slotProps={{ htmlInput: { inputMode: 'decimal' } }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth size="small" disabled={!canManage || busy}>
              <InputLabel id={salaryBasisLabelId}>Amount basis</InputLabel>
              <Select
                labelId={salaryBasisLabelId}
                label="Amount basis"
                value={salaryBasis}
                onChange={(event) => {
                  setSalaryBasis(event.target.value as SalaryBasis);
                  setCalculation(null);
                }}
              >
                <MenuItem value="EMPLOYER_COST">Monthly cost to school (CTC)</MenuItem>
                <MenuItem value="GROSS">Monthly salary</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'auto minmax(0, 1fr)' },
                alignItems: 'center',
                gap: 2,
              }}
            >
              <FormControlLabel
                sx={{ m: 0 }}
                control={
                  <Switch
                    checked={pfApplicable}
                    disabled={!canManage || busy}
                    onChange={(_, checked) => {
                      setPfApplicable(checked);
                      if (!checked) setPfRuleId('');
                      else if (!pfRuleId)
                        setPfRuleId(selectedVersion?.defaultPfRuleId || pfRules[0]?.id || '');
                      setCalculation(null);
                    }}
                    inputProps={{ 'aria-label': 'PF applicable for staff' }}
                  />
                }
                label="PF applicable"
              />
              <FormControl
                fullWidth
                size="small"
                disabled={!canManage || busy || !pfApplicable || pfRulesError}
              >
                <InputLabel id={pfRuleLabelId}>PF rule</InputLabel>
                <Select
                  labelId={pfRuleLabelId}
                  label="PF rule"
                  value={pfRuleId}
                  onChange={(event) => {
                    setPfRuleId(event.target.value);
                    setCalculation(null);
                  }}
                >
                  {pfRules.map((rule: any) => (
                    <MenuItem key={rule.id} value={rule.id}>
                      {rule.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Grid>
        </Grid>

        <Divider />
        <Box
          display="flex"
          justifyContent="space-between"
          gap={2}
          alignItems="center"
          flexWrap="wrap"
        >
          <Box>
            <Box display="flex" gap={1} alignItems="center" flexWrap="wrap">
              <Typography variant="subtitle1">Staff-specific customization</Typography>
              <Tooltip title="Basic, DA, and ordinary rows can be customized. Statutory and balancing rows stay locked.">
                <IconButton
                  size="small"
                  aria-label="About staff-specific customization"
                  sx={{ minWidth: 44, minHeight: 44 }}
                >
                  <Iconify icon="mdi:information-outline" />
                </IconButton>
              </Tooltip>
              {customizing && overrides.length ? (
                <Chip size="small" color="warning" label="Customized" />
              ) : null}
            </Box>
          </Box>
          {canManage ? (
            <Box display="flex" gap={1} sx={{ ml: 'auto' }}>
              {customizing ? (
                <Button
                  size="small"
                  startIcon={<Iconify icon="mdi:restore" />}
                  onClick={resetToTemplate}
                >
                  Reset to template
                </Button>
              ) : null}
              <Button
                size="small"
                variant="outlined"
                startIcon={<Iconify icon="mdi:tune-variant" />}
                onClick={() => setCustomizing(true)}
                disabled={customizing}
              >
                Customize
              </Button>
            </Box>
          ) : null}
        </Box>
        {customizing ? (
          <Grid container spacing={1.5}>
            {permittedRules.map((rule) => {
              const override = overrides.find((item) => item.componentId === rule.componentId);
              return (
                <Grid key={rule.componentId} size={{ xs: 12, md: 6 }}>
                  <Paper variant="outlined" sx={{ p: 1.5 }}>
                    <Typography variant="subtitle2">{contractLabel(rule.semanticType)}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Template: {contractLabel(rule.formulaType)} {rule.value ?? ''}
                    </Typography>
                    <Grid container spacing={1} mt={0.5}>
                      <Grid size={{ xs: 12, sm: 7 }}>
                        <FormControl fullWidth size="small" disabled={busy}>
                          <InputLabel id={`calculation-${rule.componentId}-label`}>
                            Calculation
                          </InputLabel>
                          <Select
                            labelId={`calculation-${rule.componentId}-label`}
                            label="Calculation"
                            value={override?.formulaType || rule.formulaType}
                            onChange={(event) =>
                              setOverride(
                                rule.componentId,
                                event.target.value,
                                override?.value ?? rule.value ?? 0
                              )
                            }
                          >
                            <MenuItem value="FIXED_AMOUNT">Fixed amount</MenuItem>
                            <MenuItem value="PERCENTAGE_OF_GROSS">Percent of gross</MenuItem>
                            <MenuItem value="PERCENTAGE_OF_BASIC">Percent of basic</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 5 }}>
                        <TextField
                          fullWidth
                          size="small"
                          type="number"
                          label="Value"
                          value={override?.value ?? rule.value ?? 0}
                          onChange={(event) =>
                            setOverride(
                              rule.componentId,
                              override?.formulaType || rule.formulaType,
                              Number(event.target.value)
                            )
                          }
                        />
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
              );
            })}
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                size="small"
                required={overrides.length > 0}
                label="Customization reason"
                name="customizationReason"
                autoComplete="off"
                inputRef={reasonInput}
                onBlur={() => setReasonTouched(true)}
                error={reasonTouched && reasonInvalid}
                value={customizationReason}
                onChange={(event) => {
                  setCustomizationReason(event.target.value);
                  setCalculation(null);
                }}
                helperText={
                  reasonTouched && reasonInvalid
                    ? 'Add a reason for the staff-specific salary customization.'
                    : 'Required when any row differs from the source template.'
                }
              />
            </Grid>
          </Grid>
        ) : null}

        {operationError && (
          <Alert
            severity="error"
            action={
              hasConflict ? (
                <Button
                  size="small"
                  disabled={busy}
                  onClick={async () => {
                    setLocalBusy(true);
                    try {
                      const response = await refetchRevisions();
                      if (!response.error) {
                        setHasConflict(false);
                        setCalculation(null);
                        setOperationError('');
                        operationKeyRef.current = '';
                      }
                    } finally {
                      setLocalBusy(false);
                    }
                  }}
                >
                  Reload salary history
                </Button>
              ) : undefined
            }
          >
            {operationError}
          </Alert>
        )}
        {calculatedSignature && !calculationCurrent && (
          <Alert severity="info">Recalculate to review your changes.</Alert>
        )}
        {calculation ? (
          <Box display="grid" gap={2} aria-live="polite">
            <Grid container spacing={1.5}>
              <Grid size={{ xs: 6, md: 3 }}>
                <Summary label="Full-month gross" amount={calculation.grossSalary} />
              </Grid>
              <Grid size={{ xs: 6, md: 3 }}>
                <Summary label="Deductions" amount={calculation.totalDeductions} />
              </Grid>
              <Grid size={{ xs: 6, md: 3 }}>
                <Summary label="Estimated net salary" amount={calculation.netSalary} />
              </Grid>
              <Grid size={{ xs: 6, md: 3 }}>
                <Summary label="Employer cost" amount={calculation.employerCost} />
              </Grid>
            </Grid>
            <Typography variant="caption" color="text.secondary">
              Estimated net salary excludes monthly attendance effects and one-time adjustments.
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle1" mb={1}>
                    Earnings
                  </Typography>
                  {calculation.earnings.map((line) => (
                    <Box
                      key={`${line.componentId}-${line.code}`}
                      display="flex"
                      justifyContent="space-between"
                      py={0.5}
                    >
                      <Box display="flex" gap={0.75}>
                        {line.name}
                        {line.lineSource === 'CUSTOMIZED' ? (
                          <Chip size="small" label="Customized" />
                        ) : null}
                      </Box>
                      <Typography>{formatPayrollCurrency(line.amount)}</Typography>
                    </Box>
                  ))}
                </Paper>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle1" mb={1}>
                    Employee deductions
                  </Typography>
                  {calculation.deductions.map((line) => (
                    <Box
                      key={`${line.componentId}-${line.code}-${line.name}`}
                      display="flex"
                      justifyContent="space-between"
                      py={0.5}
                    >
                      <Box display="flex" gap={0.75}>
                        {line.name}
                        {line.lineSource === 'CUSTOMIZED' ? (
                          <Chip size="small" label="Customized" />
                        ) : null}
                      </Box>
                      <Typography>{formatPayrollCurrency(line.amount)}</Typography>
                    </Box>
                  ))}
                </Paper>
              </Grid>
            </Grid>
            {calculation.employerContributions.length > 0 && (
              <Box>
                <Typography variant="subtitle1">Employer contributions</Typography>
                {calculation.employerContributions.map((line) => (
                  <Box key={line.code} display="flex" justifyContent="space-between" gap={2}>
                    <Typography variant="body2">{line.name}</Typography>
                    <Typography variant="body2">{formatPayrollCurrency(line.amount)}</Typography>
                  </Box>
                ))}
              </Box>
            )}
            {calculation.employeeStateInsurance.ruleId && (
              <Alert
                severity={
                  statutoryBlocked
                    ? 'error'
                    : calculation.employeeStateInsurance.registrationPending
                      ? 'warning'
                      : 'info'
                }
              >
                ESI:{' '}
                {contractLabel(
                  calculation.employeeStateInsurance.coverageDecision || 'not evaluated'
                )}
                .
                {calculation.employeeStateInsurance.registrationPending
                  ? ' Registration is pending. Salary can be saved and the insurance number remains a visible follow-up.'
                  : ''}
                {calculation.employeeStateInsurance.issueCodes.length
                  ? ` ${calculation.employeeStateInsurance.issueCodes.map(contractLabel).join(', ')}.`
                  : ''}
              </Alert>
            )}
          </Box>
        ) : null}

        {readiness?.canActivate && canActivate && !employeeIsActive && !activationCompleted ? (
          <Alert
            severity="success"
            action={
              <Button
                color="success"
                variant="contained"
                onClick={activate}
                disabled={activationState.isLoading}
                size="small"
              >
                Activate staff
              </Button>
            }
          >
            Salary is ready. Activate the staff when the remaining onboarding checks are complete.
          </Alert>
        ) : null}

        {revisionsError ? (
          <Alert severity="error">Salary history could not be loaded.</Alert>
        ) : null}
        {revisionData?.items.length ? (
          <Accordion
            disableGutters
            elevation={0}
            sx={{ border: 1, borderColor: 'divider', '&:before': { display: 'none' } }}
          >
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Box>
                <Typography variant="subtitle1">Salary history</Typography>
                <Typography variant="caption" color="text.secondary">
                  {currentRevision
                    ? `Current from ${formatPayrollMonth(currentRevision.effectiveMonth.slice(0, 7))}`
                    : 'No effective salary'}{' '}
                  · {revisionData.items.filter((item) => item.isScheduled).length} scheduled
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Box display="grid" gap={1}>
                {revisionData.items.map((revision) => (
                  <Paper
                    key={revision.id}
                    variant="outlined"
                    sx={{
                      p: 1.5,
                      display: 'flex',
                      gap: 1.5,
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                    }}
                  >
                    <Box>
                      <Typography variant="subtitle2">
                        Revision {revision.revisionNumber} -{' '}
                        {formatPayrollMonth(revision.effectiveMonth.slice(0, 7))}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Template version {revision.sourceSalaryTemplateVersion || 'Legacy'}
                      </Typography>
                    </Box>
                    <Box display="flex" gap={1} alignItems="center">
                      {revision.isCurrent ? (
                        <Chip size="small" color="success" label="Current" />
                      ) : null}
                      {revision.isScheduled ? (
                        <Chip size="small" color="info" label="Scheduled" />
                      ) : null}
                      {revision.isCustomized ? (
                        <Chip size="small" color="warning" label="Customized" />
                      ) : null}
                      <Chip size="small" label={contractLabel(revision.status)} />
                      <Typography fontWeight={700}>
                        {formatPayrollCurrency(revision.netSalary)}
                      </Typography>
                    </Box>
                  </Paper>
                ))}
              </Box>
            </AccordionDetails>
          </Accordion>
        ) : null}
      </Box>
      {actionContainer ? (
        createPortal(actions, actionContainer)
      ) : (
        <Box display="flex" justifyContent="flex-end" flexWrap="wrap" gap={1}>
          {actions}
        </Box>
      )}
    </Box>
  );
}
