import type {
  AdmissionCycle,
  AdmissionCycleStatus,
  AdmissionCycleWindowStatus,
} from 'src/redux/student/admissions/admission-cycles-api';

import dayjs from 'dayjs';

export const lifecycleLabels: Record<AdmissionCycleStatus, string> = {
  0: 'Draft',
  1: 'Published',
  2: 'Closed',
  3: 'Archived',
};

export const windowLabels: Record<AdmissionCycleWindowStatus, string> = {
  0: 'Upcoming',
  1: 'Open',
  2: 'Ended',
  3: 'Closed',
  4: 'Archived',
};

export const normalizeCycleCode = (value: string): string =>
  value.toUpperCase().replace(/[^A-Z0-9_-]/g, '');

export const suggestCloneName = (cycle: AdmissionCycle): string => `${cycle.name} Copy`;
export const suggestCloneCode = (cycle: AdmissionCycle): string =>
  normalizeCycleCode(`${cycle.code}-COPY`).slice(0, 20);

export const canEditCycle = (cycle: AdmissionCycle): boolean => cycle.status === 0;
export const canPublishCycle = (cycle: AdmissionCycle): boolean => cycle.status === 0;
export const canCloseCycle = (cycle: AdmissionCycle): boolean => cycle.status === 1;
export const canReopenCycle = (cycle: AdmissionCycle): boolean => cycle.status === 2;
export const canArchiveCycle = (cycle: AdmissionCycle): boolean => cycle.status === 2;
export const canDeleteCycle = (cycle: AdmissionCycle): boolean =>
  cycle.status === 0 && cycle.linkedOfferingCount === 0 && cycle.applicationCount === 0;

export const cycleScheduleSummary = (cycle: AdmissionCycle): string | null => {
  if (cycle.scheduledPublishAt) {
    return `Publishes ${dayjs(cycle.scheduledPublishAt).format('DD MMM YYYY, hh:mm A')}`;
  }
  if (cycle.scheduledCloseAt) {
    return `Closes ${dayjs(cycle.scheduledCloseAt).format('DD MMM YYYY, hh:mm A')}`;
  }
  return null;
};
