'use client';

import React from 'react';
import { Grid } from '@mui/material';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { EmployeeDashboardCard } from 'src/screens/hr/dashboard/dashboard';

const TransportDashboardScreen = () => (
  // const [selectedMonth, setSelectedMonth] = useState<{
  //   monthName: string;
  //   days: number;
  // }>({ monthName: 'January', days: 31 });

  <>
    <CustomBreadcrumbs
      heading="Dashboard"
      links={[{ name: 'Transport' }, { name: 'Dashboard' }]}
      sx={{ px: 1, mb: 2 }}
      description="This dashboard provides a daily overview of your transportation activity, including total stops, and more."
    />
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <EmployeeDashboardCard
          title="Total Vehicle"
          icon="tdesign:vehicle"
          value={40}
          labels={[
            { name: 'Operational: 30', color: 'success' },
            { name: 'Maintenance Required: 5', color: 'warning' },
            { name: 'Available: 5', color: 'info' },
          ]}
          color="primary.main"
          href="/transport/vehicle-management"
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <EmployeeDashboardCard
          title="Total Travellers"
          icon="pepicons-print:people"
          value={98}
          labels={[
            { name: 'Employee: 9', color: 'success' },
            { name: 'Student: 89', color: 'secondary' },
          ]}
          color="primary.main"
          href="/transport/member-transport/?tab=assignedRoute"
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <EmployeeDashboardCard
          title="Total Stops"
          icon="noto:bus-stop"
          value={98}
          labels={[
            { name: 'Busiest: Madhuram', color: 'success' },
            { name: 'Quiet: Navjeevan', color: 'secondary' },
          ]}
          color="primary.main"
          href="/transport/member-transport/?tab=assignedRoute"
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <EmployeeDashboardCard
          title="Total Driver"
          icon="healthicons:truck-driver"
          value={9}
          labels={[
            { name: 'Fourty Plus : 3', color: 'success' },
            { name: 'Thirty Plus :5', color: 'secondary' },
            { name: 'Fifty Plus : 1', color: 'info' },
          ]}
          color="primary.main"
          href="/transport/member-transport/?tab=assignedRoute"
        />
      </Grid>
    </Grid>

    {/* <Grid item xs={6} md={6} pt="20px">
        <ChartWithTwoDropDown
          annotationPoint={Array.from({ length: selectedMonth.days }, (_, i) =>
            i % 2 === 0 ? 'late' : 'onTime'
          )}

          monthFromComponent={(data) => {
            setSelectedMonth(data);
          }}
          title="Vehicle Runing Statistics"
          subheader="Statistics Of Vehicle Runing Over Time"
          chart={{
            series: [
              {
                vehicleName: 'Vehicle 1',
                durations: [
                  {
                    name: 'Daily',
                    categories: Array.from({ length: selectedMonth.days }, (_, i) =>
                      (i + 1).toString()
                    ),
                    series: [
                      {
                        name: 'Kilometers Run',
                        data: Array.from(
                          { length: selectedMonth.days },
                          () => Math.floor(Math.random() * 100) + 50
                        ),
                      },
                      {
                        name: 'Fuel Used (L)',
                        data: Array.from(
                          { length: selectedMonth.days },
                          () => Math.floor(Math.random() * 10) + 50
                        ),
                      },
                    ],
                  },

                  {
                    name: 'Monthly',
                    categories: [
                      'Jan',
                      'Feb',
                      'Mar',
                      'Apr',
                      'May',
                      'Jun',
                      'Jul',
                      'Aug',
                      'Sep',
                      'Oct',
                      'Nov',
                      'Dec',
                    ],
                    series: [
                      {
                        name: 'Kilometers Run',
                        data: [
                          6000, 4000, 2000, 1000, 1800, 2000, 2000, 4000, 2000, 1000, 1800, 2000,
                        ],
                      },
                      {
                        name: 'Fuel Used (L)',
                        data: [200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200],
                      },
                    ],
                  },

                ],
              },
              {
                vehicleName: 'Vehicle 2',
                durations: [
                  {
                    name: 'Daily',
                    categories: Array.from({ length: selectedMonth.days }, (_, i) =>
                      (i + 1).toString()
                    ),
                    series: [
                      {
                        name: 'Kilometers Run',
                        data: Array.from(
                          { length: selectedMonth.days },
                          () => Math.floor(Math.random() * 100) + 50
                        ),
                      },
                    ],
                  },

                  {
                    name: 'Monthly',
                    categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
                    series: [
                      {
                        name: 'Kilometers Run',
                        data: [480, 570, 520, 620, 600, 680, 660, 700, 670],
                      },

                    ],
                  },

                ],
              },
            ],
          }}
        />
      </Grid> */}
  </>
);
export default TransportDashboardScreen;
