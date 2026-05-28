'use client';

import type { RootState } from 'src/redux/store';
import type { Division, Standards, Organization } from 'src/types/school';

import { useSelector } from 'react-redux';
import { useTheme } from '@mui/material/styles';
import React, { useState, useEffect } from 'react';
import { Chart, useChart } from 'src/components/chart';
import CustomSelect from 'src/components/custom-select';
import { fNumber, fPercent } from 'src/utils/format-number';
import { Box, Card, Chip, CardHeader, Typography } from '@mui/material';

// -----------------------------------------------------------------------

const EXAM_DATA = [
  { label: 'Unit Test 1', passed: 45, failed: 35 },
  { label: 'Unit Test 2', passed: 52, failed: 41 },
  { label: 'Mid Term', passed: 38, failed: 62 },
  { label: 'Final Exam', passed: 33, failed: 13 },
];

const totalPassed = EXAM_DATA.reduce((s, e) => s + e.passed, 0);
const totalFailed = EXAM_DATA.reduce((s, e) => s + e.failed, 0);
const totalStudents = totalPassed + totalFailed;

const toRate = (passed: number, failed: number) => {
  const total = passed + failed;
  return total ? (passed / total) * 100 : 0;
};

const latestExam = EXAM_DATA[EXAM_DATA.length - 1];
const previousExam = EXAM_DATA[EXAM_DATA.length - 2];
const passRate = totalStudents ? (totalPassed / totalStudents) * 100 : 0;
const failRate = totalStudents ? (totalFailed / totalStudents) * 100 : 0;
const passRateDelta =
  toRate(latestExam.passed, latestExam.failed) - toRate(previousExam.passed, previousExam.failed);
const failRateDelta = -passRateDelta;

// -----------------------------------------------------------------------

const SubjectPassFailChart = () => {
  const theme = useTheme();
  const [allClass, setAllClass] = useState<Standards[]>([]);
  const [classes, setClasses] = useState<string>('');
  const [allDivision, setAllDivision] = useState<Division[]>([]);
  const [division, setDivision] = useState<string>('');

  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);

  useEffect(() => {
    const allClasses =
      medium?.educationMediumStages?.flatMap((stage: Organization) => stage.standards || []) || [];
    setAllClass(allClasses);
    setClasses(allClasses[0]?.id || '');
  }, [medium]);

  useEffect(() => {
    setAllDivision(allClass.find((org: Standards) => org?.id === classes)?.divisions || []);
    setDivision(allClass.find((org: Standards) => org?.id === classes)?.divisions?.[0]?.id || '');
  }, [allClass, classes]);

  const chartOptions = useChart({
    labels: ['Passed', 'Failed'],
    stroke: {
      colors: [theme.vars.palette.background.paper],
    },
    legend: {
      show: true,
      position: 'bottom',
      horizontalAlign: 'center',
      labels: {
        colors: theme.vars.palette.text.primary,
      },
      formatter(val: any, opts: any) {
        return `${val} - ${opts?.w?.globals?.series?.[opts.seriesIndex] || 0}`;
      },
    },
    dataLabels: {
      enabled: true,
      formatter(val: any) {
        return fPercent(Number(val));
      },
      dropShadow: {
        enabled: false,
      },
    },
    tooltip: {
      fillSeriesColor: false,
      y: {
        formatter: (value: number) => fNumber(value),
        title: {
          formatter: (seriesName: string) => `${seriesName}`,
        },
      },
    },
    plotOptions: {
      pie: {
        donut: {
          labels: {
            show: true,
            name: {
              color: theme.vars.palette.text.secondary,
            },
            value: {
              color: theme.vars.palette.text.primary,
            },
            total: {
              show: true,
              label: 'Total',
              color: theme.vars.palette.text.primary,
              formatter: (w: any) => {
                const total = w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0);
                return fNumber(total);
              },
            },
          },
        },
      },
    },
  });

  return (
    <Card
      sx={{
        height: '100%',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[8],
          transition: 'all 0.3s ease-in-out',
        },
      }}
    >
      <CardHeader
        sx={{ mt: -1, ml: -1, mb: 2, flexShrink: 0 }}
        title="Exam Pass / Fail Rate"
        action={
          <Box sx={{ display: 'flex', gap: 1 }}>
            <CustomSelect
              options={allClass}
              label="Class"
              value={classes}
              onChange={(val) => setClasses(val as string)}
              labelKey="name"
              valueKey="id"
              formControlProps={{ sx: { minWidth: '90px' } }}
            />
            <CustomSelect
              options={allDivision}
              label="Division"
              value={division}
              onChange={(val) => setDivision(val as string)}
              labelKey="name"
              valueKey="id"
              formControlProps={{ sx: { minWidth: '90px' } }}
              disabled={!classes}
            />
          </Box>
        }
      />
      <Box sx={{ px: 3 }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
            gap: 1.5,
          }}
        >
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: theme.vars.palette.grey[200],
            }}
          >
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
              Total Students
            </Typography>
            <Typography variant="h4" sx={{ lineHeight: 1 }}>
              {fNumber(totalStudents)}
            </Typography>
          </Box>

          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: theme.vars.palette.grey[200],
            }}
          >
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
              Pass Rate
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="h4" sx={{ lineHeight: 1 }}>
                {Math.round(passRate)}%
              </Typography>
              <Chip
                size="small"
                label={`${passRateDelta >= 0 ? '↑' : '↓'}${Math.abs(Math.round(passRateDelta))}%`}
                color={passRateDelta >= 0 ? 'success' : 'error'}
                sx={{ height: 24, borderRadius: 999 }}
              />
            </Box>
          </Box>

          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: theme.vars.palette.grey[200],
            }}
          >
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
              Fail Rate
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="h4" sx={{ lineHeight: 1 }}>
                {Math.round(failRate)}%
              </Typography>
              <Chip
                size="small"
                label={`${failRateDelta >= 0 ? '↑' : '↓'}${Math.abs(Math.round(failRateDelta))}%`}
                color={failRateDelta >= 0 ? 'error' : 'warning'}
                sx={{ height: 24, borderRadius: 999 }}
              />
            </Box>
          </Box>
        </Box>
      </Box>

      <Box sx={{ p: 3, pb: 1 }} dir="ltr">
        <Chart dir="ltr" type="donut" series={[totalPassed, totalFailed]} options={chartOptions} />
      </Box>
    </Card>
  );
};

export default SubjectPassFailChart;
