'use client';

import React from 'react';
import dayjs from 'dayjs';
import { Label } from 'src/components/label';
import { Box, List, Stack, Typography, ListItemText, ListItemButton } from '@mui/material';
import { alpha } from '@mui/material/styles';

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
        width: { xs: '100%', sm: 220 },
        flexShrink: 0,
        borderRight: { sm: '1px solid' },
        borderColor: 'divider',
        overflowY: 'auto',
        pr: { sm: 1.5 },
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
        <Typography variant="subtitle2" fontWeight={700}>
          Versions
        </Typography>
        <Label color="default" sx={{ height: 20, fontSize: '0.65rem' }}>
          {versions.length} total
        </Label>
      </Stack>

      <List sx={{ p: 0 }}>
        {versions.map((ver) => {
          const isSelected = ver.eventId === selectedVersionId;
          const formattedDate = ver.date ? dayjs(ver.date).format('DD-MM-YYYY') : '—';

          return (
            <ListItemButton
              key={ver.eventId}
              selected={isSelected}
              onClick={() => onSelectVersion(ver.eventId)}
              sx={{
                borderRadius: 1.25,
                mb: 0.75,
                p: 1.25,
                border: '1px solid',
                borderColor: isSelected ? 'primary.main' : 'transparent',
                bgcolor: isSelected ? (theme) => alpha(theme.palette.primary.main, 0.08) : 'transparent',
                '&:hover': {
                  bgcolor: (theme) =>
                    isSelected
                      ? alpha(theme.palette.primary.main, 0.12)
                      : alpha(theme.palette.action.hover, 0.6),
                },
              }}
            >
              <ListItemText
                primary={
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography
                      variant="body2"
                      fontWeight={isSelected ? 700 : 500}
                      color={isSelected ? 'primary.main' : 'text.primary'}
                    >
                      v{ver.versionNumber}
                    </Typography>
                    {isSelected && (
                      <Label color="primary" sx={{ height: 16, fontSize: '0.6rem' }}>
                        Active
                      </Label>
                    )}
                  </Stack>
                }
                secondary={
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.25 }}>
                    {formattedDate} · {ver.actor || 'System'}
                  </Typography>
                }
              />
            </ListItemButton>
          );
        })}
      </List>
    </Box>
  );
}

export default React.memo(VersionSidebar);
