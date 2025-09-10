import React, { useState } from 'react';
import { Grid, Select, MenuItem, Typography } from '@mui/material';
import { BankingBalanceStatistics } from 'src/sections/overview/banking/banking-balance-statistics';

const VehicleStatistics = () => {
  const [selectedVehicle, setSelectedVehicle] = useState<any>('Vehicle 1');
  const [selectedDuration, setSelectedDuration] = useState<any>('Monthly');

  const handleVehicleChange = (event: any) => {
    setSelectedVehicle(event.target.value);
  };

  const handleDurationChange = (event: any) => {
    setSelectedDuration(event.target.value);
  };

  const data: any = [
    {
      name: 'Weekly',
      categories: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'],
      data: [
        { name: 'Kilometers Run', data: [120, 150, 140, 130, 125] },
        { name: 'Fuel Used (L)', data: [10, 12, 11, 10, 9] },
        { name: 'Fuel Cost ($)', data: [50, 60, 55, 50, 45] },
      ],
    },
    {
      name: 'Monthly',
      categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
      data: [
        { name: 'Kilometers Run', data: [500, 600, 550, 650, 620, 700, 680, 720, 690] },
        { name: 'Fuel Used (L)', data: [40, 48, 44, 52, 50, 56, 54, 58, 55] },
        { name: 'Fuel Cost ($)', data: [200, 240, 220, 260, 250, 280, 270, 290, 275] },
      ],
    },
    {
      name: 'Yearly',
      categories: ['2018', '2019', '2020', '2021', '2022', '2023'],
      data: [
        { name: 'Kilometers Run', data: [6000, 7200, 6800, 7500, 7400, 7700] },
        { name: 'Fuel Used (L)', data: [480, 576, 544, 600, 592, 616] },
        { name: 'Fuel Cost ($)', data: [2400, 2880, 2720, 3000, 2960, 3080] },
      ],
    },
  ];

  const chartData = data;

  return (
    <Grid container spacing={3}>
      {/* Dropdowns */}
      <Grid size={12}>
        <Typography variant="h6">Select Vehicle and Duration</Typography>
        <Grid container spacing={2}>
          <Grid size={6}>
            <Select fullWidth value={selectedVehicle} onChange={handleVehicleChange} displayEmpty>
              <MenuItem value="Vehicle 1">Vehicle 1</MenuItem>
              <MenuItem value="Vehicle 2">Vehicle 2</MenuItem>
              <MenuItem value="Vehicle 3">Vehicle 3</MenuItem>
              {/* Add more vehicles as needed */}
            </Select>
          </Grid>
          <Grid size={6}>
            <Select fullWidth value={selectedDuration} onChange={handleDurationChange} displayEmpty>
              <MenuItem value="Weekly">Weekly</MenuItem>
              <MenuItem value="Monthly">Monthly</MenuItem>
              <MenuItem value="Yearly">Yearly</MenuItem>
            </Select>
          </Grid>
        </Grid>
      </Grid>

      {/* Chart */}
      <Grid size={{ xs: 12, md: 6 }}>
        <BankingBalanceStatistics
          title={`${selectedVehicle} - ${selectedDuration} Statistics`}
          subheader={`Details for ${selectedDuration}`}
          chart={{
            // categories: chartData.categories,
            series: chartData,
          }}
        />
      </Grid>
    </Grid>
  );
};

export default VehicleStatistics;
