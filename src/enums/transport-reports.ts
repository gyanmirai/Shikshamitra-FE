export enum TransportReportCategory {
  VehicleFleet = 'Vehicle & Fleet Reports',
  RouteStop = 'Route & Stop Reports',
  DriverStaff = 'Driver & Staff Reports',
  StudentTransport = 'Student Transport Reports',
  FeeAccounting = 'Fee & Accounting Reports',
  SafetyEquipment = 'Safety Equipment Status Report',
  AttendanceTrip = 'Attendance & Trip Reports',
  AdministrativeAudit = 'Administrative & Audit Reports',
}

export enum TransportReportTitle {
  // 1. Vehicle & Fleet Reports
  VehicleMaster = 'Vehicle Master Report',
  VehicleAvailabilityStatus = 'Vehicle Availability Status Report',
  VehicleFitnessInspection = 'Vehicle Fitness & Inspection Report',
  VehicleFuelConsumption = 'Vehicle Fuel Consumption Report',
  VehicleMileage = 'Vehicle Mileage Report',
  VehicleInsuranceExpiry = 'Vehicle Insurance Expiry Report',
  VehiclePollutionCertificateExpiry = 'Vehicle Pollution Certificate Expiry Report',
  VehiclePermitStatus = 'Vehicle Permit Status Report',
  VehicleMaintenanceSchedule = 'Vehicle Maintenance Schedule Report',
  VehicleBreakdownLog = 'Vehicle Breakdown Log Report',
  VehicleRepairServiceHistory = 'Vehicle Repair & Service History Report',
  VehicleTyreReplacement = 'Vehicle Tyre Replacement Report',

  // 2. Route & Stop Reports
  RouteMaster = 'Route Master Report',
  RouteWiseStudentAllocation = 'Route-wise Student Allocation Report',
  RouteCapacityUtilization = 'Route Capacity Utilization Report',
  BusStopMaster = 'Bus Stop Master Report',
  PickupDropRouteTiming = 'Pickup & Drop Route Timing Report',
  RouteDistanceFuelEstimate = 'Route Distance & Fuel Estimate Report',

  // 3. Driver & Staff Reports
  DriverMaster = 'Driver Master Report',
  ConductorAssistantMaster = 'Conductor / Assistant Master Report',
  DriverAttendance = 'Driver Attendance Report',
  DriverLicenseExpiry = 'Driver License Expiry Report',
  DriverBackgroundVerification = 'Driver Background Verification Report',
  DriverPerformanceIncident = 'Driver Performance & Incident Report',

  // 4. Student Transport Reports
  TransportRegisteredStudentsList = 'Transport Registered Students List',
  NonTransportStudentsList = 'Non-Transport Students List',
  ClassWiseTransportStudentList = 'Class-wise Transport Student List',
  StudentPickupDropChangeRequest = 'Student Pickup/Drop Change Request Report',
  TransportIDCardRegister = 'Transport ID Card Register Report',
  StudentTransportCancellation = 'Student Transport Cancellation Report',
  NewTransportEnrolment = 'New Transport Enrolment Report',

  // 5. Fee & Accounting Reports
  TransportFeeCollection = 'Transport Fee Collection Report',
  TransportFeePending = 'Transport Fee Pending Report',
  RouteWiseTransportFee = 'Route-wise Transport Fee Report',
  RefundAdjustment = 'Refund & Adjustment Report',
  FeeDefaultersListTransport = 'Fee Defaulters List – Transport',

  // 6. Safety Equipment Status Report
  GPSTracking = 'GPS Tracking Report',
  BusSpeedViolation = 'Bus Speed Violation Report',
  UnauthorizedRouteChange = 'Unauthorized Route Change Report',
  EmergencyAlertPanicButtonLogs = 'Emergency Alert / Panic Button Logs',
  CCTVWorking = 'CCTV Working Report',
  SafetyEquipmentStatus = 'Safety Equipment Status Report',

  // 7. Attendance & Trip Reports
  DailyTrip = 'Daily Trip Report (Morning/Evening)',
  StudentTransportAttendance = 'Student Transport Attendance Report',
  DriverTripAttendance = 'Driver Trip Attendance Report',
  BusLoadingUnloading = 'Bus Loading/Unloading Report',
  MissedPickupDrop = 'Missed Pickup/Drop Report',
  TripDelayIncidentLog = 'Trip Delay / Incident Log Report',

  // 8. Administrative & Audit Reports
  TransportActivityLog = 'Transport Activity Log Report',
  TransportAudit = 'Transport Audit Report',
  MonthlyTransportationSummary = 'Monthly Transportation Summary Report',
  TransportCostAnalysis = 'Transport Cost Analysis Report',
  TransportPerformanceDashboard = 'Transport Performance Dashboard Report',
}

export const VehicleFleetReportMap = [
  { label: TransportReportTitle.VehicleMaster, value: TransportReportTitle.VehicleMaster },
  {
    label: TransportReportTitle.VehicleAvailabilityStatus,
    value: TransportReportTitle.VehicleAvailabilityStatus,
  },
  {
    label: TransportReportTitle.VehicleFitnessInspection,
    value: TransportReportTitle.VehicleFitnessInspection,
  },
  {
    label: TransportReportTitle.VehicleFuelConsumption,
    value: TransportReportTitle.VehicleFuelConsumption,
  },
  { label: TransportReportTitle.VehicleMileage, value: TransportReportTitle.VehicleMileage },
  {
    label: TransportReportTitle.VehicleInsuranceExpiry,
    value: TransportReportTitle.VehicleInsuranceExpiry,
  },
  {
    label: TransportReportTitle.VehiclePollutionCertificateExpiry,
    value: TransportReportTitle.VehiclePollutionCertificateExpiry,
  },
  {
    label: TransportReportTitle.VehiclePermitStatus,
    value: TransportReportTitle.VehiclePermitStatus,
  },
  {
    label: TransportReportTitle.VehicleMaintenanceSchedule,
    value: TransportReportTitle.VehicleMaintenanceSchedule,
  },
  {
    label: TransportReportTitle.VehicleBreakdownLog,
    value: TransportReportTitle.VehicleBreakdownLog,
  },
  {
    label: TransportReportTitle.VehicleRepairServiceHistory,
    value: TransportReportTitle.VehicleRepairServiceHistory,
  },
  {
    label: TransportReportTitle.VehicleTyreReplacement,
    value: TransportReportTitle.VehicleTyreReplacement,
  },
];

export const RouteStopReportMap = [
  { label: TransportReportTitle.RouteMaster, value: TransportReportTitle.RouteMaster },
  {
    label: TransportReportTitle.RouteWiseStudentAllocation,
    value: TransportReportTitle.RouteWiseStudentAllocation,
  },
  {
    label: TransportReportTitle.RouteCapacityUtilization,
    value: TransportReportTitle.RouteCapacityUtilization,
  },
  { label: TransportReportTitle.BusStopMaster, value: TransportReportTitle.BusStopMaster },
  {
    label: TransportReportTitle.PickupDropRouteTiming,
    value: TransportReportTitle.PickupDropRouteTiming,
  },
  {
    label: TransportReportTitle.RouteDistanceFuelEstimate,
    value: TransportReportTitle.RouteDistanceFuelEstimate,
  },
];

export const DriverStaffReportMap = [
  { label: TransportReportTitle.DriverMaster, value: TransportReportTitle.DriverMaster },
  {
    label: TransportReportTitle.ConductorAssistantMaster,
    value: TransportReportTitle.ConductorAssistantMaster,
  },
  { label: TransportReportTitle.DriverAttendance, value: TransportReportTitle.DriverAttendance },
  {
    label: TransportReportTitle.DriverLicenseExpiry,
    value: TransportReportTitle.DriverLicenseExpiry,
  },
  {
    label: TransportReportTitle.DriverBackgroundVerification,
    value: TransportReportTitle.DriverBackgroundVerification,
  },
  {
    label: TransportReportTitle.DriverPerformanceIncident,
    value: TransportReportTitle.DriverPerformanceIncident,
  },
];

export const StudentTransportReportMap = [
  {
    label: TransportReportTitle.TransportRegisteredStudentsList,
    value: TransportReportTitle.TransportRegisteredStudentsList,
  },
  {
    label: TransportReportTitle.NonTransportStudentsList,
    value: TransportReportTitle.NonTransportStudentsList,
  },
  {
    label: TransportReportTitle.ClassWiseTransportStudentList,
    value: TransportReportTitle.ClassWiseTransportStudentList,
  },
  {
    label: TransportReportTitle.StudentPickupDropChangeRequest,
    value: TransportReportTitle.StudentPickupDropChangeRequest,
  },
  {
    label: TransportReportTitle.TransportIDCardRegister,
    value: TransportReportTitle.TransportIDCardRegister,
  },
  {
    label: TransportReportTitle.StudentTransportCancellation,
    value: TransportReportTitle.StudentTransportCancellation,
  },
  {
    label: TransportReportTitle.NewTransportEnrolment,
    value: TransportReportTitle.NewTransportEnrolment,
  },
];

export const FeeAccountingReportMap = [
  {
    label: TransportReportTitle.TransportFeeCollection,
    value: TransportReportTitle.TransportFeeCollection,
  },
  {
    label: TransportReportTitle.TransportFeePending,
    value: TransportReportTitle.TransportFeePending,
  },
  {
    label: TransportReportTitle.RouteWiseTransportFee,
    value: TransportReportTitle.RouteWiseTransportFee,
  },
  { label: TransportReportTitle.RefundAdjustment, value: TransportReportTitle.RefundAdjustment },
  {
    label: TransportReportTitle.FeeDefaultersListTransport,
    value: TransportReportTitle.FeeDefaultersListTransport,
  },
];

export const SafetyEquipmentReportMap = [
  { label: TransportReportTitle.GPSTracking, value: TransportReportTitle.GPSTracking },
  { label: TransportReportTitle.BusSpeedViolation, value: TransportReportTitle.BusSpeedViolation },
  {
    label: TransportReportTitle.UnauthorizedRouteChange,
    value: TransportReportTitle.UnauthorizedRouteChange,
  },
  {
    label: TransportReportTitle.EmergencyAlertPanicButtonLogs,
    value: TransportReportTitle.EmergencyAlertPanicButtonLogs,
  },
  { label: TransportReportTitle.CCTVWorking, value: TransportReportTitle.CCTVWorking },
  {
    label: TransportReportTitle.SafetyEquipmentStatus,
    value: TransportReportTitle.SafetyEquipmentStatus,
  },
];

export const AttendanceTripReportMap = [
  { label: TransportReportTitle.DailyTrip, value: TransportReportTitle.DailyTrip },
  {
    label: TransportReportTitle.StudentTransportAttendance,
    value: TransportReportTitle.StudentTransportAttendance,
  },
  {
    label: TransportReportTitle.DriverTripAttendance,
    value: TransportReportTitle.DriverTripAttendance,
  },
  {
    label: TransportReportTitle.BusLoadingUnloading,
    value: TransportReportTitle.BusLoadingUnloading,
  },
  { label: TransportReportTitle.MissedPickupDrop, value: TransportReportTitle.MissedPickupDrop },
  {
    label: TransportReportTitle.TripDelayIncidentLog,
    value: TransportReportTitle.TripDelayIncidentLog,
  },
];

export const AdministrativeAuditReportMap = [
  {
    label: TransportReportTitle.TransportActivityLog,
    value: TransportReportTitle.TransportActivityLog,
  },
  { label: TransportReportTitle.TransportAudit, value: TransportReportTitle.TransportAudit },
  {
    label: TransportReportTitle.MonthlyTransportationSummary,
    value: TransportReportTitle.MonthlyTransportationSummary,
  },
  {
    label: TransportReportTitle.TransportCostAnalysis,
    value: TransportReportTitle.TransportCostAnalysis,
  },
  {
    label: TransportReportTitle.TransportPerformanceDashboard,
    value: TransportReportTitle.TransportPerformanceDashboard,
  },
];
