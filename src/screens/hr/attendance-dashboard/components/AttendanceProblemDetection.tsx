'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Iconify } from 'src/components/iconify';
import { alpha, useTheme } from '@mui/material/styles';
import CustomTooltip from 'src/components/custom-tooltip';
import {
  Box,
  Card,
  Chip,
  Stack,
  Table,
  Avatar,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  Typography,
  CardHeader,
  IconButton,
  TableContainer,
  LinearProgress,
} from '@mui/material';

// -----------------------------------------------------------------------

const FREQUENT_LATE = [
  { id: 1, name: 'Rahul Mehta', dept: 'Mathematics', count: 12, avatar: '' },
  { id: 2, name: 'Sunita Patel', dept: 'HR', count: 9, avatar: '' },
  { id: 3, name: 'Amit Verma', dept: 'Administration', count: 8, avatar: '' },
  { id: 4, name: 'Kavya Nair', dept: 'English', count: 7, avatar: '' },
  { id: 5, name: 'Deepak Singh', dept: 'Computer', count: 6, avatar: '' },
];

const HIGH_ABSENT_DEPTS = [
  { id: 1, dept: 'Administration', absenceRate: 18, total: 22, absent: 4 },
  { id: 2, dept: 'Science', absenceRate: 14, total: 28, absent: 4 },
  { id: 3, dept: 'Mathematics', absenceRate: 12, total: 25, absent: 3 },
  { id: 4, dept: 'English', absenceRate: 10, total: 20, absent: 2 },
];

const LOW_HOURS = [
  {
    id: 1,
    name: 'Priya Sharma',
    dept: 'Science',
    hours: '5h 20m',
    required: '8h',
    deficit: '2h 40m',
  },
  {
    id: 2,
    name: 'Rahul Mehta',
    dept: 'Mathematics',
    hours: '5h 45m',
    required: '8h',
    deficit: '2h 15m',
  },
  {
    id: 3,
    name: 'Kavya Nair',
    dept: 'English',
    hours: '6h 10m',
    required: '8h',
    deficit: '1h 50m',
  },
];

const REPEAT_OFFENDERS = [
  { id: 1, name: 'Amit Verma', dept: 'Administration', corrections: 8, type: 'Punch Correction' },
  { id: 2, name: 'Deepak Singh', dept: 'Computer', corrections: 6, type: 'Punch Correction' },
  { id: 3, name: 'Sunita Patel', dept: 'HR', corrections: 5, type: 'Leave Override' },
];

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 260, damping: 22 },
  },
};

// -----------------------------------------------------------------------

const SectionHeader = ({
  icon,
  title,
  color,
  tooltip,
}: {
  icon: string;
  title: string;
  color: string;
  tooltip: string;
}) => (
  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
    <Box
      sx={{
        width: 28,
        height: 28,
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(135deg, ${color} 0%, ${alpha(color, 0.7)} 100%)`,
        boxShadow: `0 3px 10px ${alpha(color, 0.35)}`,
      }}
    >
      <Iconify icon={icon} width={16} sx={{ color: '#fff' }} />
    </Box>
    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
      {title}
    </Typography>
    <CustomTooltip title={tooltip} placement="top">
      <IconButton size="small" sx={{ p: 0 }}>
        <Iconify icon="solar:info-circle-linear" width={16} sx={{ color: 'text.disabled' }} />
      </IconButton>
    </CustomTooltip>
  </Stack>
);

// -----------------------------------------------------------------------

const AttendanceProblemDetection = () => {
  const theme = useTheme();

  return (
    <Card
      sx={{
        height: '100%',
        borderRadius: 2,
        boxShadow: 'none',
        border: `1px solid ${theme.palette.divider}`,
      }}
    >
      <CardHeader
        title={
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="h6">Problem Detection</Typography>
            <CustomTooltip
              title="System-detected attendance issues requiring attention"
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
        sx={{ p: 2, pb: 1 }}
      />

      <Box sx={{ px: 2, pb: 2, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        {/* Frequent Late Employees */}
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          <SectionHeader
            icon="mdi:clock-alert-outline"
            title="Frequent Late Employees"
            color="#FF5630"
            tooltip="Top 5 employees with most late entries this month"
          />
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.7rem' }}>Employee</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.7rem' }}>Department</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.7rem' }}>
                    Late Count
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {FREQUENT_LATE.map((emp) => (
                  <TableRow key={emp.id} sx={{ '&:last-child td': { border: 0 } }}>
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Avatar
                          sx={{
                            width: 24,
                            height: 24,
                            fontSize: '0.65rem',
                            bgcolor: alpha('#FF5630', 0.12),
                            color: '#FF5630',
                          }}
                        >
                          {emp.name.charAt(0)}
                        </Avatar>
                        <Typography variant="caption" fontWeight={600}>
                          {emp.name}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary">
                        {emp.dept}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Chip
                        label={emp.count}
                        size="small"
                        sx={{
                          height: 22,
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          bgcolor: alpha('#FF5630', 0.1),
                          color: '#FF5630',
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </motion.div>

        {/* High Absentee Departments */}
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          <SectionHeader
            icon="mdi:domain-off"
            title="High Absentee Departments"
            color="#FFAB00"
            tooltip="Departments with highest absence percentage"
          />
          <Stack spacing={1}>
            {HIGH_ABSENT_DEPTS.map((dept) => (
              <Stack key={dept.id} spacing={0.5}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="caption" fontWeight={600}>
                    {dept.dept}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {dept.absent}/{dept.total} ({dept.absenceRate}%)
                  </Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={dept.absenceRate}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    bgcolor: alpha('#FFAB00', 0.12),
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 3,
                      bgcolor: dept.absenceRate > 15 ? '#FF5630' : '#FFAB00',
                    },
                  }}
                />
              </Stack>
            ))}
          </Stack>
        </motion.div>

        {/* Low Working Hours */}
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          <SectionHeader
            icon="mdi:timer-sand"
            title="Low Working Hours"
            color="#8E33FF"
            tooltip="Employees not meeting required working hours"
          />
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.7rem' }}>Employee</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.7rem' }}>Hours</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.7rem' }}>
                    Deficit
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {LOW_HOURS.map((emp) => (
                  <TableRow key={emp.id} sx={{ '&:last-child td': { border: 0 } }}>
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Avatar
                          sx={{
                            width: 24,
                            height: 24,
                            fontSize: '0.65rem',
                            bgcolor: alpha('#8E33FF', 0.12),
                            color: '#8E33FF',
                          }}
                        >
                          {emp.name.charAt(0)}
                        </Avatar>
                        <Typography variant="caption" fontWeight={600}>
                          {emp.name}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary">
                        {emp.hours} / {emp.required}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Chip
                        label={`-${emp.deficit}`}
                        size="small"
                        sx={{
                          height: 22,
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          bgcolor: alpha('#8E33FF', 0.1),
                          color: '#8E33FF',
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </motion.div>

        {/* Repeated Offenders */}
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          <SectionHeader
            icon="mdi:account-alert-outline"
            title="Repeated Offenders"
            color="#00B8D9"
            tooltip="Employees frequently requesting corrections"
          />
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.7rem' }}>Employee</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.7rem' }}>Type</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.7rem' }}>
                    Count
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {REPEAT_OFFENDERS.map((emp) => (
                  <TableRow key={emp.id} sx={{ '&:last-child td': { border: 0 } }}>
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Avatar
                          sx={{
                            width: 24,
                            height: 24,
                            fontSize: '0.65rem',
                            bgcolor: alpha('#00B8D9', 0.12),
                            color: '#00B8D9',
                          }}
                        >
                          {emp.name.charAt(0)}
                        </Avatar>
                        <Typography variant="caption" fontWeight={600}>
                          {emp.name}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary">
                        {emp.type}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Chip
                        label={emp.corrections}
                        size="small"
                        sx={{
                          height: 22,
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          bgcolor: alpha('#00B8D9', 0.1),
                          color: '#00B8D9',
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </motion.div>
      </Box>
    </Card>
  );
};

export default AttendanceProblemDetection;
