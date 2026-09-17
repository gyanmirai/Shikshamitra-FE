'use client';

import type { RootState } from 'src/redux/store';
import type { FormikProps, FormikErrors } from 'formik';
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
import { useRouter } from 'next/navigation';
import { Iconify } from 'src/components/iconify';
import { useGetPFQuery } from 'src/redux/PF/PFApi';
import CustomSelect from 'src/components/custom-select';
import { formatCurrency } from 'src/utils/cureencyFormater';
import { useRef, useMemo, useState, useEffect } from 'react';
import { hasGrantedPermission } from 'src/utils/permissions';
import { hrPaths, hrPermissions } from 'src/constants/hr-menus';
import ShakingTextField from 'src/components/shaking-text-field';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import NumericFormatCustom from 'src/components/custom-numeric-format';
import { useUnsavedNavigation } from 'src/hooks/use-unsaved-navigation';
import {
  Box,
  Chip,
  Grid,
  Stack,
  Alert,
  Paper,
  Button,
  Switch,
  Divider,
  Collapse,
  TextField,
  ButtonBase,
  IconButton,
  Typography,
  Autocomplete,
  useMediaQuery,
  CircularProgress,
  FormControlLabel,
} from '@mui/material';
import {
  useGetSalaryTemplateQuery,
  useCreateSalaryTemplateMutation,
  useUpdateSalaryTemplateMutation,
  useGetSalaryTemplateVersionsQuery,
  useCalculateSalaryTemplateMutation,
  useGetSalaryTemplateComponentCatalogQuery,
} from 'src/redux/hr/salary-template-api';

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

type RuleFieldIssues = {
  value?: string;
  basisComponentId?: string;
};

const salaryBasisOptions = [
  { label: 'Employer Cost', value: 'EMPLOYER_COST' },
  { label: 'Gross Salary', value: 'GROSS' },
  { label: 'Take-Home Salary', value: 'TAKE_HOME' },
];

const protectionPolicyOptions = [
  { label: 'Protect Employer Cost', value: 'PROTECT_EMPLOYER_COST' },
  { label: 'Protect Gross Salary', value: 'PROTECT_GROSS' },
  { label: 'Protect Take-Home Salary', value: 'PROTECT_TAKE_HOME' },
];

const uniqueRoles = new Set([
  'BASIC',
  'BALANCING_EARNING',
  'EMPLOYEE_PROVIDENT_FUND',
  'PROFESSIONAL_TAX',
]);

const statutoryRoles = new Set(['EMPLOYEE_PROVIDENT_FUND', 'PROFESSIONAL_TAX']);
const lockedRoles = new Set(['BALANCING_EARNING', 'EMPLOYEE_PROVIDENT_FUND', 'PROFESSIONAL_TAX']);

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

function operationKey() {
  return globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`;
}

function getRuleFieldIssues(rule: SalaryTemplateRule): RuleFieldIssues {
  const issues: RuleFieldIssues = {};
  const needsValue = formulaAcceptsValue(rule.formulaType);

  if (needsValue && (rule.value == null || rule.value < 0)) {
    issues.value = 'Enter a non-negative amount or percentage.';
  } else if (rule.formulaType.startsWith('PERCENTAGE') && Number(rule.value) > 100) {
    issues.value = 'Percentage cannot exceed 100%.';
  }

  if (rule.formulaType === 'PERCENTAGE_OF_COMPONENT' && !rule.basisComponentId) {
    issues.basisComponentId = 'Choose the earning used as the calculation basis.';
  }

  return issues;
}

function ruleHasFieldIssue(rule: SalaryTemplateRule) {
  return Object.keys(getRuleFieldIssues(rule)).length > 0;
}

function getRuleSummary(rule: SalaryTemplateRule, componentNames: Map<string, string>) {
  if (!formulaAcceptsValue(rule.formulaType)) return 'Calculated automatically';
  if (rule.formulaType === 'FIXED_AMOUNT') return formatCurrency(Number(rule.value || 0));

  const basis =
    rule.formulaType === 'PERCENTAGE_OF_COMPONENT'
      ? componentNames.get(rule.basisComponentId || '') || 'selected component'
      : formatRuleLabel(rule.formulaType.replace('PERCENTAGE_OF_', ''));
  return `${Number(rule.value || 0)}% of ${basis}`;
}

function EditorSection({
  title,
  description,
  action,
  children,
  sectionId,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  sectionId?: string;
}) {
  return (
    <Paper
      component="section"
      variant="outlined"
      aria-labelledby={sectionId}
      sx={{ p: { xs: 2, md: 2.5 }, borderRadius: 2, minWidth: 0 }}
    >
      <Stack spacing={2}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1}
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          justifyContent="space-between"
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography
              id={sectionId}
              component="h2"
              variant="h6"
              tabIndex={sectionId === 'salary-structure-heading' ? -1 : undefined}
              sx={{ textWrap: 'balance', scrollMarginTop: 96 }}
            >
              {title}
            </Typography>
            {description ? (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, maxWidth: 760 }}>
                {description}
              </Typography>
            ) : null}
          </Box>
          {action}
        </Stack>
        {children}
      </Stack>
    </Paper>
  );
}

function ReadOnlyRuleDetails({ rule }: { rule: SalaryTemplateRule }) {
  const copy =
    rule.semanticType === 'BALANCING_EARNING'
      ? 'This component automatically balances the remaining gross salary. Its value cannot be entered manually.'
      : rule.semanticType === 'EMPLOYEE_PROVIDENT_FUND'
        ? 'PF uses the effective statutory rule selected below. The contribution formula is not editable here.'
        : 'Professional Tax uses the effective statutory slabs. Its amount is not editable here.';

  return (
    <Alert severity="info" icon={<Iconify icon="mdi:lock-outline" width={20} />}>
      {copy}
    </Alert>
  );
}

function RuleRow({
  rule,
  index,
  count,
  formik,
  componentNames,
  readOnly,
  expanded,
  showValidation,
  onToggle,
  onMove,
  onRemove,
}: {
  rule: SalaryTemplateRule;
  index: number;
  count: number;
  formik: FormikProps<EditorValues>;
  componentNames: Map<string, string>;
  readOnly: boolean;
  expanded: boolean;
  showValidation: boolean;
  onToggle: () => void;
  onMove: (direction: -1 | 1) => void;
  onRemove: () => void;
}) {
  const fieldIssues = getRuleFieldIssues(rule);
  const hasError = showValidation && Object.keys(fieldIssues).length > 0;
  const locked = lockedRoles.has(rule.semanticType) || !formulaAcceptsValue(rule.formulaType);
  const usedRoles = new Set(formik.values.rules.map((item) => item.semanticType));
  const basisOptions = formik.values.rules
    .filter(
      (candidate) =>
        candidate.componentId !== rule.componentId &&
        candidate.lineKind === 'EARNING' &&
        candidate.displayOrder < rule.displayOrder
    )
    .map((candidate) => ({
      label: componentNames.get(candidate.componentId) || 'Unavailable component',
      value: candidate.componentId,
    }));
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const panelId = `salary-rule-${rule.componentId}`;

  const updateRule = (updated: SalaryTemplateRule) => {
    formik.setFieldValue(
      'rules',
      normalizeRuleOrder(
        formik.values.rules.map((candidate) =>
          candidate.componentId === rule.componentId ? updated : candidate
        )
      )
    );
  };

  return (
    <Paper
      variant="outlined"
      data-salary-rule-error={hasError ? 'true' : undefined}
      sx={{
        overflow: 'hidden',
        borderColor: hasError ? 'error.main' : 'divider',
        '&:focus-within': { borderColor: hasError ? 'error.main' : 'primary.main' },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'stretch', minWidth: 0 }}>
        <ButtonBase
          aria-expanded={expanded}
          aria-controls={panelId}
          onClick={onToggle}
          sx={{
            flex: 1,
            minWidth: 0,
            p: 1.5,
            justifyContent: 'flex-start',
            textAlign: 'left',
            '&:hover': { bgcolor: 'action.hover' },
            '&:focus-visible': {
              outline: '2px solid',
              outlineColor: 'primary.main',
              outlineOffset: -2,
            },
          }}
        >
          <Stack direction="row" spacing={1.25} alignItems="center" sx={{ width: 1, minWidth: 0 }}>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Stack direction="row" spacing={0.75} alignItems="center" useFlexGap flexWrap="wrap">
                <Typography variant="subtitle2" sx={{ overflowWrap: 'anywhere' }}>
                  {componentNames.get(rule.componentId) || 'Unavailable component'}
                </Typography>
                <Chip size="small" variant="outlined" label={formatRuleLabel(rule.semanticType)} />
                {locked ? (
                  <Chip
                    size="small"
                    icon={<Iconify icon="mdi:lock-outline" width={14} />}
                    label="Automatic"
                  />
                ) : null}
              </Stack>
              <Typography
                variant="body2"
                color={hasError ? 'error.main' : 'text.secondary'}
                sx={{ mt: 0.4, fontVariantNumeric: 'tabular-nums' }}
              >
                {hasError
                  ? 'Review this component before saving'
                  : getRuleSummary(rule, componentNames)}
              </Typography>
            </Box>
            <Iconify
              icon={expanded ? 'mdi:chevron-up' : 'mdi:chevron-down'}
              width={22}
              aria-hidden="true"
            />
          </Stack>
        </ButtonBase>
      </Box>

      <Collapse in={expanded} timeout={reducedMotion ? 0 : 'auto'} unmountOnExit>
        <Box id={panelId} sx={{ borderTop: 1, borderColor: 'divider', p: 1.5 }}>
          <Stack spacing={1.5}>
            {locked ? (
              <ReadOnlyRuleDetails rule={rule} />
            ) : (
              <Grid container spacing={1}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <CustomSelect
                    name={`purpose-${rule.componentId}`}
                    label="Purpose"
                    options={getRoleOptions(rule.lineKind).map((role) => ({
                      label: formatRuleLabel(role),
                      value: role,
                    }))}
                    value={rule.semanticType}
                    onChange={(value) => updateRule(applySemanticType(rule, String(value)))}
                    disabled={readOnly}
                    disabledValues={getRoleOptions(rule.lineKind).filter(
                      (role) =>
                        uniqueRoles.has(role) && role !== rule.semanticType && usedRoles.has(role)
                    )}
                    inputProps={{
                      'aria-label': `Purpose for ${componentNames.get(rule.componentId)}`,
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <CustomSelect
                    name={`formula-${rule.componentId}`}
                    label="Calculation"
                    options={getFormulaOptions(rule).map((formula) => ({
                      label: formatRuleLabel(formula),
                      value: formula,
                    }))}
                    value={rule.formulaType}
                    onChange={(value) => updateRule(applyFormulaType(rule, String(value)))}
                    disabled={readOnly}
                    disabledValues={getFormulaOptions(rule).filter((formula) => {
                      const automaticRole = getAutomaticFormulaSemanticType(formula);
                      return Boolean(
                        automaticRole &&
                        automaticRole !== rule.semanticType &&
                        usedRoles.has(automaticRole)
                      );
                    })}
                    inputProps={{
                      'aria-label': `Calculation for ${componentNames.get(rule.componentId)}`,
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField error={hasError && Boolean(fieldIssues.value)}>
                    {rule.formulaType === 'FIXED_AMOUNT' ? (
                      <NumericFormatCustom
                        fullWidth
                        size="small"
                        name={`value-${rule.componentId}`}
                        label="Monthly Amount"
                        value={rule.value ?? ''}
                        disabled={readOnly}
                        error={hasError && Boolean(fieldIssues.value)}
                        helperText={hasError ? fieldIssues.value : ''}
                        onValueChange={(values) =>
                          updateRule({ ...rule, value: values.floatValue ?? null })
                        }
                        inputProps={{
                          inputMode: 'decimal',
                          'aria-label': `Monthly amount for ${componentNames.get(rule.componentId)}`,
                        }}
                      />
                    ) : (
                      <TextField
                        fullWidth
                        size="small"
                        type="number"
                        name={`value-${rule.componentId}`}
                        label="Percentage"
                        value={rule.value ?? ''}
                        disabled={readOnly}
                        error={hasError && Boolean(fieldIssues.value)}
                        helperText={hasError ? fieldIssues.value : ''}
                        onChange={(event) =>
                          updateRule({
                            ...rule,
                            value: event.target.value === '' ? null : Number(event.target.value),
                          })
                        }
                        slotProps={{
                          htmlInput: {
                            min: 0,
                            max: 100,
                            step: 0.01,
                            inputMode: 'decimal',
                            'aria-label': `Percentage for ${componentNames.get(rule.componentId)}`,
                          },
                        }}
                      />
                    )}
                  </ShakingTextField>
                </Grid>
                {rule.formulaType === 'PERCENTAGE_OF_COMPONENT' ? (
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <ShakingTextField error={hasError && Boolean(fieldIssues.basisComponentId)}>
                      <CustomSelect
                        name={`basis-${rule.componentId}`}
                        label="Basis Component"
                        options={basisOptions}
                        value={rule.basisComponentId || ''}
                        onChange={(value) =>
                          updateRule({ ...rule, basisComponentId: String(value) || null })
                        }
                        disabled={readOnly}
                        error={hasError && Boolean(fieldIssues.basisComponentId)}
                        helperText={hasError ? fieldIssues.basisComponentId : ''}
                        inputProps={{
                          'aria-label': `Basis component for ${componentNames.get(rule.componentId)}`,
                        }}
                      />
                    </ShakingTextField>
                  </Grid>
                ) : null}
              </Grid>
            )}

            {!readOnly ? (
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1}
                justifyContent="space-between"
                alignItems={{ xs: 'stretch', sm: 'center' }}
              >
                <Stack direction="row" spacing={0.5}>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<Iconify icon="mdi:arrow-up" width={18} />}
                    disabled={index === 0}
                    onClick={() => onMove(-1)}
                    sx={{ minHeight: 44 }}
                  >
                    Move Up
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<Iconify icon="mdi:arrow-down" width={18} />}
                    disabled={index === count - 1}
                    onClick={() => onMove(1)}
                    sx={{ minHeight: 44 }}
                  >
                    Move Down
                  </Button>
                </Stack>
                <Button
                  size="small"
                  color="error"
                  startIcon={<Iconify icon="mdi:delete-outline" width={18} />}
                  onClick={onRemove}
                  sx={{ minHeight: 44 }}
                >
                  Remove Component
                </Button>
              </Stack>
            ) : null}
          </Stack>
        </Box>
      </Collapse>
    </Paper>
  );
}

function RuleLane({
  title,
  lineKind,
  formik,
  componentNames,
  catalogItems,
  readOnly,
  expandedComponentId,
  addKind,
  showValidation,
  onExpandedChange,
  onAddKindChange,
  statutoryDefaults,
}: {
  title: string;
  lineKind: SalaryTemplateRule['lineKind'];
  formik: FormikProps<EditorValues>;
  componentNames: Map<string, string>;
  catalogItems: SalaryTemplateComponentCatalogItem[];
  readOnly: boolean;
  expandedComponentId: string | null;
  addKind: SalaryTemplateRule['lineKind'] | null;
  showValidation: boolean;
  onExpandedChange: (componentId: string | null) => void;
  onAddKindChange: (kind: SalaryTemplateRule['lineKind'] | null) => void;
  statutoryDefaults?: React.ReactNode;
}) {
  const allRules = formik.values.rules.filter((rule) => rule.lineKind === lineKind);
  const ordinaryRules =
    lineKind === 'DEDUCTION'
      ? allRules.filter((rule) => !statutoryRoles.has(rule.semanticType))
      : allRules;
  const statutoryRules =
    lineKind === 'DEDUCTION'
      ? allRules.filter((rule) => statutoryRoles.has(rule.semanticType))
      : [];
  const selectedIds = new Set(formik.values.rules.map((rule) => rule.componentId));
  const availableComponents = catalogItems.filter(
    (item) => item.lineKind === lineKind && !selectedIds.has(item.componentId)
  );
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  const setRules = (rulesValue: SalaryTemplateRule[]) => {
    const earnings = rulesValue.filter((rule) => rule.lineKind === 'EARNING');
    const deductions = rulesValue.filter((rule) => rule.lineKind === 'DEDUCTION');
    const ordinaryDeductions = deductions.filter((rule) => !statutoryRoles.has(rule.semanticType));
    const statutoryDeductions = deductions.filter((rule) => statutoryRoles.has(rule.semanticType));
    formik.setFieldValue(
      'rules',
      normalizeRuleOrder([...earnings, ...ordinaryDeductions, ...statutoryDeductions])
    );
  };

  const addComponent = (component: SalaryTemplateComponentCatalogItem | null) => {
    if (!component) return;
    setRules([...formik.values.rules, createTemplateRule(component, formik.values.rules.length)]);
    onAddKindChange(null);
    onExpandedChange(component.componentId);
  };

  const removeComponent = (rule: SalaryTemplateRule) => {
    const previousRules = formik.values.rules;
    setRules(previousRules.filter((candidate) => candidate.componentId !== rule.componentId));
    onExpandedChange(null);
    toast.info(`${componentNames.get(rule.componentId) || 'Component'} removed.`, {
      action: {
        label: 'Undo',
        onClick: () => {
          setRules(previousRules);
          onExpandedChange(rule.componentId);
        },
      },
    });
  };

  const moveComponent = (
    rule: SalaryTemplateRule,
    group: SalaryTemplateRule[],
    direction: -1 | 1
  ) => {
    const index = group.findIndex((candidate) => candidate.componentId === rule.componentId);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= group.length) return;
    const reorderedGroup = [...group];
    [reorderedGroup[index], reorderedGroup[target]] = [
      reorderedGroup[target],
      reorderedGroup[index],
    ];

    if (lineKind === 'EARNING') {
      setRules([
        ...reorderedGroup,
        ...formik.values.rules.filter((candidate) => candidate.lineKind === 'DEDUCTION'),
      ]);
      return;
    }

    const earnings = formik.values.rules.filter((candidate) => candidate.lineKind === 'EARNING');
    const nextOrdinary = statutoryRoles.has(rule.semanticType) ? ordinaryRules : reorderedGroup;
    const nextStatutory = statutoryRoles.has(rule.semanticType) ? reorderedGroup : statutoryRules;
    setRules([...earnings, ...nextOrdinary, ...nextStatutory]);
  };

  const renderRules = (rules: SalaryTemplateRule[]) => (
    <Stack spacing={1}>
      {rules.map((rule, index) => (
        <RuleRow
          key={rule.componentId}
          rule={rule}
          index={index}
          count={rules.length}
          formik={formik}
          componentNames={componentNames}
          readOnly={readOnly}
          expanded={expandedComponentId === rule.componentId}
          showValidation={showValidation}
          onToggle={() =>
            onExpandedChange(expandedComponentId === rule.componentId ? null : rule.componentId)
          }
          onMove={(direction) => moveComponent(rule, rules, direction)}
          onRemove={() => removeComponent(rule)}
        />
      ))}
    </Stack>
  );

  return (
    <Paper
      variant="outlined"
      sx={{
        p: { xs: 1.5, sm: 2 },
        minWidth: 0,
        bgcolor: 'background.default',
        borderRadius: 2,
      }}
    >
      <Stack spacing={1.5}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1}
          alignItems={{ xs: 'stretch', sm: 'center' }}
          justifyContent="space-between"
        >
          <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 1.5,
                display: 'grid',
                placeItems: 'center',
                color: lineKind === 'EARNING' ? 'success.main' : 'warning.main',
                bgcolor: lineKind === 'EARNING' ? 'success.lighter' : 'warning.lighter',
              }}
            >
              <Iconify
                icon={lineKind === 'EARNING' ? 'mdi:cash-plus' : 'mdi:cash-minus'}
                width={21}
                aria-hidden="true"
              />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography component="h3" variant="subtitle1">
                {title}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {allRules.length} component{allRules.length === 1 ? '' : 's'} configured
              </Typography>
            </Box>
          </Stack>
          {!readOnly ? (
            <Button
              size="small"
              variant="outlined"
              startIcon={<Iconify icon="mdi:plus" width={18} />}
              aria-expanded={addKind === lineKind}
              onClick={() => onAddKindChange(addKind === lineKind ? null : lineKind)}
              sx={{ minHeight: 44, flexShrink: 0 }}
            >
              Add {lineKind === 'EARNING' ? 'Earning' : 'Deduction'}
            </Button>
          ) : null}
        </Stack>

        <Collapse in={addKind === lineKind} timeout={reducedMotion ? 0 : 'auto'} unmountOnExit>
          <Paper variant="outlined" sx={{ p: 1.25, bgcolor: 'background.paper' }}>
            <Stack direction="row" spacing={1} alignItems="flex-start">
              <Autocomplete
                fullWidth
                size="small"
                options={availableComponents}
                value={null}
                onChange={(_, value) => addComponent(value)}
                getOptionLabel={(option) => option.name}
                isOptionEqualToValue={(option, value) => option.componentId === value.componentId}
                noOptionsText="No available components"
                renderInput={(params) => (
                  <TextField
                    {...params}
                    size="small"
                    label={`Select ${lineKind === 'EARNING' ? 'Earning' : 'Deduction'} Component`}
                    placeholder="Search components…"
                    autoComplete="off"
                  />
                )}
              />
              <IconButton
                size="small"
                aria-label={`Close add ${lineKind === 'EARNING' ? 'earning' : 'deduction'}`}
                onClick={() => onAddKindChange(null)}
                sx={{ width: 44, height: 44 }}
              >
                <Iconify icon="mdi:close" width={20} />
              </IconButton>
            </Stack>
          </Paper>
        </Collapse>

        {lineKind === 'EARNING' ? (
          ordinaryRules.length ? (
            renderRules(ordinaryRules)
          ) : (
            <Alert severity="info">No earnings have been configured.</Alert>
          )
        ) : (
          <Stack spacing={1.5}>
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Employee Deductions
              </Typography>
              {ordinaryRules.length ? (
                renderRules(ordinaryRules)
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No ordinary deductions have been configured.
                </Typography>
              )}
            </Box>
            <Divider />
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Statutory Deductions
              </Typography>
              {statutoryRules.length ? (
                renderRules(statutoryRules)
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No PF or Professional Tax component has been added.
                </Typography>
              )}
            </Box>
            {statutoryDefaults}
          </Stack>
        )}
      </Stack>
    </Paper>
  );
}

export default function SalaryTemplateEditor({
  templateId,
  mode = 'edit',
  onClose,
  onSaved,
  onDirtyChange,
}: Props) {
  const router = useRouter();
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
  const {
    data: catalogData,
    isLoading: catalogLoading,
    isError: catalogError,
  } = useGetSalaryTemplateComponentCatalogQuery();
  const { data: pfData, isError: pfError } = useGetPFQuery({});
  const { data: versionData } = useGetSalaryTemplateVersionsQuery(templateId || '', {
    skip: !templateId,
  });
  const [createTemplate, createState] = useCreateSalaryTemplateMutation();
  const [updateTemplate, updateState] = useUpdateSalaryTemplateMutation();
  const [calculate, calculationState] = useCalculateSalaryTemplateMutation();
  const [expandedComponentId, setExpandedComponentId] = useState<string | null>(null);
  const [addKind, setAddKind] = useState<SalaryTemplateRule['lineKind'] | null>(null);
  const [serverError, setServerError] = useState('');
  const [showValidation, setShowValidation] = useState(false);
  const [sampleAmount, setSampleAmount] = useState(50000);
  const operationKeyRef = useRef('');
  const readOnly =
    mode === 'view' || template?.status === 'ARCHIVED' || (isCreate ? !canAdd : !canEdit);
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
  const componentNames = useMemo(
    () => new Map((catalogData?.items || []).map((item) => [item.componentId, item.name])),
    [catalogData]
  );
  const pfRules = (pfData?.items || []).filter((rule: any) => rule.isActive);
  const ruleIssues = getSaveIssues(formik.values.rules);
  const pfFormulaPresent = formik.values.rules.some(
    (rule) => rule.formulaType === 'EMPLOYEE_PROVIDENT_FUND'
  );
  const professionalTaxPresent = formik.values.rules.some(
    (rule) => rule.formulaType === 'PROFESSIONAL_TAX'
  );
  const issues = [
    ...ruleIssues,
    ...(pfFormulaPresent && !formik.values.defaultPfRuleId
      ? ['Choose an active PF rule for the PF formula.']
      : []),
    ...(formik.values.defaultPfApplicable && !pfFormulaPresent
      ? ['Add a PF deduction when PF applies by default.']
      : []),
    ...(pfError && pfFormulaPresent ? ['PF rules could not be loaded. Retry before saving.'] : []),
  ];
  const busy = createState.isLoading || updateState.isLoading;
  const listHref = hrPaths.payroll.settings.salaryTemplates;
  const editorTitle = isCreate ? 'Create salary template' : template?.name || 'Salary template';

  const { requestNavigation, confirmation } = useUnsavedNavigation(formik.dirty, {
    description:
      'Your salary template changes have not been saved. Keep editing, or discard them and return to the template list.',
    push: router.push,
  });

  useEffect(() => {
    if (!formik.values.defaultPfApplicable && !pfFormulaPresent) {
      formik.setFieldValue('defaultPfRuleId', '', false);
    }
    // Formik is intentionally omitted to avoid resetting touched state when rules change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pfFormulaPresent]);

  useEffect(() => onDirtyChange?.(formik.dirty), [formik.dirty, onDirtyChange]);

  const returnToTemplates = () => {
    requestNavigation(() => {
      if (onClose) onClose();
      else router.push(listHref);
    });
  };

  const focusFirstIssue = (errors: FormikErrors<EditorValues>) => {
    if (errors.name) {
      globalThis.requestAnimationFrame?.(() =>
        document.querySelector<HTMLElement>('[name="name"]')?.focus()
      );
      return;
    }

    if (errors.description) {
      globalThis.requestAnimationFrame?.(() =>
        document.querySelector<HTMLElement>('[name="description"]')?.focus()
      );
      return;
    }

    if (errors.defaultPfRuleId) {
      globalThis.requestAnimationFrame?.(() =>
        document
          .querySelector<HTMLElement>('[data-pf-rule-field="true"] [role="combobox"]')
          ?.focus()
      );
      return;
    }

    const invalidRule = formik.values.rules.find(ruleHasFieldIssue);
    if (invalidRule) {
      setExpandedComponentId(invalidRule.componentId);
      globalThis.setTimeout(() => {
        document
          .querySelector<HTMLElement>(
            '[data-salary-rule-error="true"] input, [data-salary-rule-error="true"] [role="combobox"]'
          )
          ?.focus();
      }, 0);
      return;
    }

    if (pfFormulaPresent && !formik.values.defaultPfRuleId) {
      globalThis.requestAnimationFrame?.(() =>
        document
          .querySelector<HTMLElement>('[data-pf-rule-field="true"] [role="combobox"]')
          ?.focus()
      );
      return;
    }

    globalThis.requestAnimationFrame?.(() =>
      document.querySelector<HTMLElement>('#salary-structure-heading')?.focus()
    );
  };

  const save = async () => {
    if (readOnly || busy) return;
    const errors = await formik.validateForm();
    const hasFormikErrors = Object.keys(errors).length > 0;
    if (hasFormikErrors || issues.length > 0) {
      setShowValidation(true);
      formik.setTouched({ name: true, defaultPfRuleId: true });
      focusFirstIssue(errors);
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
      setShowValidation(false);
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
      onSaved?.();
      if (isCreate && !onSaved) {
        router.replace(hrPaths.payroll.settings.salaryTemplateEditor(result.id));
      }
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
    if (!version || template?.status !== 'ACTIVE' || formik.dirty) return;
    try {
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
      }).unwrap();
    } catch {
      // The mutation state renders a user-actionable error below the control.
    }
  };

  const breadcrumb = (
    <CustomBreadcrumbs
      heading={editorTitle}
      description="Configure reusable salary defaults for consistent employee payroll setup."
      links={[
        { name: 'HR/Staff' },
        { name: 'Payroll Management' },
        { name: 'Settings' },
        { name: 'Salary Templates', href: listHref },
        { name: isCreate ? 'New Template' : template?.name || 'Template' },
      ]}
    />
  );

  if ((!isCreate && templateLoading) || catalogLoading) {
    return (
      <Box display="grid" gap={2}>
        {breadcrumb}
        <Paper variant="outlined" sx={{ minHeight: 320, display: 'grid', placeItems: 'center' }}>
          <Stack spacing={1.5} alignItems="center" role="status">
            <CircularProgress aria-label="Loading salary template" />
            <Typography variant="body2" color="text.secondary">
              Loading salary template…
            </Typography>
          </Stack>
        </Paper>
      </Box>
    );
  }

  if ((!isCreate && (templateError || !template)) || catalogError) {
    return (
      <Box display="grid" gap={2}>
        {breadcrumb}
        <Alert
          severity="error"
          action={templateId ? <Button onClick={() => refetch()}>Retry</Button> : undefined}
        >
          The salary template could not be loaded. Try again.
        </Alert>
      </Box>
    );
  }

  const statusLabel =
    template?.status === 'NEEDS_SETUP'
      ? 'Needs Setup'
      : template?.status === 'ARCHIVED'
        ? 'Archived'
        : 'Active';
  const calculation = calculationState.data;

  const statutoryDefaults = (
    <Paper variant="outlined" sx={{ p: 1.5, bgcolor: 'background.paper' }}>
      <Stack spacing={1.5}>
        <Box>
          <Typography variant="subtitle2">Statutory Defaults</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
            Rates and slabs always come from the effective statutory setup.
          </Typography>
        </Box>
        <FormControlLabel
          sx={{ m: 0 }}
          control={
            <Switch
              checked={formik.values.defaultPfApplicable}
              disabled={readOnly}
              onChange={(_, checked) => formik.setFieldValue('defaultPfApplicable', checked)}
              inputProps={{ 'aria-label': 'PF applicable by default' }}
            />
          }
          label="PF Applicable by Default"
        />
        <Box data-pf-rule-field="true">
          <ShakingTextField
            error={
              showValidation &&
              Boolean(
                formik.errors.defaultPfRuleId ||
                (pfFormulaPresent && !formik.values.defaultPfRuleId)
              )
            }
          >
            <CustomSelect
              name="defaultPfRuleId"
              label="Default PF Rule"
              options={pfRules.map((rule: any) => ({ label: rule.name, value: rule.id }))}
              value={formik.values.defaultPfRuleId}
              onChange={(value) => formik.setFieldValue('defaultPfRuleId', String(value))}
              onBlur={() => formik.setFieldTouched('defaultPfRuleId', true)}
              disabled={readOnly || !pfFormulaPresent || pfError}
              error={
                showValidation &&
                Boolean(
                  (formik.touched.defaultPfRuleId && formik.errors.defaultPfRuleId) ||
                  (pfFormulaPresent && !formik.values.defaultPfRuleId)
                )
              }
              helperText={
                showValidation && pfFormulaPresent && !formik.values.defaultPfRuleId
                  ? formik.errors.defaultPfRuleId || 'Choose an active PF rule for this formula.'
                  : pfFormulaPresent
                    ? 'Used when PF applies during employee salary setup.'
                    : 'Add an Employee PF component to choose a rule.'
              }
              inputProps={{ 'aria-label': 'Default PF rule' }}
            />
          </ShakingTextField>
        </Box>
        {pfError ? (
          <Alert severity="error">PF rules could not be loaded. Retry before saving.</Alert>
        ) : null}
        <Paper variant="outlined" sx={{ p: 1.25 }}>
          <Stack direction="row" spacing={1} alignItems="flex-start">
            <Iconify icon="mdi:lock-outline" width={19} color="text.secondary" />
            <Box>
              <Typography variant="subtitle2">Professional Tax</Typography>
              <Typography variant="body2" color="text.secondary">
                {professionalTaxPresent
                  ? 'Calculated automatically from the effective statutory slabs.'
                  : 'Add a Professional Tax component to include the automatic statutory calculation.'}
              </Typography>
            </Box>
          </Stack>
        </Paper>
        <Paper variant="outlined" sx={{ p: 1.25 }}>
          <Stack direction="row" spacing={1} alignItems="flex-start">
            <Iconify icon="mdi:shield-check-outline" width={19} color="text.secondary" />
            <Box>
              <Typography variant="subtitle2">Employee State Insurance</Typography>
              <Typography variant="body2" color="text.secondary">
                System-managed from establishment, enrollment, wage classification, effective month,
                and current rules. ESI is not editable in this template.
              </Typography>
            </Box>
          </Stack>
        </Paper>
      </Stack>
    </Paper>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: 0, pb: 2 }}>
      {breadcrumb}

      <Box
        component="form"
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          save();
        }}
        sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, minWidth: 0 }}
      >
        <EditorSection
          title="Template Details"
          description="Define the reusable defaults that admins receive when setting up employee salaries."
          sectionId="template-details-heading"
          action={
            <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap">
              {isCreate ? (
                <Chip size="small" label="New Template" />
              ) : (
                <Chip size="small" label={statusLabel} />
              )}
              {template?.activeVersion ? (
                <Chip size="small" variant="outlined" label={`Version ${template.activeVersion}`} />
              ) : null}
              {template?.isDefault ? (
                <Chip size="small" color="primary" label="School Default" />
              ) : null}
              {readOnly ? <Chip size="small" variant="outlined" label="Read Only" /> : null}
            </Stack>
          }
        >
          <Alert severity="info">
            Saving creates a new active version for future salary setups. Existing employee salary
            revisions remain unchanged.
          </Alert>
          {template?.status === 'NEEDS_SETUP' ? (
            <Alert severity="warning">Complete this setup to create active version 1.</Alert>
          ) : null}
          <Grid container spacing={1}>
            <Grid size={{ xs: 12, md: 6 }}>
              <ShakingTextField error={Boolean(formik.touched.name && formik.errors.name)}>
                <TextField
                  fullWidth
                  size="small"
                  name="name"
                  label="Template Name"
                  autoComplete="off"
                  disabled={readOnly}
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={Boolean(formik.touched.name && formik.errors.name)}
                  helperText={formik.touched.name ? formik.errors.name : ''}
                />
              </ShakingTextField>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <ShakingTextField
                error={Boolean(formik.touched.description && formik.errors.description)}
              >
                <TextField
                  fullWidth
                  size="small"
                  name="description"
                  label="Description"
                  autoComplete="off"
                  disabled={readOnly}
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={Boolean(formik.touched.description && formik.errors.description)}
                  helperText={formik.touched.description ? formik.errors.description : ''}
                />
              </ShakingTextField>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <CustomSelect
                name="defaultSalaryBasis"
                label="Default Salary Basis"
                options={salaryBasisOptions}
                value={formik.values.defaultSalaryBasis}
                onChange={(value) => formik.setFieldValue('defaultSalaryBasis', String(value))}
                disabled={readOnly}
                inputProps={{ 'aria-label': 'Default salary basis' }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <CustomSelect
                name="defaultProtectionPolicy"
                label="Protection Policy"
                options={protectionPolicyOptions}
                value={formik.values.defaultProtectionPolicy}
                onChange={(value) => formik.setFieldValue('defaultProtectionPolicy', String(value))}
                disabled={readOnly}
                inputProps={{ 'aria-label': 'Protection policy' }}
              />
            </Grid>
          </Grid>
        </EditorSection>

        <EditorSection
          title="Salary Structure"
          description="Compare earnings and deductions together. Expand one component to review or change its calculation."
          sectionId="salary-structure-heading"
        >
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: 'minmax(0, 1fr)', lg: 'repeat(2, minmax(0, 1fr))' },
              gap: 2,
              alignItems: 'start',
              minWidth: 0,
            }}
          >
            <RuleLane
              title="Earnings"
              lineKind="EARNING"
              formik={formik}
              componentNames={componentNames}
              catalogItems={catalogData?.items || []}
              readOnly={readOnly}
              expandedComponentId={expandedComponentId}
              addKind={addKind}
              showValidation={showValidation}
              onExpandedChange={setExpandedComponentId}
              onAddKindChange={setAddKind}
            />
            <RuleLane
              title="Deductions"
              lineKind="DEDUCTION"
              formik={formik}
              componentNames={componentNames}
              catalogItems={catalogData?.items || []}
              readOnly={readOnly}
              expandedComponentId={expandedComponentId}
              addKind={addKind}
              showValidation={showValidation}
              onExpandedChange={setExpandedComponentId}
              onAddKindChange={setAddKind}
              statutoryDefaults={statutoryDefaults}
            />
          </Box>
        </EditorSection>

        <EditorSection
          title="Review & Calculation"
          description="Resolve validation issues and verify the active template with a sample monthly amount."
          sectionId="review-calculation-heading"
        >
          {serverError ? (
            <Alert
              severity="error"
              action={templateId ? <Button onClick={() => refetch()}>Reload</Button> : undefined}
            >
              {serverError}
            </Alert>
          ) : null}
          {issues.length ? (
            <Alert severity="warning" aria-live="polite">
              <Typography variant="subtitle2">Complete these items before saving:</Typography>
              <Box component="ul" sx={{ pl: 2.5, mb: 0 }}>
                {issues.map((issue) => (
                  <li key={issue}>{issue}</li>
                ))}
              </Box>
            </Alert>
          ) : (
            <Alert severity="success">This template is ready to save as the active version.</Alert>
          )}

          <Paper variant="outlined" sx={{ p: { xs: 1.5, sm: 2 } }}>
            <Stack spacing={1.5}>
              <Box>
                <Typography variant="subtitle1">Sample Calculation</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                  {isCreate
                    ? 'Save the template once before running a statutory calculation.'
                    : formik.dirty
                      ? 'Save your changes before calculating the updated active version.'
                      : 'Review monthly and annual payroll outcomes before assigning this template.'}
                </Typography>
              </Box>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1}
                alignItems={{ xs: 'stretch', sm: 'flex-start' }}
              >
                <NumericFormatCustom
                  size="small"
                  label="Sample Monthly Amount"
                  value={sampleAmount}
                  onValueChange={(values) => setSampleAmount(values.floatValue || 0)}
                  inputProps={{ inputMode: 'decimal', 'aria-label': 'Sample monthly amount' }}
                  sx={{ width: { xs: 1, sm: 260 } }}
                />
                <Button
                  size="small"
                  variant="outlined"
                  onClick={runSample}
                  disabled={
                    isCreate ||
                    formik.dirty ||
                    template?.status !== 'ACTIVE' ||
                    calculationState.isLoading ||
                    sampleAmount <= 0
                  }
                  sx={{ minHeight: 40 }}
                >
                  {calculationState.isLoading ? 'Calculating…' : 'Calculate'}
                </Button>
              </Stack>
              {calculationState.isError ? (
                <Alert severity="error">
                  The sample could not be calculated. Review the statutory setup and try again.
                </Alert>
              ) : null}
              {calculation ? (
                <Grid container spacing={1.5} aria-live="polite">
                  {[
                    ['Gross Salary', calculation.grossSalary],
                    ['Deductions', calculation.totalDeductions],
                    ['Net Salary', calculation.netSalary],
                    ['Employer Cost', calculation.employerCost],
                  ].map(([label, amount]) => (
                    <Grid key={String(label)} size={{ xs: 6, md: 3 }}>
                      <Typography variant="caption" color="text.secondary">
                        {label}
                      </Typography>
                      <Typography variant="subtitle1" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                        {formatCurrency(Number(amount))}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontVariantNumeric: 'tabular-nums' }}
                      >
                        {formatCurrency(Number(amount) * 12)} yearly
                      </Typography>
                    </Grid>
                  ))}
                </Grid>
              ) : null}
            </Stack>
          </Paper>

          {!isCreate && versionData?.items.length ? (
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Version History
              </Typography>
              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                {versionData.items.map((item) => (
                  <Chip
                    key={item.id}
                    size="small"
                    variant="outlined"
                    label={`Version ${item.versionNumber} - ${formatRuleLabel(item.status)}`}
                  />
                ))}
              </Stack>
            </Box>
          ) : null}
        </EditorSection>

        <Paper
          elevation={8}
          sx={{
            position: 'sticky',
            bottom: 0,
            zIndex: 10,
            px: { xs: 1.5, sm: 2.5 },
            pt: 1.5,
            pb: 'max(12px, env(safe-area-inset-bottom))',
            borderTop: 1,
            borderColor: 'divider',
          }}
        >
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1}
            alignItems={{ xs: 'stretch', sm: 'center' }}
            justifyContent="space-between"
          >
            <Typography variant="body2" color="text.secondary" aria-live="polite">
              {formik.dirty
                ? 'You have unsaved changes.'
                : readOnly
                  ? 'This template is read only.'
                  : 'All changes are saved.'}
            </Typography>
            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <Button
                type="button"
                size="small"
                variant="outlined"
                startIcon={<Iconify icon="mdi:arrow-left" width={18} />}
                onClick={returnToTemplates}
                disabled={busy}
                sx={{ minHeight: 44 }}
              >
                Back to Templates
              </Button>
              {!readOnly ? (
                <Button
                  type="submit"
                  size="small"
                  variant="contained"
                  loading={busy}
                  startIcon={<Iconify icon="mdi:content-save-outline" width={18} />}
                  sx={{ minHeight: 44 }}
                >
                  {busy ? 'Saving…' : 'Save Changes'}
                </Button>
              ) : null}
            </Stack>
          </Stack>
        </Paper>
      </Box>

      {confirmation}
    </Box>
  );
}
