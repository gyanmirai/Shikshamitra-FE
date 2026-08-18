'use client';

import React from 'react';
import {
  Box,
  Drawer,
  Stack,
  Button,
  Typography,
  IconButton,
  Card,
  Chip,
  Divider,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import type { AISuggestion } from '../types';

interface AIAssistantDrawerProps {
  open: boolean;
  onClose: () => void;
  suggestions: AISuggestion[];
  onAcceptSuggestion: (suggestion: AISuggestion) => void;
  onIgnoreSuggestion: (id: string) => void;
}

export default function AIAssistantDrawer({
  open,
  onClose,
  suggestions,
  onAcceptSuggestion,
  onIgnoreSuggestion,
}: AIAssistantDrawerProps) {
  const theme = useTheme();

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100vw', sm: 420 },
          p: 0,
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 2.5,
          py: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          bgcolor: 'background.paper',
        }}
      >
        <Stack direction="row" spacing={1.25} alignItems="center">
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 1.5,
              bgcolor: 'action.hover',
              color: 'text.primary',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <Iconify icon="mdi:star-shooting-outline" width={18} />
          </Box>
          <Box>
            <Typography variant="subtitle1" fontWeight={700}>
              AI Assessment Copilot
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Real-time blueprint balance &amp; question suggestions
            </Typography>
          </Box>
        </Stack>

        <IconButton size="small" onClick={onClose}>
          <Iconify icon="mdi:close" width={20} />
        </IconButton>
      </Box>

      {/* Body with Scrollbar */}
      <Scrollbar sx={{ flex: 1, p: 2.5, bgcolor: alpha(theme.palette.grey[500], 0.02) }}>
        {suggestions.length === 0 ? (
          <Box
            sx={{
              py: 6,
              px: 2,
              textAlign: 'center',
              borderRadius: 2,
              border: '1px dashed',
              borderColor: 'divider',
              bgcolor: 'background.paper',
            }}
          >
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 2,
                bgcolor: 'success.lighter',
                color: 'success.main',
                display: 'grid',
                placeItems: 'center',
                mx: 'auto',
                mb: 1.5,
              }}
            >
              <Iconify icon="mdi:check-circle-outline" width={22} />
            </Box>
            <Typography variant="subtitle2" fontWeight={700}>
              Blueprint Balanced
            </Typography>
            <Typography variant="caption" color="text.secondary">
              No AI recommendations required. All marks, bloom taxonomy, and chapter coverage rules are satisfied!
            </Typography>
          </Box>
        ) : (
          <Stack spacing={1.75}>
            {suggestions.map((item) => (
              <Card
                key={item.id}
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'background.paper',
                }}
              >
                <Stack spacing={1.25}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Chip
                      size="small"
                      label={item.type === 'gap' ? 'Blueprint Gap' : item.type === 'imbalance' ? 'Imbalance' : 'Recommendation'}
                      color={item.type === 'gap' ? 'warning' : 'info'}
                      variant="soft"
                      sx={{ height: 20, fontSize: '0.7rem', fontWeight: 700 }}
                    />
                    <IconButton size="small" color="default" onClick={() => onIgnoreSuggestion(item.id)}>
                      <Iconify icon="mdi:close" width={14} />
                    </IconButton>
                  </Stack>

                  <Typography variant="subtitle2" fontWeight={700}>
                    {item.title}
                  </Typography>

                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.82rem', lineHeight: 1.5 }}>
                    {item.description}
                  </Typography>

                  <Divider sx={{ my: 0.5 }} />

                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Button size="small" variant="outlined" color="inherit" onClick={() => onIgnoreSuggestion(item.id)}>
                      Ignore
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      color="primary"
                      onClick={() => onAcceptSuggestion(item)}
                      startIcon={<Iconify icon="mdi:star-shooting-outline" width={14} />}
                    >
                      {item.actionText || 'Accept Suggestion'}
                    </Button>
                  </Stack>
                </Stack>
              </Card>
            ))}
          </Stack>
        )}
      </Scrollbar>
    </Drawer>
  );
}
