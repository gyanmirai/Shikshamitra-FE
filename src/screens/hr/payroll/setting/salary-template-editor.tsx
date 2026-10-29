'use client';

import type { RootState } from 'src/redux/store';
import type {
  SalaryTemplate,
  SalaryTemplateRule,
  SalaryTemplatePreview,
  PreviewSalaryTemplateRequest,
  SalaryTemplateComponentCatalogItem,
} from 'src/redux/hr/salary-template-api';

import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { shikshaMitraToast } from 'src/components/toast';
import { hasGrantedPermission } from 'src/utils/permissions';
import { LoadingButton } from 'src/components/loading-button';
import { hrPaths, hrPermissions } from 'src/constants/hr-menus';
import { getIn, useFormik, setNestedObjectValues } from 'formik';
import { salaryPreviewError } from 'src/utils/salary-preview-error';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { useUnsavedNavigation } from 'src/hooks/use-unsaved-navigation';
import { useGetEsiPolicyOptionsQuery } from 'src/redux/hr/esi-policy-api';
import { useRef, useMemo, useState, useEffect, useContext, useCallback } from 'react';
import { HrSetupLink, HrSetupRefresh } from 'src/screens/hr/recovery/hr-setup-controls';
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
  useHrSetupEmbedded,
  HrSetupTaskContext,
  useHrSetupEditorState,
} from 'src/screens/hr/setup/hr-setup-editor-context';
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
  configurationFeedback,
} from './salary-template-form-model';

import type { EditorValues } from './salary-template-form-model';

type Props = {
  templateId?: string;
  mode?: 'create' | 'edit' | 'view';
  onClose?: () => void;
  onSaved?: () => void;
  onDirtyChange?: (dirty: boolean) => void;
  dependencyRevision?: number;
};
const operationKey = () => globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`;

export default function SalaryTemplateEditor({
  templateId,
  mode = 'edit',
  onClose,
  onSaved,
  onDirtyChange,
  dependencyRevision = 0,
}: Props) {
  const embedded = useHrSetupEmbedded();
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
    error: catalogFailure,
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
  useEffect(() => {
    if (dependencyRevision > 0) refetchCatalog();
  }, [dependencyRevision, refetchCatalog]);
  const reload = () =>
    requestNavigation(async () => {
      const result = await refetch();
      if (result.data) {
        changeDirty(false);
        setGeneration((value) => value + 1);
      } else
        shikshaMitraToast.error({
          message: 'Unable to reload the template. Your edits are still available.',
        });
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
      {!embedded && (
        <CustomBreadcrumbs
          heading={heading}
          description="Configure reusable salary rules, then preview a full month before saving an active version."
          isBack
          onBack={close}
          links={[
            { name: 'Payroll Management', href: hrPaths.payroll.root },
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
      )}
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

            {!readOnly && (
              <Button size="small" variant="contained" disabled>
                {isCreate ? 'Create Template' : 'Save Changes'}
              </Button>
            )}
          </Box>
        </Box>
      ) : failed || (!isCreate && !template) ? (
        <Alert
          severity={
            catalogFailure && 'status' in catalogFailure && catalogFailure.status === 403
              ? 'warning'
              : 'error'
          }
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
          {catalogFailure && 'status' in catalogFailure && catalogFailure.status === 403
            ? 'Your account cannot load salary components. Ask your administrator to review salary template View access, then retry.'
            : catalogError
              ? 'Unable to load salary components. Retry to continue configuring the template.'
              : 'Unable to load the salary template. Try again.'}
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
            dependencyRevision={dependencyRevision}
            onRefreshCatalog={async () => {
              const result = await refetchCatalog();
              if (result.error) throw new Error('Salary components could not be refreshed.');
            }}
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
  onRefreshCatalog: () => Promise<void>;
  dependencyRevision: number;
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
  onRefreshCatalog,
  dependencyRevision,
}: WorkflowProps) {
  const embedded = useHrSetupEmbedded();
  const openTask = useContext(HrSetupTaskContext);
  const permissions = useSelector((state: RootState) => state.auth.permissions);
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
  const {
    data: esiPolicies,
    isError: esiPoliciesError,
    refetch: refetchEsiPolicies,
  } = useGetEsiPolicyOptionsQuery();
  const defaultEsiPolicy = esiPolicies?.find((item) => item.isDefault && !item.isArchived);
  useEffect(() => {
    if (isCreate && !formik.dirty && !formik.values.defaultEsiPolicyId && defaultEsiPolicy)
      formik.resetForm({ values: { ...formik.values, defaultEsiPolicyId: defaultEsiPolicy.id } });
  }, [isCreate, formik, defaultEsiPolicy]);

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
  const [previewFields, setPreviewFields] = useState<string[]>([]);
  const [hasPreviewed, setHasPreviewed] = useState(false);
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
    monthlyAmount: sampleAmount,
    effectiveMonth: effectiveMonth ? `${effectiveMonth}-01T00:00:00.000Z` : '',
    pfApplicable: formik.values.defaultPfApplicable,
    pfRuleId: formik.values.defaultPfRuleId || null,
    esiManagementMode: formik.values.defaultEsiManagementMode,
    esiPolicyId: formik.values.defaultEsiPolicyId || null,
    esiExternalReason: formik.values.defaultEsiExternalReason.trim() || null,
  };
  const inputSignature = JSON.stringify([previewInput, dependencyRevision]);
  const latestSignature = useRef(inputSignature);
  latestSignature.current = inputSignature;
  const previewCurrent =
    preview?.signature === inputSignature && Date.parse(preview.result.expiresAt) > Date.now();
  useEffect(() => {
    requestSequence.current += 1;
    setPreview(null);
    setPreviewError('');
    setPreviewFields([]);
  }, [inputSignature]);
  useEffect(() => {
    operationKeyRef.current = '';
  }, [formik.values, sampleAmount, effectiveMonth]);
  useEffect(() => {
    if (!preview) return undefined;
    const timer = setTimeout(
      () => {
        setPreview(null);
        setPreviewFields([]);
        setPreviewError('The salary preview expired. Refresh preview before saving.');
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
  const componentKind = addKind === 'EARNING' ? 'earning' : 'deduction';
  const componentPermission =
    addKind === 'EARNING'
      ? hrPermissions.payroll.settings.earningComponents
      : hrPermissions.payroll.settings.deductionComponents;
  const canCreateComponent = ['View', 'Add'].every((action) =>
    hasGrantedPermission(permissions, `${componentPermission}.${action}`)
  );
  const allComponentsAdded = (catalogData?.items || []).some((item) => item.lineKind === addKind);
  const closeComponentPicker = () => {
    setAddKind(null);
    setSelectedComponent(null);
  };
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
      defaultPfApplicable: formik.values.defaultPfApplicable,
      defaultPfRuleId: formik.values.defaultPfRuleId || null,
      defaultEsiManagementMode: formik.values.defaultEsiManagementMode,
      defaultEsiPolicyId: formik.values.defaultEsiPolicyId || null,
      defaultEsiExternalReason: formik.values.defaultEsiExternalReason.trim() || null,
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
          defaultPfApplicable: result.editableVersion.defaultPfApplicable,
          defaultPfRuleId: result.editableVersion.defaultPfRuleId || '',
          defaultEsiManagementMode:
            result.editableVersion.defaultEsiManagementMode || 'IN_PLATFORM',
          defaultEsiPolicyId: result.editableVersion.defaultEsiPolicyId || '',
          defaultEsiExternalReason: result.editableVersion.defaultEsiExternalReason || '',
          rules: result.editableVersion.rules,
        },
      });
      shikshaMitraToast.success({
        message: isCreate
          ? 'Salary template is active for new salary setups.'
          : `Version ${result.activeVersion} is active for new salary setups. Existing staff are unchanged.`,
      });
      onSaved();
    } catch (error: any) {
      const parsed = parseApiProblemDetail(error);
      const duplicateName = parsed.errorCode === 'HR:Payroll:SalaryTemplateNameExists';
      if (!duplicateName && (error?.status === 400 || error?.status === 409)) setPreview(null);
      const conflict =
        !isCreate &&
        (parsed.errorCode === 'HR:Payroll:SalaryTemplateSaveConflict' ||
          (!parsed.errorCode && error?.status === 409));
      setServerError(
        conflict
          ? 'Another administrator changed this template. Reload the latest version, review your edits, and save again.'
          : parsed.detail
      );
      if (duplicateName) setPendingFocus('salary-basic-information');
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
    const basicCandidate = formik.values.rules.some((rule) => rule.semanticType === 'BASIC')
      ? undefined
      : formik.values.rules.find((rule) => rule.lineKind === 'EARNING');
    if (basicCandidate) {
      setExpanded((current) => new Set(current).add(basicCandidate.componentId));
    }
    if (invalidRules.length) {
      setExpanded(
        (current) => new Set([...current, ...invalidRules.map((rule) => rule.componentId)])
      );
    }
    const target =
      errors.name || errors.description
        ? 'salary-basic-information'
        : errors.defaultPfRuleId || errors.defaultEsiPolicyId || errors.defaultEsiExternalReason
          ? 'salary-statutory-defaults'
          : invalidRules.length
            ? `salary-rule-${invalidRules[0].componentId}`
            : basicCandidate
              ? `salary-rule-purpose-${basicCandidate.componentId}`
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
        setPreviewFields([]);
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
    setPreviewFields([]);
    setServerError('');
    try {
      const result = await calculate(previewInput).unwrap();
      if (sequence === requestSequence.current && signature === latestSignature.current) {
        setPreviewFields([]);
        setPreview({ signature, result });
        setHasPreviewed(true);
      }
    } catch (error) {
      if (sequence === requestSequence.current && signature === latestSignature.current) {
        const parsed = parseApiProblemDetail(error);
        setPreviewError(parsed.detail);
        setPreviewFields(salaryPreviewError(parsed.errorCode)?.fields ?? []);
      }
    }
  };

  const busy = createState.isLoading || updateState.isLoading || formik.isSubmitting;
  const requirements = configurationFeedback(formik.values);
  const valid = requirements.length === 0;
  useHrSetupEditorState({
    dirty: formik.dirty,
    busy,
    save: formik.submitForm,
    disabled: !valid || !previewCurrent || calculationState.isLoading,
  });
  useEffect(() => onBusyChange(busy), [busy, onBusyChange]);
  useEffect(() => {
    if (!pendingFocus) return undefined;
    const frame = requestAnimationFrame(() => {
      const region = document.getElementById(pendingFocus);
      const active = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      const target =
        region?.querySelector<HTMLElement>('[aria-invalid="true"]:not([type="hidden"])') ||
        region?.querySelector<HTMLElement>('[role="spinbutton"]') ||
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
        ? 'Preparing preview…'
        : !valid
          ? `${requirements[0]}${requirements.length > 1 ? ` ${requirements.length - 1} more ${requirements.length === 2 ? 'requirement' : 'requirements'}. Review configuration to continue.` : ''}`
          : previewCurrent
            ? 'Preview ready'
            : hasPreviewed
              ? 'Refresh the salary preview before saving.'
              : previewError
                ? 'Salary preview failed. Review the preview error and retry.'
                : 'Configuration ready. Preview salary before creating or saving the template.';
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
          overflowY: embedded ? 'visible' : 'auto',
          p: embedded ? 0 : { xs: 1, md: 2 },
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
          {!readOnly &&
            catalogData &&
            !catalogData.items.some((item) => item.lineKind === 'EARNING') && (
              <Alert severity="warning">
                <Typography variant="subtitle2">No active earning components</Typography>
                <Typography variant="body2">
                  An active earning component is required. Review salary components in a new tab,
                  then return here and refresh setup. Your template entries stay in this tab.
                </Typography>
                <HrSetupLink setup="components" />
                <HrSetupRefresh
                  refresh={async () => {
                    setPreview(null);
                    await onRefreshCatalog();
                  }}
                  disabled={busy || calculationState.isLoading}
                />
              </Alert>
            )}
          {!readOnly &&
            formik.values.defaultEsiManagementMode === 'IN_PLATFORM' &&
            !esiPoliciesError &&
            esiPolicies &&
            !esiPolicies.some((item) => !item.isArchived) && (
              <Alert severity="warning">
                <Typography variant="subtitle2">No active ESIC policies</Typography>
                <Typography variant="body2">
                  An ESIC policy is required for calculation in ShikshaMitra. Review statutory setup
                  in a new tab, then return here and refresh setup. Your template entries stay in
                  this tab.
                </Typography>
                <HrSetupLink setup="statutory" />
                <HrSetupRefresh
                  refresh={async () => {
                    setPreview(null);
                    const result = await refetchEsiPolicies();
                    if (result.error) throw new Error('ESIC policies could not be refreshed.');
                  }}
                  disabled={busy || calculationState.isLoading}
                />
              </Alert>
            )}
          <SalaryTemplateConfigure
            previewMonth={effectiveMonth}
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
            salaryBasis={formik.values.defaultSalaryBasis}
            setSalaryBasis={(value) => formik.setFieldValue('defaultSalaryBasis', value)}
            readOnly={readOnly}
            previewCurrent={Boolean(previewCurrent)}
            hasPreviewed={hasPreviewed}
            busy={busy}
            sampleAmount={sampleAmount}
            setSampleAmount={setSampleAmount}
            effectiveMonth={effectiveMonth}
            setEffectiveMonth={setEffectiveMonth}
            runSample={runSample}
            calculating={calculationState.isLoading}
            archived={template?.status === 'ARCHIVED'}
            previewError={previewError}
            previewFields={previewFields}
            onCorrect={(field) => {
              const firstRule = formik.values.rules.find(
                (rule) => rule.lineKind === (field === 'deductions' ? 'DEDUCTION' : 'EARNING')
              );
              if ((field === 'rules' || field === 'deductions') && firstRule) {
                setExpanded((current) => new Set(current).add(firstRule.componentId));
              }
              setPendingFocus(
                field === 'rules' || field === 'deductions'
                  ? firstRule
                    ? `salary-rule-${firstRule.componentId}`
                    : field === 'deductions'
                      ? 'salary-deductions'
                      : 'salary-earnings'
                  : field === 'pfRuleId'
                    ? 'salary-default-pf-rule'
                    : field === 'effectiveMonth'
                      ? 'salary-preview-effective-month'
                      : 'salary-preview-monthly-amount'
              );
            }}
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
          {!embedded && (
            <Button size="small" type="button" variant="outlined" onClick={onClose} disabled={busy}>
              {readOnly ? 'Close' : 'Cancel'}
            </Button>
          )}
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
            {!readOnly && !valid && (
              <Button
                size="small"
                type="button"
                variant="outlined"
                disabled={busy || calculationState.isLoading}
                onClick={validateConfiguration}
              >
                Review configuration
              </Button>
            )}
            {!readOnly && valid && !previewCurrent && (
              <Button
                size="small"
                type="button"
                variant="outlined"
                disabled={busy || calculationState.isLoading}
                onClick={runSample}
              >
                {hasPreviewed
                  ? 'Refresh salary preview'
                  : previewError
                    ? 'Retry salary preview'
                    : isCreate
                      ? 'Preview before creating'
                      : 'Preview before saving'}
              </Button>
            )}
            {!readOnly && !embedded && (
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
        handleClose={closeComponentPicker}
        title={`Add ${addKind === 'EARNING' ? 'Earning' : 'Deduction'} Component`}
        titleInfo="Choose an existing payroll component to configure its rule in this salary template."
        maxWidth="sm"
        hasForm={false}
        guardUnsavedChanges={false}
      >
        <DialogScrollContent>
          {availableComponents.length === 0 && (
            <Alert
              severity="info"
              variant="outlined"
              sx={{
                mb: 2,
                bgcolor: 'background.paper',
                borderColor: 'divider',
                '& .MuiAlert-icon': { color: 'text.secondary' },
              }}
            >
              {allComponentsAdded
                ? `All available ${componentKind} components are already added to this template. Edit the existing rules or create another component.`
                : `No active ${componentKind} components are available. Create ${addKind === 'EARNING' ? 'an earning' : 'a deduction'} component first, then return to add its salary rule.`}
              {!canCreateComponent && ' Ask your HR administrator to create the component.'}
            </Alert>
          )}
          <Autocomplete
            autoHighlight
            size="small"
            fullWidth
            options={availableComponents}
            noOptionsText={
              availableComponents.length
                ? 'No matching components'
                : `No available ${addKind === 'EARNING' ? 'earning' : 'deduction'} components. Review payroll component setup or components already added.`
            }
            value={selectedComponent}
            onChange={(_, value) => setSelectedComponent(value)}
            getOptionLabel={(option) => option.name}
            isOptionEqualToValue={(option, value) => option.componentId === value.componentId}
            renderInput={(params) => (
              <TextField {...params} size="small" label="Payroll component" />
            )}
          />
          {canCreateComponent &&
            (openTask ? (
              <Button
                size="small"
                startIcon={<Iconify icon={GlobalIcons.addIcon} />}
                onClick={() => {
                  const task = addKind === 'EARNING' ? 'earnings' : 'deductions';
                  closeComponentPicker();
                  openTask(task);
                }}
              >
                Create {componentKind} component
              </Button>
            ) : (
              <Button
                size="small"
                startIcon={<Iconify icon={GlobalIcons.addIcon} />}
                href={
                  addKind === 'EARNING'
                    ? hrPaths.payroll.settings.earningComponents
                    : hrPaths.payroll.settings.deductionComponents
                }
                target="_blank"
                rel="noopener noreferrer"
              >
                Create {componentKind} component (new tab)
              </Button>
            ))}
          {!openTask && (
            <HrSetupRefresh
              refresh={async () => {
                setSelectedComponent(null);
                setPreview(null);
                await onRefreshCatalog();
              }}
              disabled={busy}
            />
          )}
        </DialogScrollContent>
        <DialogActions>
          <Button
            size="small"
            variant="outlined"
            startIcon={<Iconify icon="mdi:close" />}
            onClick={closeComponentPicker}
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
