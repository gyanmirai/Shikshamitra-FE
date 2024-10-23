import dayjs from 'dayjs';
import React, { useState } from 'react';

import { Box, Button, MenuItem, MenuList } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { Iconify } from 'src/components/iconify';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import TransportMaintenanceDialog from './transport-maintenance-dialog';

interface MaintenanceRecord {
  vehicleNumber?: string;
  serviceDetails: string;
  maintenanceDate: string;
  nextScheduledMaintenance: string;
  id: number;
}

const initialMaintenanceRecords: MaintenanceRecord[] = [
  {
    vehicleNumber: 'V001',
    serviceDetails: 'Oil change, tire rotation, brake inspection',
    maintenanceDate: '06-10-2024',
    nextScheduledMaintenance: '15-12-2024',
    id: 1,
  },
  {
    vehicleNumber: 'V002',
    serviceDetails: 'Full service, transmission check, coolant flush',
    maintenanceDate: '02-05-2024',
    nextScheduledMaintenance: '30-11-2024',
    id: 2,
  },
  {
    vehicleNumber: 'V003',
    serviceDetails: 'Brake pad replacement, battery check',
    maintenanceDate: '15-03-2024',
    nextScheduledMaintenance: '20-10-2024',
    id: 3,
  },
  {
    vehicleNumber: 'V004',
    serviceDetails: 'Engine tune-up, filter replacement',
    maintenanceDate: '25-01-2025',
    nextScheduledMaintenance: '10-01-2025',
    id: 4,
  },
  {
    vehicleNumber: 'V005',
    serviceDetails: 'Tire replacement, alignment check',
    maintenanceDate: '08-10-2024',
    nextScheduledMaintenance: '05-09-2024',
    id: 5,
  },
];

interface VehicleMaintenanceRecordsProps {
  vehicleData: any;
}

const VehicleMaintenanceRecords: React.FC<VehicleMaintenanceRecordsProps> = ({ vehicleData }) => {
  const dialog = useBoolean();
  const [isEdit, setIsEdit] = useState(false);
  const [tableData, setTableData] = useState<MaintenanceRecord[]>(initialMaintenanceRecords);
  const [selectedMaintenance, setSelectedMaintenance] = useState<any>(null);

  const closeDialog = () => {
    setIsEdit(false);
    dialog.onFalse();
  };

  const handleDelete = (data: MaintenanceRecord) => {
    const updatedEntries = tableData.filter((val) => val.id !== data.id);
    setTableData(updatedEntries);
  };

  const handleSave = (dataFromDialog: any) => {
    const { dateOfMaintenance, nextScheduleMaintenance, id, serviceDetails } = dataFromDialog;
    const formattedMaintenanceDate = dayjs(dateOfMaintenance).format('DD-MM-YYYY');
    const formattednextScheduledMaintenance = dayjs(nextScheduleMaintenance).format('DD-MM-YYYY');

    // console.log("formattedMaintenanceDate", formattedMaintenanceDate)
    // console.log("formattednextScheduledMaintenance", formattednextScheduledMaintenance)
    // console.log("maintenanceDate", maintenanceDate)
    // console.log("fnextScheduledMaintenance", nextScheduleMaintenance)

    if (isEdit) {
      const existingIndex = tableData.findIndex((val) => val.id === id);
      if (existingIndex !== -1) {
        const updatedData = tableData.map((val, index) =>
          index === existingIndex
            ? {
                ...val,
                maintenanceDate: formattedMaintenanceDate,
                nextScheduledMaintenance: formattednextScheduledMaintenance,
                serviceDetails,
              }
            : val
        );
        setTableData(updatedData);
        closeDialog();
        return;
      }
    }

    const newMaintenanceRecord: MaintenanceRecord = {
      maintenanceDate: formattedMaintenanceDate,
      nextScheduledMaintenance: formattednextScheduledMaintenance,
      serviceDetails,
      id: Math.random(),
      // vehicleNumber: "",
    };

    const updatedData: MaintenanceRecord[] = [...tableData, newMaintenanceRecord];
    setTableData(updatedData);
    closeDialog();
  };

  const columnData = [
    { id: 'maintenanceDate', label: 'Date Of Maintenance' },
    { id: 'serviceDetails', label: 'Service Details' },
    { id: 'nextScheduledMaintenance', label: 'Next Scheduled Maintenance' },
    {
      id: 'action',
      label: 'Action',
      render(value: any, row: any) {
        return (
          <ThreeDotsActions
            actions={({ popover }: any) => (
              <MenuList>
                <MenuItem
                  onClick={() => {
                    setIsEdit(true);
                    setSelectedMaintenance(row);
                    dialog.onTrue();
                  }}
                >
                  <Iconify icon="solar:pen-bold" />
                  Edit
                </MenuItem>
                <MenuItem onClick={() => handleDelete(row)}>
                  <Iconify icon="solar:trash-bin-trash-bold" />
                  Delete
                </MenuItem>
              </MenuList>
            )}
          />
        );
      },
    },
  ];

  return (
    <>
      <CustomizableTable data={tableData} columns={columnData} />
      <Box py="20px" display="flex" flexDirection="row" justifyContent="flex-end">
        <Button
          variant="contained"
          size="small"
          onClick={() => {
            setIsEdit(false);
            setSelectedMaintenance(null);
            dialog.onTrue();
          }}
        >
          Add New Record
        </Button>
      </Box>
      {dialog.value && (
        <TransportMaintenanceDialog
          onSave={handleSave}
          dialogValue={dialog.value}
          onClose={closeDialog}
          data={selectedMaintenance}
          isEdit={isEdit}
          allData={tableData}
        />
      )}
    </>
  );
};

export default VehicleMaintenanceRecords;
