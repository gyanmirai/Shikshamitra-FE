'use client';

import { Iconify } from 'src/components/iconify';
import { GlobalIcons } from 'src/utils/icons';
import CustomTooltip from 'src/components/custom-tooltip';
import { Box, Chip, Stack, Button, Avatar, Tooltip, IconButton, Typography } from '@mui/material';

import { RegistrationStatusType, RegistrationStatusTypeColor } from 'src/enums/registration-status-type';
import { readText, getStudentName } from '../types';
import { HealthScoreGauge } from './HealthScoreGauge';

import type { Academic360Kpi, Academic360Health, Academic360StudentRow } from '../types';

type StudentSuccessHeaderProps = {
  student: Academic360StudentRow;
  health?: Academic360Health | null;
  kpis?: Academic360Kpi[];
  currentIndex: number;
  totalStudents: number;
  onPrevious: () => void;
  onNext: () => void;
  onClose: () => void;
  canGoPrevious: boolean;
  canGoNext: boolean;
};

const findKpi = (kpis: Academic360Kpi[] | undefined, key: string) =>
  kpis?.find((kpi) => kpi.key === key)?.displayValue || 'No data';

const trendMeta = (trend?: string) => {
  const normalized = (trend || '').toLowerCase();
  if (normalized.includes('improv') || normalized.includes('up')) {
    return { icon: 'mdi:trending-up', color: 'success.main' as const };
  }
  if (normalized.includes('declin') || normalized.includes('down') || normalized.includes('drop')) {
    return { icon: 'mdi:trending-down', color: 'error.main' as const };
  }
  return { icon: 'mdi:trending-neutral', color: 'text.secondary' as const };
};

export function StudentSuccessHeader({
  student,
  health,
  kpis,
  currentIndex,
  totalStudents,
  onPrevious,
  onNext,
  onClose,
  canGoPrevious,
  canGoNext,
}: StudentSuccessHeaderProps) {
  const name = getStudentName(student);
  const trend = trendMeta(health?.trend);

  return (
    <Box
      sx={{
        p: 2.5,
        bgcolor: 'background.paper',
        borderBottom: 1,
        borderColor: 'divider',
        backgroundImage: (theme) =>
          `linear-gradient(180deg, ${theme.palette.primary.lighter ?? theme.palette.primary.light}14, transparent)`,
      }}
    >
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} alignItems={{ md: 'center' }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ flex: 1, minWidth: 0 }}>
          <Avatar
            sx={{
              width: 60,
              height: 60,
              fontSize: 24,
              fontWeight: 600,
              bgcolor: 'primary.main',
              boxShadow: (theme) => `0 0 0 3px ${theme.palette.background.paper}, 0 0 0 5px ${theme.palette.primary.main}33`,
            }}
          >
            {name.charAt(0).toUpperCase() || 'S'}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
              <Typography variant="h6" noWrap>
                {name || 'Student'}
              </Typography>
              <CustomTooltip title="360° academic performance overview, attendance metrics & intervention history" placement="right" arrow>
                <Iconify
                  icon={GlobalIcons.info}
                  color="info.main"
                  width={16}
                  height={16}
                  sx={{ cursor: 'pointer' }}
                />
              </CustomTooltip>
              {(() => {
                const rawStatus = student.operationalStatus ?? student.status;
                let statusLabel = 'Active';
                let statusColor: 'success' | 'warning' | 'error' | 'info' | 'default' = 'success';

                if (rawStatus !== undefined && rawStatus !== null) {
                  if (typeof rawStatus === 'number') {
                    statusLabel = RegistrationStatusType[rawStatus] || 'Active';
                    statusColor = (RegistrationStatusTypeColor[rawStatus as RegistrationStatusType] as any) || 'success';
                  } else if (typeof rawStatus === 'string') {
                    const parsed = Number(rawStatus);
                    if (!Number.isNaN(parsed)) {
                      statusLabel = RegistrationStatusType[parsed] || 'Active';
                      statusColor = (RegistrationStatusTypeColor[parsed as RegistrationStatusType] as any) || 'success';
                    } else {
                      statusLabel = rawStatus;
                      const found = Object.values(RegistrationStatusType).indexOf(rawStatus);
                      if (found !== -1) {
                        statusColor = (RegistrationStatusTypeColor[found as RegistrationStatusType] as any) || 'success';
                      }
                    }
                  }
                }

                return (
                  <Chip
                    size="small"
                    color={statusColor}
                    variant="soft"
                    label={statusLabel}
                  />
                );
              })()}
            </Stack>
            <Typography variant="body2" color="text.secondary" noWrap>
              {readText(student.standardName ?? student.standard, 'Class')}{' '}
              {readText(student.divisionName ?? student.division, '')}
              {' · '}Roll No. {readText(student.rollNo)}
              {' · '}GR No. {readText(student.grNo)}
              {' · '}{readText(student.academicMediumName, 'Medium')}
            </Typography>
            <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 1 }}>
              <Chip
                size="small"
                variant="soft"
                icon={<Iconify icon="mdi:calendar-check-outline" width={14} />}
                label={`Attendance: ${findKpi(kpis, 'attendance')}`}
              />
              <Chip
                size="small"
                variant="soft"
                icon={<Iconify icon={trend.icon} width={14} sx={{ color: trend.color }} />}
                label={`Trend: ${health?.trend || 'No data'}`}
              />
              <Chip
                size="small"
                variant="soft"
                color={health?.score ? 'success' : 'default'}
                label={health?.status || 'Insufficient Data'}
              />
            </Stack>
          </Box>
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center" sx={{ pl: { md: 1 } }}>
          <HealthScoreGauge score={health?.score} size={72} thickness={4} />
          <Typography variant="caption" color="text.secondary" sx={{ maxWidth: 90, display: { xs: 'none', lg: 'block' } }}>
            Academic Health
          </Typography>
        </Stack>

        <Stack direction="row" alignItems="center" spacing={1}>
          <Tooltip title="Previous student">
            <span>
              <IconButton aria-label="Previous student" disabled={!canGoPrevious} onClick={onPrevious}>
                <Iconify icon="mdi:chevron-left" />
              </IconButton>
            </span>
          </Tooltip>
          <Typography variant="caption" color="text.secondary" sx={{ minWidth: 56, textAlign: 'center' }}>
            {totalStudents > 0 ? `${currentIndex + 1} of ${totalStudents}` : '-'}
          </Typography>
          <Tooltip title="Next student">
            <span>
              <IconButton aria-label="Next student" disabled={!canGoNext} onClick={onNext}>
                <Iconify icon="mdi:chevron-right" />
              </IconButton>
            </span>
          </Tooltip>
          <IconButton aria-label="Close Student Academic 360" onClick={onClose}>
            <Iconify icon="mdi:close" />
          </IconButton>
        </Stack>
      </Stack>
    </Box>
  );
}
