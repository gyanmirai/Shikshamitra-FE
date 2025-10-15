import React from 'react';
import { Box } from '@mui/system';
import { Tab, Card } from '@mui/material';
import { useTabs } from 'src/hooks/use-tabs';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { CustomTabs } from 'src/components/custom-tabs';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import {
  useGetVehicleHistoryQuery,
  useGetDriverConductorHistoryQuery,
} from 'src/redux/transport/vehicle-management/route-management-api';

// Tab Components
const VehicleHistory = () => {
  const { data: mockVehicleHistory, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetVehicleHistoryQuery,
  });
  console.log('🚀 ~ VehicleHistory ~ mockDriverConductorHistory:', mockVehicleHistory);

  return (
    <CustomizableTable
      tableId="vehicle-history-table"
      noDataText="No Vehicle Records Found"
      isFilter={false}
      isLoading={isLoading}
      columns={[
        {
          id: 'busNo',
          label: 'Bus No.',
          align: 'left',
          minWidth: '150px',
          sticky: true,
        },
        {
          id: 'driverName',
          label: 'Driver Name',
          align: 'left',
          minWidth: '150px',
        },
        {
          id: 'assignedDate',
          label: 'Assigned Date',
          align: 'left',
          minWidth: '140px',
        },
        {
          id: 'unassignedDate',
          label: 'Unassigned Date',
          align: 'left',
          minWidth: '160px',
        },
        {
          id: 'totalStudents',
          label: 'Total Students',
          align: 'left',
          minWidth: '140px',
        },
        {
          id: 'status',
          label: 'Status',
          align: 'left',
          minWidth: '100px',
          sticky: true,
          render: (value: 'Active' | 'Replaced') => (
            <Label color={value === 'Active' ? 'success' : 'default'}>{value}</Label>
          ),
        },
      ]}
      data={mockVehicleHistory || []}
    />
  );
};

const DriverConductorHistoryTable = () => {
  const { data: mockDriverConductorHistory, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetDriverConductorHistoryQuery,
  });

  return (
    <CustomizableTable
      tableId="driver-conductor-history-table"
      noDataText="No Driver/Conductor Records Found"
      isFilter={false}
      isLoading={isLoading}
      columns={[
        {
          id: 'driverName',
          label: 'Driver Name',
          align: 'left',
          minWidth: '150px',
          sticky: true,
        },
        {
          id: 'role',
          label: 'Role',
          align: 'left',
          minWidth: '100px',
        },
        {
          id: 'contactNo',
          label: 'Contact No.',
          align: 'left',
          minWidth: '140px',
        },
        {
          id: 'vehicleNo',
          label: 'Vehicle No.',
          align: 'left',
          minWidth: '130px',
        },
        {
          id: 'assignedFrom',
          label: 'Assigned From',
          align: 'left',
          minWidth: '140px',
        },
        {
          id: 'assignedTo',
          label: 'Assigned To',
          align: 'left',
          minWidth: '120px',
        },
        {
          id: 'totalTrips',
          label: 'Total Trips',
          align: 'left',
          minWidth: '120px',
        },
        {
          id: 'status',
          label: 'Status',
          align: 'left',
          minWidth: '100px',
          sticky: true,
          render: (value: 'Active' | 'Replaced') => (
            <Label color={value === 'Active' ? 'success' : 'default'}>{value}</Label>
          ),
        },
      ]}
      data={mockDriverConductorHistory || []}
    />
  );
};

// Tab Configuration
const TABS = [
  {
    value: 'vehicleHistory',
    label: 'Vehicle History',
    icon: <Iconify icon="mdi:bus" />,
    component: VehicleHistory,
  },
  {
    value: 'driverConductorHistory',
    label: 'Driver/Conductor History',
    icon: <Iconify icon="mdi:account-group" />,
    component: DriverConductorHistoryTable,
  },
];

const DriverConductorHistory = () => {
  const tabs = useTabs('vehicleHistory');

  const CurrentComponent = TABS.find((tab) => tab.value === tabs.value)?.component;

  return (
    <>
      {/* Tabs */}
      <Card
        sx={{
          '& *': { fontSize: '13px !important', '& svg': { fontSize: '18px !important' } },
        }}
      >
        <CustomTabs
          value={tabs.value}
          onChange={tabs.onChange}
          sx={{ '& .MuiTabs-flexContainer': { gap: 1.5 } }}
          role="tablist"
        >
          {TABS.map((tab) => (
            <Tab key={tab.value} value={tab.value} label={tab.label} icon={tab.icon} />
          ))}
        </CustomTabs>
      </Card>

      {/* Tab Content */}
      <Box>
        <Scrollbar sx={{ p: 1 }}>{CurrentComponent && <CurrentComponent />}</Scrollbar>
      </Box>
    </>
  );
};

export default DriverConductorHistory;
