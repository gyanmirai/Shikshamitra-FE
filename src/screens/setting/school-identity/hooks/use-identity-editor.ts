import { useFormik } from 'formik';
import { useRef, useState, useEffect } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import {
  useUpdateSchoolIdentityMutation,
  useUploadSchoolIdentityAssetMutation,
} from 'src/redux/InstituteSetup/schoolIdentityApi';

import { identityError, identitySchema } from '../identity-form';

import type { IdentityKind, IdentityAsset, IdentityContext, IdentityProfile } from '../types';

export function useIdentityEditor(
  profile: IdentityProfile,
  context: IdentityContext,
  onClose: () => void
) {
  const [error, setError] = useState('');
  const [uploadedAssets, setUploadedAssets] = useState<
    Partial<Record<IdentityKind, IdentityAsset>>
  >({});
  const bodyRef = useRef<HTMLDivElement>(null);
  const focusedSubmit = useRef(0);
  const [save, saving] = useUpdateSchoolIdentityMutation();
  const [upload, uploading] = useUploadSchoolIdentityAssetMutation();
  const formik = useFormik({
    initialValues: profile.choices,
    validationSchema: identitySchema,
    onSubmit: async (choices) => {
      setError('');
      try {
        await save({ ...context, concurrencyStamp: profile.concurrencyStamp, choices }).unwrap();
        shikshaMitraToast.success({ message: 'School Identity saved.' });
        onClose();
      } catch (failure) {
        setError(identityError(failure));
      }
    },
  });
  const busy = saving.isLoading || uploading.isLoading || formik.isSubmitting;
  useEffect(() => {
    if (formik.isSubmitting || formik.submitCount === focusedSubmit.current) return;
    focusedSubmit.current = formik.submitCount;
    const kind = Object.keys(formik.errors)[0];
    if (!kind) return;
    const section = bodyRef.current?.querySelector(`[data-identity-kind="${kind}"]`);
    const control =
      section?.querySelector<HTMLElement>('[aria-invalid="true"]') ??
      section?.querySelector<HTMLElement>('button');
    control?.focus();
    control?.scrollIntoView({ block: 'nearest' });
  }, [formik.errors, formik.isSubmitting, formik.submitCount]);
  const uploadFile = async (kind: IdentityKind, file: File) => {
    setError('');
    try {
      const asset = await upload({ ...context, kind, file }).unwrap();
      await formik.setFieldValue(kind, { ...formik.values[kind], mode: 1, assetId: asset.id });
      setUploadedAssets((current) => ({ ...current, [kind]: asset }));
    } catch (failure) {
      setError(identityError(failure, 'upload'));
    }
  };
  return {
    formik,
    error,
    busy,
    bodyRef,
    uploadFile,
    uploadedAssets,
    uploading: uploading.isLoading,
  };
}
