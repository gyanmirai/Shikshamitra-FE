import type { LibraryRolloverYear, LibraryRolloverPreview } from 'src/redux/library/rollover-api';

import * as Yup from 'yup';
import { useRef, useState } from 'react';
import { useFormik, setNestedObjectValues } from 'formik';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import {
  useGetLibraryRolloverYearsQuery,
  usePreviewLibraryRolloverMutation,
} from 'src/redux/library/rollover-api';

const schema = Yup.object({
  targetAcademicYearId: Yup.string().required('Choose a target academic year.'),
  schoolDate: Yup.string().matches(/^\d{4}-\d{2}-\d{2}$/, { excludeEmptyString: true }),
});
const noYears: LibraryRolloverYear[] = [];

export function useRolloverPreview(selectedAcademicYearId?: string) {
  const yearsQuery = useGetLibraryRolloverYearsQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const [previewRequest] = usePreviewLibraryRolloverMutation();
  const [busy, setBusy] = useState(false);
  const inFlight = useRef(false);
  const [review, setReview] = useState<{
    key: string;
    result?: LibraryRolloverPreview;
    error?: string;
  }>();
  const formik = useFormik({
    initialValues: { sourceAcademicYearId: '', targetAcademicYearId: '', schoolDate: '' },
    validationSchema: schema,
    onSubmit: () => undefined,
  });
  const years = yearsQuery.isError ? noYears : yearsQuery.currentData || noYears;
  const lastStart = years.reduce(
    (latest, year) => (year.startsOn > latest ? year.startsOn : latest),
    ''
  );
  const sourceChoices = years.filter((year) => year.startsOn < lastStart);
  const sourceYear = sourceChoices.find(
    (year) => year.id === (formik.values.sourceAcademicYearId || selectedAcademicYearId)
  );
  const targetChoices = sourceYear
    ? years.filter((year) => year.startsOn > sourceYear.startsOn)
    : noYears;
  const targetYear = targetChoices.find((year) => year.id === formik.values.targetAcademicYearId);
  const key = JSON.stringify([sourceYear?.id, targetYear?.id, formik.values.schoolDate]);
  const latestKey = useRef(key);
  latestKey.current = key;

  const runPreview = async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    setBusy(true);
    setReview(undefined);
    try {
      const fieldErrors = await formik.validateForm();
      await formik.setTouched(setNestedObjectValues(fieldErrors, true), false);
      if (!sourceYear || !targetYear) {
        setReview({ key, error: 'Choose a source year and a later target academic year.' });
        return;
      }
      if (Object.keys(fieldErrors).length) return;
      const result = await previewRequest({
        sourceAcademicYearId: sourceYear.id,
        targetAcademicYearId: targetYear.id,
        schoolDate: formik.values.schoolDate || null,
      }).unwrap();
      if (latestKey.current === key) setReview({ key, result });
    } catch (cause) {
      if (latestKey.current === key)
        setReview({
          key,
          error:
            parseApiProblemDetail(cause).detail || 'Could not preview the selected academic years.',
        });
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  };
  return {
    formik,
    sourceYearId: sourceYear?.id ?? '',
    sourceChoices,
    targetChoices,
    targetYear,
    yearsQuery,
    busy,
    runPreview,
    result: review?.key === key ? review.result : undefined,
    error: review?.key === key ? review.error : undefined,
  };
}
