import type {
  InstituteFieldFormatting,
  InstituteFormattingScope,
} from 'src/redux/InstituteSetup/institute-field-formatting-api';

import { useFormik } from 'formik';
import { useRef, useState } from 'react';
import { useRouter } from 'src/routes/hooks/use-router';
import { shikshaMitraToast } from 'src/components/toast';
import { useUnsavedNavigation } from 'src/hooks/use-unsaved-navigation';
import { renderUnsavedConfirmation } from 'src/components/confirm-dialog/render-unsaved-confirmation';
import { useFieldFormattingSelection } from 'src/components/academic-setup/use-field-formatting-selection';
import { useUpdateInstituteFieldFormattingMutation } from 'src/redux/InstituteSetup/institute-field-formatting-api';

import { INSTITUTE_FORMATTING_CONFIG } from './formatting-config';

export function useFormattingEditor(
  scope: InstituteFormattingScope,
  settings: InstituteFieldFormatting,
  onClose: () => void
) {
  const router = useRouter();
  const saving = useRef(false);
  const { fields } = INSTITUTE_FORMATTING_CONFIG[scope];
  const [error, setError] = useState('');
  const [update, mutation] = useUpdateInstituteFieldFormattingMutation();
  const formik = useFormik({
    initialValues: settings.fields,
    onSubmit: async (values) => {
      if (saving.current) return;
      saving.current = true;
      setError('');
      try {
        await update({ scope, fields: values }).unwrap();
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
  const selection = useFieldFormattingSelection(
    fields,
    formik.values,
    formik.setValues,
    fields[0].key
  );
  return {
    formik,
    ...selection,
    error,
    confirmation,
    isSaving: mutation.isLoading,
    close: () => {
      if (!saving.current) requestNavigation(onClose);
    },
  };
}
