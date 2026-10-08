'use client';

import { Label } from 'src/components/label';
import React, { useMemo, useState } from 'react';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomTooltip from 'src/components/custom-tooltip';
import {
  Box,
  Stack,
  Paper,
  Button,
  TextField,
  Typography,
  IconButton,
  InputAdornment,
  ListItemButton,
} from '@mui/material';

import { formatVersionTimestamp } from './finance-policy-version-formatters';

import type { PolicyVersion } from '../../hooks/useFinancePolicyVersion';

interface VersionSidebarProps {
  versions: PolicyVersion[];
  selectedVersionId: string | null;
  onSelectVersion: (id: string) => void;
}

function VersionSidebar({ versions, selectedVersionId, onSelectVersion }: VersionSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const filteredVersions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return versions.filter((version) =>
      [
        `v${version.versionNumber}`,
        `Version ${version.versionNumber}`,
        version.actor,
        version.summary,
        formatVersionTimestamp(version.date),
      ].some((value) => value?.toLowerCase().includes(query))
    );
  }, [versions, searchQuery]);

  return (
    <Paper
      variant="outlined"
      sx={{
        height: 1,
        p: 1.5,
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 2,
        minHeight: 0,
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
        <Stack direction="row" spacing={0.5} alignItems="center">
          <Typography variant="subtitle1" component="h3">
            Versions
          </Typography>
          <CustomTooltip
            arrow
            placement="right"
            title="Versions are listed newest first. Latest marks the newest recorded snapshot, regardless of policy status. Search by version, author, date, or recorded reason."
          >
            <IconButton size="small" aria-label="Versions information">
              <Iconify icon="lucide:info" width={16} sx={{ color: 'info.main' }} aria-hidden />
            </IconButton>
          </CustomTooltip>
        </Stack>
        <Label color="default">
          {searchQuery.trim() ? `${filteredVersions.length} / ${versions.length}` : versions.length}
        </Label>
      </Stack>
      <TextField
        size="small"
        fullWidth
        value={searchQuery}
        onChange={(event) => setSearchQuery(event.target.value)}
        placeholder="Search versions…"
        label="Search versions"
        slotProps={{
          htmlInput: { 'aria-label': 'Search versions' },
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="eva:search-fill" width={18} sx={{ color: 'text.secondary' }} />
              </InputAdornment>
            ),
            endAdornment: searchQuery ? (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  aria-label="Clear version search"
                  onClick={() => setSearchQuery('')}
                >
                  <Iconify icon="mingcute:close-line" width={16} />
                </IconButton>
              </InputAdornment>
            ) : null,
          },
        }}
        sx={{ mb: 1.5 }}
      />
      <Scrollbar sx={{ flex: 1, minHeight: 0 }}>
        {filteredVersions.length === 0 ? (
          <Stack alignItems="center" spacing={1} sx={{ py: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No versions match your search.
            </Typography>
            <Button size="small" onClick={() => setSearchQuery('')}>
              Clear search
            </Button>
          </Stack>
        ) : (
          <Stack spacing={0.5}>
            {filteredVersions.map((version) => (
              <ListItemButton
                key={version.eventId}
                component="button"
                type="button"
                selected={version.eventId === selectedVersionId}
                aria-pressed={version.eventId === selectedVersionId}
                aria-label={`View version ${version.versionNumber}`}
                onClick={() => onSelectVersion(version.eventId)}
                sx={{
                  width: 1,
                  p: 1.5,
                  borderRadius: 1,
                  textAlign: 'left',
                  alignItems: 'flex-start',
                }}
              >
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Stack direction="row" spacing={1} alignItems="center" useFlexGap flexWrap="wrap">
                    <Typography variant="subtitle2" component="span">
                      Version {version.versionNumber}
                    </Typography>
                    {version.eventId === versions[0]?.eventId && (
                      <Label color="default">Latest</Label>
                    )}
                  </Stack>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                    sx={{ mt: 0.5 }}
                  >
                    {formatVersionTimestamp(version.date)}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                    sx={{ overflowWrap: 'anywhere' }}
                  >
                    {version.actor || 'System'}
                  </Typography>
                </Box>
              </ListItemButton>
            ))}
          </Stack>
        )}
      </Scrollbar>
    </Paper>
  );
}

export default React.memo(VersionSidebar);
