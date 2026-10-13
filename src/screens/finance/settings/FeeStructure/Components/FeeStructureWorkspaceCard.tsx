'use client';

import type {
  StructureLine,
  StructureRecord,
  StructurePreview,
  StructureSettings,
  StructureCandidate,
} from 'src/redux/finance/feeStructureWorkspace';

import { getIn } from 'formik';
import { LoadingButton } from '@mui/lab';
import { uuidv4 } from 'src/utils/uuidv4';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { shikshaMitraToast } from 'src/components/toast';
import { useRef, useMemo, useState, useEffect } from 'react';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { getStorage, setStorage } from 'src/hooks/use-local-storage';
import { CustomStepperWithFormik } from 'src/components/custom-stepper';
import { Box, Stack, Alert, Button, Skeleton, Typography } from '@mui/material';
import AdaptiveThreeDotsActions from 'src/components/adaptive-three-dots-actions';
import { FeeStructureLockStatusType } from 'src/enums/finance-fee-structure-status';
import { useDeleteClassWiseFeeStructureMutation } from 'src/redux/finance/financeFeeStructure';
import {
  useReviseStructureMutation,
  usePreviewStructureMutation,
  usePublishStructureMutation,
  useSaveStructureDraftMutation,
} from 'src/redux/finance/feeStructureWorkspace';

import PolicyImpactDialog from './PolicyImpactDialog';
import { policyImpactRows } from '../policyImpactModel';
import FeeStructureHeadsStep from './FeeStructureHeadsStep';
import FeeStructureReviewStep from './FeeStructureReviewStep';
import StructureScheduleDialog from './StructureScheduleDialog';
import FeeStructurePoliciesStep from './FeeStructurePoliciesStep';
import useFeeStructureLookups from '../hooks/useFeeStructureLookups';
import useFeeStructureWorkspaceForm from '../hooks/useFeeStructureWorkspaceForm';
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
  onNameChange?: (name: string) => void;
}
const workflowSteps = ['Fee heads & terms', 'Policies', 'Review & publish'];
const workflowKeys = ['heads', 'policies', 'review'];
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

export default function FeeStructureWorkspaceCard({
  initialData,
  index,
  viewOnly = false,
  onSaved,
  onDeleted,
  onDirtyChange,
  onBusyChange,
  onNameChange,
}: Props) {
  const contentRef = useRef<HTMLDivElement>(null);
  const focusErrorPending = useRef(false);
  const [record, setRecord] = useState<StructureRecord | undefined>(initialData.record);
  const [amountInputs, setAmountInputs] = useState<Record<string, string>>({});
  const { formik, validationSchema } = useFeeStructureWorkspaceForm(
    initialData.record,
    amountInputs
  );
  const candidate = formik.values;
  const nameCallback = useRef(onNameChange);
  nameCallback.current = onNameChange;
  useEffect(() => {
    nameCallback.current?.(candidate.name);
  }, [candidate.name]);
  const setCandidate = formik.setValues;
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
  const [pendingTerm, setPendingTerm] = useState<{
    headId: string;
    term: StructureSettings['terms'][number] | null;
  }>();
  const generation = useRef(0);
  const [requestId] = useState(uuidv4);
  const locked = record?.status === FeeStructureLockStatusType.Locked;
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
            (locked
              ? record?.publicationReview?.policyLabels?.[family.key] ||
                record?.policyLabels?.[family.key]
              : undefined) ||
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
  const touched: Record<string, boolean> = Object.fromEntries([
    ['name', !!formik.touched.name],
    ...candidate.feeHeads.flatMap((line, position) => [
      [line.feeHeadId, !!getIn(formik.touched, `feeHeads.${position}.amount`)],
      [
        `term:${line.feeHeadId}`,
        !!getIn(formik.touched, `feeHeads.${position}.paymentTermVersionId`),
      ],
    ]),
  ]);
  const [submitted, setSubmitted] = useState(false);
  const defaultsHandled = useRef(new Set<StructurePolicyFamily>());
  const patchRequest = useRef<{ fingerprint: string; id: string } | undefined>(undefined);
  const nameError = !candidate.name.trim()
    ? 'Enter a name for this Fee Structure.'
    : serverNameError;
  const touch = (field: string) => {
    const term = field.startsWith('term:');
    const position = candidate.feeHeads.findIndex(
      (line) => line.feeHeadId === (term ? field.slice(5) : field)
    );
    formik.setFieldTouched(
      field === 'name'
        ? 'name'
        : `feeHeads.${position}.${term ? 'paymentTermVersionId' : 'amount'}`,
      true,
      false
    );
  };
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
  }, [record, settings, catalogs, setCandidate]);
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
    contentRef.current?.focus({ preventScroll: true });
  }, [tab]);
  useEffect(() => {
    if (!focusErrorPending.current) return;
    focusErrorPending.current = false;
    contentRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  }, [tab, submitted, error]);
  const publishBlockReason = dirty
    ? 'Save draft before publishing.'
    : preview?.errors.length
      ? `Resolve ${preview.errors.length} issue${preview.errors.length === 1 ? '' : 's'} before publishing.`
      : !preview?.isReady
        ? 'Run the readiness check before publishing.'
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
  }, [writable, terms.ready, terms.error, settings, candidate.feeHeads, setCandidate]);
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
    formik.setTouched({});
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
      formik.setTouched({});
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
          message: 'Draft revision created. Select it from the structures list.',
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
          <Stack
            direction="row"
            spacing={1}
            useFlexGap
            flexWrap="wrap"
            alignItems="center"
            sx={{ flex: 1, minWidth: 0 }}
          >
            <Typography variant="subtitle1" sx={{ overflowWrap: 'anywhere' }}>
              {candidate.name || 'New fee structure'}
            </Typography>
            <Label color={locked ? 'success' : 'warning'}>{locked ? 'Published' : 'Draft'}</Label>
            <Typography variant="caption" color="text.secondary">
              v{record?.revisionNumber ?? 1}
            </Typography>
            {viewOnly && <Label color="default">Read-only</Label>}
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              useFlexGap
              flexWrap="wrap"
              sx={{ ml: 'auto' }}
            >
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
                  startIcon={<Iconify icon="mdi:file-document-edit-outline" />}
                  onClick={() => setConfirmation('revision')}
                >
                  Create revision
                </LoadingButton>
              )}
              <AdaptiveThreeDotsActions
                moreLabel="More structure actions"
                directActionLimit={0}
                actions={[
                  {
                    id: 'refresh',
                    label: 'Refresh Context',
                    icon: 'mdi:refresh',
                    disabled: navigationBusy || isFetching,
                    onClick: () => {
                      generation.current += 1;
                      setPreview(undefined);
                      refetch();
                    },
                  },
                  ...(!viewOnly && editing && dirty
                    ? [
                        {
                          id: 'discard',
                          label: 'Discard Changes',
                          icon: 'mdi:undo',
                          disabled: navigationBusy,
                          onClick: () => setConfirmation('discard'),
                        },
                      ]
                    : []),
                  ...(!viewOnly && !locked && settings?.permissions.delete
                    ? [
                        {
                          id: 'delete',
                          label: 'Delete Draft',
                          icon: 'mdi:delete-outline',
                          color: 'error.main',
                          disabled: navigationBusy,
                          onClick: () => setConfirmation('delete'),
                        },
                      ]
                    : []),
                ]}
              />
            </Stack>
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
      {!record && tab !== 'policies' && families.some(({ key }) => catalogs[key].error) && (
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
              initialValues={formik.initialValues}
              formikInstance={formik}
              validationSchema={validationSchema}
              completedSteps={completedSteps}
              errors={[
                Boolean((submitted || Object.keys(formik.errors).length > 0) && !headsValid),
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
              nextButtonLabel={writable ? 'Save & Continue' : 'Next'}
              finalButtonLabel="Publish structure"
              disableSubmit={!canPublish || !!publishBlockReason}
              saveButtonProps={{
                loading: saving,
                disabled:
                  navigationBusy || (!record && families.some(({ key }) => catalogs[key].loading)),
              }}
              backButtonProps={{ disabled: navigationBusy }}
              saveAndNextButtonProps={{
                loading: saving || publishing,
                disabled:
                  navigationBusy ||
                  (!locked && activeStep === 1 && !candidate.collectionPolicyVersionId) ||
                  (writable && !record && families.some(({ key }) => catalogs[key].loading)),
                sx: {
                  ...(activeStep === 2 && !canPublish && { display: 'none' }),
                },
              }}
              renderItem={() => (
                <Box
                  ref={contentRef}
                  role="region"
                  tabIndex={-1}
                  aria-label={workflowSteps[activeStep]}
                  sx={{ minWidth: 0, p: { xs: 1.5, sm: 2 }, outline: 'none' }}
                >
                  {tab === 'heads' && (
                    <FeeStructureHeadsStep
                      formik={formik}
                      settings={settings}
                      tableId={`structure-heads-${record?.id ?? `${initialData.classId}-${index}`}`}
                      writable={writable}
                      busy={navigationBusy}
                      locked={!!locked}
                      revision={!!record?.previousRevisionId}
                      submitted={submitted || Object.keys(formik.errors).length > 0}
                      nameError={nameError}
                      amountInputs={amountInputs}
                      touched={touched}
                      headsLoading={heads.isFetching}
                      headsError={heads.isError}
                      termsLoading={terms.loading}
                      termsError={terms.error}
                      onRetryHeads={() => heads.refetch()}
                      onRetryTerms={terms.retry}
                      onTouch={touch}
                      onChange={change}
                      onAdd={(id) => {
                        const head = settings.heads.find((item) => item.id === id);
                        if (!head || candidate.feeHeads.some((line) => line.feeHeadId === id))
                          return;
                        pendingTermDefaults.current.add(head.id);
                        setAmountInputs((previous) => ({ ...previous, [head.id]: '' }));
                        change({
                          ...candidate,
                          feeHeads: [
                            ...candidate.feeHeads,
                            {
                              feeHeadId: head.id,
                              feeHeadName: head.name,
                              categoryName: head.categoryName,
                              amount: null,
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
                      }}
                      onRemove={(id) => {
                        pendingTermDefaults.current.delete(id);
                        setAmountInputs((previous) => {
                          const next = { ...previous };
                          delete next[id];
                          return next;
                        });
                        change({
                          ...candidate,
                          feeHeads: candidate.feeHeads.filter((line) => line.feeHeadId !== id),
                        });
                      }}
                      onVariable={(id, variable) => {
                        setAmountInputs((previous) => {
                          const next = { ...previous };
                          delete next[id];
                          return next;
                        });
                        changeLine(id, { isVariable: variable, amount: null });
                      }}
                      onAmount={(id, raw, amount) => {
                        setAmountInputs((previous) => ({ ...previous, [id]: raw }));
                        changeLine(id, { amount });
                      }}
                      onLineChange={changeLine}
                      onTerm={(line, term) => {
                        pendingTermDefaults.current.delete(line.feeHeadId);
                        touch(`term:${line.feeHeadId}`);
                        if (line.scheduleMode === 'Customized') {
                          setPendingTerm({ headId: line.feeHeadId, term });
                          return;
                        }
                        changeLine(line.feeHeadId, {
                          paymentTermId: term?.id ?? null,
                          paymentTermVersionId: term?.versionId ?? null,
                          paymentTermName: term?.name,
                          paymentTermVersionNumber: term?.versionNumber,
                          scheduleMode: 'Inherited',
                          installmentOverrides: [],
                        });
                      }}
                      onSchedule={setScheduleHead}
                    />
                  )}
                  {tab === 'policies' && (
                    <FeeStructurePoliciesStep
                      candidate={candidate}
                      settings={settings}
                      impacts={impacts}
                      catalogs={catalogs}
                      writable={writable}
                      locked={!!locked}
                      busy={navigationBusy}
                      onChange={(key, version) => {
                        defaultsHandled.current.add(key);
                        const policy = settings.policies.find(
                          (item) => item.family === key && item.versionId === version
                        );
                        change({
                          ...candidate,
                          [`${key}PolicyId`]: policy?.id ?? null,
                          [`${key}PolicyVersionId`]: policy?.versionId ?? null,
                        });
                      }}
                      onView={setImpactFamily}
                    />
                  )}
                  {tab === 'review' && (
                    <FeeStructureReviewStep
                      candidate={candidate}
                      record={record}
                      preview={preview}
                      impacts={impacts}
                      writable={writable}
                      locked={!!locked}
                      busy={navigationBusy}
                      previewing={previewing}
                      tableId={`structure-review-${record?.id ?? `${initialData.classId}-${index}`}`}
                      onReview={review}
                      onNavigate={navigate}
                      onRemoveRefund={
                        writable && settings.permissions.refund && candidate.refundPolicyVersionId
                          ? () => {
                              defaultsHandled.current.add('refund');
                              change({
                                ...candidate,
                                refundPolicyId: null,
                                refundPolicyVersionId: null,
                              });
                              setTab('policies');
                            }
                          : undefined
                      }
                    />
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
            color={confirmation === 'delete' || confirmation === 'discard' ? 'error' : 'inherit'}
            startIcon={
              <Iconify
                icon={
                  confirmation === 'delete'
                    ? GlobalIcons.delete
                    : confirmation === 'publish'
                      ? GlobalIcons.publish
                      : confirmation === 'revision'
                        ? 'mdi:file-document-edit-outline'
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
