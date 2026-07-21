'use client';

import React, { useCallback } from 'react';
import { Iconify } from 'src/components/iconify';
import {
  Box,
  Stack,
  Alert,
  Drawer,
  Button,
  Divider,
  Typography,
  CircularProgress,
} from '@mui/material';

import VersionSidebar from './version/VersionSidebar';
import VersionDiffTable from './version/VersionDiffTable';
import { useFinancePolicyVersion } from '../hooks/useFinancePolicyVersion';

import type { IFinancePolicyRow } from '../types/finance-policy.types';

type FinancePolicyVersionDrawerProps = {
  open: boolean;
  onClose: () => void;
  policy: IFinancePolicyRow | null;
};

export default function FinancePolicyVersionDrawer({
  open,
  onClose,
  policy,
}: FinancePolicyVersionDrawerProps) {
  const { versions, selectedVersion, selectedVersionId, setSelectedVersionId, isLoading, isError } =
    useFinancePolicyVersion({ open, policyId: policy?.id });

  /**
   * Memoization Justification:
   * Prevents creating a new callback function on every render, keeping props reference stable
   * for the memoized VersionSidebar component.
   */
  const handleSelectVersion = useCallback(
    (id: string) => {
      setSelectedVersionId(id);
    },
    [setSelectedVersionId]
  );

  if (!policy) return null;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', md: 720 },
          maxWidth: '100%',
        },
      }}
    >
      <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2.5 }}>
          <Stack spacing={0.5}>
            <Typography variant="h6" fontWeight={700}>
              Policy Version History
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Compare changes between different versions of &quot;{policy.policyName}&quot;
            </Typography>
          </Stack>
          <Button
            variant="outlined"
            size="small"
            onClick={onClose}
            startIcon={<Iconify icon="mdi:close" />}
          >
            Close
          </Button>
        </Stack>

        <Divider sx={{ mb: 2.5 }} />

        {isLoading ? (
          <Stack alignItems="center" justifyContent="center" sx={{ py: 10, flex: 1 }}>
            <CircularProgress size={36} />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Loading version history...
            </Typography>
          </Stack>
        ) : isError ? (
          <Alert severity="warning">Unable to load version history for this policy.</Alert>
        ) : versions.length === 0 ? (
          <Stack alignItems="center" justifyContent="center" sx={{ py: 10, flex: 1 }}>
            <Iconify
              icon="mdi:timeline-text-outline"
              sx={{ width: 48, height: 48, color: 'text.disabled', mb: 1.5 }}
            />
            <Typography variant="body2" color="text.secondary">
              No version history available for this policy.
            </Typography>
          </Stack>
        ) : (
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2.5}
            sx={{ flex: 1, minHeight: 0 }}
          >
            {/* Version List Sidebar */}
            <VersionSidebar
              versions={versions}
              selectedVersionId={selectedVersionId}
              onSelectVersion={handleSelectVersion}
            />

            {/* Version Changes Display */}
            <Box sx={{ flex: 1, overflowY: 'auto', pl: { sm: 0.5 } }}>
              {selectedVersion && <VersionDiffTable selectedVersion={selectedVersion} />}
            </Box>
          </Stack>
        )}
      </Box>
    </Drawer>
  );
}
