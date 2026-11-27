'use client';

import type { RootState } from 'src/redux/store';
import type {
  AdmissionForm,
  AdmissionFormPurpose,
  CreateUpdateAdmissionForm,
} from 'src/redux/student/admissions/admission-forms-api';

import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { useBoolean } from 'src/hooks/use-boolean';
import { useRef, useState, useCallback } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import { usePendingNavigation } from 'src/hooks/use-pending-navigation';
import {
  useLazyGetAdmissionFormQuery,
  useCreateAdmissionFormMutation,
  useDeleteAdmissionFormMutation,
  useUpdateAdmissionFormMutation,
  usePublishAdmissionFormMutation,
  useValidateAdmissionFormMutation,
  useCreateAdmissionFormVersionMutation,
} from 'src/redux/student/admissions/admission-forms-api';

import { getAdmissionFormAccess } from '../form-access';
import { getAdmissionFormPreviewUrl } from '../form-preview/form-preview-navigation';
import { getInquiryFormConfigurationIssues } from '../admission-inquiry-field-bindings';
import { SavedAdmissionFormValidationError } from '../form-dialog/form-publish-validation';
import {
  getUnchangedVersionMessage,
  UnchangedAdmissionFormError,
  getUnchangedVersionPublishError,
  admissionFormActionErrorMessage,
  formatAdmissionFormValidationError,
  formatAdmissionFormValidationErrors,
} from './form-validation-errors';

export function useFormListActions() {
  const router = useRouter();
  const navigation = usePendingNavigation(router.push);
  const dialog = useBoolean();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingForm, setEditingForm] = useState<AdmissionForm | null>(null);
  const [editingError, setEditingError] = useState(false);
  const editRequest = useRef(0);
  const [initialPurpose, setInitialPurpose] = useState<AdmissionFormPurpose>(1);
  const { permissions } = useSelector((state: RootState) => state.auth);
  const { canManage, canPublish, canDelete } = getAdmissionFormAccess(permissions);
  const [create, createState] = useCreateAdmissionFormMutation();
  const [update, updateState] = useUpdateAdmissionFormMutation();
  const [validate, validateState] = useValidateAdmissionFormMutation();
  const [publish, publishState] = usePublishAdmissionFormMutation();
  const [createVersion] = useCreateAdmissionFormVersionMutation();
  const [loadLatestForm] = useLazyGetAdmissionFormQuery();
  const versionLock = useRef(false);
  const [creatingVersionId, setCreatingVersionId] = useState<string | null>(null);
  const [deleteForm, deleteState] = useDeleteAdmissionFormMutation();
  const [pendingDelete, setPendingDelete] = useState<AdmissionForm | null>(null);
  const [checkingDelete, setCheckingDelete] = useState(false);
  const [pendingPublish, setPendingPublish] = useState<AdmissionForm | null>(null);
  const [publishIssues, setPublishIssues] = useState<string[] | null>(null);
  const [historyForm, setHistoryForm] = useState<AdmissionForm | null>(null);
  const checkUnchangedVersion = useCallback(
    async (id: string) => getUnchangedVersionMessage((await validate(id).unwrap()).errors),
    [validate]
  );
  const run = async (action: () => Promise<unknown>, message: string) => {
    try {
      await action();
      shikshaMitraToast.success({ message });
      return true;
    } catch (error) {
      shikshaMitraToast.error({
        message: admissionFormActionErrorMessage(error, 'Unable to complete the form action. Please try again.'),
      });
      return false;
    }
  };
  const clearEditor = () => {
    editRequest.current += 1;
    setEditingId(null);
    setEditingForm(null);
    setEditingError(false);
  };
  const close = () => {
    dialog.onFalse();
    clearEditor();
  };
  const edit = async (id: string, purpose = initialPurpose) => {
    editRequest.current += 1;
    const currentRequest = editRequest.current;
    setEditingId(id);
    setEditingForm(null);
    setEditingError(false);
    setInitialPurpose(purpose);
    dialog.onTrue();

    try {
      const request = loadLatestForm(id, false);
      const form = await request.unwrap().finally(() => request.unsubscribe());
      if (editRequest.current !== currentRequest) return;
      if (form.id !== id || !form.concurrencyStamp) {
        setEditingError(true);
        return;
      }
      // Keep the fresh opening snapshot for this session so a later refresh cannot overwrite edits.
      setEditingForm(form);
    } catch {
      if (editRequest.current === currentRequest) setEditingError(true);
    }
  };
  const save = async (values: CreateUpdateAdmissionForm) => {
    // Let the form dialog handle failures so it keeps the user's draft available for retry.
    await (editingId ? update({ id: editingId, body: values }).unwrap() : create(values).unwrap());
    shikshaMitraToast.success({ message: 'Form draft saved' });
    close();
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
        const message = getUnchangedVersionMessage(readiness.errors);
        if (message) throw new UnchangedAdmissionFormError(message);
        throw new SavedAdmissionFormValidationError(readiness.errors, values);
      }
      await publish({ id: draft.id, concurrencyStamp: draft.concurrencyStamp }).unwrap();
      shikshaMitraToast.success({ message: 'Form published' });
    } catch (error) {
      // Save succeeded: keep editing the persisted draft so a retry cannot create a duplicate.
      setEditingId(draft.id);
      setEditingForm(draft);
      const unchangedVersion = getUnchangedVersionPublishError(error);
      if (unchangedVersion) throw unchangedVersion;
      if (error instanceof SavedAdmissionFormValidationError) throw error;
      const problem = error as { data?: { errorCode?: string; data?: { Errors?: string } } };
      const publishErrors = problem?.data?.data?.Errors;
      if (problem?.data?.errorCode === 'Admissions.FormInvalidDefinition' && typeof publishErrors === 'string') {
        throw new SavedAdmissionFormValidationError(publishErrors.split(';').map((issue) => issue.trim()).filter(Boolean), values);
      }
      throw new Error(`Draft saved, but not published. ${admissionFormActionErrorMessage(error, 'Review the form and try again.')}`);
    }
  };
  const requestVersion = async (id: string) => {
    if (versionLock.current) return false;
    versionLock.current = true;
    setCreatingVersionId(id);
    try {
      await createVersion(id).unwrap();
      shikshaMitraToast.success({ message: 'New form version created' });
      return true;
    } finally {
      versionLock.current = false;
      setCreatingVersionId(null);
    }
  };

  return {
    dialog,
    editingId,
    editing: editingId === editingForm?.id ? editingForm : null,
    editingError,
    retryEditing: () => editingId && edit(editingId),
    initialPurpose,
    canManage,
    canPublish,
    canDelete,
    saving: createState.isLoading || updateState.isLoading,
    save,
    saveAndPublish,
    checkUnchangedVersion,
    close,
    edit,
    create: (purpose: AdmissionFormPurpose = 1) => {
      clearEditor();
      setInitialPurpose(purpose);
      dialog.onTrue();
    },
    pendingNavigationId: navigation.pendingKey,
    preview: (id: string, returnTo?: string) =>
      navigation.navigate(id, getAdmissionFormPreviewUrl(id, returnTo)),
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
        setPublishIssues(result.errors.map((error) => formatAdmissionFormValidationError(error)));
      } catch (error) {
        setPendingPublish(null);
        shikshaMitraToast.error({
          message:
            admissionFormActionErrorMessage(error, 'Unable to check whether this form is ready. Please try again.'),
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
      const { id, purpose } = pendingPublish;
      setPendingPublish(null);
      setPublishIssues(null);
      edit(id, purpose);
    },
    confirmPublish: async () => {
      if (!pendingPublish || publishIssues?.length !== 0) return false;
      try {
        await publish({
          id: pendingPublish.id,
          concurrencyStamp: pendingPublish.concurrencyStamp ?? '',
        }).unwrap();
        setPendingPublish(null);
        setPublishIssues(null);
        shikshaMitraToast.success({ message: 'Form published' });
        return true;
      } catch (error) {
        const unchangedVersion = getUnchangedVersionPublishError(error);
        if (unchangedVersion) setPublishIssues([unchangedVersion.message]);
        else shikshaMitraToast.error({ message: admissionFormActionErrorMessage(error, 'Unable to publish this form. Please try again.') });
        return false;
      }
    },
    publishing: publishState.isLoading,
    historyForm,
    showHistory: (form: AdmissionForm) => setHistoryForm(form),
    closeHistory: () => setHistoryForm(null),
    restoreVersion: requestVersion,
    creatingVersionId,
    createVersion: async (id: string) => {
      try {
        return await requestVersion(id);
      } catch (error) {
        shikshaMitraToast.error({
          message: admissionFormActionErrorMessage(error, 'Unable to create the form draft. Please try again.'),
        });
        return false;
      }
    },
    requestDelete: setPendingDelete,
    pendingDelete,
    clearPendingDelete: () => {
      if (checkingDelete || deleteState.isLoading) return;
      setPendingDelete(null);
    },
    confirmDelete: async () => {
      if (!pendingDelete || checkingDelete || deleteState.isLoading) return false;
      setCheckingDelete(true);
      try {
        // The list row can be stale; confirm against a fresh version before deleting.
        const latestRequest = loadLatestForm(pendingDelete.id, false);
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
        shikshaMitraToast.error({ message: admissionFormActionErrorMessage(error, 'Unable to delete this draft. Please try again.') });
        return false;
      } finally {
        setCheckingDelete(false);
      }
    },
    deleting: checkingDelete || deleteState.isLoading,
  };
}
