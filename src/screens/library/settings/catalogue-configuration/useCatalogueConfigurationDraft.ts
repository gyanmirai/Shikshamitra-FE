import type { CatalogueConfiguration } from 'src/redux/library/catalogue-configuration-types';

import { useFormik } from 'formik';
import { useRef, useMemo, useState } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { useUpdateCatalogueConfigurationMutation } from 'src/redux/library/catalogue-configuration-api';

import {
  copyCatalogueDefinition,
  catalogueConfigurationSchema,
} from './catalogue-configuration-form';

export function useCatalogueConfigurationDraft(initial: CatalogueConfiguration) {
  const [baseline, setBaseline] = useState(initial);
  const [error, setError] = useState('');
  const writing = useRef(false);
  const [update, mutation] = useUpdateCatalogueConfigurationMutation();
  const validationSchema = useMemo(() => catalogueConfigurationSchema(baseline), [baseline]);
  const formik = useFormik({
    initialValues: copyCatalogueDefinition(initial),
    validationSchema,
    validateOnChange: false,
    onSubmit: async (definition) => {
      if (writing.current) return;
      writing.current = true;
      setError('');
      try {
        const saved = await update({ expectedRevision: baseline.revision, definition }).unwrap();
        setBaseline(saved);
        formik.resetForm({ values: copyCatalogueDefinition(saved) });
        shikshaMitraToast.success({ message: 'Catalogue configuration saved.' });
      } catch (failure) {
        setError(
          parseApiProblemDetail(failure).detail ||
            'Could not save configuration. Your changes are retained.'
        );
      } finally {
        writing.current = false;
      }
    },
  });
  const reset = (saved: CatalogueConfiguration) => {
    setBaseline(saved);
    formik.resetForm({ values: copyCatalogueDefinition(saved) });
    setError('');
  };
  return {
    baseline,
    formik,
    error,
    setError,
    reset,
    busy: formik.isSubmitting || mutation.isLoading,
  };
}
