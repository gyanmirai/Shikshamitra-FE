import type {
  AssessmentScope,
  AssessmentSession,
} from 'src/redux/student/admissions/admission-assessment-types';

import * as Yup from 'yup';

import { normalizeAssessmentDateTime } from './assessment-date-time';

export const assessmentSessionSchema = Yup.object({
  name: Yup.string().trim().required('Session name is required').max(128),
  location: Yup.string().trim().required('Location is required').max(256),
  startsAt: Yup.string()
    .required('Start date and time are required')
    .test(
      'valid-start',
      'Enter a valid start date and time',
      (value) => !value || Number.isFinite(Date.parse(value))
    )
    .test(
      'future-start',
      'The session must start in the future',
      (value) => !value || Date.parse(value) > Date.now()
    ),
  endsAt: Yup.string()
    .required('End date and time are required')
    .test('after-start', 'End must be after the start date and time', function afterStart(value) {
      return !value || Date.parse(value) > Date.parse(this.parent.startsAt);
    }),
  capacity: Yup.number()
    .typeError('Capacity is required')
    .integer('Capacity must be a whole number')
    .min(1, 'Capacity must be at least 1')
    .max(10000, 'Capacity cannot exceed 10,000')
    .required('Capacity is required'),
});

export function assessmentSessionSchemaWithBookings(bookedCount: number) {
  return assessmentSessionSchema.test('booked-capacity', function checkCapacity(values) {
    return (
      values.capacity >= bookedCount ||
      this.createError({
        path: 'capacity',
        message: `Capacity cannot be below the ${bookedCount} existing bookings`,
      })
    );
  });
}

export function assessmentSessionInitialValues(
  scope: AssessmentScope,
  session?: AssessmentSession | null
) {
  return {
    admissionOfferingId: scope.admissionOfferingId,
    workflowStageDefinitionId: scope.workflowStageDefinitionId,
    name: session?.name ?? '',
    location: session?.location ?? '',
    startsAt: session?.startsAt ? normalizeAssessmentDateTime(session.startsAt) : '',
    endsAt: session?.endsAt ? normalizeAssessmentDateTime(session.endsAt) : '',
    capacity: session?.capacity ?? 30,
    concurrencyStamp: session?.concurrencyStamp,
  };
}
