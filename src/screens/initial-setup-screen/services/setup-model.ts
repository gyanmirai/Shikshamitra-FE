import type { SetupDraft, SetupAction } from 'src/redux/initial-setup/types';

import * as Yup from 'yup';
import { tenantSchema } from 'src/screens/host-tenants/services/tenant-form';

export const setupSteps = [
  {
    title: 'Welcome',
    heading: 'Let’s get your institute ready',
    description: 'A few guided steps to prepare your school for the year ahead.',
    icon: 'mdi:hand-wave-outline',
  },
  {
    title: 'Institute profile',
    heading: 'Make it your institute',
    description: 'Confirm the details your school will use across the platform.',
    icon: 'mdi:school-outline',
  },
  {
    title: 'Academic year',
    heading: 'Start with your academic year',
    description: 'Set the name and dates for your school’s working year.',
    icon: 'mdi:calendar-outline',
  },
  {
    title: 'Academic structure',
    heading: 'Build your academic foundation',
    description:
      'Create your first board, medium, stage, class and division. You can add more before finishing.',
    icon: 'mdi:school',
  },
  {
    title: 'Users and access',
    heading: 'Bring your team on board',
    description:
      'Your initial administrator is ready. Add staff now or continue and add them later.',
    icon: 'mdi:account-group-outline',
  },
  {
    title: 'Review and finish',
    heading: 'Everything ready for your school',
    description: 'Review your saved configuration before opening the dashboard.',
    icon: 'mdi:check-circle-outline',
  },
];
const text = (label: string, max = 50) =>
  Yup.string().trim().max(max).required(`${label} is required`);
export function setupSchema(step: number) {
  if (step === 1)
    return Yup.object({
      profile: tenantSchema(false).omit(['name', 'adminEmailAddress', 'adminPassword']),
    });
  if (step === 2)
    return Yup.object({
      yearName: text('Academic year name', 50),
      startDate: Yup.date()
        .nullable()
        .typeError('Enter a valid start date')
        .required('Start date is required'),
      endDate: Yup.date()
        .nullable()
        .typeError('Enter a valid end date')
        .required('End date is required')
        .test('after-start', 'End date must be after start date', function afterStart(value) {
          return Boolean(value && this.parent.startDate && value > new Date(this.parent.startDate));
        }),
    });
  if (step === 3)
    return Yup.object({
      boardType: Yup.number().nullable().oneOf([0, 1]).required('Board is required'),
      medium: text('Medium'),
      stage: text('Stage'),
      className: text('Class'),
      divisionName: text('Division'),
      ageLowerLimit: Yup.number()
        .nullable()
        .integer()
        .min(1)
        .max(100)
        .required('Minimum age is required'),
      strength: Yup.number()
        .nullable()
        .integer()
        .min(1)
        .max(10000)
        .required('Division capacity is required'),
      roomNumber: Yup.string().max(50),
    });
  return Yup.object({});
}
export function setupStepRequest(
  step: number,
  draft: SetupDraft
): { action: SetupAction; input: Record<string, unknown> } {
  if (step === 1) return { action: 'profile', input: { ...draft.profile } };
  if (step === 2)
    return {
      action: 'academic-year',
      input: {
        name: draft.yearName,
        startDate: draft.startDate,
        endDate: draft.endDate,
        existingYearId: draft.existingYearId,
        createNew: draft.existingYearId === null,
      },
    };
  if (step === 3) return { action: 'structure', input: { draft } };
  if (step === 5) return { action: 'complete', input: {} };
  return { action: 'advance', input: { step } };
}
