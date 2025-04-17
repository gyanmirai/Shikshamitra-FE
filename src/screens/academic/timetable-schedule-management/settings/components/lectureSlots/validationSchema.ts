import * as Yup from 'yup';

export const validationSchema = Yup.object().shape({
  className: Yup.string().required('Class is required'),
  schoolHours: Yup.string().required('School hours are required'),
  previousClassSlots: Yup.string().required('Previous class slot is required'),
  totalSlots: Yup.number()
    .typeError('Total slots must be a number')
    .required('Total slots are required')
    .min(1, 'At least one slot is required'),
  timeSlots: Yup.array()
    .of(
      Yup.object().shape({
        startTime: Yup.mixed().required('Start time is required'),
        endTime: Yup.mixed().required('End time is required'),
        slotType: Yup.string().required('Slot type is required'),
        breakType: Yup.string().when('slotType', {
          is: 'break',
          then: (schema) => schema.required('Break type is required'),
          otherwise: (schema) => schema.notRequired(),
        }),
      })
    )
    .min(1, 'Please create at least one time slot'),
});
