import type { EmployeeDashboardData } from 'src/redux/hr/employeeApi';

import dayjs from 'dayjs';
import { Grid } from '@mui/material';
import { DashboardCard } from 'src/components/dashboard-card/dashboard-card';

import {
  formatUpcomingHolidayDate,
  formatEmployeeLeaveBalance,
  employeeDashboardStatusCopy,
} from '../employee-dashboard-utils';

// ----------------------------------------------------------------------

const EmployeeProfileOverview = ({ data }: { data: EmployeeDashboardData }) => {
  const status = employeeDashboardStatusCopy[data.todayStatus];
  const cards = [
    {
      id: 'today-status',
      icon: 'solar:user-check-rounded-outline',
      title: "Today's Status",
      count: status.label,
      color: status.color,
      bgColor: status.background,
      description: dayjs(data.date).format('ddd, DD MMM YYYY'),
    },
    {
      id: 'attendance-percent',
      icon: 'solar:chart-square-outline',
      title: 'Attendance %',
      count: data.attendancePercentage == null ? '—' : `${data.attendancePercentage}%`,
      color: 'info.main',
      bgColor: 'info.lighter',
      description: `${data.recordedAttendanceDays} recorded day${
        data.recordedAttendanceDays === 1 ? '' : 's'
      }`,
    },
    {
      id: 'leave-balance',
      icon: 'solar:calendar-outline',
      title: 'Leave Balance',
      count: formatEmployeeLeaveBalance(data),
      color: 'primary.main',
      bgColor: 'primary.lighter',
      description: data.isLeaveBalanceAvailable
        ? 'Current accrued balance'
        : 'No active leave policy',
    },
    {
      id: 'pending-requests',
      icon: 'solar:bell-bing-outline',
      title: 'Pending Requests',
      count: data.pendingLeaveRequests,
      color: 'warning.main',
      bgColor: 'warning.lighter',
      description: 'Awaiting a decision',
    },
    {
      id: 'upcoming-holiday',
      icon: 'solar:star-outline',
      title: 'Upcoming Holiday',
      count: formatUpcomingHolidayDate(data.upcomingHoliday, data.date),
      color: 'secondary.main',
      bgColor: 'secondary.lighter',
      description: data.upcomingHoliday?.name ?? 'No upcoming holiday',
    },
  ];

  return (
    <Grid container spacing={2}>
      {cards.map((card) => (
        <Grid key={card.id} size={{ xs: 12, sm: 6, lg: 2.4 }}>
          <DashboardCard
            icon={card.icon}
            title={card.title}
            value={card.count}
            color={card.color}
            bgColor={card.bgColor}
            description={card.description}
          />
        </Grid>
      ))}
    </Grid>
  );
};

export default EmployeeProfileOverview;
