'use client';

import dynamic from 'next/dynamic';
import { SplashScreen } from 'src/components/loading-screen';
import { studentPermissions } from 'src/constants/student-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';
import { AdmissionCrmOperationsQueueType } from 'src/redux/student/admissions-crm/admissions-crm-api';

import { offerQueues, activationQueues, registrationQueues } from './operations-queue-config';

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
const OperationsQueueWorkspace = dynamic(
  () => import('./operations-queue-workspace').then((module) => module.OperationsQueueWorkspace),
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
    <OperationsQueueWorkspace
      title="Registrations & Documents"
      description="Resolve registration, correction, document, and admission-readiness work."
      defaultQueue={AdmissionCrmOperationsQueueType.IncompleteRegistration}
      allowedQueues={registrationQueues}
      applicantTab="registration"
    />
  </StudentPermissionGuard>
);

export const AdmissionsOffersWorkspace = () => (
  <StudentPermissionGuard permissionKey={studentPermissions.enrollment.offersSeats}>
    <OperationsQueueWorkspace
      title="Offers & Seats"
      description="Review approval, policy, payment, waitlist, and allotment decisions."
      defaultQueue={AdmissionCrmOperationsQueueType.FinalApproval}
      allowedQueues={offerQueues}
      applicantTab="offer"
    />
  </StudentPermissionGuard>
);

export const AdmissionsActivationWorkspace = () => (
  <StudentPermissionGuard permissionKey={studentPermissions.enrollment.activation}>
    <OperationsQueueWorkspace
      title="Student Activation"
      description="Repair pending activations and review controlled cancellation or service handoff exceptions."
      defaultQueue={AdmissionCrmOperationsQueueType.ActivationRepair}
      allowedQueues={activationQueues}
      applicantTab="activation"
    />
  </StudentPermissionGuard>
);

export const AdmissionsOperationsWorkspace = () => (
  <StudentPermissionGuard permissionKey={studentPermissions.enrollment.operations}>
    <OperationsQueueWorkspace
      title="Admissions Operations"
      description="Work cross-stage exceptions, RTE reconciliation, and data-quality queues."
      defaultQueue={AdmissionCrmOperationsQueueType.UnassignedExam}
      showOperationsUtilities
    />
  </StudentPermissionGuard>
);

export const AdmissionsAnalyticsWorkspace = () => (
  <StudentPermissionGuard permissionKey={studentPermissions.enrollment.analytics}>
    <AnalyticsWorkspace />
  </StudentPermissionGuard>
);
