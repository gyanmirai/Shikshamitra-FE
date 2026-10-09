import type { AcademicSetupNodeType } from './academic-setup-model';

export const ACADEMIC_LEVEL_HELP: Record<AcademicSetupNodeType, string> = {
  'Academic Year': 'Boards connect this year to the curriculum authority followed by the school.',
  'Education Board': 'Mediums define the language used to teach the board curriculum.',
  Medium: 'Stages group standards into school sections such as Primary or Secondary.',
  Organization: 'Standards define the grade levels available inside this stage.',
  Standard: 'Divisions split a standard into class sections such as A, B, or C.',
  Division: 'Use this division for students, attendance, timetables, and exams.',
};
