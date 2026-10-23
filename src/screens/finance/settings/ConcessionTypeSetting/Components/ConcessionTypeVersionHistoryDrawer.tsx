'use client';

import type { PolicyVersion } from 'src/screens/finance/policies/hooks/useFinancePolicyVersion';

import { Label } from 'src/components/label';
import { alpha } from '@mui/material/styles';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useMemo, useState, useEffect } from 'react';
import { Scrollbar } from 'src/components/scrollbar';
import { useGetConcessionTypeVersionHistoryQuery } from 'src/redux/finance/concessionType';
import VersionSidebar from 'src/screens/finance/policies/components/version/VersionSidebar';
import { Box, Alert, Stack, Button, Drawer, Typography, LinearProgress } from '@mui/material';
import VersionDiffTable from 'src/screens/finance/policies/components/version/VersionDiffTable';
import FinancePolicySkeleton from 'src/screens/finance/policies/components/FinancePolicySkeleton';
import FinancePolicyDrawerHeader from 'src/screens/finance/policies/components/FinancePolicyDrawerHeader';

interface ConcessionTypeVersionHistoryDrawerProps {
  open: boolean;
  concessionTypeId: string | null;
  concessionTypeName?: string;
  onClose: () => void;
  onBackToDetails?: () => void;
}

const formatAction = (action: string) =>
  action
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const displayFieldValue = (fieldName: string, value?: string | null) => {
  if (value === null || value === undefined || value === '' || value.toLowerCase() === 'null')
    return null;
  if (fieldName === 'DiscountType') {
    if (value === '0') return 'Percentage';
    if (value === '1') return 'Flat amount';
  }
  if (fieldName === 'IsActive') {
    if (value.toLowerCase() === 'true') return 'Active';
    if (value.toLowerCase() === 'false') return 'Inactive';
  }
  return value;
};

export default function ConcessionTypeVersionHistoryDrawer({
  open,
  concessionTypeId,
  concessionTypeName,
  onClose,
  onBackToDetails,
}: ConcessionTypeVersionHistoryDrawerProps) {
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);
  const {
    currentData: data,
    isFetching,
    isError,
    refetch,
  } = useGetConcessionTypeVersionHistoryQuery(
    { concessionTypeId: concessionTypeId ?? '', maxResultCount: 50 },
    { skip: !open || !concessionTypeId }
  );

  useEffect(() => {
    setSelectedVersionId(null);
  }, [open, concessionTypeId]);

  const versions = useMemo<PolicyVersion[]>(
    () =>
      [...(data?.data?.items ?? [])]
        .sort((left, right) => right.versionNumber - left.versionNumber)
        .map((version) => ({
          eventId: version.id,
          versionNumber: version.versionNumber,
          actor: version.actorName || 'System',
          date: version.changeTime,
          createdAt: version.changeTime,
          action: version.changeAction,
          status: formatAction(version.changeAction),
          summary: formatAction(version.changeAction),
          changedFields: version.changedFields.map((field) => ({
            field: field.fieldName === 'DiscountType' ? 'Legacy discount type' : field.fieldName,
            oldValue: displayFieldValue(field.fieldName, field.originalValue),
            newValue: displayFieldValue(field.fieldName, field.newValue),
          })),
        })),
    [data]
  );
  const selectedVersion =
    versions.find((version) => version.eventId === selectedVersionId) ?? versions[0];

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{
        backdrop: { sx: { bgcolor: (theme) => alpha(theme.palette.common.black, 0.32) } },
      }}
      PaperProps={{
        role: 'dialog',
        'aria-modal': true,
        'aria-labelledby': 'concession-type-version-title',
        sx: { width: { xs: '100%', sm: 'min(960px, 96vw)' }, maxWidth: '100%' },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          minHeight: 0,
          bgcolor: 'background.neutral',
        }}
      >
        <FinancePolicyDrawerHeader
          title="Concession Type Version History"
          titleId="concession-type-version-title"
          helpText={`Review recorded changes${concessionTypeName ? ` for ${concessionTypeName}` : ''}. Select a version to see its author, date, and Before/After values. Viewing history does not change the concession type.`}
          badges={<Label>Read Only</Label>}
          onClose={onClose}
        />
        {isFetching && <LinearProgress aria-label="Loading concession type version history" />}
        {isError ? (
          <Box sx={{ p: 3, flex: 1 }}>
            <Alert
              severity="error"
              action={
                <Button color="inherit" size="small" onClick={() => refetch()}>
                  Retry
                </Button>
              }
            >
              Unable to load concession type version history.
            </Alert>
          </Box>
        ) : !data && isFetching ? (
          <Scrollbar sx={{ flex: 1, minHeight: 0 }}>
            <Box sx={{ p: 2 }}>
              <FinancePolicySkeleton label="Loading concession type versions" />
            </Box>
          </Scrollbar>
        ) : selectedVersion ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              flex: 1,
              minHeight: 0,
              overflow: 'hidden',
              p: 2,
              gap: 2,
            }}
          >
            <Box
              sx={{
                width: { xs: '100%', md: 240 },
                height: { xs: 208, md: '100%' },
                flexShrink: 0,
                minHeight: 0,
              }}
            >
              <VersionSidebar
                key={`${concessionTypeId}-${open}`}
                versions={versions}
                selectedVersionId={selectedVersion.eventId}
                onSelectVersion={setSelectedVersionId}
              />
            </Box>
            <Scrollbar sx={{ flex: 1, minHeight: 0, minWidth: 0 }}>
              <Stack spacing={2} sx={{ pr: { xs: 0.5, sm: 1 }, pb: 1, minWidth: 0 }}>
                <VersionDiffTable selectedVersion={selectedVersion} />
                {selectedVersion.changedFields.length === 0 && (
                  <Alert severity="info">
                    {selectedVersion.action === 'created'
                      ? 'Initial concession type record.'
                      : 'No field-level changes were recorded for this version. The original change cannot be reconstructed.'}
                  </Alert>
                )}
              </Stack>
            </Scrollbar>
          </Box>
        ) : (
          <Box sx={{ p: 3, flex: 1 }}>
            <Typography variant="body2" color="text.secondary">
              No version history is available for this concession type.
            </Typography>
          </Box>
        )}
        <Box
          sx={{
            px: 2,
            py: 1.5,
            bgcolor: 'background.paper',
            borderTop: 1,
            borderColor: 'divider',
            display: 'flex',
            justifyContent: onBackToDetails ? 'space-between' : 'flex-end',
            flexShrink: 0,
          }}
        >
          {onBackToDetails && (
            <Button
              size="small"
              variant="outlined"
              startIcon={<Iconify icon={GlobalIcons.retrunIcon} />}
              onClick={onBackToDetails}
            >
              Back to details
            </Button>
          )}
          <Button
            size="small"
            variant="outlined"
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
