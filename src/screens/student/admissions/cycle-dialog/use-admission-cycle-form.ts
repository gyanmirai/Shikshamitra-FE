import type { CreateUpdateAdmissionCycle } from 'src/redux/student/admissions/admission-cycles-api';

import dayjs from 'dayjs';
import * as Yup from 'yup';
import { useMemo } from 'react';
import { useFormik } from 'formik';
import { shikshaMitraToast } from 'src/components/toast';
import { dateFormat, dateConvertor } from 'src/utils/dateConvertor';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';

import { getCycleNameError } from './cycle-name-error';
import {
  getCycleDateError,
  isAdmissionCycleDate,
  getAdmissionCycleToday,
  getAdmissionCycleMinimumDate,
} from './cycle-date-limits';

import type { AdmissionCycleDialogProps } from '../admission-cycle-dialog';

function cycleSchema(
  academicYears: AdmissionCycleDialogProps['academicYears'],
  editingCycle: AdmissionCycleDialogProps['editingCycle'],
  yearLookupReady: boolean
) {
  const minimumDateTest =
    (field: 'startDate' | 'endDate'): Yup.TestFunction<string | undefined> =>
    (value, context) => {
      if (!value) return true;
      const today = getAdmissionCycleToday();
      const yearMinimum =
        !editingCycle && yearLookupReady
          ? getAdmissionCycleMinimumDate(academicYears, context.parent.academicYearId)
          : undefined;
      const error = getCycleDateError(
        value,
        yearMinimum && yearMinimum > today ? yearMinimum : today,
        editingCycle?.[field]
      );
      return error ? context.createError({ message: error }) : true;
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
          Boolean(editingCycle) ||
          Boolean(yearLookupReady && getAdmissionCycleMinimumDate(academicYears, value))
      ),
    startDate: Yup.string()
      .required('Applications open date is required')
      .test('minimum-date', minimumDateTest('startDate')),
    endDate: Yup.string()
      .required('Applications close date is required')
      .test('minimum-date', minimumDateTest('endDate'))
      .test(
        'after-start',
        'Applications close date must be on or after the open date.',
        function validate(value) {
          return (
            !value ||
            !isAdmissionCycleDate(value) ||
            !isAdmissionCycleDate(this.parent.startDate) ||
            value >= this.parent.startDate
          );
        }
      ),
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
  const validationSchema = useMemo(
    () => cycleSchema(academicYears, editingCycle, !academicYearsLoading && !academicYearsError),
    [academicYears, editingCycle, academicYearsLoading, academicYearsError]
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
          name: values.name.trim(),
          startDate: toDateTimeOffset(values.startDate),
          endDate: toDateTimeOffset(values.endDate),
        });
        helpers.resetForm();
        onClose();
      } catch (error) {
        const problem = parseApiProblemDetail(error);
        const nameError = getCycleNameError(problem.errorCode);
        if (nameError) {
          helpers.setFieldError('name', nameError);
          return;
        }
        shikshaMitraToast.error({
          message: problem.detail || 'Failed to save admission cycle',
        });
      }
    },
  });

  return formik;
}
