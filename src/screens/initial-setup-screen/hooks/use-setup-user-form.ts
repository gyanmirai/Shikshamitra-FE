import * as Yup from 'yup';
import { useState } from 'react';
import { useFormik } from 'formik';
import { useGetTenantPasswordPolicyQuery } from 'src/redux/host-tenants/host-tenant-api';
import {
  tenantPasswordHelp,
  tenantPasswordSchema,
} from 'src/screens/host-tenants/services/tenant-password';

import { setupError } from '../services/setup-error';

export function useSetupUserForm(
  onCreate: (input: Record<string, unknown>) => Promise<void>,
  onClose: () => void
) {
  const [requestId] = useState(() => crypto.randomUUID());
  const [error, setError] = useState('');
  const policy = useGetTenantPasswordPolicyQuery();
  const form = useFormik({
    initialValues: { userName: '', email: '', password: '', roleNames: [] as string[] },
    validationSchema: Yup.object({
      userName: Yup.string().trim().max(256).required('User name is required'),
      email: Yup.string()
        .trim()
        .email('Enter a valid email')
        .max(256)
        .required('Email is required'),
      password: tenantPasswordSchema(policy.data),
      roleNames: Yup.array().of(Yup.string()),
    }),
    onSubmit: async (values) => {
      if (!policy.data) return;
      setError('');
      try {
        await onCreate({
          ...values,
          userName: values.userName.trim(),
          email: values.email.trim(),
          requestId,
          isActive: true,
          lockoutEnabled: true,
        });
        form.resetForm();
        onClose();
      } catch (failure) {
        setError(setupError(failure));
      }
    },
  });
  return { form, error, policy, passwordHelp: tenantPasswordHelp(policy.data) };
}
