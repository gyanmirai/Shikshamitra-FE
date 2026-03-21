'use client';

import { Label } from 'src/components/label';
import { Box, Card, Typography } from '@mui/material';
import CustomizableTable from 'src/components/customizable-table';

type RouteType = 'Pickup' | 'Drop' | 'Both';
type RouteStatus = 'On Time' | 'Delayed' | 'Not Started' | 'Completed' | 'Maintenance';

interface RouteRow {
  id: number;
  routeName: string;
  routeType: RouteType;
  driver: string;
  vehicleNo: string;
  studentCount: number;
  startTime: string;
  status: RouteStatus;
}

const ROUTE_DATA: RouteRow[] = [
  {
    id: 1,
    routeName: 'R-01 Satellite',
    routeType: 'Both',
    driver: 'Anil Mehta',
    vehicleNo: 'GJ 01 JK 7700',
    studentCount: 44,
    startTime: '07:15 AM',
    status: 'On Time',
  },
  {
    id: 2,
    routeName: 'R-02 Vastrapur',
    routeType: 'Pickup',
    driver: 'Dinesh Rao',
    vehicleNo: 'GJ 01 PQ 4455',
    studentCount: 38,
    startTime: '07:05 AM',
    status: 'On Time',
  },
  {
    id: 3,
    routeName: 'R-03 Bopal',
    routeType: 'Both',
    driver: 'Mahesh Trivedi',
    vehicleNo: 'GJ 01 EF 8899',
    studentCount: 48,
    startTime: '07:00 AM',
    status: 'On Time',
  },
  {
    id: 4,
    routeName: 'R-04 Maninagar',
    routeType: 'Drop',
    driver: 'Kamlesh Joshi',
    vehicleNo: 'GJ 01 RS 6677',
    studentCount: 32,
    startTime: '02:30 PM',
    status: 'Not Started',
  },
  {
    id: 5,
    routeName: 'R-05 Prahlad Nagar',
    routeType: 'Both',
    driver: 'Suresh Patel',
    vehicleNo: 'GJ 01 CD 2244',
    studentCount: 30,
    startTime: '07:30 AM',
    status: 'Delayed',
  },
  {
    id: 6,
    routeName: 'R-06 Naroda',
    routeType: 'Pickup',
    driver: 'Bharat Solanki',
    vehicleNo: 'GJ 01 TU 8800',
    studentCount: 52,
    startTime: '07:25 AM',
    status: 'On Time',
  },
  {
    id: 7,
    routeName: 'R-07 Thaltej',
    routeType: 'Both',
    driver: '—',
    vehicleNo: 'GJ 01 MN 3344',
    studentCount: 36,
    startTime: '07:20 AM',
    status: 'Not Started',
  },
  {
    id: 8,
    routeName: 'R-08 Nikol',
    routeType: 'Drop',
    driver: 'Ramesh Nair',
    vehicleNo: 'GJ 01 VW 9911',
    studentCount: 28,
    startTime: '02:30 PM',
    status: 'Not Started',
  },
  {
    id: 9,
    routeName: 'R-09 Gota',
    routeType: 'Both',
    driver: 'Vikram Shah',
    vehicleNo: 'GJ 01 GH 5521',
    studentCount: 0,
    startTime: '06:55 AM',
    status: 'Completed',
  },
  {
    id: 10,
    routeName: 'R-10 Chandlodia',
    routeType: 'Pickup',
    driver: 'Paresh Modi',
    vehicleNo: 'GJ 01 XY 1122',
    studentCount: 40,
    startTime: '07:35 AM',
    status: 'Delayed',
  },
  {
    id: 11,
    routeName: 'R-11 Ranip',
    routeType: 'Both',
    driver: '—',
    vehicleNo: 'GJ 01 AB 3300',
    studentCount: 34,
    startTime: '07:10 AM',
    status: 'Maintenance',
  },
  {
    id: 12,
    routeName: 'R-12 Chandkheda',
    routeType: 'Both',
    driver: 'Rajesh Kumar',
    vehicleNo: 'GJ 01 AB 1123',
    studentCount: 42,
    startTime: '07:10 AM',
    status: 'On Time',
  },
];

const STATUS_COLOR: Record<RouteStatus, 'success' | 'error' | 'default' | 'info' | 'warning'> = {
  'On Time': 'success',
  Delayed: 'error',
  'Not Started': 'default',
  Completed: 'info',
  Maintenance: 'warning',
};

const ROUTE_TYPE_COLOR: Record<RouteType, 'primary' | 'warning' | 'success'> = {
  Pickup: 'primary',
  Drop: 'warning',
  Both: 'success',
};

const RouteManagementTable = () => {
  const columns = [
    {
      id: 'routeName',
      label: 'Route Name',
      sticky: true,
      stickyPosition: 'left' as const,
      align: 'left' as const,
      render: (value: string) => (
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {value}
        </Typography>
      ),
    },
    {
      id: 'driver',
      label: 'Driver',
      align: 'left' as const,
      render: (value: string) => (
        <Typography variant="body2" sx={{ color: value === '—' ? 'error.main' : 'text.primary' }}>
          {value}
        </Typography>
      ),
    },
    {
      id: 'vehicleNo',
      label: 'Vehicle No.',
      align: 'left' as const,
      render: (value: string) => (
        <Typography variant="body2" sx={{ color: 'text.secondary', fontFamily: 'monospace' }}>
          {value}
        </Typography>
      ),
    },
    {
      id: 'studentCount',
      label: 'Students',
      align: 'left' as const,
      render: (value: number) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Typography variant="body2">{value}</Typography>
        </Box>
      ),
    },
    {
      id: 'startTime',
      label: 'Start Time',
      align: 'left' as const,
      render: (value: string) => (
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {value}
        </Typography>
      ),
    },
    {
      id: 'routeType',
      label: 'Type',
      align: 'left' as const,
      render: (value: RouteType) => <Label color={ROUTE_TYPE_COLOR[value]}>{value}</Label>,
    },
    {
      id: 'status',
      label: 'Status',
      align: 'left' as const,
      render: (value: RouteStatus) => <Label color={STATUS_COLOR[value]}>{value}</Label>,
    },
  ];

  return (
    <Card sx={{ p: 2 }}>
      <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
        Route Management Table
      </Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        Manage your transport routes and track student attendance
      </Typography>
      <CustomizableTable
        columns={columns}
        data={ROUTE_DATA}
        tableId="transport-route-management"
        isSearch
        isFilter
        isPagination
      />
    </Card>
  );
};

export default RouteManagementTable;
