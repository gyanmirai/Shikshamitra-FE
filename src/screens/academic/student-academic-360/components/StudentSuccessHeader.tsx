'use client';

import { Iconify } from 'src/components/iconify';
import { GlobalIcons } from 'src/utils/icons';
import CustomTooltip from 'src/components/custom-tooltip';
import { Label } from 'src/components/label';
import { Box, Stack, Avatar, Tooltip, IconButton, Typography, Divider } from '@mui/material';

import { RegistrationStatusType, RegistrationStatusTypeColor } from 'src/enums/registration-status-type';
import { readText, getStudentName, readOptionalText } from '../types';
import { HealthScoreGauge } from './HealthScoreGauge';

import type { LabelColor } from 'src/components/label';
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

const trendMeta = (trend?: string): { icon: string; color: LabelColor; label: string } => {
  const normalized = (trend || '').toLowerCase();
  if (normalized.includes('improv') || normalized.includes('up')) {
    return { icon: 'mdi:trending-up', color: 'success', label: 'Improving' };
  }
  if (normalized.includes('declin') || normalized.includes('down') || normalized.includes('drop')) {
    return { icon: 'mdi:trending-down', color: 'error', label: 'Declining' };
  }
  return { icon: 'mdi:trending-neutral', color: 'default', label: trend || 'Monitoring' };
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
  let statusColor: LabelColor = 'success';

  if (rawStatus !== undefined && rawStatus !== null) {
    if (typeof rawStatus === 'number') {
      statusLabel = RegistrationStatusType[rawStatus] || 'Active';
      statusColor = (RegistrationStatusTypeColor[rawStatus as RegistrationStatusType] as LabelColor) || 'success';
    } else if (typeof rawStatus === 'string') {
      const parsed = Number(rawStatus);
      if (!Number.isNaN(parsed)) {
        statusLabel = RegistrationStatusType[parsed] || 'Active';
        statusColor = (RegistrationStatusTypeColor[parsed as RegistrationStatusType] as LabelColor) || 'success';
      } else {
        statusLabel = rawStatus;
        const found = Object.values(RegistrationStatusType).indexOf(rawStatus);
        if (found !== -1) {
          statusColor = (RegistrationStatusTypeColor[found as RegistrationStatusType] as LabelColor) || 'success';
        }
      }
    }
  }

  const standardName = readText(student.standardName ?? student.standard, 'Class');
  const divisionName = readText(student.divisionName ?? student.division, '');
  const classDivisionLabel = divisionName ? `${standardName} - ${divisionName}` : standardName;
  const attendanceValue = findKpi(kpis, 'attendance');

  const healthStatusColor: LabelColor =
    health?.status?.toLowerCase().includes('support') || health?.status?.toLowerCase().includes('urgent')
      ? 'warning'
      : health?.score && health.score >= 75
        ? 'success'
        : 'info';

  return (
    <Box
      sx={{
        p: 1.5,
        bgcolor: 'background.paper',
        borderBottom: 1,
        borderColor: 'divider',
      }}
    >
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={1.5}
        alignItems={{ xs: 'flex-start', md: 'center' }}
        justifyContent="space-between"
      >
        {/* Left: Avatar & Identity Details */}
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ flex: 1, minWidth: 0 }}>
          <Avatar
            src={photoUrl || undefined}
            alt={name}
            sx={{
              width: { xs: 48, md: 52 },
              height: { xs: 48, md: 52 },
              fontSize: { xs: 18, md: 20 },
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
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" sx={{ mb: 0.25 }}>
              <Typography variant="subtitle1" fontWeight={700} noWrap sx={{ maxWidth: { xs: 200, sm: 340, md: 450 }, fontSize: '1.05rem' }}>
                {name || 'Student'}
              </Typography>

              <CustomTooltip
                title="Comprehensive 360° student academic dossier: health diagnosis, attendance, assignments, and exam analytics"
                placement="top"
                arrow
              >
                <IconButton size="small" sx={{ p: 0.25, color: 'text.secondary', width: 22, height: 22 }}>
                  <Iconify icon={GlobalIcons.info} width={15} />
                </IconButton>
              </CustomTooltip>

              <Label color={statusColor} variant="soft" sx={{ height: 20, fontWeight: 600, fontSize: 11 }}>
                {statusLabel}
              </Label>
            </Stack>

            {/* Secondary line: Academic metadata */}
            <Stack direction="row" alignItems="center" flexWrap="wrap" gap={0.75} sx={{ color: 'text.secondary', fontSize: 12 }}>
              <Typography variant="body2" color="text.secondary" fontWeight={500} sx={{ fontSize: 12 }} noWrap>
                {classDivisionLabel}
              </Typography>
              {student.rollNo && (
                <>
                  <Typography variant="caption" color="text.disabled">•</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: 12 }}>
                    Roll No. <strong>{readText(student.rollNo)}</strong>
                  </Typography>
                </>
              )}
              {student.grNo && (
                <>
                  <Typography variant="caption" color="text.disabled">•</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: 12 }}>
                    GR No. <strong>{readText(student.grNo)}</strong>
                  </Typography>
                </>
              )}
              {student.academicMediumName && (
                <>
                  <Typography variant="caption" color="text.disabled">•</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: 12 }}>
                    {student.academicMediumName}
                  </Typography>
                </>
              )}
              {student.academicYearName && (
                <>
                  <Typography variant="caption" color="text.disabled">•</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: 12 }}>
                    {student.academicYearName}
                  </Typography>
                </>
              )}
            </Stack>

            {/* Tertiary line: Compact Status badges using common Label */}
            <Stack direction="row" flexWrap="wrap" gap={0.75} sx={{ mt: 0.75 }}>
              <Label
                variant="outlined"
                color="default"
                startIcon={<Iconify icon="mdi:calendar-check-outline" width={13} />}
                sx={{ height: 22, fontSize: 11, borderRadius: 1 }}
              >
                {`Attendance: ${attendanceValue}`}
              </Label>

              <Label
                variant="outlined"
                color={trend.color}
                startIcon={<Iconify icon={trend.icon} width={13} />}
                sx={{ height: 22, fontSize: 11, borderRadius: 1 }}
              >
                {`Trend: ${health?.trend || trend.label}`}
              </Label>

              {health?.status && (
                <Label
                  variant="soft"
                  color={healthStatusColor}
                  startIcon={<Iconify icon="mdi:heart-pulse" width={13} />}
                  sx={{ height: 22, fontSize: 11, fontWeight: 600, borderRadius: 1 }}
                >
                  {health.status}
                </Label>
              )}
            </Stack>
          </Box>
        </Stack>

        {/* Right: Academic Health Gauge & Navigation Controls */}
        <Stack
          direction="row"
          spacing={1.5}
          alignItems="center"
          sx={{
            alignSelf: { xs: 'flex-end', md: 'center' },
            flexShrink: 0,
          }}
        >
          {/* Health Gauge */}
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{
              p: 0.75,
              pr: 1.25,
              borderRadius: 1.5,
              bgcolor: (theme) => `${theme.palette.primary.main}08`,
              border: 1,
              borderColor: (theme) => `${theme.palette.primary.main}1A`,
            }}
          >
            <HealthScoreGauge score={health?.score} size={42} thickness={4.5} showSubtext={false} />
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600, fontSize: 11, lineHeight: 1.2 }}>
                Academic Health
              </Typography>
              <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10 }}>
                {health?.score !== null && health?.score !== undefined ? `${health.score} / 100` : 'No score'}
              </Typography>
            </Box>
          </Stack>

          <Divider orientation="vertical" flexItem sx={{ height: 28, my: 'auto', display: { xs: 'none', sm: 'block' } }} />

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
                    width: 34,
                    height: 34,
                  }}
                >
                  <Iconify icon="mdi:chevron-left" width={18} />
                </IconButton>
              </span>
            </Tooltip>

            <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ px: 0.75, minWidth: 48, textAlign: 'center', fontSize: 12 }}>
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
                    width: 34,
                    height: 34,
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
                width: 34,
                height: 34,
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
