import type { EmployeeDashboardData } from 'src/redux/hr/employeeApi';

import { Box } from '@mui/material';
import { fNumber, fPercent } from 'src/utils/format-number';
import { DashboardCard } from 'src/components/dashboard-card/dashboard-card';

import {
  formatDashboardDate,
  formatEmployeeLeaveBalance,
  employeeDashboardStatusCopy,
  describeEmployeeLeaveBalance,
} from '../employee-dashboard-utils';

export const employeeMetricGridSx = {
  display: 'grid',
  gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', md: 'repeat(4, minmax(0, 1fr))' },
  gap: 1.5,
  '@media (max-width: 359.95px)': { gridTemplateColumns: 'minmax(0, 1fr)' },
};

const EmployeeProfileOverview = ({ data }: { data: EmployeeDashboardData }) => {
  const status = employeeDashboardStatusCopy[data.todayStatus];
  const cards = [
    {
      id: 'today-status',
      icon: 'solar:user-check-rounded-outline',
      title: "Today's status",
      value: status.label,
      color: status.color,
      bgColor: status.background,
      description: formatDashboardDate(data.date, {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
      textValue: true,
    },
    {
      id: 'attendance-percent',
      icon: 'solar:chart-square-outline',
      title: 'Attendance',
      value:
        data.attendancePercentage == null ? 'Not available' : fPercent(data.attendancePercentage),
      color: 'info.main',
      bgColor: 'info.lighter',
      description: `${fNumber(data.recordedAttendanceDays)} recorded ${data.recordedAttendanceDays === 1 ? 'day' : 'days'}${data.academicYearName ? ` · ${data.academicYearName}` : ''}`,
      textValue: data.attendancePercentage == null,
    },
    {
      id: 'leave-balance',
      icon: 'solar:calendar-outline',
      title: 'Leave balance',
      value: formatEmployeeLeaveBalance(data),
      color: 'primary.main',
      bgColor: 'primary.lighter',
      description: describeEmployeeLeaveBalance(data),
      textValue: !data.isLeaveBalanceAvailable || data.leaveBalanceDays == null,
    },
    {
      id: 'pending-requests',
      icon: 'solar:bell-bing-outline',
      title: 'Pending leave requests',
      value: fNumber(data.pendingLeaveRequests),
      color: data.pendingLeaveRequests > 0 ? 'warning.main' : 'text.secondary',
      bgColor: data.pendingLeaveRequests > 0 ? 'warning.lighter' : 'action.hover',
      description:
        data.pendingLeaveRequests > 0 ? 'Awaiting a decision' : 'No requests awaiting a decision',
      textValue: false,
    },
  ];

  return (
    <Box sx={employeeMetricGridSx} data-testid="staff-dashboard-metrics">
      {cards.map((card) => (
        <DashboardCard
          key={card.id}
          density="compact"
          icon={card.icon}
          title={card.title}
          value={card.value}
          color={card.color}
          bgColor={card.bgColor}
          description={card.description}
          valueTypographyProps={{
            component: 'p',
            sx: card.textValue ? { fontSize: '0.875rem' } : undefined,
          }}
        />
      ))}
    </Box>
  );
};

export default EmployeeProfileOverview;
