import type { CardProps } from '@mui/material';

import { useState, useCallback } from 'react';

import { Box, Card, Stack, Alert, Divider, useTheme, CardHeader, Typography } from '@mui/material';

import CustomizableTable from '../customizabaleTable';
import { Chart, useChart, ChartSelect, ChartLegends } from '../chart';

import type { ChartOptions } from '../chart';

const AcademicDashboard = () => {
  const theme = useTheme();
  const [selectedSeries, setSelectedSeries] = useState('2024');
  const handleChangeSeries = useCallback((newValue: string) => {
    setSelectedSeries(newValue);
  }, []);

  return (
    <>
      <Alert variant="outlined" severity="warning">
        You need to increase your performance in Mathematics. Focus on improving your scores in this
        subject.
      </Alert>
      <Card sx={{ py: 3, textAlign: 'center', typography: 'h4' }}>
        <Stack
          direction="row"
          divider={<Divider orientation="vertical" flexItem sx={{ borderStyle: 'dashed' }} />}
        >
          <Stack width={1}>
            87.5%
            <Box component="span" sx={{ color: 'text.secondary', typography: 'body2' }}>
              Current Percentage
            </Box>
          </Stack>

          <Stack width={1}>
            90%-95%
            <Box component="span" sx={{ color: 'text.secondary', typography: 'body2' }}>
              Predicted Percentage
            </Box>
          </Stack>
        </Stack>
      </Card>
      {/* <Paper sx={{ p: 2, mt: 3, display: 'flex', gap: 2 }} elevation={2}>
        <Box display="flex" flexDirection="column" gap={1}>
          <Typography variant="h6">
            <Box
              component="span"
              sx={{
                outline: `dashed 2px ${theme.vars.palette.divider}`,
                p: 1,
                color: theme.palette.primary.main,
                borderRadius: '5px',
                fontSize: '14px !important',
                fontWeight: 'bold',
              }}
            >
              Current Percentage &nbsp;&nbsp; 87.5%
            </Box>{' '}
          </Typography>
          <Typography component="span">(+43%) than last year</Typography>
        </Box>
        <Box display="flex" flexDirection="column">
          <Typography variant="h6">
            <Box
              component="span"
              sx={{
                outline: `dashed 2px ${theme.vars.palette.divider}`,
                p: 1,
                color: theme.palette.warning.main,
                borderRadius: '5px',
                fontSize: '14px !important',
                fontWeight: 'bold',
              }}
            >
              Predicted Percentage&nbsp;&nbsp;90% - 95%
            </Box>{' '}
          </Typography>
        </Box>
        <Box flexGrow={1} display="flex" justifyContent="flex-end">
          <ChartSelect
            options={['2023', '2024']}
            value={selectedSeries}
            onChange={handleChangeSeries}
          />
        </Box>
      </Paper> */}
      <EcommerceYearlySales
        title="Academic Trends"
        subheader=""
        selectedSeries={selectedSeries}
        handleChangeSeries={handleChangeSeries}
        chart={{
          categories: ['01/01', '07/02', '09/03', '01/04'],
          series: [
            {
              name: '2024',
              data: [
                {
                  name: 'English',
                  data: [10, 41, 35, 51],
                },
                {
                  name: 'Mathematics',
                  data: [10, 34, 13, 56],
                },
                {
                  name: 'Gujarati',
                  data: [70, 40, 30, 55],
                },
                {
                  name: 'Hindi',
                  data: [90, 84, 63, 56],
                },
              ],
            },
            {
              name: '2023',
              data: [
                {
                  name: 'English',
                  data: [51, 35, 41, 10],
                },
                {
                  name: 'Mathematics',
                  data: [56, 13, 34, 10],
                },
                {
                  name: 'Gujarati',
                  data: [58, 39, 45, 18],
                },
                {
                  name: 'Hindi',
                  data: [52, 18, 39, 40],
                },
              ],
            },
          ],
          //           options: {
          //             tooltip: {
          //               custom: (props: any) => {
          //                 console.log(props, 'props');
          //                 const { dataPointIndex } = props;
          //                 // eslint-disable-next-line react/prop-types
          //                 const { config }: any = props.ctx.w;
          //                 const { colors } = config;
          //                 const series: any = config?.series;
          //                 const names: any = series?.map((i: any) => i.name);
          //                 const currentDataValue = (name: string) =>
          //                   series?.find((i) => i.name === name).data[dataPointIndex];

          //                 let str = '';
          //                 for (let i = 0; i < names.length; i++) {
          //                   str += `<div style="display:flex;gap:4px;align-items:center;margin-bottom:4px">
          //                    <span style="display:block;height:10px;width:10px;border-radius:50%;background:${colors[i]};"></span>
          //       <span>${names[i]} :</span>
          //       <span>${currentDataValue(names[i])}</span>
          //     </div>
          //     `;
          //                 }

          //                 return `<div style="max-width:280px;width:100%;border:1px solid black;">
          //   <p style="text-align:center;padding:4px;margin:0">
          //     Header
          //   </p>
          //   <hr/>
          //   <div style="display:grid;grid-template-columns:1fr 1fr;padding:16px">
          //     ${str}
          //   </div>
          // </div>`;
          //               },
          //             },
          //           },
          colors: [
            theme.palette.primary.main,
            theme.palette.warning.main,
            theme.palette.success.main,
            theme.palette.error.main,
          ],
        }}
      />
      <CustomizableTable
        data={[
          {
            date: '01-01-2024',
            category: 'Prelims',
            marks: { english: 80, math: 80, gujarati: 80, hindi: 80 },
          },
          {
            date: '07-02-2024',
            category: 'Prelims 1',
            marks: { english: 85, math: 40, gujarati: 90, hindi: 60 },
          },
        ]}
        columns={[
          { id: 'date', label: 'Exam Date' },
          { id: 'category', label: 'Category' },
          {
            id: 'marks',
            label: 'Marks',

            render: (val, row) => (
              <>
                {Object.entries(row.marks).map(([key, value]: any) => (
                  <Typography key={key} variant="subtitle2">
                    {key} : {value}
                  </Typography>
                ))}
              </>
            ),
          },
        ]}
      />
    </>
  );
};

export default AcademicDashboard;

type Props = CardProps & {
  title?: string;
  subheader?: string;
  selectedSeries: string;
  handleChangeSeries: (value: string) => void;
  chart: {
    colors?: string[];
    categories?: string[];
    series: {
      name: string;
      data: {
        name: string;
        data: number[];
      }[];
    }[];
    options?: ChartOptions;
  };
};

export function EcommerceYearlySales({
  title,
  subheader,
  chart,
  selectedSeries,
  handleChangeSeries,
  ...other
}: Props) {
  const theme = useTheme();

  const chartColors = chart.colors ?? [theme.palette.primary.main, theme.palette.warning.main];

  const chartOptions = useChart({
    colors: chartColors,
    xaxis: { categories: chart.categories },
    ...chart.options,
  });

  const currentSeries = chart.series.find((i) => i.name === selectedSeries);

  return (
    <Card {...other}>
      <CardHeader
        title={title}
        subheader={subheader}
        action={
          <ChartSelect
            options={chart.series.map((item) => item.name)}
            value={selectedSeries}
            onChange={handleChangeSeries}
          />
        }
        sx={{ mb: 3 }}
      />

      <ChartLegends
        colors={chartOptions?.colors}
        labels={chart.series[0].data.map((item) => item.name)}
        // values={[fShortenNumber(1234), fShortenNumber(6789)]}
        sx={{ px: 3, gap: 3 }}
      />

      <Chart
        type="area"
        series={currentSeries?.data}
        options={chartOptions}
        height={320}
        loadingProps={{ sx: { p: 2.5 } }}
        sx={{ py: 2.5, pl: 1, pr: 2.5 }}
      />
    </Card>
  );
}
