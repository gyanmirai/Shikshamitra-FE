import { Box } from '@mui/system';
import { useTabs } from 'src/hooks/use-tabs';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Tab, Card, Tooltip } from '@mui/material';
import { Scrollbar } from 'src/components/scrollbar';
import { CustomTabs } from 'src/components/custom-tabs';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import {
  useGetmaintenanceDataQuery,
  useGetrouteHistoryDataQuery,
  useGetdriverHistoryDataQuery,
  useGetdocumentDetailsDataQuery,
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
const DocumentDetailsTable = () => {
  const { data: documentRows, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetdocumentDetailsDataQuery,
  });

  return (
    <CustomizableTable
      tableId="vehicle-documents"
      noDataText={<>No document data available.</>}
      isFilter={false}
      isLoading={isLoading}
      columns={[
        { id: 'name', label: 'Name', align: 'left', isFilter: false },
        {
          id: 'status',
          label: 'Status',
          minWidth: '80px',
          isSort: false,
          align: 'left',
          isFilter: false,
          render(value, row) {
            return (
              <Tooltip title={row.status}>
                <Iconify
                  icon={row.status === 'Uploaded' ? 'mdi:approve' : 'mage:file-cross-fill'}
                  height={20}
                  width={20}
                  sx={{
                    color: (theme) =>
                      row.status === 'Uploaded' ? 'success.main' : theme.vars.palette.grey[500],
                  }}
                />
              </Tooltip>
            );
          },
        },
      ]}
      data={documentRows || []}
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
    value: 'documentDetails',
    label: 'Document Details',
    icon: <Iconify icon="mdi:file-document-outline" />,
    component: DocumentDetailsTable,
  },
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
    label: 'Maintenance Records',
    icon: <Iconify icon="mdi:wrench" />,
    component: MaintenanceHistoryTable,
  },
];

const MaintenanceHistory = () => {
  const tabs = useTabs('documentDetails');

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
