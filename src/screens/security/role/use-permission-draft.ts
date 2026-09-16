import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useDispatch } from 'react-redux';
import { useRef, useState, useEffect } from 'react';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import {
  useGetPermissionsQuery,
  useUpdatePermissionMutation,
} from 'src/redux/permission/permissionApi';

import { canManageGrant, hasDirectGrant, catalogueEntries } from './permission-catalogue';

import type { GrantProvider, PermissionCatalogue } from './permission-catalogue';

type Snapshot = { key: string; provider: GrantProvider; catalogue: PermissionCatalogue };
const schema = Yup.object({
  grants: Yup.object().test(
    'boolean-grants',
    'Invalid permissions.',
    (value) => !!value && Object.values(value).every((grant) => typeof grant === 'boolean')
  ),
});

export function usePermissionDraft(provider: GrantProvider, onSaved: () => void) {
  const key = `${provider.providerName}:${provider.providerKey}`;
  const activeKey = useRef(key);
  activeKey.current = key;
  const dispatch = useDispatch();
  const query = useGetPermissionsQuery(provider, {
    skip: !provider.providerKey,
    refetchOnMountOrArgChange: true,
  });
  const [update] = useUpdatePermissionMutation();
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [error, setError] = useState('');
  const submitting = useRef(false);
  const [requestPending, setRequestPending] = useState(false);
  const entries = snapshot ? catalogueEntries(snapshot.catalogue) : [];
  const formik = useFormik({
    initialValues: { grants: {} as Record<string, boolean> },
    validationSchema: schema,
    onSubmit: async ({ grants }) => {
      if (!snapshot || snapshot.key !== key || submitting.current || query.isError) return;
      submitting.current = true;
      setRequestPending(true);
      setError('');
      const changes = entries
        .filter((entry) => grants[entry.name] !== hasDirectGrant(entry, provider))
        .map((entry) => ({ name: entry.name, isGranted: grants[entry.name] }));
      try {
        const fresh = (await query.refetch().unwrap()) as PermissionCatalogue;
        if (activeKey.current !== key) return;
        const freshEntries = new Map(catalogueEntries(fresh).map((entry) => [entry.name, entry]));
        if (
          changes.some((change) => {
            const current = freshEntries.get(change.name);
            const original = entries.find((entry) => entry.name === change.name)!;
            return (
              !current ||
              !canManageGrant(current, provider) ||
              hasDirectGrant(current, provider) !== hasDirectGrant(original, provider)
            );
          })
        ) {
          setError(
            'Permissions changed on the server. Your draft is preserved. Reload and review before saving again.'
          );
          return;
        }
        if (changes.length) await update({ ...provider, data: { permissions: changes } }).unwrap();
        const persisted = (await query.refetch().unwrap()) as PermissionCatalogue;
        if (activeKey.current !== key) return;
        const persistedEntries = new Map(
          catalogueEntries(persisted).map((entry) => [entry.name, entry])
        );
        if (
          changes.some((change) => {
            const current = persistedEntries.get(change.name);
            return !current || hasDirectGrant(current, provider) !== change.isGranted;
          })
        ) {
          setError(
            'The saved permissions could not be verified. Your draft is preserved. Reload and review the current access.'
          );
          return;
        }
        dispatch(setIsChanges(false));
        onSaved();
      } catch {
        setError(
          'Could not save or verify permissions. Your draft is preserved. Reload and review before retrying.'
        );
      } finally {
        submitting.current = false;
        setRequestPending(false);
      }
    },
  });
  const changes = entries.filter(
    (entry) => formik.values.grants[entry.name] !== hasDirectGrant(entry, snapshot!.provider)
  );
  const dirty = changes.length > 0;
  const mismatch = !!snapshot && snapshot.key !== key;
  const currentCatalogue = query.currentData as PermissionCatalogue | undefined;
  const { resetForm } = formik;

  useEffect(() => {
    if (!currentCatalogue || query.isError || submitting.current || dirty) return;
    if (snapshot?.key === key && snapshot.catalogue === currentCatalogue) return;
    const grants = Object.fromEntries(
      catalogueEntries(currentCatalogue).map((entry) => [
        entry.name,
        hasDirectGrant(entry, provider),
      ])
    );
    setSnapshot({ key, provider, catalogue: currentCatalogue });
    resetForm({ values: { grants } });
  }, [currentCatalogue, query.isError, dirty, key, snapshot, provider, resetForm]);

  useEffect(() => {
    dispatch(setIsChanges(dirty));
  }, [dirty, dispatch]);
  useEffect(
    () => () => {
      dispatch(setIsChanges(false));
    },
    [dispatch]
  );

  const reload = async () => {
    if (
      submitting.current ||
      (dirty && !window.confirm('Discard unsaved permission changes and reload?'))
    )
      return;
    submitting.current = true;
    setRequestPending(true);
    try {
      const catalogue = (await query.refetch().unwrap()) as PermissionCatalogue;
      if (activeKey.current !== key) return;
      setSnapshot({ key, provider, catalogue });
      resetForm({
        values: {
          grants: Object.fromEntries(
            catalogueEntries(catalogue).map((entry) => [
              entry.name,
              hasDirectGrant(entry, provider),
            ])
          ),
        },
      });
      setError('');
    } catch {
      setError('Could not reload permissions. Your draft is preserved. Try again.');
    } finally {
      submitting.current = false;
      setRequestPending(false);
    }
  };
  const setGrantValues = (updates: Record<string, boolean>) => {
    if (mismatch || submitting.current || formik.isSubmitting || query.isError) return;
    const permitted = new Set(
      entries.filter((entry) => canManageGrant(entry, provider)).map((entry) => entry.name)
    );
    formik.setValues(
      (values) => ({
        grants: {
          ...values.grants,
          ...Object.fromEntries(Object.entries(updates).filter(([name]) => permitted.has(name))),
        },
      }),
      false
    );
  };
  const setGrants = (names: string[], granted: boolean) =>
    setGrantValues(Object.fromEntries(names.map((name) => [name, granted])));
  return {
    catalogue: snapshot?.catalogue,
    grants: formik.values.grants,
    changes,
    dirty,
    mismatch,
    error: mismatch
      ? 'The selected role or user changed. Your original draft is preserved. Reload to switch safely.'
      : error,
    isLoading: !snapshot && query.isFetching,
    isError: query.isError,
    busy: formik.isSubmitting || requestPending,
    blocked: !snapshot || mismatch || query.isError || formik.isSubmitting || requestPending,
    reload,
    setGrants,
    setGrantValues,
    submit: formik.submitForm,
  };
}
