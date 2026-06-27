'use client';

import React from 'react';
import { Box, List, Typography, ListItemText, ListItemButton } from '@mui/material';

import type { PolicyVersion } from '../../hooks/useFinancePolicyVersion';

interface VersionSidebarProps {
  versions: PolicyVersion[];
  selectedVersionId: string | null;
  onSelectVersion: (id: string) => void;
}

function VersionSidebar({ versions, selectedVersionId, onSelectVersion }: VersionSidebarProps) {
  return (
    <Box
      sx={{
        width: { xs: '100%', sm: 200 },
        flexShrink: 0,
        borderRight: { sm: '1px solid' },
        borderColor: 'divider',
        overflowY: 'auto',
        pr: { sm: 1.5 },
      }}
    >
      <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
        Versions
      </Typography>
      <List sx={{ p: 0 }}>
        {versions.map((ver) => (
          <ListItemButton
            key={ver.eventId}
            selected={ver.eventId === selectedVersionId}
            onClick={() => onSelectVersion(ver.eventId)}
            sx={{
              borderRadius: 1,
              mb: 0.75,
              '&.Mui-selected': {
                bgcolor: 'primary.lighter',
                color: 'primary.darker',
                fontWeight: 600,
                '&:hover': {
                  bgcolor: 'primary.lighter',
                },
              },
            }}
          >
            <ListItemText
              primary={`Version ${ver.versionNumber}`}
              secondary={ver.date.split(',')[0]}
              primaryTypographyProps={{
                variant: 'body2',
                fontWeight: ver.eventId === selectedVersionId ? 700 : 500,
              }}
              secondaryTypographyProps={{ variant: 'caption' }}
            />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );
}

/**
 * Memoization Justification:
 * Memoized version sidebar avoids re-rendering the list of versions
 * when other parts of the drawer (like selection data) update.
 */
export default React.memo(VersionSidebar);
