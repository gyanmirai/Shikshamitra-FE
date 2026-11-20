import type { CatalogueConfiguration } from 'src/redux/library/catalogue-configuration-types';

import { useRef, useState } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import { readCatalogueRevisions } from 'src/redux/library/catalogue-revisions';

import { bookSaveError } from './book-save-error';
import { useBookSaveCommit } from './useBookSaveCommit';
import { useCatalogueBookForm } from './useCatalogueBookForm';
import { useBookWriteCommands } from './useBookWriteCommands';

import type { BookFormValues } from '../Components/type';

export function useBookEditor(
  initialValues: BookFormValues,
  academicYearId: string | undefined,
  canAdd: boolean,
  canUpdate: boolean,
  onClose: (event: unknown, submitted: boolean) => void,
  configuration?: CatalogueConfiguration
) {
  const [activeStep, setActiveStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [reloadId, setReloadId] = useState('');
  const [error, setError] = useState('');
  const writing = useRef(false);
  const { formik, validationSchema } = useCatalogueBookForm(
    initialValues,
    activeStep,
    configuration
  );
  const commit = useBookSaveCommit(formik);
  const commands = useBookWriteCommands();
  const canWrite = formik.values.id ? canUpdate : canAdd;

  const saveCurrent = async (values: BookFormValues, advance: boolean) => {
    if (writing.current) return;
    if (completed && !formik.dirty && advance) {
      onClose(null, true);
      return;
    }
    if (!canWrite && !reloadId) {
      setError('You do not have permission to save this book.');
      return;
    }
    if (!academicYearId) {
      setError('Select an academic year before saving.');
      return;
    }
    if (activeStep === 0 && !values.id) {
      if (advance) setActiveStep(1);
      return;
    }
    writing.current = true;
    setBusy(true);
    formik.setSubmitting(true);
    setError('');
    try {
      let bookId = reloadId || values.id || '';
      if (!reloadId && activeStep === 0) {
        await commit.acceptMetadata(values, await commands.metadata(values));
        shikshaMitraToast.success({ message: 'Book information saved.' });
        if (advance) setActiveStep(1);
        return;
      }
      if (!reloadId) {
        if (!bookId) {
          const created = await commands.create(values, academicYearId);
          bookId = created.id;
          if (!bookId) throw new Error('The creation response did not include the saved book ID.');
          setReloadId(bookId);
          await formik.setValues(
            { ...values, id: bookId, ...readCatalogueRevisions(created) },
            false
          );
        } else {
          await commit.saveExisting(values, commands);
        }
        setReloadId(bookId);
      }
      await commit.reload(bookId);
      setReloadId('');
      setCompleted(true);
      shikshaMitraToast.success({
        message: 'Book saved. Saved labels are ready to load.',
      });
    } catch (failure) {
      setError(bookSaveError(failure));
    } finally {
      writing.current = false;
      setBusy(false);
      formik.setSubmitting(false);
    }
  };

  const reloadForReview = async () => {
    if (!formik.values.id || writing.current) return;
    try {
      await commit.reload(formik.values.id);
      setError('');
      setReloadId('');
      setCompleted(false);
      setActiveStep(0);
    } catch (failure) {
      setError(bookSaveError(failure));
    }
  };

  return {
    formik,
    activeStep,
    setActiveStep,
    busy,
    completed,
    reloadId,
    error,
    canWrite,
    saveCurrent,
    reloadForReview,
    validationSchema,
  };
}
