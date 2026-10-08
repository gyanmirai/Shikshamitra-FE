import type { HostTenant } from 'src/redux/host-tenants/types';

import { useState } from 'react';
import { useFormik } from 'formik';
import { shikshaMitraToast } from 'src/components/toast';
import {
  useLazyGetHostTenantQuery,
  useCreateHostTenantMutation,
  useUpdateHostTenantMutation,
} from 'src/redux/host-tenants/host-tenant-api';

import {
  tenantError,
  tenantSchema,
  tenantDetails,
  tenantFormValues,
} from '../services/tenant-form';

export function useTenantForm(tenant: HostTenant | undefined, onClose: () => void) {
  const [create] = useCreateHostTenantMutation();
  const [update] = useUpdateHostTenantMutation();
  const [reload, reloadState] = useLazyGetHostTenantQuery();
  const [latest, setLatest] = useState(tenant);
  const [error, setError] = useState('');
  const formik = useFormik({
    initialValues: tenantFormValues(tenant),
    validationSchema: tenantSchema(!tenant),
    onSubmit: async (values) => {
      setError('');
      try {
        if (latest)
          await update({
            id: latest.id,
            input: { ...tenantDetails(values), concurrencyStamp: latest.concurrencyStamp },
          }).unwrap();
        else
          await create({
            ...tenantDetails(values),
            name: values.name.trim(),
            adminEmailAddress: values.adminEmailAddress.trim(),
            adminPassword: values.adminPassword,
          }).unwrap();
        shikshaMitraToast.success({ message: latest ? 'Tenant updated' : 'Tenant created' });
        formik.resetForm();
        onClose();
      } catch (failure) {
        setError(tenantError(failure));
      }
    },
  });
  const reloadLatest = async () => {
    if (!tenant) return;
    if (
      formik.dirty &&
      !window.confirm('Discard your changes and reload the latest tenant details?')
    )
      return;
    try {
      const result = await reload(tenant.id).unwrap();
      setLatest(result);
      formik.resetForm({ values: tenantFormValues(result) });
      setError('');
    } catch (failure) {
      setError(tenantError(failure));
    }
  };
  return { formik, error, reloadLatest, isLoading: formik.isSubmitting || reloadState.isFetching };
}
