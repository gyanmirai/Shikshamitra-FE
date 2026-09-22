import type { LabelColor } from 'src/components/label';
import type { AdmissionApplicant360 } from 'src/redux/student/admissions/admission-applicants-api';

import {
  getAdmissionApplicationStatusColor,
  getAdmissionApplicationStatusLabel,
} from '../application-status';

type Application = AdmissionApplicant360['applications'][number];
type Activity = AdmissionApplicant360['activities'][number];

export const getApplicantName = (data: AdmissionApplicant360) =>
  [data.applicant.firstName, data.applicant.middleName, data.applicant.lastName]
    .filter(Boolean)
    .join(' ');

export const getApplicantInitials = (data: AdmissionApplicant360) =>
  [data.applicant.firstName, data.applicant.lastName]
    .filter(Boolean)
    .map((part) => part?.trim().charAt(0).toUpperCase())
    .join('') || 'A';

export const getApplicantMissingDetails = (data: AdmissionApplicant360) => [
  ...(!data.applicant.dateOfBirth ? ['date of birth'] : []),
  ...(!data.applicant.gender ? ['gender'] : []),
];

export const getCurrentStage = (application?: Application) =>
  application?.stages.find((stage) => stage.status === 1) ??
  application?.stages.find((stage) => stage.status !== 2) ??
  application?.stages.at(-1);

export const getApplicantJourneyState = (applications: Application[]) => {
  const application = applications[0];
  if (!application)
    return {
      label: 'Inquiry converted',
      color: 'info' as LabelColor,
      description: 'Ready to start an application',
    };

  const status = getAdmissionApplicationStatusLabel(application.status);
  return {
    label: status,
    color: getAdmissionApplicationStatusColor(application.status),
    description: getCurrentStage(application)?.name ?? 'Application journey available',
  };
};

const activityPresentation: Record<string, { title: string; icon: string; color: LabelColor }> = {
  InquiryCreated: {
    title: 'Inquiry created',
    icon: 'mdi:account-question-outline',
    color: 'info',
  },
  InquiryDetailsUpdated: {
    title: 'Inquiry details updated',
    icon: 'mdi:pencil-outline',
    color: 'default',
  },
  InquiryContacted: {
    title: 'Family contact recorded',
    icon: 'mdi:phone-check-outline',
    color: 'success',
  },
  InquiryCommunicationDraftCreated: {
    title: 'Communication prepared',
    icon: 'mdi:message-text-outline',
    color: 'info',
  },
  InquiryCommunicationPublished: {
    title: 'Communication sent',
    icon: 'mdi:send-check-outline',
    color: 'success',
  },
  ApplicationStarted: {
    title: 'Application started',
    icon: 'mdi:file-document-edit-outline',
    color: 'primary',
  },
  ApplicantProfileUpdated: {
    title: 'Applicant profile updated',
    icon: 'mdi:account-edit-outline',
    color: 'default',
  },
  NoteAdded: {
    title: 'Note added',
    icon: 'mdi:note-plus-outline',
    color: 'default',
  },
  NoteModified: {
    title: 'Note updated',
    icon: 'mdi:note-edit-outline',
    color: 'default',
  },
};

const humanizeActivityType = (value: string) =>
  value.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/[_-]+/g, ' ');

export const getActivityPresentation = (activity: Activity) =>
  activityPresentation[activity.activityType] ??
  (activity.activityType.includes('Communication')
    ? {
        title: humanizeActivityType(activity.activityType),
        icon: 'mdi:message-text-outline',
        color: 'info' as LabelColor,
      }
    : activity.activityType.includes('FollowUp')
      ? {
          title: humanizeActivityType(activity.activityType),
          icon: 'mdi:calendar-clock-outline',
          color: 'warning' as LabelColor,
        }
      : activity.activityType.includes('Contact')
        ? {
            title: humanizeActivityType(activity.activityType),
            icon: 'mdi:phone-outline',
            color: 'success' as LabelColor,
          }
        : activity.activityType.includes('Assigned')
          ? {
              title: humanizeActivityType(activity.activityType),
              icon: 'mdi:account-arrow-right-outline',
              color: 'default' as LabelColor,
            }
          : activity.activityType.includes('Qualification')
            ? {
                title: humanizeActivityType(activity.activityType),
                icon: 'mdi:check-decagram-outline',
                color: 'primary' as LabelColor,
              }
            : {
                title: humanizeActivityType(activity.activityType),
                icon: 'mdi:history',
                color: 'default' as LabelColor,
              });
