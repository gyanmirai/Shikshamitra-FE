import type { RootState } from 'src/redux/store';
import type { LabelColor } from 'src/components/label';

import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { CustomTabs } from 'src/components/custom-tabs';
import { FormSlider } from 'src/components/form-slider';
import { useSearchParam } from 'src/hooks/use-search-param';
import { Tab, Card, Tooltip, IconButton } from '@mui/material';
import CustomizableTable from 'src/components/customizabaleTable';
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
  useGetRouteHistoryQuery,
  useGetDriverHistoryQuery,
  useGetVehicleDocumentsQuery,
  useGetMaintenanceRecordsQuery,
  useLazyDownloadVehicleDocumentQuery,
} from 'src/redux/transport/vehicle-management/vehicle-management-api';

// Tab Components
const RouteHistory = ({ vehicleId }: { vehicleId: string }) => {
  const academicMediumId = useSelector((state: RootState) => state.globalState.currentMedium?.id);
  const { data, isLoading } = useGetRouteHistoryQuery(
    { vehicleId, academicMediumId, pageNumber: 1, pageSize: 100 },
    { skip: !vehicleId || !academicMediumId }
  );

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
      data={data?.data || []}
    />
  );
};
const DriverHistory = ({ vehicleId }: { vehicleId: string }) => {
  const academicMediumId = useSelector((state: RootState) => state.globalState.currentMedium?.id);
  const { data, isLoading } = useGetDriverHistoryQuery(
    { vehicleId, academicMediumId, pageNumber: 1, pageSize: 100 },
    { skip: !vehicleId || !academicMediumId }
  );

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
            const color = DriverStatusTypeColor[value as DriverStatusType] as LabelColor;
            return <Label color={color}>{DriverStatusType[value]}</Label>;
          },
        },
      ]}
      data={data?.data || []}
    />
  );
};
const DocumentDetailsTable = ({ vehicleId }: { vehicleId: string }) => {
  const academicMediumId = useSelector((state: RootState) => state.globalState.currentMedium?.id);
  const { data, isLoading } = useGetVehicleDocumentsQuery(
    { vehicleId, academicMediumId },
    { skip: !vehicleId || !academicMediumId }
  );
  const [downloadVehicleDocument, { isFetching: isDownloading }] =
    useLazyDownloadVehicleDocumentQuery();

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
                onClick={async () => {
                  if (row.status !== 'Uploaded' || !academicMediumId) {
                    return;
                  }

                  const blob = await downloadVehicleDocument({
                    vehicleId,
                    documentId: row.id,
                    academicMediumId,
                  }).unwrap();
                  const url = URL.createObjectURL(blob);
                  window.open(url, '_blank');
                  window.setTimeout(() => URL.revokeObjectURL(url), 10000);
                }}
              >
                <Iconify icon={isDownloading ? 'eos-icons:loading' : 'carbon:view-filled'} />
              </IconButton>
            );
          },
        },
      ]}
      data={data || []}
    />
  );
};

const MaintenanceHistoryTable = ({ vehicleId }: { vehicleId: string }) => {
  const academicMediumId = useSelector((state: RootState) => state.globalState.currentMedium?.id);
  const { data, isLoading } = useGetMaintenanceRecordsQuery(
    { vehicleId, academicMediumId, pageNumber: 1, pageSize: 100 },
    { skip: !vehicleId || !academicMediumId }
  );

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
            return Array.isArray(value) ? value.join(', ') : value || '-';
          },
        },
        {
          id: 'cost',
          label: 'Cost',
          align: 'left',
          minWidth: '120px',
          filterType: 'number',
          render: (value) => `Rs. ${Number(value || 0).toLocaleString()}`,
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
      data={data?.data || []}
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

interface MaintenanceHistoryProps {
  vehicleId: string;
}

const MaintenanceHistory = ({ vehicleId }: MaintenanceHistoryProps) => {
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
          {currentActiveComponent && <currentActiveComponent.component vehicleId={vehicleId} />}
        </Scrollbar>
      </FormSlider>
    </>
  );
};

export default MaintenanceHistory;
