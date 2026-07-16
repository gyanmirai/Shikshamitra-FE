import type { RootState } from 'src/redux/store';
import type { Division, Standards, Organization } from 'src/types/school';

import { useSelector } from 'react-redux';
import { useTheme } from '@mui/material/styles';
import React, { useState, useEffect } from 'react';
import { Chart, useChart } from 'src/components/chart';
import CustomSelect from 'src/components/custom-select';
import { Box, Card, Grid, Stack, Typography } from '@mui/material';
import { useGetChapterCompletionChartFilteredQuery } from 'src/redux/academicAPI/academicDashboardApi';

interface ChapterCompletionChartData {
  standardNames: string[];
  completionPercentages: number[];
}

const ChapterCompletionChart = ({ chartData }: { chartData?: ChapterCompletionChartData }) => {
  const theme = useTheme();
  // State to store all classes/standards for the selected organization
  const [allClass, setAllClass] = useState<Standards[]>([]);
  // State to store selected class/standard ID
  const [classes, setClasses] = useState<string>('');
  // State to store all divisions for the selected class
  const [allDivision, setAllDivision] = useState<Division[]>([]);
  // State to store selected division ID
  const [division, setDivision] = useState<string>('');

  // Get current board, medium and medium setter from global state
  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);

  // Update classes when organization changes
  useEffect(() => {
    // Flatten the list of standards from all stages
    const allClasses =
      medium?.educationMediumStages?.flatMap((stage: Organization) => stage.standards || []) || [];

    setAllClass(allClasses);
    setClasses(allClasses[0]?.id || '');
  }, [medium]);

  // Update divisions when class changes
  useEffect(() => {
    setAllDivision(allClass.find((org: Standards) => org?.id === classes)?.divisions || []);
    setDivision(allClass.find((org: Standards) => org?.id === classes)?.divisions?.[0]?.id || '');
  }, [allClass, classes]);

  const { data: filteredData } = useGetChapterCompletionChartFilteredQuery(
    { standardId: classes, divisionId: division },
    { skip: !!chartData || !classes || !division }
  );

  const series = filteredData?.subjects
    ? [
        { name: 'Completed', data: filteredData.subjects.map((s) => s.completedChapters) },
        { name: 'Pending', data: filteredData.subjects.map((s) => s.pendingChapters) },
      ]
    : [
        { name: 'Completed', data: [12, 10, 13, 11, 9, 14] },
        { name: 'Pending', data: [3, 5, 2, 4, 6, 1] },
      ];

  const categories = filteredData?.subjects
    ? filteredData.subjects.map((s) => s.subjectName)
    : ['Math', 'Science', 'English', 'History', 'Geography', 'Physics'];

  const maxChapters = filteredData?.subjects?.length
    ? Math.max(...filteredData.subjects.map((s) => s.completedChapters + s.pendingChapters))
    : 15;
  const yaxisMax = maxChapters > 0 ? Math.ceil(maxChapters * 1.1) : 16;

  const totalCompleted = series[0].data.reduce((sum, item) => sum + item, 0);
  const totalPending = series[1].data.reduce((sum, item) => sum + item, 0);
  const total = totalCompleted + totalPending;
  const localAvgCompletion = Math.round((totalCompleted / total) * 100);

  const avgCompletion = chartData?.completionPercentages?.length
    ? Math.round(
        chartData.completionPercentages.reduce((a, b) => a + b, 0) /
          chartData.completionPercentages.length
      )
    : localAvgCompletion;

  const chartOptions = useChart({
    chart: {
      stacked: true,
      toolbar: { show: false },
    },
    xaxis: {
      categories,
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      min: 0,
      max: yaxisMax,
      tickAmount: 4,
      labels: {
        formatter: (val: number) => `${Math.round(val)}`,
      },
    },
    grid: {
      borderColor: theme.vars.palette.divider,
      strokeDashArray: 0,
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '38%',
        borderRadius: 3,
        borderRadiusWhenStacked: 'last',
      },
    },
    legend: { show: false },
    dataLabels: { enabled: false },
    colors: ['#20A26B', '#E79C23'],
    tooltip: {
      y: {
        formatter: (val: number) => `${val} chapters`,
      },
    },
  });

  const gradeChartOptions = useChart({
    chart: {
      toolbar: { show: false },
    },
    xaxis: {
      categories: chartData?.standardNames || [],
    },
    yaxis: {
      min: 0,
      max: 100,
      labels: {
        formatter: (val: number) => `${Math.round(val)}%`,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '38%',
        borderRadius: 4,
      },
    },
    colors: ['#20A26B'],
    tooltip: {
      y: {
        formatter: (val: number) => `${val}% completed`,
      },
    },
  });

  const gradeSeries = [{ name: 'Completion', data: chartData?.completionPercentages || [] }];

  return (
    <Card sx={{ p: 2.5, borderRadius: 2.5, height: '100%' }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box>
          <Typography variant="h6" sx={{ lineHeight: 1.2 }}>
            {chartData ? 'Grade-wise Syllabus Completion' : 'Chapter Completion'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {chartData ? 'Macro syllabus coverage progress' : 'Progress by subject'}
          </Typography>
        </Box>

        {!chartData && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <CustomSelect
              options={allClass}
              label="Class"
              value={classes}
              onChange={(val) => setClasses(val as string)}
              labelKey="name"
              valueKey="id"
              formControlProps={{ sx: { minWidth: '150px', width: '100%' } }}
            />

            <CustomSelect
              options={allDivision}
              label="Division"
              value={division}
              onChange={(val) => setDivision(val as string)}
              labelKey="name"
              valueKey="id"
              formControlProps={{ sx: { minWidth: '150px', width: '100%' } }}
              disabled={!classes}
            />
          </Box>
        )}
      </Box>

      {chartData ? (
        <Box sx={{ pt: 1.5, pb: 1.25 }}>
          <Box
            sx={{ p: 1.5, borderRadius: 1.5, bgcolor: 'background.neutral', mb: 2, maxWidth: 200 }}
          >
            <Typography variant="caption" color="text.secondary">
              Avg School Syllabus Progress
            </Typography>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="h4">{avgCompletion}%</Typography>
              <Box
                sx={{
                  px: 0.75,
                  py: 0.25,
                  borderRadius: 999,
                  fontSize: 11,
                  color: '#2E7D32',
                  bgcolor: '#E8F5E9',
                }}
              >
                On Track
              </Box>
            </Stack>
          </Box>
        </Box>
      ) : (
        <Grid container spacing={1} sx={{ mt: 1.5, mb: 1.25 }}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Box sx={{ p: 1.5, borderRadius: 1.5, bgcolor: 'background.neutral' }}>
              <Typography variant="caption" color="text.secondary">
                Avg Completion
              </Typography>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography variant="h4">{avgCompletion}%</Typography>
                <Box
                  sx={{
                    px: 0.75,
                    py: 0.25,
                    borderRadius: 999,
                    fontSize: 11,
                    color: '#2E7D32',
                    bgcolor: '#E8F5E9',
                  }}
                >
                  +1%
                </Box>
              </Stack>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <Box sx={{ p: 1.5, borderRadius: 1.5, bgcolor: 'background.neutral' }}>
              <Typography variant="caption" color="text.secondary">
                Completed
              </Typography>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography variant="h4">{totalCompleted}</Typography>
                <Box
                  sx={{
                    px: 0.75,
                    py: 0.25,
                    borderRadius: 999,
                    fontSize: 11,
                    color: '#2E7D32',
                    bgcolor: '#E8F5E9',
                  }}
                >
                  ch
                </Box>
              </Stack>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <Box sx={{ p: 1.5, borderRadius: 1.5, bgcolor: 'background.neutral' }}>
              <Typography variant="caption" color="text.secondary">
                Pending
              </Typography>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography variant="h4">{totalPending}</Typography>
                <Box
                  sx={{
                    px: 0.75,
                    py: 0.25,
                    borderRadius: 999,
                    fontSize: 11,
                    color: '#A56B00',
                    bgcolor: '#FFF3E0',
                  }}
                >
                  ch
                </Box>
              </Stack>
            </Box>
          </Grid>
        </Grid>
      )}

      {!chartData && (
        <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Box sx={{ width: 10, height: 10, borderRadius: 0.5, bgcolor: '#20A26B' }} />
            <Typography variant="body2" color="text.secondary">
              Completed
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <Box sx={{ width: 10, height: 10, borderRadius: 0.5, bgcolor: '#E79C23' }} />
            <Typography variant="body2" color="text.secondary">
              Pending
            </Typography>
          </Stack>
        </Stack>
      )}

      <Box sx={{ pt: 0.5 }} dir="ltr">
        <Chart
          type="bar"
          series={chartData ? gradeSeries : series}
          options={chartData ? gradeChartOptions : chartOptions}
        />
      </Box>
    </Card>
  );
};

export default ChapterCompletionChart;
