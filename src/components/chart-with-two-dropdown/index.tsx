import type { CardProps } from '@mui/material/Card';
import type { ChartOptions } from 'src/components/chart';

import { useState, useEffect, useCallback } from 'react';

import { Box } from '@mui/material';
import Card from '@mui/material/Card';
import { useTheme } from '@mui/material/styles';
import CardHeader from '@mui/material/CardHeader';

import { fCurrency } from 'src/utils/format-number';

import { Chart, useChart, ChartSelect, ChartLegends } from 'src/components/chart';

// ----------------------------------------------------------------------

type Props = CardProps & {
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
          data: number[];
        }[];
      }[];
    }[];
    options?: ChartOptions;
  };
};

export function ChartWithTwoDropDown({ title, subheader, chart, ...other }: Props) {
  const theme = useTheme();

  // State for dropdown options
  const [listOfSeriesOption, setListOfSeriesOption] = useState<string[]>([]);
  const [listOfDataOption, setListOfDataOption] = useState<string[]>([]);
  const [listOfLegend, setListOfLegend] = useState<string[]>([]);

  // State for selected dropdown values
  const [selectedSeries, setSelectedSeries] = useState<string>(chart.series[0].durations[0].name);
  const [selectedData, setSelectedData] = useState<string>(chart.series[0].vehicleName);

  // Derive the current series based on selected vehicle and series
  const currentVehicle = chart.series.find((vehicle) => vehicle.vehicleName === selectedData);
  const currentSeries = currentVehicle?.durations.find(
    (duration) => duration.name === selectedSeries
  );

  // Chart colors and options
  const chartColors = chart.colors ?? [
    theme.palette.primary.dark,
    theme.palette.warning.main,
    theme.palette.info.main,
  ];

  const chartOptions = useChart({
    stroke: { width: 2, colors: ['transparent'] },
    colors: chartColors,
    xaxis: { categories: currentSeries?.categories || [] },
    tooltip: { y: { formatter: (value: number) => fCurrency(value) } },
    ...chart.options,
  });

  // Handle changes for the series dropdown
  const handleChangeSeries = useCallback((newValue: string) => {
    setSelectedSeries(newValue);
  }, []);

  // Handle changes for the data (vehicle) dropdown
  const handleChangeData = useCallback((newValue: string) => {
    setSelectedData(newValue);
  }, []);

  useEffect(() => {
    const dataOptions = chart.series.map((vehicle) => vehicle.vehicleName);
    const seriesOptions = chart.series
      .filter((vehicle) => vehicle.vehicleName === selectedData)
      .flatMap((vehicle) => vehicle.durations.map((duration) => duration.name));

    setListOfSeriesOption(seriesOptions);
    setListOfDataOption(dataOptions);

    // Set default selections
    // if (dataOptions.length > 0) {
    //     setSelectedData(dataOptions[0]);
    // }
    // if (seriesOptions.length > 0) {
    //     setSelectedSeries(seriesOptions[0]);
    // }
  }, [chart.series, selectedData]);

  return (
    <Card {...other}>
      <CardHeader
        title={title}
        subheader={subheader}
        action={
          <Box display="flex" gap={3}>
            {/* Vehicle (Data) Dropdown */}
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
          </Box>
        }
        sx={{ mb: 3 }}
      />
      <ChartLegends
        colors={chartOptions?.colors}
        labels={chart.series[0].durations[0].series.map((item) => item.name)}
        // sublabels={[`+${fPercent(43)}`, `+${fPercent(3)}`, `+${fPercent(8)}`]}
        // values={[fCurrency(6789), fCurrency(1234), fCurrency(1012)]}
        sx={{ px: 3, gap: 3 }}
      />
      <Chart
        type="bar"
        series={currentSeries?.series || []}
        options={chartOptions}
        height={320}
        loadingProps={{ sx: { p: 2.5 } }}
        sx={{ py: 2.5, pl: 1, pr: 2.5 }}
      />
    </Card>
  );
}
