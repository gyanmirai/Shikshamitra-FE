import type { AcademicFieldFormatting } from 'src/redux/InstituteSetup/academic-field-formatting-api';

import { useFormik } from 'formik';
import { useRef, useState } from 'react';
import { useRouter } from 'src/routes/hooks/use-router';
import { shikshaMitraToast } from 'src/components/toast';
import { useUnsavedNavigation } from 'src/hooks/use-unsaved-navigation';
import { renderUnsavedConfirmation } from 'src/components/confirm-dialog/render-unsaved-confirmation';
import { useUpdateAcademicFieldFormattingMutation } from 'src/redux/InstituteSetup/academic-field-formatting-api';

import { ACADEMIC_FORMAT_FIELDS } from './academic-field-formatting-model';
import { useFieldFormattingSelection } from './use-field-formatting-selection';

export function useAcademicFieldFormattingSettings(
  initialSettings: AcademicFieldFormatting,
  onClose: () => void
) {
  const router = useRouter();
  const saving = useRef(false);
  const [error, setError] = useState('');
  const [update, mutation] = useUpdateAcademicFieldFormattingMutation();
  const formik = useFormik<AcademicFieldFormatting>({
    initialValues: initialSettings,
    onSubmit: async (values) => {
      if (saving.current) return;
      saving.current = true;
      setError('');
      try {
        await update(values).unwrap();
        shikshaMitraToast.success({ message: 'Field formatting settings saved.' });
        onClose();
      } catch {
        setError('Could not save formatting settings. Your changes are kept. Please try again.');
      } finally {
        saving.current = false;
      }
    },
  });
  const { requestNavigation, confirmation } = useUnsavedNavigation(formik.dirty, {
    blockNavigation: mutation.isLoading,
    push: (href) => {
      onClose();
      router.push(href);
    },
    renderConfirmation: (keepEditing, discard) => renderUnsavedConfirmation(keepEditing, discard),
  });
  const close = () => {
    if (!saving.current) requestNavigation(onClose);
  };
  const selection = useFieldFormattingSelection(
    ACADEMIC_FORMAT_FIELDS,
    formik.values,
    formik.setValues,
    'stage'
  );
  return {
    formik,
    ...selection,
    error,
    close,
    confirmation,
    isSaving: mutation.isLoading,
  };
}
