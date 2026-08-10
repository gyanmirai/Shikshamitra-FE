'use client';

import dynamic from 'next/dynamic';
import { studentPermissions } from 'src/constants/student-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';

import { EnrollmentRouteTransition } from './enrollment-route-transition';
import { ApplicantInquiryLoadingState } from './applicant-inquiry-header';
import { EnrollmentWorkspaceLoadingState } from './workspace-table-patterns';

const loading = () => <EnrollmentWorkspaceLoadingState />;
const applicantLoading = () => <ApplicantInquiryLoadingState />;
const PipelineWorkspace = dynamic(
  () => import('./pipeline-workspace').then((module) => module.PipelineWorkspace),
  { loading }
);
const OverviewWorkspace = dynamic(
  () => import('./overview-workspace').then((module) => module.EnrollmentOverviewWorkspace),
  { loading }
);
const ExamsWorkspace = dynamic(
  () => import('./exams-workspace').then((module) => module.ExamsWorkspace),
  { loading }
);
const EventsWorkspace = dynamic(
  () => import('./events-workspace').then((module) => module.EventsWorkspace),
  { loading }
);
const AnalyticsWorkspace = dynamic(
  () => import('./analytics-workspace').then((module) => module.AnalyticsWorkspace),
  { loading }
);
const ApplicantWorkspace = dynamic(
  () => import('./applicant-workspace-page').then((module) => module.ApplicantWorkspacePage),
  { loading: applicantLoading }
);
const RegistrationsWorkspace = dynamic(
  () => import('./registrations-workspace').then((module) => module.RegistrationsWorkspace),
  { loading }
);
const OffersWorkspace = dynamic(
  () => import('./offers-workspace').then((module) => module.OffersWorkspace),
  { loading }
);
const ActivationWorkspace = dynamic(
  () => import('./activation-workspace').then((module) => module.ActivationWorkspace),
  { loading }
);
const OperationsWorkspace = dynamic(
  () =>
    import('./operations-workspace').then((module) => module.AdmissionsOperationsWorkspaceContent),
  { loading }
);
export const AdmissionsOverviewWorkspace = () => (
  <StudentPermissionGuard permissionKey={studentPermissions.enrollment.overview}>
    <OverviewWorkspace />
  </StudentPermissionGuard>
);

export const AdmissionsPipelineWorkspace = () => (
  <StudentPermissionGuard permissionKey={studentPermissions.enrollment.pipeline}>
    <EnrollmentRouteTransition>
      <PipelineWorkspace />
    </EnrollmentRouteTransition>
  </StudentPermissionGuard>
);

export const AdmissionsApplicantWorkspace = ({ leadId }: { leadId: string }) => (
  <StudentPermissionGuard permissionKey={studentPermissions.enrollment.pipeline}>
    <EnrollmentRouteTransition>
      <ApplicantWorkspace leadId={leadId} />
    </EnrollmentRouteTransition>
  </StudentPermissionGuard>
);

export const AdmissionsExamsWorkspace = () => (
  <StudentPermissionGuard permissionKey={studentPermissions.enrollment.exams}>
    <ExamsWorkspace />
  </StudentPermissionGuard>
);

export const AdmissionsEventsWorkspace = () => (
  <StudentPermissionGuard permissionKey={studentPermissions.enrollment.events}>
    <EventsWorkspace />
  </StudentPermissionGuard>
);

export const AdmissionsRegistrationsWorkspace = () => (
  <StudentPermissionGuard permissionKey={studentPermissions.enrollment.registrations}>
    <RegistrationsWorkspace />
  </StudentPermissionGuard>
);

export const AdmissionsOffersWorkspace = () => (
  <StudentPermissionGuard permissionKey={studentPermissions.enrollment.offersSeats}>
    <OffersWorkspace />
  </StudentPermissionGuard>
);

export const AdmissionsActivationWorkspace = () => (
  <StudentPermissionGuard permissionKey={studentPermissions.enrollment.activation}>
    <ActivationWorkspace />
  </StudentPermissionGuard>
);

export const AdmissionsOperationsWorkspace = () => (
  <StudentPermissionGuard permissionKey={studentPermissions.enrollment.operations}>
    <OperationsWorkspace />
  </StudentPermissionGuard>
);

export const AdmissionsAnalyticsWorkspace = () => (
  <StudentPermissionGuard permissionKey={studentPermissions.enrollment.analytics}>
    <AnalyticsWorkspace />
  </StudentPermissionGuard>
);
