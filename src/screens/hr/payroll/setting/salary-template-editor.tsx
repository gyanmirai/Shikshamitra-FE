'use client';

import type { FormikProps } from 'formik';
import type { MutableRefObject } from 'react';
import type { RootState } from 'src/redux/store';
import type {
  SalaryTemplate,
  SalaryTemplateRule,
  SalaryTemplatePreview,
  PreviewSalaryTemplateRequest,
  SalaryTemplateComponentCatalogItem,
} from 'src/redux/hr/salary-template-api';

import * as Yup from 'yup';
import { getIn } from 'formik';
import { toast } from 'sonner';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { Iconify } from 'src/components/iconify';
import { hasGrantedPermission } from 'src/utils/permissions';
import { hrPaths, hrPermissions } from 'src/constants/hr-menus';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useUnsavedNavigation } from 'src/hooks/use-unsaved-navigation';
import { CustomStepperWithFormik } from 'src/components/custom-stepper';
import { useRef, useMemo, useState, useEffect, useCallback } from 'react';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import {
  Box,
  Chip,
  Alert,
  Button,
  Skeleton,
  TextField,
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
import SalaryTemplateConfigure from './salary-template-configure';
import { applySemanticType, createTemplateRule, normalizeRuleOrder } from './salary-template-editor-utils';
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
type Controls = { review: () => void; save: () => void };
type Status = { valid: boolean; previewCurrent: boolean; busy: boolean; calculating: boolean };
const steps = ['Configure', 'Review'];
const emptySchema = Yup.object({});
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
        <Box role="status" aria-label="Loading salary template" sx={{ p: 2 }}>
          <Skeleton height={60} />
          <Skeleton height={200} />
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
function SalaryTemplateWorkflow({ template: sourceTemplate, ...props }: WorkflowProps) {
  const { readOnly, isCreate, onClose } = props;
  // Pin the version and concurrency stamp for this editing session. Refetches must not replace edits.
  const [template] = useState(sourceTemplate);
  const [initialValues] = useState(() => initialEditorValues(template));
  const [activeStep, setActiveStep] = useState(0);
  const controller = useRef<Controls | null>(null);
  const [status, setStatus] = useState<Status>({
    valid: false,
    previewCurrent: false,
    busy: false,
    calculating: false,
  });
  const reportStatus = useCallback(
    (next: Status) =>
      setStatus((previous) =>
        Object.keys(next).every(
          (key) => previous[key as keyof Status] === next[key as keyof Status]
        )
          ? previous
          : next
      ),
    []
  );
  return (
    <CustomStepperWithFormik
      scrollbarHeight="auto"
      showSaveButton={false}
      initialValues={initialValues}
      validationSchema={readOnly ? emptySchema : editorSchema}
      steps={steps}
      activeStep={activeStep}
      completedSteps={[...(status.valid ? [0] : []), ...(status.previewCurrent ? [1] : [])]}
      handleBack={() => setActiveStep(0)}
      onCancel={onClose}
      handleNext={(last) => {
        if (last) {
          if (readOnly) onClose();
          else controller.current?.save();
        } else controller.current?.review();
      }}
      onStepClick={(index) => {
        if (index === 0) setActiveStep(0);
        else controller.current?.review();
      }}
      validateForwardStepClick={!readOnly}
      validateFinalStep={!readOnly}
      nextButtonLabel="Review"
      finalButtonLabel={readOnly ? 'Close' : isCreate ? 'Create Template' : 'Save Changes'}
      disableSubmit={
        !readOnly && (!status.previewCurrent || !status.valid || status.calculating || status.busy)
      }
      saveAndNextButtonProps={{
        loading: status.busy,
        sx: isCreate && activeStep === 1 ? { minWidth: 140 } : undefined,
      }}
      renderItem={({ formik }) => (
        <SalaryTemplateFormContent
          {...props}
          template={template}
          formik={formik}
          activeStep={activeStep}
          setActiveStep={setActiveStep}
          controller={controller}
          reportStatus={reportStatus}
        />
      )}
    />
  );
}

type ContentProps = WorkflowProps & {
  formik: FormikProps<EditorValues>;
  activeStep: number;
  setActiveStep: (step: number) => void;
  controller: MutableRefObject<Controls | null>;
  reportStatus: (status: Status) => void;
};
function SalaryTemplateFormContent({
  template,
  isCreate,
  readOnly,
  catalogData,
  onClose,
  onSaved,
  onDirtyChange,
  onBusyChange,
  onReload,
  formik,
  activeStep,
  setActiveStep,
  controller,
  reportStatus,
}: ContentProps) {
  const templateId = template?.id;
  const { data: versionData } = useGetSalaryTemplateVersionsQuery(templateId || '', {
    skip: !templateId,
  });
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [pendingFocus, setPendingFocus] = useState<string | null>(null);
  const [showIssues, setShowIssues] = useState(false);
  const [createTemplate, createState] = useCreateSalaryTemplateMutation();
  const [updateTemplate, updateState] = useUpdateSalaryTemplateMutation();
  const [calculate, calculationState] = usePreviewSalaryTemplateMutation();
  const [addKind, setAddKind] = useState<SalaryTemplateRule['lineKind'] | null>(null);
  const [addingProfessionalTax, setAddingProfessionalTax] = useState(false);
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
    }
  };

  const runSample = async () => {
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

  const busy = createState.isLoading || updateState.isLoading;
  const valid = editorSchema.isValidSync(formik.values) && issues.length === 0;
  useEffect(() => {
    reportStatus({
      valid,
      previewCurrent: Boolean(previewCurrent),
      busy,
      calculating: calculationState.isLoading,
    });
  }, [valid, previewCurrent, busy, calculationState.isLoading, reportStatus]);
  useEffect(() => onBusyChange(busy), [busy, onBusyChange]);
  useEffect(() => {
    controller.current = {
      save,
      review: () => {
        if (!readOnly && issues.length) {
          setShowIssues(true);
          setPendingFocus(issues[0].includes('PF') ? 'salary-deductions' : 'salary-earnings');
          return;
        }
        setActiveStep(1);
      },
    };
  });
  useEffect(() => {
    const invalid = formik.values.rules.filter(
      (rule, index) =>
        getIn(formik.touched, `rules[${index}]`) && getIn(formik.errors, `rules[${index}]`)
    );
    if (!invalid.length) return;
    setExpanded((current) => new Set([...current, ...invalid.map((rule) => rule.componentId)]));
    setPendingFocus(`salary-rule-${invalid[0].componentId}`);
  }, [formik.errors, formik.touched, formik.values.rules]);
  useEffect(() => {
    if (!pendingFocus || activeStep !== 0) return undefined;
    const frame = requestAnimationFrame(() => {
      const region = document.getElementById(pendingFocus);
      const target =
        region?.querySelector<HTMLElement>('[aria-invalid="true"]:not([type="hidden"])') ||
        region?.querySelector<HTMLElement>(
          'input:not([type="hidden"]):not([disabled]), [role="combobox"]:not([aria-disabled="true"])'
        ) ||
        region?.querySelector<HTMLElement>('button:not([disabled])') ||
        region;
      target?.focus();
      target?.scrollIntoView?.({ block: 'center' });
      setPendingFocus(null);
    });
    return () => cancelAnimationFrame(frame);
  }, [pendingFocus, activeStep]);
  const editSection = (section: 'Basic Information' | 'Earnings' | 'Deductions') => {
    setActiveStep(0);
    setPendingFocus(
      section === 'Basic Information'
        ? 'salary-basic-information'
        : section === 'Earnings'
          ? 'salary-earnings'
          : 'salary-deductions'
    );
  };
  return (
    <Box sx={{ p: { xs: 1, md: 2 }, minWidth: 0 }}>
      {activeStep === 0 ? (
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
          onAdd={(kind) => { setAddingProfessionalTax(false); setAddKind(kind); }}
          onAddProfessionalTax={() => { setAddingProfessionalTax(true); setAddKind('DEDUCTION'); }}
          issues={showIssues ? issues : []}
        />
      ) : (
        <SalaryTemplateReview
          serverError={serverError}
          onReload={onReload}
          templateId={templateId}
          issues={issues}
          readOnly={readOnly}
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
          onEditSection={editSection}
        />
      )}
      <CustomDialog
        open={Boolean(addKind)}
        handleClose={() => {
          setAddKind(null);
          setSelectedComponent(null);
        }}
        title={addingProfessionalTax ? 'Choose Professional Tax deduction component' : `Add ${addKind === 'EARNING' ? 'earning' : 'deduction'} component`}
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
                  addingProfessionalTax
                    ? applySemanticType(createTemplateRule(selectedComponent, formik.values.rules.length), 'PROFESSIONAL_TAX')
                    : createTemplateRule(selectedComponent, formik.values.rules.length),
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
