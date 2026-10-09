import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useDispatch } from 'react-redux';
import { useRef, useState, useEffect } from 'react';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { useGetPermissionsQuery, useUpdatePermissionMutation,
  useGetUserPermissionOverridesQuery, useUpdateUserPermissionOverridesMutation } from 'src/redux/permission/permissionApi';

import { savePermissionDraft } from './save-permission-draft';
import { draftChanges, catalogueStates } from './permission-draft-state';
import { canManageGrant, catalogueEntries } from './permission-catalogue';

import type { PermissionStates } from './permission-draft-state';
import type { GrantProvider, PermissionCatalogue, PermissionOverrideState } from './permission-catalogue';

type Snapshot = { key: string; provider: GrantProvider; catalogue: PermissionCatalogue };
const schema = Yup.object({ states: Yup.object().test('permission-states', 'Invalid permissions.',
  (value) => !!value && Object.values(value).every((state) => typeof state === 'string' && ['inherit', 'allow', 'deny'].includes(state))) });

export function usePermissionDraft(provider: GrantProvider, onSaved: () => void) {
  const key = `${provider.providerName}:${provider.providerKey}`;
  const activeKey = useRef(key);
  activeKey.current = key;
  const dispatch = useDispatch();
  const user = provider.providerName === 'U';
  const roleQuery = useGetPermissionsQuery(provider, { skip: user || !provider.providerKey, refetchOnMountOrArgChange: true });
  const userQuery = useGetUserPermissionOverridesQuery(provider, { skip: !user || !provider.providerKey, refetchOnMountOrArgChange: true });
  const query = user ? userQuery : roleQuery;
  const [update] = useUpdatePermissionMutation();
  const [updateOverrides] = useUpdateUserPermissionOverridesMutation();
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [error, setError] = useState('');
  const submitting = useRef(false);
  const [requestPending, setRequestPending] = useState(false);
  const entries = snapshot ? catalogueEntries(snapshot.catalogue) : [];
  const formik = useFormik({
    initialValues: { states: {} as PermissionStates }, validationSchema: schema,
    onSubmit: async ({ states }) => {
      if (!snapshot || snapshot.key !== key || submitting.current || query.isError) return;
      submitting.current = true;
      setRequestPending(true);
      setError('');
      try {
        const saved = await savePermissionDraft({
          catalogue: snapshot.catalogue, provider, changes: draftChanges(snapshot.catalogue, provider, states),
          refetch: async () => (await query.refetch().unwrap()) as PermissionCatalogue,
          isActive: () => activeKey.current === key,
          persist: (changes) => user
            ? updateOverrides({ ...provider, data: { permissions: changes } }).unwrap()
            : update({ ...provider, data: { permissions: changes.map(({ name, state }) => ({ name, isGranted: state === 'allow' })) } }).unwrap(),
        });
        if (saved) { dispatch(setIsChanges(false)); onSaved(); }
      } catch (cause) {
        setError(cause instanceof Error && (cause.message.startsWith('Permissions changed') || cause.message.startsWith('The saved permissions'))
          ? cause.message : 'Could not save or verify permissions. Your draft is preserved. Reload and review before retrying.');
      } finally {
        submitting.current = false;
        setRequestPending(false);
      }
    },
  });
  const changes = snapshot ? draftChanges(snapshot.catalogue, snapshot.provider, formik.values.states) : [];
  const dirty = changes.length > 0;
  const mismatch = !!snapshot && snapshot.key !== key;
  const currentCatalogue = query.currentData as PermissionCatalogue | undefined;
  const { resetForm } = formik;
  useEffect(() => {
    if (!currentCatalogue || query.isError || submitting.current || dirty) return;
    if (snapshot?.key === key && snapshot.catalogue === currentCatalogue) return;
    setSnapshot({ key, provider, catalogue: currentCatalogue });
    resetForm({ values: { states: catalogueStates(currentCatalogue, provider) } });
  }, [currentCatalogue, query.isError, dirty, key, snapshot, provider, resetForm]);
  useEffect(() => { dispatch(setIsChanges(dirty)); }, [dirty, dispatch]);
  useEffect(() => () => { dispatch(setIsChanges(false)); }, [dispatch]);
  const reload = async () => {
    if (submitting.current || (dirty && !window.confirm('Discard unsaved permission changes and reload?'))) return;
    submitting.current = true;
    setRequestPending(true);
    try {
      const catalogue = (await query.refetch().unwrap()) as PermissionCatalogue;
      if (activeKey.current !== key) return;
      setSnapshot({ key, provider, catalogue });
      resetForm({ values: { states: catalogueStates(catalogue, provider) } });
      setError('');
    } catch { setError('Could not reload permissions. Your draft is preserved. Try again.'); }
    finally { submitting.current = false; setRequestPending(false); }
  };
  const setStateValues = (updates: PermissionStates) => {
    if (mismatch || submitting.current || formik.isSubmitting || query.isError) return;
    const permitted = new Set(entries.filter((entry) => canManageGrant(entry, provider)).map((entry) => entry.name));
    formik.setValues((values) => ({ states: { ...values.states,
      ...Object.fromEntries(Object.entries(updates).filter(([name]) => permitted.has(name))) } }), false);
  };
  const setStates = (names: string[], state: PermissionOverrideState) =>
    setStateValues(Object.fromEntries(names.map((name) => [name, state])));
  const setGrantValues = (updates: Record<string, boolean>) => setStateValues(Object.fromEntries(
    Object.entries(updates).map(([name, granted]) => [name, granted ? 'allow' : user ? 'deny' : 'inherit'])));
  return {
    catalogue: snapshot?.catalogue, states: formik.values.states,
    grants: Object.fromEntries(Object.entries(formik.values.states).map(([name, state]) => [name, state === 'allow'])),
    changes, dirty, mismatch,
    error: mismatch ? 'The selected role or user changed. Your original draft is preserved. Reload to switch safely.' : error,
    isLoading: !snapshot && query.isFetching, isError: query.isError,
    busy: formik.isSubmitting || requestPending,
    blocked: !snapshot || mismatch || query.isError || formik.isSubmitting || requestPending,
    reload, setStates, setGrantValues,
    discard: () => {
      if (!snapshot || mismatch || submitting.current || formik.isSubmitting) return;
      resetForm({ values: { states: catalogueStates(snapshot.catalogue, provider) } });
      setError('');
    },
    setGrants: (names: string[], granted: boolean) => setStates(names, granted ? 'allow' : user ? 'deny' : 'inherit'),
    submit: formik.submitForm,
  };
}
