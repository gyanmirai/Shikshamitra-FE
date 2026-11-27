'use client';

import type { AdmissionForm } from 'src/redux/student/admissions/admission-forms-api';

import { shikshaMitraToast } from 'src/components/toast';
import { useRef, useState, useEffect, useCallback } from 'react';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import {
  useArchiveAdmissionFormMutation,
  useRestoreAdmissionFormMutation,
  useGetAdmissionFormArchiveImpactQuery,
} from 'src/redux/student/admissions/admission-forms-api';

import {
  admissionFormActionErrorMessage,
  FORM_RESTORE_INVALID_DEFINITION,
} from './form-validation-errors';

export type PendingFormLifecycle = { action: 'archive' | 'restore'; form: AdmissionForm } | null;

export function useFormLifecycleActions(canManage: boolean) {
  const [pending, setPending] = useState<PendingFormLifecycle>(null);
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
  const statusChanged = Boolean(
    !query.isFetching && !query.isError && impact && impact.status !== expectedStatus
  );
  useEffect(() => {
    if (statusChanged) {
      shikshaMitraToast.error({
        message: 'This form status has changed. Close and reopen the latest form.',
      });
    }
  }, [statusChanged]);
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
    request,
    close: () => {
      if (!locked.current) setPending(null);
    },
    reloadLatest: async () => {
      if (!pending || locked.current) return;
      setRequiresReload(true);
      try {
        await query.refetch().unwrap();
        setRequiresReload(false);
      } catch (failure) {
        shikshaMitraToast.error({
          message: admissionFormActionErrorMessage(failure, 'Unable to reload the form. Please try again.'),
        });
      }
    },
    confirm: async () => {
      if (!pending || !canConfirm || !impact || locked.current) return;
      locked.current = true;
      setBusy(true);
      try {
        const mutation = pending.action === 'archive' ? archive : restore;
        await mutation({ id: pending.form.id, concurrencyStamp: impact.concurrencyStamp }).unwrap();
        shikshaMitraToast.success({
          message: pending.action === 'archive' ? 'Form archived' : 'Form restored and published',
        });
        setPending(null);
      } catch (failure) {
        const problem = parseApiProblemDetail(failure);
        if (
          problem.errorCode === 'Admissions.FormConcurrencyConflict' ||
          (failure as { status?: number })?.status === 409
        ) {
          setRequiresReload(true);
          shikshaMitraToast.error({
            message: 'This form has changed. Select Reload Latest before trying again.',
          });
        } else {
          if (problem.errorCode === FORM_RESTORE_INVALID_DEFINITION) setPending(null);
          shikshaMitraToast.error({
            message: admissionFormActionErrorMessage(
              failure,
              `Unable to ${pending.action} this form. Please try again.`,
              problem
            ),
          });
        }
      } finally {
        locked.current = false;
        setBusy(false);
      }
    },
  };
}
