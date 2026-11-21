import type { LibraryPolicyVersion } from 'src/redux/library/policy-types';

import { useState } from 'react';
import { useFormik } from 'formik';
import { shikshaMitraToast } from 'src/components/toast';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import {
  useCreateLibraryPolicyMutation,
  useUpdateLibraryPolicyMutation,
} from 'src/redux/library/policies-api';

import { policySchema, policyPayload, policyInitialValues } from './policy-form';

export function usePolicyDraftEditor(
  academicYearId: string,
  onClose: () => void,
  item?: LibraryPolicyVersion
) {
  const [editSnapshot] = useState(item);
  const [create] = useCreateLibraryPolicyMutation();
  const [update] = useUpdateLibraryPolicyMutation();
  const [error, setError] = useState('');
  const formik = useFormik({
    initialValues: policyInitialValues(editSnapshot),
    validationSchema: policySchema,
    onSubmit: async (values) => {
      setError('');
      try {
        const body = policyPayload(values, editSnapshot);
        if (editSnapshot?.status === 0) await update({ versionId: editSnapshot.id, body }).unwrap();
        else await create({ academicYearId, body }).unwrap();
        formik.resetForm({ values });
        shikshaMitraToast.success({ message: 'Borrowing policy draft saved.' });
        onClose();
      } catch (cause) {
        setError(
          parseApiProblemDetail(cause).detail ||
            'Could not save this draft. Your changes are retained.'
        );
      }
    },
  });
  return { formik, error, editSnapshot };
}
