'use client';

import type { AdmissionPipelineItem } from 'src/redux/student/admissions/admission-pipeline-api';
import type {
  AdmissionApplicationCounsellor,
  AssignAdmissionApplicationCounsellorInput,
} from 'src/redux/student/admissions/admission-applications-api';

import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { useRef, useMemo, useState, useEffect, useCallback } from 'react';
import {
  admissionApplicationsApi,
  useLazyGetAdmissionApplicationQuery,
  useAssignAdmissionApplicationCounsellorMutation,
} from 'src/redux/student/admissions/admission-applications-api';

import { PIPELINE_ACTIVE_STATUSES } from './admission-pipeline-state';
import {
  intersectPipelineCounsellors,
  isPipelineApplicationAssignable,
} from './bulk-pipeline-counsellor-model';

import type {
  BulkPipelineAssignmentFailure,
  BulkPipelineAssignmentOutcome,
} from './bulk-pipeline-counsellor-model';

type Options = {
  rows: AdmissionPipelineItem[];
  /** Tenant, user, academic context, filters, search, sort, page and page size. */
  scopeKey: string;
  /** Applications.View and Applications.Add, without inferred grants. */
  canAssign: boolean;
  disabled: boolean;
};
type Operation = { cancelled: boolean; abortRead: (() => void) | null };
type AssignmentInput = Pick<AssignAdmissionApplicationCounsellorInput, 'counsellorId' | 'reason'>;

const errorMessage = (error: unknown, fallback: string) =>
  error instanceof Error && !('data' in error || 'status' in error)
    ? error.message
    : parseApiProblemDetail(error).detail || fallback;

/** Page-sized batches reuse the individual command, including its scope and concurrency checks. */
export function useBulkPipelineCounsellor({ rows, scopeKey, canAssign, disabled }: Options) {
  const [loadApplication] = useLazyGetAdmissionApplicationQuery();
  const [loadCounsellors] =
    admissionApplicationsApi.useLazyGetAdmissionApplicationCounsellorsQuery();
  const [loadWorkflow] = admissionApplicationsApi.useLazyGetAdmissionApplicationWorkflowQuery();
  const [assign] = useAssignAdmissionApplicationCounsellorMutation();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [counsellors, setCounsellors] = useState<AdmissionApplicationCounsellor[]>([]);
  const [optionsError, setOptionsError] = useState<string | null>(null);
  const [failures, setFailures] = useState<BulkPipelineAssignmentFailure[]>([]);
  const [outcome, setOutcome] = useState<BulkPipelineAssignmentOutcome | null>(null);
  const [progress, setProgress] = useState<{ completed: number; total: number } | null>(null);
  const preparedOfferings = useRef(new Map<string, string>());
  const preparedRuntimeIds = useRef(new Set<string>());
  const operationRef = useRef<Operation | null>(null);
  const mounted = useRef(false);
  const context = useMemo(() => ({ scopeKey, canAssign }), [scopeKey, canAssign]);
  const currentContext = useRef(context);
  // Async continuations must see a scope/permission change before the reset effect runs.
  currentContext.current = context;
  const eligibleRows = useMemo(
    () => (canAssign ? rows.filter((row) => PIPELINE_ACTIVE_STATUSES.includes(row.status)) : []),
    [rows, canAssign]
  );
  const eligibleIds = useMemo(() => eligibleRows.map((row) => row.id), [eligibleRows]);
  const selectedRows = useMemo(
    () => rows.filter((row) => selectedIds.includes(row.id)),
    [rows, selectedIds]
  );

  useEffect(() => {
    mounted.current = true;
    setSelectedIds([]);
    setDialogOpen(false);
    setCounsellors([]);
    setOptionsError(null);
    setFailures([]);
    setOutcome(null);
    preparedOfferings.current.clear();
    preparedRuntimeIds.current.clear();
    return () => {
      mounted.current = false;
      if (operationRef.current) {
        operationRef.current.cancelled = true;
        operationRef.current.abortRead?.();
      }
    };
  }, [context]);

  useEffect(() => {
    if (busy) return;
    const available = new Set(eligibleIds);
    setSelectedIds((ids) =>
      ids.every((id) => available.has(id)) ? ids : ids.filter((id) => available.has(id))
    );
  }, [eligibleIds, busy]);

  const toggleSelection = useCallback(
    (row: AdmissionPipelineItem, checked: boolean) => {
      if (operationRef.current || disabled || !canAssign || dialogOpen) return;
      if (checked && !eligibleIds.includes(row.id)) return;
      setSelectedIds((ids) =>
        checked ? [...new Set([...ids, row.id])] : ids.filter((id) => id !== row.id)
      );
      setFailures((items) => items.filter((item) => item.id !== row.id));
      setOutcome(null);
    },
    [disabled, canAssign, dialogOpen, eligibleIds]
  );
  const toggleAll = useCallback(
    (checked: boolean) => {
      if (operationRef.current || disabled || !canAssign || dialogOpen) return;
      setSelectedIds(checked ? eligibleIds : []);
      setFailures([]);
      setOutcome(null);
    },
    [disabled, canAssign, dialogOpen, eligibleIds]
  );
  const clearSelection = useCallback(() => {
    if (operationRef.current) return;
    setSelectedIds([]);
    setFailures([]);
    setOutcome(null);
    setDialogOpen(false);
    preparedOfferings.current.clear();
    preparedRuntimeIds.current.clear();
  }, []);
  const closeDialog = useCallback(() => {
    if (operationRef.current) return;
    setDialogOpen(false);
    preparedOfferings.current.clear();
    preparedRuntimeIds.current.clear();
  }, []);

  const verifyWorkflow = useCallback(
    async (id: string, operation: Operation, isCurrent: () => boolean) => {
      const request = loadWorkflow(id, false);
      operation.abortRead = () => request.abort();
      try {
        const workflow = await request.unwrap();
        if (!isCurrent()) return false;
        if (!workflow || ![0, 1, 2, 3, 4].includes(workflow.status))
          throw new Error('This admission workflow could not be verified. Refresh and retry.');
        if (workflow.status === 2 || workflow.status === 3)
          throw new Error('This admission workflow is cancelled or failed. Refresh the list.');
        return true;
      } finally {
        operation.abortRead = null;
        request.unsubscribe();
      }
    },
    [loadWorkflow]
  );

  const requestAssignment = useCallback(async () => {
    if (operationRef.current || disabled || !canAssign || !selectedRows.length) return;
    const snapshot = [...selectedRows];
    const operation: Operation = { cancelled: false, abortRead: null };
    operationRef.current = operation;
    const isCurrent = () =>
      mounted.current && !operation.cancelled && currentContext.current === context;
    setDialogOpen(true);
    setBusy(true);
    setLoadingOptions(true);
    setCounsellors([]);
    setOptionsError(null);
    preparedOfferings.current.clear();
    preparedRuntimeIds.current.clear();
    const offeringByApplication = new Map<string, string>();
    const runtimeIds = new Set<string>();
    const listsByOffering = new Map<string, AdmissionApplicationCounsellor[]>();
    try {
      for (let index = 0; index < snapshot.length; index += 1) {
        const row = snapshot[index];
        if (!isCurrent()) return;
        const request = loadApplication(row.id, false);
        operation.abortRead = () => request.abort();
        let application;
        try {
          // eslint-disable-next-line no-await-in-loop -- Bound reads and stop between records.
          application = await request.unwrap();
        } finally {
          operation.abortRead = null;
          request.unsubscribe();
        }
        if (!isCurrent()) return;
        if (!isPipelineApplicationAssignable(application))
          throw new Error(
            `${row.applicantName}: this admission is no longer active. Refresh the list.`
          );
        // Direct registration always has a runtime; undefined inquiryId is not proof of direct entry.
        if (application.currentStageInstanceId || application.inquiryId === null) {
          // eslint-disable-next-line no-await-in-loop -- Runtime ownership requires a verifiable open workflow.
          if (!(await verifyWorkflow(row.id, operation, isCurrent))) return;
          runtimeIds.add(row.id);
        }
        offeringByApplication.set(row.id, application.admissionOfferingId);
        if (!listsByOffering.has(application.admissionOfferingId)) {
          const candidates = loadCounsellors(
            { offeringId: application.admissionOfferingId },
            false
          );
          operation.abortRead = () => candidates.abort();
          try {
            // eslint-disable-next-line no-await-in-loop -- Fetch each distinct offering once per preparation.
            const list = await candidates.unwrap();
            if (!isCurrent()) return;
            listsByOffering.set(application.admissionOfferingId, list);
          } finally {
            operation.abortRead = null;
            candidates.unsubscribe();
          }
        }
      }
      if (!isCurrent()) return;
      preparedOfferings.current = offeringByApplication;
      preparedRuntimeIds.current = runtimeIds;
      setCounsellors(intersectPipelineCounsellors([...listsByOffering.values()]));
    } catch (error) {
      if (isCurrent())
        setOptionsError(
          errorMessage(error, 'Eligible counsellors could not be loaded. Try again.')
        );
    } finally {
      if (operationRef.current === operation) {
        operationRef.current = null;
        if (mounted.current) {
          setBusy(false);
          setLoadingOptions(false);
        }
      }
    }
  }, [
    disabled,
    canAssign,
    selectedRows,
    context,
    loadApplication,
    loadCounsellors,
    verifyWorkflow,
  ]);

  const confirmAssignment = useCallback(
    async ({ counsellorId, reason }: AssignmentInput) => {
      if (
        operationRef.current ||
        disabled ||
        !canAssign ||
        !dialogOpen ||
        optionsError ||
        !selectedRows.length ||
        !counsellors.some((item) => item.id === counsellorId) ||
        (reason?.trim().length ?? 0) > 512 ||
        selectedRows.some((row) => !preparedOfferings.current.has(row.id))
      )
        return;
      const snapshot = [...selectedRows];
      const pinnedOfferings = new Map(preparedOfferings.current);
      const pinnedRuntimeIds = new Set(preparedRuntimeIds.current);
      const operation: Operation = { cancelled: false, abortRead: null };
      operationRef.current = operation;
      const isCurrent = () =>
        mounted.current && !operation.cancelled && currentContext.current === context;
      setBusy(true);
      setAssigning(true);
      setFailures([]);
      setOutcome(null);
      setProgress({ completed: 0, total: snapshot.length });
      const failed: BulkPipelineAssignmentFailure[] = [];
      let assigned = 0;
      let unchanged = 0;
      try {
        for (let index = 0; index < snapshot.length; index += 1) {
          const row = snapshot[index];
          if (!isCurrent()) return;
          try {
            if (pinnedRuntimeIds.has(row.id)) {
              // eslint-disable-next-line no-await-in-loop -- Check runtime before reading the latest application stamp.
              if (!(await verifyWorkflow(row.id, operation, isCurrent))) return;
            }
            const request = loadApplication(row.id, false);
            operation.abortRead = () => request.abort();
            let application;
            try {
              // eslint-disable-next-line no-await-in-loop -- Always use the latest ownership and stamp.
              application = await request.unwrap();
            } finally {
              operation.abortRead = null;
              request.unsubscribe();
            }
            if (!isCurrent()) return;
            if (
              (application.currentStageInstanceId || application.inquiryId === null) &&
              !pinnedRuntimeIds.has(row.id)
            ) {
              // A legacy inquiry may have acquired a workflow after preparation.
              // eslint-disable-next-line no-await-in-loop -- Verify the new runtime before any ownership write.
              if (!(await verifyWorkflow(row.id, operation, isCurrent))) return;
              const latest = loadApplication(row.id, false);
              operation.abortRead = () => latest.abort();
              try {
                // eslint-disable-next-line no-await-in-loop -- Keep the stamp fresh after the additional runtime check.
                application = await latest.unwrap();
              } finally {
                operation.abortRead = null;
                latest.unsubscribe();
              }
              if (!isCurrent()) return;
            }
            if (!isPipelineApplicationAssignable(application))
              throw new Error('This admission is no longer active. Refresh the list.');
            if (application.admissionOfferingId !== pinnedOfferings.get(row.id))
              throw new Error('The admission offering changed. Reload eligible counsellors.');
            if (application.assignedCounsellorId === counsellorId) unchanged += 1;
            else {
              if (!application.concurrencyStamp)
                throw new Error('This admission could not be verified. Refresh and try again.');
              // eslint-disable-next-line no-await-in-loop -- Individual commands keep server checks authoritative.
              await assign({
                id: application.id,
                input: {
                  counsellorId,
                  concurrencyStamp: application.concurrencyStamp,
                  reason: reason?.trim() || undefined,
                },
              }).unwrap();
              assigned += 1;
            }
          } catch (error) {
            if (!isCurrent()) return;
            failed.push({
              id: row.id,
              name: row.applicantName,
              message: errorMessage(error, 'Could not assign the counsellor. Refresh and retry.'),
            });
          }
          if (!isCurrent()) return;
          setProgress({ completed: assigned + unchanged + failed.length, total: snapshot.length });
        }
        if (!isCurrent()) return;
        setSelectedIds(failed.map((item) => item.id));
        setFailures(failed);
        setOutcome({ total: snapshot.length, assigned, unchanged, failed: failed.length });
        setDialogOpen(false);
        preparedOfferings.current.clear();
        preparedRuntimeIds.current.clear();
      } finally {
        if (operationRef.current === operation) {
          operationRef.current = null;
          if (mounted.current) {
            setBusy(false);
            setAssigning(false);
            setProgress(null);
          }
        }
      }
    },
    [
      disabled,
      canAssign,
      dialogOpen,
      optionsError,
      selectedRows,
      counsellors,
      context,
      loadApplication,
      assign,
      verifyWorkflow,
    ]
  );

  return {
    selectedIds,
    selectedRows,
    eligibleIds,
    busy,
    loadingOptions,
    assigning,
    progress,
    dialogOpen,
    counsellors,
    optionsError,
    failures,
    outcome,
    toggleSelection,
    toggleAll,
    clearSelection,
    requestAssignment,
    reloadOptions: requestAssignment,
    closeDialog,
    confirmAssignment,
  };
}
