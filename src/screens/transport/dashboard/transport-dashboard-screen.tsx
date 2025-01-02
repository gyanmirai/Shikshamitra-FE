'use client';

import React, { useState } from 'react';

import { Grid, useTheme } from '@mui/material';

import { EmployeeDashboardCard } from 'src/screens/hr/dashboard/dashboard';

import { ChartWithTwoDropDown } from 'src/components/chart-with-two-dropdown';

const vehicleTableData = [
  {
    id: 'V1',
    status: 'Operational', // The current status of the vehicle
    location: '2nd Avenue', // The current location of the vehicle
    lastMaintenance: '15th Dec', // The date of the last maintenance
    fuelLevel: '75%', // The current fuel level of the vehicle
  },
  {
    id: 'V2',
    status: 'Maintenance Required',
    location: '5th Street',
    lastMaintenance: '12th Dec',
    fuelLevel: '50%',
  },
  {
    id: 'V3',
    status: 'Available',
    location: '7th Avenue',
    lastMaintenance: 'N/A', // No maintenance due
    fuelLevel: '80%',
  },
];

const driverTableData = [
  {
    id: 'D1',
    status: 'Active', // Current status of the driver (Active, On Leave, etc.)
    assignedVehicle: 'V1', // Vehicle assigned to the driver
    availability: 'Shift A', // Driver's shift schedule or availability
    incidents: 'None', // Number of incidents involving the driver
  },
  {
    id: 'D2',
    status: 'On Leave',
    assignedVehicle: '-', // No vehicle assigned as the driver is on leave
    availability: '-',
    incidents: '1 (Accident)', // An incident logged for the driver
  },
];

const routeTableData = [
  {
    id: 'R1',
    status: 'Active', // The current status of the route (Active, Delayed, Completed, etc.)
    driver: 'D1', // Driver assigned to the route
    vehicle: 'V1', // Vehicle assigned to the route
    tripsToday: 3, // Number of trips scheduled for today
  },
  {
    id: 'R2',
    status: 'Delayed',
    driver: 'D2',
    vehicle: 'V2',
    tripsToday: 1,
  },
];

const TransportDashboardScreen = () => {
  const theme = useTheme();
  const [selectedMonth, setSelectedMonth] = useState<{
    monthName: string;
    days: number;
  }>({ monthName: 'January', days: 31 });

  const generateDailyData = (year: number, month: string) => {
    // Helper to determine leap year
    const isLeapYear = () => (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;

    // Days in each month
    const monthsWithDays = [
      { month: 'January', days: 31 },
      { month: 'February', days: isLeapYear() ? 29 : 28 },
      { month: 'March', days: 31 },
      { month: 'April', days: 30 },
      { month: 'May', days: 31 },
      { month: 'June', days: 30 },
      { month: 'July', days: 31 },
      { month: 'August', days: 31 },
      { month: 'September', days: 30 },
      { month: 'October', days: 31 },
      { month: 'November', days: 30 },
      { month: 'December', days: 31 },
    ];

    // Find the days for the selected month
    const monthDetails = monthsWithDays.find((m) => m.month === month);

    if (!monthDetails) {
      throw new Error(`Invalid month: ${month}`);
    }

    // Generate categories (days of the month)
    const categories = Array.from({ length: monthDetails.days }, (_, i) => (i + 1).toString());
    return { name: `Daily Metrics for ${month}`, categories };
  };

  return (
    <>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
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

        <Grid item xs={12} sm={6} md={3}>
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

        <Grid item xs={12} sm={6} md={3}>
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

        <Grid item xs={12} sm={6} md={3}>
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

      <Grid item xs={6} md={6} pt="20px">
        <ChartWithTwoDropDown
          annotationPoint={Array.from({ length: selectedMonth.days }, (_, i) =>
            i % 2 === 0 ? 'late' : 'onTime'
          )}
          // annotationPointForMonth={[
          //   { name: "January", late: 5, onTime: 20 },
          //   { name: "February", late: 7, onTime: 18 },
          //   { name: "March", late: 2, onTime: 15 },
          //   { name: "April", late: 4, onTime: 17 },
          //   { name: "May", late: 6, onTime: 22 },
          //   { name: "June", late: 3, onTime: 19 },
          //   { name: "July", late: 8, onTime: 16 },
          //   { name: "August", late: 9, onTime: 14 },
          //   { name: "September", late: 5, onTime: 21 },
          //   { name: "October", late: 10, onTime: 12 },
          //   { name: "November", late: 3, onTime: 18 },
          //   { name: "December", late: 4, onTime: 20 }
          // ]}
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
                  // {
                  //   name: 'Yearly',
                  //   categories: ['2018', '2019', '2020', '2021', '2022', '2023'],
                  //   series: [
                  //     { name: 'Kilometers Run', data: [6000, 7200, 6800, 7500, 7400, 7700] },
                  //     // { name: 'Fuel Used (L)', data: [480, 576, 544, 600, 592, 616] },
                  //     // { name: 'Fuel Cost (₹)', data: [2400, 2880, 2720, 3000, 2960, 3080] },
                  //   ],
                  // },
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
                  // {
                  //   name: 'Weekly',
                  //   categories: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'],
                  //   series: [
                  //     { name: 'Kilometers Run', data: [110, 140, 130, 120, 115] },
                  //     // { name: 'Fuel Used (L)', data: [9, 11, 10, 9, 8] },
                  //     // { name: 'Fuel Cost (₹)', data: [45, 55, 50, 45, 40] },
                  //   ],
                  // },
                  {
                    name: 'Monthly',
                    categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
                    series: [
                      {
                        name: 'Kilometers Run',
                        data: [480, 570, 520, 620, 600, 680, 660, 700, 670],
                      },
                      // { name: 'Fuel Used (L)', data: [38, 46, 40, 50, 48, 54, 52, 56, 53] },
                      // {
                      //   name: 'Fuel Cost (₹)',
                      //   data: [190, 230, 200, 250, 240, 270, 260, 280, 265],
                      // },
                    ],
                  },
                  // {
                  //   name: 'Yearly',
                  //   categories: ['2018', '2019', '2020', '2021', '2022', '2023'],
                  //   series: [
                  //     { name: 'Kilometers Run', data: [5800, 7000, 6600, 7300, 7200, 7500] },
                  //     // { name: 'Fuel Used (L)', data: [460, 560, 520, 580, 570, 600] },
                  //     // { name: 'Fuel Cost (₹)', data: [2300, 2800, 2600, 2900, 2850, 3000] },
                  //   ],
                  // },
                ],
              },
            ],
          }}
        />
      </Grid>

      {/* <Grid item xs={12} md={12}>
        <VehicleStatistics />
      </Grid> */}

      {/* <Grid xs={12} md={6} sx={{ pt: "20px", pb: "20px" }}>
        <Card sx={{ p: 3, boxShadow: 'var(--shadows-4)', height: '100%' }}>
          <Typography variant="h6">Year Wise Student Strength</Typography>
          <Chart
            type="area"
            series={[
              {
                name: 'Total Students',
                data: [120, 135, 142, 160, 175, 180, 190, 205, 215, 220, 225, 230],
              },
            ]}
            options={{
              chart: {
                type: 'area',
                height: 320,

              },
              xaxis: {
                categories: [
                  '2013',
                  '2014',
                  '2015',
                  '2016',
                  '2017',
                  '2018',
                  '2019',
                  '2020',
                  '2021',
                  '2022',
                  '2023',
                  '2024',
                ],
                title: { text: 'Year' },
              },
              yaxis: {
                title: { text: 'Number of Students' },
              },
              // dataLabels: {
              //   enabled: false,
              // },
              // stroke: {
              //   curve: 'smooth',
              // },
              // colors: ['#3f51b5'],
              // grid: {
              //   borderColor: '#e7e7e7',
              // },
              // tooltip: {
              //   theme: 'light',
              // },
            }}
            height={320}
            loadingProps={{ sx: { p: 2.5 } }}
            sx={{ py: 2.5, pl: 1, pr: 2.5 }}
          />
        </Card>
      </Grid> */}
      {/* <StopWiseHeatmap /> */}
      {/* <Grid xs={12} md={12} sx={{ pt: "20px", pb: "20px" }}>
        <Heatmap />
      </Grid> */}
    </>
  );
};

export default TransportDashboardScreen;
