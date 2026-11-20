import { useState } from 'react';
import { useFormik } from 'formik';
import { shikshaMitraToast } from 'src/components/toast';
import { useUnsavedNavigation } from 'src/hooks/use-unsaved-navigation';

import { borrowingRulesSchema, createBorrowingRulesDraft } from './borrowing-rules';

import type { BorrowingRuleDto, BorrowingRulesValues } from './borrowing-rules';

export function useBorrowingRulesEditor(
  items: BorrowingRuleDto[],
  canEdit: boolean,
  onSave: (values: BorrowingRulesValues) => Promise<void>
) {
  const [confirm, setConfirm] = useState<'save' | 'reset' | null>(null);
  const [error, setError] = useState('');
  const formik = useFormik({
    initialValues: createBorrowingRulesDraft(items),
    validationSchema: borrowingRulesSchema,
    onSubmit: async (values) => {
      if (!canEdit) return;
      setError('');
      try {
        await onSave(values);
        formik.resetForm({ values });
        setConfirm(null);
        shikshaMitraToast.success({ message: 'Borrowing rules saved successfully.' });
      } catch (failure) {
        setConfirm(null);
        setError(
          failure instanceof Error
            ? failure.message
            : 'Could not save borrowing rules. Please retry.'
        );
      }
    },
  });

  const reviewSave = async () => {
    const errors = await formik.validateForm();
    if (Object.keys(errors).length) {
      await formik.setTouched({
        rules: formik.values.rules.map(() => ({ maxBooksAtTime: true, reservationLimit: true })),
      });
    } else setConfirm('save');
  };

  const guard = useUnsavedNavigation(formik.dirty, {
    blockNavigation: formik.isSubmitting,
    guardContextChanges: true,
  });
  return {
    formik,
    confirm,
    setConfirm,
    error,
    setError,
    reviewSave,
    navigationConfirmation: guard.confirmation,
  };
}
