import React from 'react';
import { Grid, Typography } from '@mui/material';

// Define color scale for density
const colorScale = [
  { range: [0, 10], color: '#FFF5CC' },
  { range: [11, 20], color: '#FFE08A' },
  { range: [21, 30], color: '#FFD966' },
  { range: [31, Infinity], color: '#FFC107' }, // Darker for higher density
];

const heatmapData = [
  {
    name: 'Stop 1',
    data: [20], // Student count
  },
  {
    name: 'Stop 2',
    data: [15],
  },
  {
    name: 'Stop 3',
    data: [30],
  },
  // Add more stops as needed
  {
    name: 'Stop 4',
    data: [22],
  },
  {
    name: 'Stop 5',
    data: [18],
  },
  {
    name: 'Stop 6',
    data: [25],
  },
  {
    name: 'Stop 7',
    data: [33],
  },
  {
    name: 'Stop 8',
    data: [29],
  },
  {
    name: 'Stop 9',
    data: [27],
  },
  {
    name: 'Stop 10',
    data: [19],
  },
  {
    name: 'Stop 11',
    data: [24],
  },
  {
    name: 'Stop 12',
    data: [30],
  },
  {
    name: 'Stop 13',
    data: [21],
  },
  {
    name: 'Stop 14',
    data: [28],
  },
  {
    name: 'Stop 15',
    data: [35],
  },
  {
    name: 'Stop 16',
    data: [31],
  },
  {
    name: 'Stop 17',
    data: [26],
  },
  {
    name: 'Stop 18',
    data: [20],
  },
  {
    name: 'Stop 19',
    data: [15],
  },
  {
    name: 'Stop 20',
    data: [22],
  },
  {
    name: 'Stop 21',
    data: [18],
  },
  {
    name: 'Stop 22',
    data: [25],
  },
  {
    name: 'Stop 23',
    data: [33],
  },
  {
    name: 'Stop 24',
    data: [29],
  },
  {
    name: 'Stop 25',
    data: [27],
  },
  {
    name: 'Stop 26',
    data: [19],
  },
  {
    name: 'Stop 27',
    data: [24],
  },
  {
    name: 'Stop 28',
    data: [30],
  },
  {
    name: 'Stop 29',
    data: [21],
  },
  {
    name: 'Stop 30',
    data: [28],
  },
  {
    name: 'Stop 31',
    data: [35],
  },
  {
    name: 'Stop 32',
    data: [31],
  },
  {
    name: 'Stop 33',
    data: [26],
  },
  {
    name: 'Stop 34',
    data: [20],
  },
  {
    name: 'Stop 35',
    data: [15],
  },
  {
    name: 'Stop 36',
    data: [22],
  },
  {
    name: 'Stop 37',
    data: [18],
  },
  {
    name: 'Stop 38',
    data: [25],
  },
  {
    name: 'Stop 39',
    data: [33],
  },
  {
    name: 'Stop 40',
    data: [29],
  },
  {
    name: 'Stop 41',
    data: [27],
  },
  {
    name: 'Stop 42',
    data: [19],
  },
  {
    name: 'Stop 43',
    data: [24],
  },
  {
    name: 'Stop 44',
    data: [30],
  },
  {
    name: 'Stop 45',
    data: [21],
  },
  {
    name: 'Stop 46',
    data: [28],
  },
  {
    name: 'Stop 47',
    data: [35],
  },
  {
    name: 'Stop 48',
    data: [31],
  },
  {
    name: 'Stop 49',
    data: [26],
  },
  {
    name: 'Stop 50',
    data: [20],
  },
];

const getColorForDensity = (count: any) => {
  // eslint-disable-next-line no-restricted-syntax
  for (const scale of colorScale) {
    if (count >= scale.range[0] && count <= scale.range[1]) {
      return scale.color;
    }
  }
  return '#FFF';
};

const Heatmap = () => (
  <Grid container spacing={1}>
    {heatmapData.map((stop, index) => (
      <Grid
        size={{ xs: 2, sm: 1 }}
        key={index}
        style={{
          backgroundColor: getColorForDensity(stop.data[0]),
          padding: '10px',
          textAlign: 'center',
        }}
      >
        <Typography variant="body2">{stop.name}</Typography>
      </Grid>
    ))}
  </Grid>
);

export default Heatmap;
