import { Iconify } from 'src/components/iconify';
import { Box, Stack, Typography } from '@mui/material';

import type { SubjectCapacityRow } from '../types';

interface ReviewAndLockSummaryProps {
  total: number;
  assigned: number;
  unassigned: number;
  subjectCapacity: SubjectCapacityRow[];
  preferenceMatchPct: number | null;
}

export function ReviewAndLockSummary({
  total,
  assigned,
  unassigned,
  subjectCapacity,
  preferenceMatchPct,
}: ReviewAndLockSummaryProps) {
  const summaryItems: Array<{
    label: string;
    value: number | string;
    icon: string;
    description: string;
  }> = [
    {
      label: 'Total students',
      value: total,
      icon: 'solar:users-group-rounded-linear',
      description: 'Students in this elective group',
    },
    {
      label: 'Assigned',
      value: assigned,
      icon: 'solar:check-circle-linear',
      description: 'Students with an elective',
    },
    {
      label: 'Unassigned',
      value: unassigned,
      icon: 'solar:user-cross-rounded-linear',
      description: 'Students who need an elective',
    },
    {
      label: 'Preference match',
      value: preferenceMatchPct === null ? 'N/A' : `${preferenceMatchPct}%`,
      icon: 'solar:star-linear',
      description:
        preferenceMatchPct === null ? 'Preference data unavailable' : 'Matched student preference',
    },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      <Box component="section" aria-labelledby="assignment-summary-heading">
        <Typography
          id="assignment-summary-heading"
          variant="subtitle2"
          fontWeight={700}
          sx={{ mb: 1 }}
        >
          Assignment summary
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gap: 1,
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, minmax(0, 1fr))',
            },
          }}
        >
          {summaryItems.map((item) => (
            <Box
              key={item.label}
              component="article"
              aria-label={`${item.label}: ${item.value}`}
              sx={{
                p: 2,
                minWidth: 0,
                minHeight: 124,
                border: 1,
                borderRadius: 2,
                borderColor: 'divider',
                bgcolor: 'background.paper',
              }}
            >
              <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
                <Typography
                  variant="h5"
                  sx={{ lineHeight: 1.15, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}
                >
                  {item.value}
                </Typography>
                <Iconify icon={item.icon} width={26} sx={{ color: 'text.secondary' }} />
              </Stack>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mt: 1.25 }}>
                {item.label}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {item.description}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      <Box component="section" aria-labelledby="subject-counts-heading">
        <Typography id="subject-counts-heading" variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
          Students by elective subject
        </Typography>
        {subjectCapacity.length > 0 ? (
          <Box
            sx={{
              display: 'grid',
              gap: 1,
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
            }}
          >
            {subjectCapacity.map((subject) => (
              <Box
                key={subject.subjectId}
                component="article"
                aria-label={`${subject.subjectName}: ${subject.assignedCount} ${
                  subject.assignedCount === 1 ? 'student' : 'students'
                }`}
                sx={{
                  p: 1.5,
                  gap: 1,
                  minWidth: 0,
                  display: 'flex',
                  border: 1,
                  borderRadius: 2,
                  alignItems: 'center',
                  borderColor: 'divider',
                  justifyContent: 'space-between',
                  bgcolor: 'background.paper',
                }}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="body2" fontWeight={600} noWrap>
                    {subject.subjectName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Assigned students
                  </Typography>
                </Box>
                <Typography
                  variant="h6"
                  sx={{ flexShrink: 0, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}
                >
                  {subject.assignedCount}
                </Typography>
              </Box>
            ))}
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No elective subject assignments are available.
          </Typography>
        )}
      </Box>
    </Box>
  );
}
