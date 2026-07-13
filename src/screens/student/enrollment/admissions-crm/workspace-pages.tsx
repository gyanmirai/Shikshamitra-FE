'use client';

import { studentPermissions } from 'src/constants/student-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';
import { AdmissionCrmOperationsQueueType } from 'src/redux/student/admissions-crm/admissions-crm-api';

import StudentAdmissionsCrmScreen from '.';

export const AdmissionsPipelineWorkspace = () => (
  <StudentPermissionGuard permissionKey={studentPermissions.enrollment.pipeline}>
    <StudentAdmissionsCrmScreen workspace="pipeline" />
  </StudentPermissionGuard>
);

export const AdmissionsExamsWorkspace = () => (
  <StudentPermissionGuard permissionKey={studentPermissions.enrollment.exams}>
    <StudentAdmissionsCrmScreen
      heading="Entrance Exams"
      initialView="exams"
      fixedView
      workspace="exams"
    />
  </StudentPermissionGuard>
);

export const AdmissionsRegistrationsWorkspace = () => (
  <StudentPermissionGuard permissionKey={studentPermissions.enrollment.registrations}>
    <StudentAdmissionsCrmScreen
      heading="Registrations and Documents"
      initialView="operations"
      initialOperationsQueueType={AdmissionCrmOperationsQueueType.IncompleteRegistration}
      fixedView
      workspace="registrations"
    />
  </StudentPermissionGuard>
);

export const AdmissionsOffersWorkspace = () => (
  <StudentPermissionGuard permissionKey={studentPermissions.enrollment.offersSeats}>
    <StudentAdmissionsCrmScreen
      heading="Offers and Seats"
      initialView="operations"
      initialOperationsQueueType={AdmissionCrmOperationsQueueType.FinalApproval}
      fixedView
      workspace="offers"
    />
  </StudentPermissionGuard>
);

export const AdmissionsActivationWorkspace = () => (
  <StudentPermissionGuard permissionKey={studentPermissions.enrollment.activation}>
    <StudentAdmissionsCrmScreen
      heading="Student Activation"
      initialView="operations"
      initialOperationsQueueType={AdmissionCrmOperationsQueueType.ActivationRepair}
      fixedView
      workspace="activation"
    />
  </StudentPermissionGuard>
);

export const AdmissionsOperationsWorkspace = () => (
  <StudentPermissionGuard permissionKey={studentPermissions.enrollment.operations}>
    <StudentAdmissionsCrmScreen
      heading="Admissions Operations"
      initialView="operations"
      fixedView
      workspace="operations"
    />
  </StudentPermissionGuard>
);

export const AdmissionsAnalyticsWorkspace = () => (
  <StudentPermissionGuard permissionKey={studentPermissions.enrollment.analytics}>
    <StudentAdmissionsCrmScreen
      heading="Enrollment Analytics"
      initialView="list"
      fixedView
      workspace="analytics"
    />
  </StudentPermissionGuard>
);
