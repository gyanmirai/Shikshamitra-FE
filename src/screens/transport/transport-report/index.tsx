'use client';

import type { UseBooleanReturn } from 'src/hooks/useBoolean';

import React from 'react';
import { Box } from '@mui/material';
import CommonReport from 'src/components/common-report';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import {
  RouteStopReportMap,
  DriverStaffReportMap,
  VehicleFleetReportMap,
  FeeAccountingReportMap,
  TransportReportCategory,
  AttendanceTripReportMap,
  SafetyEquipmentReportMap,
  StudentTransportReportMap,
  AdministrativeAuditReportMap,
} from 'src/enums/transport-reports';

import RouteStopReports from './route-stop/RouteStopReports';
import DriverStaffReports from './driver-staff/DriverStaffReports';
import VehicleFleetReports from './vehicle-fleet/VehicleFleetReports';
import FeeAccountingReports from './fee-accounting/FeeAccountingReports';
import AttendanceTripReports from './attendance-trip/AttendanceTripReports';
import SafetyEquipmentReports from './safety-equipment/SafetyEquipmentReports';
import StudentTransportReports from './student-transport/StudentTransportReports';
import AdministrativeAuditReports from './administrative-audit/AdministrativeAuditReports';

const TransportReportScreen = ({ addReportDialog }: { addReportDialog: UseBooleanReturn }) => {
  const categories = [
    {
      name: TransportReportCategory.VehicleFleet,
      id: 'VehicleFleet',
      icon: 'mdi:bus',
    },
    {
      name: TransportReportCategory.RouteStop,
      id: 'RouteStop',
      icon: 'mdi:map-marker-path',
    },
    {
      name: TransportReportCategory.DriverStaff,
      id: 'DriverStaff',
      icon: 'mdi:account-tie-hat',
    },
    {
      name: TransportReportCategory.StudentTransport,
      id: 'StudentTransport',
      icon: 'mdi:account-school',
    },
    {
      name: TransportReportCategory.FeeAccounting,
      id: 'FeeAccounting',
      icon: 'mdi:currency-inr',
    },
    {
      name: TransportReportCategory.SafetyEquipment,
      id: 'SafetyEquipment',
      icon: 'mdi:cctv',
    },
    {
      name: TransportReportCategory.AttendanceTrip,
      id: 'AttendanceTrip',
      icon: 'mdi:calendar-check',
    },
    {
      name: TransportReportCategory.AdministrativeAudit,
      id: 'AdministrativeAudit',
      icon: 'mdi:file-document-edit-outline',
    },
  ];

  const vehicleFleetSubCategories = VehicleFleetReportMap.map((opt, index) => ({
    name: opt.label,
    id: `VehicleFleet-${opt.label.replace(/\s+/g, '-')}-${index}`,
    icon: '',
    description: opt.label,
    categoryId: 'VehicleFleet',
    render: () => <VehicleFleetReports report={opt.label} />,
  }));

  const routeStopSubCategories = RouteStopReportMap.map((opt, index) => ({
    name: opt.label,
    id: `RouteStop-${opt.label.replace(/\s+/g, '-')}-${index}`,
    icon: '',
    description: opt.label,
    categoryId: 'RouteStop',
    render: () => <RouteStopReports report={opt.label} />,
  }));

  const driverStaffSubCategories = DriverStaffReportMap.map((opt, index) => ({
    name: opt.label,
    id: `DriverStaff-${opt.label.replace(/\s+/g, '-')}-${index}`,
    icon: '',
    description: opt.label,
    categoryId: 'DriverStaff',
    render: () => <DriverStaffReports report={opt.label} />,
  }));

  const studentTransportSubCategories = StudentTransportReportMap.map((opt, index) => ({
    name: opt.label,
    id: `StudentTransport-${opt.label.replace(/\s+/g, '-')}-${index}`,
    icon: '',
    description: opt.label,
    categoryId: 'StudentTransport',
    render: () => <StudentTransportReports report={opt.label} />,
  }));

  const feeAccountingSubCategories = FeeAccountingReportMap.map((opt, index) => ({
    name: opt.label,
    id: `FeeAccounting-${opt.label.replace(/\s+/g, '-')}-${index}`,
    icon: '',
    description: opt.label,
    categoryId: 'FeeAccounting',
    render: () => <FeeAccountingReports report={opt.label} />,
  }));

  const safetyEquipmentSubCategories = SafetyEquipmentReportMap.map((opt, index) => ({
    name: opt.label,
    id: `SafetyEquipment-${opt.label.replace(/\s+/g, '-')}-${index}`,
    icon: '',
    description: opt.label,
    categoryId: 'SafetyEquipment',
    render: () => <SafetyEquipmentReports report={opt.label} />,
  }));

  const attendanceTripSubCategories = AttendanceTripReportMap.map((opt, index) => ({
    name: opt.label,
    id: `AttendanceTrip-${opt.label.replace(/\s+/g, '-')}-${index}`,
    icon: '',
    description: opt.label,
    categoryId: 'AttendanceTrip',
    render: () => <AttendanceTripReports report={opt.label} />,
  }));

  const administrativeAuditSubCategories = AdministrativeAuditReportMap.map((opt, index) => ({
    name: opt.label,
    id: `AdministrativeAudit-${opt.label.replace(/\s+/g, '-')}-${index}`,
    icon: '',
    description: opt.label,
    categoryId: 'AdministrativeAudit',
    render: () => <AdministrativeAuditReports report={opt.label} />,
  }));

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <CustomBreadcrumbs
        heading="Generate Reports"
        links={[
          { name: 'Dashboard', href: '/dashboard' },
          { name: 'Transport', href: '/transport' },
          { name: 'Generate Reports' },
        ]}
        isBack={addReportDialog?.value}
        onBack={() => {
          addReportDialog?.onFalse();
        }}
      />

      <CommonReport
        categories={categories}
        subCategories={[
          ...vehicleFleetSubCategories,
          ...routeStopSubCategories,
          ...driverStaffSubCategories,
          ...studentTransportSubCategories,
          ...feeAccountingSubCategories,
          ...safetyEquipmentSubCategories,
          ...attendanceTripSubCategories,
          ...administrativeAuditSubCategories,
        ]}
      />
    </Box>
  );
};

export default TransportReportScreen;
