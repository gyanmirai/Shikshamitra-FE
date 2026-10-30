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
  useLazyGetAdmissionFormQuery,
  useCloneAdmissionFormMutation,
  useCreateAdmissionFormMutation,
  useDeleteAdmissionFormMutation,
  useUpdateAdmissionFormMutation,
  usePublishAdmissionFormMutation,
  useArchiveAdmissionFormMutation,
  useValidateAdmissionFormMutation,
  useCreateAdmissionFormVersionMutation,
} from 'src/redux/student/admissions/admission-forms-api';

import { getAdmissionFormAccess } from '../form-access';
import { getAdmissionFormPreviewUrl } from '../form-preview/form-preview-navigation';
import { getInquiryFormConfigurationIssues } from '../admission-inquiry-field-bindings';
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
  const { permissions } = useSelector((state: RootState) => state.auth);
  const { canManage, canPublish, canDelete } = getAdmissionFormAccess(permissions);
  const [create, createState] = useCreateAdmissionFormMutation();
  const [update, updateState] = useUpdateAdmissionFormMutation();
  const [clone, cloneState] = useCloneAdmissionFormMutation();
  const [validate, validateState] = useValidateAdmissionFormMutation();
  const [publish, publishState] = usePublishAdmissionFormMutation();
  const [createVersion] = useCreateAdmissionFormVersionMutation();
  const [archive] = useArchiveAdmissionFormMutation();
  const [deleteForm, deleteState] = useDeleteAdmissionFormMutation();
  const [loadDeleteForm] = useLazyGetAdmissionFormQuery();
  const [pendingDelete, setPendingDelete] = useState<AdmissionForm | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [checkingDelete, setCheckingDelete] = useState(false);
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
  const saveAndPublish = async (values: CreateUpdateAdmissionForm) => {
    const issues = getInquiryFormConfigurationIssues(values);
    if (issues.length) throw new Error(issues.join(' '));
    const draft = await (editingId
      ? update({ id: editingId, body: values }).unwrap()
      : create(values).unwrap());
    try {
      if (!draft.concurrencyStamp) {
        throw new Error('Unable to verify the saved draft version. Refresh and try again.');
      }
      const readiness = await validate(draft.id).unwrap();
      if (!readiness.isValid) {
        throw new Error(formatAdmissionFormValidationErrors(readiness.errors));
      }
      await publish({ id: draft.id, concurrencyStamp: draft.concurrencyStamp }).unwrap();
      shikshaMitraToast.success({ message: 'Form published' });
    } catch (error) {
      // Save succeeded: keep editing the persisted draft so a retry cannot create a duplicate.
      setEditingId(draft.id);
      setEditingForm(draft);
      throw new Error(`Draft saved, but not published. ${parseApiProblemDetail(error).detail}`);
    }
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
    saving: createState.isLoading || updateState.isLoading,
    save,
    saveAndPublish,
    close,
    edit,
    create: (purpose: AdmissionFormPurpose = 1) => {
      setEditingId(null);
      setEditingForm(null);
      setCreatingPurpose(purpose);
      dialog.onTrue();
    },
    preview: (id: string, returnTo?: string) =>
      router.push(getAdmissionFormPreviewUrl(id, returnTo)),
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
    requestDelete: (form: AdmissionForm) => {
      setDeleteError(null);
      setPendingDelete(form);
    },
    pendingDelete,
    deleteError,
    clearPendingDelete: () => {
      if (checkingDelete || deleteState.isLoading) return;
      setPendingDelete(null);
      setDeleteError(null);
    },
    confirmDelete: async () => {
      if (!pendingDelete || checkingDelete || deleteState.isLoading) return false;
      setDeleteError(null);
      setCheckingDelete(true);
      try {
        // The list row can be stale; confirm against a fresh version before deleting.
        const latestRequest = loadDeleteForm(pendingDelete.id, false);
        const current = await latestRequest.unwrap().finally(() => latestRequest.unsubscribe());
        if (current.status !== 0) {
          throw new Error('Only a draft admission form can be deleted. Refresh the list.');
        }
        if (!current.concurrencyStamp) {
          throw new Error(
            'Unable to verify the latest form version. Refresh the list and try again.'
          );
        }
        await deleteForm({
          id: pendingDelete.id,
          concurrencyStamp: current.concurrencyStamp,
        }).unwrap();
        shikshaMitraToast.success({ message: 'Admission form draft deleted successfully' });
        setPendingDelete(null);
        return true;
      } catch (error) {
        const message = parseApiProblemDetail(error).detail;
        setDeleteError(message);
        shikshaMitraToast.error({ message });
        return false;
      } finally {
        setCheckingDelete(false);
      }
    },
    deleting: checkingDelete || deleteState.isLoading,
  };
}
