'use client';

import { Iconify } from 'src/components/iconify';
import { GlobalIcons } from 'src/utils/icons';
import CustomTooltip from 'src/components/custom-tooltip';
import { Box, Chip, Stack, Avatar, Tooltip, IconButton, Typography, Divider } from '@mui/material';

import { RegistrationStatusType, RegistrationStatusTypeColor } from 'src/enums/registration-status-type';
import { readText, getStudentName, readOptionalText } from '../types';
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
    return { icon: 'mdi:trending-up', color: 'success.main' as const, label: 'Improving' };
  }
  if (normalized.includes('declin') || normalized.includes('down') || normalized.includes('drop')) {
    return { icon: 'mdi:trending-down', color: 'error.main' as const, label: 'Declining' };
  }
  return { icon: 'mdi:trending-neutral', color: 'text.secondary' as const, label: trend || 'Monitoring' };
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
  const photoUrl = readOptionalText(student.profileImageUrl ?? student.photoUrl);

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

  const standardName = readText(student.standardName ?? student.standard, 'Class');
  const divisionName = readText(student.divisionName ?? student.division, '');
  const classDivisionLabel = divisionName ? `${standardName} - ${divisionName}` : standardName;
  const attendanceValue = findKpi(kpis, 'attendance');

  return (
    <Box
      sx={{
        px: { xs: 2, md: 3 },
        py: 2,
        bgcolor: 'background.paper',
        borderBottom: 1,
        borderColor: 'divider',
      }}
    >
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        alignItems={{ xs: 'flex-start', md: 'center' }}
        justifyContent="space-between"
      >
        {/* Left: Avatar & Identity Details */}
        <Stack direction="row" spacing={2} alignItems="center" sx={{ flex: 1, minWidth: 0 }}>
          <Avatar
            src={photoUrl || undefined}
            alt={name}
            sx={{
              width: { xs: 52, md: 60 },
              height: { xs: 52, md: 60 },
              fontSize: { xs: 20, md: 24 },
              fontWeight: 700,
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              border: (theme) => `2px solid ${theme.palette.background.paper}`,
              boxShadow: (theme) => `0 0 0 2px ${theme.palette.primary.main}30`,
              flexShrink: 0,
            }}
          >
            {name.charAt(0).toUpperCase() || 'S'}
          </Avatar>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            {/* Primary line: Name + Info + Status */}
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" sx={{ mb: 0.5 }}>
              <Typography variant="h6" fontWeight={700} noWrap sx={{ maxWidth: { xs: 200, sm: 340, md: 450 } }}>
                {name || 'Student'}
              </Typography>

              <CustomTooltip
                title="Comprehensive 360° student academic dossier: health diagnosis, attendance, assignments, and exam analytics"
                placement="top"
                arrow
              >
                <IconButton size="small" sx={{ p: 0.25, color: 'text.secondary' }}>
                  <Iconify icon={GlobalIcons.info} width={16} />
                </IconButton>
              </CustomTooltip>

              <Chip
                size="small"
                color={statusColor}
                variant="soft"
                label={statusLabel}
                sx={{ height: 22, fontWeight: 600, fontSize: 11 }}
              />
            </Stack>

            {/* Secondary line: Academic metadata */}
            <Stack direction="row" alignItems="center" flexWrap="wrap" gap={0.75} sx={{ color: 'text.secondary', fontSize: 13 }}>
              <Typography variant="body2" color="text.secondary" fontWeight={500} noWrap>
                {classDivisionLabel}
              </Typography>
              {student.rollNo && (
                <>
                  <Typography variant="caption" color="text.disabled">•</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Roll No. <strong>{readText(student.rollNo)}</strong>
                  </Typography>
                </>
              )}
              {student.grNo && (
                <>
                  <Typography variant="caption" color="text.disabled">•</Typography>
                  <Typography variant="body2" color="text.secondary">
                    GR No. <strong>{readText(student.grNo)}</strong>
                  </Typography>
                </>
              )}
              {student.academicMediumName && (
                <>
                  <Typography variant="caption" color="text.disabled">•</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {student.academicMediumName}
                  </Typography>
                </>
              )}
              {student.academicYearName && (
                <>
                  <Typography variant="caption" color="text.disabled">•</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {student.academicYearName}
                  </Typography>
                </>
              )}
            </Stack>

            {/* Tertiary line: Status badges */}
            <Stack direction="row" flexWrap="wrap" gap={0.75} sx={{ mt: 1 }}>
              <Chip
                size="small"
                variant="outlined"
                icon={<Iconify icon="mdi:calendar-check-outline" width={14} />}
                label={`Attendance: ${attendanceValue}`}
                sx={{ height: 24, fontSize: 12, borderRadius: 1 }}
              />
              <Chip
                size="small"
                variant="outlined"
                icon={<Iconify icon={trend.icon} width={14} sx={{ color: trend.color }} />}
                label={`Trend: ${health?.trend || trend.label}`}
                sx={{ height: 24, fontSize: 12, borderRadius: 1 }}
              />
              {health?.status && (
                <Chip
                  size="small"
                  variant="soft"
                  color={
                    health.status.toLowerCase().includes('support') || health.status.toLowerCase().includes('urgent')
                      ? 'warning'
                      : health.score && health.score >= 75
                        ? 'success'
                        : 'info'
                  }
                  icon={<Iconify icon="mdi:heart-pulse" width={14} />}
                  label={health.status}
                  sx={{ height: 24, fontSize: 12, fontWeight: 600, borderRadius: 1 }}
                />
              )}
            </Stack>
          </Box>
        </Stack>

        {/* Right: Academic Health Gauge & Navigation Controls */}
        <Stack
          direction="row"
          spacing={{ xs: 1.5, sm: 2 }}
          alignItems="center"
          sx={{
            alignSelf: { xs: 'flex-end', md: 'center' },
            flexShrink: 0,
          }}
        >
          {/* Health Gauge */}
          <Stack
            direction="row"
            spacing={1.25}
            alignItems="center"
            sx={{
              p: 0.75,
              pr: 1.5,
              borderRadius: 1.5,
              bgcolor: (theme) => `${theme.palette.primary.main}08`,
              border: 1,
              borderColor: (theme) => `${theme.palette.primary.main}1A`,
            }}
          >
            <HealthScoreGauge score={health?.score} size={48} thickness={4.5} showSubtext={false} />
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600, fontSize: 11 }}>
                Academic Health
              </Typography>
              <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10 }}>
                {health?.score !== null && health?.score !== undefined ? `${health.score} / 100` : 'No score'}
              </Typography>
            </Box>
          </Stack>

          <Divider orientation="vertical" flexItem sx={{ height: 32, my: 'auto', display: { xs: 'none', sm: 'block' } }} />

          {/* Student Pagination / Quick Switch */}
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <Tooltip title="Previous student (Left arrow)">
              <span>
                <IconButton
                  size="small"
                  aria-label="Previous student"
                  disabled={!canGoPrevious}
                  onClick={onPrevious}
                  sx={{
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1,
                    p: 0.75,
                  }}
                >
                  <Iconify icon="mdi:chevron-left" width={18} />
                </IconButton>
              </span>
            </Tooltip>

            <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ px: 1, minWidth: 50, textAlign: 'center' }}>
              {totalStudents > 0 ? `${currentIndex + 1} of ${totalStudents}` : '-'}
            </Typography>

            <Tooltip title="Next student (Right arrow)">
              <span>
                <IconButton
                  size="small"
                  aria-label="Next student"
                  disabled={!canGoNext}
                  onClick={onNext}
                  sx={{
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1,
                    p: 0.75,
                  }}
                >
                  <Iconify icon="mdi:chevron-right" width={18} />
                </IconButton>
              </span>
            </Tooltip>
          </Stack>

          {/* Close Button */}
          <Tooltip title="Close (Esc)">
            <IconButton
              size="small"
              aria-label="Close Student Academic 360"
              onClick={onClose}
              sx={{
                bgcolor: (theme) => `${theme.palette.grey[500]}10`,
                borderRadius: 1,
                p: 0.75,
                '&:hover': {
                  bgcolor: (theme) => `${theme.palette.error.main}14`,
                  color: 'error.main',
                },
              }}
            >
              <Iconify icon="mdi:close" width={18} />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>
    </Box>
  );
}

