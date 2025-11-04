import type { LabelColor } from 'src/components/label';

import { useMemo, useState } from 'react';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { CustomTabs } from 'src/components/custom-tabs';
import { useSearchParam } from 'src/hooks/use-search-param';
import { Tab, Card, Tooltip, IconButton } from '@mui/material';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { FormSlider } from 'src/screens/student/enrollment/register/register-form';
import {
  VehicleRouteType,
  VehicleRouteTypeColor,
  VehicleRouteTypeOptions,
} from 'src/enums/VehicleRouteType';
import {
  DriverStatusType,
  DriverStatusTypeColor,
  DriverStatusTypeOptions,
} from 'src/enums/driver-status-enum';
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
          sticky: true,
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
          id: 'conductorName',
          label: 'Conductor',
          align: 'left',
          minWidth: '150px',
        },
        {
          id: 'stops',
          label: 'Stops',
          align: 'left',
          minWidth: '80px',
          filterType: 'number',
        },
        {
          id: 'status',
          label: 'Status',
          align: 'left',
          sticky: true,
          minWidth: 80,
          filterType: 'enum',
          enumOptions: VehicleRouteTypeOptions,
          render: (value) => {
            const color = VehicleRouteTypeColor[value as VehicleRouteType] as LabelColor;
            return <Label color={color}>{VehicleRouteType[value]}</Label>;
          },
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
          sticky: true,
        },
        {
          id: 'licenseNo',
          label: 'License No',
          align: 'left',
          minWidth: '150px',
          filterType: 'number',
        },
        {
          id: 'assignedDate',
          label: 'Assigned Date',
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
          sticky: true,
          minWidth: 80,
          filterType: 'enum',
          enumOptions: DriverStatusTypeOptions,
          render: (value) => {
            const color = DriverStatusTypeColor[value as VehicleRouteType] as LabelColor;
            return <Label color={color}>{DriverStatusType[value]}</Label>;
          },
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
        {
          id: 'view',
          label: 'View',
          isFilter: false,
          isSort: false,
          minWidth: '6vw',
          align: 'left',
          render(value, row) {
            return (
              <IconButton
                style={{
                  textAlign: 'left',
                  marginLeft: '0px',
                  justifyContent: 'flex-start',
                  display: 'flex',
                }}
                disabled={row.status !== 'Uploaded'}
                onClick={() => {
                  if (row.file) {
                    window.open(URL.createObjectURL(row.file), '_blank');
                  }
                }}
              >
                <Iconify icon="carbon:view-filled" />
              </IconButton>
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
          filterType: 'date',
        },
        {
          id: 'serviceType',
          label: 'Servicing Type',
          align: 'left',
          minWidth: '180px',
          render(value, row) {
            return value.join(', ');
          },
        },
        {
          id: 'cost',
          label: 'Cost',
          align: 'left',
          minWidth: '120px',
          filterType: 'number',
          render: (value) => `₹ ${value.toLocaleString()}`,
        },
        {
          id: 'description',
          label: 'Remarks',
          align: 'left',
          minWidth: '180px',
        },
        {
          id: 'nextDue',
          label: 'Next Due',
          align: 'left',
          minWidth: '120px',
          filterType: 'date',
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
  const [searchParams, setSearchParams] = useSearchParam({ tab: 'documentDetails' });

  const currentIndex = useMemo(
    () => TABS.findIndex((tab) => tab.value === searchParams?.tab),
    [searchParams.tab]
  );
  const [isBackClick, setIsBackClick] = useState(false);
  const currentActiveComponent = useMemo(
    () => TABS.find((tab) => tab.value === searchParams?.tab),
    [searchParams.tab]
  );
  return (
    <>
      {/* Tabs */}
      <Card
        sx={{
          '& *': { fontSize: '13px !important', '& svg': { fontSize: '18px !important' } },
        }}
      >
        <CustomTabs
          value={searchParams.tab}
          onChange={(e, value) => {
            const newIndex = TABS.findIndex((tab) => tab.value === value);
            if (currentIndex > newIndex) {
              setIsBackClick(true);
            } else {
              setIsBackClick(false);
            }
            setSearchParams({ tab: value });
          }}
          sx={{ '& .MuiTabs-flexContainer': { gap: 1.5 } }}
          role="tablist"
        >
          {TABS.map((tab) => (
            <Tab key={tab.value} value={tab.value} label={tab.label} icon={tab.icon} />
          ))}
        </CustomTabs>
      </Card>

      {/* Tab Content */}

      <FormSlider
        steps={TABS}
        isBackClick={isBackClick}
        step={currentIndex}
        containerProps={{
          sx: {
            p: 0,
          },
        }}
      >
        <Scrollbar sx={{ p: 1 }}>
          {currentActiveComponent && <currentActiveComponent.component />}
        </Scrollbar>
      </FormSlider>
    </>
  );
};

export default MaintenanceHistory;
