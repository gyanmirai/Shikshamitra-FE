import type { RootState } from 'src/redux/store';

import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import { useRef, useState, useEffect } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { useFormikErrorFocus } from 'src/hooks/use-formik-error-focus';
import { useUnsavedNavigation } from 'src/hooks/use-unsaved-navigation';
import {
  useAddSectionManagementMutation,
  useUpdateSectionManagementMutation,
} from 'src/redux/library/settingApi';

import { getSectionInitialValues } from './SectionManagementInitialValues';
import { sectionManagementValidationSchema } from './SectionManagementValidationSchema';

import type { SectionValues, ISectionFormProps } from './type';

export function useSectionDraft({ editData, onClose, onBusyChange }: ISectionFormProps) {
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const [academicYearId] = useState(currentYear?.id ?? '');
  const [initialValues] = useState(() => getSectionInitialValues(editData));
  const [saveError, setSaveError] = useState('');
  const [add] = useAddSectionManagementMutation();
  const [update] = useUpdateSectionManagementMutation();
  const saving = useRef(false);
  const formik = useFormik<SectionValues>({
    initialValues,
    validationSchema: sectionManagementValidationSchema,
    onSubmit: async (values) => {
      if (saving.current || !academicYearId) return;
      saving.current = true;
      setSaveError('');
      const body = {
        sectionName: values.sectionName,
        numberOfShelf: Number(values.numberOfColumns),
        shelfItems: [...values.shelfNames],
      };
      try {
        if (editData) await update({ sectionId: editData.id, academicYearId, body }).unwrap();
        else await add({ academicYearId, body }).unwrap();
        formik.resetForm({ values });
        shikshaMitraToast.success({
          message: `${values.sectionName} Section ${editData ? 'updated' : 'added'} successfully`,
        });
        onClose(null, true);
      } catch (failure) {
        const message = parseApiProblemDetail(failure).detail;
        setSaveError(message);
        shikshaMitraToast.error({ message });
      } finally {
        saving.current = false;
      }
    },
  });
  useFormikErrorFocus(formik);
  const busy = formik.isSubmitting;
  useEffect(() => {
    onBusyChange?.(busy);
    return () => onBusyChange?.(false);
  }, [busy, onBusyChange]);
  const guard = useUnsavedNavigation(formik.dirty, {
    blockNavigation: busy,
    guardContextChanges: true,
    onNavigationApproved: () => {
      formik.resetForm();
      onClose(null, false);
    },
  });
  return {
    formik,
    busy,
    saveError,
    academicYearId,
    requestClose: () => guard.requestNavigation(() => undefined),
    confirmation: guard.confirmation,
    changeCount: (raw: string) => {
      const count = /^\d+$/.test(raw) ? Number(raw) : 0;
      formik.setValues({
        ...formik.values,
        numberOfColumns: raw,
        shelfNames:
          count > 0
            ? Array.from(
                { length: count },
                (_, index) => formik.values.shelfNames[index] ?? `Shelf ${index + 1}`
              )
            : formik.values.shelfNames,
      });
    },
  };
}
