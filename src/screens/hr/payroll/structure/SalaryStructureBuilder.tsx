'use client';

import type { FormikProps } from 'formik';
import type { RootState } from 'src/redux/store';
import type { SalaryBasis, ProtectionPolicy } from 'src/redux/hr/salary-template-api';

import { toast } from 'sonner';
import { useSelector } from 'react-redux';
import { fDate } from 'src/utils/format-time';
import { useGetPFQuery } from 'src/redux/PF/PFApi';
import { hrPermissions } from 'src/constants/hr-menus';
import { formatCurrency } from 'src/utils/cureencyFormater';
import { useRef, useMemo, useState, useEffect } from 'react';
import { hasGrantedPermission } from 'src/utils/permissions';
import { Calculate, ExpandMore, AutoAwesome } from '@mui/icons-material';
import { useGetEsiEstablishmentQuery } from 'src/redux/hr/statutory-scheme-api';
import {
  useCalculateSalaryTemplateMutation,
  useGetPublishedSalaryTemplatesQuery,
} from 'src/redux/hr/salary-template-api';
import {
  useGetCompensationRevisionsQuery,
  useCreateCompensationRevisionMutation,
  useUpdateCompensationRevisionMutation,
  useSubmitCompensationRevisionMutation,
  useRejectCompensationRevisionMutation,
  useApproveCompensationRevisionMutation,
} from 'src/redux/hr/compensation-revision-api';
import {
  Box,
  Grid,
  Chip,
  Alert,
  Paper,
  Dialog,
  Button,
  Select,
  Switch,
  Divider,
  MenuItem,
  Accordion,
  TextField,
  Typography,
  InputLabel,
  DialogTitle,
  FormControl,
  ToggleButton,
  DialogContent,
  DialogActions,
  FormControlLabel,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
  ToggleButtonGroup,
} from '@mui/material';

import { getLocalMonthKey, isEffectiveForMonth } from './salary-structure-builder-utils';

type Props = {
  formik: FormikProps<any>;
  employeeId?: string;
};

const Summary = ({ label, value }: { label: string; value: number }) => (
  <Paper variant="outlined" sx={{ p: 1.5, height: '100%' }}>
    <Typography variant="caption" color="text.secondary">
      {label}
    </Typography>
    <Typography variant="subtitle1" fontWeight={700}>
      {formatCurrency(value)}
    </Typography>
  </Paper>
);

const monthPayload = (month: string) => `${month}-01T00:00:00.000Z`;

const formatContractLabel = (value: string) =>
  value
    .toLowerCase()
    .replaceAll('_', ' ')
    .replace(/(^|\s)\S/g, (character) => character.toUpperCase());

export function SalaryStructureBuilder({ formik, employeeId }: Props) {
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const currentUserId = useSelector((state: RootState) => state.auth.user?.sub as string | undefined);
  const revisionPermissions = hrPermissions.payroll.compensationRevisionActions;
  const canViewRevisions = hasGrantedPermission(permissions, revisionPermissions.view);
  const canCreateRevision = hasGrantedPermission(permissions, revisionPermissions.create);
  const canEditRevision = hasGrantedPermission(permissions, revisionPermissions.edit);
  const canSubmitRevision = hasGrantedPermission(permissions, revisionPermissions.submit);
  const canApproveRevision = hasGrantedPermission(permissions, revisionPermissions.approve);
  const {
    data: templateData,
    isLoading: templatesLoading,
    isError: templatesError,
  } = useGetPublishedSalaryTemplatesQuery();
  const { data: pfData, isError: pfRulesError } = useGetPFQuery({});
  const { data: esiEstablishment } = useGetEsiEstablishmentQuery();
  const [calculate, calculationState] = useCalculateSalaryTemplateMutation();
  const {
    data: revisionData,
    isLoading: revisionsLoading,
    isError: revisionsError,
    isSuccess: revisionsLoaded,
  } = useGetCompensationRevisionsQuery(employeeId || '', {
    skip: !employeeId || !canViewRevisions,
  });
  const [createRevision, createRevisionState] = useCreateCompensationRevisionMutation();
  const [updateRevision, updateRevisionState] = useUpdateCompensationRevisionMutation();
  const [submitRevision, submitRevisionState] = useSubmitCompensationRevisionMutation();
  const [approveRevision, approveRevisionState] = useApproveCompensationRevisionMutation();
  const [rejectRevision, rejectRevisionState] = useRejectCompensationRevisionMutation();
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [salaryBasis, setSalaryBasis] = useState<SalaryBasis>('EMPLOYER_COST');
  const [protectionPolicy, setProtectionPolicy] =
    useState<ProtectionPolicy>('PROTECT_EMPLOYER_COST');
  const [effectiveMonth, setEffectiveMonth] = useState(getLocalMonthKey);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectDialogRevisionId, setRejectDialogRevisionId] = useState<string | null>(null);
  const [monthlyAmount, setMonthlyAmount] = useState<number>(
    Number(formik.values.quotedMonthlyAmount || 0)
  );
  const [pfApplicable, setPfApplicable] = useState(Boolean(formik.values.pfRule));
  const [pfRuleId, setPfRuleId] = useState<string>(formik.values.pfRule || '');
  const [calculationInputKey, setCalculationInputKey] = useState('');
  const [attemptedInputKey, setAttemptedInputKey] = useState('');
  const initializedEmployeeRef = useRef('');

  const templates = useMemo(
    () =>
      templateData?.items?.filter((item) => item.status === 'PUBLISHED' && item.published) || [],
    [templateData?.items]
  );
  const defaultTemplate = templates.find((item) => item.isDefault) || templates[0];
  const editableRevision = revisionData?.items.find((item) => item.status === 'DRAFT');
  const effectiveTemplateId = selectedTemplateId || defaultTemplate?.id || '';
  const selectedTemplate = templates.find((item) => item.id === effectiveTemplateId);

  useEffect(() => {
    if (employeeId && canViewRevisions && !revisionsLoaded) return;

    const revision = editableRevision || revisionData?.items[0];
    const legacyTemplateId = formik.values.sourceSalaryTemplateId || '';
    const initializationKey = revision
      ? `${employeeId}:${revision.id}`
      : `${employeeId || 'new'}:legacy:${legacyTemplateId}:${formik.values.quotedMonthlyAmount || 0}:${defaultTemplate?.id || ''}`;
    if (initializedEmployeeRef.current === initializationKey) return;

    if (revision) {
      setSelectedTemplateId(revision.sourceSalaryTemplateId || '');
      setSalaryBasis(revision.salaryBasis);
      setProtectionPolicy(revision.protectionPolicy);
      setMonthlyAmount(revision.quotedMonthlyAmount);
      setEffectiveMonth(revision.effectiveMonth.slice(0, 7));
      setPfApplicable(Boolean(revision.pfRuleId));
      setPfRuleId(revision.pfRuleId || '');
    } else {
      const initialTemplate =
        templates.find((item) => item.id === legacyTemplateId) || defaultTemplate;
      setSelectedTemplateId(initialTemplate?.id || '');
      setSalaryBasis(
        ['GROSS', 'TAKE_HOME', 'EMPLOYER_COST'].includes(formik.values.quotedSalaryBasis)
          ? formik.values.quotedSalaryBasis
          : initialTemplate?.published?.defaultSalaryBasis || 'EMPLOYER_COST'
      );
      setProtectionPolicy(
        initialTemplate?.published?.defaultProtectionPolicy || 'PROTECT_EMPLOYER_COST'
      );
      setMonthlyAmount(Number(formik.values.quotedMonthlyAmount || 0));
      setPfApplicable(Boolean(formik.values.pfRule));
      setPfRuleId(formik.values.pfRule || '');
    }
    setCalculationInputKey('');
    setAttemptedInputKey('');
    initializedEmployeeRef.current = initializationKey;
  }, [
    canViewRevisions,
    defaultTemplate,
    editableRevision,
    employeeId,
    formik.values.pfRule,
    formik.values.quotedMonthlyAmount,
    formik.values.quotedSalaryBasis,
    formik.values.sourceSalaryTemplateId,
    revisionData?.items,
    revisionsLoaded,
    templates,
  ]);

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplateId(templateId);
    const template = templates.find((item) => item.id === templateId);
    if (!template?.published) return;
    setSalaryBasis(template.published.defaultSalaryBasis || 'EMPLOYER_COST');
    setProtectionPolicy(
      template.published.defaultProtectionPolicy || 'PROTECT_EMPLOYER_COST'
    );
  };

  const pfRules = (pfData?.items || []).filter(
    (rule: any) =>
      rule.isActive !== false && isEffectiveForMonth(rule, effectiveMonth)
  );
  const effectivePfRuleId = pfApplicable
    ? pfRules.some((rule: any) => rule.id === pfRuleId)
      ? pfRuleId
      : pfRules[0]?.id || ''
    : '';
  const currentInputKey = [
    selectedTemplate?.published?.id,
    salaryBasis,
    protectionPolicy,
    monthlyAmount,
    effectiveMonth,
    effectivePfRuleId,
  ].join('|');
  const result = calculationInputKey === currentInputKey ? calculationState.data : undefined;

  const handleCalculate = async () => {
    if (!selectedTemplate?.published?.id || monthlyAmount <= 0) return;
    setAttemptedInputKey(currentInputKey);
    try {
      await calculate({
        templateVersionId: selectedTemplate.published.id,
        salaryBasis,
        protectionPolicy,
        monthlyAmount,
        effectiveMonth: monthPayload(effectiveMonth),
        employeeId,
        pfRuleId: effectivePfRuleId || null,
      }).unwrap();
      setCalculationInputKey(currentInputKey);
    } catch {
      setCalculationInputKey('');
    }
  };

  const buildQuote = () => ({
    templateVersionId: result!.templateVersionId,
    salaryBasis,
    protectionPolicy,
    monthlyAmount,
    effectiveMonth: monthPayload(effectiveMonth),
    pfRuleId: effectivePfRuleId || null,
    statutoryProfile: 'IN-GJ' as const,
  });

  const saveDraft = async () => {
    if (!result || !employeeId) return null;
    try {
      if (editableRevision) {
        if (!canEditRevision) {
          toast.error('You do not have permission to edit this draft.');
          return null;
        }
        return await updateRevision({
          employeeId,
          revisionId: editableRevision.id,
          quote: buildQuote(),
        }).unwrap();
      }
      if (!canCreateRevision) {
        toast.error('You do not have permission to create a compensation revision.');
        return null;
      }
      return await createRevision({ employeeId, quote: buildQuote() }).unwrap();
    } catch (error: any) {
      toast.error(error?.data?.error?.message || 'Unable to save the compensation draft.');
      return null;
    }
  };

  const handleSaveDraft = async () => {
    const revision = await saveDraft();
    if (revision) toast.success(`Compensation revision ${revision.revisionNumber} saved as draft.`);
  };

  const handleCreateRevision = async () => {
    if (!canSubmitRevision) {
      toast.error('You do not have permission to submit compensation revisions.');
      return;
    }
    const revision = await saveDraft();
    if (!revision || !employeeId) return;
    try {
      await submitRevision({ employeeId, revisionId: revision.id }).unwrap();
      toast.success(`Compensation revision ${revision.revisionNumber} submitted for approval.`);
    } catch (error: any) {
      toast.warning(
        error?.data?.error?.message ||
          `Revision ${revision.revisionNumber} was saved as a draft but could not be submitted.`
      );
    }
  };

  const handleSubmitDraft = async (revisionId: string) => {
    if (!employeeId) return;
    try {
      await submitRevision({ employeeId, revisionId }).unwrap();
      toast.success('Compensation revision submitted for approval.');
    } catch (error: any) {
      toast.error(error?.data?.error?.message || 'Unable to submit this draft.');
    }
  };

  const handleApprove = async (revisionId: string) => {
    if (!employeeId) return;
    try {
      await approveRevision({ employeeId, revisionId }).unwrap();
      toast.success('Compensation revision approved.');
    } catch (error: any) {
      toast.error(error?.data?.error?.message || 'Unable to approve this revision.');
    }
  };

  const handleReject = async (revisionId: string) => {
    if (!employeeId) return;
    if (!rejectionReason.trim()) {
      toast.error('Enter a rejection reason.');
      return;
    }
    try {
      await rejectRevision({ employeeId, revisionId, reason: rejectionReason.trim() }).unwrap();
      setRejectionReason('');
      setRejectDialogRevisionId(null);
      toast.success('Compensation revision rejected.');
    } catch (error: any) {
      toast.error(error?.data?.error?.message || 'Unable to reject this revision.');
    }
  };

  return (
    <Grid size={{ xs: 12 }}>
      <Paper variant="outlined" sx={{ p: { xs: 1.5, md: 2 }, mb: 1 }}>
        <Box display="flex" alignItems="center" gap={1} mb={0.5}>
          <AutoAwesome color="primary" fontSize="small" />
          <Typography variant="subtitle1" fontWeight={700}>
            Compensation quote
          </Typography>
          <Chip label="Revision controlled" color="primary" variant="soft" size="small" />
        </Box>
        <Typography variant="body2" color="text.secondary" mb={2}>
          Enter the school&apos;s monthly commitment, verify the calculation, then save an immutable
          compensation revision for approval. One-time components remain separate below.
        </Typography>

        {formik.values.sourceSalaryTemplateVersion && (
          <Alert
            severity={formik.values.wasModifiedAfterGeneration ? 'warning' : 'info'}
            sx={{ mb: 2 }}
          >
            Generated from template version {formik.values.sourceSalaryTemplateVersion}
            {formik.values.salaryGeneratedAt ? ` on ${fDate(formik.values.salaryGeneratedAt)}` : ''}
            {formik.values.wasModifiedAfterGeneration ? '. Components were edited afterward.' : '.'}
          </Alert>
        )}

        <Grid container spacing={1.5} alignItems="center">
          <Grid size={{ xs: 12, md: 4 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Salary template</InputLabel>
              <Select
                label="Salary template"
                value={effectiveTemplateId}
                disabled={templatesLoading}
                inputProps={{ name: 'salaryTemplate' }}
                onChange={(event) => handleTemplateChange(event.target.value)}
              >
                {templates.map((template) => (
                  <MenuItem key={template.id} value={template.id}>
                    {template.name} {template.isDefault ? '(Default)' : ''}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <ToggleButtonGroup
              exclusive
              fullWidth
              size="small"
              value={salaryBasis}
              onChange={(_event, value: SalaryBasis | null) => value && setSalaryBasis(value)}
              aria-label="Quoted salary basis"
              sx={{ '& .MuiToggleButton-root': { minHeight: 44 } }}
            >
              <ToggleButton value="GROSS">Gross</ToggleButton>
              <ToggleButton value="TAKE_HOME">Take-home</ToggleButton>
              <ToggleButton value="EMPLOYER_COST">Employer cost</ToggleButton>
            </ToggleButtonGroup>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <TextField
                fullWidth
                size="small"
                name="quotedMonthlySalary"
                type="number"
                label="Quoted monthly salary"
                value={monthlyAmount || ''}
                inputProps={{ min: 1, step: 0.01, inputMode: 'decimal' }}
              onChange={(event) => setMonthlyAmount(Number(event.target.value))}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 2 }}>
            <Button
              fullWidth
              variant="contained"
              startIcon={
                calculationState.isLoading ? <CircularProgress size={16} /> : <Calculate />
              }
              disabled={
                !selectedTemplate ||
                monthlyAmount <= 0 ||
                calculationState.isLoading ||
                (pfApplicable && !effectivePfRuleId)
              }
              onClick={handleCalculate}
            >
              Calculate
            </Button>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Protection policy</InputLabel>
              <Select
                label="Protection policy"
                value={protectionPolicy}
                inputProps={{ name: 'protectionPolicy' }}
                onChange={(event) => setProtectionPolicy(event.target.value as ProtectionPolicy)}
              >
                <MenuItem value="PROTECT_EMPLOYER_COST">Protect employer cost</MenuItem>
                <MenuItem value="PROTECT_GROSS">Protect gross salary</MenuItem>
                <MenuItem value="PROTECT_TAKE_HOME">Protect take-home salary</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <TextField
                fullWidth
                size="small"
                name="effectiveMonth"
              type="month"
              label="Effective month"
              value={effectiveMonth}
              onChange={(event) => setEffectiveMonth(event.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <FormControlLabel
              control={
                <Switch
                  name="pfApplicable"
                  checked={pfApplicable}
                  onChange={(event) => setPfApplicable(event.target.checked)}
                />
              }
              label="PF applicable"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 8 }}>
            <FormControl fullWidth size="small" disabled={!pfApplicable}>
              <InputLabel>PF rule</InputLabel>
              <Select
                label="PF rule"
                value={effectivePfRuleId}
                inputProps={{ name: 'pfRule' }}
                onChange={(event) => setPfRuleId(event.target.value)}
              >
                {pfRules.map((rule: any) => (
                  <MenuItem key={rule.id} value={rule.id}>
                    {rule.name} - {rule.employeePercentage}% employee
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {templatesError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            Salary templates could not be loaded. Try again before calculating.
          </Alert>
        )}
        {!templatesLoading && !templatesError && templates.length === 0 && (
          <Alert severity="info" sx={{ mt: 2 }}>
            Publish a salary template in Payroll settings before using this builder.
          </Alert>
        )}
        {pfApplicable && pfRulesError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            PF rules could not be loaded. Turn off PF or try again.
          </Alert>
        )}
        {pfApplicable && !pfRulesError && pfRules.length === 0 && (
          <Alert severity="info" sx={{ mt: 2 }}>
            No effective PF rule is available. Turn off PF or configure an active rule.
          </Alert>
        )}

        {esiEstablishment?.status === 'Active' ? (
          <Alert severity="info" sx={{ mt: 2 }}>
            ESI is system-managed. Payroll will evaluate coverage and calculate both employee and
            employer contributions from statutory wages, even when this template has no ESI row.
          </Alert>
        ) : esiEstablishment?.status === 'Ready' ? (
          <Alert severity="warning" sx={{ mt: 2 }}>
            ESI setup is ready but not active. Complete the impact review in Payroll settings before
            relying on ESI calculations.
          </Alert>
        ) : null}

        {calculationState.isError && attemptedInputKey === currentInputKey && (
          <Alert severity="error" sx={{ mt: 2 }}>
            Unable to calculate this salary structure. Review the amount, template, and statutory
            rule selections.
          </Alert>
        )}

        {result && (
          <Box mt={2}>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={1.25}>
              <Grid size={{ xs: 6, md: 2 }}>
                <Summary label="Gross" value={result.grossSalary} />
              </Grid>
              <Grid size={{ xs: 6, md: 2 }}>
                <Summary label="Basic" value={result.basicSalary} />
              </Grid>
              <Grid size={{ xs: 6, md: 2 }}>
                <Summary label="Deductions" value={result.totalDeductions} />
              </Grid>
              <Grid size={{ xs: 6, md: 2 }}>
                <Summary label="Net salary" value={result.netSalary} />
              </Grid>
              <Grid size={{ xs: 6, md: 2 }}>
                <Summary label="Employer contributions" value={result.employerContributionTotal} />
              </Grid>
              <Grid size={{ xs: 6, md: 2 }}>
                <Summary label="Employer cost" value={result.employerCost} />
              </Grid>
            </Grid>
            {result.warnings.map((warning) => (
              <Alert key={warning} severity="warning" sx={{ mt: 1.5 }}>
                {warning}
              </Alert>
            ))}
            {!result.targetResult.isExact && (
              <Alert severity="warning" sx={{ mt: 1.5 }}>
                The closest valid result differs from the quote by{' '}
                {formatCurrency(Math.abs(result.targetResult.difference))}. The selected protection
                policy remains the payroll comparison target.
              </Alert>
            )}
            {result.employeeStateInsurance.isConfigured && (
              <Alert
                severity={result.employeeStateInsurance.issueCodes.length ? 'warning' : 'info'}
                sx={{ mt: 1.5 }}
              >
                ESI: {result.employeeStateInsurance.isCovered ? 'covered' : 'not covered'}
                {result.employeeStateInsurance.coverageDecision
                  ? ` (${formatContractLabel(result.employeeStateInsurance.coverageDecision)})`
                  : ''}
                . Statutory wages {formatCurrency(result.employeeStateInsurance.statutoryWages)},
                employee share {formatCurrency(result.employeeStateInsurance.employeeContribution)},
                employer share {formatCurrency(result.employeeStateInsurance.employerContribution)}
                {result.employeeStateInsurance.governmentContribution > 0
                  ? `, government share ${formatCurrency(result.employeeStateInsurance.governmentContribution)}`
                  : ''}
                .
              </Alert>
            )}
            <Grid container spacing={1.25} mt={0.25}>
              {[
                { title: 'Earnings', lines: result.earnings },
                { title: 'Employee deductions', lines: result.deductions },
                { title: 'Employer contributions', lines: result.employerContributions },
              ].map((group) => (
                <Grid key={group.title} size={{ xs: 12, md: 4 }}>
                  <Paper variant="outlined" sx={{ p: 1.5, height: '100%' }}>
                    <Typography variant="subtitle2" mb={1}>
                      {group.title}
                    </Typography>
                    {group.lines.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">
                        None
                      </Typography>
                    ) : (
                      group.lines.map((line) => (
                        <Box
                          key={`${group.title}-${line.code}`}
                          display="flex"
                          justifyContent="space-between"
                          gap={1}
                          mb={0.75}
                        >
                          <Box>
                            <Typography variant="body2">{line.name}</Typography>
                            {line.lineSource === 'SYSTEM_STATUTORY' && (
                              <Typography variant="caption" color="text.secondary">
                                System-managed
                              </Typography>
                            )}
                          </Box>
                          <Typography variant="body2" fontWeight={600}>
                            {formatCurrency(line.amount)}
                          </Typography>
                        </Box>
                      ))
                    )}
                  </Paper>
                </Grid>
              ))}
            </Grid>
            <Accordion
              disableGutters
              elevation={0}
              sx={{ mt: 1.5, border: 1, borderColor: 'divider' }}
            >
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="subtitle2">Formula breakdown</Typography>
              </AccordionSummary>
              <AccordionDetails>
                {result.formulaTrace.map((line) => (
                  <Typography key={line} variant="body2" color="text.secondary" gutterBottom>
                    {line}
                  </Typography>
                ))}
              </AccordionDetails>
            </Accordion>
            <Box display="flex" justifyContent="flex-end" gap={1} flexWrap="wrap" mt={1.5}>
              {(canCreateRevision || (editableRevision && canEditRevision)) && (
                <Button
                  variant="outlined"
                  disabled={
                    !employeeId ||
                    createRevisionState.isLoading ||
                    updateRevisionState.isLoading ||
                    submitRevisionState.isLoading
                  }
                  onClick={handleSaveDraft}
                >
                  {editableRevision ? 'Update draft' : 'Save draft'}
                </Button>
              )}
              {canSubmitRevision &&
                (canCreateRevision || (editableRevision && canEditRevision)) && (
                  <Button
                    variant="contained"
                    disabled={
                      !employeeId ||
                      createRevisionState.isLoading ||
                      updateRevisionState.isLoading ||
                      submitRevisionState.isLoading
                    }
                    onClick={handleCreateRevision}
                  >
                    Save and submit for approval
                  </Button>
                )}
            </Box>
            {!employeeId && (
              <Alert severity="info" sx={{ mt: 1.5 }}>
                Save the employee first, then submit the initial recurring compensation revision
                from this payroll step.
              </Alert>
            )}
          </Box>
        )}

        {canViewRevisions && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" fontWeight={700} mb={1}>
              Compensation revision history
            </Typography>
        {!employeeId ? (
          <Alert severity="info">
            Revision history becomes available after the employee is saved.
          </Alert>
        ) : revisionsLoading ? (
          <CircularProgress size={22} />
        ) : revisionsError ? (
          <Alert severity="error" role="alert">
            Compensation revisions could not be loaded. Close the dialog and try again.
          </Alert>
        ) : revisionData?.items.length ? (
          <Box display="grid" gap={1}>
            {revisionData.items.map((revision) => (
              <Paper key={revision.id} variant="outlined" sx={{ p: 1.5 }}>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems={{ xs: 'flex-start', sm: 'center' }}
                  flexDirection={{ xs: 'column', sm: 'row' }}
                  gap={1}
                >
                  <Box>
                    <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                      <Typography variant="subtitle2">
                        Revision {revision.revisionNumber}
                      </Typography>
                      <Chip
                        size="small"
                        label={formatContractLabel(revision.status)}
                        color={
                          revision.status === 'APPROVED'
                            ? 'success'
                            : revision.status === 'REJECTED'
                              ? 'error'
                              : revision.status === 'PENDING_APPROVAL'
                                ? 'warning'
                                : 'default'
                        }
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Effective {revision.effectiveMonth.slice(0, 7)} ·{' '}
                      {formatContractLabel(revision.salaryBasis)}{' '}
                      {formatCurrency(revision.quotedMonthlyAmount)}
                      {' · '}Gross {formatCurrency(revision.grossSalary)} · Employer cost{' '}
                      {formatCurrency(revision.employerCost)}
                    </Typography>
                    {revision.rejectionReason && (
                      <Typography variant="body2" color="error.main">
                        {revision.rejectionReason}
                      </Typography>
                    )}
                  </Box>
                  {revision.status === 'DRAFT' && canSubmitRevision && (
                    <Button
                      variant="contained"
                      disabled={submitRevisionState.isLoading}
                      onClick={() => handleSubmitDraft(revision.id)}
                    >
                      Submit for approval
                    </Button>
                  )}
                  {revision.status === 'PENDING_APPROVAL' && canApproveRevision &&
                    (revision.creatorId === currentUserId ||
                    revision.submittedByUserId === currentUserId ? (
                      <Typography variant="caption" color="text.secondary">
                        Awaiting a different approver.
                      </Typography>
                    ) : (
                      <Box display="flex" gap={1} flexWrap="wrap" alignItems="center">
                        <Button
                          variant="outlined"
                          color="error"
                          disabled={rejectRevisionState.isLoading}
                          onClick={() => {
                            setRejectionReason('');
                            setRejectDialogRevisionId(revision.id);
                          }}
                        >
                          Reject
                        </Button>
                        <Button
                          variant="contained"
                          color="success"
                          disabled={approveRevisionState.isLoading}
                          onClick={() => handleApprove(revision.id)}
                        >
                          Approve
                        </Button>
                      </Box>
                    ))}
                </Box>
              </Paper>
            ))}
          </Box>
        ) : (
          <Alert severity="warning">
            No compensation revision exists. Payroll cannot be locked until a separate approver
            approves the first revision.
          </Alert>
        )}
          </>
        )}
        <Dialog
          open={Boolean(rejectDialogRevisionId)}
          onClose={rejectRevisionState.isLoading ? undefined : () => setRejectDialogRevisionId(null)}
          fullWidth
          maxWidth="xs"
        >
          <DialogTitle>Reject compensation revision?</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              The maker will need to create or update a draft before submitting again.
            </Typography>
            <TextField
              autoFocus
              fullWidth
              required
              name="rejectionReason"
              label="Rejection reason"
              value={rejectionReason}
              onChange={(event) => setRejectionReason(event.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setRejectDialogRevisionId(null)}
              disabled={rejectRevisionState.isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="error"
              disabled={!rejectionReason.trim() || rejectRevisionState.isLoading}
              onClick={() => rejectDialogRevisionId && handleReject(rejectDialogRevisionId)}
            >
              Reject revision
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Grid>
  );
}
