import type { LabelColor } from 'src/components/label';

import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import CustomTooltip from 'src/components/custom-tooltip';
import { Box, Stack, Avatar, IconButton, Typography } from '@mui/material';

import { readText, getStudentName, readOptionalText } from '../types';
import { StudentAcademicHeaderBadges } from './StudentAcademicHeaderBadges';

import type { Academic360Kpi, Academic360Health, Academic360StudentRow } from '../types';

type StudentSuccessIdentityProps = {
  student: Academic360StudentRow;
  health?: Academic360Health | null;
  kpis?: Academic360Kpi[];
  statusLabel: string;
  statusColor: LabelColor;
};

export function StudentSuccessIdentity({ student, health, kpis, statusLabel, statusColor }: StudentSuccessIdentityProps) {
  const name = getStudentName(student);
  const photoUrl = readOptionalText(student.profileImageUrl ?? student.photoUrl);
  const standardName = readText(student.standardName ?? student.standard, 'Class');
  const divisionName = readText(student.divisionName ?? student.division, '');
  const classDivisionLabel = divisionName ? `${standardName} - ${divisionName}` : standardName;

  return (
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
            title="Student academic health, attendance, learning tasks and examination results."
            placement="top"
            arrow
          >
            <IconButton
              size="small"
              aria-label="Academic 360 information"
              color="info"
              sx={{ width: 44, height: 44 }}
            >
              <Iconify icon={GlobalIcons.info} width={16} />
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

        <StudentAcademicHeaderBadges health={health} kpis={kpis} />
      </Box>
    </Stack>
  );
}
