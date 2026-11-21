import type { LibraryDashboardOverview } from 'src/redux/library/library-adapters';

import { Iconify } from 'src/components/iconify';
import { fNumber } from 'src/utils/format-number';
import React, { useState, useCallback } from 'react';
import { alpha, useTheme } from '@mui/material/styles';
import CustomTooltip from 'src/components/custom-tooltip';
import { Chart, useChart, ChartSelect } from 'src/components/chart';
import { Box, Grid, Card, Stack, Typography, CardHeader, IconButton } from '@mui/material';

// Top Book Categories Chart (Progress Bar Style)
export const CategoryDistributionChart = ({
  overview,
}: {
  overview?: LibraryDashboardOverview;
}) => {
  const theme = useTheme();

  const categorySource = overview?.categoryDistribution?.length
    ? overview.categoryDistribution.map((item: any) => ({
        category: item.categoryName,
        count: item.copyCount,
      }))
    : [];

  const sortedData = categorySource.sort((a: any, b: any) => b.count - a.count);

  const totalBooks = sortedData.reduce((sum: number, item: any) => sum + item.count, 0);

  // Insights summary
  const largestCategory = sortedData[0] || { category: 'No category', count: 0 };
  const smallestCategory = sortedData[sortedData.length - 1] || {
    category: 'No category',
    count: 0,
  };
  const totalCategories = sortedData.length;

  return (
    <Card
      sx={{
        height: '100%',
        boxShadow: 'none',
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
      }}
    >
      <CardHeader
        title="Top Book Categories"
        subheader="Distribution by inventory count"
        sx={{ mt: -1, ml: -1 }}
      />

      {sortedData.length === 0 ? (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            No category inventory available.
          </Typography>
        </Box>
      ) : (
        <>
          {/* Insight Summary */}
          <Box
            sx={{
              mx: 1,
              mb: 1,
              p: 1.5,
              borderRadius: 1.5,
              bgcolor: alpha(theme.palette.primary.main, 0.04),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
            }}
          >
            <Grid container spacing={2}>
              <Grid size={{ xs: 4 }}>
                <Stack spacing={0.5}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    Largest Category
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {largestCategory.category}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {fNumber(largestCategory.count)} books
                  </Typography>
                </Stack>
              </Grid>
              <Grid size={{ xs: 4 }}>
                <Stack spacing={0.5}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    Smallest Category
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {smallestCategory.category}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {fNumber(smallestCategory.count)} books
                  </Typography>
                </Stack>
              </Grid>
              <Grid size={{ xs: 4 }}>
                <Stack spacing={0.5}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    Total Categories
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {totalCategories}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {fNumber(totalBooks)} books total
                  </Typography>
                </Stack>
              </Grid>
            </Grid>
          </Box>

          {/* Progress Bar List */}
          <Box sx={{ px: 1, pb: 1 }}>
            <Stack spacing={2.5}>
              {sortedData.map((item: any, index: number) => {
                const percentage = totalBooks ? Math.round((item.count / totalBooks) * 100) : 0;
                const isTop = index === 0;

                return (
                  <Box
                    key={item.category}
                    sx={{
                      position: 'relative',
                      transition: theme.transitions.create(['transform', 'box-shadow']),
                      '&:hover': {
                        transform: 'translateX(4px)',
                      },
                    }}
                  >
                    {/* Category Name and Value Row */}
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      sx={{ mb: 1 }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: isTop ? 700 : 600,
                          color: isTop ? 'text.primary' : 'text.secondary',
                        }}
                      >
                        {item.category}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 700,
                          color: 'text.primary',
                        }}
                      >
                        {fNumber(item.count)}{' '}
                        <Box
                          component="span"
                          sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.875rem' }}
                        >
                          ({percentage}%)
                        </Box>
                      </Typography>
                    </Stack>

                    {/* Progress Bar */}
                    <Box
                      sx={{
                        position: 'relative',
                        height: 10,
                        borderRadius: 1.5,
                        bgcolor: alpha(theme.palette.grey[500], 0.08),
                        overflow: 'hidden',
                        cursor: 'pointer',
                      }}
                    >
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          height: '100%',
                          width: `${percentage}%`,
                          bgcolor: isTop
                            ? theme.palette.primary.main
                            : alpha(theme.palette.primary.main, 0.7),
                          borderRadius: 1.5,
                          transition: theme.transitions.create(['width', 'background-color'], {
                            duration: 800,
                            easing: 'ease-out',
                          }),
                          '&::after': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: `linear-gradient(90deg, transparent, ${alpha(
                              theme.palette.common.white,
                              0.2
                            )}, transparent)`,
                            animation: 'shimmer 2s infinite',
                          },
                          '@keyframes shimmer': {
                            '0%': { transform: 'translateX(-100%)' },
                            '100%': { transform: 'translateX(100%)' },
                          },
                        }}
                      />
                    </Box>
                  </Box>
                );
              })}
            </Stack>
          </Box>

          {/* Legend */}
          <Box
            sx={{
              mx: 3,
              mb: 3,
              pt: 2,
              borderTop: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1}>
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: 0.75,
                  bgcolor: theme.palette.primary.main,
                }}
              />
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                Largest category
              </Typography>
              <Box sx={{ mx: 2 }}>|</Box>
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: 0.75,
                  bgcolor: alpha(theme.palette.primary.main, 0.7),
                }}
              />
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                Other categories
              </Typography>
            </Stack>
          </Box>
        </>
      )}
    </Card>
  );
};

export { InventoryIntelligence } from './inventory-intelligence';

// Member Activity Trend Chart
export const MemberActivityChart = ({ overview }: { overview?: LibraryDashboardOverview }) => {
  const theme = useTheme();
  const memberActivityData = overview?.weeklyCirculation?.length
    ? {
        series: [
          {
            name: 'Current Week',
            data: [
              {
                name: 'Books Issued',
                data: overview.weeklyCirculation.map((point: any) => point.issued),
              },
            ],
          },
        ],
        categories: overview.weeklyCirculation.map((point: any) => point.label),
      }
    : {
        series: [
          {
            name: 'Current Week',
            data: [{ name: 'Books Issued', data: [0, 0, 0, 0, 0, 0, 0] }],
          },
        ],
        categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      };
  const [selectedYear, setSelectedYear] = useState(memberActivityData.series[0].name);

  const chartColors = [theme.palette.primary.main];

  const currentYearData = memberActivityData.series.find((y) => y.name === selectedYear);

  const chartOptions = useChart({
    colors: chartColors,
    xaxis: {
      categories: memberActivityData.categories,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { colors: theme.palette.text.secondary } },
    },
    stroke: { width: 3, curve: 'smooth' },
    markers: { size: 4, strokeColors: theme.palette.background.paper, strokeWidth: 2 },
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: (value: number) => `${fNumber(value)} books`,
      },
    },
    yaxis: {
      title: { text: undefined }, // Clean look
      labels: { style: { colors: theme.palette.text.secondary } },
    },
    grid: {
      borderColor: theme.palette.divider,
      strokeDashArray: 3,
    },
  });

  const handleChangeYear = useCallback((newValue: string) => {
    setSelectedYear(newValue);
  }, []);

  return (
    <Card
      sx={{
        height: '100%',
        boxShadow: 'none',
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
      }}
    >
      <CardHeader
        sx={{ mt: -1, ml: -1 }}
        title="Member Activity Trend"
        subheader="Books issued over time"
        action={
          <ChartSelect
            options={memberActivityData.series.map((item) => item.name)}
            value={selectedYear}
            onChange={handleChangeYear}
          />
        }
      />
      <Chart
        type="line"
        series={currentYearData?.data}
        options={chartOptions}
        height={340}
        loadingProps={{ sx: { p: 2.5 } }}
        sx={{ py: 2.5, pl: 1, pr: 2.5 }}
      />
    </Card>
  );
};

// Weekly Circulation Chart
export const WeeklyCirculationChart = ({ overview }: { overview?: LibraryDashboardOverview }) => {
  const theme = useTheme();
  const [selectedRange, setSelectedRange] = useState('This Week');
  const weeklyPoints = overview?.weeklyCirculation?.length
    ? overview.weeklyCirculation
    : [
        { label: 'Mon', issued: 0, returned: 0 },
        { label: 'Tue', issued: 0, returned: 0 },
        { label: 'Wed', issued: 0, returned: 0 },
        { label: 'Thu', issued: 0, returned: 0 },
        { label: 'Fri', issued: 0, returned: 0 },
        { label: 'Sat', issued: 0, returned: 0 },
        { label: 'Sun', issued: 0, returned: 0 },
      ];
  const weeklyCirculation = {
    series: [
      {
        name: 'This Week',
        data: [
          { name: 'Issued', data: weeklyPoints.map((point: any) => point.issued) },
          { name: 'Returned', data: weeklyPoints.map((point: any) => point.returned) },
        ],
      },
    ],
    categories: weeklyPoints.map((point: any) => point.label),
  };
  const netCirculation =
    (overview?.circulation.issuesThisWeek || 0) - (overview?.circulation.returnsThisWeek || 0);

  // Restore vibrant colors
  const chartColors = [theme.palette.primary.main, theme.palette.info.main];

  const currentData = weeklyCirculation.series.find((w) => w.name === selectedRange);

  const chartOptions = useChart({
    colors: chartColors,
    xaxis: {
      categories: weeklyCirculation.categories,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { colors: theme.palette.text.secondary } },
    },
    stroke: { width: 3, curve: 'smooth' },
    fill: { type: 'gradient', gradient: { opacityFrom: 0.1, opacityTo: 0.05 } },
    legend: { position: 'top', horizontalAlign: 'right' },
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: (value: number) => `${fNumber(value)} transactions`,
      },
    },
    grid: {
      borderColor: theme.palette.divider,
      strokeDashArray: 3,
    },
    yaxis: {
      labels: { style: { colors: theme.palette.text.secondary } },
    },
  });

  const handleChangeRange = useCallback((newValue: string) => {
    setSelectedRange(newValue);
  }, []);

  return (
    <Card
      sx={{
        height: '100%',
        boxShadow: 'none',
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
      }}
    >
      <CardHeader
        title={
          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ ml: -1, mt: -1 }}>
            <Typography variant="h6">Circulation Overview</Typography>
            <CustomTooltip
              title="Track book issuance and returns over weekly or monthly periods"
              placement="top"
            >
              <IconButton size="small" sx={{ p: 0 }}>
                <Iconify
                  icon="solar:info-circle-linear"
                  width={18}
                  sx={{ color: 'text.disabled' }}
                />
              </IconButton>
            </CustomTooltip>
          </Stack>
        }
        subheader={`Net circulation: ${netCirculation >= 0 ? '+' : ''}${netCirculation}`}
        action={
          <ChartSelect
            options={weeklyCirculation.series.map((item) => item.name)}
            value={selectedRange}
            onChange={handleChangeRange}
          />
        }
      />
      <Box sx={{ mt: 3, mx: 3 }} dir="ltr">
        <Chart type="area" series={currentData?.data} options={chartOptions} height={345} />
      </Box>
    </Card>
  );
};

// Section-wise Book Count Chart (Shelf Health)
export const SectionBooksChart = ({ overview }: { overview?: LibraryDashboardOverview }) => {
  const theme = useTheme();
  const sectionBooks = overview?.sectionInventory?.length
    ? {
        series: [
          {
            name: 'All Sections',
            data: overview.sectionInventory.map((section: any) => ({
              name: section.sectionName,
              data: [Math.round(section.utilizationRate)],
              capacity: 100,
            })),
          },
        ],
      }
    : {
        series: [
          {
            name: 'All Sections',
            data: [{ name: 'No inventory', data: [0], capacity: 100 }],
          },
        ],
      };
  const [selectedSection, setSelectedSection] = useState(sectionBooks.series[0].name);

  const currentSectionData = sectionBooks.series.find((s) => s.name === selectedSection);

  const categories = currentSectionData?.data.map((item: any) => item.name) || [];
  const seriesData = currentSectionData?.data.map((item: any) => item.data[0]) || [];

  const chartOptions = useChart({
    xaxis: {
      categories,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { colors: theme.palette.text.secondary, fontWeight: 500 } },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        borderRadius: 4,
        columnWidth: '40%',
        distributed: true,
      },
    } as any,
    colors: seriesData.map((val: number) => {
      // Functional color only: Error for > 85%, else Neutral/Gray
      if (val > 85) return theme.palette.error.main;
      if (val > 60) return theme.palette.warning.main;
      return theme.palette.primary.main;
    }),
    dataLabels: {
      enabled: true,
      formatter: (val: number) => `${val}%`,
      style: { fontSize: '10px' },
    },
    legend: { show: false },
    tooltip: {
      y: {
        formatter: (value: number) => `${value}% Capacity Used`,
      },
    },
    grid: {
      borderColor: theme.palette.divider,
      strokeDashArray: 3,
    },
    yaxis: {
      max: 100,
      labels: { style: { colors: theme.palette.text.secondary } },
    },
  });

  const handleChangeSection = useCallback((newValue: string) => {
    setSelectedSection(newValue);
  }, []);

  return (
    <Card
      sx={{
        height: '100%',
        boxShadow: 'none',
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
      }}
    >
      <CardHeader
        title={
          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ ml: -1, mt: -1 }}>
            <Typography variant="h6">Shelf Health Monitoring</Typography>
            <CustomTooltip
              title="Monitor shelf capacity and utilization across sections"
              placement="top"
            >
              <IconButton size="small" sx={{ p: 0 }}>
                <Iconify
                  icon="solar:info-circle-linear"
                  width={18}
                  sx={{ color: 'text.disabled' }}
                />
              </IconButton>
            </CustomTooltip>
          </Stack>
        }
        subheader="Capacity utilization per shelf"
        action={
          <ChartSelect
            options={sectionBooks.series.map((item) => item.name)}
            value={selectedSection}
            onChange={handleChangeSection}
          />
        }
      />
      <Chart
        type="bar"
        series={[{ name: 'Utilization', data: seriesData }]}
        options={chartOptions}
        height={340}
        loadingProps={{ sx: { p: 2.5 } }}
        sx={{ py: 2.5, pl: 1, pr: 2.5 }}
      />
    </Card>
  );
};

// Main Admin Charts Component
const AdminCharts = () => (
  <Grid container spacing={3}>
    <Grid size={{ xs: 12, md: 8 }}>
      <WeeklyCirculationChart />
    </Grid>

    <Grid size={{ xs: 12, md: 4 }}>
      <MemberActivityChart />
    </Grid>

    <Grid size={{ xs: 12, md: 6 }}>
      <CategoryDistributionChart />
    </Grid>

    <Grid size={{ xs: 12, md: 6 }}>
      <SectionBooksChart />
    </Grid>
  </Grid>
);

export default AdminCharts;
