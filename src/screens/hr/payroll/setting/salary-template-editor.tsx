'use client';

import type { RootState } from 'src/redux/store';
import type {
  SalaryTemplate,
  SalaryTemplateRule,
  SalaryTemplatePreview,
  PreviewSalaryTemplateRequest,
  SalaryTemplateComponentCatalogItem,
} from 'src/redux/hr/salary-template-api';

import { toast } from 'sonner';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { Iconify } from 'src/components/iconify';
import { hasGrantedPermission } from 'src/utils/permissions';
import { LoadingButton } from 'src/components/loading-button';
import { hrPaths, hrPermissions } from 'src/constants/hr-menus';
import { getIn, useFormik, setNestedObjectValues } from 'formik';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useUnsavedNavigation } from 'src/hooks/use-unsaved-navigation';
import { useRef, useMemo, useState, useEffect, useCallback } from 'react';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import {
  Box,
  Chip,
  Alert,
  Button,
  TextField,
  Typography,
  Autocomplete,
  DialogActions,
} from '@mui/material';
import {
  useGetSalaryTemplateQuery,
  useCreateSalaryTemplateMutation,
  useUpdateSalaryTemplateMutation,
  usePreviewSalaryTemplateMutation,
  useGetSalaryTemplateVersionsQuery,
  useGetSalaryTemplateComponentCatalogQuery,
} from 'src/redux/hr/salary-template-api';

import SalaryTemplateReview from './salary-template-review';
import SalaryTemplateSkeleton from './salary-template-skeleton';
import SalaryTemplateConfigure from './salary-template-configure';
import { createTemplateRule, normalizeRuleOrder } from './salary-template-editor-utils';
import {
  editorSchema,
  initialEditorValues,
  configurationIssues,
} from './salary-template-form-model';

import type { EditorValues } from './salary-template-form-model';

type Props = {
  templateId?: string;
  mode?: 'create' | 'edit' | 'view';
  onClose?: () => void;
  onSaved?: () => void;
  onDirtyChange?: (dirty: boolean) => void;
};
const operationKey = () => globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`;

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
  const canView = hasGrantedPermission(
    permissions,
    hrPermissions.payroll.settings.salaryTemplateActions.view
  );
  const isCreate = mode === 'create';
  const permitted = isCreate ? canAdd : canView;
  const {
    data: template,
    isLoading,
    isError,
    refetch,
  } = useGetSalaryTemplateQuery(templateId || '', { skip: !templateId || !permitted });
  const {
    data: catalogData,
    isLoading: catalogLoading,
    isError: catalogError,
    refetch: refetchCatalog,
  } = useGetSalaryTemplateComponentCatalogQuery(undefined, { skip: !permitted });
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [generation, setGeneration] = useState(0);
  const changeDirty = useCallback(
    (value: boolean) => {
      setDirty(value);
      onDirtyChange?.(value);
    },
    [onDirtyChange]
  );
  const exit = useCallback(() => {
    if (onClose) onClose();
    else router.push(hrPaths.payroll.settings.salaryTemplates);
  }, [onClose, router]);
  const { requestNavigation, confirmation } = useUnsavedNavigation(dirty, { push: router.push });
  const close = () => {
    if (!busy) requestNavigation(exit);
  };
  const saved = () => {
    changeDirty(false);
    if (onSaved) onSaved();
    else exit();
  };
  const reload = () =>
    requestNavigation(async () => {
      const result = await refetch();
      if (result.data) {
        changeDirty(false);
        setGeneration((value) => value + 1);
      } else toast.error('Unable to reload the template. Your edits are still available.');
    });
  const readOnly = mode === 'view' || template?.status === 'ARCHIVED' || (!isCreate && !canEdit);
  const loading = (isLoading && !template) || (catalogLoading && !catalogData);
  const failed = (!isCreate && !template && isError) || (!catalogData && catalogError);
  const heading = isCreate
    ? 'Create Salary Template'
    : readOnly
      ? 'View Salary Template'
      : 'Edit Salary Template';
  return (
    <Box sx={{ height: 1, minHeight: 0, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
      <CustomBreadcrumbs
        heading={heading}
        description="Configure reusable salary rules, then calculate a sample before saving an active version."
        isBack
        onBack={close}
        links={[
          { name: 'HR/Staff', href: hrPaths.dashboard },
          { name: 'Payroll Management', href: hrPaths.payroll.root },
          { name: 'Settings', href: hrPaths.payroll.settings.root },
          { name: 'Salary Templates', href: hrPaths.payroll.settings.salaryTemplates },
          { name: isCreate ? 'Create' : readOnly ? 'View' : 'Edit' },
        ]}
        sx={{
          flexShrink: 0,
          display: { xs: 'grid', lg: 'flex' },
          gridTemplateColumns: 'minmax(0, 1fr)',
          '& > *': { m: '0 !important' },
          '& > .MuiStack-root': { flexShrink: 0 },
        }}
        slotProps={{
          heading: {},
          action: {},
          moreLink: {},
          breadcrumbs: { minWidth: 0, '& .MuiBreadcrumbs-li': { whiteSpace: 'nowrap' } },
        }}
        action={readOnly ? <Chip size="small" label="Read only" /> : undefined}
      />
      {!permitted ? (
        <Alert severity="warning">
          You do not have permission to {isCreate ? 'create' : 'view'} salary templates.
        </Alert>
      ) : loading ? (
        <Box
          role="status"
          aria-label="Loading salary template"
          aria-busy="true"
          sx={{ flex: 1, minHeight: 0, minWidth: 0, display: 'flex', flexDirection: 'column' }}
        >
          <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
            <SalaryTemplateSkeleton />
          </Box>
          <Box
            component="footer"
            sx={{
              flexShrink: 0,
              p: { xs: 1, md: 2 },
              borderTop: 1,
              borderColor: 'divider',
              bgcolor: 'background.paper',
              display: 'flex',
              gap: 1,
              flexWrap: 'wrap',
              alignItems: 'center',
            }}
          >
            <Button size="small" variant="outlined" onClick={close}>
              {readOnly ? 'Close' : 'Cancel'}
            </Button>
            <Typography variant="body2" color="text.secondary" sx={{ flex: '1 1 200px' }}>
              Loading template configuration…
            </Typography>
            <Button size="small" variant="outlined" disabled>
              Preview Calculation
            </Button>
            {!readOnly && (
              <Button size="small" variant="contained" disabled>
                {isCreate ? 'Create Template' : 'Save Changes'}
              </Button>
            )}
          </Box>
        </Box>
      ) : failed || (!isCreate && !template) ? (
        <Alert
          severity="error"
          action={
            <Button
              size="small"
              variant="outlined"
              startIcon={<Iconify icon="mdi:refresh" />}
              onClick={() => {
                if (templateId) refetch();
                refetchCatalog();
              }}
            >
              Retry
            </Button>
          }
        >
          Unable to load the salary template. Try again.
        </Alert>
      ) : (
        <Box sx={{ flex: 1, minHeight: 0, minWidth: 0 }}>
          <SalaryTemplateWorkflow
            key={`${templateId || 'new'}-${generation}`}
            template={template}
            isCreate={isCreate}
            readOnly={readOnly}
            catalogData={catalogData}
            onClose={close}
            onSaved={saved}
            onDirtyChange={changeDirty}
            onBusyChange={setBusy}
            onReload={reload}
          />
        </Box>
      )}
      {confirmation}
    </Box>
  );
}

type WorkflowProps = {
  template?: SalaryTemplate;
  isCreate: boolean;
  readOnly: boolean;
  catalogData?: { items: SalaryTemplateComponentCatalogItem[] };
  onClose: () => void;
  onSaved: () => void;
  onDirtyChange: (dirty: boolean) => void;
  onBusyChange: (busy: boolean) => void;
  onReload: () => void;
};
function SalaryTemplateWorkflow({
  template: sourceTemplate,
  isCreate,
  readOnly,
  catalogData,
  onClose,
  onSaved,
  onDirtyChange,
  onBusyChange,
  onReload,
}: WorkflowProps) {
  // Pin the loaded version so background refreshes cannot replace edits.
  const [template] = useState(sourceTemplate);
  const [initialValues] = useState(() => initialEditorValues(template));
  const formik = useFormik<EditorValues>({
    initialValues,
    validationSchema: editorSchema,
    onSubmit: async () => {
      await save();
    },
  });
  const templateId = template?.id;
  const { data: versionData } = useGetSalaryTemplateVersionsQuery(templateId || '', {
    skip: !templateId,
  });
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [pendingFocus, setPendingFocus] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [showIssues, setShowIssues] = useState(false);
  const [createTemplate, createState] = useCreateSalaryTemplateMutation();
  const [updateTemplate, updateState] = useUpdateSalaryTemplateMutation();
  const [calculate, calculationState] = usePreviewSalaryTemplateMutation();
  const [addKind, setAddKind] = useState<SalaryTemplateRule['lineKind'] | null>(null);
  const [selectedComponent, setSelectedComponent] =
    useState<SalaryTemplateComponentCatalogItem | null>(null);
  const [serverError, setServerError] = useState('');
  const [sampleAmount, setSampleAmount] = useState(50000);
  const [effectiveMonth, setEffectiveMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [preview, setPreview] = useState<{
    signature: string;
    result: SalaryTemplatePreview;
  } | null>(null);
  const [previewError, setPreviewError] = useState('');
  const requestSequence = useRef(0);
  const operationKeyRef = useRef('');
  const savingRef = useRef(false);
  const calculatingRef = useRef(false);
  const previewInput: PreviewSalaryTemplateRequest = {
    templateId: templateId || null,
    expectedActiveVersionId: template?.activeVersion ? template.editableVersion.id : null,
    concurrencyStamp: template?.concurrencyStamp || null,
    rules: normalizeRuleOrder(formik.values.rules),
    salaryBasis: formik.values.defaultSalaryBasis,
    protectionPolicy: formik.values.defaultProtectionPolicy,
    monthlyAmount: sampleAmount,
    effectiveMonth: effectiveMonth ? `${effectiveMonth}-01T00:00:00.000Z` : '',
    pfApplicable: formik.values.defaultPfApplicable,
    pfRuleId: formik.values.defaultPfRuleId || null,
  };
  const inputSignature = JSON.stringify(previewInput);
  const latestSignature = useRef(inputSignature);
  latestSignature.current = inputSignature;
  const previewCurrent =
    preview?.signature === inputSignature && Date.parse(preview.result.expiresAt) > Date.now();
  useEffect(() => {
    requestSequence.current += 1;
    setPreview(null);
    setPreviewError('');
  }, [inputSignature]);
  useEffect(() => {
    operationKeyRef.current = '';
  }, [formik.values, sampleAmount, effectiveMonth]);
  useEffect(() => {
    if (!preview) return undefined;
    const timer = setTimeout(
      () => {
        setPreview(null);
        setPreviewError('The sample preview expired. Calculate again before saving.');
      },
      Math.max(0, Date.parse(preview.result.expiresAt) - Date.now())
    );
    return () => clearTimeout(timer);
  }, [preview]);
  useEffect(
    () => () => {
      requestSequence.current += 1;
    },
    []
  );

  const componentNames = useMemo(
    () => new Map((catalogData?.items || []).map((item) => [item.componentId, item.name])),
    [catalogData]
  );

  const selectedIds = new Set(formik.values.rules.map((rule) => rule.componentId));
  const availableComponents = (catalogData?.items || []).filter(
    (item) => item.lineKind === addKind && !selectedIds.has(item.componentId)
  );
  const pfFormulaPresent = formik.values.rules.some(
    (rule) => rule.formulaType === 'EMPLOYEE_PROVIDENT_FUND'
  );
  const issues = configurationIssues(formik.values);

  useEffect(() => {
    if (!formik.values.defaultPfApplicable && !pfFormulaPresent) {
      formik.setFieldValue('defaultPfRuleId', '', false);
    }
    // Formik is intentionally omitted to avoid resetting touched state when rules change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pfFormulaPresent]);

  useEffect(() => onDirtyChange?.(formik.dirty), [formik.dirty, onDirtyChange]);

  const save = async () => {
    if (savingRef.current || calculatingRef.current) return;
    const errors = await formik.validateForm();
    if (
      Object.keys(errors).length > 0 ||
      issues.length > 0 ||
      readOnly ||
      !previewCurrent ||
      !preview
    ) {
      formik.setTouched({ name: true, defaultPfRuleId: true });
      return;
    }
    if (savingRef.current || calculatingRef.current) return;
    savingRef.current = true;
    setServerError('');
    operationKeyRef.current ||= operationKey();
    const body = {
      previewToken: preview.result.previewToken,
      sampleMonthlyAmount: sampleAmount,
      sampleEffectiveMonth: previewInput.effectiveMonth,
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
      onSaved();
    } catch (error: any) {
      if (error?.status === 400 || error?.status === 409) setPreview(null);
      const parsed = parseApiProblemDetail(error);
      const conflict = error?.status === 409 || parsed.detail.toLowerCase().includes('conflict');
      setServerError(
        conflict
          ? 'Another administrator changed this template. Reload the latest version, review your edits, and save again.'
          : parsed.detail
      );
    } finally {
      savingRef.current = false;
    }
  };

  const validateConfiguration = async () => {
    const errors = await formik.validateForm();
    const currentIssues = configurationIssues(formik.values);
    setShowIssues(true);
    await formik.setTouched(setNestedObjectValues(errors, true), false);
    const invalidRules = formik.values.rules.filter((_, index) => getIn(errors, `rules[${index}]`));
    if (invalidRules.length) {
      setExpanded(
        (current) => new Set([...current, ...invalidRules.map((rule) => rule.componentId)])
      );
    }
    const target =
      errors.name || errors.description
        ? 'salary-basic-information'
        : errors.defaultPfRuleId
          ? 'salary-statutory-defaults'
          : invalidRules.length
            ? `salary-rule-${invalidRules[0].componentId}`
            : currentIssues.length
              ? currentIssues[0].includes('PF')
                ? 'salary-statutory-defaults'
                : 'salary-earnings'
              : null;
    if (target) setPendingFocus(target);
    return Object.keys(errors).length === 0 && currentIssues.length === 0;
  };

  const runSample = async () => {
    if (calculatingRef.current || savingRef.current || template?.status === 'ARCHIVED') return;
    calculatingRef.current = true;
    try {
      if (!readOnly && !(await validateConfiguration())) return;
      if (
        !Number.isFinite(sampleAmount) ||
        sampleAmount <= 0 ||
        sampleAmount > 100000000 ||
        !/^\d{4}-(0[1-9]|1[0-2])$/.test(effectiveMonth)
      ) {
        setPreviewError('Enter a sample amount greater than zero and a valid effective month.');
        setPendingFocus('salary-sample-calculation');
        return;
      }
      await calculateSample();
    } finally {
      calculatingRef.current = false;
    }
  };

  const calculateSample = async () => {
    requestSequence.current += 1;
    const sequence = requestSequence.current;
    const signature = inputSignature;
    setPreview(null);
    setPreviewError('');
    setServerError('');
    try {
      const result = await calculate(previewInput).unwrap();
      if (sequence === requestSequence.current && signature === latestSignature.current) {
        setPreview({ signature, result });
      }
    } catch (error) {
      if (sequence === requestSequence.current && signature === latestSignature.current) {
        setPreviewError(parseApiProblemDetail(error).detail);
      }
    }
  };

  const busy = createState.isLoading || updateState.isLoading || formik.isSubmitting;
  const valid = editorSchema.isValidSync(formik.values) && issues.length === 0;
  useEffect(() => onBusyChange(busy), [busy, onBusyChange]);
  useEffect(() => {
    if (!pendingFocus) return undefined;
    const frame = requestAnimationFrame(() => {
      const region = document.getElementById(pendingFocus);
      const active = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      const target =
        region?.querySelector<HTMLElement>('[aria-invalid="true"]:not([type="hidden"])') ||
        (active && region?.contains(active) && !active.matches(':disabled') ? active : null) ||
        region?.querySelector<HTMLElement>(
          'input:not([type="hidden"]):not([disabled]), [role="combobox"]:not([aria-disabled="true"])'
        ) ||
        region?.querySelector<HTMLElement>('button:not([disabled])') ||
        region;
      target?.focus({ preventScroll: true });
      const list = target?.closest<HTMLElement>('[data-salary-rule-scroll]');
      if (target && list && list.scrollHeight > list.clientHeight) {
        const offset = target.getBoundingClientRect().top - list.getBoundingClientRect().top;
        list.scrollTo({ top: list.scrollTop + offset - list.clientHeight / 2 });
      }
      const content = contentRef.current;
      if (target && content) {
        const offset = target.getBoundingClientRect().top - content.getBoundingClientRect().top;
        content.scrollTo({ top: content.scrollTop + offset - content.clientHeight / 2 });
      }
      setPendingFocus(null);
    });
    return () => cancelAnimationFrame(frame);
  }, [pendingFocus]);
  const previewStatus = readOnly
    ? 'Read only. Existing salary setups remain unchanged.'
    : busy
      ? 'Saving template…'
      : calculationState.isLoading
        ? 'Calculating sample…'
        : !valid
          ? 'Complete the configuration, then calculate a sample to save.'
          : previewCurrent
            ? 'Sample is current. Ready to save.'
            : 'Calculate the current rules to enable Save.';
  return (
    <Box
      component="form"
      noValidate
      onSubmit={formik.handleSubmit}
      sx={{ height: 1, minHeight: 0, minWidth: 0, display: 'flex', flexDirection: 'column' }}
    >
      <Box
        ref={contentRef}
        role="region"
        aria-label="Salary template configuration"
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          p: { xs: 1, md: 2 },
          scrollPaddingBlock: 2,
        }}
      >
        <Box
          component="fieldset"
          disabled={busy}
          inert={busy || undefined}
          aria-busy={busy}
          sx={{
            border: 0,
            p: 0,
            m: 0,
            minWidth: 0,
            display: 'grid',
            gap: 3,
            opacity: busy ? 0.6 : 1,
          }}
        >
          <SalaryTemplateConfigure
            formik={formik}
            readOnly={readOnly}
            componentNames={componentNames}
            expanded={expanded}
            onToggle={(id) =>
              setExpanded((current) => {
                const next = new Set(current);
                if (next.has(id)) next.delete(id);
                else next.add(id);
                return next;
              })
            }
            onReveal={(id) => setPendingFocus(`salary-rule-${id}`)}
            onAdd={setAddKind}
            issues={showIssues ? issues : []}
          />
          <SalaryTemplateReview
            previewCurrent={Boolean(previewCurrent)}
            sampleAmount={sampleAmount}
            setSampleAmount={setSampleAmount}
            effectiveMonth={effectiveMonth}
            setEffectiveMonth={setEffectiveMonth}
            runSample={runSample}
            calculating={calculationState.isLoading}
            archived={template?.status === 'ARCHIVED'}
            previewError={previewError}
            calculation={previewCurrent ? preview?.result.calculation : undefined}
            versions={versionData?.items || []}
          />
        </Box>
      </Box>
      <Box
        component="footer"
        sx={{
          flexShrink: 0,
          borderTop: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
          p: { xs: 1, md: 2 },
          display: 'grid',
          gap: 1,
        }}
      >
        {serverError && (
          <Alert
            severity="error"
            action={
              templateId ? (
                <Button size="small" variant="outlined" onClick={onReload} disabled={busy}>
                  Reload
                </Button>
              ) : undefined
            }
          >
            {serverError}
          </Alert>
        )}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <Button size="small" type="button" variant="outlined" onClick={onClose} disabled={busy}>
            {readOnly ? 'Close' : 'Cancel'}
          </Button>
          <Typography
            id="salary-preview-status"
            role="status"
            variant="body2"
            color="text.secondary"
            sx={{ flex: '1 1 220px', order: { xs: -1, sm: 0 }, width: { xs: '100%', sm: 'auto' } }}
          >
            {previewStatus}
          </Typography>
          <Box
            sx={{
              display: 'flex',
              gap: 1,
              ml: 'auto',
              flexWrap: 'wrap',
              justifyContent: 'flex-end',
            }}
          >
            <Button
              size="small"
              type="button"
              variant="outlined"
              disabled={busy}
              onClick={() => setPendingFocus('salary-sample-calculation')}
            >
              Preview Calculation
            </Button>
            {!readOnly && (
              <LoadingButton
                size="small"
                variant="contained"
                type="submit"
                loading={busy}
                aria-describedby="salary-preview-status"
                disabled={!valid || !previewCurrent || calculationState.isLoading || busy}
              >
                {isCreate ? 'Create Template' : 'Save Changes'}
              </LoadingButton>
            )}
          </Box>
        </Box>
      </Box>
      <CustomDialog
        open={Boolean(addKind)}
        handleClose={() => {
          setAddKind(null);
          setSelectedComponent(null);
        }}
        title={`Add ${addKind === 'EARNING' ? 'earning' : 'deduction'} component`}
        maxWidth="sm"
        hasForm={false}
        guardUnsavedChanges={false}
      >
        <DialogScrollContent>
          <Autocomplete
            size="small"
            fullWidth
            options={availableComponents}
            value={selectedComponent}
            onChange={(_, value) => setSelectedComponent(value)}
            getOptionLabel={(option) => option.name}
            isOptionEqualToValue={(option, value) => option.componentId === value.componentId}
            renderInput={(params) => (
              <TextField {...params} size="small" label="Payroll component" />
            )}
          />
        </DialogScrollContent>
        <DialogActions>
          <Button
            size="small"
            variant="outlined"
            startIcon={<Iconify icon="mdi:close" />}
            onClick={() => {
              setAddKind(null);
              setSelectedComponent(null);
            }}
          >
            Cancel
          </Button>
          <Button
            size="small"
            startIcon={<Iconify icon="mdi:plus" />}
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
              setExpanded((value) => new Set(value).add(selectedComponent.componentId));
              setPendingFocus(`salary-rule-${selectedComponent.componentId}`);
              setAddKind(null);
              setSelectedComponent(null);
            }}
          >
            Add Component
          </Button>
        </DialogActions>
      </CustomDialog>
    </Box>
  );
}
