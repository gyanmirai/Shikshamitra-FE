import { useFormik } from 'formik';
import { useRef, useState } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import { useGetTenantPasswordPolicyQuery } from 'src/redux/host-tenants/host-tenant-api';

import { setupUserError } from '../services/setup-user-error';
import { setupUserSchema, setupPasswordFeedback } from '../services/setup-user-validation';

import type { SetupUserErrors } from '../services/setup-user-validation';

export function useSetupUserForm(
  onCreate: (input: Record<string, unknown>) => Promise<void>,
  onClose: () => void
) {
  const [requestId] = useState(() => crypto.randomUUID());
  const [error, setError] = useState<ReturnType<typeof setupUserError>>();
  const [serverErrors, setServerErrors] = useState<SetupUserErrors>({});
  const submitting = useRef(false);
  const policy = useGetTenantPasswordPolicyQuery(undefined, { refetchOnMountOrArgChange: true });
  const form = useFormik({
    initialValues: { userName: '', email: '', password: '', roleNames: [] as string[] },
    validationSchema: setupUserSchema(policy.data),
    onSubmit: async (values) => {
      if (!policy.data || policy.isFetching || policy.isError) return;
      setError(undefined);
      setServerErrors({});
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
        shikshaMitraToast.success({ message: 'User added' });
        onClose();
      } catch (failure) {
        const problem = setupUserError(failure, values);
        setError(problem);
        setServerErrors(problem.fields);
        shikshaMitraToast.error({ message: problem.message });
      }
    },
  });
  function clearServerError(name: string) {
    setServerErrors((current) => ({ ...current, [name]: undefined }));
    setError(undefined);
  }
  async function submit() {
    if (submitting.current) return;
    submitting.current = true;
    try {
      await form.submitForm();
    } finally {
      submitting.current = false;
    }
  }
  return {
    form,
    error,
    policy,
    serverErrors,
    clearServerError,
    submit,
    passwordHelp: setupPasswordFeedback(form.values.password, policy.data),
  };
}
