import type { Palette } from '@mui/material/styles';
import type { LabelColor } from 'src/components/label';

import React from 'react';
import Link from 'next/link';

import Grid2 from '@mui/material/Unstable_Grid2';
import { Box, Card, useTheme, Typography } from '@mui/material';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

interface IStudentEnrollmentCardProps {
  icon: string;
  title: string;
  count: number | string;
  color: string;
  bgColor: keyof Palette;
  href?: string;
  labels?: { name: string; color: LabelColor }[];
}

export function StudentEnrollmentCard({
  icon,
  title,
  count,
  color,
  bgColor,
  href = '',
  labels = [],
}: IStudentEnrollmentCardProps) {
  const theme = useTheme();
  return (
    <Box component={Link} href={href} sx={{ textDecoration: 'none' }}>
      <Card
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          flexGrow: 1,
          // @ts-ignore
          // background: varAlpha(theme.palette[bgColor as keyof Palette]?.mainChannel || '', 0.08),
          cursor: 'pointer',
          height: '100%',
        }}
        // onClick={() => props.push('/student/enrollment/inquiry')}
      >
        <Iconify
          icon={icon}
          sx={{
            height: '32px',
            width: '32px',
            color,
          }}
        />

        <Box>
          <Typography variant="subtitle1">{title}</Typography>
          <Typography variant="h3" color={color}>
            {count}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
            {labels.map((label) => (
              <Label color={label.color}>{label.name}</Label>
            ))}
          </Box>
        </Box>
      </Card>
    </Box>
  );
}
const Overview = () => (
  <Grid2 xs={12}>
    <Box
      sx={{
        height: '100%',
      }}
    >
      <Grid2 container spacing={2}>
        <Grid2 xs={12} md={4}>
          <StudentEnrollmentCard
            icon="wpf:inspection"
            title="Enrollment"
            count={700}
            color="success.main"
            bgColor="success"
            href="/student/enrollment/inquiry"
            labels={[
              { name: 'Male 500', color: 'success' },
              { name: 'Female 200', color: 'warning' },
            ]}
          />
        </Grid2>
        <Grid2 xs={12} md={4}>
          <StudentEnrollmentCard
            icon="medical-icon:i-registration"
            title="Registration"
            count={700}
            color="secondary.main"
            bgColor="secondary"
            href="/student/enrollment/registration"
            labels={[
              { name: 'Male 500', color: 'success' },
              { name: 'Female 200', color: 'warning' },
            ]}
          />
        </Grid2>
        <Grid2 xs={12} md={4}>
          <StudentEnrollmentCard
            icon="fluent-mdl2:open-enrollment"
            title="Admission"
            count={700}
            color="warning.main"
            bgColor="warning"
            href="/student/enrollment/admission"
            labels={[
              { name: 'Male 500', color: 'success' },
              { name: 'Female 200', color: 'warning' },
            ]}
          />
        </Grid2>
        <Grid2 xs={12} md={4}>
          <StudentEnrollmentCard
            icon="healthicons:i-exam-multiple-choice"
            title="Entrance Exam Status"
            count={10}
            color="info.main"
            bgColor="info"
            href="/student/enrollment/entrance-exam"
            labels={[
              { name: 'Ongoing 2', color: 'success' },
              { name: 'Upcoming 5', color: 'info' },
            ]}
          />
        </Grid2>
        <Grid2 xs={12} md={4}>
          <StudentEnrollmentCard
            icon="bi:pass-fill"
            title="Pass-Fail Ratio"
            count={17}
            color="error.main"
            bgColor="error"
            href="/student/enrollment/entrance-exam"
            labels={[
              { name: 'Passed 15', color: 'success' },
              { name: 'Failed 2', color: 'error' },
            ]}
          />
        </Grid2>
        <Grid2 xs={12} md={4}>
          <StudentEnrollmentCard
            icon="mingcute:performance-fill"
            title="Top 3 Performers"
            count="89 %"
            color="success.main"
            bgColor="success"
            href="/student/enrollment/entrance-exam"
            labels={[
              { name: 'Herbert Clark', color: 'success' },
              { name: 'John Doe', color: 'error' },
              { name: 'John Loe', color: 'warning' },
            ]}
          />
        </Grid2>
      </Grid2>
    </Box>
  </Grid2>
);

export default Overview;
