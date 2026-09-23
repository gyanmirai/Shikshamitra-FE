import type { ReactNode } from 'react';

import dayjs from 'dayjs';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { Iconify } from 'src/components/iconify';
import Typography from '@mui/material/Typography';

import { StatusBadge } from './StatusBadge';

import type { ReviewItem } from './ReviewCard';

type ReviewCardHeaderProps = {
  item: ReviewItem;
};

const ContextItem = ({ icon, children }: { icon: string; children: ReactNode }) => (
  <Stack direction="row" spacing={0.5} alignItems="center">
    <Iconify icon={icon} width={15} sx={{ color: 'text.secondary', flexShrink: 0 }} />
    <Typography variant="caption" color="text.secondary" noWrap>
      {children}
    </Typography>
  </Stack>
);

export const ReviewCardHeader = ({ item }: ReviewCardHeaderProps) => {
  const formattedDate = item.submittedDate ? dayjs(item.submittedDate).format('DD MMM YYYY') : '—';

  return (
    <Stack spacing={1.25}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
        <Box sx={{ minWidth: 0 }}>
          <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mb: 0.25 }}>
            <Iconify
              icon="solar:document-text-outline"
              width={17}
              sx={{ color: 'text.secondary' }}
            />
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              {item.lessonType || 'Lesson Plan'}
            </Typography>
          </Stack>
          <Typography variant="subtitle1" fontWeight={700} noWrap>
            {item.teacherName}
          </Typography>
        </Box>

        <StatusBadge status={item.status} showIcon showTooltip={false} />
      </Stack>

      <Stack direction="row" spacing={1.5} useFlexGap flexWrap="wrap">
        <ContextItem icon="solar:users-group-two-rounded-outline">{item.classDivision}</ContextItem>
        <ContextItem icon="solar:notebook-outline">{item.subjectName}</ContextItem>
        <ContextItem icon="solar:calendar-outline">{formattedDate}</ContextItem>
      </Stack>
    </Stack>
  );
};
