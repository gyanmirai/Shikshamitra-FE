import type { HostTenant } from 'src/redux/host-tenants/types';

import { useState } from 'react';
import { useFormik } from 'formik';
import { shikshaMitraToast } from 'src/components/toast';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import {
  useLazyGetHostTenantQuery,
  useCreateHostTenantMutation,
  useUpdateHostTenantMutation,
  useGetTenantPasswordPolicyQuery,
} from 'src/redux/host-tenants/host-tenant-api';

import { tenantPasswordHelp } from '../services/tenant-password';
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
  const policy = useGetTenantPasswordPolicyQuery(undefined, {
    skip: Boolean(tenant),
    refetchOnMountOrArgChange: true,
  });
  const canSubmit =
    Boolean(tenant) || Boolean(policy.data && !policy.isFetching && !policy.isError);
  const formik = useFormik({
    initialValues: tenantFormValues(tenant),
    validationSchema: tenantSchema(!tenant, policy.data),
    onSubmit: async (values) => {
      if (!canSubmit) return;
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
        const problem = parseApiProblemDetail(failure);
        if (!latest && problem.errorCode?.startsWith('Volo.Abp.Identity:Password')) {
          await formik.setFieldTouched('adminPassword', true, false);
          formik.setFieldError('adminPassword', problem.detail);
        } else setError(tenantError(failure));
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
  return {
    formik,
    error,
    reloadLatest,
    canSubmit,
    passwordHelp: policy.isError
      ? 'Password requirements are unavailable. Retry below.'
      : tenantPasswordHelp(policy.data),
    policyFailed: !tenant && policy.isError,
    retryPolicy: policy.refetch,
    isLoading: formik.isSubmitting || reloadState.isFetching,
  };
}
