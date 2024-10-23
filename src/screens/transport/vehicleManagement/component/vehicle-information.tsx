import React from 'react';

import CustomizableTable from 'src/components/customizabaleTable';

interface VehicleInformationProps {
  vehicleData: any;
}

interface MaintenanceRecord {
  vehicleNumber: string; // Vehicle information
  serviceDetails: string; // Details of the service
  nextScheduledMaintenance: string; // Next scheduled maintenance date
}

// Example maintenance records for vehicles
interface MaintenanceRecord {
  vehicleNumber: string; // Vehicle information
  serviceDetails: string; // Details of the service
  maintenanceDate: string; // Date of maintenance performed
  nextScheduledMaintenance: string; // Next scheduled maintenance date
}

// Example maintenance records for vehicles
const maintenanceRecords: MaintenanceRecord[] = [
  {
    vehicleNumber: 'V001',
    serviceDetails: 'Oil change, tire rotation, brake inspection',
    maintenanceDate: '2024-06-10',
    nextScheduledMaintenance: '2024-12-15',
  },
  {
    vehicleNumber: 'V002',
    serviceDetails: 'Full service, transmission check, coolant flush',
    maintenanceDate: '2024-05-20',
    nextScheduledMaintenance: '2024-11-30',
  },
  {
    vehicleNumber: 'V003',
    serviceDetails: 'Brake pad replacement, battery check',
    maintenanceDate: '2024-03-15',
    nextScheduledMaintenance: '2024-10-20',
  },
  {
    vehicleNumber: 'V004',
    serviceDetails: 'Engine tune-up, filter replacement',
    maintenanceDate: '2024-01-25',
    nextScheduledMaintenance: '2025-01-10',
  },
  {
    vehicleNumber: 'V005',
    serviceDetails: 'Tire replacement, alignment check',
    maintenanceDate: '2024-07-08',
    nextScheduledMaintenance: '2024-09-05',
  },
];

const columnData = [
  { id: 'vehicleNumber', label: 'Vehicle Number' },
  { id: 'dateOfMaintenance', label: 'Date Of Maintenance' },
  { id: 'serviceDetails', label: 'Service Details' },
  { id: 'nextScheduledMaintenance', label: 'Next Schedule Maintenance' },
];

const VehicleInformation: React.FC<VehicleInformationProps> = ({ vehicleData }) => {
  const data = [];
  // console.log("vehicleData",vehicleData)
  return <CustomizableTable data={maintenanceRecords} columns={columnData} />;
};

export default VehicleInformation;
