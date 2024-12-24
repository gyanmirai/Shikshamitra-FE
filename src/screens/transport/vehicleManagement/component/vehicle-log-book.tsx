import React, { useState } from 'react';

import { useBoolean } from 'src/hooks/use-boolean';

import CustomizableTable from 'src/components/customizabaleTable';

import TransportDailyVehicleDialog from './dialog/daily-inspection-dialog';

const vehicleLogBook = [
  {
    date: '2024-10-01',
    fuel: 'Full',
    oil: 'Good',
    defectReport: 'None',
    dateOfRepair: null,
    repaired: 'N/A',
    preTrip: '10:00 AM',
    postTrip: '5:00 PM',
  },
  {
    date: '2024-10-02',
    fuel: 'Half',
    oil: 'Low',
    defectReport: 'Oil change needed',
    dateOfRepair: '2024-10-03',
    repaired: "John's Garage",
    preTrip: '9:30 AM',
    postTrip: '4:30 PM',
  },
  {
    date: '2024-10-03',
    fuel: 'Quarter',
    oil: 'Good',
    defectReport: 'Brake issue reported',
    dateOfRepair: '2024-10-04',
    repaired: "Mike's Mechanics",
    preTrip: '10:15 AM',
    postTrip: '6:00 PM',
  },
  {
    date: '2024-10-04',
    fuel: 'Full',
    oil: 'Good',
    defectReport: 'None',
    dateOfRepair: null,
    repaired: 'N/A',
    preTrip: '10:00 AM',
    postTrip: '5:00 PM',
  },
  {
    date: '2024-10-05',
    fuel: 'Full',
    oil: 'Good',
    defectReport: 'Tire pressure low',
    dateOfRepair: '2024-10-06',
    repaired: 'Auto Repair Shop',
    preTrip: '9:45 AM',
    postTrip: '4:15 PM',
  },
  {
    date: '2024-10-06',
    fuel: 'Full',
    oil: 'Good',
    defectReport: 'None',
    dateOfRepair: null,
    repaired: 'N/A',
    preTrip: '10:00 AM',
    postTrip: '5:00 PM',
  },
  {
    date: '2024-10-07',
    fuel: 'Three-quarters',
    oil: 'Good',
    defectReport: 'Windshield wiper issue',
    dateOfRepair: '2024-10-08',
    repaired: 'City Garage',
    preTrip: '10:05 AM',
    postTrip: '5:30 PM',
  },
];

const columnData = [
  { id: 'date', label: 'Date' },
  { id: 'fuel', label: 'Fuel Level' },
  { id: 'oil', label: 'Oil Status' },
  { id: 'defectReport', label: 'Defect Report' },
  { id: 'dateOfRepair', label: 'Date of Repair' },
  { id: 'repaired', label: 'Repaired' },
  { id: 'preTrip', label: 'Pre-Trip Inspection' },
  { id: 'postTrip', label: 'Post-Trip Inspection' },
];

interface VehicleLogBookProps {
  vehicle: any;
}

const VehicleLogBook: React.FC<VehicleLogBookProps> = ({ vehicle }) => {
  const dialog = useBoolean();
  const [isEdit, setIsEdit] = useState(false);
  const [tableData, setTableData] = useState(vehicleLogBook);
  const [selectedMaintenance, setSelectedMaintenance] = useState<any>(null);

  const closeDialog = () => {
    setIsEdit(false);
    dialog.onFalse();
  };
  const handleSave = () => {};

  // const handleDelete = (data: MaintenanceRecord) => {
  //   const updatedEntries = tableData.filter((val) => val.id !== data.id);
  //   setTableData(updatedEntries);
  // };
  return (
    <>
      {/* <Box py="20px" display="flex" flexDirection="row" justifyContent="flex-end">
        <Button
          variant="contained"
          size="small"
          onClick={() => {
            setIsEdit(false);
            setSelectedMaintenance(null);
            dialog.onTrue();
          }}
        >
          Daily Vehicle Inspection
        </Button>
      </Box> */}
      <CustomizableTable data={tableData} columns={columnData} />
      {dialog.value && (
        <TransportDailyVehicleDialog
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

export default VehicleLogBook;
