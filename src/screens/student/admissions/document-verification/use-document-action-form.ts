import type {
  AdmissionDocumentRequirement,
  ApplicationDocumentVerification,
} from 'src/redux/student/admissions/admission-document-types';

import { useFormik } from 'formik';
import { useRef, useState } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';

import { useDocumentActions } from './use-document-actions';
import { documentActionSchema } from './document-action-model';

import type { DocumentAction, DocumentActionValues } from './document-action-model';

/** Keep the evidence and concurrency stamp pinned until the owning dialog closes. */
export function useDocumentActionForm({
  action,
  summary,
  requirement,
  onSuccess,
  canSubmit = true,
}: {
  action: DocumentAction;
  summary: ApplicationDocumentVerification;
  requirement: AdmissionDocumentRequirement;
  onSuccess: () => void;
  canSubmit?: boolean;
}) {
  const [snapshot] = useState({ summary, requirement });
  const [error, setError] = useState('');
  const submitting = useRef(false);
  const policy = snapshot.summary.policy?.requirements.find(
    (item) => item.code === snapshot.requirement.code
  );
  const extensions = snapshot.requirement.allowedExtensions ??
    policy?.allowedExtensions ?? ['pdf', 'jpg', 'jpeg', 'png'];
  const maxFileSizeMb = snapshot.requirement.maxFileSizeMb ?? policy?.maxFileSizeMb ?? 5;
  const run = useDocumentActions(snapshot.summary, snapshot.requirement);
  const formik = useFormik<DocumentActionValues>({
    initialValues: { file: null, notes: '' },
    validationSchema: documentActionSchema(action, extensions, maxFileSizeMb),
    onSubmit: async (values) => {
      if (submitting.current) return;
      if (!canSubmit) {
        setError('This action is no longer available. Refresh the checklist before continuing.');
        return;
      }
      submitting.current = true;
      setError('');
      try {
        await run(action, values);
        shikshaMitraToast.success({ message: 'Document checklist updated' });
        onSuccess();
      } catch (failure) {
        const { detail } = parseApiProblemDetail(failure);
        setError(
          detail === 'Something went wrong'
            ? 'Unable to update this document. Refresh the checklist and try again.'
            : detail
        );
      } finally {
        submitting.current = false;
      }
    },
  });
  return { formik, error, clearError: () => setError(''), snapshot, extensions, maxFileSizeMb };
}
