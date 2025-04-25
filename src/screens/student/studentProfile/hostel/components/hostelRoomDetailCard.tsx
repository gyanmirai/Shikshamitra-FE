import React from 'react';

import { Box, Card, Stack, Divider, Typography } from '@mui/material';

import { Label } from 'src/components/label';

import type { IHostelRoomDetailCardProps } from './type';

const HostelRoomDetailCard: React.FC<IHostelRoomDetailCardProps> = ({
  label,
  value,
  color = 'primary',
}) => (
  <Card
    elevation={3}
    sx={{
      py: 2,
      textAlign: 'center',
      typography: 'h4',
      maxWidth: '250px',
      width: '100%',
    }}
  >
    <Stack
      direction="row"
      divider={<Divider orientation="vertical" flexItem sx={{ borderStyle: 'dashed' }} />}
    >
      <Stack width={1}>
        <Box fontSize="14px" display="flex" gap={2} justifyContent="center">
          <Typography variant="body2">{label}</Typography>
          <Label variant="soft" color={color} fontSize="12px" display="inline-block">
            {value}
          </Label>
        </Box>
      </Stack>
    </Stack>
  </Card>
);

export default HostelRoomDetailCard;
