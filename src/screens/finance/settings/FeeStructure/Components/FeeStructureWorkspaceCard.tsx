'use client';

import type {
  StructureLine,
  StructureRecord,
  StructurePreview,
  StructureSettings,
  StructureCandidate,
} from 'src/redux/finance/feeStructureWorkspace';

import dayjs from 'dayjs';
import { LoadingButton } from '@mui/lab';
import { uuidv4 } from 'src/utils/uuidv4';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import { useRef, useMemo, useState, useEffect } from 'react';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ShakingTextField from 'src/components/shaking-text-field';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { getStorage, setStorage } from 'src/hooks/use-local-storage';
import { CustomStepperWithFormik } from 'src/components/custom-stepper';
import AdaptiveThreeDotsActions from 'src/components/adaptive-three-dots-actions';
import { FeeStructureLockStatusType } from 'src/enums/finance-fee-structure-status';
import { useDeleteClassWiseFeeStructureMutation } from 'src/redux/finance/financeFeeStructure';
import {
  Box,
  Stack,
  Alert,
  Button,
  Switch,
  Checkbox,
  Skeleton,
  TextField,
  IconButton,
  Typography,
  CircularProgress,
  FormControlLabel,
} from '@mui/material';
import {
  useReviseStructureMutation,
  usePreviewStructureMutation,
  usePublishStructureMutation,
  useSaveStructureDraftMutation,
} from 'src/redux/finance/feeStructureWorkspace';

import PolicyImpactDialog from './PolicyImpactDialog';
import { policyImpactRows } from '../policyImpactModel';
import StructureScheduleDialog from './StructureScheduleDialog';
import useFeeStructureLookups from '../hooks/useFeeStructureLookups';
import {
  amountError,
  defaultPolicy,
  structureError,
  paymentTermError,
  defaultPaymentTerm,
  structureCandidate,
  buildStructureChanges,
  withDefaultPaymentTerm,
} from '../feeStructureModel';

import type { IClassWiseFeeStructureCard } from '../type';
import type { StructurePolicyFamily } from '../feeStructureModel';

interface Props {
  initialData: IClassWiseFeeStructureCard;
  index: number;
  viewOnly?: boolean;
  onSaved?: (saved: IClassWiseFeeStructureCard) => void;
  onDeleted?: () => void;
  onDirtyChange?: (dirty: boolean) => void;
  onBusyChange?: (busy: boolean) => void;
  structureSelector?: React.ReactNode;
}
const workflowSteps = ['Fee heads & terms', 'Policies', 'Review & publish'];
const workflowKeys = ['heads', 'policies', 'review'];
const stepperValues = {};
const workflowDescriptions = [
  'Add fee heads, set amounts, and choose published payment terms.',
  'Choose how fees are collected and refunded.',
  'Check coverage and installment schedules before publishing.',
];
const families: {
  key: StructurePolicyFamily;
  label: string;
  description: string;
  empty: string;
}[] = [
  {
    key: 'collection',
    label: 'Collection Policy',
    description:
      'Late fees and waivers apply to matching heads. Collection controls stay at structure level.',
    empty: 'Select a policy before publishing. Drafts may be incomplete.',
  },
  {
    key: 'refund',
    label: 'Refund Policy',
    description:
      'Defines eligibility for matching heads. Attaching a policy does not approve a refund.',
    empty: 'No refund policy attached',
  },
];
const money = (value: number | null) =>
  value == null
    ? 'Calculated during assignment'
    : new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(Math.ceil(value));

export default function FeeStructureWorkspaceCard({
  initialData,
  index,
  viewOnly = false,
  onSaved,
  onDeleted,
  onDirtyChange,
  onBusyChange,
  structureSelector,
}: Props) {
  const contentRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const focusErrorPending = useRef(false);
  const [record, setRecord] = useState<StructureRecord | undefined>(initialData.record);
  const [candidate, setCandidate] = useState<StructureCandidate>(() =>
    structureCandidate(initialData.record)
  );
  const [baseline, setBaseline] = useState(() =>
    JSON.stringify(structureCandidate(initialData.record))
  );
  const [tab, setTab] = useState('heads');
  const restoredProgress = useRef(false);
  const progressKey = `fee-structure-progress:${initialData.feeStructureMetaDataId}:${initialData.classId}:${record?.id}`;
  useEffect(() => {
    if (restoredProgress.current) return;
    restoredProgress.current = true;
    if (!initialData.record) return;
    const savedStep = getStorage(progressKey);
    if (workflowKeys.includes(savedStep))
      setTab(
        savedStep === 'review' &&
          !initialData.record.collectionPolicyVersionId &&
          initialData.record.status !== FeeStructureLockStatusType.Locked
          ? 'policies'
          : savedStep
      );
  }, [initialData.record, progressKey]);
  const activeStep = workflowKeys.indexOf(tab);
  const [editing, setEditing] = useState(!initialData.record);
  const [preview, setPreview] = useState<StructurePreview>();
  const [impactFamily, setImpactFamily] = useState<StructurePolicyFamily>();
  const [error, setError] = useState('');
  const [serverNameError, setServerNameError] = useState('');
  const [confirmation, setConfirmation] = useState<
    'publish' | 'delete' | 'discard' | 'revision' | null
  >(null);
  const [scheduleHead, setScheduleHead] = useState<string>();
  const [addHeadId, setAddHeadId] = useState('');
  const [pendingTerm, setPendingTerm] = useState<{
    headId: string;
    term: StructureSettings['terms'][number] | null;
  }>();
  const generation = useRef(0);
  const [requestId] = useState(uuidv4);
  const locked = record?.status === FeeStructureLockStatusType.Locked;
  const [amountInputs, setAmountInputs] = useState<Record<string, string>>({});
  const pendingTermDefaults = useRef(new Set<string>());
  const dirty =
    JSON.stringify(candidate) !== baseline ||
    candidate.feeHeads.some(
      (line) =>
        !line.isVariable &&
        amountInputs[line.feeHeadId] !== undefined &&
        !!amountError(amountInputs[line.feeHeadId])
    );
  useEffect(() => {
    // Store navigation only; financial values and unsaved drafts stay in memory.
    if (record && !dirty) setStorage(progressKey, tab);
  }, [record, dirty, progressKey, tab]);
  const scope = {
    feeStructureMetadataId: initialData.feeStructureMetaDataId,
    standardId: initialData.classId,
  };
  const scheduleLine = candidate.feeHeads.find((line) => line.feeHeadId === scheduleHead);
  const { settings, context, heads, terms, catalogs, scheduleTerm, termDetail } =
    useFeeStructureLookups(scope, !record || tab === 'policies', scheduleLine, locked);
  const { isLoading, isFetching, isError, refetch } = context;
  const collectionItems = catalogs.collection.items;
  const refundItems = catalogs.refund.items;
  const impacts = useMemo(
    () =>
      families.map((family) => {
        const selected = settings?.policies.find(
          (policy) =>
            policy.family === family.key &&
            policy.id === candidate[`${family.key}PolicyId`] &&
            policy.versionId === candidate[`${family.key}PolicyVersionId`]
        );
        const raw = {
          collection: collectionItems,
          refund: refundItems,
        }[family.key]?.find(
          (policy) =>
            policy.id === candidate[`${family.key}PolicyId`] &&
            policy.currentVersionId === candidate[`${family.key}PolicyVersionId`]
        );
        const evidence = locked ? record?.publicationReview : preview;
        return {
          ...family,
          policyLabel:
            (locked ? record?.publicationReview?.policyLabels?.[family.key] : undefined) ||
            (selected
              ? `${selected.name} · v${selected.versionNumber}${selected.isDefault ? ' · Default' : ''}`
              : record?.policyLabels?.[family.key] || 'Selected policy version'),
          policyDescription: (!locked && raw?.description) || family.description,
          rows: settings
            ? policyImpactRows(family.key, candidate, settings, raw, evidence, locked)
            : undefined,
        };
      }),
    [candidate, settings, preview, locked, record, collectionItems, refundItems]
  );
  const selectedImpact = impacts.find((item) => item.key === impactFamily);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);
  const defaultsHandled = useRef(new Set<StructurePolicyFamily>());
  const patchRequest = useRef<{ fingerprint: string; id: string } | undefined>(undefined);
  const nameError = !candidate.name.trim()
    ? 'Enter a name for this Fee Structure.'
    : serverNameError;
  const touch = (field: string) => setTouched((old) => ({ ...old, [field]: true }));
  useEffect(() => {
    if (record || !settings) return;
    const defaults = families.flatMap(({ key }) => {
      if (!catalogs[key].ready || defaultsHandled.current.has(key) || !settings.permissions[key])
        return [];
      const policy = defaultPolicy(settings, key);
      if (!policy) return [];
      defaultsHandled.current.add(key);
      return [policy];
    });
    if (defaults.length)
      setCandidate((old) =>
        defaults.reduce(
          (next, policy) =>
            next[`${policy.family}PolicyId`]
              ? next
              : {
                  ...next,
                  [`${policy.family}PolicyId`]: policy.id,
                  [`${policy.family}PolicyVersionId`]: policy.versionId,
                },
          old
        )
      );
  }, [record, settings, catalogs]);
  const [saveDraft, { isLoading: saving }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useSaveStructureDraftMutation,
    popupConfig: { error: false },
  });
  const [getPreview, { isLoading: previewing }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: usePreviewStructureMutation,
    popupConfig: { error: false },
  });
  const [publish, { isLoading: publishing }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: usePublishStructureMutation,
    popupConfig: { error: false },
  });
  const [revise, { isLoading: revising }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useReviseStructureMutation,
    popupConfig: { error: false },
  });
  const [remove, { isLoading: deleting }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeleteClassWiseFeeStructureMutation,
    popupConfig: { error: false },
  });
  const busy = saving || publishing || revising || deleting;
  const navigationBusy = busy || previewing;
  const busyCallback = useRef(onBusyChange);
  busyCallback.current = onBusyChange;
  useEffect(() => {
    busyCallback.current?.(navigationBusy);
  }, [navigationBusy]);
  useEffect(() => () => busyCallback.current?.(false), []);
  useEffect(() => {
    contentRef.current?.closest<HTMLElement>('.simplebar-content-wrapper')?.scrollTo({ top: 0 });
    headingRef.current?.focus({ preventScroll: true });
  }, [tab]);
  useEffect(() => {
    if (!focusErrorPending.current) return;
    focusErrorPending.current = false;
    contentRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  }, [tab, submitted, error]);
  const publishBlockReason = dirty
    ? 'Save draft to attach your selected policies and other changes before publishing.'
    : !preview?.isReady
      ? 'Open Review & Publish and run the readiness check before publishing.'
      : '';
  const writable =
    !viewOnly &&
    editing &&
    !locked &&
    !navigationBusy &&
    !!settings?.permissions[record ? 'edit' : 'add'];
  useEffect(() => {
    if (!writable || !terms.ready || terms.error || !settings?.permissions.termsRead) return;
    const pending = new Set(pendingTermDefaults.current);
    if (!pending.size) return;
    pendingTermDefaults.current.clear();
    const term = defaultPaymentTerm(settings.terms);
    if (!term) return;
    setError('');
    setCandidate((old) => ({
      ...old,
      feeHeads: old.feeHeads.map((line) =>
        pending.has(line.feeHeadId) ? withDefaultPaymentTerm(line, term) : line
      ),
    }));
    generation.current += 1;
    setPreview(undefined);
  }, [writable, terms.ready, terms.error, settings, candidate.feeHeads]);
  const dirtyCallback = useRef(onDirtyChange);
  dirtyCallback.current = onDirtyChange;
  useEffect(() => {
    dirtyCallback.current?.(dirty);
  }, [dirty]);
  useEffect(() => () => dirtyCallback.current?.(false), []);
  useEffect(() => {
    if (initialData.record && !dirty && !busy) {
      generation.current += 1;
      setPreview(
        initialData.record.status === FeeStructureLockStatusType.Locked
          ? initialData.record.publicationReview
          : undefined
      );
      const next = structureCandidate(initialData.record);
      setAmountInputs({});
      pendingTermDefaults.current.clear();
      setRecord(initialData.record);
      setCandidate(next);
      setBaseline(JSON.stringify(next));
    }
    // Parent refetch must not overwrite an editor with unsaved changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData.record?.concurrencyStamp]);
  useEffect(() => {
    generation.current += 1;
    setPreview(undefined);
  }, [settings]);

  const change = (next: StructureCandidate) => {
    if (next.name !== candidate.name) setServerNameError('');
    generation.current += 1;
    setCandidate(next);
    setPreview(undefined);
    setError('');
  };
  const changeLine = (id: string, values: Partial<StructureLine>) =>
    change({
      ...candidate,
      feeHeads: candidate.feeHeads.map((line) =>
        line.feeHeadId === id ? { ...line, ...values } : line
      ),
    });
  const accept = (saved: StructureRecord) => {
    generation.current += 1;
    const next = structureCandidate(saved);
    setRecord(saved);
    setCandidate(next);
    setBaseline(JSON.stringify(next));
    setEditing(false);
    setSubmitted(false);
    setServerNameError('');
    setTouched({});
    setAmountInputs({});
    pendingTermDefaults.current.clear();
    patchRequest.current = undefined;
    setPreview(
      saved.status === FeeStructureLockStatusType.Locked ? saved.publicationReview : undefined
    );
    onSaved?.({
      ...initialData,
      _id: saved.id,
      name: saved.name,
      record: saved,
      status: saved.status,
    });
  };
  const review = async () => {
    if (navigationBusy) return;
    if (locked && record?.publicationReview) {
      setPreview(record.publicationReview);
      return;
    }
    if (!validateFields()) return;
    setError('');
    generation.current += 1;
    const requestGeneration = generation.current;
    try {
      const result = (await getPreview({
        ...scope,
        structureId: record?.id,
        standardFeeStructures: candidate,
      }).unwrap()) as StructurePreview;
      if (requestGeneration === generation.current) setPreview(result);
    } catch (cause) {
      if (requestGeneration === generation.current) setError(structureError(cause));
    }
  };
  const validateFields = () => {
    setSubmitted(true);
    if (
      nameError ||
      candidate.feeHeads.some(
        (line) =>
          (!line.isVariable && amountError(amountInputs[line.feeHeadId] ?? line.amount)) ||
          paymentTermError(line)
      )
    ) {
      focusErrorPending.current = true;
      setTab('heads');
      setError('Check the highlighted fields before saving or reviewing.');
      return false;
    }
    return true;
  };
  const save = async (): Promise<boolean> => {
    if (navigationBusy || !validateFields()) return false;
    setError('');
    try {
      const changes = record ? buildStructureChanges(JSON.parse(baseline), candidate) : undefined;
      if (record && !Object.keys(changes ?? {}).length) {
        setEditing(false);
        return true;
      }
      const fingerprint = JSON.stringify({ changes, stamp: candidate.concurrencyStamp });
      if (patchRequest.current?.fingerprint !== fingerprint)
        patchRequest.current = { fingerprint, id: uuidv4() };
      accept(
        await saveDraft({
          ...scope,
          requestId: record ? patchRequest.current.id : requestId,
          changes,
          structureId: record?.id,
          standardFeeStructures: candidate,
        }).unwrap()
      );
      shikshaMitraToast.success({ message: 'Draft saved. Review readiness before publishing.' });
      return true;
    } catch (cause) {
      const message = structureError(cause);
      if (message.startsWith('A Fee Structure with this name')) {
        setServerNameError(message);
        touch('name');
        setTab('heads');
      }
      setError(message);
      return false;
    }
  };
  const navigate = (step: number) => {
    if (navigationBusy || step === activeStep) return;
    if (step === 2 && !locked && !candidate.collectionPolicyVersionId) {
      setTab('policies');
      return;
    }
    setTab(workflowKeys[step]);
  };
  const saveAndNext = async () => {
    if (tab === 'policies' && !candidate.collectionPolicyVersionId) return;
    if (!(await save())) return;
    // Stay in edit mode after saving so the next stage remains usable.
    setEditing(true);
    // Saving replaces the candidate with canonical server data. Review must
    // run from the next render, rather than against the old candidate here.
    setTab(workflowKeys[Math.min(activeStep + 1, 2)]);
  };
  const confirm = async () => {
    if (navigationBusy) return;
    const action = confirmation;
    setError('');
    if (action === 'discard') {
      setServerNameError('');
      setSubmitted(false);
      setTouched({});
      setAmountInputs({});
      pendingTermDefaults.current.clear();
      const next = structureCandidate(record);
      change(next);
      setBaseline(JSON.stringify(next));
      setEditing(!record);
      setConfirmation(null);
      return;
    }
    try {
      if (action === 'delete') {
        if (record) await remove({ structureId: record.id, classId: initialData.classId }).unwrap();
        onDeleted?.();
        setConfirmation(null);
        return;
      }
      if (!record) return;
      const args = {
        structureId: record.id,
        standardId: initialData.classId,
        concurrencyStamp: record.concurrencyStamp ?? '',
      };
      if (action === 'publish') {
        if (busy || locked || !settings?.permissions.publish || publishBlockReason) {
          if (publishBlockReason) setError(publishBlockReason);
          return;
        }
        accept(await publish(args).unwrap());
        shikshaMitraToast.success({
          message: 'Fee Structure published. Its configuration is now protected.',
        });
      }
      if (action === 'revision') {
        await revise(args).unwrap();
        shikshaMitraToast.success({
          message: 'The draft revision is available below. The published version is unchanged.',
        });
      }
      setConfirmation(null);
    } catch (cause) {
      setError(structureError(cause));
    }
  };
  const reviewRef = useRef(review);
  reviewRef.current = review;
  useEffect(() => {
    if (tab === 'review') reviewRef.current();
  }, [tab]);
  const savedCandidate: StructureCandidate = JSON.parse(baseline);
  const headsValid =
    !nameError &&
    !candidate.feeHeads.some(
      (line) =>
        (!line.isVariable && amountError(amountInputs[line.feeHeadId] ?? line.amount)) ||
        paymentTermError(line)
    );
  const headsSaved =
    !!record &&
    headsValid &&
    candidate.feeHeads.length > 0 &&
    candidate.name === savedCandidate.name &&
    JSON.stringify(candidate.feeHeads) === JSON.stringify(savedCandidate.feeHeads);
  const policiesSaved =
    !!record &&
    !!candidate.collectionPolicyVersionId &&
    families.every(
      ({ key }) =>
        candidate[`${key}PolicyId`] === savedCandidate[`${key}PolicyId`] &&
        candidate[`${key}PolicyVersionId`] === savedCandidate[`${key}PolicyVersionId`]
    );
  const completedSteps = [headsSaved ? 0 : -1, policiesSaved ? 1 : -1, locked ? 2 : -1].filter(
    (step) => step >= 0
  );
  const canPublish = !viewOnly && !locked && !!record && !!settings?.permissions.publish;
  const visibleHeads = candidate.feeHeads.map((line) => ({
    ...line,
    _id: line.feeHeadId,
    feeHeadName:
      (locked ? line.feeHeadName : settings?.heads.find((h) => h.id === line.feeHeadId)?.name) ??
      line.feeHeadName ??
      'Unavailable Fee Head',
  }));
  const termOptions = [
    ...(settings?.terms.map((term) => ({
      value: term.versionId,
      label: `${term.name} · v${term.versionNumber}${term.isDefault ? ' · Default' : ''}`,
    })) ?? []),
  ];

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: 1,
        minHeight: 0,
        minWidth: 0,
        overflow: 'hidden',
        bgcolor: 'background.paper',
      }}
    >
      <Box
        sx={{
          px: { xs: 1.5, sm: 2 },
          py: 1.5,
          flexShrink: 0,
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} alignItems={{ md: 'center' }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {structureSelector || (
              <Typography variant="subtitle1" noWrap>
                {candidate.name || 'New Fee Structure'}
              </Typography>
            )}
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: 'block', mt: structureSelector ? 0.5 : 0 }}
            >
              {settings?.className || 'Class fees'} ·{' '}
              {settings?.academicYearName || 'Loading academic context'} ·{' '}
              {candidate.feeHeads.length} Fee Heads
            </Typography>
          </Box>
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{ flexWrap: 'wrap', rowGap: 1 }}
          >
            <Label color={locked ? 'success' : 'warning'}>
              {locked ? 'Published' : 'Draft'} · v{record?.revisionNumber ?? 1}
            </Label>
            {dirty && !viewOnly && <Label color="info">Unsaved</Label>}
            {viewOnly && <Label color="default">Read-only</Label>}
            <Button
              size="small"
              disabled={navigationBusy || isFetching}
              onClick={() => {
                generation.current += 1;
                setPreview(undefined);
                refetch();
              }}
              startIcon={<Iconify icon={GlobalIcons.refresh} />}
            >
              Refresh context
            </Button>
            {!viewOnly && editing && dirty && (
              <Button
                size="small"
                color="inherit"
                disabled={navigationBusy}
                onClick={() => setConfirmation('discard')}
              >
                Discard changes
              </Button>
            )}
            {!viewOnly && !locked && !editing && settings?.permissions.edit && (
              <Button
                size="small"
                variant="outlined"
                startIcon={<Iconify icon={GlobalIcons.edit} />}
                disabled={navigationBusy}
                onClick={() => setEditing(true)}
              >
                Edit draft
              </Button>
            )}
            {!viewOnly && locked && settings?.permissions.add && settings?.permissions.edit && (
              <LoadingButton
                size="small"
                variant="outlined"
                loading={revising}
                disabled={navigationBusy}
                startIcon={<Iconify icon="solar:pen-new-square-bold" />}
                onClick={() => setConfirmation('revision')}
              >
                Create revision
              </LoadingButton>
            )}
            {!viewOnly && !locked && settings?.permissions.delete && (
              <Button
                size="small"
                color="error"
                disabled={navigationBusy}
                startIcon={<Iconify icon={GlobalIcons.delete} />}
                onClick={() => setConfirmation('delete')}
              >
                Delete draft
              </Button>
            )}
          </Stack>
        </Stack>
      </Box>
      {isLoading && (
        <Stack spacing={1} sx={{ p: 2.5 }}>
          <Skeleton height={60} />
          <Skeleton height={160} />
        </Stack>
      )}
      {isError && (
        <Alert severity="error" sx={{ m: 2 }}>
          Class context could not be loaded. Refresh context to retry.
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mx: 2.5, mb: 2, whiteSpace: 'pre-line' }}>
          {error}
        </Alert>
      )}
      {!record && families.some(({ key }) => catalogs[key].error) && (
        <Alert severity="warning" sx={{ m: 2 }}>
          Some default policies could not be loaded. Open Policies to retry or choose them before
          publishing.
        </Alert>
      )}
      {settings && (
        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              minWidth: 0,
              pt: 1,
              '& form > .MuiBox-root:last-child': {
                borderTop: 1,
                borderColor: 'divider',
                p: { xs: 1.5, sm: 2 },
              },
            }}
          >
            <CustomStepperWithFormik
              activeStep={activeStep}
              steps={workflowSteps}
              initialValues={stepperValues}
              validationSchema={undefined}
              completedSteps={completedSteps}
              errors={[
                Boolean(submitted && !headsValid),
                Boolean(!locked && !candidate.collectionPolicyVersionId),
                Boolean(preview?.errors.length),
              ]}
              onStepClick={navigate}
              isStepClickable={() => !navigationBusy}
              validateFinalStep={false}
              handleBack={() => navigate(activeStep - 1)}
              handleNext={async () => {
                if (navigationBusy) return;
                if (activeStep === 2) setConfirmation('publish');
                else if (writable) await saveAndNext();
                else navigate(activeStep + 1);
              }}
              onSave={async () => {
                await save();
              }}
              showSaveButton={writable}
              saveButtonLabel="Save draft"
              nextButtonLabel={writable ? 'Save & next' : 'Next'}
              finalButtonLabel="Publish structure"
              disableSubmit={!canPublish || !!publishBlockReason}
              saveButtonProps={{
                loading: saving,
                disabled:
                  navigationBusy || (!record && families.some(({ key }) => catalogs[key].loading)),
                sx: { minHeight: { xs: 44, sm: 36 } },
              }}
              backButtonProps={{ disabled: navigationBusy, sx: { minHeight: { xs: 44, sm: 36 } } }}
              saveAndNextButtonProps={{
                loading: saving || publishing,
                disabled:
                  navigationBusy ||
                  (!locked && activeStep === 1 && !candidate.collectionPolicyVersionId) ||
                  (writable && !record && families.some(({ key }) => catalogs[key].loading)),
                sx: {
                  minHeight: { xs: 44, sm: 36 },
                  ...(activeStep === 2 && !canPublish && { display: 'none' }),
                },
              }}
              renderItem={() => (
                <Box
                  ref={contentRef}
                  sx={{
                    minWidth: 0,
                  }}
                >
                  <Box sx={{ px: { xs: 1.5, sm: 2 }, pt: 2 }}>
                    <Typography
                      ref={headingRef}
                      component="h2"
                      variant="subtitle1"
                      tabIndex={-1}
                      sx={{ outline: 'none' }}
                    >
                      {workflowSteps[activeStep]}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      {workflowDescriptions[activeStep]}
                    </Typography>
                  </Box>
                  {tab === 'heads' && (
                    <Stack spacing={2} sx={{ p: { xs: 1.5, sm: 2 } }}>
                      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                        <ShakingTextField error={Boolean((touched.name || submitted) && nameError)}>
                          <TextField
                            label="Fee Structure name *"
                            size="small"
                            fullWidth
                            disabled={!writable || !!record?.previousRevisionId}
                            value={candidate.name}
                            onChange={(e) => change({ ...candidate, name: e.target.value })}
                            inputProps={{ maxLength: 256 }}
                            onBlur={() => touch('name')}
                            error={Boolean((touched.name || submitted) && nameError)}
                            helperText={
                              (touched.name || submitted) && nameError
                                ? nameError
                                : 'Use a unique name for this class and academic year.'
                            }
                          />
                        </ShakingTextField>
                      </Stack>
                      <Typography variant="body2" color="text.secondary">
                        Fixed amounts cover the payment term. Variable fees are priced during
                        assignment.
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ p: 1.5, bgcolor: 'background.neutral', borderRadius: 1 }}
                      >
                        Fixed fees subtotal:{' '}
                        {money(
                          candidate.feeHeads
                            .filter((h) => !h.isVariable)
                            .reduce((total, h) => total + (h.amount ?? 0), 0)
                        )}
                        {' · '}
                        {candidate.feeHeads.filter((h) => h.isVariable).length} variable fee heads
                        priced during assignment. Optional fees apply only when selected for a
                        student.
                      </Typography>
                      {(!settings.permissions.headsRead || heads.isError) && (
                        <Alert
                          severity="warning"
                          action={
                            settings.permissions.headsRead ? (
                              <Button
                                size="small"
                                startIcon={<Iconify icon={GlobalIcons.refresh} />}
                                onClick={() => heads.refetch()}
                              >
                                Retry Fee Heads
                              </Button>
                            ) : undefined
                          }
                        >
                          {settings.permissions.headsRead
                            ? 'Fee Heads could not be loaded. Existing lines are preserved.'
                            : 'You do not have permission to browse Fee Heads.'}
                        </Alert>
                      )}
                      {terms.error && (
                        <Alert
                          severity="warning"
                          action={
                            <Button
                              size="small"
                              startIcon={<Iconify icon={GlobalIcons.refresh} />}
                              onClick={terms.retry}
                            >
                              Retry terms
                            </Button>
                          }
                        >
                          Payment Terms could not be loaded. Saved version pins are preserved.
                        </Alert>
                      )}
                      {writable && (
                        <Stack
                          direction={{ xs: 'column', sm: 'row' }}
                          spacing={1}
                          alignItems="flex-start"
                          sx={{ maxWidth: { sm: 640 }, width: 1 }}
                        >
                          <CustomSelect
                            label="Add Fee Head"
                            isLoading={heads.isFetching}
                            disabled={!settings.permissions.headsRead || heads.isError}
                            helperText="Choose an active Fee Head from this academic year. Each head can be added once."
                            value={addHeadId}
                            options={settings.heads.filter(
                              (h) => !candidate.feeHeads.some((l) => l.feeHeadId === h.id)
                            )}
                            labelKey="name"
                            valueKey="id"
                            onChange={(value) => setAddHeadId(String(value))}
                            isSearch
                            formControlProps={{ fullWidth: true }}
                          />
                          <Button
                            size="small"
                            variant="outlined"
                            disabled={!addHeadId}
                            startIcon={<Iconify icon={GlobalIcons.addIcon} />}
                            sx={{ whiteSpace: 'nowrap', minHeight: { xs: 44, sm: 36 } }}
                            onClick={() => {
                              const head = settings.heads.find((h) => h.id === addHeadId);
                              if (!head) return;
                              pendingTermDefaults.current.add(head.id);
                              setAmountInputs((old) => ({ ...old, [head.id]: '' }));
                              setTouched((old) => ({
                                ...old,
                                [head.id]: false,
                                [`term:${head.id}`]: false,
                              }));
                              change({
                                ...candidate,
                                feeHeads: [
                                  ...candidate.feeHeads,
                                  {
                                    feeHeadId: head.id,
                                    feeHeadName: head.name,
                                    amount: 0,
                                    isVariable: false,
                                    isOneTime: false,
                                    isOptional: false,
                                    payableMonth: 0,
                                    payableYear: 0,
                                    paymentTermId: null,
                                    paymentTermVersionId: null,
                                    scheduleMode: 'Inherited',
                                    installmentOverrides: [],
                                  },
                                ],
                              });
                              setAddHeadId('');
                            }}
                          >
                            Add head
                          </Button>
                        </Stack>
                      )}
                      <CustomizableTable
                        tableTitle="Fee heads"
                        tableId={`structure-heads-${record?.id ?? `${initialData.classId}-${index}`}`}
                        data={visibleHeads}
                        isPagination={false}
                        isSearch={false}
                        isFilter={false}
                        isShowedDense={false}
                        noDataText="Add Fee Heads to start configuring this structure."
                        columns={[
                          {
                            id: 'feeHeadName',
                            isFilter: false,
                            label: 'Fee Head',
                            sticky: true,
                            minWidth: 160,
                          },
                          {
                            id: 'isVariable',
                            label: 'Pricing',
                            minWidth: 140,
                            isSort: false,
                            isFilter: false,
                            render: (_v, row) => (
                              <FormControlLabel
                                label="Variable"
                                control={
                                  <Switch
                                    size="small"
                                    checked={!!row.isVariable}
                                    disabled={!writable}
                                    slotProps={{
                                      input: { 'aria-label': `${row.feeHeadName} variable fee` },
                                    }}
                                    onChange={(_event, checked) => {
                                      setAmountInputs((old) => {
                                        const next = { ...old };
                                        delete next[row.feeHeadId];
                                        return next;
                                      });
                                      changeLine(row.feeHeadId, {
                                        isVariable: checked,
                                        amount: null,
                                      });
                                    }}
                                  />
                                }
                              />
                            ),
                          },
                          {
                            id: 'amount',
                            label: 'Total fee',
                            align: 'right',
                            minWidth: 190,
                            isSort: false,
                            isFilter: false,
                            render: (_v, row) =>
                              row.isVariable ? (
                                <Typography variant="body2" color="text.secondary" textAlign="right">
                                  Entered during student assignment
                                </Typography>
                              ) : writable ? (
                                <TextField
                                  type="number"
                                  size="small"
                                  fullWidth
                                  required
                                  label="Total fee"
                                  value={amountInputs[row.feeHeadId] ?? row.amount ?? ''}
                                  onBlur={() => touch(row.feeHeadId)}
                                  error={Boolean(
                                    (touched[row.feeHeadId] || submitted) &&
                                    amountError(amountInputs[row.feeHeadId] ?? row.amount)
                                  )}
                                  helperText={
                                    (touched[row.feeHeadId] || submitted) &&
                                    amountError(amountInputs[row.feeHeadId] ?? row.amount)
                                      ? amountError(amountInputs[row.feeHeadId] ?? row.amount)
                                      : 'Total for the selected payment term.'
                                  }
                                  inputProps={{
                                    style: { textAlign: 'right' },
                                    min: 0,
                                    max: 9999999999.99,
                                    step: 1,
                                    'aria-label': `${row.feeHeadName} total fee`,
                                  }}
                                  onChange={(e) => {
                                    setAmountInputs((old) => ({
                                      ...old,
                                      [row.feeHeadId]: e.target.value,
                                    }));
                                    changeLine(row.feeHeadId, {
                                      amount: e.target.value === '' ? null : Number(e.target.value),
                                    });
                                  }}
                                />
                              ) : (
                                money(row.amount)
                              ),
                          },
                          {
                            id: 'paymentTermVersionId',
                            label: 'Payment Term & version',
                            minWidth: 280,
                            isSort: false,
                            isFilter: false,
                            render: (_v, row) => {
                              const termError = paymentTermError({
                                paymentTermId: row.paymentTermId,
                                paymentTermVersionId: row.paymentTermVersionId,
                              });
                              return (
                                <Stack spacing={1}>
                                  <CustomSelect
                                    label="Payment Term"
                                    isSearch
                                    required
                                    onBlur={() => touch(`term:${row.feeHeadId}`)}
                                    error={Boolean(
                                      writable &&
                                      (touched[`term:${row.feeHeadId}`] || submitted) &&
                                      termError
                                    )}
                                    isLoading={
                                      terms.loading &&
                                      !settings.terms.length &&
                                      !row.paymentTermVersionId
                                    }
                                    noOptionsMessage="No active published Payment Terms for this academic year and board."
                                    helperText={
                                      !settings.permissions.termsRead
                                        ? 'You do not have permission to browse Payment Terms.'
                                        : writable &&
                                            (touched[`term:${row.feeHeadId}`] || submitted) &&
                                            termError
                                          ? termError
                                          : !settings.terms.length &&
                                              !terms.loading &&
                                              !row.paymentTermVersionId
                                            ? 'Publish a Payment Term for this academic year and board, then retry terms.'
                                            : !row.paymentTermVersionId
                                              ? 'Required. Select an active, published Payment Term.'
                                              : 'Published version retained until changed.'
                                    }
                                    disabledValues={
                                      row.paymentTermVersionId &&
                                      !settings.terms.some(
                                        (term) => term.versionId === row.paymentTermVersionId
                                      )
                                        ? [row.paymentTermVersionId]
                                        : []
                                    }
                                    value={row.paymentTermVersionId ?? ''}
                                    options={
                                      locked && row.paymentTermVersionId
                                        ? [
                                            {
                                              value: row.paymentTermVersionId,
                                              label: `${row.paymentTermName || 'Attached term'} · v${row.paymentTermVersionNumber ?? '?'}`,
                                            },
                                          ]
                                        : termOptions.some(
                                              (x) => x.value === row.paymentTermVersionId
                                            ) || !row.paymentTermVersionId
                                          ? termOptions
                                          : [
                                              ...termOptions,
                                              {
                                                value: row.paymentTermVersionId,
                                                label: `${row.paymentTermName || 'Attached term'} · v${row.paymentTermVersionNumber ?? '?'} · unavailable for new use`,
                                              },
                                            ]
                                    }
                                    labelKey="label"
                                    valueKey="value"
                                    disabled={!writable || !settings.permissions.termsRead}
                                    onChange={(value) => {
                                      pendingTermDefaults.current.delete(row.feeHeadId);
                                      touch(`term:${row.feeHeadId}`);
                                      if (!value) {
                                        if (row.scheduleMode === 'Customized')
                                          setPendingTerm({ headId: row.feeHeadId, term: null });
                                        else
                                          changeLine(row.feeHeadId, {
                                            paymentTermId: null,
                                            paymentTermVersionId: null,
                                            scheduleMode: 'Inherited',
                                            installmentOverrides: [],
                                          });
                                        return;
                                      }
                                      const term = settings.terms.find(
                                        (x) => x.versionId === value
                                      );
                                      if (!term) return;
                                      if (row.scheduleMode === 'Customized') {
                                        setPendingTerm({ headId: row.feeHeadId, term });
                                        return;
                                      }
                                      changeLine(row.feeHeadId, {
                                        paymentTermId: term.id,
                                        paymentTermVersionId: term.versionId,
                                        paymentTermName: term.name,
                                        paymentTermVersionNumber: term.versionNumber,
                                        scheduleMode: 'Inherited',
                                        installmentOverrides: [],
                                      });
                                    }}
                                    formControlProps={{ fullWidth: true, required: true }}
                                  />
                                  <Button
                                    size="small"
                                    startIcon={<Iconify icon={GlobalIcons.eye} />}
                                    disabled={
                                      !row.paymentTermVersionId || !settings.permissions.termsRead
                                    }
                                    onClick={() => setScheduleHead(row.feeHeadId)}
                                  >
                                    {row.scheduleMode === 'Customized'
                                      ? 'View customized schedule'
                                      : 'View installment schedule'}
                                  </Button>
                                </Stack>
                              );
                            },
                          },
                          {
                            id: 'kind',
                            label: 'Charge options',
                            minWidth: 125,
                            isSort: false,
                            isFilter: false,
                            render: (_v, row) => (
                              <Stack>
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      size="small"
                                      disabled={!writable}
                                      checked={row.isOptional}
                                      onChange={(_e, checked) =>
                                        changeLine(row.feeHeadId, { isOptional: checked })
                                      }
                                    />
                                  }
                                  label="Optional"
                                />
                              </Stack>
                            ),
                          },
                          {
                            id: 'actions',
                            label: 'Actions',
                            minWidth: 70,
                            sticky: true,
                            stickyPosition: 'right',
                            isSort: false,
                            isFilter: false,
                            render: (_v, row) =>
                              writable && (
                                <AdaptiveThreeDotsActions
                                  actions={[
                                    {
                                      id: 'delete',
                                      label: 'Delete',
                                      icon: 'solar:trash-bin-trash-bold',
                                      onClick: () => {
                                        pendingTermDefaults.current.delete(row.feeHeadId);
                                        setAmountInputs((old) => {
                                          const next = { ...old };
                                          delete next[row.feeHeadId];
                                          return next;
                                        });
                                        change({
                                          ...candidate,
                                          feeHeads: candidate.feeHeads.filter(
                                            (x) => x.feeHeadId !== row.feeHeadId
                                          ),
                                        });
                                      },
                                      color: 'error.main',
                                    },
                                  ]}
                                />
                              ),
                          },
                        ]}
                      />
                    </Stack>
                  )}
                  {tab === 'policies' && (
                    <Stack spacing={2} sx={{ p: { xs: 1.5, sm: 2 }, width: '100%' }}>
                      <Typography variant="body2" color="text.secondary">
                        Collection is required to publish. Refund is optional. Use the eye action to
                        review fee head coverage.
                      </Typography>
                      <Box
                        sx={{
                          display: 'grid',
                          gridTemplateColumns: {
                            xs: 'minmax(0, 1fr)',
                            md: 'repeat(2, minmax(0, 1fr))',
                          },
                          alignItems: 'stretch',
                          gap: 2,
                        }}
                      >
                        {impacts.map(({ key, label, description, empty, rows }) => {
                          const versionKey = `${key}PolicyVersionId` as const;
                          const idKey = `${key}PolicyId` as const;
                          const options = settings.policies
                            .filter((p) => p.family === key)
                            .map((p) => ({
                              value: p.versionId,
                              label: `${p.name} · v${p.versionNumber}${p.isDefault ? ' · Default' : ''}`,
                            }));
                          const frozenLabel = record?.publicationReview?.policyLabels?.[key];
                          if (locked && frozenLabel && candidate[versionKey]) {
                            options.length = 0;
                            options.push({ value: candidate[versionKey]!, label: frozenLabel });
                          }
                          if (
                            candidate[versionKey] &&
                            !options.some((p) => p.value === candidate[versionKey])
                          )
                            options.push({
                              value: candidate[versionKey]!,
                              label: `${record?.policyLabels?.[key] ?? 'Attached version'} · retained`,
                            });
                          return (
                            <Stack
                              key={key}
                              spacing={1.5}
                              component="section"
                              aria-label={label}
                              sx={{
                                p: 2,
                                minWidth: 0,
                                bgcolor: 'background.paper',
                                border: 1,
                                borderColor: 'divider',
                                borderRadius: 1.5,
                                '& .MuiChip-root': { maxWidth: '100%' },
                                '& .MuiSelect-select': { minWidth: 0 },
                              }}
                            >
                              <Stack
                                direction="row"
                                alignItems="center"
                                justifyContent="space-between"
                                spacing={1}
                              >
                                <Typography component="h3" variant="subtitle2">
                                  {label}
                                  <Typography
                                    component="span"
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{ display: 'block', mt: 0.5 }}
                                  >
                                    {key === 'collection' ? 'Required to publish' : 'Optional'}
                                  </Typography>
                                </Typography>
                                <CustomTooltip
                                  title={
                                    candidate[versionKey]
                                      ? 'View fee head impact'
                                      : 'Select a policy to view its fee head impact'
                                  }
                                >
                                  <span>
                                    <IconButton
                                      aria-label={`View ${label} fee head impact`}
                                      disabled={!candidate[versionKey]}
                                      onClick={() => setImpactFamily(key)}
                                      sx={{
                                        minWidth: 44,
                                        minHeight: 44,
                                        color: 'text.secondary',
                                        '&.Mui-focusVisible': {
                                          outline: '2px solid',
                                          outlineColor: 'primary.main',
                                          outlineOffset: 2,
                                        },
                                      }}
                                    >
                                      <Iconify icon="mdi:eye-outline" width={20} />
                                    </IconButton>
                                  </span>
                                </CustomTooltip>
                              </Stack>
                              <Typography variant="body2" color="text.secondary">
                                {description}
                              </Typography>
                              <CustomSelect
                                label={label}
                                value={candidate[versionKey] ?? ''}
                                options={options}
                                isSearch
                                isLoading={catalogs[key].loading}
                                error={
                                  catalogs[key].error ||
                                  (key === 'collection' && !locked && !candidate[versionKey])
                                }
                                helperText={
                                  key === 'collection' && !locked && !candidate[versionKey]
                                    ? 'Collection Policy is required'
                                    : catalogs[key].error
                                      ? 'Could not load this policy list. Retry to choose a policy.'
                                      : !settings.permissions[`${key}Read`]
                                        ? 'You do not have permission to browse this policy family.'
                                        : candidate[versionKey]
                                          ? 'This version stays attached until you change it.'
                                          : settings.policies.filter(
                                                (p) => p.family === key && p.isDefault
                                              ).length > 1
                                            ? 'Multiple default policies exist. Choose one explicitly and correct defaults in Settings.'
                                            : empty
                                }
                                disabledValues={
                                  candidate[versionKey] &&
                                  !settings.policies.some(
                                    (p) => p.family === key && p.versionId === candidate[versionKey]
                                  )
                                    ? [candidate[versionKey]!]
                                    : []
                                }
                                labelKey="label"
                                valueKey="value"
                                disabled={
                                  !writable ||
                                  !settings.permissions[key] ||
                                  !settings.permissions[`${key}Read`] ||
                                  catalogs[key].error
                                }
                                onChange={(value) => {
                                  defaultsHandled.current.add(key);
                                  const policy = settings.policies.find(
                                    (p) => p.versionId === value && p.family === key
                                  );
                                  change({
                                    ...candidate,
                                    [idKey]: policy?.id ?? null,
                                    [versionKey]: policy?.versionId ?? null,
                                  });
                                }}
                                formControlProps={{ fullWidth: true }}
                              />
                              {candidate[versionKey] && (
                                <Typography variant="caption" color="text.secondary">
                                  {rows
                                    ? `${rows.length} fee head${rows.length === 1 ? '' : 's'} · View coverage and exclusions`
                                    : catalogs[key].loading
                                      ? 'Loading fee head impact…'
                                      : 'View impact for available details'}
                                </Typography>
                              )}
                              <Stack
                                direction="row"
                                justifyContent="space-between"
                                sx={{ mt: 'auto !important', pt: 1 }}
                              >
                                <Button
                                  size="small"
                                  startIcon={<Iconify icon={GlobalIcons.refresh} />}
                                  disabled={
                                    navigationBusy ||
                                    !settings.permissions[`${key}Read`] ||
                                    catalogs[key].loading
                                  }
                                  onClick={catalogs[key].retry}
                                >
                                  {catalogs[key].error ? 'Retry' : 'Refresh list'}
                                </Button>
                                {!viewOnly && candidate[versionKey] && (
                                  <Button
                                    size="small"
                                    startIcon={<Iconify icon={GlobalIcons.cancel} />}
                                    disabled={!writable || !settings.permissions[key]}
                                    onClick={() => {
                                      defaultsHandled.current.add(key);
                                      change({
                                        ...candidate,
                                        [idKey]: null,
                                        [versionKey]: null,
                                      });
                                    }}
                                  >
                                    Clear selection
                                  </Button>
                                )}
                              </Stack>
                            </Stack>
                          );
                        })}
                      </Box>
                    </Stack>
                  )}
                  {tab === 'review' && (
                    <Stack spacing={2} sx={{ p: { xs: 1.5, sm: 2 } }}>
                      <Box
                        component="section"
                        aria-label="Selected policies"
                        sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 2 }}
                      >
                        <Stack
                          direction="row"
                          alignItems="center"
                          justifyContent="space-between"
                          sx={{ mb: 1 }}
                        >
                          <Typography variant="subtitle2">Selected policies</Typography>
                          <Button
                            size="small"
                            disabled={navigationBusy}
                            onClick={() => navigate(1)}
                          >
                            {writable ? 'Edit policies' : 'View policies'}
                          </Button>
                        </Stack>
                        <Box
                          component="dl"
                          sx={{
                            m: 0,
                            display: 'grid',
                            gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, minmax(0, 1fr))' },
                            gap: 2,
                          }}
                        >
                          {impacts.map((impact) => (
                            <Box key={impact.key}>
                              <Typography component="dt" variant="caption" color="text.secondary">
                                {impact.label}
                              </Typography>
                              <Typography
                                component="dd"
                                variant="body2"
                                sx={{ m: 0, mt: 0.5, overflowWrap: 'anywhere' }}
                              >
                                {candidate[`${impact.key}PolicyVersionId`]
                                  ? impact.policyLabel
                                  : impact.empty}
                              </Typography>
                            </Box>
                          ))}
                        </Box>
                      </Box>
                      {locked && (
                        <Alert severity={record?.publicationReview ? 'info' : 'warning'}>
                          {record?.publicationReview
                            ? 'This is the saved publication review. Later settings changes do not alter it.'
                            : 'This legacy structure has no saved publication review. The checks below describe current settings and do not reconstruct historical calculations.'}
                        </Alert>
                      )}
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="subtitle1" sx={{ flex: 1 }}>
                          {locked ? 'Publication checks' : 'Configuration readiness'}
                        </Typography>
                        <LoadingButton
                          size="small"
                          startIcon={<Iconify icon={GlobalIcons.refresh} />}
                          loading={previewing}
                          disabled={navigationBusy}
                          onClick={review}
                        >
                          {locked ? 'View publication checks' : 'Recheck configuration'}
                        </LoadingButton>
                      </Stack>
                      {previewing && (
                        <Alert severity="info" role="status">
                          <Stack direction="row" spacing={1} alignItems="center">
                            <CircularProgress size={18} aria-label="Checking configuration" />
                            <span>Checking policy coverage, settings and installment schedules…</span>
                          </Stack>
                        </Alert>
                      )}
                      {!preview && !previewing && (
                        <Alert severity="info">
                          Check the current configuration to see readiness and coverage.
                        </Alert>
                      )}
                      {preview && (
                        <>
                          <Alert
                            severity={
                              preview.isReady
                                ? preview.warnings.length
                                  ? 'warning'
                                  : 'success'
                                : 'error'
                            }
                          >
                            {locked && record?.publicationReview
                              ? 'Configuration checks saved at publication.'
                              : preview.isReady
                                ? preview.warnings.length
                                  ? 'Ready to publish — review warnings below.'
                                  : 'All configuration checks passed.'
                                : `${preview.errors.length} item(s) need attention before publication.`}
                          </Alert>
                          {!!preview.errors.length && (
                            <Alert severity="error">
                              <Typography variant="subtitle2">Resolve before publishing</Typography>
                              <Box component="ul" sx={{ pl: 2.5, my: 0.5 }}>
                                {preview.errors.map((message, i) => (
                                  <li key={i}>{message}</li>
                                ))}
                              </Box>
                            </Alert>
                          )}
                          {!!preview.warnings.length && (
                            <Alert severity="warning">
                              <Typography variant="subtitle2">Review these warnings</Typography>
                              <Box component="ul" sx={{ pl: 2.5, my: 0.5 }}>
                                {preview.warnings.map((message, i) => (
                                  <li key={i}>{message}</li>
                                ))}
                              </Box>
                            </Alert>
                          )}
                          <Stack direction="row" alignItems="center" justifyContent="space-between">
                            <Typography variant="subtitle2">Policy coverage</Typography>
                            <Button
                              size="small"
                              disabled={navigationBusy}
                              onClick={() => navigate(1)}
                            >
                              {writable ? 'Edit policies' : 'View policies'}
                            </Button>
                          </Stack>
                          <CustomizableTable
                            tableTitle="Policy coverage"
                            tableId="structure-policy-coverage"
                            data={preview.coverage.map((x) => ({ ...x, _id: x.feeHeadId }))}
                            isPagination={false}
                            isFilter={false}
                            isSearch={false}
                            isShowedDense={false}
                            columns={[
                              { id: 'name', label: 'Fee Head', sticky: true, minWidth: 150 },
                              ...['collection', 'refund', 'accounting'].map((key) => ({
                                id: key,
                                label: key.charAt(0).toUpperCase() + key.slice(1),
                                minWidth: 150,
                              })),
                            ]}
                          />
                          <Stack direction="row" alignItems="center" justifyContent="space-between">
                            <Typography variant="subtitle2">Installment schedule</Typography>
                            <Button
                              size="small"
                              disabled={navigationBusy}
                              onClick={() => navigate(0)}
                            >
                              {writable ? 'Edit fee heads & terms' : 'View fee heads & terms'}
                            </Button>
                          </Stack>
                          <CustomizableTable
                            tableTitle="Installment schedule"
                            tableId="structure-resolved-installments"
                            data={preview.schedules.flatMap((schedule) =>
                              schedule.installments.map((line) => ({
                                ...line,
                                _id: `${schedule.feeHeadId}-${line.sequence}`,
                                feeHeadName: schedule.feeHeadName,
                                term: `${schedule.paymentTermName} v${schedule.versionNumber}`,
                              }))
                            )}
                            isPagination={false}
                            isFilter={false}
                            isSearch={false}
                            isShowedDense={false}
                            columns={[
                              {
                                id: 'feeHeadName',
                                isFilter: false,
                                label: 'Fee Head',
                                sticky: true,
                                minWidth: 140,
                              },
                              { id: 'term', label: 'Term version', minWidth: 150 },
                              { id: 'name', label: 'Installment', minWidth: 140 },
                              {
                                id: 'coverageStartDate',
                                label: 'Service coverage',
                                minWidth: 210,
                                render: (_v, row) =>
                                  `${dayjs(row.coverageStartDate).format('DD MMM YYYY')} – ${dayjs(row.coverageEndDate).format('DD MMM YYYY')}`,
                              },
                              {
                                id: 'demandDate',
                                label: 'Demand date',
                                minWidth: 130,
                                render: (v) => dayjs(v).format('DD-MM-YYYY'),
                              },
                              {
                                id: 'dueDate',
                                label: 'Due date',
                                minWidth: 130,
                                render: (v) => dayjs(v).format('DD-MM-YYYY'),
                              },
                              {
                                id: 'calculatedAmount',
                                label: 'Amount',
                                minWidth: 130,
                                render: (_v, row) =>
                                  money(
                                    row.calculatedAmount == null
                                      ? null
                                      : Number(row.calculatedAmount)
                                  ),
                              },
                            ]}
                          />
                        </>
                      )}
                      {record && (
                        <Typography variant="caption" color="text.secondary">
                          Version {record.revisionNumber} · Created{' '}
                          {dayjs(record.creationTime).format('DD-MM-YYYY HH:mm')}
                          {record.previousRevisionId
                            ? ' · Revised from an earlier published structure'
                            : ''}
                        </Typography>
                      )}
                      <Typography variant="caption" color="text.secondary">
                        This preview describes structure settings. Student eligibility and
                        transactions are calculated in their own workflows.
                      </Typography>
                    </Stack>
                  )}
                </Box>
              )}
            />
          </Box>
          <Typography
            variant="caption"
            color="text.secondary"
            aria-live="polite"
            sx={{ px: 2, pb: 1, flexShrink: 0 }}
          >
            {activeStep === 2 &&
            !locked &&
            !viewOnly &&
            settings.permissions.publish &&
            publishBlockReason
              ? publishBlockReason
              : locked
                ? 'Published configuration · changes require a revision'
                : dirty
                  ? 'Unsaved changes'
                  : record
                    ? 'All changes saved'
                    : 'Draft not saved yet'}
          </Typography>
        </Box>
      )}
      {selectedImpact && settings && (
        <PolicyImpactDialog
          title={selectedImpact.label}
          policyLabel={selectedImpact.policyLabel}
          description={selectedImpact.policyDescription}
          summary={selectedImpact.description}
          rows={selectedImpact.rows}
          loading={catalogs[selectedImpact.key].loading || heads.isFetching}
          error={catalogs[selectedImpact.key].error || heads.isError}
          canRead={!!settings.permissions[`${selectedImpact.key}Read`]}
          saved={!!locked && !!record?.publicationReview}
          onClose={() => setImpactFamily(undefined)}
        />
      )}
      <ConfirmDialog
        open={!!confirmation}
        onClose={() => {
          if (!navigationBusy) setConfirmation(null);
        }}
        disableCancel={navigationBusy}
        disableEscapeKeyDown={navigationBusy}
        disableBackdropClick
        icon={confirmation === 'delete' || confirmation === 'discard' ? 'error' : 'info'}
        title={
          confirmation === 'publish'
            ? 'Publish Fee Structure'
            : confirmation === 'revision'
              ? 'Create draft revision'
              : confirmation === 'delete'
                ? 'Delete unused draft'
                : 'Discard unsaved changes'
        }
        content={
          <Stack spacing={1}>
            <Typography variant="body2">
              {confirmation === 'publish'
                ? 'The reviewed policy versions, Fee Heads and Payment Terms will be protected. Future changes require a new revision. Publication creates no student demands.'
                : confirmation === 'revision'
                  ? 'Copy this published configuration into a draft revision. Existing structures and financial records remain unchanged.'
                  : confirmation === 'delete'
                    ? 'Delete this unused draft? Published structures cannot be deleted.'
                    : 'Restore the last saved configuration?'}
            </Typography>
            {error && <Alert severity="error">{error}</Alert>}
          </Stack>
        }
        action={
          <LoadingButton
            size="small"
            variant="contained"
            loading={busy}
            disabled={navigationBusy}
            color={confirmation === 'delete' || confirmation === 'discard' ? 'error' : 'primary'}
            startIcon={
              <Iconify
                icon={
                  confirmation === 'delete'
                    ? GlobalIcons.delete
                    : confirmation === 'publish'
                      ? GlobalIcons.publish
                      : confirmation === 'revision'
                        ? 'solar:pen-new-square-bold'
                        : GlobalIcons.submit
                }
              />
            }
            onClick={confirm}
          >
            {confirmation === 'publish'
              ? 'Publish structure'
              : confirmation === 'revision'
                ? 'Create revision'
                : confirmation === 'delete'
                  ? 'Delete draft'
                  : 'Discard changes'}
          </LoadingButton>
        }
      />
      <ConfirmDialog
        open={!!pendingTerm}
        onClose={() => setPendingTerm(undefined)}
        title="Replace customized schedule?"
        content={
          pendingTerm?.term
            ? `Selecting ${pendingTerm.term.name} v${pendingTerm.term.versionNumber} will replace this head's custom schedule with the published term schedule. Review its dates and total fee before saving.`
            : 'Remove this Payment Term and its customized schedule? A published term must be selected again before saving this structure.'
        }
        action={
          <Button
            size="small"
            variant="contained"
            startIcon={<Iconify icon={GlobalIcons.refresh} />}
            onClick={() => {
              if (!pendingTerm) return;
              const { headId, term } = pendingTerm;
              changeLine(headId, {
                paymentTermId: term?.id ?? null,
                paymentTermVersionId: term?.versionId ?? null,
                paymentTermName: term?.name,
                paymentTermVersionNumber: term?.versionNumber,
                scheduleMode: 'Inherited',
                installmentOverrides: [],
              });
              setPendingTerm(undefined);
            }}
          >
            Replace schedule
          </Button>
        }
      />
      {scheduleLine && !scheduleTerm && (
        <Alert
          severity={termDetail.isError || !termDetail.isFetching ? 'warning' : 'info'}
          sx={{ m: 2 }}
          action={
            <Button
              size="small"
              startIcon={<Iconify icon={GlobalIcons.cancel} />}
              onClick={() => setScheduleHead(undefined)}
            >
              Close
            </Button>
          }
        >
          {termDetail.isFetching
            ? 'Loading the selected Payment Term version�'
            : 'This term version could not be loaded. Close and reopen the schedule to retry. Its saved configuration has not changed.'}
        </Alert>
      )}
      {scheduleLine && scheduleTerm && (
        <StructureScheduleDialog
          key={`${scheduleLine.feeHeadId}-${scheduleTerm.versionId}`}
          line={scheduleLine}
          term={scheduleTerm}
          readOnly={!writable}
          onClose={() => setScheduleHead(undefined)}
          onSave={(rows, customized) => {
            changeLine(scheduleLine.feeHeadId, {
              scheduleMode: customized ? 'Customized' : 'Inherited',
              installmentOverrides: rows,
            });
            setScheduleHead(undefined);
          }}
        />
      )}
    </Box>
  );
}
