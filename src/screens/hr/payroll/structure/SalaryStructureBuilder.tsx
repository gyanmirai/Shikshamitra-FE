'use client';

import type { FormikProps } from 'formik';
import type { RootState } from 'src/redux/store';
import type { EsiManagementMode } from 'src/redux/hr/esi-policy-api';
import type { StaffStatutoryProfile } from 'src/redux/hr/statutory-profile-api';
import type { SaveEmployeeCompensation } from 'src/redux/hr/compensation-revision-api';
import type {
  SalaryBasis,
  PfEnrollment,
  SalaryRuleOverride,
  SalaryTemplateCalculation,
} from 'src/redux/hr/salary-template-api';

import dayjs from 'dayjs';
import { createPortal } from 'react-dom';
import { useSelector } from 'react-redux';
import { Iconify } from 'src/components/iconify';
import { ExpandMore } from '@mui/icons-material';
import { useGetPFQuery } from 'src/redux/PF/PFApi';
import { hrPermissions } from 'src/constants/hr-menus';
import { shikshaMitraToast } from 'src/components/toast';
import CustomStepper from 'src/components/custom-stepper';
import { hasGrantedPermission } from 'src/utils/permissions';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { HrNotice } from 'src/screens/hr/components/hr-notice';
import { FormSectionCard } from 'src/components/form-section-card';
import { formatPayrollCurrency } from 'src/utils/payroll-currency';
import { useId, useRef, useMemo, useState, useEffect } from 'react';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import NumericFormatCustom from 'src/components/custom-numeric-format';
import { useUpdateEmployeeStatusMutation } from 'src/redux/hr/employeeApi';
import { type HrFailure, normalizeHrFailure } from 'src/screens/hr/recovery/hr-failure';
import { HrSetupLink, HrSetupRefresh } from 'src/screens/hr/recovery/hr-setup-controls';
import {
  effectiveEsiPolicyVersion,
  useGetEsiPolicyOptionsQuery,
} from 'src/redux/hr/esi-policy-api';
import {
  StatutoryProfileFields,
  statutoryProfileSchema,
} from 'src/screens/hr/employee/statutory-profile-fields';
import {
  StatutoryProfileEditor,
  type StatutoryProfileDraft,
} from 'src/screens/hr/employee/statutory-profile-editor';
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
  Stack,
  Alert,
  Paper,
  Button,
  Select,
  Tooltip,
  MenuItem,
  Skeleton,
  TextField,
  Accordion,
  IconButton,
  Typography,
  InputLabel,
  FormControl,
  LinearProgress,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';

import { EsiPolicyFields } from '../setting/esi-policy-fields';
import { getLocalMonthKey } from './salary-structure-builder-utils';
import { formatPayrollMonth } from '../setting/esi-statutory-utils';
import { EmployeeEsiDetails } from '../setting/employee-esi-details';
import { SalaryTemplateSetupState } from './salary-template-setup-state';
import { SalaryTotals, SalaryBreakdown, StatutorySummary } from './salary-summary-view';

type Props = {
  formik: FormikProps<any>;
  onboarding?: {
    statutoryForm: FormikProps<StaffStatutoryProfile>;
    onSalaryChange: (salary: SaveEmployeeCompensation | null) => void;
  };
  employeeId?: string;
  dateOfJoining?: string | null;
  employeeIsActive?: boolean;
  actionContainer?: HTMLElement | null;
  initialMonth?: string;
  onEffectiveMonthChange?: (month: string) => void;
  onEditorStateChange?: (state: { dirty: boolean; busy: boolean }) => void;
};

const monthlyPayload = (month: string) => `${month}-01T00:00:00.000Z`;
const newKey = () => globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`;
const contractLabel = (value: string) =>
  value
    .toLowerCase()
    .replaceAll('_', ' ')
    .replace(/(^|\s)\S/g, (letter) => letter.toUpperCase());

export function SalaryStructureBuilder({
  formik,
  onboarding,
  employeeId,
  dateOfJoining,
  employeeIsActive = false,
  actionContainer,
  initialMonth,
  onEffectiveMonthChange,
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
  const canActivate =
    !onboarding && hasGrantedPermission(permissions, 'HR.Employee.EmployeeList.Edit');
  const {
    data: templateData,
    isLoading: templatesLoading,
    isFetching: templatesFetching,
    isError: templatesError,
    error: templateError,
    refetch: refetchTemplates,
  } = useGetActiveSalaryTemplatesQuery(undefined, { refetchOnMountOrArgChange: 30 });
  const { data: pfData, isError: pfRulesError, refetch: refetchPfRules } = useGetPFQuery({});
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
  const [effectiveMonth, setEffectiveMonth] = useState(initialMonth || getLocalMonthKey());
  const [pendingMonth, setPendingMonth] = useState<string | null>(null);
  useEffect(
    () => onEffectiveMonthChange?.(effectiveMonth),
    [effectiveMonth, onEffectiveMonthChange]
  );
  const [monthlyAmount, setMonthlyAmount] = useState(
    Number(formik.values.quotedMonthlyAmount || 0)
  );
  const [pfEnrollment, setPfEnrollment] = useState<PfEnrollment>({ membership: 'UNKNOWN' });
  const [pfChoice, setPfChoice] = useState<'OPT_IN' | 'OPT_OUT' | null>(null);
  const [pfRuleId, setPfRuleId] = useState('');
  const [esiMode, setEsiMode] = useState<EsiManagementMode>('IN_PLATFORM');
  const [esiPolicyId, setEsiPolicyId] = useState('');
  const [esiReason, setEsiReason] = useState('');
  const esiInvalid = esiMode === 'IN_PLATFORM' ? !esiPolicyId : !esiReason.trim();
  const [savedStatutoryProfile, setSavedStatutoryProfile] =
    useState<import('src/redux/hr/statutory-profile-api').StaffStatutoryProfileResponse>();
  const [existingStatutoryDraft, setStatutoryDraft] = useState<StatutoryProfileDraft | null>(null);
  const onboardingForm = onboarding?.statutoryForm;
  const isOnboarding = Boolean(onboarding);
  const [calculation, setCalculation] = useState<SalaryTemplateCalculation | null>(null);
  const onboardingGross = salaryBasis === 'GROSS' ? monthlyAmount : calculation?.grossSalary;
  const onboardingPfChoiceRequired =
    isOnboarding && onboardingGross != null && onboardingGross > 25000;
  const statutoryDraft = useMemo<StatutoryProfileDraft | null>(
    () =>
      onboardingForm
        ? {
            profile: onboardingForm.values,
            valid:
              statutoryProfileSchema.isValidSync(onboardingForm.values) &&
              (!onboardingPfChoiceRequired || pfChoice !== null),
            dirty: onboardingForm.dirty,
            effectiveMonth,
            concurrencyStamp: null,
            updatePf: true,
            updateEsic: true,
            pfChoice: onboardingPfChoiceRequired
              ? pfChoice === null
                ? null
                : pfChoice === 'OPT_IN'
              : onboardingForm.values.applyPf,
          }
        : existingStatutoryDraft,
    [onboardingForm, effectiveMonth, existingStatutoryDraft, onboardingPfChoiceRequired, pfChoice]
  );
  useEffect(() => {
    if (isOnboarding && initialMonth) setEffectiveMonth(initialMonth);
  }, [isOnboarding, initialMonth]);
  const [customizing, setCustomizing] = useState(false);
  const [templateChangeAccepted, setTemplateChangeAccepted] = useState(false);
  const [overrides, setOverrides] = useState<SalaryRuleOverride[]>([]);
  const [customizationReason, setCustomizationReason] = useState('');
  const [calculatedSignature, setCalculatedSignature] = useState('');
  const [activationCompleted, setActivationCompleted] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [baseline, setBaseline] = useState<string | null>(null);
  const [esiEditorState, setEsiEditorState] = useState({ dirty: false, busy: false });
  const [savedSignature, setSavedSignature] = useState('');
  const [operationError, setOperationError] = useState('');
  const [operationFailure, setOperationFailure] = useState<HrFailure | null>(null);
  const [operationSection, setOperationSection] = useState<'salary' | 'statutory'>('salary');
  const [hasConflict, setHasConflict] = useState(false);
  const [localBusy, setLocalBusy] = useState(false);
  const [setupRefreshing, setSetupRefreshing] = useState(false);
  const [operation, setOperation] = useState<'calculate' | 'save' | null>(null);
  const [amountTouched, setAmountTouched] = useState(false);
  const [reasonTouched, setReasonTouched] = useState(false);
  const reasonInput = useRef<HTMLInputElement>(null);
  const salaryFields = useRef<HTMLDivElement>(null);
  const statutoryFields = useRef<HTMLDivElement>(null);
  const previewButton = useRef<HTMLButtonElement>(null);
  const previewSection = useRef<HTMLDivElement>(null);
  const footerStatusId = useId();
  const operationPending = useRef(false);
  const initializedRef = useRef('');
  const suggestedMonthRef = useRef('');
  const operationKeyRef = useRef('');
  const operationSignatureRef = useRef('');
  const salaryTemplateLabelId = useId();
  const salaryBasisLabelId = useId();
  const pfRuleLabelId = useId();

  const templates = templateData?.items || [];
  const templateLookupReady = Boolean(templateData) && !templatesError && !templatesFetching;
  const defaultTemplate = templates.find((template) => template.isDefault) || templates[0];
  const selectedTemplate = selectedTemplateId
    ? templates.find((template) => template.id === selectedTemplateId)
    : defaultTemplate;
  const selectedVersion = selectedTemplate?.editableVersion;
  const pfRules = (pfData?.items || []).filter((rule: any) => rule.isActive);
  const pfNotApplicable = calculation?.pfEligibility?.status === 'NOT_APPLICABLE';
  const continuingPfMember =
    pfEnrollment.membership === 'EXISTING_MEMBER' ||
    calculation?.pfEligibility?.status === 'CONTINUING_MEMBER';
  const pfRequired =
    !pfNotApplicable &&
    (continuingPfMember ||
      (salaryBasis === 'GROSS' && monthlyAmount > 0 && monthlyAmount <= 25000) ||
      calculation?.pfEligibility?.enrollmentRequired === true);
  const pfApplicable =
    !pfNotApplicable &&
    (statutoryDraft ? statutoryDraft.profile.applyPf : pfRequired || pfChoice === 'OPT_IN');
  const pfChoiceMissing =
    employeeId && !statutoryDraft
      ? true
      : statutoryDraft
        ? !statutoryDraft.valid
        : !pfRequired &&
          !pfNotApplicable &&
          pfChoice === null &&
          ((salaryBasis === 'GROSS' && monthlyAmount > 25000) ||
            calculation?.pfEligibility?.status === 'VOLUNTARY');
  useEffect(() => {
    if (pfApplicable && !pfRuleId) {
      setPfRuleId(selectedVersion?.defaultPfRuleId || pfRules[0]?.id || '');
    }
  }, [pfApplicable, pfRuleId, selectedVersion?.defaultPfRuleId, pfRules]);
  const sourceRevision = revisionData?.items
    .filter(
      (item) =>
        item.status === 'EFFECTIVE' &&
        item.effectiveMonth.slice(0, 7) <= (initialMonth || getLocalMonthKey())
    )
    .sort(
      (a, b) =>
        b.effectiveMonth.localeCompare(a.effectiveMonth) || b.revisionNumber - a.revisionNumber
    )[0];
  const templateChangeRequired = Boolean(
    sourceRevision?.sourceSalaryTemplateVersionId &&
    selectedVersion?.id !== sourceRevision.sourceSalaryTemplateVersionId &&
    !templateChangeAccepted
  );
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
    const source = sourceRevision;
    if (source) {
      setSelectedTemplateId(source.sourceSalaryTemplateId || selectedTemplate.id);
      setSalaryBasis(source.salaryBasis);
      setEffectiveMonth(initialMonth || suggestedMonthRef.current || getLocalMonthKey());
      setMonthlyAmount(source.quotedMonthlyAmount);
      setPfEnrollment(
        source.pfEnrollment ?? { membership: source.pfRuleId ? 'EXISTING_MEMBER' : 'UNKNOWN' }
      );
      setPfChoice(source.pfRuleId ? 'OPT_IN' : 'OPT_OUT');
      setPfRuleId(source.pfRuleId || '');
      setEsiMode(source.esiManagementMode || 'IN_PLATFORM');
      setEsiPolicyId(source.esiPolicyId || '');
      setEsiReason(source.esiExternalReason || '');
      setOverrides(source.overrides || []);
      setCustomizationReason(source.customizationReason || '');
      setCustomizing(source.isCustomized);
    } else {
      setSelectedTemplateId(selectedTemplate.id);
      setSalaryBasis(selectedTemplate.editableVersion.defaultSalaryBasis);
      setPfChoice(null);
      setPfRuleId(selectedTemplate.editableVersion.defaultPfRuleId || '');
      setEsiMode(selectedTemplate.editableVersion.defaultEsiManagementMode || 'IN_PLATFORM');
      setEsiPolicyId(selectedTemplate.editableVersion.defaultEsiPolicyId || '');
      setEsiReason(selectedTemplate.editableVersion.defaultEsiExternalReason || '');
      const joining = dateOfJoining;
      if (joining && !initialMonth)
        setEffectiveMonth(
          [suggestedMonthRef.current || getLocalMonthKey(), dayjs(joining).format('YYYY-MM')]
            .sort()
            .at(-1)!
        );
    }
    initializedRef.current = initializationKey;
    setInitialized(true);
  }, [
    dateOfJoining,
    initialMonth,
    sourceRevision,
    employeeId,
    revisionData?.items,
    revisionsLoading,
    revisionsFetching,
    templatesFetching,
    selectedTemplate,
  ]);

  useEffect(() => setActivationCompleted(false), [employeeId]);

  const signature = JSON.stringify({
    templateChangeAccepted,
    statutoryProfile: statutoryDraft?.profile,
    statutoryProfileConcurrencyStamp: statutoryDraft?.concurrencyStamp,
    templateVersionId: selectedVersion?.id,
    salaryBasis,
    effectiveMonth,
    monthlyAmount,
    pfEnrollment,
    pfApplicable,
    pfChoice,
    pfRuleId,
    esiMode,
    esiPolicyId,
    esiReason,
    overrides: customizing ? overrides : [],
    customizationReason: customizing ? customizationReason.trim() : '',
  });
  const busy =
    localBusy ||
    setupRefreshing ||
    calculationState.isLoading ||
    saveState.isLoading ||
    activationState.isLoading;
  useEffect(() => {
    if (
      initialized &&
      baseline === null &&
      (!employeeId || statutoryDraft) &&
      (!pfApplicable || pfRuleId || !pfRules.length)
    )
      setBaseline(signature);
  }, [
    initialized,
    baseline,
    signature,
    employeeId,
    statutoryDraft,
    pfApplicable,
    pfRuleId,
    pfRules.length,
  ]);
  useEffect(() => {
    onEditorStateChange?.({
      dirty: (baseline !== null && baseline !== signature) || esiEditorState.dirty,
      busy: busy || esiEditorState.busy,
    });
  }, [baseline, signature, busy, esiEditorState.dirty, esiEditorState.busy, onEditorStateChange]);
  const { data: esiPolicies, refetch: refetchEsiPolicies } = useGetEsiPolicyOptionsQuery();
  const refreshSetup = async () => {
    if (operationPending.current) throw new Error('A salary operation is already in progress.');
    operationPending.current = true;
    setSetupRefreshing(true);
    // Refetch options only: never reset salary/statutory drafts or advance a saved revision.
    setCalculation(null);
    setCalculatedSignature('');
    try {
      await Promise.all([
        refetchTemplates().unwrap(),
        refetchPfRules().unwrap(),
        refetchEsiPolicies().unwrap(),
      ]);
    } finally {
      operationPending.current = false;
      setSetupRefreshing(false);
    }
  };
  const effectiveEsiVersion = effectiveEsiPolicyVersion(
    esiPolicies?.find((policy) => policy.id === esiPolicyId),
    effectiveMonth
  );
  const calculationCurrent = Boolean(
    calculation &&
    calculatedSignature === signature &&
    (esiMode === 'EXTERNAL' ||
      (calculation.employeeStateInsurance.ruleId &&
        calculation.employeeStateInsurance.ruleId === effectiveEsiVersion?.id))
  );

  useEffect(() => {
    if (operationSignatureRef.current && operationSignatureRef.current !== signature) {
      operationKeyRef.current = '';
    }
  }, [signature]);

  const chooseTemplate = (templateId: string) => {
    const template = templates.find((item) => item.id === templateId);
    setSelectedTemplateId(templateId);
    setTemplateChangeAccepted(true);
    if (template) {
      setSalaryBasis(template.editableVersion.defaultSalaryBasis);
      setPfChoice(null);
      setPfRuleId(template.editableVersion.defaultPfRuleId || '');
      setEsiMode(template.editableVersion.defaultEsiManagementMode || 'IN_PLATFORM');
      setEsiPolicyId(template.editableVersion.defaultEsiPolicyId || '');
      setEsiReason(template.editableVersion.defaultEsiExternalReason || '');
      setCustomizing(false);
      setOverrides([]);
      setCustomizationReason('');
    }
    setCalculation(null);
  };

  const calculateSalary = async () => {
    if (
      !templateLookupReady ||
      operationPending.current ||
      !canManage ||
      !selectedVersion ||
      templateChangeRequired ||
      !Number.isFinite(monthlyAmount) ||
      monthlyAmount <= 0 ||
      !/^\d{4}-\d{2}$/.test(effectiveMonth) ||
      pfChoiceMissing ||
      esiInvalid ||
      (pfApplicable && !pfRuleId)
    )
      return;
    operationPending.current = true;
    setOperation('calculate');
    setLocalBusy(true);
    setOperationError('');
    setOperationFailure(null);
    try {
      if (esiMode === 'IN_PLATFORM') await refetchEsiPolicies();
      const result = await calculate({
        templateVersionId: selectedVersion.id,
        salaryBasis,
        monthlyAmount,
        effectiveMonth: monthlyPayload(effectiveMonth),
        employeeId: employeeId || null,
        pfEnrollment,
        pfApplicable,
        pfRuleId: pfApplicable ? pfRuleId : null,
        esiManagementMode: esiMode,
        esiPolicyId: esiPolicyId || null,
        esiExternalReason: esiReason.trim() || null,
        statutoryProfileOverride: statutoryDraft?.profile,
        statutoryProfileConcurrencyStamp: statutoryDraft?.concurrencyStamp,
        statutoryProfileUpdatePf: statutoryDraft?.updatePf,
        statutoryProfileUpdateEsic: statutoryDraft?.updateEsic,
        overrides: customizing ? overrides : [],
        customizationReason: customizing ? customizationReason.trim() || null : null,
      }).unwrap();
      setCalculation(result);
      setCalculatedSignature(signature);
    } catch (error: any) {
      const failure = normalizeHrFailure(error);
      setOperationError(failure.message);
      setOperationFailure(failure);
      setOperationSection(
        /Pf|Statutory|Esi/i.test(parseApiProblemDetail(error).errorCode ?? '')
          ? 'statutory'
          : 'salary'
      );
      setCalculation(null);
    } finally {
      operationPending.current = false;
      setOperation(null);
      setLocalBusy(false);
    }
  };

  const save = async () => {
    if (
      !templateLookupReady ||
      operationPending.current ||
      !canManage ||
      !employeeId ||
      !selectedVersion ||
      templateChangeRequired ||
      !calculationCurrent ||
      pfChoiceMissing ||
      !calculation ||
      savedSignature === signature ||
      hasConflict ||
      targetBlocked ||
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
    setOperationFailure(null);
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
          pfEnrollment,
          pfApplicable,
          pfRuleId: pfApplicable ? pfRuleId : null,
          esiManagementMode: esiMode,
          esiPolicyId: esiPolicyId || null,
          esiExternalReason: esiReason.trim() || null,
          expectedEsiPolicyVersionId: calculation.employeeStateInsurance.ruleId || null,
          statutoryProfileOverride: statutoryDraft?.profile,
          statutoryProfileConcurrencyStamp: statutoryDraft?.concurrencyStamp,
          statutoryProfileUpdatePf: statutoryDraft?.updatePf,
          statutoryProfileUpdateEsic: statutoryDraft?.updateEsic,
          statutoryProfile: 'IN-GJ',
          overrides: customizing ? overrides : [],
          customizationReason: customizing ? customizationReason.trim() || null : null,
          idempotencyKey: operationKeyRef.current,
          expectedRevision: exactMonthRevision?.revisionNumber || null,
        },
      }).unwrap();
      operationKeyRef.current = '';
      const savedSignatureValue = result.savedStatutoryProfile
        ? JSON.stringify({
            ...JSON.parse(signature),
            statutoryProfile: result.savedStatutoryProfile.profile,
            statutoryProfileConcurrencyStamp: result.savedStatutoryProfile.concurrencyStamp,
          })
        : signature;
      setSavedStatutoryProfile(result.savedStatutoryProfile);
      setBaseline(savedSignatureValue);
      setSavedSignature(savedSignatureValue);
      if (refetchRevisions) await refetchRevisions();
      shikshaMitraToast.success({
        message: result.isScheduled
          ? `Salary revision ${result.revisionNumber} is scheduled for ${effectiveMonth}.`
          : `Salary revision ${result.revisionNumber} is effective.`,
      });
      if (canActivate) {
        await refetchReadiness();
      }
    } catch (error: any) {
      const parsed = parseApiProblemDetail(error);
      const failure = normalizeHrFailure(error);
      const previewStale = parsed.errorCode === 'HR:Payroll:CompensationPreviewStale';
      if (previewStale) {
        setCalculation(null);
        operationKeyRef.current = '';
        await refetchEsiPolicies();
      } else if (error?.status === 409) setHasConflict(true);
      setOperationError(
        previewStale
          ? 'ESIC policy changed. Refresh preview and review the updated salary before saving.'
          : error?.status === 409
            ? 'Salary changed in another session. Reload the history and review before saving again.'
            : failure.message
      );
      setOperationFailure(previewStale || error?.status === 409 ? null : failure);
      setOperationSection(
        /Pf|Statutory|Esi/i.test(parsed.errorCode ?? '') ? 'statutory' : 'salary'
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
      shikshaMitraToast.success({ message: 'Staff activated.' });
      if (canActivate) {
        await refetchReadiness();
      }
    } catch (error: any) {
      shikshaMitraToast.error({ message: parseApiProblemDetail(error).detail });
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

  const changeEffectiveMonth = (month: string) => {
    setStatutoryDraft(null);
    setSavedStatutoryProfile(undefined);
    setEffectiveMonth(month);
    setCalculation(null);
    setPendingMonth(null);
  };

  const statutoryBlocked = calculation
    ? calculation.pfEligibility?.canSave === false ||
      !calculation.employeeStateInsurance.canCalculate ||
      calculation.employeeStateInsurance.issueCodes.some(
        (code) =>
          ![
            'ESI_RATE_OVERRIDE',
            'ESI_APPLY_DISABLED',
            'ESI_NUMBER_MISSING',
            'ESI_REGISTRATION_PENDING',
            'ESI_BASIS_RECONCILIATION_DIFFERENCE',
            'ESI_STATUTORY_ASSESSMENT_UNAVAILABLE',
          ].includes(code) &&
          (code !== 'ESI_INSURANCE_NUMBER_REQUIRED' ||
            !calculation.employeeStateInsurance.registrationPending)
      )
    : false;
  const amountInvalid = !Number.isFinite(monthlyAmount) || monthlyAmount <= 0;
  // Match CompensationRevisionAppService.EnsureCalculationCanBeSaved.
  const targetBlocked = Boolean(
    calculation &&
    !calculation.targetResult.isExact &&
    !calculation.targetResult.isExplainedByEnrollment
  );
  const reasonInvalid = customizing && overrides.length > 0 && !customizationReason.trim();

  const onboardingSalary =
    onboarding &&
    templateLookupReady &&
    canManage &&
    calculationCurrent &&
    !busy &&
    !amountInvalid &&
    monthlyAmount <= 100000000 &&
    !reasonInvalid &&
    !pfChoiceMissing &&
    !statutoryBlocked &&
    !targetBlocked &&
    !esiInvalid &&
    selectedVersion &&
    calculation
      ? {
          templateVersionId: selectedVersion.id,
          salaryBasis,
          monthlyAmount,
          effectiveMonth: monthlyPayload(effectiveMonth),
          pfEnrollment,
          pfApplicable,
          pfRuleId: pfApplicable ? pfRuleId : null,
          esiManagementMode: esiMode,
          esiPolicyId: esiPolicyId || null,
          esiExternalReason: esiReason.trim() || null,
          expectedEsiPolicyVersionId: calculation.employeeStateInsurance.ruleId || null,
          statutoryProfile: 'IN-GJ' as const,
          overrides: customizing ? overrides : [],
          customizationReason: customizing ? customizationReason.trim() || null : null,
          idempotencyKey: 'onboarding',
          expectedRevision: null,
        }
      : null;
  const onboardingSalarySignature = JSON.stringify(onboardingSalary);
  const onboardingChange = useRef(onboarding?.onSalaryChange);
  onboardingChange.current = onboarding?.onSalaryChange;
  useEffect(() => {
    onboardingChange.current?.(JSON.parse(onboardingSalarySignature));
  }, [onboardingSalarySignature]);

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
            Preview salary
          </Button>
        </Box>
      </Box>
    );
  }
  if (!templateData || (templatesError && !templates.length)) {
    return (
      <SalaryTemplateSetupState
        onboarding={isOnboarding}
        failed
        accessDenied={Boolean(
          templateError && 'status' in templateError && templateError.status === 403
        )}
        busy={busy}
        refresh={refreshSetup}
      />
    );
  }
  if (!templates.length) {
    return (
      <SalaryTemplateSetupState onboarding={isOnboarding} busy={busy} refresh={refreshSetup} />
    );
  }
  if (!employeeId && !onboarding) {
    return (
      <HrNotice role="alert" severity="info">
        Save the staff first. The staff will be created as Inactive, then salary can be set up
        separately.
      </HrNotice>
    );
  }

  const permittedRules = (selectedVersion?.rules || []).filter((rule) =>
    ['BASIC', 'DEARNESS_ALLOWANCE', 'ORDINARY'].includes(rule.semanticType)
  );
  const currentRevision = revisionData?.items.find((item) => item.isCurrent);
  const employeeName =
    formik.values.fullName ||
    [formik.values.firstName, formik.values.lastName].filter(Boolean).join(' ');
  let footerStatus = '';
  if (busy) {
    footerStatus = operation === 'calculate' ? 'Preparing preview…' : 'Refreshing salary…';
    if (operation === 'save') footerStatus = 'Saving salary…';
    if (activationState.isLoading) footerStatus = 'Activating staff…';
  } else if (!canManage) footerStatus = 'View-only salary';
  else if (hasConflict || revisionsError) footerStatus = 'Review salary history before saving';
  else if (!selectedVersion) footerStatus = 'Choose a salary template';
  else if (templateChangeRequired) footerStatus = 'Review the template version change';
  else if (amountInvalid) footerStatus = 'Enter an amount greater than zero';
  else if (!/^\d{4}-\d{2}$/.test(effectiveMonth)) footerStatus = 'Choose an effective month';
  else if (pfChoiceMissing)
    footerStatus =
      statutoryDraft?.pfChoice === null
        ? 'Choose whether to opt in or opt out of PF'
        : 'Review statutory details before previewing';
  else if (pfApplicable && !pfRuleId) footerStatus = 'Choose a PF rule';
  else if (esiInvalid)
    footerStatus =
      esiMode === 'IN_PLATFORM'
        ? 'Choose an ESIC policy'
        : 'Enter the external ESIC management reason';
  else if (statutoryBlocked)
    footerStatus =
      calculation?.pfEligibility?.canSave === false
        ? 'Resolve PF enrollment before saving'
        : 'Resolve ESIC details before saving';
  else if (targetBlocked) footerStatus = 'Resolve the salary amount difference before saving';
  else if (savedSignature === signature && calculationCurrent) footerStatus = 'Saved';
  else if (calculationCurrent) {
    footerStatus = reasonInvalid ? 'Add a customization reason before saving' : 'Preview ready';
  }

  if (!footerStatus)
    footerStatus = calculatedSignature ? 'Preview needs refresh' : 'Preview required';

  const focusSection = (section: 'salary' | 'statutory', selector?: string) => {
    const group = section === 'salary' ? salaryFields.current : statutoryFields.current;
    const target = (selector ? group?.querySelector<HTMLElement>(selector) : null) ?? group;
    target?.scrollIntoView?.({ block: 'center', behavior: 'smooth' });
    target?.focus();
  };
  const reviewStatutory =
    pfChoiceMissing || (pfApplicable && !pfRuleId) || esiInvalid || statutoryBlocked;
  const salaryDetailsReady = Boolean(
    selectedVersion &&
    templateLookupReady &&
    !templateChangeRequired &&
    !amountInvalid &&
    monthlyAmount <= 100000000 &&
    /^\d{4}-\d{2}$/.test(effectiveMonth)
  );
  const needsPreview =
    templateLookupReady &&
    !calculationCurrent &&
    !amountInvalid &&
    selectedVersion &&
    !templateChangeRequired &&
    !reviewStatutory &&
    !hasConflict &&
    !revisionsError;
  const canReviewSave =
    templateLookupReady &&
    canManage &&
    !busy &&
    !hasConflict &&
    !revisionsError &&
    !(savedSignature === signature && calculationCurrent) &&
    (!calculationCurrent || reasonInvalid || reviewStatutory || targetBlocked);

  const pfSettings = (
    <Stack spacing={1.5}>
      {(pfRulesError || (pfApplicable && !pfRules.length)) && (
        <Alert severity="warning">
          {pfRulesError
            ? 'PF rules could not be loaded. Refresh setup and retry.'
            : 'An active PF rule is required for the selected PF enrollment.'}
          <HrSetupLink setup="pf" disabled={busy} />
        </Alert>
      )}
      <FormControl
        fullWidth
        size="small"
        disabled={
          !canManage ||
          busy ||
          !pfApplicable ||
          pfRulesError ||
          (statutoryDraft?.pfChoice === null && !continuingPfMember)
        }
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
      <TextField
        select
        size="small"
        fullWidth
        label="Previous PF membership"
        value={pfEnrollment.membership}
        disabled={!canManage || busy}
        onChange={(event) => {
          setPfEnrollment((value) => ({
            ...value,
            membership: event.target.value as PfEnrollment['membership'],
          }));
          setCalculation(null);
        }}
      >
        <MenuItem value="UNKNOWN">Needs review</MenuItem>
        <MenuItem value="EXISTING_MEMBER">Existing PF member</MenuItem>
        <MenuItem value="NOT_MEMBER">Not previously enrolled</MenuItem>
      </TextField>
      {pfApplicable && !pfRequired && pfEnrollment.membership === 'NOT_MEMBER' && (
        <TextField
          size="small"
          fullWidth
          label="Employee consent reference"
          value={pfEnrollment.consentReference ?? ''}
          disabled={!canManage || busy}
          helperText="Required for voluntary enrollment above the coverage ceiling."
          onChange={(event) => {
            setPfEnrollment((value) => ({
              ...value,
              consentReference: event.target.value,
            }));
            setCalculation(null);
          }}
        />
      )}
      {calculation?.pfEligibility && (
        <HrNotice severity={calculation.pfEligibility.canSave ? 'info' : 'warning'}>
          PF: {contractLabel(calculation.pfEligibility.status)}. Gross salary:{' '}
          {formatPayrollCurrency(calculation.pfEligibility.grossSalary ?? calculation.grossSalary)}.
          PF calculation wages: {formatPayrollCurrency(calculation.pfEligibility.wages)}. Coverage
          ceiling: {formatPayrollCurrency(calculation.pfEligibility.coverageCeiling)}.
          {calculation.pfEligibility.issueCode
            ? ` ${contractLabel(calculation.pfEligibility.issueCode)}. Review school PF coverage in PF settings and the employee enrollment above.`
            : ''}
          {!calculation.pfEligibility.canSave && <HrSetupLink setup="pf" disabled={busy} />}
        </HrNotice>
      )}
    </Stack>
  );
  const actions = (
    <>
      <Typography
        id={footerStatusId}
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
        {canReviewSave && (
          <Button
            size="small"
            color="inherit"
            onClick={() => {
              if (reasonInvalid && calculationCurrent) reasonInput.current?.focus();
              else if (needsPreview) {
                previewButton.current?.scrollIntoView?.({ block: 'center' });
                previewButton.current?.focus();
              } else
                focusSection(
                  reviewStatutory ? 'statutory' : 'salary',
                  amountInvalid ? '[name="monthlyAmount"]' : undefined
                );
            }}
          >
            {reasonInvalid && calculationCurrent
              ? 'Review customization reason'
              : reviewStatutory
                ? 'Review statutory deductions'
                : needsPreview
                  ? 'Go to salary preview'
                  : 'Review salary details'}
          </Button>
        )}
      </Typography>

      {!onboarding && (
        <Button
          size="small"
          variant="contained"
          onClick={save}
          aria-describedby={footerStatusId}
          loading={operation === 'save'}
          sx={
            actionContainer
              ? { gridColumn: { xs: 2, sm: 4 }, gridRow: { xs: 2, sm: 1 }, justifySelf: 'end' }
              : undefined
          }
          disabled={
            !templateLookupReady ||
            !canManage ||
            busy ||
            !calculationCurrent ||
            pfChoiceMissing ||
            statutoryBlocked ||
            targetBlocked ||
            savedSignature === signature ||
            hasConflict ||
            revisionsError
          }
        >
          Save salary
        </Button>
      )}
    </>
  );
  return (
    <Box
      display="grid"
      gap={2.5}
      sx={{
        minWidth: 0,
        gridTemplateColumns: onboarding
          ? { xs: 'minmax(0, 1fr)', md: '220px minmax(0, 1fr)' }
          : 'minmax(0, 1fr)',
        alignItems: 'start',
      }}
    >
      {onboarding && (
        <Box component="nav" aria-label="Salary setup sections" sx={{ minWidth: 0 }}>
          <CustomStepper
            orientation="vertical"
            ariaLabel="Salary setup progress"
            steps={['Template and amount', 'Statutory deductions', 'Salary preview']}
            activeStep={!salaryDetailsReady ? 0 : reviewStatutory ? 1 : 2}
            stepStates={[
              salaryDetailsReady ? 'completed' : 'active',
              onboardingSalary ? 'completed' : 'pending',
              onboardingSalary ? 'completed' : 'pending',
            ]}
            stepCaptions={[
              <Typography variant="caption" key="amount" color="text.secondary">
                {!selectedVersion
                  ? 'Choose an active template.'
                  : amountInvalid
                    ? 'Enter a monthly amount greater than zero.'
                    : 'Template and amount selected.'}
              </Typography>,
              <Typography variant="caption" key="statutory" color="text.secondary">
                {reviewStatutory
                  ? 'Complete PF and ESIC details before previewing.'
                  : 'Review PF and ESIC declarations; preview checks eligibility.'}
              </Typography>,
              <Typography variant="caption" key="preview" color="text.secondary">
                {onboardingSalary
                  ? 'Ready for final review. Finalize saves staff and salary together.'
                  : 'Preview salary after setup. Changes require a fresh preview.'}
              </Typography>,
            ]}
            disabled={busy}
            onStepClick={(index) => {
              if (index < 2) focusSection(index === 0 ? 'salary' : 'statutory');
              else {
                const target = calculation ? previewSection.current : previewButton.current;
                target?.scrollIntoView?.({ block: 'center' });
                target?.focus();
              }
            }}
          />
        </Box>
      )}
      <Box
        component="fieldset"
        disabled={busy}
        sx={{ border: 0, p: 0, m: 0, minWidth: 0, display: 'grid', gap: 2.5 }}
      >
        {templatesFetching && <LinearProgress aria-label="Refreshing salary templates" />}
        {templatesError && (
          <SalaryTemplateSetupState
            onboarding={isOnboarding}
            failed
            accessDenied={Boolean(
              templateError && 'status' in templateError && templateError.status === 403
            )}
            busy={busy}
            refresh={refreshSetup}
          />
        )}
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
          {employeeId && (
            <EmployeeEsiDetails
              onEditorStateChange={setEsiEditorState}
              employeeId={employeeId || ''}
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
          )}
        </Box>
        <FormSectionCard
          icon="solar:wallet-money-bold"
          title="Salary details"
          descriptionTooltip="Preview a full month before saving. Attendance and monthly adjustments are applied in Run Payroll."
          sx={{ border: 0 }}
          contentSpacing={3}
        >
          {!selectedVersion && (
            <Alert severity="warning">
              The selected salary template is no longer available. Choose an active template before
              previewing or saving.
            </Alert>
          )}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            <HrSetupLink setup="templates" disabled={busy} />
            <HrSetupRefresh refresh={refreshSetup} disabled={busy} />
          </Stack>
          {templateChangeRequired && (
            <Alert
              severity="warning"
              action={
                <Button size="small" onClick={() => setTemplateChangeAccepted(true)}>
                  Use current template
                </Button>
              }
            >
              This salary was saved with an earlier template version. Using the current template may
              change its earnings breakdown.
            </Alert>
          )}
          <Grid
            ref={salaryFields}
            tabIndex={-1}
            aria-label="Salary details fields"
            container
            columnSpacing={2}
            rowSpacing={3}
          >
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl
                fullWidth
                size="small"
                disabled={!canManage || busy || !templateLookupReady}
              >
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
                disabled={Boolean(onboarding) || !canManage || busy}
                onChange={(event) => {
                  const month = event.target.value;
                  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month) || month === effectiveMonth) return;
                  if (statutoryDraft?.dirty) setPendingMonth(month);
                  else changeEffectiveMonth(month);
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
                  salaryBasis === 'EMPLOYER_COST'
                    ? 'Monthly cost to school (CTC)'
                    : 'Monthly salary'
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
            <Grid size={{ xs: 12, sm: 6 }}>
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
          </Grid>
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              mt: 2,
            }}
          >
            <Box sx={{ flex: '1 1 260px' }}>
              <Typography variant="subtitle2">Salary preview</Typography>
              <Typography variant="body2" color="text.secondary">
                Full-month estimate before attendance, unpaid leave, and monthly adjustments. Actual
                payable salary is calculated in Run Payroll.
              </Typography>
            </Box>
            <Button
              size="small"
              variant="outlined"
              color="inherit"
              startIcon={<Iconify icon="solar:eye-bold" />}
              onClick={calculateSalary}
              ref={previewButton}
              loading={operation === 'calculate'}
              loadingPosition="start"
              disabled={
                !templateLookupReady ||
                !canManage ||
                busy ||
                !selectedVersion ||
                templateChangeRequired ||
                !Number.isFinite(monthlyAmount) ||
                monthlyAmount <= 0 ||
                !/^\d{4}-\d{2}$/.test(effectiveMonth) ||
                (pfApplicable && !pfRuleId) ||
                pfChoiceMissing ||
                esiInvalid
              }
            >
              {calculatedSignature ? 'Refresh preview' : 'Preview salary'}
            </Button>{' '}
          </Box>
        </FormSectionCard>
        <FormSectionCard
          icon="solar:shield-check-bold"
          title="Statutory deductions"
          sx={{ border: 0 }}
        >
          <Box
            ref={statutoryFields}
            tabIndex={-1}
            role="group"
            aria-label="Statutory deductions"
            sx={{ display: 'grid', gap: 1.5 }}
          >
            <EsiPolicyFields
              mode={esiMode}
              policyId={esiPolicyId}
              reason={esiReason}
              month={effectiveMonth}
              disabled={!canManage || busy}
              onChange={({ mode, policyId, reason }) => {
                setEsiMode(mode);
                setEsiPolicyId(policyId);
                setEsiReason(reason);
                setCalculation(null);
              }}
            />
            <Box sx={{ gridColumn: '1 / -1' }}>
              {onboarding ? (
                <StatutoryProfileFields
                  form={onboarding.statutoryForm}
                  disabled={!canManage || busy}
                  grossSalary={salaryBasis === 'GROSS' ? monthlyAmount : calculation?.grossSalary}
                  pfSettings={pfSettings}
                  pfChoiceRequired={onboardingPfChoiceRequired}
                  pfChoice={statutoryDraft?.pfChoice}
                  onPfChoice={(apply) => {
                    setPfChoice(apply ? 'OPT_IN' : 'OPT_OUT');
                    onboarding.statutoryForm.setFieldValue('applyPf', apply);
                  }}
                />
              ) : (
                <StatutoryProfileEditor
                  key={effectiveMonth}
                  employeeId={employeeId || ''}
                  month={initialMonth || suggestedMonthRef.current ? effectiveMonth : undefined}
                  savedProfile={savedStatutoryProfile}
                  draftMode
                  pfSettings={pfSettings}
                  pfEnrollmentRecorded={Boolean(currentRevision)}
                  disabled={!canManage || busy}
                  grossSalary={salaryBasis === 'GROSS' ? monthlyAmount : calculation?.grossSalary}
                  onDraftChange={(draft) => {
                    if (draft && !initialMonth && !suggestedMonthRef.current) {
                      suggestedMonthRef.current = [
                        draft.effectiveMonth,
                        dateOfJoining?.slice(0, 7) || '',
                      ]
                        .sort()
                        .at(-1)!;
                      setEffectiveMonth(suggestedMonthRef.current);
                    }
                    setStatutoryDraft(draft);
                    if (draft)
                      setPfChoice(
                        draft.pfChoice == null ? null : draft.pfChoice ? 'OPT_IN' : 'OPT_OUT'
                      );
                  }}
                />
              )}
            </Box>
          </Box>
          <Typography variant="caption" color="text.secondary">
            Professional tax is applied automatically using the effective salary slab.
          </Typography>
        </FormSectionCard>

        <Accordion
          disableGutters
          elevation={0}
          sx={{ border: 1, borderColor: 'divider', '&:before': { display: 'none' } }}
        >
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="subtitle1">Staff-specific customization</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box
              display="flex"
              justifyContent="space-between"
              gap={2}
              alignItems="center"
              flexWrap="wrap"
            >
              <Box>
                <Box display="flex" gap={1} alignItems="center" flexWrap="wrap">
                  <Typography variant="subtitle2">Template adjustments</Typography>
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
                <Box display="flex" gap={1} flexWrap="wrap" sx={{ ml: 'auto' }}>
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
                        <Typography variant="subtitle2">
                          {contractLabel(rule.semanticType)}
                        </Typography>
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
          </AccordionDetails>
        </Accordion>

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
            {operationFailure && (
              <Stack spacing={1}>
                {operationFailure.fields.map((field, index) => (
                  <Typography key={`${field.name}-${index}`} variant="body2">
                    {field.name}: {field.message}
                  </Typography>
                ))}
                <Typography variant="body2">{operationFailure.guidance}</Typography>
                {canManage && (
                  <Button
                    size="small"
                    disabled={busy}
                    onClick={() => focusSection(operationSection)}
                  >
                    {operationSection === 'statutory'
                      ? 'Review statutory deductions'
                      : 'Review salary details'}
                  </Button>
                )}
                {operationFailure.setup && (
                  <HrSetupLink
                    setup={operationFailure.setup}
                    employeeId={employeeId}
                    disabled={busy}
                  />
                )}
              </Stack>
            )}
          </Alert>
        )}
        {calculatedSignature && !calculationCurrent && (
          <HrNotice severity="info">Your changes need a new preview.</HrNotice>
        )}
        {calculation ? (
          <Box
            ref={previewSection}
            tabIndex={-1}
            aria-label="Salary preview"
            display="grid"
            gap={2}
            aria-live="polite"
          >
            {calculation.targetResult.isExplainedByEnrollment && (
              <Alert severity="warning">
                Statutory contribution changes explain a CTC difference of{' '}
                {formatPayrollCurrency(calculation.targetResult.difference)}. Saved gross salary is
                unchanged.
              </Alert>
            )}
            <Typography variant="subtitle1">
              Salary preview · {formatPayrollMonth(effectiveMonth)}
            </Typography>
            <SalaryTotals
              gross={calculation.grossSalary}
              deductions={statutoryBlocked ? null : calculation.totalDeductions}
              net={statutoryBlocked ? null : calculation.netSalary}
              employerCost={statutoryBlocked ? null : calculation.employerCost}
            />
            <Typography variant="body2" color="text.secondary">
              Full-month estimate before attendance, unpaid leave, and monthly adjustments. Actual
              payable salary is calculated in Run Payroll.
            </Typography>
            <StatutorySummary schemes={calculation.statutorySummary || []} />
            {statutoryBlocked && (
              <Alert severity="warning">
                This preview is incomplete. Resolve the statutory setup before saving salary.
              </Alert>
            )}
            <SalaryBreakdown
              earnings={calculation.earnings}
              deductions={calculation.deductions}
              employerContributions={calculation.employerContributions}
            />
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
        <Box
          display="flex"
          justifyContent="flex-end"
          flexWrap="wrap"
          gap={1}
          sx={{ gridColumn: onboarding ? { xs: 1, md: 2 } : undefined }}
        >
          {actions}
        </Box>
      )}
      <ConfirmDialog
        open={pendingMonth !== null}
        onClose={() => setPendingMonth(null)}
        icon="warning"
        title="Change effective month?"
        content="Unsaved statutory details will be discarded and the selected month's registration details will load. Other salary inputs will stay as entered."
        cancelText="Keep current month"
        action={
          <Button
            variant="contained"
            onClick={() => pendingMonth && changeEffectiveMonth(pendingMonth)}
          >
            Change month
          </Button>
        }
      />
    </Box>
  );
}
