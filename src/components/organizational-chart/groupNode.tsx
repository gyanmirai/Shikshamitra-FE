// GroupNode.tsx
import { alpha } from '@mui/system';
import { Box, Stack, Avatar, Typography } from '@mui/material';

import type { NodeProps } from './types'; // Adjust import path if needed

export function GroupNode({
  name,
  role,
  group,
  avatarUrl,
  color,
  type = 'subject', // default to subject
}: NodeProps & { type?: 'class' | 'subject' }) {
  const isClass = type === 'class';

  return (
    <Stack alignItems="center" spacing={1}>
      {/* Avatar card */}
      <Box
        sx={{
          p: 2,
          borderRadius: 2,
          bgcolor: 'background.paper',
          boxShadow: 3,
          textAlign: 'center',
          width: 150,
          ...(isClass && {
            borderTop: '2px solid #000',
          }),
          color: color || '#000',
          ...(!isClass &&
            color && {
              backgroundColor: alpha(color, 0.2),
            }),
        }}
      >
        {avatarUrl && (
          <Avatar src={avatarUrl} alt={name} sx={{ width: 56, height: 56, mx: 'auto', mb: 1 }} />
        )}
        <Typography variant="subtitle1" noWrap>
          {isClass ? name : `${name} (${role})`}
        </Typography>
      </Box>
    </Stack>
  );
}
