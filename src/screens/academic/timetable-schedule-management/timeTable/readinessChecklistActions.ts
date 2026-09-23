import { academicPaths } from 'src/constants/academic-menu';
import { instituteSetupPaths } from 'src/constants/institute-setup';

export type ReadinessSetupAction = {
  label: string;
  href: string;
};

const READINESS_SETUP_ACTIONS: Array<{
  matches: (message: string) => boolean;
  action: ReadinessSetupAction;
}> = [
  {
    matches: (message) => message.includes('lecture slots'),
    action: {
      label: 'Configure slots',
      href: academicPaths.timetable.settings.lectureSlots,
    },
  },
  {
    matches: (message) => message.includes('capacity mismatch'),
    action: {
      label: 'Review weekly lectures',
      href: academicPaths.timetable.settings.weeklyLectures,
    },
  },
  {
    matches: (message) => message.includes('weekly lectures'),
    action: {
      label: 'Configure lectures',
      href: academicPaths.timetable.settings.weeklyLectures,
    },
  },
  {
    matches: (message) =>
      message.includes('subjects not assigned') || message.includes('teachers assigned'),
    action: {
      label: 'Open subject allocation',
      href: academicPaths.curriculum.subjectsAssignment,
    },
  },
  {
    matches: (message) => message.includes('rooms not configured'),
    action: {
      label: 'Configure rooms',
      href: instituteSetupPaths.roomsManagement.room,
    },
  },
];

export function getReadinessSetupAction(message: string): ReadinessSetupAction | null {
  const normalizedMessage = message.trim().toLowerCase();

  return READINESS_SETUP_ACTIONS.find(({ matches }) => matches(normalizedMessage))?.action ?? null;
}
