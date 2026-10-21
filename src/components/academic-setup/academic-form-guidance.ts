import { GlobalIcons } from 'src/utils/icons';

export const academicFormGuidance = {
  year: {
    title: 'Academic Year Details',
    icon: GlobalIcons.calendar,
    dialog: 'Set the academic year used to organize boards and their hierarchy.',
    section:
      'Choose the first and last dates of the academic year. Its name is generated from these dates.',
  },
  board: {
    title: 'Board Details',
    icon: GlobalIcons.notebook,
    dialog: 'Configure an education board within the selected academic year.',
    section:
      'Select the board and its operating dates. Board dates must stay within the academic year.',
  },
  medium: {
    title: 'Medium Details',
    icon: GlobalIcons.notebook,
    dialog: 'Configure a language of instruction under the selected board.',
    section: 'Enter the language used for teaching, such as English, Hindi, or Gujarati.',
  },
  stage: {
    title: 'Stage Details',
    icon: GlobalIcons.assignedRoute,
    dialog: 'Group related standards into an education stage under the selected medium.',
    section: 'Enter a stage such as Primary or Secondary. Manage its images under School Identity.',
  },
  standard: {
    title: 'Standard Details',
    icon: GlobalIcons.notebook,
    dialog: 'Configure a standard under the selected stage.',
    section: 'Enter the class name and lower age limit. A shift can be assigned when needed.',
  },
  division: {
    title: 'Division Details',
    icon: GlobalIcons.assigned,
    dialog: 'Configure a division within the selected standard.',
    section:
      'Enter the division name and student capacity. Assign a room when room selection is available.',
  },
} as const;

export type AcademicFormKind = keyof typeof academicFormGuidance;
