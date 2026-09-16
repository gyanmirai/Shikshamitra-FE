'use client';

import type { FormikProps } from 'formik';
import type { RootState } from 'src/redux/store';
import type {
  SalaryBasis,
  ProtectionPolicy,
  SalaryTemplateRule,
  SalaryTemplateComponentCatalogItem,
} from 'src/redux/hr/salary-template-api';

import * as Yup from 'yup';
import { toast } from 'sonner';
import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import { useGetPFQuery } from 'src/redux/PF/PFApi';
import { hrPermissions } from 'src/constants/hr-menus';
import { formatCurrency } from 'src/utils/cureencyFormater';
import { useRef, useMemo, useState, useEffect } from 'react';
import { hasGrantedPermission } from 'src/utils/permissions';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { CustomStepperWithFormik } from 'src/components/custom-stepper';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { Add, Close, Delete, ArrowUpward, ArrowDownward } from '@mui/icons-material';
import {
  useGetSalaryTemplateQuery,
  useCreateSalaryTemplateMutation,
  useUpdateSalaryTemplateMutation,
  useGetSalaryTemplateVersionsQuery,
  useCalculateSalaryTemplateMutation,
  useGetSalaryTemplateComponentCatalogQuery,
} from 'src/redux/hr/salary-template-api';
import {
  Box,
  Chip,
  Grid,
  Card,
  Alert,
  Button,
  Select,
  Switch,
  MenuItem,
  TextField,
  IconButton,
  Typography,
  InputLabel,
  CardContent,
  FormControl,
  Autocomplete,
  DialogActions,
  CircularProgress,
  FormControlLabel,
} from '@mui/material';

import {
  getSaveIssues,
  getRoleOptions,
  formatRuleLabel,
  applyFormulaType,
  getFormulaOptions,
  applySemanticType,
  createTemplateRule,
  normalizeRuleOrder,
  formulaAcceptsValue,
  getAutomaticFormulaSemanticType,
} from './salary-template-editor-utils';

type EditorMode = 'create' | 'edit' | 'view';
type EditorValues = {
  name: string;
  description: string;
  defaultSalaryBasis: SalaryBasis;
  defaultProtectionPolicy: ProtectionPolicy;
  defaultPfApplicable: boolean;
  defaultPfRuleId: string;
  rules: SalaryTemplateRule[];
};

type Props = {
  templateId?: string;
  mode?: EditorMode;
  onClose?: () => void;
  onSaved?: () => void;
  onDirtyChange?: (dirty: boolean) => void;
};

const steps = ['Details', 'Earnings', 'Deductions and statutory setup', 'Review'];
const editorSchema = Yup.object({
  name: Yup.string().trim().required('Template name is required.').max(160),
  description: Yup.string().trim().max(500),
  defaultSalaryBasis: Yup.string().required(),
  defaultProtectionPolicy: Yup.string().required(),
  defaultPfRuleId: Yup.string().when('defaultPfApplicable', {
    is: true,
    then: (schema) => schema.required('Choose the default PF rule.'),
  }),
});
const uniqueRoles = new Set([
  'BASIC',
  'BALANCING_EARNING',
  'EMPLOYEE_PROVIDENT_FUND',
  'PROFESSIONAL_TAX',
]);

function operationKey() {
  return globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`;
}

function RuleSection({
  title,
  lineKind,
  formik,
  componentNames,
  readOnly,
  onAdd,
}: {
  title: string;
  lineKind: SalaryTemplateRule['lineKind'];
  formik: FormikProps<EditorValues>;
  componentNames: Map<string, string>;
  readOnly: boolean;
  onAdd: () => void;
}) {
  const rules = formik.values.rules.filter((rule) => rule.lineKind === lineKind);
  const usedRoles = new Set(formik.values.rules.map((rule) => rule.semanticType));
  const setRules = (rulesValue: SalaryTemplateRule[]) =>
    formik.setFieldValue('rules', normalizeRuleOrder(rulesValue));
  const updateRule = (componentId: string, updated: SalaryTemplateRule) =>
    setRules(formik.values.rules.map((rule) => (rule.componentId === componentId ? updated : rule)));
  const moveRule = (componentId: string, direction: -1 | 1) => {
    const sameKind = formik.values.rules.filter((rule) => rule.lineKind === lineKind);
    const index = sameKind.findIndex((rule) => rule.componentId === componentId);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= sameKind.length) return;
    [sameKind[index], sameKind[target]] = [sameKind[target], sameKind[index]];
    const otherKind = formik.values.rules.filter((rule) => rule.lineKind !== lineKind);
    setRules(lineKind === 'EARNING' ? [...sameKind, ...otherKind] : [...otherKind, ...sameKind]);
  };

  return (
    <Box display="grid" gap={2}>
      <Box display="flex" justifyContent="space-between" alignItems="center" gap={2}>
        <Box>
          <Typography variant="h6">{title}</Typography>
          <Typography variant="body2" color="text.secondary">
            {rules.length} component{rules.length === 1 ? '' : 's'} configured
          </Typography>
        </Box>
        {!readOnly ? (
          <Button variant="outlined" startIcon={<Add />} onClick={onAdd} sx={{ minHeight: 44 }}>
            Add {lineKind === 'EARNING' ? 'earning' : 'deduction'}
          </Button>
        ) : null}
      </Box>
      {!rules.length ? (
        <Alert severity="info">No {title.toLowerCase()} have been configured.</Alert>
      ) : (
        rules.map((rule, index) => {
          const acceptsValue = formulaAcceptsValue(rule.formulaType);
          const basisOptions = formik.values.rules.filter(
            (candidate) =>
              candidate.componentId !== rule.componentId &&
              candidate.lineKind === 'EARNING' &&
              candidate.displayOrder < rule.displayOrder
          );
          return (
            <Card key={rule.componentId} variant="outlined">
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Grid container spacing={1.5} alignItems="center">
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Typography variant="subtitle2">
                      {componentNames.get(rule.componentId) || 'Unavailable component'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatRuleLabel(rule.semanticType)}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <FormControl fullWidth size="small" disabled={readOnly}>
                      <InputLabel id={`purpose-${rule.componentId}`}>Purpose</InputLabel>
                      <Select
                        labelId={`purpose-${rule.componentId}`}
                        label="Purpose"
                        value={rule.semanticType}
                        onChange={(event) =>
                          updateRule(rule.componentId, applySemanticType(rule, event.target.value))
                        }
                      >
                        {getRoleOptions(lineKind).map((role) => (
                          <MenuItem
                            key={role}
                            value={role}
                            disabled={
                              uniqueRoles.has(role) && role !== rule.semanticType && usedRoles.has(role)
                            }
                          >
                            {formatRuleLabel(role)}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <FormControl fullWidth size="small" disabled={readOnly}>
                      <InputLabel id={`formula-${rule.componentId}`}>Calculation</InputLabel>
                      <Select
                        labelId={`formula-${rule.componentId}`}
                        label="Calculation"
                        value={rule.formulaType}
                        onChange={(event) =>
                          updateRule(rule.componentId, applyFormulaType(rule, event.target.value))
                        }
                      >
                        {getFormulaOptions(rule).map((formula) => {
                          const automaticRole = getAutomaticFormulaSemanticType(formula);
                          return (
                            <MenuItem
                              key={formula}
                              value={formula}
                              disabled={
                                automaticRole !== null &&
                                automaticRole !== rule.semanticType &&
                                usedRoles.has(automaticRole)
                              }
                            >
                              {formatRuleLabel(formula)}
                            </MenuItem>
                          );
                        })}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      size="small"
                      type="number"
                      label={acceptsValue ? (rule.formulaType.startsWith('PERCENTAGE') ? 'Percent' : 'Amount') : 'Automatic'}
                      disabled={readOnly || !acceptsValue}
                      value={acceptsValue ? (rule.value ?? '') : ''}
                      onChange={(event) =>
                        updateRule(rule.componentId, {
                          ...rule,
                          value: event.target.value === '' ? null : Number(event.target.value),
                        })
                      }
                      slotProps={{ htmlInput: { min: 0, step: 0.01 } }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControl
                      fullWidth
                      size="small"
                      disabled={readOnly || rule.formulaType !== 'PERCENTAGE_OF_COMPONENT'}
                    >
                      <InputLabel>Basis component</InputLabel>
                      <Select
                        label="Basis component"
                        value={rule.basisComponentId || ''}
                        onChange={(event) =>
                          updateRule(rule.componentId, {
                            ...rule,
                            basisComponentId: event.target.value || null,
                          })
                        }
                      >
                        {basisOptions.map((candidate) => (
                          <MenuItem key={candidate.componentId} value={candidate.componentId}>
                            {componentNames.get(candidate.componentId)}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  {!readOnly ? (
                    <Grid size={{ xs: 12 }}>
                      <Box display="flex" justifyContent="flex-end">
                        <IconButton
                          aria-label={`Move ${componentNames.get(rule.componentId)} up`}
                          disabled={index === 0}
                          onClick={() => moveRule(rule.componentId, -1)}
                          sx={{ minWidth: 44, minHeight: 44 }}
                        >
                          <ArrowUpward fontSize="small" />
                        </IconButton>
                        <IconButton
                          aria-label={`Move ${componentNames.get(rule.componentId)} down`}
                          disabled={index === rules.length - 1}
                          onClick={() => moveRule(rule.componentId, 1)}
                          sx={{ minWidth: 44, minHeight: 44 }}
                        >
                          <ArrowDownward fontSize="small" />
                        </IconButton>
                        <IconButton
                          aria-label={`Remove ${componentNames.get(rule.componentId)}`}
                          color="error"
                          onClick={() =>
                            setRules(
                              formik.values.rules.filter(
                                (candidate) => candidate.componentId !== rule.componentId
                              )
                            )
                          }
                          sx={{ minWidth: 44, minHeight: 44 }}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Box>
                    </Grid>
                  ) : null}
                </Grid>
              </CardContent>
            </Card>
          );
        })
      )}
    </Box>
  );
}

export default function SalaryTemplateEditor({
  templateId,
  mode = 'edit',
  onClose,
  onSaved,
  onDirtyChange,
}: Props) {
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const canAdd = hasGrantedPermission(
    permissions,
    hrPermissions.payroll.settings.salaryTemplateActions.add
  );
  const canEdit = hasGrantedPermission(
    permissions,
    hrPermissions.payroll.settings.salaryTemplateActions.edit
  );
  const isCreate = mode === 'create';
  const {
    data: template,
    isLoading: templateLoading,
    isError: templateError,
    refetch,
  } = useGetSalaryTemplateQuery(templateId || '', { skip: !templateId });
  const { data: catalogData, isLoading: catalogLoading, isError: catalogError } =
    useGetSalaryTemplateComponentCatalogQuery();
  const { data: pfData, isError: pfError } = useGetPFQuery({});
  const { data: versionData } = useGetSalaryTemplateVersionsQuery(templateId || '', {
    skip: !templateId,
  });
  const [createTemplate, createState] = useCreateSalaryTemplateMutation();
  const [updateTemplate, updateState] = useUpdateSalaryTemplateMutation();
  const [calculate, calculationState] = useCalculateSalaryTemplateMutation();
  const [activeStep, setActiveStep] = useState(0);
  const [addKind, setAddKind] = useState<SalaryTemplateRule['lineKind'] | null>(null);
  const [selectedComponent, setSelectedComponent] =
    useState<SalaryTemplateComponentCatalogItem | null>(null);
  const [serverError, setServerError] = useState('');
  const [sampleAmount, setSampleAmount] = useState(50000);
  const operationKeyRef = useRef('');
  const readOnly = mode === 'view' || template?.status === 'ARCHIVED' || (isCreate ? !canAdd : !canEdit);
  const version = template?.editableVersion;
  const initialValues = useMemo<EditorValues>(
    () => ({
      name: template?.name || '',
      description: template?.description || '',
      defaultSalaryBasis: version?.defaultSalaryBasis || 'EMPLOYER_COST',
      defaultProtectionPolicy: version?.defaultProtectionPolicy || 'PROTECT_EMPLOYER_COST',
      defaultPfApplicable: version?.defaultPfApplicable || false,
      defaultPfRuleId: version?.defaultPfRuleId || '',
      rules: version?.rules || [],
    }),
    [template, version]
  );
  const formik = useFormik<EditorValues>({
    initialValues,
    enableReinitialize: true,
    validationSchema: editorSchema,
    onSubmit: () => undefined,
  });
  const closeEditor = () => onClose?.();
  const componentNames = useMemo(
    () => new Map((catalogData?.items || []).map((item) => [item.componentId, item.name])),
    [catalogData]
  );
  const pfRules = (pfData?.items || []).filter((rule: any) => rule.isActive);
  const selectedIds = new Set(formik.values.rules.map((rule) => rule.componentId));
  const availableComponents = (catalogData?.items || []).filter(
    (item) => item.lineKind === addKind && !selectedIds.has(item.componentId)
  );
  const ruleIssues = getSaveIssues(formik.values.rules);
  const pfFormulaPresent = formik.values.rules.some(
    (rule) => rule.formulaType === 'EMPLOYEE_PROVIDENT_FUND'
  );
  const issues = [
    ...ruleIssues,
    ...(pfFormulaPresent && !formik.values.defaultPfRuleId
      ? ['Choose an active PF rule for the PF formula.']
      : []),
    ...(formik.values.defaultPfApplicable && !pfFormulaPresent
      ? ['Add a PF deduction when PF applies by default.']
      : []),
  ];

  useEffect(() => {
    if (!formik.values.defaultPfApplicable && !pfFormulaPresent) {
      formik.setFieldValue('defaultPfRuleId', '', false);
    }
    // Formik is intentionally omitted to avoid resetting touched state when rules change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pfFormulaPresent]);

  useEffect(() => onDirtyChange?.(formik.dirty), [formik.dirty, onDirtyChange]);

  const save = async () => {
    const errors = await formik.validateForm();
    if (Object.keys(errors).length > 0 || issues.length > 0 || readOnly) {
      formik.setTouched({ name: true, defaultPfRuleId: true });
      return;
    }
    setServerError('');
    operationKeyRef.current ||= operationKey();
    const body = {
      name: formik.values.name.trim(),
      description: formik.values.description.trim() || null,
      defaultSalaryBasis: formik.values.defaultSalaryBasis,
      defaultProtectionPolicy: formik.values.defaultProtectionPolicy,
      defaultPfApplicable: formik.values.defaultPfApplicable,
      defaultPfRuleId: formik.values.defaultPfRuleId || null,
      rules: normalizeRuleOrder(formik.values.rules),
      idempotencyKey: operationKeyRef.current,
      expectedActiveVersionId: template?.activeVersion ? template.editableVersion.id : null,
      concurrencyStamp: template?.concurrencyStamp || null,
    };
    try {
      const result = isCreate
        ? await createTemplate(body).unwrap()
        : await updateTemplate({ templateId: templateId!, body }).unwrap();
      operationKeyRef.current = '';
      onDirtyChange?.(false);
      formik.resetForm({
        values: {
          name: result.name,
          description: result.description || '',
          defaultSalaryBasis: result.editableVersion.defaultSalaryBasis,
          defaultProtectionPolicy: result.editableVersion.defaultProtectionPolicy,
          defaultPfApplicable: result.editableVersion.defaultPfApplicable,
          defaultPfRuleId: result.editableVersion.defaultPfRuleId || '',
          rules: result.editableVersion.rules,
        },
      });
      toast.success(
        isCreate
          ? 'Salary template is active for new salary setups.'
          : `Version ${result.activeVersion} is active for new salary setups. Existing employees are unchanged.`
      );
      if (onSaved) onSaved();
      else onClose?.();
    } catch (error: any) {
      const parsed = parseApiProblemDetail(error);
      const conflict = error?.status === 409 || parsed.detail.toLowerCase().includes('conflict');
      setServerError(
        conflict
          ? 'Another administrator changed this template. Reload the latest version, review your edits, and save again.'
          : parsed.detail
      );
    }
  };

  const runSample = async () => {
    if (!version || template?.status !== 'ACTIVE') return;
    await calculate({
      templateVersionId: version.id,
      salaryBasis: formik.values.defaultSalaryBasis,
      protectionPolicy: formik.values.defaultProtectionPolicy,
      monthlyAmount: sampleAmount,
      effectiveMonth: `${new Date().toISOString().slice(0, 7)}-01T00:00:00.000Z`,
      pfApplicable: formik.values.defaultPfApplicable,
      pfRuleId: formik.values.defaultPfRuleId || null,
      overrides: [],
      customizationReason: null,
    });
  };

  if ((!isCreate && templateLoading) || catalogLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={320}>
        <CircularProgress aria-label="Loading salary template" />
      </Box>
    );
  }
  if ((!isCreate && (templateError || !template)) || catalogError) {
    return <Alert severity="error">Unable to load the salary template. Try again.</Alert>;
  }

  const renderStep = () => {
    if (activeStep === 0) {
      return (
        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            <Alert severity="info">
              Saving creates a new active version for future salary setups. Existing employee salary revisions stay unchanged.
            </Alert>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              autoFocus
              label="Template name"
              disabled={readOnly}
              {...formik.getFieldProps('name')}
              error={formik.touched.name && Boolean(formik.errors.name)}
              helperText={formik.touched.name && formik.errors.name}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Description"
              disabled={readOnly}
              {...formik.getFieldProps('description')}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth disabled={readOnly}>
              <InputLabel>Default salary basis</InputLabel>
              <Select label="Default salary basis" {...formik.getFieldProps('defaultSalaryBasis')}>
                <MenuItem value="EMPLOYER_COST">Employer cost</MenuItem>
                <MenuItem value="GROSS">Gross salary</MenuItem>
                <MenuItem value="TAKE_HOME">Take-home salary</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth disabled={readOnly}>
              <InputLabel>Protection policy</InputLabel>
              <Select label="Protection policy" {...formik.getFieldProps('defaultProtectionPolicy')}>
                <MenuItem value="PROTECT_EMPLOYER_COST">Protect employer cost</MenuItem>
                <MenuItem value="PROTECT_GROSS">Protect gross salary</MenuItem>
                <MenuItem value="PROTECT_TAKE_HOME">Protect take-home salary</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      );
    }
    if (activeStep === 1) {
      return (
        <RuleSection
          title="Earnings"
          lineKind="EARNING"
          formik={formik}
          componentNames={componentNames}
          readOnly={readOnly}
          onAdd={() => setAddKind('EARNING')}
        />
      );
    }
    if (activeStep === 2) {
      return (
        <Box display="grid" gap={2.5}>
          <RuleSection
            title="Deductions"
            lineKind="DEDUCTION"
            formik={formik}
            componentNames={componentNames}
            readOnly={readOnly}
            onAdd={() => setAddKind('DEDUCTION')}
          />
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" mb={0.5}>Statutory defaults</Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>
                PF can default from this version. Professional Tax and ESI always use effective statutory rules.
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 5 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formik.values.defaultPfApplicable}
                        disabled={readOnly}
                        onChange={(_, checked) => formik.setFieldValue('defaultPfApplicable', checked)}
                        inputProps={{ 'aria-label': 'PF applicable by default' }}
                      />
                    }
                    label="PF applicable by default"
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 7 }}>
                  <FormControl fullWidth disabled={readOnly || !pfFormulaPresent || pfError}>
                    <InputLabel>Default PF rule</InputLabel>
                    <Select
                      label="Default PF rule"
                      {...formik.getFieldProps('defaultPfRuleId')}
                      error={formik.touched.defaultPfRuleId && Boolean(formik.errors.defaultPfRuleId)}
                    >
                      {pfRules.map((rule: any) => (
                        <MenuItem key={rule.id} value={rule.id}>{rule.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
              {pfError ? <Alert severity="error" sx={{ mt: 2 }}>PF rules could not be loaded.</Alert> : null}
              <Alert severity="info" sx={{ mt: 2 }}>
                ESI is system-managed. Eligibility and both contributions are recalculated from establishment, enrollment, wage classifications, effective month, and current rules. ESI cannot be edited here.
              </Alert>
            </CardContent>
          </Card>
        </Box>
      );
    }
    const calculation = calculationState.data;
    return (
      <Box display="grid" gap={2}>
        {serverError ? (
          <Alert
            severity="error"
            action={templateId ? <Button onClick={() => refetch()}>Reload</Button> : undefined}
          >
            {serverError}
          </Alert>
        ) : null}
        {issues.length ? (
          <Alert severity="warning">
            <Typography variant="subtitle2">Complete these items before saving:</Typography>
            <Box component="ul" sx={{ pl: 2.5, mb: 0 }}>
              {issues.map((issue) => <li key={issue}>{issue}</li>)}
            </Box>
          </Alert>
        ) : (
          <Alert severity="success">This template is ready to save as the active version.</Alert>
        )}
        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6">Sample calculation</Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Check monthly and annual outcomes before saving. A new template can be sampled after its first save.
            </Typography>
            <Box display="flex" gap={1.5} flexWrap="wrap" alignItems="flex-start">
              <TextField
                label="Sample monthly amount"
                type="number"
                value={sampleAmount}
                onChange={(event) => setSampleAmount(Number(event.target.value))}
                slotProps={{ htmlInput: { min: 1, step: 100 } }}
              />
              <Button
                variant="outlined"
                onClick={runSample}
                disabled={isCreate || template?.status !== 'ACTIVE' || calculationState.isLoading || sampleAmount <= 0}
                sx={{ minHeight: 56 }}
              >
                Calculate
              </Button>
            </Box>
            {calculation ? (
              <Grid container spacing={1.5} mt={0.5} aria-live="polite">
                {[
                  ['Gross', calculation.grossSalary],
                  ['Deductions', calculation.totalDeductions],
                  ['Net salary', calculation.netSalary],
                  ['Employer cost', calculation.employerCost],
                ].map(([label, amount]) => (
                  <Grid key={String(label)} size={{ xs: 6, md: 3 }}>
                    <Typography variant="caption" color="text.secondary">{label}</Typography>
                    <Typography variant="subtitle1">{formatCurrency(Number(amount))}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatCurrency(Number(amount) * 12)} yearly
                    </Typography>
                  </Grid>
                ))}
              </Grid>
            ) : null}
          </CardContent>
        </Card>
        {!isCreate && versionData?.items.length ? (
          <Box>
            <Typography variant="subtitle2" mb={1}>Version history</Typography>
            <Box display="flex" gap={1} flexWrap="wrap">
              {versionData.items.map((item) => (
                <Chip key={item.id} label={`Version ${item.versionNumber} - ${formatRuleLabel(item.status)}`} />
              ))}
            </Box>
          </Box>
        ) : null}
      </Box>
    );
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <Box sx={{ px: { xs: 2, md: 3 }, py: 2, display: 'flex', alignItems: 'center', gap: 1, borderBottom: 1, borderColor: 'divider' }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box display="flex" gap={1} alignItems="center" flexWrap="wrap">
            <Typography variant="h5">{isCreate ? 'Create salary template' : template?.name}</Typography>
            {readOnly ? <Chip size="small" label="Read only" /> : null}
            {template?.isDefault ? <Chip size="small" color="primary" label="School default" /> : null}
          </Box>
          <Typography variant="body2" color="text.secondary">
            {template?.status === 'NEEDS_SETUP' ? 'Complete setup to create active version 1.' : 'Reusable salary setup for future employee assignments.'}
          </Typography>
        </Box>
        <IconButton aria-label="Close salary template" onClick={closeEditor} sx={{ minWidth: 44, minHeight: 44 }}>
          <Close />
        </IconButton>
      </Box>
      <Box sx={{ flex: 1, minHeight: 0 }}>
        <CustomStepperWithFormik
          scrollbarHeight="100%"
          showSaveButton={false}
          formikInstance={formik}
          initialValues={initialValues}
          validationSchema={editorSchema}
          steps={steps}
          activeStep={activeStep}
          handleBack={() => setActiveStep((step) => Math.max(0, step - 1))}
          handleNext={(isLastStep) => {
            if (isLastStep) {
              if (readOnly) closeEditor();
              else save();
            } else setActiveStep((step) => Math.min(steps.length - 1, step + 1));
          }}
          onStepClick={(index) => setActiveStep(index)}
          isStepClickable={() => true}
          validateForwardStepClick
          validateFinalStep
          finalButtonLabel={readOnly ? 'Close' : 'Save changes'}
          disableSubmit={!readOnly && (issues.length > 0 || createState.isLoading || updateState.isLoading)}
          saveAndNextButtonProps={{ sx: { minHeight: 44 } }}
          backButtonProps={{ sx: { minHeight: 44 } }}
          renderItem={() => (
            <Box sx={{ p: { xs: 2, md: 3 }, pb: 10, maxWidth: 1100, mx: 'auto' }}>{renderStep()}</Box>
          )}
        />
      </Box>

      <CustomDialog
        open={Boolean(addKind)}
        handleClose={() => { setAddKind(null); setSelectedComponent(null); }}
        title={`Add ${addKind === 'EARNING' ? 'earning' : 'deduction'} component`}
        maxWidth="sm"
        hasForm={false}
      >
        <DialogScrollContent>
          <Autocomplete
            options={availableComponents}
            value={selectedComponent}
            onChange={(_, value) => setSelectedComponent(value)}
            getOptionLabel={(option) => option.name}
            isOptionEqualToValue={(option, value) => option.componentId === value.componentId}
            renderInput={(params) => <TextField {...params} label="Payroll component" />}
          />
        </DialogScrollContent>
        <DialogActions>
          <Button onClick={() => { setAddKind(null); setSelectedComponent(null); }}>Cancel</Button>
          <Button
            variant="contained"
            disabled={!selectedComponent}
            onClick={() => {
              if (!selectedComponent) return;
              formik.setFieldValue(
                'rules',
                normalizeRuleOrder([
                  ...formik.values.rules,
                  createTemplateRule(selectedComponent, formik.values.rules.length),
                ])
              );
              setAddKind(null);
              setSelectedComponent(null);
            }}
          >
            Add component
          </Button>
        </DialogActions>
      </CustomDialog>
    </Box>
  );
}
