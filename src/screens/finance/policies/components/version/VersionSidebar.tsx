'use client';

import React, { useState, useMemo } from 'react';
import dayjs from 'dayjs';
import { varAlpha } from 'src/theme/styles';
import { Label } from 'src/components/label';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomTooltip from 'src/components/custom-tooltip';
import {
  Box,
  Card,
  Stack,
  Button,
  TextField,
  Typography,
  IconButton,
  InputAdornment,
} from '@mui/material';

import type { PolicyVersion } from '../../hooks/useFinancePolicyVersion';

interface VersionSidebarProps {
  versions: PolicyVersion[];
  selectedVersionId: string | null;
  onSelectVersion: (id: string) => void;
}

function VersionSidebar({ versions, selectedVersionId, onSelectVersion }: VersionSidebarProps) {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredVersions = useMemo(() => {
    if (!searchQuery.trim()) return versions;
    const query = searchQuery.toLowerCase().trim();

    return versions.filter((ver) => {
      const vNum = `v${ver.versionNumber}`.toLowerCase();
      const actor = (ver.actor || '').toLowerCase();
      const summary = (ver.summary || '').toLowerCase();
      const date = ver.date ? dayjs(ver.date).format('DD-MM-YYYY').toLowerCase() : '';

      return (
        vNum.includes(query) ||
        actor.includes(query) ||
        summary.includes(query) ||
        date.includes(query)
      );
    });
  }, [versions, searchQuery]);

  return (
    <Card
      sx={{
        height: '100%',
        p: 1.5,
        boxShadow: 'var(--shadows-4)',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 2,
        border: `1px solid ${theme.palette.divider}`,
        bgcolor: 'background.paper',
        minHeight: 0,
      }}
    >
      {/* Navigator Top Header */}
      <Box sx={{ pb: 1.5, mb: 1, borderBottom: `1px solid ${theme.palette.divider}` }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.25 }}>
          <Stack direction="row" alignItems="center" spacing={0.75}>
            <Iconify icon="solar:history-bold-duotone" width={20} sx={{ color: 'primary.main' }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 700, letterSpacing: 0.5 }}>
              VERSIONS
            </Typography>
          </Stack>
          <Label variant="soft" color="default" sx={{ height: 20, fontWeight: 700, fontSize: 11 }}>
            {filteredVersions.length} {searchQuery ? `of ${versions.length}` : 'total'}
          </Label>
        </Stack>

        {/* Search Input */}
        <TextField
          size="small"
          fullWidth
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search versions..."
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="eva:search-fill" width={16} sx={{ color: 'text.disabled' }} />
                </InputAdornment>
              ),
              endAdornment: searchQuery ? (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearchQuery('')} sx={{ p: 0.25 }}>
                    <Iconify icon="eva:close-fill" width={14} />
                  </IconButton>
                </InputAdornment>
              ) : null,
              sx: {
                height: 34,
                fontSize: '0.8125rem',
                bgcolor: varAlpha(theme.palette.grey['500Channel'], 0.04),
              },
            },
          }}
        />
      </Box>

      {/* Version List with Common Scrollbar */}
      <Scrollbar sx={{ flexGrow: 1, minHeight: 0, pr: 0.5 }}>
        {filteredVersions.length === 0 ? (
          <Box sx={{ py: 5, px: 2, textAlign: 'center' }}>
            <Iconify
              icon="solar:magnifer-broken"
              width={40}
              sx={{ color: 'text.disabled', mb: 1, opacity: 0.6 }}
            />
            <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600 }}>
              No versions found
            </Typography>
            <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 0.5 }}>
              No versions match &quot;{searchQuery}&quot;
            </Typography>
            {searchQuery && (
              <Button
                size="small"
                variant="text"
                onClick={() => setSearchQuery('')}
                sx={{ mt: 1, fontSize: '0.75rem' }}
              >
                Clear filter
              </Button>
            )}
          </Box>
        ) : (
          <Stack spacing={1.5}>
            <Box>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ px: 1, py: 0.5, mb: 0.5 }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 700,
                    color: 'text.disabled',
                    letterSpacing: 0.8,
                    textTransform: 'uppercase',
                  }}
                >
                  Revision History
                </Typography>
                <Label variant="soft" color="primary" sx={{ height: 18, fontSize: 10 }}>
                  {filteredVersions.length}
                </Label>
              </Stack>

              <Stack spacing={0.5}>
                {filteredVersions.map((ver, index) => {
                  const isSelected = ver.eventId === selectedVersionId;
                  const formattedDate = ver.date ? dayjs(ver.date).format('DD-MM-YYYY') : '—';
                  const isLatest = index === 0 && !searchQuery;

                  return (
                    <CustomTooltip
                      key={ver.eventId}
                      title={ver.summary || `Version ${ver.versionNumber}`}
                      arrow
                      placement="right"
                      disableHoverListener={!ver.summary || ver.summary.length < 24}
                    >
                      <Box
                        onClick={() => onSelectVersion(ver.eventId)}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          p: 1,
                          cursor: 'pointer',
                          borderRadius: 1.5,
                          transition: 'all 0.15s ease-in-out',
                          bgcolor: isSelected
                            ? varAlpha(theme.palette.primary.mainChannel, 0.08)
                            : 'transparent',
                          borderLeft: isSelected
                            ? `3px solid ${theme.palette.primary.main}`
                            : '3px solid transparent',
                          '&:hover': {
                            bgcolor: isSelected
                              ? varAlpha(theme.palette.primary.mainChannel, 0.12)
                              : 'action.hover',
                          },
                        }}
                      >
                        {/* Left accent indicator strip */}
                        <Box
                          sx={{
                            width: 4,
                            height: 24,
                            borderRadius: 1,
                            bgcolor: isSelected
                              ? theme.palette.primary.main
                              : varAlpha(theme.palette.grey['500Channel'], 0.35),
                            flexShrink: 0,
                          }}
                        />

                        <Box sx={{ minWidth: 0, flex: 1 }}>
                          <Stack direction="row" alignItems="center" spacing={0.75}>
                            <Typography
                              variant="body2"
                              noWrap
                              sx={{
                                fontWeight: isSelected ? 700 : 500,
                                color: isSelected ? 'primary.main' : 'text.primary',
                                fontSize: '0.8125rem',
                              }}
                            >
                              v{ver.versionNumber}
                            </Typography>

                            {isLatest && (
                              <Label
                                variant="soft"
                                color="success"
                                sx={{ height: 16, fontSize: '0.625rem', px: 0.5, fontWeight: 700 }}
                              >
                                Active
                              </Label>
                            )}
                          </Stack>

                          <Typography
                            variant="caption"
                            sx={{
                              color: 'text.secondary',
                              fontSize: '0.7rem',
                              display: 'block',
                              mt: 0.25,
                            }}
                            noWrap
                          >
                            {formattedDate} · {ver.actor || 'System'}
                          </Typography>
                        </Box>

                        {isSelected && (
                          <Iconify
                            icon="eva:checkmark-fill"
                            width={16}
                            sx={{ color: 'primary.main', flexShrink: 0 }}
                          />
                        )}
                      </Box>
                    </CustomTooltip>
                  );
                })}
              </Stack>
            </Box>
          </Stack>
        )}
      </Scrollbar>
    </Card>
  );
}

export default React.memo(VersionSidebar);
