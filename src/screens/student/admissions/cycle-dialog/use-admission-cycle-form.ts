import type { CreateUpdateAdmissionCycle } from 'src/redux/student/admissions/admission-cycles-api';

import dayjs from 'dayjs';
import * as Yup from 'yup';
import { useMemo } from 'react';
import { useFormik } from 'formik';
import { shikshaMitraToast } from 'src/components/toast';
import { dateFormat, dateConvertor } from 'src/utils/dateConvertor';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';

import type { AdmissionCycleDialogProps } from '../admission-cycle-dialog';

const schema = Yup.object({
  name: Yup.string().trim().max(128, 'Maximum 128 characters').required('Cycle name is required'),
  description: Yup.string().trim().max(1000, 'Maximum 1000 characters').nullable(),
  academicYearId: Yup.string().required('Academic year is required'),
  startDate: Yup.string().required('Applications open date is required'),
  endDate: Yup.string()
    .required('Applications close date is required')
    .test(
      'after-start',
      'Applications close date must be after open date',
      function validate(value) {
        return !this.parent.startDate || value > this.parent.startDate;
      }
    ),
});

const toDateTimeOffset = (value: string): string => {
  const parsedDate = dayjs(value);
  return parsedDate.isValid() ? dateConvertor(parsedDate.format(dateFormat)) : '';
};

export function useAdmissionCycleForm({
  academicYearId,
  editingCycle,
  onSave,
  onClose,
}: Pick<AdmissionCycleDialogProps, 'academicYearId' | 'editingCycle' | 'onSave' | 'onClose'>) {
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
    validationSchema: schema,
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
