import React from 'react';

import { Box, Card, Stack, Button, Divider, Typography, CardContent } from '@mui/material';

import { Iconify } from 'src/components/iconify';

import type { ILearningResourceCardProps } from '../type';
// Component to display learning resource information in a card format
const LearningResourceCard: React.FC<ILearningResourceCardProps> = ({
  resourceTitle,
  resourceType,
  className,
  subject,
  dateUploaded,
}: ILearningResourceCardProps) => (
  <Card sx={{ width: 344, height: 235, borderRadius: 4 }}>
    <CardContent>
      {/* Top PDF icon and title */}
      <Box display="flex" alignItems="center" gap={2}>
        <Iconify icon="mdi:file-pdf-box" width={40} height={40} color="#f44336" />
        <Typography variant="h6" fontWeight="bold">
          {resourceTitle}
        </Typography>
      </Box>

      <Divider sx={{ my: 1.5 }} />

      {/* Resource details */}
      <Box display="flex" gap={2} color="gray">
        <Box display="flex" flexDirection="column" justifyContent="space-between" gap={1}>
          <Box display="flex" alignItems="center" gap={1}>
            <Iconify icon="mdi:chart-box-outline" />
            <Typography variant="body2">Type : {resourceType}</Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <Iconify icon="mdi:clock-outline" />
            <Typography variant="body2">Class : {className}</Typography>
          </Box>
        </Box>

        <Box display="flex" flexDirection="column" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1}>
            <Iconify icon="mdi:book-outline" />
            <Typography variant="body2">Subject : {subject}</Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <Iconify icon="mdi:calendar-account-outline" />
            <Typography variant="body2">Date : {dateUploaded}</Typography>
          </Box>
        </Box>
      </Box>

      <Divider sx={{ my: 1.5 }} />

      {/* Action buttons */}
      <Stack direction="row" spacing={2} justifyContent="right">
        <Button
          variant="contained"
          size="small"
          sx={{
            backgroundColor: '#ff5722',
            borderRadius: 1,
            px: 3,
            fontWeight: 'bold',
            '&:hover': { backgroundColor: '#e64a19' },
          }}
          startIcon={<Iconify icon="mdi:download" />}
        >
          Download
        </Button>
        <Button
          variant="contained"
          size="small"
          sx={{
            backgroundColor: '#212121',
            borderRadius: 1,
            px: 3,
            fontWeight: 'bold',
            '&:hover': { backgroundColor: '#000' },
          }}
          startIcon={<Iconify icon="mdi:share-variant" />}
        >
          Share
        </Button>
      </Stack>
    </CardContent>
  </Card>
);

export default LearningResourceCard;
