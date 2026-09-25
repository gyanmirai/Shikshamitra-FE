'use client';

import type { FormikProps } from 'formik';
import type { RootState } from 'src/redux/store';
import type {
  SalaryBasis,
  ProtectionPolicy,
  SalaryRuleOverride,
  SalaryTemplateCalculation,
} from 'src/redux/hr/salary-template-api';

import dayjs from 'dayjs';
import { toast } from 'sonner';
import { useSelector } from 'react-redux';
import { useGetPFQuery } from 'src/redux/PF/PFApi';
import { hrPermissions } from 'src/constants/hr-menus';
import { formatCurrency } from 'src/utils/cureencyFormater';
import { hasGrantedPermission } from 'src/utils/permissions';
import { Tune, Calculate, RestartAlt } from '@mui/icons-material';
import { useId, useRef, useMemo, useState, useEffect } from 'react';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
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
  Divider,
  MenuItem,
  TextField,
  Typography,
  InputLabel,
  FormControl,
  FormControlLabel,
  CircularProgress,
} from '@mui/material';

import { getLocalMonthKey } from './salary-structure-builder-utils';
import SalaryProtectionMigration from './salary-protection-migration';

type Props = {
  formik: FormikProps<any>;
  employeeId?: string;
  dateOfJoining?: string | null;
  employeeIsActive?: boolean;
};

const monthlyPayload = (month: string) => `${month}-01T00:00:00.000Z`;
const newKey = () => globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`;
const contractLabel = (value: string) =>
  value.toLowerCase().replaceAll('_', ' ').replace(/(^|\s)\S/g, (letter) => letter.toUpperCase());

function Summary({ label, amount }: { label: string; amount: number }) {
  return (
    <Paper variant="outlined" sx={{ p: 1.5, height: '100%' }}>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
      <Typography variant="subtitle1" fontWeight={700}>{formatCurrency(amount)}</Typography>
      <Typography variant="caption" color="text.secondary">
        {formatCurrency(amount * 12)} yearly
      </Typography>
    </Paper>
  );
}

export function SalaryStructureBuilder({
  formik,
  employeeId,
  dateOfJoining,
  employeeIsActive = false,
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
  const { data: templateData, isLoading: templatesLoading, isError: templatesError } =
    useGetActiveSalaryTemplatesQuery();
  const { data: pfData, isError: pfRulesError } = useGetPFQuery({});
  const {
    data: revisionData,
    isLoading: revisionsLoading,
    isError: revisionsError,
  } = useGetCompensationRevisionsQuery(employeeId || '', {
    skip: !employeeId || !canReadCompensation,
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
  const [protectionPolicy, setProtectionPolicy] =
    useState<ProtectionPolicy>('PROTECT_EMPLOYER_COST');
  const [effectiveMonth, setEffectiveMonth] = useState(getLocalMonthKey);
  const [monthlyAmount, setMonthlyAmount] = useState(Number(formik.values.quotedMonthlyAmount || 0));
  const [pfApplicable, setPfApplicable] = useState(false);
  const [pfRuleId, setPfRuleId] = useState('');
  const [customizing, setCustomizing] = useState(false);
  const [overrides, setOverrides] = useState<SalaryRuleOverride[]>([]);
  const [customizationReason, setCustomizationReason] = useState('');
  const [calculation, setCalculation] = useState<SalaryTemplateCalculation | null>(null);
  const [calculatedSignature, setCalculatedSignature] = useState('');
  const [activationCompleted, setActivationCompleted] = useState(false);
  const initializedRef = useRef('');
  const operationKeyRef = useRef('');
  const operationSignatureRef = useRef('');
  const salaryTemplateLabelId = useId();
  const salaryBasisLabelId = useId();
  const protectionPolicyLabelId = useId();
  const pfRuleLabelId = useId();

  const templates = templateData?.items || [];
  const defaultTemplate = templates.find((template) => template.isDefault) || templates[0];
  const selectedTemplate = templates.find((template) => template.id === selectedTemplateId) || defaultTemplate;
  const selectedVersion = selectedTemplate?.editableVersion;
  const pfRules = (pfData?.items || []).filter((rule: any) => rule.isActive);
  const exactMonthRevision = useMemo(
    () =>
      revisionData?.items
        .filter(
          (revision) =>
            revision.status === 'EFFECTIVE' && revision.effectiveMonth.slice(0, 7) === effectiveMonth
        )
        .sort((left, right) => right.revisionNumber - left.revisionNumber)[0],
    [effectiveMonth, revisionData?.items]
  );

  useEffect(() => {
    const initializationKey = employeeId || 'unsaved-employee';
    if (
      revisionsLoading ||
      !selectedTemplate ||
      initializedRef.current === initializationKey
    ) {
      return;
    }
    const source = revisionData?.items.find((revision) => revision.isCurrent) || revisionData?.items[0];
    if (source) {
      setSelectedTemplateId(source.sourceSalaryTemplateId || selectedTemplate.id);
      setSalaryBasis(source.salaryBasis);
      setProtectionPolicy(source.protectionPolicy);
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
      setProtectionPolicy(selectedTemplate.editableVersion.defaultProtectionPolicy);
      setPfApplicable(selectedTemplate.editableVersion.defaultPfApplicable);
      setPfRuleId(selectedTemplate.editableVersion.defaultPfRuleId || '');
      const joining = dateOfJoining;
      if (joining) setEffectiveMonth(dayjs(joining).format('YYYY-MM'));
    }
    initializedRef.current = initializationKey;
  }, [dateOfJoining, employeeId, revisionData?.items, revisionsLoading, selectedTemplate]);

  useEffect(() => setActivationCompleted(false), [employeeId]);

  const signature = JSON.stringify({
    templateVersionId: selectedVersion?.id,
    salaryBasis,
    protectionPolicy,
    effectiveMonth,
    monthlyAmount,
    pfApplicable,
    pfRuleId,
    overrides: customizing ? overrides : [],
    customizationReason: customizing ? customizationReason.trim() : '',
  });
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
      setProtectionPolicy(template.editableVersion.defaultProtectionPolicy);
      setPfApplicable(template.editableVersion.defaultPfApplicable);
      setPfRuleId(template.editableVersion.defaultPfRuleId || '');
      setCustomizing(false);
      setOverrides([]);
      setCustomizationReason('');
    }
    setCalculation(null);
  };

  const calculateSalary = async () => {
    if (!selectedVersion || monthlyAmount <= 0 || (pfApplicable && !pfRuleId)) return;
    try {
      const result = await calculate({
        templateVersionId: selectedVersion.id,
        salaryBasis,
        protectionPolicy,
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
      toast.error(parseApiProblemDetail(error).detail);
      setCalculation(null);
    }
  };

  const save = async () => {
    if (!employeeId || !selectedVersion || !calculationCurrent || !calculation) return;
    if (customizing && overrides.length > 0 && !customizationReason.trim()) {
      toast.error('Add a reason for the employee-specific salary customization.');
      return;
    }
    operationKeyRef.current ||= newKey();
    operationSignatureRef.current = signature;
    try {
      const result = await saveSalary({
        employeeId,
        body: {
          templateVersionId: selectedVersion.id,
          salaryBasis,
          protectionPolicy,
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
      formik.setFieldValue('quotedMonthlyAmount', result.quotedMonthlyAmount, false);
      formik.setFieldValue('quotedSalaryBasis', result.salaryBasis, false);
      formik.setFieldValue('sourceSalaryTemplateId', result.sourceSalaryTemplateId, false);
      formik.setFieldValue('pfRule', result.pfRuleId || null, false);
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
      toast.error(
        error?.status === 409
          ? 'Salary changed in another session. Reload the history and review before saving again.'
          : parsed.detail
      );
    }
  };

  const activate = async () => {
    if (!employeeId) return;
    try {
      await activateEmployee({
        id: employeeId,
        body: { employeeStatusType: 0, remarks: 'Activated after payroll setup', effectiveDate: null },
      }).unwrap();
      setActivationCompleted(true);
      toast.success('Employee activated.');
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
    setCalculation(null);
  };

  if (templatesLoading || revisionsLoading) {
    return <Box display="flex" justifyContent="center" py={4}><CircularProgress /></Box>;
  }
  if (templatesError) {
    return <Alert severity="error">Salary templates could not be loaded.</Alert>;
  }
  if (!templates.length) {
    return <Alert severity="warning">Create an active salary template before setting up employee salary.</Alert>;
  }
  if (!employeeId) {
    return (
      <Alert severity="info">
        Save the employee first. The employee will be created as Inactive, then salary can be set up separately.
      </Alert>
    );
  }

  const migrationSource = revisionData?.items.filter((revision) => revision.status === 'EFFECTIVE' && revision.effectiveMonth.slice(0, 7) <= effectiveMonth)
    .sort((a, b) => b.effectiveMonth.localeCompare(a.effectiveMonth) || b.revisionNumber - a.revisionNumber)[0];
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

  return (
    <Box display="grid" gap={2.5}>
      <Alert severity="info">
        Salary saves immediately as an immutable revision. Activating the employee remains a separate action.
      </Alert>
      {canManage && migrationSource && !migrationSource.protectionCalculationVersion && <SalaryProtectionMigration
        key={migrationSource.id} employeeId={employeeId} source={migrationSource} effectiveMonth={effectiveMonth}
        onApplied={(revision) => {
          setSalaryBasis(revision.salaryBasis);
          setProtectionPolicy(revision.protectionPolicy);
          setMonthlyAmount(revision.quotedMonthlyAmount);
          setCalculation(null);
          setCalculatedSignature('');
        }}
      />}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <FormControl fullWidth disabled={!canManage}>
            <InputLabel id={salaryTemplateLabelId}>Salary template</InputLabel>
            <Select
              labelId={salaryTemplateLabelId}
              label="Salary template"
              value={selectedTemplate?.id || ''}
              onChange={(event) => chooseTemplate(event.target.value)}
            >
              {templates.map((template) => (
                <MenuItem key={template.id} value={template.id}>
                  {template.name}{template.isDefault ? ' (School default)' : ''}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <TextField
            fullWidth
            label="Effective month"
            type="month"
            value={effectiveMonth}
            disabled={!canManage}
            onChange={(event) => { setEffectiveMonth(event.target.value); setCalculation(null); }}
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <TextField
            fullWidth
            label="Monthly amount"
            type="number"
            value={monthlyAmount || ''}
            disabled={!canManage}
            onChange={(event) => { setMonthlyAmount(Number(event.target.value)); setCalculation(null); }}
            slotProps={{ htmlInput: { min: 1, step: 100 } }}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <FormControl fullWidth disabled={!canManage}>
            <InputLabel id={salaryBasisLabelId}>Amount basis</InputLabel>
            <Select
              labelId={salaryBasisLabelId}
              label="Amount basis"
              value={salaryBasis}
              onChange={(event) => { setSalaryBasis(event.target.value as SalaryBasis); setCalculation(null); }}
            >
              <MenuItem value="EMPLOYER_COST">Employer cost / CTC</MenuItem>
              <MenuItem value="GROSS">Gross salary</MenuItem>
              <MenuItem value="TAKE_HOME">Take-home salary</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <FormControl fullWidth disabled={!canManage}>
            <InputLabel id={protectionPolicyLabelId}>Protection policy</InputLabel>
            <Select
              labelId={protectionPolicyLabelId}
              label="Protection policy"
              value={protectionPolicy}
              onChange={(event) => { setProtectionPolicy(event.target.value as ProtectionPolicy); setSalaryBasis(event.target.value === 'PROTECT_TAKE_HOME' ? 'TAKE_HOME' : 'EMPLOYER_COST'); setCalculation(null); }}
            >
              <MenuItem value="PROTECT_EMPLOYER_COST">Protect school cost (CTC)</MenuItem>
              <MenuItem value="PROTECT_TAKE_HOME">Protect employee take-home</MenuItem>
              {protectionPolicy === 'PROTECT_GROSS' && (
                <MenuItem value="PROTECT_GROSS" disabled>Legacy gross protection: choose a new policy</MenuItem>
              )}
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <Typography variant="body2" color="text.secondary" mb={1}>
            {protectionPolicy === 'PROTECT_TAKE_HOME'
              ? 'The school covers PT, employee PF and ESI. Other deductions still reduce payout.'
              : 'Recurring gross plus employer contributions stays within the agreed CTC.'}
          </Typography>
          <FormControlLabel
            control={
              <Switch
                checked={pfApplicable}
                disabled={!canManage}
                onChange={(_, checked) => {
                  setPfApplicable(checked);
                  if (!checked) setPfRuleId('');
                  else if (!pfRuleId) setPfRuleId(selectedVersion?.defaultPfRuleId || pfRules[0]?.id || '');
                  setCalculation(null);
                }}
                inputProps={{ 'aria-label': 'PF applicable for employee' }}
              />
            }
            label="PF applicable"
          />
        </Grid>
        <Grid size={{ xs: 12, md: 7 }}>
          <FormControl fullWidth disabled={!canManage || !pfApplicable || pfRulesError}>
            <InputLabel id={pfRuleLabelId}>PF rule</InputLabel>
            <Select
              labelId={pfRuleLabelId}
              label="PF rule"
              value={pfRuleId}
              onChange={(event) => { setPfRuleId(event.target.value); setCalculation(null); }}
            >
              {pfRules.map((rule: any) => <MenuItem key={rule.id} value={rule.id}>{rule.name}</MenuItem>)}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <Divider />
      <Box display="flex" justifyContent="space-between" gap={2} alignItems="center" flexWrap="wrap">
        <Box>
          <Box display="flex" gap={1} alignItems="center">
            <Typography variant="subtitle1">Employee-specific customization</Typography>
            {customizing && overrides.length ? <Chip size="small" color="warning" label="Customized" /> : null}
          </Box>
          <Typography variant="body2" color="text.secondary">
            Basic, DA, and ordinary rows can be customized. Statutory and balancing rows stay locked.
          </Typography>
        </Box>
        {canManage ? (
          <Box display="flex" gap={1}>
            {customizing ? (
              <Button startIcon={<RestartAlt />} onClick={resetToTemplate}>Reset to template</Button>
            ) : null}
            <Button
              variant="outlined"
              startIcon={<Tune />}
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
                    <Grid size={{ xs: 7 }}>
                      <FormControl fullWidth size="small">
                        <InputLabel id={`calculation-${rule.componentId}-label`}>
                          Calculation
                        </InputLabel>
                        <Select
                          labelId={`calculation-${rule.componentId}-label`}
                          label="Calculation"
                          value={override?.formulaType || rule.formulaType}
                          onChange={(event) =>
                            setOverride(rule.componentId, event.target.value, override?.value ?? rule.value ?? 0)
                          }
                        >
                          <MenuItem value="FIXED_AMOUNT">Fixed amount</MenuItem>
                          <MenuItem value="PERCENTAGE_OF_GROSS">Percent of gross</MenuItem>
                          <MenuItem value="PERCENTAGE_OF_BASIC">Percent of basic</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid size={{ xs: 5 }}>
                      <TextField
                        fullWidth
                        size="small"
                        type="number"
                        label="Value"
                        value={override?.value ?? rule.value ?? 0}
                        onChange={(event) =>
                          setOverride(rule.componentId, override?.formulaType || rule.formulaType, Number(event.target.value))
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
              required={overrides.length > 0}
              label="Customization reason"
              value={customizationReason}
              onChange={(event) => { setCustomizationReason(event.target.value); setCalculation(null); }}
              helperText="Required when any row differs from the source template."
            />
          </Grid>
        </Grid>
      ) : null}

      <Box display="flex" justifyContent="flex-end">
        <Button
          variant="outlined"
          startIcon={<Calculate />}
          onClick={calculateSalary}
          disabled={!canManage || calculationState.isLoading || protectionPolicy === 'PROTECT_GROSS' || monthlyAmount <= 0 || (pfApplicable && !pfRuleId)}
          sx={{ minHeight: 44 }}
        >
          Calculate
        </Button>
      </Box>

      {calculation ? (
        <Box display="grid" gap={2} aria-live="polite">
          <Grid container spacing={1.5}>
            <Grid size={{ xs: 6, md: 3 }}><Summary label="Full-month gross" amount={calculation.grossSalary} /></Grid>
            <Grid size={{ xs: 6, md: 3 }}><Summary label="Deductions" amount={calculation.totalDeductions} /></Grid>
            <Grid size={{ xs: 6, md: 3 }}><Summary label="Net salary" amount={calculation.netSalary} /></Grid>
            <Grid size={{ xs: 6, md: 3 }}><Summary label="Employer cost" amount={calculation.employerCost} /></Grid>
            <Grid size={{ xs: 6, md: 3 }}><Summary label="Entered monthly amount" amount={calculation.quotedMonthlyAmount} /></Grid>
            <Grid size={{ xs: 6, md: 3 }}><Summary label="Protected monthly target" amount={calculation.protectedMonthlyAmount} /></Grid>
          </Grid>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle1" mb={1}>Earnings</Typography>
                {calculation.earnings.map((line) => (
                  <Box key={`${line.componentId}-${line.code}`} display="flex" justifyContent="space-between" py={0.5}>
                    <Box display="flex" gap={0.75}>{line.name}{line.lineSource === 'CUSTOMIZED' ? <Chip size="small" label="Customized" /> : null}</Box>
                    <Typography>{formatCurrency(line.amount)}</Typography>
                  </Box>
                ))}
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle1" mb={1}>Deductions and employer contributions</Typography>
                {[...calculation.deductions, ...calculation.employerContributions].map((line) => (
                  <Box key={`${line.componentId}-${line.code}-${line.name}`} display="flex" justifyContent="space-between" py={0.5}>
                    <Box display="flex" gap={0.75}>{line.name}{line.lineSource === 'CUSTOMIZED' ? <Chip size="small" label="Customized" /> : null}</Box>
                    <Typography>{formatCurrency(line.amount)}</Typography>
                  </Box>
                ))}
              </Paper>
            </Grid>
          </Grid>
          <Alert severity={statutoryBlocked ? 'error' : calculation.employeeStateInsurance.registrationPending ? 'warning' : 'info'}>
            ESI: {contractLabel(calculation.employeeStateInsurance.coverageDecision || 'not evaluated')}.
            {calculation.employeeStateInsurance.registrationPending
              ? ' Registration is pending. Salary can be saved and the insurance number remains a visible follow-up.'
              : ''}
            {calculation.employeeStateInsurance.issueCodes.length
              ? ` ${calculation.employeeStateInsurance.issueCodes.map(contractLabel).join(', ')}.`
              : ''}
          </Alert>
          <Box display="flex" justifyContent="flex-end" gap={1} flexWrap="wrap">
            <Button
              variant="contained"
              onClick={save}
              disabled={!canManage || !calculationCurrent || statutoryBlocked || saveState.isLoading}
              sx={{ minHeight: 44 }}
            >
              Save salary
            </Button>
          </Box>
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
              sx={{ minHeight: 44 }}
            >
              Activate employee
            </Button>
          }
        >
          Salary is ready. Activate the employee when the remaining onboarding checks are complete.
        </Alert>
      ) : null}

      {revisionsError ? <Alert severity="error">Salary history could not be loaded.</Alert> : null}
      {revisionData?.items.length ? (
        <Box>
          <Typography variant="h6" mb={1}>Salary history</Typography>
          <Box display="grid" gap={1}>
            {revisionData.items.map((revision) => (
              <Paper key={revision.id} variant="outlined" sx={{ p: 1.5, display: 'flex', gap: 1.5, justifyContent: 'space-between', flexWrap: 'wrap' }}>
                <Box>
                  <Typography variant="subtitle2">
                    Revision {revision.revisionNumber} - {revision.effectiveMonth.slice(0, 7)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Template version {revision.sourceSalaryTemplateVersion || 'Legacy'}
                  </Typography>
                </Box>
                <Box display="flex" gap={1} alignItems="center">
                  {revision.isCurrent ? <Chip size="small" color="success" label="Current" /> : null}
                  {revision.isScheduled ? <Chip size="small" color="info" label="Scheduled" /> : null}
                  {revision.isCustomized ? <Chip size="small" color="warning" label="Customized" /> : null}
                  <Chip size="small" label={contractLabel(revision.status)} />
                  <Typography fontWeight={700}>{formatCurrency(revision.netSalary)}</Typography>
                </Box>
              </Paper>
            ))}
          </Box>
        </Box>
      ) : null}
    </Box>
  );
}
