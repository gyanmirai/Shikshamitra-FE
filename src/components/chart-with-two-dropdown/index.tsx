import type { CardProps } from '@mui/material/Card';
import type { ChartOptions } from 'src/components/chart';

import Card from '@mui/material/Card';
import { useTheme } from '@mui/material/styles';
import CardHeader from '@mui/material/CardHeader';
import { fCurrency } from 'src/utils/format-number';
import { Box, Menu, MenuItem, IconButton } from '@mui/material';
import { useMemo, useState, useEffect, useCallback } from 'react';
import { Chart, ChartSelect, ChartLegends } from 'src/components/chart';

import { Iconify } from '../iconify';

// ----------------------------------------------------------------------

type Props = CardProps & {
  annotationPointForMonth?: any;
  annotationPoint?: any;
  monthFromComponent?: (data: any) => void;
  title?: string;
  subheader?: string;
  chart: {
    colors?: string[];
    series: {
      vehicleName: string;
      durations: {
        name: string;
        categories: string[];
        series: {
          name: string;
          data: any[];
        }[];
      }[];
    }[];
    options?: ChartOptions;
  };
};

export function ChartWithTwoDropDown({
  annotationPointForMonth,
  annotationPoint,
  monthFromComponent,
  title,
  subheader,
  chart,
  ...other
}: Props) {
  const theme = useTheme();
  const [year, setYear] = useState<number>(2025);

  const monthsWithDays = useMemo(() => {
    const isLeapYear = () => (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;

    const months = [
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

    return months;
  }, [year]); // Only recompute when year changes

  useEffect(() => {
    setListOfMonth(monthsWithDays);
  }, [monthsWithDays]);

  // State for dropdown options
  const [listOfSeriesOption, setListOfSeriesOption] = useState<string[]>([]);
  const [listOfDataOption, setListOfDataOption] = useState<string[]>([]);
  const [listOfLegend, setListOfLegend] = useState<string[]>([]);
  const [listOfMonth, setListOfMonth] = useState<
    {
      month: string;
      days: number;
    }[]
  >([]);

  // State for selected dropdown values
  const [selectedSeries, setSelectedSeries] = useState<string>(chart.series[0].durations[0].name);
  const [selectedData, setSelectedData] = useState<string>(chart.series[0].vehicleName);
  const [selectedMonth, setSelectedMonth] = useState<string>('January');

  // Derive the current series based on selected vehicle and series
  const currentVehicle = chart.series.find((vehicle) => vehicle.vehicleName === selectedData);
  const currentSeries = currentVehicle?.durations.find(
    (duration) => duration.name === selectedSeries
  );

  // Chart colors and options
  const memoizedChartOptions = useMemo(() => {
    // Define chartColors outside the memoized callback
    const chartColors = chart.colors ?? [
      theme.palette.primary.dark,
      theme.palette.warning.main,
      theme.palette.info.main,
    ];
    let lateShown = false;
    let onTimeShown = false;

    // Return the options object
    return {
      stroke: { width: 2, colors: ['transparent'] },
      colors: chartColors,
      xaxis: { categories: currentSeries?.categories || [] },
      tooltip: { y: { formatter: (value: number) => fCurrency(value) } },
      dataLabels: {
        enabled: selectedSeries !== 'Daily',
      },
      plotOptions: {
        bar: {
          columnWidth: selectedSeries === 'Daily' ? '80%' : '80%',
        },
      },
      yaxis: [
        {
          title: {
            text: 'Kilometers',
          },
        },
        {
          opposite: true,
          title: {
            text: 'Fuel Used (Liters)',
          },
        },
      ],
      series: [
        {
          name: 'Kilometers',
          type: 'bar',
          data: currentSeries?.series[0]?.data || [],
        },
        {
          name: 'Fuel Used (Liters)',
          type: 'line',
          data: currentSeries?.series[1]?.data || [],
        },
      ],

      annotations: {
        points:
          currentSeries?.name === 'Daily'
            ? annotationPoint.map((item: any, index: any) => {
                const annotation = {
                  x: (index + 1).toString(), // Category or x-axis value
                  y: (currentSeries?.series[0]?.data[index] ?? 0) + 5,
                  marker: {
                    size: 4,
                    fillColor: item === 'late' ? '#FF0000' : '#90EE90',
                    shape: 'circle',
                    offsetX: -6,
                    offsetY: 0,
                    strokeColor: 'transparent',
                  },
                  label: {},
                };

                if (item === 'late' && !lateShown) {
                  lateShown = true;
                  annotation.label = {
                    text: 'Late',
                    offsetY: -5,
                    style: {
                      border: 'transparent',
                      fontSize: '14px',
                      fontWeight: '400',
                      color: '#721c24',
                      background: '#f8d7da',
                    },
                  };
                }

                if (item === 'onTime' && !onTimeShown) {
                  onTimeShown = true;
                  annotation.label = {
                    text: 'On Time',
                    offsetY: -5,
                    style: {
                      border: 'transparent',
                      fontSize: '14px',
                      fontWeight: '400',
                      color: '#248d57',
                      background: '#dbf6e5',
                    },
                  };
                }

                return annotation;
              })
            : annotationPointForMonth.map((item: any, index: any) => {
                const annotation = {
                  x: (index + 1).toString(), // Category or x-axis value
                  y: (currentSeries?.series[0]?.data[index] ?? 0) + 5,
                  marker: {
                    size: 4,
                    fillColor: item === 'late' ? '#FF0000' : '#90EE90',
                    shape: 'circle',
                    offsetX: -6,
                    offsetY: 0,
                    strokeColor: 'transparent',
                  },
                  label: {},
                };

                if (item === 'late' && !lateShown) {
                  lateShown = true;
                  annotation.label = {
                    text: 'Late',
                    offsetY: -5,
                    style: { fontSize: '12px', color: '#FF0000' },
                  };
                }

                if (item === 'onTime' && !onTimeShown) {
                  onTimeShown = true;
                  annotation.label = {
                    text: 'On Time',
                    offsetY: -5,
                    style: { fontSize: '12px', color: '#90EE90' },
                  };
                }

                return annotation;
              }),
      },

      ...chart.options,
    };
  }, [
    chart.colors,
    chart.options,
    theme.palette.primary.dark,
    theme.palette.warning.main,
    theme.palette.info.main,
    currentSeries?.categories,
    currentSeries?.series,
    currentSeries?.name,
    selectedSeries,
    annotationPoint,
    annotationPointForMonth,
  ]);

  // Handle changes for the series dropdown
  const handleChangeSeries = useCallback((newValue: string) => {
    setSelectedSeries(newValue);
  }, []);

  // Handle changes for the data (vehicle) dropdown
  const handleChangeData = useCallback((newValue: string) => {
    setSelectedData(newValue);
  }, []);

  const handleChangeMonth = useCallback(
    (newValue: string) => {
      setSelectedMonth(newValue);

      // Find the number of days based on the selected month
      const selectedMonthDetails = monthsWithDays.find((item) => item.month === newValue);
      const daysInMonth = selectedMonthDetails?.days;

      // Prepare the data
      const data = {
        monthName: newValue,
        days: daysInMonth,
      };

      // Pass data to parent if needed
      if (monthFromComponent) {
        monthFromComponent(data);
      }
    },
    [monthsWithDays, monthFromComponent]
  );

  useEffect(() => {
    const dataOptions = chart.series.map((vehicle) => vehicle.vehicleName);
    const seriesOptions = chart.series
      .filter((vehicle) => vehicle.vehicleName === selectedData)
      .flatMap((vehicle) => vehicle.durations.map((duration) => duration.name));

    setListOfSeriesOption(seriesOptions);
    setListOfDataOption(dataOptions);
  }, [chart.series, selectedData]);

  // Handles export action for the chart as PNG
  const handleSelect = async (type: 'png') => {
    handleClose();
    const charts = ApexCharts.getChartByID('my-export-chart') as any;
    if (type === 'png') {
      if (charts) {
        const data = await charts.dataURI();
        console.log('data', data);
        const { imgURI } = data as { imgURI: string };

        // trigger download
        const link = document.createElement('a');
        link.href = imgURI;

        link.download = 'chart.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
  };

  // State to manage dropdown anchor element
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // Set the anchor element to open dropdown
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  // Close the dropdown menu
  const handleClose = () => {
    setAnchorEl(null);
  };
  return (
    <Card {...other}>
      <CardHeader
        title={title}
        subheader={subheader}
        action={
          <Box display="flex" gap={3}>
            {/* Vehicle (Data) Dropdown */}
            {selectedSeries === 'Daily' && (
              <ChartSelect
                options={listOfMonth.map((item) => item.month)}
                value={selectedMonth}
                onChange={handleChangeMonth}
              />
            )}
            <ChartSelect
              options={listOfDataOption}
              value={selectedData}
              onChange={handleChangeData}
            />
            {/* Series Dropdown */}
            <ChartSelect
              options={listOfSeriesOption}
              value={selectedSeries}
              onChange={handleChangeSeries}
            />
            <IconButton onClick={handleClick} sx={{ fontSize: 24 }}>
              <Iconify icon="eva:download-fill" sx={{ fontWeight: 'bold' }} />
            </IconButton>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
              <MenuItem onClick={() => handleSelect('png')}>Download PNG</MenuItem>
            </Menu>
          </Box>
        }
        sx={{ mb: 3 }}
      />
      <ChartLegends
        colors={memoizedChartOptions?.colors}
        labels={chart.series[0].durations[0].series.map((item) => item.name)}
        // sublabels={[`+${fPercent(43)}`, `+${fPercent(3)}`, `+${fPercent(8)}`]}
        // values={[fCurrency(6789), fCurrency(1234), fCurrency(1012)]}
        sx={{ px: 3, gap: 3 }}
      />
      <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
        <Chart
          type="bar"
          series={currentSeries?.series || []}
          options={{
            ...memoizedChartOptions,
            chart: {
              ...memoizedChartOptions.chart,
              id: 'my-export-chart', // 🔑 this is important
              toolbar: {
                show: false,
              },
            },
          }}
          height={320}
          loadingProps={{ sx: { p: 2.5 } }}
          sx={{ py: 2.5, pl: 1, pr: 2.5 }}
        />
      </Box>
    </Card>
  );
}
