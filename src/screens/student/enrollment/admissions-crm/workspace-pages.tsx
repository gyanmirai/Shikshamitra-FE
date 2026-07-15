'use client';

import dynamic from 'next/dynamic';
import { SplashScreen } from 'src/components/loading-screen';
import { studentPermissions } from 'src/constants/student-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const loading = () => <SplashScreen />;
const PipelineWorkspace = dynamic(
  () => import('./pipeline-workspace').then((module) => module.PipelineWorkspace),
  { loading }
);
const ExamsWorkspace = dynamic(
  () => import('./exams-workspace').then((module) => module.ExamsWorkspace),
  { loading }
);
const AnalyticsWorkspace = dynamic(
  () => import('./analytics-workspace').then((module) => module.AnalyticsWorkspace),
  { loading }
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

export const AdmissionsPipelineWorkspace = () => (
  <StudentPermissionGuard permissionKey={studentPermissions.enrollment.pipeline}>
    <PipelineWorkspace />
  </StudentPermissionGuard>
);

export const AdmissionsExamsWorkspace = () => (
  <StudentPermissionGuard permissionKey={studentPermissions.enrollment.exams}>
    <ExamsWorkspace />
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
