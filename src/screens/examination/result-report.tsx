import React from 'react';
import { Iconify } from 'src/components/iconify';
import { fNumber } from 'src/utils/format-number';
import { Chart, useChart } from 'src/components/chart';
import CustomSelect from 'src/components/custom-select';
import { Box, Grid, Button, Typography } from '@mui/material';
import CustomizableTable from 'src/components/customizabaleTable';

const ResultReport = () => (
  <Box>
    <Grid container spacing={1}>
      <Grid size={{ xs: 12, md: 6 }}>
        <PerformanceOverview
          title="Performance Overview"
          // subheader="(+43%) than last year"
          selectSeries="pass"
          chart={{
            categories: ['Math', 'English', 'Gujarati', 'Science', 'Social Science', 'Hindi'],
            series: [
              { name: 'Pass', data: [44, 55, 41, 67, 22, 43] },
              { name: 'Fail', data: [13, 23, 20, 8, 13, 27] },
            ],
          }}
        />
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <Box display="flex" gap={1} mb={2} flexWrap="wrap">
          <CustomSelect
            label="sort by"
            options={[]}
            value=""
            onChange={() => {}}
            formControlProps={{ sx: { maxWidth: 150, width: '100%' } }}
          />
          <CustomSelect
            label="Class"
            options={[]}
            value=""
            onChange={() => {}}
            formControlProps={{ sx: { maxWidth: 150, width: '100%' } }}
          />
          <Button startIcon={<Iconify icon="mdi:file-pdf-box" />} variant="contained">
            PDF
          </Button>
          <Button startIcon={<Iconify icon="mdi:file-csv" />} variant="outlined">
            CSV
          </Button>
        </Box>

        <CustomizableTable
          tableId="result-report-table"
          columns={[
            { id: 'name', label: 'Name' },
            { id: 'maths', label: 'Maths' },
            { id: 'science', label: 'Science' },
            { id: 'gujarati', label: 'Gujarati' },
            { id: 'english', label: 'English' },
            { id: 'social', label: 'Social' },
            { id: 'hindi', label: 'Hindi' },
          ]}
          data={[
            {
              name: 'John Doe',
              maths: 'A',
              science: 'B',
              gujarati: 'A',
              english: 'A',
              social: 'B',
              hindi: 'B',
            },
            {
              name: 'Jane Smith',
              maths: 'B',
              science: 'A',
              gujarati: 'B',
              english: 'A',
              social: 'A',
              hindi: 'C',
            },
            {
              name: 'Bob Johnson',
              maths: 'C',
              science: 'B',
              gujarati: 'B',
              english: 'B',
              social: 'A',
              hindi: 'A',
            },
            {
              name: 'Alice Brown',
              maths: 'A',
              science: 'A',
              gujarati: 'A',
              english: 'A',
              social: 'A',
              hindi: 'A',
            },
            {
              name: 'Charlie Davis',
              maths: 'B',
              science: 'C',
              gujarati: 'B',
              english: 'B',
              social: 'C',
              hindi: 'B',
            },
          ]}
        />
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <Typography variant="h6" my={2}>
          Generate Exam Reports
        </Typography>
        <Box display="flex" gap={1} flexWrap="wrap">
          <CustomSelect
            label="Select Class"
            options={[]}
            value=""
            onChange={() => {}}
            formControlProps={{ sx: { maxWidth: 200, width: '100%' } }}
          />
          <CustomSelect
            label="Select Subject"
            options={[]}
            value=""
            onChange={() => {}}
            formControlProps={{ sx: { maxWidth: 200, width: '100%' } }}
          />
          <CustomSelect
            label="Exam name"
            options={[]}
            value=""
            onChange={() => {}}
            formControlProps={{ sx: { maxWidth: 200, width: '100%' } }}
          />
          <CustomSelect
            label="Specific Report Types"
            options={[]}
            value=""
            onChange={() => {}}
            formControlProps={{ sx: { maxWidth: 200, width: '100%' } }}
          />
          <Button variant="contained">Export to PDF</Button>
          <Button variant="contained" color="secondary">
            Export to CSV
          </Button>
        </Box>
      </Grid>
    </Grid>
  </Box>
);

export default ResultReport;

function PerformanceOverview({ title, subheader, chart, selectSeries, ...other }: any) {
  const chartOptions = useChart({
    chart: { stacked: true },
    // colors: chartColors,
    stroke: { width: 0 },
    xaxis: { categories: chart.categories },
    tooltip: { y: { formatter: (value: number) => fNumber(value) } },
    plotOptions: { bar: { columnWidth: '40%' } },
    ...chart.options,
  });
  return (
    <Chart
      key="selectedSeries"
      type="bar"
      series={chart.series}
      options={chartOptions}
      height={320}
      loadingProps={{ sx: { p: 2.5 } }}
      sx={{ py: 2.5, pl: 1, pr: 2.5 }}
    />
  );
}
