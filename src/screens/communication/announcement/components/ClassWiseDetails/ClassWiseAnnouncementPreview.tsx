import React from 'react';
import dayjs from 'dayjs';
import { Iconify } from 'src/components/iconify';
import { Box, Card, Chip, Divider, Typography } from '@mui/material';

import type { IClassWiseAnnouncement } from '../../type';

interface Props {
  formikValues: IClassWiseAnnouncement;
}

export default function ClassWiseAnnouncementCard({ formikValues }: Props) {
  const { title, description, createdBy, cratedOn, type, importance_level } = formikValues;

  return (
    <Card
      sx={{
        p: 2,
        borderRadius: 2,
        boxShadow: 2,
        mb: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
      }}
    >
      {/* Tags */}
      <Box display="flex" alignItems="center" gap={1}>
        {importance_level && (
          <Chip
            label={importance_level.levelName}
            color="error"
            size="small"
            sx={{
              fontWeight: 600,
              fontSize: '12px',
              borderRadius: 1,
            }}
          />
        )}
        {type?.map((t) => (
          <Chip
            key={t.announcementType}
            label={t.announcementType}
            variant="outlined"
            size="small"
            sx={{
              fontWeight: 600,
              fontSize: '12px',
              borderRadius: 1,
              color: 'primary.main',
              borderColor: 'primary.main',
            }}
          />
        ))}
      </Box>

      {/* Title */}
      <Typography variant="h6" sx={{ fontWeight: 700 }}>
        {title}
      </Typography>

      {/* Description */}
      <Box
        component="p"
        sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
        dangerouslySetInnerHTML={{ __html: description }}
      />

      <Divider sx={{ my: 1 }} />

      {/* Footer (Created by + Date) */}
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
            {cratedOn ? dayjs(cratedOn).format('MMM DD, YYYY, hh:mm A') : '-'}
          </Typography>
        </Box>
      </Box>
    </Card>
  );
}
