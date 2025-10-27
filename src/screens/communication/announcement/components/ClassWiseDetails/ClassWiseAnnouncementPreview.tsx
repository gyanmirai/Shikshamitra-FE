import React from 'react';
import dayjs from 'dayjs';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Box, Card, Divider, Typography } from '@mui/material';

import type { IClassWiseAnnouncement } from '../../type';

interface Props {
  formikValues: IClassWiseAnnouncement;
}

export default function ClassWiseAnnouncementCard({ formikValues }: Props) {
  const { title, description, createdBy, cratedOn, type, importance_level, startDate } =
    formikValues;

  return (
    <Card
      sx={{
        p: 2,
        borderRadius: 2,
        boxShadow: 'var(--shadows-4)',
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        position: 'relative',
        borderLeft: importance_level?.color
          ? `6px solid ${importance_level.color}`
          : '6px solid transparent',
        backgroundColor: importance_level?.color
          ? `${importance_level.color}15` // adds slight tint
          : 'background.paper',
        transition: '0.3s ease',
        '&:hover': {
          boxShadow: 6,
          transform: 'translateY(-2px)',
        },
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: 700 }}>
        {title}
      </Typography>
      {/* Top-left type badge */}
      {type?.length > 0 && (
        <Box
          sx={{
            top: 3,
            left: 3,
            display: 'flex',
            gap: 0.5,
          }}
        >
          {type.map((t) => (
            <Label
              key={t.announcementType}
              variant="soft"
              sx={{
                fontWeight: 600,
                fontSize: '10px',
                borderRadius: 1,
                backgroundColor: `${t.color}20`, // soft tint
                color: t.color || 'primary.main',
                border: `1px solid ${t.color}40`, // subtle border
                cursor: 'default', // prevent pointer hover if not clickable
                '&:hover': {
                  backgroundColor: `${t.color}20`, // same color, no hover change
                  boxShadow: 'none',
                },
              }}
            >
              {t.announcementType}
            </Label>
          ))}
        </Box>
      )}

      {/* Description */}
      <Box
        component="p"
        sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
        dangerouslySetInnerHTML={{ __html: description }}
      />

      <Divider sx={{ my: 1 }} />

      {/* Footer */}
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        flexWrap="wrap"
        gap={1}
      >
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
    </Card>
  );
}
