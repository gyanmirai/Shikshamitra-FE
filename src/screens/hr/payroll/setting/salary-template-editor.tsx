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
import Link from 'next/link';
import { toast } from 'sonner';
import { useFormik } from 'formik';
import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { hasGrantedPermission } from 'src/utils/permissions';
import { hrPaths, hrPermissions } from 'src/constants/hr-menus';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import {
  Add,
  Save,
  Delete,
  Publish,
  ArrowBack,
  ArrowUpward,
  ArrowDownward,
} from '@mui/icons-material';
import {
  useGetSalaryTemplateQuery,
  usePublishSalaryTemplateMutation,
  useUpdateSalaryTemplateDraftMutation,
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
  Divider,
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
} from '@mui/material';

import {
  getRoleOptions,
  formatRuleLabel,
  getPublishIssues,
  applyFormulaType,
  getFormulaOptions,
  applySemanticType,
  createTemplateRule,
  normalizeRuleOrder,
  formulaAcceptsValue,
  getAutomaticFormulaSemanticType,
} from './salary-template-editor-utils';

type EditorValues = {
  name: string;
  description: string;
  defaultSalaryBasis: SalaryBasis;
  defaultProtectionPolicy: ProtectionPolicy;
  rules: SalaryTemplateRule[];
};

type RuleSectionProps = {
  title: string;
  lineKind: SalaryTemplateRule['lineKind'];
  formik: FormikProps<EditorValues>;
  componentNames: Map<string, string>;
  canEdit: boolean;
  onAdd: () => void;
  onMove: (componentId: string, direction: -1 | 1) => void;
  onRemove: (componentId: string) => void;
};

const editorSchema = Yup.object({
  name: Yup.string().trim().required('Template name is required.').max(160),
  description: Yup.string().trim().max(500),
  defaultSalaryBasis: Yup.string().required(),
  defaultProtectionPolicy: Yup.string().required(),
  rules: Yup.array().required(),
});

const uniqueRoles = new Set([
  'BASIC',
  'BALANCING_EARNING',
  'EMPLOYEE_PROVIDENT_FUND',
  'PROFESSIONAL_TAX',
]);

function SalaryTemplateRuleSection({
  title,
  lineKind,
  formik,
  componentNames,
  canEdit,
  onAdd,
  onMove,
  onRemove,
}: RuleSectionProps) {
  const rules = formik.values.rules.filter((rule) => rule.lineKind === lineKind);
  const usedRoles = new Set(formik.values.rules.map((rule) => rule.semanticType));

  const updateRule = (componentId: string, patch: Partial<SalaryTemplateRule>) => {
    formik.setFieldValue(
      'rules',
      formik.values.rules.map((rule) =>
        rule.componentId === componentId ? { ...rule, ...patch } : rule
      )
    );
  };

  return (
    <Card variant="outlined">
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" gap={2} mb={2}>
          <Box>
            <Typography variant="h6">{title}</Typography>
            <Typography variant="body2" color="text.secondary">
              {rules.length} component{rules.length === 1 ? '' : 's'} configured
            </Typography>
          </Box>
          {canEdit ? (
            <Button variant="outlined" startIcon={<Add />} onClick={onAdd}>
              Add {lineKind === 'EARNING' ? 'earning' : 'deduction'}
            </Button>
          ) : null}
        </Box>

        {!rules.length ? (
          <Alert severity="info">
            No {lineKind === 'EARNING' ? 'earning' : 'deduction'} components have been added.
          </Alert>
        ) : (
          <Box display="grid" gap={1.5}>
            {rules.map((rule, sectionIndex) => {
              const formulaOptions = getFormulaOptions(rule);
              const acceptsValue = formulaAcceptsValue(rule.formulaType);
              const basisOptions = formik.values.rules.filter(
                (candidate) =>
                  candidate.componentId !== rule.componentId &&
                  candidate.lineKind === 'EARNING' &&
                  candidate.displayOrder < rule.displayOrder
              );

              return (
                <Card
                  key={rule.componentId}
                  variant="outlined"
                  sx={{ bgcolor: 'background.neutral' }}
                >
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Grid container spacing={1.5} alignItems="center">
                      <Grid size={{ xs: 12, lg: 2.5 }}>
                        <Typography variant="subtitle2">
                          {componentNames.get(rule.componentId) || 'Unavailable component'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatRuleLabel(rule.semanticType)}
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6, lg: 2 }}>
                        <FormControl fullWidth size="small" disabled={!canEdit}>
                          <InputLabel id={`purpose-${rule.componentId}-label`}>Purpose</InputLabel>
                          <Select
                            id={`purpose-${rule.componentId}`}
                            labelId={`purpose-${rule.componentId}-label`}
                            label="Purpose"
                            value={rule.semanticType}
                            onChange={(event) => {
                              const updated = applySemanticType(rule, event.target.value);
                              updateRule(rule.componentId, updated);
                            }}
                          >
                            {getRoleOptions(lineKind).map((role) => (
                              <MenuItem
                                key={role}
                                value={role}
                                disabled={
                                  uniqueRoles.has(role) &&
                                  role !== rule.semanticType &&
                                  usedRoles.has(role)
                                }
                              >
                                {formatRuleLabel(role)}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6, lg: 2.5 }}>
                        <FormControl fullWidth size="small" disabled={!canEdit}>
                          <InputLabel id={`calculation-${rule.componentId}-label`}>
                            Calculation
                          </InputLabel>
                          <Select
                            id={`calculation-${rule.componentId}`}
                            labelId={`calculation-${rule.componentId}-label`}
                            label="Calculation"
                            value={rule.formulaType}
                            onChange={(event) => {
                              const formulaType = event.target.value;
                              updateRule(rule.componentId, applyFormulaType(rule, formulaType));
                            }}
                          >
                            {formulaOptions.map((formula) => {
                              const automaticSemanticType =
                                getAutomaticFormulaSemanticType(formula);
                              return (
                                <MenuItem
                                  key={formula}
                                  value={formula}
                                  disabled={
                                    automaticSemanticType !== null &&
                                    automaticSemanticType !== rule.semanticType &&
                                    usedRoles.has(automaticSemanticType)
                                  }
                                >
                                  {formatRuleLabel(formula)}
                                </MenuItem>
                              );
                            })}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 4, lg: 1.5 }}>
                        <TextField
                          fullWidth
                          size="small"
                          type="number"
                          label={
                            acceptsValue
                              ? rule.formulaType.startsWith('PERCENTAGE')
                                ? 'Percent'
                                : 'Amount'
                              : 'Calculated automatically'
                          }
                          disabled={!canEdit || !acceptsValue}
                          value={acceptsValue ? (rule.value ?? '') : ''}
                          placeholder={acceptsValue ? undefined : 'Automatic'}
                          helperText={
                            canEdit && !acceptsValue
                              ? 'This value is calculated by the selected formula.'
                              : undefined
                          }
                          onChange={(event) =>
                            updateRule(rule.componentId, {
                              value: event.target.value === '' ? null : Number(event.target.value),
                            })
                          }
                          slotProps={{
                            htmlInput: {
                              min: 0,
                              max: rule.formulaType.startsWith('PERCENTAGE') ? 100 : undefined,
                              step: 0.01,
                            },
                          }}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 8, lg: 2 }}>
                        <FormControl
                          fullWidth
                          size="small"
                          disabled={!canEdit || rule.formulaType !== 'PERCENTAGE_OF_COMPONENT'}
                        >
                          <InputLabel>Basis component</InputLabel>
                          <Select
                            label="Basis component"
                            value={rule.basisComponentId || ''}
                            onChange={(event) =>
                              updateRule(rule.componentId, {
                                basisComponentId: event.target.value || null,
                              })
                            }
                          >
                            {basisOptions.map((candidate) => (
                              <MenuItem key={candidate.componentId} value={candidate.componentId}>
                                {componentNames.get(candidate.componentId) ||
                                  'Unavailable component'}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid size={{ xs: 12, lg: 1.5 }}>
                        <Box display="flex" justifyContent={{ xs: 'flex-end', lg: 'center' }}>
                          <IconButton
                            aria-label={`Move ${componentNames.get(rule.componentId)} up`}
                            disabled={!canEdit || sectionIndex === 0}
                            onClick={() => onMove(rule.componentId, -1)}
                          >
                            <ArrowUpward fontSize="small" />
                          </IconButton>
                          <IconButton
                            aria-label={`Move ${componentNames.get(rule.componentId)} down`}
                            disabled={!canEdit || sectionIndex === rules.length - 1}
                            onClick={() => onMove(rule.componentId, 1)}
                          >
                            <ArrowDownward fontSize="small" />
                          </IconButton>
                          <IconButton
                            aria-label={`Remove ${componentNames.get(rule.componentId)}`}
                            color="error"
                            disabled={!canEdit}
                            onClick={() => onRemove(rule.componentId)}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              );
            })}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

export default function SalaryTemplateEditor({
  templateId,
  versionId,
}: {
  templateId: string;
  versionId: string;
}) {
  const router = useRouter();
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const canEdit = hasGrantedPermission(
    permissions,
    hrPermissions.payroll.settings.salaryTemplateActions.edit
  );
  const canPublish = hasGrantedPermission(
    permissions,
    hrPermissions.payroll.settings.salaryTemplateActions.publish
  );
  const {
    data: template,
    isLoading: templateLoading,
    isError: templateError,
  } = useGetSalaryTemplateQuery(templateId);
  const {
    data: catalogData,
    isLoading: catalogLoading,
    isError: catalogError,
  } = useGetSalaryTemplateComponentCatalogQuery();
  const [updateDraft, updateState] = useUpdateSalaryTemplateDraftMutation();
  const [publish, publishState] = usePublishSalaryTemplateMutation();
  const [addKind, setAddKind] = useState<SalaryTemplateRule['lineKind'] | null>(null);
  const [selectedComponent, setSelectedComponent] =
    useState<SalaryTemplateComponentCatalogItem | null>(null);
  const [serverError, setServerError] = useState('');
  const initialValues = useMemo<EditorValues>(
    () => ({
      name: template?.name || '',
      description: template?.description || '',
      defaultSalaryBasis: template?.latest.defaultSalaryBasis || 'EMPLOYER_COST',
      defaultProtectionPolicy: template?.latest.defaultProtectionPolicy || 'PROTECT_EMPLOYER_COST',
      rules: template?.latest.rules || [],
    }),
    [template]
  );

  const formik = useFormik<EditorValues>({
    initialValues,
    enableReinitialize: true,
    validationSchema: editorSchema,
    onSubmit: async (values) => {
      await saveDraft(values, true);
    },
  });
  const componentNames = useMemo(
    () => new Map((catalogData?.items || []).map((item) => [item.componentId, item.name])),
    [catalogData]
  );
  const publishIssues = getPublishIssues(formik.values.rules);
  const isDraft = template?.latest.status === 'DRAFT';
  const readOnly = !canEdit || !isDraft;
  const selectedIds = new Set(formik.values.rules.map((rule) => rule.componentId));
  const availableComponents = (catalogData?.items || []).filter(
    (item) => item.lineKind === addKind && !selectedIds.has(item.componentId)
  );

  async function saveDraft(values: EditorValues, showSuccess: boolean) {
    setServerError('');
    try {
      const result = await updateDraft({
        templateId,
        versionId,
        name: values.name.trim(),
        description: values.description.trim() || null,
        defaultSalaryBasis: values.defaultSalaryBasis,
        defaultProtectionPolicy: values.defaultProtectionPolicy,
        rules: normalizeRuleOrder(values.rules),
      }).unwrap();
      formik.resetForm({
        values: {
          name: result.name,
          description: result.description || '',
          defaultSalaryBasis: result.latest.defaultSalaryBasis,
          defaultProtectionPolicy: result.latest.defaultProtectionPolicy,
          rules: result.latest.rules,
        },
      });
      if (showSuccess) toast.success('Draft saved.');
      return true;
    } catch (error: any) {
      const message = parseApiProblemDetail(error).detail;
      setServerError(message);
      toast.error(message);
      return false;
    }
  }

  const handlePublish = async () => {
    if (publishIssues.length) return;
    if (canEdit && formik.dirty) {
      const saved = await saveDraft(formik.values, false);
      if (!saved) return;
    }
    try {
      await publish({ templateId, versionId }).unwrap();
      toast.success('Template published.');
      router.push(hrPaths.payroll.settings.salaryTemplates);
    } catch (error: any) {
      const message = parseApiProblemDetail(error).detail;
      setServerError(message);
      toast.error(message);
    }
  };

  const moveRule = (componentId: string, direction: -1 | 1) => {
    const rule = formik.values.rules.find((item) => item.componentId === componentId);
    if (!rule) return;
    const sameKind = formik.values.rules.filter((item) => item.lineKind === rule.lineKind);
    const index = sameKind.findIndex((item) => item.componentId === componentId);
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= sameKind.length) return;
    [sameKind[index], sameKind[targetIndex]] = [sameKind[targetIndex], sameKind[index]];
    const otherKind = formik.values.rules.filter((item) => item.lineKind !== rule.lineKind);
    const nextRules =
      rule.lineKind === 'EARNING' ? [...sameKind, ...otherKind] : [...otherKind, ...sameKind];
    formik.setFieldValue('rules', normalizeRuleOrder(nextRules));
  };

  const removeRule = (componentId: string) => {
    formik.setFieldValue(
      'rules',
      normalizeRuleOrder(formik.values.rules.filter((rule) => rule.componentId !== componentId))
    );
  };

  const closeAddDialog = () => {
    setAddKind(null);
    setSelectedComponent(null);
  };

  if (templateLoading || catalogLoading) {
    return (
      <Box display="flex" justifyContent="center" py={8}>
        <CircularProgress />
      </Box>
    );
  }

  if (templateError || catalogError || !template || template.latest.id !== versionId) {
    return <Alert severity="error">Unable to load this salary template draft.</Alert>;
  }

  return (
    <Box display="grid" gap={2.5}>
      <Box
        display="flex"
        alignItems={{ xs: 'stretch', md: 'center' }}
        justifyContent="space-between"
        gap={2}
        flexDirection={{ xs: 'column', md: 'row' }}
      >
        <Button
          startIcon={<ArrowBack />}
          onClick={() => router.push(hrPaths.payroll.settings.salaryTemplates)}
          sx={{ alignSelf: 'flex-start' }}
        >
          Salary templates
        </Button>
        <Box display="flex" gap={1} justifyContent="flex-end">
          {canEdit ? (
            <Button
              variant="outlined"
              startIcon={<Save />}
              disabled={readOnly || updateState.isLoading}
              onClick={() => formik.handleSubmit()}
            >
              Save draft
            </Button>
          ) : null}
          {canPublish ? (
            <Button
              variant="contained"
              startIcon={<Publish />}
              disabled={
                !isDraft ||
                publishIssues.length > 0 ||
                updateState.isLoading ||
                publishState.isLoading
              }
              onClick={handlePublish}
            >
              Publish
            </Button>
          ) : null}
        </Box>
      </Box>

      {serverError ? <Alert severity="error">{serverError}</Alert> : null}
      {isDraft && publishIssues.length ? (
        <Alert severity="warning">
          <Typography variant="subtitle2" mb={0.5}>
            Complete these items before publishing:
          </Typography>
          <Box component="ul" sx={{ pl: 2.5, my: 0 }}>
            {publishIssues.map((issue) => (
              <li key={issue}>{issue}</li>
            ))}
          </Box>
        </Alert>
      ) : isDraft ? (
        <Alert severity="success">
          This draft is ready to publish. A balancing earning is optional. Without one, earnings must
          exactly equal gross salary when compensation is calculated. Basic at 100% needs no balancing allowance.
        </Alert>
      ) : null}

      <Card variant="outlined">
        <CardContent>
          <Typography variant="h6" mb={2}>
            Template details
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 5 }}>
              <TextField
                fullWidth
                label="Template name"
                disabled={readOnly}
                {...formik.getFieldProps('name')}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 7 }}>
              <TextField
                fullWidth
                label="Description"
                disabled={readOnly}
                {...formik.getFieldProps('description')}
                error={formik.touched.description && Boolean(formik.errors.description)}
                helperText={formik.touched.description && formik.errors.description}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth disabled={readOnly}>
                <InputLabel>Default quote basis</InputLabel>
                <Select label="Default quote basis" {...formik.getFieldProps('defaultSalaryBasis')}>
                  <MenuItem value="EMPLOYER_COST">Employer cost</MenuItem>
                  <MenuItem value="GROSS">Gross salary</MenuItem>
                  <MenuItem value="TAKE_HOME">Take-home salary</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth disabled={readOnly}>
                <InputLabel>Default protection</InputLabel>
                <Select
                  label="Default protection"
                  {...formik.getFieldProps('defaultProtectionPolicy')}
                >
                  <MenuItem value="PROTECT_EMPLOYER_COST">Protect employer cost</MenuItem>
                  <MenuItem value="PROTECT_GROSS">Protect gross salary</MenuItem>
                  <MenuItem value="PROTECT_TAKE_HOME">Protect take-home salary</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <SalaryTemplateRuleSection
        title="Earnings"
        lineKind="EARNING"
        formik={formik}
        componentNames={componentNames}
        canEdit={!readOnly}
        onAdd={() => setAddKind('EARNING')}
        onMove={moveRule}
        onRemove={removeRule}
      />
      <SalaryTemplateRuleSection
        title="Deductions"
        lineKind="DEDUCTION"
        formik={formik}
        componentNames={componentNames}
        canEdit={!readOnly}
        onAdd={() => setAddKind('DEDUCTION')}
        onMove={moveRule}
        onRemove={removeRule}
      />

      <Card variant="outlined">
        <CardContent>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="flex-start"
            gap={2}
            flexWrap="wrap"
          >
            <Box>
              <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                <Typography variant="h6">System-Managed Statutory Components</Typography>
                <Chip size="small" color="info" label="Automatic" />
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 760 }}>
                ESI is evaluated during payroll from statutory wages, employee coverage, and the
                effective rule. It does not need to be copied into this template and cannot be
                bypassed by removing a template row.
              </Typography>
            </Box>
            <Button
              component={Link}
              href={hrPaths.payroll.settings.statutorySchemes}
              variant="outlined"
            >
              Review ESI Setup
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Divider />
      <Box display="flex" justifyContent="flex-end" gap={1} pb={2}>
        <Button
          variant="outlined"
          onClick={() => router.push(hrPaths.payroll.settings.salaryTemplates)}
        >
          Back
        </Button>
        {canEdit ? (
          <Button
            variant="contained"
            startIcon={<Save />}
            disabled={readOnly || updateState.isLoading}
            onClick={() => formik.handleSubmit()}
          >
            Save draft
          </Button>
        ) : null}
      </Box>

      <CustomDialog
        open={Boolean(addKind)}
        handleClose={closeAddDialog}
        title={`Add ${addKind === 'EARNING' ? 'earning' : 'deduction'} component`}
        maxWidth="sm"
        hasForm={false}
      >
        <DialogScrollContent>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Select an active payroll component. Its formula will be defined only for this salary
            template.
          </Typography>
          <Autocomplete
            options={availableComponents}
            value={selectedComponent}
            onChange={(_event, value) => setSelectedComponent(value)}
            getOptionLabel={(option) => option.name}
            isOptionEqualToValue={(option, value) => option.componentId === value.componentId}
            renderInput={(params) => (
              <TextField {...params} label="Payroll component" placeholder="Search components" />
            )}
            noOptionsText="No available components"
          />
        </DialogScrollContent>
        <DialogActions>
          <Button variant="outlined" size="small" onClick={closeAddDialog}>
            Cancel
          </Button>
          <Button
            variant="contained"
            size="small"
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
              closeAddDialog();
            }}
          >
            Add component
          </Button>
        </DialogActions>
      </CustomDialog>
    </Box>
  );
}
