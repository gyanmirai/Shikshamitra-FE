'use client';

import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import React, { useMemo, useCallback } from 'react';
import { Scrollbar } from 'src/components/scrollbar';
import CustomTooltip from 'src/components/custom-tooltip';
import {
  Box,
  Stack,
  Alert,
  Paper,
  Drawer,
  Button,
  Typography,
  IconButton,
  CircularProgress,
} from '@mui/material';
import { alpha } from '@mui/material/styles';

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
  const {
    versions,
    selectedVersion,
    selectedVersionId,
    setSelectedVersionId,
    isLoading,
    isError,
  } = useFinancePolicyVersion({
    open,
    policyId: policy?.id,
    policyType: policy?.policyType,
  });

  const valueContext = useMemo(() => {
    const labelsById: Record<string, string> = {};

    if (policy?.id) labelsById[policy.id.toLowerCase()] = policy.policyName;
    if (policy?.academicYearId && policy.academicYearName) {
      labelsById[policy.academicYearId.toLowerCase()] = policy.academicYearName;
    }

    return { labelsById };
  }, [policy]);

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
      slotProps={{
        backdrop: {
          sx: {
            bgcolor: 'rgba(15, 23, 42, 0.44)',
            backdropFilter: 'blur(3px)',
          },
        },
      }}
      PaperProps={{
        sx: {
          width: { xs: '100%', md: 880 },
          maxWidth: '100%',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          boxShadow: '-8px 0 24px -4px rgba(0, 0, 0, 0.08)',
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          bgcolor: 'background.paper',
        }}
      >
        {/* Drawer Header */}
        <Box
          sx={{
            px: { xs: 2, sm: 3 },
            py: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid',
            borderColor: 'divider',
            bgcolor: (theme) =>
              theme.palette.mode === 'dark'
                ? alpha(theme.palette.background.default, 0.5)
                : alpha(theme.palette.grey[50], 0.8),
            flexShrink: 0,
            gap: 2,
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 1.25,
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                color: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Iconify icon={GlobalIcons.newversion} width={22} height={22} />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                <Typography variant="h6" fontWeight={700} noWrap>
                  Policy Version History
                </Typography>
                <CustomTooltip
                  title="Compare configuration revisions, parameter modifications, and reasons for changes across policy versions"
                  placement="right"
                  arrow
                >
                  <Iconify
                    icon={GlobalIcons.info}
                    color="info.main"
                    width={16}
                    height={16}
                    sx={{ cursor: 'pointer' }}
                  />
                </CustomTooltip>
                <Label color="primary" sx={{ height: 20, fontSize: '0.7rem' }}>
                  {policy.policyName}
                </Label>
              </Stack>
              <Typography variant="caption" color="text.secondary">
                Track version diffs and compare parameter changes across revisions.
              </Typography>
            </Box>
          </Stack>

          <IconButton
            onClick={onClose}
            sx={{
              p: 0.75,
              color: 'text.secondary',
              '&:hover': { bgcolor: 'action.hover' },
            }}
          >
            <Iconify icon="mdi:close" width={20} height={20} />
          </IconButton>
        </Box>

        {/* Content Body */}
        {isLoading ? (
          <Stack alignItems="center" justifyContent="center" sx={{ py: 10, flex: 1 }}>
            <CircularProgress size={32} />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Loading version history...
            </Typography>
          </Stack>
        ) : isError ? (
          <Box sx={{ p: 3 }}>
            <Alert severity="warning" sx={{ borderRadius: 1.5 }}>
              Unable to load version history for this policy.
            </Alert>
          </Box>
        ) : versions.length === 0 ? (
          <Box
            sx={{
              p: 4,
              textAlign: 'center',
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Paper
              variant="outlined"
              sx={{
                p: 4,
                maxWidth: 420,
                textAlign: 'center',
                borderRadius: 1.5,
                borderStyle: 'dashed',
              }}
            >
              <Iconify
                icon="solar:history-bold-duotone"
                width={48}
                height={48}
                sx={{ color: 'text.disabled', mb: 1.5 }}
              />
              <Typography variant="subtitle2" fontWeight={600} color="text.secondary">
                No version history recorded yet.
              </Typography>
              <Typography variant="caption" color="text.disabled" display="block" sx={{ mt: 0.5 }}>
                Subsequent updates and activations will create incremental version snapshots.
              </Typography>
            </Paper>
          </Box>
        ) : (
          <Box
            sx={{
              display: 'flex',
              flex: 1,
              minHeight: 0,
              overflow: 'hidden',
              p: { xs: 1.5, sm: 2 },
              gap: 2,
            }}
          >
            {/* Version List Sidebar */}
            <Box
              sx={{
                width: { xs: '100%', sm: 260, md: 280 },
                height: '100%',
                flexShrink: 0,
                minHeight: 0,
              }}
            >
              <VersionSidebar
                versions={versions}
                selectedVersionId={selectedVersionId}
                onSelectVersion={handleSelectVersion}
              />
            </Box>

            {/* Version Changes Display */}
            <Scrollbar sx={{ flex: 1, minHeight: 0 }}>
              <Box sx={{ pr: { xs: 0.5, sm: 1 }, pb: 4 }}>
                {selectedVersion && (
                  <VersionDiffTable
                    selectedVersion={selectedVersion}
                    valueContext={valueContext}
                  />
                )}
              </Box>
            </Scrollbar>
          </Box>
        )}

        {/* Footer */}
        <Box
          sx={{
            p: 2,
            bgcolor: 'background.neutral',
            borderTop: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            justifyContent: 'flex-end',
            flexShrink: 0,
          }}
        >
          <Button
            variant="outlined"
            size="small"
            color="inherit"
            onClick={onClose}
            startIcon={<Iconify icon={GlobalIcons.cancel} />}
          >
            Close
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
}
