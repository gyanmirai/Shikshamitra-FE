'use client';

import type { FormikProps } from 'formik';
import type { RootState } from 'src/redux/store';
import type {
  SalaryTemplateRule,
  SalaryTemplateComponentCatalogItem,
} from 'src/redux/hr/salary-template-api';

import * as Yup from 'yup';
import { toast } from 'sonner';
import { useFormik } from 'formik';
import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { hasGrantedPermission } from 'src/utils/permissions';
import { hrPaths, hrPermissions } from 'src/constants/hr-menus';
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
  getFormulaOptions,
  applySemanticType,
  createTemplateRule,
  normalizeRuleOrder,
} from './salary-template-editor-utils';

type EditorValues = {
  name: string;
  description: string;
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
              const acceptsValue = formulaOptions.some((formula) =>
                [
                  'PERCENTAGE_OF_GROSS',
                  'PERCENTAGE_OF_BASIC',
                  'PERCENTAGE_OF_COMPONENT',
                  'FIXED_AMOUNT',
                ].includes(formula)
              );
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
                          <InputLabel>Role</InputLabel>
                          <Select
                            label="Role"
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
                          <InputLabel>Formula</InputLabel>
                          <Select
                            label="Formula"
                            value={rule.formulaType}
                            onChange={(event) => {
                              const formulaType = event.target.value;
                              const needsValue =
                                formulaType.startsWith('PERCENTAGE') ||
                                formulaType === 'FIXED_AMOUNT';
                              updateRule(rule.componentId, {
                                formulaType,
                                value: needsValue ? (rule.value ?? 0) : null,
                                basisComponentId:
                                  formulaType === 'PERCENTAGE_OF_COMPONENT'
                                    ? rule.basisComponentId
                                    : null,
                              });
                            }}
                          >
                            {formulaOptions.map((formula) => (
                              <MenuItem key={formula} value={formula}>
                                {formatRuleLabel(formula)}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 4, lg: 1.5 }}>
                        <TextField
                          fullWidth
                          size="small"
                          type="number"
                          label={rule.formulaType.startsWith('PERCENTAGE') ? 'Percent' : 'Amount'}
                          disabled={!canEdit || !acceptsValue}
                          value={acceptsValue ? (rule.value ?? '') : ''}
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
        rules: normalizeRuleOrder(values.rules),
      }).unwrap();
      formik.resetForm({
        values: {
          name: result.name,
          description: result.description || '',
          rules: result.latest.rules,
        },
      });
      if (showSuccess) toast.success('Draft saved.');
      return true;
    } catch (error: any) {
      const message = error?.data?.error?.message || 'Unable to save the salary template draft.';
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
      const message = error?.data?.error?.message || 'Unable to publish the salary template.';
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
        <Alert severity="success">This draft is ready to publish.</Alert>
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
