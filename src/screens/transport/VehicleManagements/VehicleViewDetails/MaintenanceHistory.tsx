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
  useGetmaintenanceDataQuery,
  useGetrouteHistoryDataQuery,
  useGetdriverHistoryDataQuery,
} from 'src/redux/transport/vehicle-management/vehicleDocumentDataApi';

// Tab Components
const RouteHistory = () => {
  const { data: routeHistoryData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetrouteHistoryDataQuery,
  });

  return (
    <CustomizableTable
      tableId="route-history-table"
      noDataText="No Route Records Found"
      isFilter={false}
      isLoading={isLoading}
      columns={[
        {
          id: 'routeName',
          label: 'Name',
          align: 'left',
          minWidth: '150px',
        },
        {
          id: 'locationPoint',
          label: 'Location Point',
          align: 'left',
          minWidth: '180px',
        },
        {
          id: 'driver',
          label: 'Driver',
          align: 'left',
          minWidth: '150px',
        },
        {
          id: 'stops',
          label: 'Stops',
          align: 'left',
          minWidth: '80px',
        },
        {
          id: 'status',
          label: 'Status',
          align: 'left',
          minWidth: '120px',
          render: (value: 'Current' | 'Completed') => (
            <Label color={value === 'Current' ? 'info' : 'success'}>{value}</Label>
          ),
        },
      ]}
      data={routeHistoryData || []}
    />
  );
};
const DriverHistory = () => {
  const { data: driverHistoryData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetdriverHistoryDataQuery,
  });

  return (
    <CustomizableTable
      tableId="driver-history-table"
      noDataText="No Driver Records Found"
      isFilter={false}
      isLoading={isLoading}
      columns={[
        {
          id: 'driverName',
          label: 'Name',
          align: 'left',
          minWidth: '150px',
        },
        {
          id: 'licenseNo',
          label: 'License No',
          align: 'left',
          minWidth: '150px',
        },
        {
          id: 'experience',
          label: 'Experience',
          align: 'left',
          minWidth: '120px',
        },
        {
          id: 'route',
          label: 'Route',
          align: 'left',
          minWidth: '150px',
        },
        {
          id: 'status',
          label: 'Status',
          align: 'left',
          minWidth: '120px',
          render: (value: 'Active' | 'Inactive') => (
            <Label color={value === 'Active' ? 'success' : 'error'}>{value}</Label>
          ),
        },
      ]}
      data={driverHistoryData || []}
    />
  );
};
const MaintenanceHistoryTable = () => {
  const { data: maintenanceHistoryData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetmaintenanceDataQuery,
  });

  return (
    <CustomizableTable
      tableId="maintenance-history-table"
      noDataText="No Maintenance Records Found"
      isFilter={false}
      isLoading={isLoading}
      columns={[
        {
          id: 'date',
          label: 'Date',
          align: 'left',
          minWidth: '120px',
        },
        {
          id: 'serviceType',
          label: 'Service Type',
          align: 'left',
          minWidth: '180px',
        },
        {
          id: 'cost',
          label: 'Cost',
          align: 'left',
          minWidth: '120px',
          render: (value) => `₹ ${value.toLocaleString()}`,
        },
        {
          id: 'nextDue',
          label: 'Next Due',
          align: 'left',
          minWidth: '120px',
        },
      ]}
      data={maintenanceHistoryData || []}
    />
  );
};
// Tab Configuration
const TABS = [
  {
    value: 'route',
    label: 'Route History',
    icon: <Iconify icon="mdi:map-marker-path" />,
    component: RouteHistory,
  },
  {
    value: 'driver',
    label: 'Driver/Conductor History',
    icon: <Iconify icon="mdi:account-group" />,
    component: DriverHistory,
  },
  {
    value: 'maintenance',
    label: 'Maintenance History',
    icon: <Iconify icon="mdi:wrench" />,
    component: MaintenanceHistoryTable,
  },
];

const MaintenanceHistory = () => {
  const tabs = useTabs('route');

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

export default MaintenanceHistory;
