import { useFormik } from 'formik';
import { useRef, useState } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { useAddRoleMutation, useUpdateRoleMutation } from 'src/redux/role/roleApi';

import { normalizeEmployeeOnboardingAssignable } from './employee-onboarding-role';
import { roleFormSchema, getRoleAudience, getRoleInitialValues } from './role-form-values';

import type { RoleRecord, RoleFormValues } from './role-form-values';

export function useRoleForm(role: RoleRecord | null, onClose: () => void) {
  const [addRole, addState] = useAddRoleMutation();
  const [updateRole, updateState] = useUpdateRoleMutation();
  const [error, setError] = useState('');
  const submitting = useRef(false);
  const formik = useFormik<RoleFormValues>({
    initialValues: getRoleInitialValues(role),
    validationSchema: roleFormSchema,
    onSubmit: async (values) => {
      if (submitting.current) return;
      submitting.current = true;
      setError('');
      try {
        const roleAudience = getRoleAudience(role);
        const employeeOnboardingAssignable = normalizeEmployeeOnboardingAssignable({
          roleName: values.role,
          roleAudience,
          requested: values.employeeOnboardingAssignable,
        });
        const body = {
          name: values.role,
          color: values.color,
          employeeGroupAudience: values.employeeGroupAudience,
          employeeOnboardingAssignable,
          isDefault: true,
          isPublic: false,
          extraProperties: {
            color: values.color,
            roleAudience,
            employeeGroupAudience: values.employeeGroupAudience,
            employeeOnboardingAssignable,
          },
        };
        if (role) await updateRole({ id: role.id, body }).unwrap();
        else await addRole(body).unwrap();
        shikshaMitraToast.success({
          message: role
            ? `${role.name} to ${values.role} role updated successfully`
            : `${values.role} role created successfully`,
        });
        onClose();
      } catch (failure) {
        const message = parseApiProblemDetail(failure).detail;
        setError(message);
        shikshaMitraToast.error({ message });
      } finally {
        submitting.current = false;
      }
    },
  });
  return {
    formik,
    error,
    busy: formik.isSubmitting || addState.isLoading || updateState.isLoading,
  };
}
