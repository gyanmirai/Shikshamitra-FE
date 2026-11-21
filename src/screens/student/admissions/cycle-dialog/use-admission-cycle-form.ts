import type { CreateUpdateAdmissionCycle } from 'src/redux/student/admissions/admission-cycles-api';

import dayjs from 'dayjs';
import * as Yup from 'yup';
import { useMemo } from 'react';
import { useFormik } from 'formik';
import { shikshaMitraToast } from 'src/components/toast';
import { dateFormat, dateConvertor } from 'src/utils/dateConvertor';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';

import { ADMISSION_DATE_FORMAT } from '../admission-date-formats';
import { getAdmissionCycleMinimumDate } from './cycle-date-limits';

import type { AdmissionCycleDialogProps } from '../admission-cycle-dialog';

function cycleSchema(
  academicYears: AdmissionCycleDialogProps['academicYears'],
  editing: boolean,
  yearLookupReady: boolean
) {
  const minimumDateTest: Yup.TestFunction<string | undefined> = (value, context) => {
    if (editing || !value || !yearLookupReady) return true;
    const minimumDate = getAdmissionCycleMinimumDate(academicYears, context.parent.academicYearId);
    if (!minimumDate || value >= minimumDate) return true;
    return context.createError({
      message: `Choose a date on or after ${dayjs(minimumDate).format(ADMISSION_DATE_FORMAT)}.`,
    });
  };
  return Yup.object({
    name: Yup.string().trim().max(128, 'Maximum 128 characters').required('Cycle name is required'),
    description: Yup.string().trim().max(1000, 'Maximum 1000 characters').nullable(),
    academicYearId: Yup.string()
      .required('Academic year is required')
      .test(
        'configured-academic-year',
        'Academic year dates are unavailable. Choose an academic year configured in Institute Setup.',
        (value) =>
          editing || Boolean(yearLookupReady && getAdmissionCycleMinimumDate(academicYears, value))
      ),
    startDate: Yup.string()
      .required('Applications open date is required')
      .test('academic-year-minimum', minimumDateTest),
    endDate: Yup.string()
      .required('Applications close date is required')
      .test(
        'after-start',
        'Applications close date must be after open date',
        function validate(value) {
          return !this.parent.startDate || value > this.parent.startDate;
        }
      )
      .test('academic-year-minimum', minimumDateTest),
  });
}

const toDateTimeOffset = (value: string): string => {
  const parsedDate = dayjs(value);
  return parsedDate.isValid() ? dateConvertor(parsedDate.format(dateFormat)) : '';
};

export function useAdmissionCycleForm({
  academicYearId,
  academicYears,
  academicYearsLoading,
  academicYearsError,
  editingCycle,
  onSave,
  onClose,
}: Pick<
  AdmissionCycleDialogProps,
  | 'academicYearId'
  | 'academicYears'
  | 'academicYearsLoading'
  | 'academicYearsError'
  | 'editingCycle'
  | 'onSave'
  | 'onClose'
>) {
  const editing = Boolean(editingCycle);
  const validationSchema = useMemo(
    () => cycleSchema(academicYears, editing, !academicYearsLoading && !academicYearsError),
    [academicYears, editing, academicYearsLoading, academicYearsError]
  );
  // Memoization Justification: Formik uses this baseline in its reinitialization effect;
  // retain its reference until the saved cycle fields or selected year change.
  const initialValues = useMemo(
    () => ({
      name: editingCycle?.name ?? '',
      code: editingCycle?.code ?? '',
      description: editingCycle?.description ?? '',
      academicYearId: editingCycle?.academicYearId ?? academicYearId,
      startDate: editingCycle?.startDate?.slice(0, 10) ?? '',
      endDate: editingCycle?.endDate?.slice(0, 10) ?? '',
    }),
    [
      academicYearId,
      editingCycle?.code,
      editingCycle?.description,
      editingCycle?.academicYearId,
      editingCycle?.endDate,
      editingCycle?.name,
      editingCycle?.startDate,
    ]
  );
  const formik = useFormik<CreateUpdateAdmissionCycle>({
    enableReinitialize: true,
    initialValues,
    validationSchema,
    onSubmit: async (values, helpers) => {
      try {
        await onSave({
          ...values,
          startDate: toDateTimeOffset(values.startDate),
          endDate: toDateTimeOffset(values.endDate),
        });
        helpers.resetForm();
        onClose();
      } catch (error) {
        shikshaMitraToast.error({
          message: parseApiProblemDetail(error).detail || 'Failed to save admission cycle',
        });
      }
    },
  });

  return formik;
}
