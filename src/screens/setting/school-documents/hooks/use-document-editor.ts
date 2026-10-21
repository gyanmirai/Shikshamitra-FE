import { useFormik } from 'formik';
import { useRef, useState } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import {
  useCreateSchoolDocumentMutation,
  useUpdateSchoolDocumentMutation,
} from 'src/redux/InstituteSetup/schoolDocumentsApi';

import { documentSchema, schoolDocumentError, initialDocumentValues } from '../document-form';

import type { SchoolDocument, DocumentFormValues } from '../types';

export function useDocumentEditor(document: SchoolDocument | undefined, onClose: () => void) {
  const [openedDocument] = useState(document);
  const [create] = useCreateSchoolDocumentMutation();
  const [update] = useUpdateSchoolDocumentMutation();
  const [error, setError] = useState('');
  const submitting = useRef(false);
  const formik = useFormik<DocumentFormValues>({
    initialValues: initialDocumentValues(openedDocument),
    validationSchema: documentSchema,
    onSubmit: async (values) => {
      if (submitting.current) return;
      submitting.current = true;
      setError('');
      try {
        if (openedDocument) {
          await update({
            id: openedDocument.id,
            values,
            concurrencyStamp: openedDocument.concurrencyStamp,
          }).unwrap();
        } else {
          await create(values).unwrap();
        }
        shikshaMitraToast.success({
          message: openedDocument ? 'School document updated.' : 'School document added.',
        });
        onClose();
      } catch (failure) {
        setError(schoolDocumentError(failure));
      } finally {
        submitting.current = false;
      }
    },
  });
  return { formik, error };
}
