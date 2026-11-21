import type { CatalogueConfiguration } from 'src/redux/library/catalogue-configuration-types';

import { useFormik } from 'formik';
import { useMemo, useState, useEffect } from 'react';

import { bookValidationSchema } from './BookManageValidation';
import { createCatalogueBookSchemas } from './catalogue-book-schema';

import type { BookFormValues } from '../Components/type';

export function useCatalogueBookForm(
  initialValues: BookFormValues,
  activeStep: number,
  configuration?: CatalogueConfiguration
) {
  const [persisted, setPersisted] = useState(
    initialValues.id
      ? {
          bookId: initialValues.id,
          price: initialValues.price,
          languageCode: initialValues.languageCode,
          materialCode: initialValues.materialCode,
        }
      : undefined
  );
  const schemas = useMemo(
    () =>
      configuration ? createCatalogueBookSchemas(configuration, persisted) : bookValidationSchema,
    [configuration, persisted]
  );
  const validationSchema = activeStep === 0 ? schemas[0] : schemas[2];
  const formik = useFormik<BookFormValues>({
    initialValues: configuration
      ? { ...initialValues, expectedCatalogueConfigurationRevision: configuration.revision }
      : initialValues,
    validationSchema,
    validateOnChange: false,
    onSubmit: () => undefined,
  });
  const { values, dirty, resetForm, setFieldValue } = formik;
  const baseline = formik.initialValues;
  useEffect(() => {
    if (baseline.id)
      setPersisted({
        bookId: baseline.id,
        price: baseline.price,
        languageCode: baseline.languageCode,
        materialCode: baseline.materialCode,
      });
  }, [baseline]);
  useEffect(() => {
    const revision = configuration?.revision;
    if (!revision || revision === values.expectedCatalogueConfigurationRevision) return;
    // The owner changes configuration only after explicit review, never from a tag refresh.
    if (dirty) setFieldValue('expectedCatalogueConfigurationRevision', revision, false);
    else resetForm({ values: { ...values, expectedCatalogueConfigurationRevision: revision } });
  }, [configuration?.revision, values, dirty, resetForm, setFieldValue]);
  return { formik, validationSchema };
}
