'use client';

import dayjs from 'dayjs';
import React, { memo } from 'react';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Box, Card, Divider, Typography } from '@mui/material';

import type { ISchoolWiseAnnouncement } from '../../type';

interface Props {
  formikValues: ISchoolWiseAnnouncement;
}

/**
 * Sub-component for Type Badges to keep main component clean
 */
const TypeBadges = memo(({ types }: { types: ISchoolWiseAnnouncement['type'] }) => {
  if (!types || types.length === 0) return null;

  return (
    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
      {types.map((t) => (
        <Label
          key={t.announcementType}
          variant="soft"
          sx={{
            fontWeight: 600,
            fontSize: '10px',
            borderRadius: 1,
            backgroundColor: `${t.color}20`,
            color: t.color || 'primary.main',
            border: `1px solid ${t.color}40`,
            cursor: 'default',
            '&:hover': {
              backgroundColor: `${t.color}20`,
              boxShadow: 'none',
            },
          }}
        >
          {t.announcementType}
        </Label>
      ))}
    </Box>
  );
});

TypeBadges.displayName = 'TypeBadges';

/**
 * Sub-component for Footer to keep main component clean
 */
const CardFooter = memo(
  ({
    createdBy,
    startDate,
  }: {
    createdBy?: string;
    startDate?: ISchoolWiseAnnouncement['startDate'];
  }) => (
    <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1}>
      <Box display="flex" alignItems="center" gap={1}>
        <Iconify icon="solar:user-bold" width={16} />
        <Typography variant="body2" color="text.secondary">
          {createdBy || 'Prerna Bhanudas Atre'}
        </Typography>
      </Box>

      <Box display="flex" alignItems="center" gap={1}>
        <Iconify icon="solar:calendar-bold" width={16} />
        <Typography variant="body2" color="text.secondary">
          {startDate ? dayjs(startDate).format('MMM DD, YYYY, hh:mm A') : '-'}
        </Typography>
      </Box>
    </Box>
  )
);

CardFooter.displayName = 'CardFooter';

const SchoolWiseAnnouncementCard = ({ formikValues }: Props) => {
  const { title, description, createdBy, type, importance_level, startDate } = formikValues;

  return (
    <Card
      sx={{
        p: 2,
        borderRadius: 2,
        boxShadow: 'var(--shadows-4)',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        position: 'relative',
        borderLeft: importance_level?.color
          ? `6px solid ${importance_level.color}`
          : '6px solid transparent',
        backgroundColor: importance_level?.color
          ? `${importance_level.color}15`
          : 'background.paper',
        transition: '0.3s ease',
        '&:hover': {
          boxShadow: 6,
          transform: 'translateY(-2px)',
        },
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {title}
        </Typography>

        <TypeBadges types={type} />
      </Box>

      <Box
        component="div"
        sx={{
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          typography: 'body2',
          color: 'text.secondary',
        }}
        dangerouslySetInnerHTML={{ __html: description }}
      />

      <Divider sx={{ borderStyle: 'dashed' }} />

      <CardFooter createdBy={createdBy} startDate={startDate} />
    </Card>
  );
};

/**
 * Memoization Justification:
 * Component is pure and receives form values. Memoizing prevents re-renders
 * as the user types in other parts of the form (if this is used in a larger form context),
 * unless these specific values change.
 */
export default memo(SchoolWiseAnnouncementCard);
