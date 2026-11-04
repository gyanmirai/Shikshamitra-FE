'use client';

import type { AdmissionForm } from 'src/redux/student/admissions/admission-forms-api';

import { useRef, useState, useCallback } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import {
  useArchiveAdmissionFormMutation,
  useRestoreAdmissionFormMutation,
  useGetAdmissionFormArchiveImpactQuery,
} from 'src/redux/student/admissions/admission-forms-api';

export type PendingFormLifecycle = { action: 'archive' | 'restore'; form: AdmissionForm } | null;

export function useFormLifecycleActions(canManage: boolean) {
  const [pending, setPending] = useState<PendingFormLifecycle>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [requiresReload, setRequiresReload] = useState(false);
  const locked = useRef(false);
  const [archive] = useArchiveAdmissionFormMutation();
  const [restore] = useRestoreAdmissionFormMutation();
  const query = useGetAdmissionFormArchiveImpactQuery(pending?.form.id ?? '', {
    skip: !pending || !canManage,
    refetchOnMountOrArgChange: true,
  });
  const impact =
    query.currentData?.formDefinitionId === pending?.form.id ? query.currentData : undefined;
  const expectedStatus = pending?.action === 'archive' ? 1 : 2;
  const canConfirm = Boolean(
    canManage &&
    pending &&
    impact &&
    impact.status === expectedStatus &&
    impact.concurrencyStamp &&
    !query.isFetching &&
    !query.isError &&
    !requiresReload &&
    !busy
  );
  const request = useCallback(
    (action: 'archive' | 'restore', form: AdmissionForm) => {
      if (!canManage || locked.current || form.status !== (action === 'archive' ? 1 : 2)) return;
      setError(null);
      setRequiresReload(false);
      setPending({ action, form });
    },
    [canManage]
  );

  return {
    pending,
    impact,
    busy,
    canConfirm,
    requiresReload,
    loading: query.isFetching,
    queryError: Boolean(pending && query.isError),
    error:
      error ||
      (!query.isFetching && !query.isError && impact && impact.status !== expectedStatus
        ? 'This form status has changed. Close and reopen the latest form.'
        : null),
    request,
    close: () => {
      if (!locked.current) {
        setPending(null);
        setError(null);
      }
    },
    reloadLatest: async () => {
      if (!pending || locked.current) return;
      setRequiresReload(true);
      try {
        await query.refetch().unwrap();
        setError(null);
        setRequiresReload(false);
      } catch (failure) {
        shikshaMitraToast.error({ message: parseApiProblemDetail(failure).detail });
      }
    },
    confirm: async () => {
      if (!pending || !canConfirm || !impact || locked.current) return;
      locked.current = true;
      setBusy(true);
      setError(null);
      try {
        const mutation = pending.action === 'archive' ? archive : restore;
        await mutation({ id: pending.form.id, concurrencyStamp: impact.concurrencyStamp }).unwrap();
        shikshaMitraToast.success({
          message: pending.action === 'archive' ? 'Form archived' : 'Form restored and published',
        });
        setPending(null);
      } catch (failure) {
        const problem = parseApiProblemDetail(failure);
        const message = problem.detail;
        if (
          problem.errorCode === 'Admissions.FormConcurrencyConflict' ||
          (failure as { status?: number })?.status === 409
        )
          setRequiresReload(true);
        if (
          typeof problem.errorCode === 'string' &&
          problem.errorCode.startsWith('Admissions.Form')
        ) {
          setError(message);
        } else {
          shikshaMitraToast.error({ message });
        }
      } finally {
        locked.current = false;
        setBusy(false);
      }
    },
  };
}
