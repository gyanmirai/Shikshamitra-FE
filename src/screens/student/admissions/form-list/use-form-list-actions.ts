'use client';

import type { RootState } from 'src/redux/store';
import type { AdmissionForm, CreateUpdateAdmissionForm } from 'src/redux/student/admissions/admission-forms-api';

import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { useBoolean } from 'src/hooks/use-boolean';
import { shikshaMitraToast } from 'src/components/toast';
import { hasGrantedPermission } from 'src/utils/permissions';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import {
  useGetAdmissionFormQuery,
  useCloneAdmissionFormMutation,
  useCreateAdmissionFormMutation,
  useDeleteAdmissionFormMutation,
  useUpdateAdmissionFormMutation,
  usePublishAdmissionFormMutation,
  useArchiveAdmissionFormMutation,
  useValidateAdmissionFormMutation,
  useCreateAdmissionFormVersionMutation,
} from 'src/redux/student/admissions/admission-forms-api';

export function useFormListActions() {
  const router = useRouter();
  const dialog = useBoolean();
  const [editingId, setEditingId] = useState<string | null>(null);
  const editingQuery = useGetAdmissionFormQuery(editingId ?? '', { skip: !editingId });
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const canManage = hasGrantedPermission(permissions, 'Students.Admissions.Forms.Add');
  const canPublish = hasGrantedPermission(permissions, 'Students.Admissions.Forms.Add');
  const [create, createState] = useCreateAdmissionFormMutation();
  const [update, updateState] = useUpdateAdmissionFormMutation();
  const [clone] = useCloneAdmissionFormMutation();
  const [validate] = useValidateAdmissionFormMutation();
  const [publish] = usePublishAdmissionFormMutation();
  const [createVersion] = useCreateAdmissionFormVersionMutation();
  const [archive] = useArchiveAdmissionFormMutation();
  const [deleteForm, deleteState] = useDeleteAdmissionFormMutation();
  const [pendingDelete, setPendingDelete] = useState<AdmissionForm | null>(null);
  const run = async (action: () => Promise<unknown>, message: string) => {
    try {
      await action();
      shikshaMitraToast.success({ message });
      return true;
    } catch (error) {
      shikshaMitraToast.error({ message: parseApiProblemDetail(error).detail || 'Unable to complete the form action.' });
      return false;
    }
  };
  const save = async (values: CreateUpdateAdmissionForm) => {
    // Let the form dialog handle failures so it keeps the user's draft available for retry.
    await (editingId
      ? update({ id: editingId, body: values }).unwrap()
      : create(values).unwrap());
    shikshaMitraToast.success({ message: 'Form draft saved' });
    dialog.onFalse();
    setEditingId(null);
  };
  const close = () => { dialog.onFalse(); setEditingId(null); };
  const edit = (id: string) => { setEditingId(id); dialog.onTrue(); };

  return {
    dialog, editingId, editing: editingQuery.data, canManage, canPublish,
    saving: createState.isLoading || updateState.isLoading, save, close, edit,
    create: () => { setEditingId(null); dialog.onTrue(); },
    preview: (id: string) => router.push(`/student/admissions/settings/forms/${id}/preview`),
    clone: (id: string) => run(() => clone({ id, body: { name: '', code: '' } }).unwrap(), 'Form cloned'),
    validate: (id: string) => run(async () => { const result = await validate(id).unwrap(); if (!result.isValid) throw new Error(result.errors.join(', ')); }, 'Form is valid'),
    publish: (form: AdmissionForm) => run(() => publish({ id: form.id, concurrencyStamp: form.concurrencyStamp ?? '' }).unwrap(), 'Form published'),
    createVersion: (id: string) => run(() => createVersion(id).unwrap(), 'New form version created'),
    archive: (form: AdmissionForm) => run(() => archive({ id: form.id, concurrencyStamp: form.concurrencyStamp ?? '' }).unwrap(), 'Form archived'),
    requestDelete: (form: AdmissionForm) => setPendingDelete(form),
    pendingDelete,
    clearPendingDelete: () => setPendingDelete(null),
    confirmDelete: () => pendingDelete
      ? run(() => deleteForm({ id: pendingDelete.id, concurrencyStamp: pendingDelete.concurrencyStamp ?? '' }).unwrap(), 'Form draft deleted')
        .then((ok) => { if (ok) setPendingDelete(null); return ok; })
      : Promise.resolve(false),
    deleting: deleteState.isLoading,
  };
}
