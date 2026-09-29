'use client';

import type { RootState } from 'src/redux/store';
import type {
  AdmissionForm,
  AdmissionFormPurpose,
  CreateUpdateAdmissionForm,
} from 'src/redux/student/admissions/admission-forms-api';

import { useSelector } from 'react-redux';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useBoolean } from 'src/hooks/use-boolean';
import { shikshaMitraToast } from 'src/components/toast';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import {
  useGetAdmissionFormQuery,
  useCloneAdmissionFormMutation,
  useCreateAdmissionFormMutation,
  useDeleteAdmissionFormMutation,
  useUpdateAdmissionFormMutation,
  useRejectAdmissionFormMutation,
  usePublishAdmissionFormMutation,
  useArchiveAdmissionFormMutation,
  useApproveAdmissionFormMutation,
  useValidateAdmissionFormMutation,
  useCreateAdmissionFormVersionMutation,
  useRequestAdmissionFormApprovalMutation,
} from 'src/redux/student/admissions/admission-forms-api';

import { getAdmissionFormAccess } from '../form-access';
import {
  formatAdmissionFormValidationError,
  formatAdmissionFormValidationErrors,
} from './form-validation-errors';

export function useFormListActions() {
  const router = useRouter();
  const dialog = useBoolean();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingForm, setEditingForm] = useState<AdmissionForm | null>(null);
  const [creatingPurpose, setCreatingPurpose] = useState<AdmissionFormPurpose>(1);
  const editingQuery = useGetAdmissionFormQuery(editingId ?? '', { skip: !editingId });
  useEffect(() => {
    const form = editingQuery.data;
    if (editingId && form?.id === editingId) {
      setEditingForm((current) => (current?.id === editingId ? current : form));
    }
  }, [editingId, editingQuery.data]);
  const { permissions, user } = useSelector((state: RootState) => state.auth);
  const { canManage, canPublish, canDelete } = getAdmissionFormAccess(permissions);
  const roles = (Array.isArray(user?.role) ? user.role : [user?.role])
    .map((role: unknown) =>
      String(role ?? '')
        .trim()
        .toLowerCase()
    )
    .filter(Boolean);
  const canOverrideMakerChecker = roles.some(
    (role: string) => role === 'admin' || role === 'super-admin'
  );
  const [create, createState] = useCreateAdmissionFormMutation();
  const [update, updateState] = useUpdateAdmissionFormMutation();
  const [clone, cloneState] = useCloneAdmissionFormMutation();
  const [validate, validateState] = useValidateAdmissionFormMutation();
  const [publish, publishState] = usePublishAdmissionFormMutation();
  const [requestApproval, requestApprovalState] = useRequestAdmissionFormApprovalMutation();
  const [approve, approveState] = useApproveAdmissionFormMutation();
  const [reject, rejectState] = useRejectAdmissionFormMutation();
  const [createVersion] = useCreateAdmissionFormVersionMutation();
  const [archive] = useArchiveAdmissionFormMutation();
  const [deleteForm, deleteState] = useDeleteAdmissionFormMutation();
  const [pendingDelete, setPendingDelete] = useState<AdmissionForm | null>(null);
  const [pendingPublish, setPendingPublish] = useState<AdmissionForm | null>(null);
  const [publishIssues, setPublishIssues] = useState<string[] | null>(null);
  const [pendingClone, setPendingClone] = useState<AdmissionForm | null>(null);
  const [historyForm, setHistoryForm] = useState<AdmissionForm | null>(null);
  const run = async (action: () => Promise<unknown>, message: string) => {
    try {
      await action();
      shikshaMitraToast.success({ message });
      return true;
    } catch (error) {
      shikshaMitraToast.error({
        message: parseApiProblemDetail(error).detail || 'Unable to complete the form action.',
      });
      return false;
    }
  };
  const save = async (values: CreateUpdateAdmissionForm) => {
    // Let the form dialog handle failures so it keeps the user's draft available for retry.
    await (editingId ? update({ id: editingId, body: values }).unwrap() : create(values).unwrap());
    shikshaMitraToast.success({ message: 'Form draft saved' });
    dialog.onFalse();
    setEditingId(null);
    setEditingForm(null);
  };
  const close = () => {
    dialog.onFalse();
    setEditingId(null);
    setEditingForm(null);
  };
  const edit = (id: string) => {
    setEditingForm(null);
    setEditingId(id);
    dialog.onTrue();
  };

  return {
    dialog,
    editingId,
    editing: editingId === editingForm?.id ? editingForm : null,
    editingError: Boolean(editingId && editingQuery.isError && !editingForm),
    retryEditing: () => editingQuery.refetch(),
    creatingPurpose,
    canManage,
    canPublish,
    canDelete,
    canOverrideMakerChecker,
    currentUserId: typeof user?.sub === 'string' ? user.sub : null,
    saving: createState.isLoading || updateState.isLoading,
    save,
    close,
    edit,
    create: (purpose: AdmissionFormPurpose = 1) => {
      setEditingId(null);
      setEditingForm(null);
      setCreatingPurpose(purpose);
      dialog.onTrue();
    },
    preview: (id: string) => router.push(`/student/admissions/settings/forms/${id}/preview`),
    requestClone: (form: AdmissionForm) => setPendingClone(form),
    pendingClone,
    clearPendingClone: () => setPendingClone(null),
    confirmClone: (body: { name: string; code: string; description?: string | null }) =>
      pendingClone
        ? run(() => clone({ id: pendingClone.id, body }).unwrap(), 'Form cloned as a draft').then(
            (ok) => {
              if (ok) setPendingClone(null);
              return ok;
            }
          )
        : Promise.resolve(false),
    cloning: cloneState.isLoading,
    validate: (id: string) =>
      run(async () => {
        const result = await validate(id).unwrap();
        if (!result.isValid) throw new Error(formatAdmissionFormValidationErrors(result.errors));
      }, 'Form is ready to publish'),
    requestPublish: async (form: AdmissionForm) => {
      setPendingPublish(form);
      setPublishIssues(null);
      try {
        const result = await validate(form.id).unwrap();
        setPublishIssues(result.errors.map(formatAdmissionFormValidationError));
      } catch (error) {
        setPendingPublish(null);
        shikshaMitraToast.error({
          message:
            parseApiProblemDetail(error).detail || 'Unable to check whether this form is ready.',
        });
      }
    },
    pendingPublish,
    publishIssues,
    validatingPublish: validateState.isLoading && Boolean(pendingPublish),
    clearPendingPublish: () => {
      setPendingPublish(null);
      setPublishIssues(null);
    },
    editPendingPublish: () => {
      if (!pendingPublish) return;
      const { id } = pendingPublish;
      setPendingPublish(null);
      setPublishIssues(null);
      edit(id);
    },
    confirmPublish: () =>
      pendingPublish && publishIssues?.length === 0
        ? run(
            () =>
              publish({
                id: pendingPublish.id,
                concurrencyStamp: pendingPublish.concurrencyStamp ?? '',
              }).unwrap(),
            'Form published'
          ).then((ok) => {
            if (ok) {
              setPendingPublish(null);
              setPublishIssues(null);
            }
            return ok;
          })
        : Promise.resolve(false),
    publishing: publishState.isLoading,
    requestApproval: (form: AdmissionForm) =>
      run(
        () =>
          requestApproval({
            id: form.id,
            concurrencyStamp: form.concurrencyStamp ?? '',
          }).unwrap(),
        'Approval requested'
      ),
    approving: approveState.isLoading,
    approve: (form: AdmissionForm, comment?: string) =>
      run(
        () =>
          approve({
            id: form.id,
            concurrencyStamp: form.concurrencyStamp ?? '',
            comment,
          }).unwrap(),
        'Form approved'
      ),
    rejecting: rejectState.isLoading,
    reject: (form: AdmissionForm, comment?: string) =>
      run(
        () =>
          reject({
            id: form.id,
            concurrencyStamp: form.concurrencyStamp ?? '',
            comment,
          }).unwrap(),
        'Changes requested'
      ),
    requestingApproval: requestApprovalState.isLoading,
    historyForm,
    showHistory: (form: AdmissionForm) => setHistoryForm(form),
    closeHistory: () => setHistoryForm(null),
    createVersion: (id: string) =>
      run(() => createVersion(id).unwrap(), 'New form version created'),
    archive: (form: AdmissionForm) =>
      run(
        () => archive({ id: form.id, concurrencyStamp: form.concurrencyStamp ?? '' }).unwrap(),
        'Form archived'
      ),
    requestDelete: (form: AdmissionForm) => setPendingDelete(form),
    pendingDelete,
    clearPendingDelete: () => setPendingDelete(null),
    confirmDelete: () =>
      pendingDelete
        ? run(
            () =>
              deleteForm({
                id: pendingDelete.id,
                concurrencyStamp: pendingDelete.concurrencyStamp ?? '',
              }).unwrap(),
            'Form draft deleted'
          ).then((ok) => {
            if (ok) setPendingDelete(null);
            return ok;
          })
        : Promise.resolve(false),
    deleting: deleteState.isLoading,
  };
}
