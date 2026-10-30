'use client';

import type { PolicyVersion } from 'src/screens/finance/policies/hooks/useFinancePolicyVersion';

import { useId, useMemo, useState, useEffect } from 'react';
import { alpha } from '@mui/material/styles';
import { Box, Alert, Stack, Paper, Drawer, Button, Typography } from '@mui/material';

import { GlobalIcons } from 'src/utils/icons';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import VersionSidebar from 'src/screens/finance/policies/components/version/VersionSidebar';
import VersionDiffTable from 'src/screens/finance/policies/components/version/VersionDiffTable';
import FinancePolicySkeleton from 'src/screens/finance/policies/components/FinancePolicySkeleton';
import FinancePolicyDrawerHeader from 'src/screens/finance/policies/components/FinancePolicyDrawerHeader';

import {
  formatHistoryField,
  formatHistoryValue,
  formatHistoryAction,
  type AccountSettingHistoryItem,
} from './account-setting-history-formatters';

interface Props {
  open: boolean;
  title: string;
  recordType: string;
  hiddenFields?: string[];
  data?: { items?: AccountSettingHistoryItem[]; totalCount?: number };
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  onClose: () => void;
}

// Setting codes and names are literal audit values, not policy enums or reference lookups.
const renderCategoryValue = (field: string, value: unknown) => {
  if (field === 'Status' && (value === 'Active' || value === 'Inactive')) {
    return <Label color={value === 'Active' ? 'success' : 'error'}>{value}</Label>;
  }
  return (
    <Typography variant="body2" sx={{ overflowWrap: 'anywhere', whiteSpace: 'pre-wrap' }}>
      {String(value)}
    </Typography>
  );
};

export default function AccountCategoryVersionDrawer({
  open,
  title,
  recordType,
  hiddenFields,
  data,
  isLoading,
  isError,
  onRetry,
  onClose,
}: Props) {
  const titleId = useId();
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);
  useEffect(() => {
    setSelectedVersionId(null);
  }, [open, title]);

  const versions = useMemo<PolicyVersion[]>(
    () =>
      [...(data?.items ?? [])]
        .sort((a, b) => b.versionNumber - a.versionNumber)
        .map((item) => ({
          eventId: item.id,
          versionNumber: item.versionNumber,
          actor:
            item.changeAction === 'unavailable'
              ? 'Editor not recorded'
              : item.actorName || (item.actorId ? 'Unknown user' : 'System'),
          date: item.changeTime || '',
          createdAt: item.changeTime || '',
          action: item.changeAction,
          status: formatHistoryAction(item.changeAction),
          summary: formatHistoryAction(item.changeAction),
          changedFields:
            item.changeAction === 'unavailable'
              ? []
              : (item.changedFields ?? [])
                  .filter(
                    (field) =>
                      !hiddenFields?.some(
                        (hidden) => hidden.toLowerCase() === field.fieldName.toLowerCase()
                      )
                  )
                  .map((field) => ({
                    field: formatHistoryField(field.fieldName),
                    oldValue: formatHistoryValue(field.originalValue, field.fieldName),
                    newValue: formatHistoryValue(field.newValue, field.fieldName),
                  })),
        })),
    [data, hiddenFields]
  );
  const selectedVersion =
    versions.find((version) => version.eventId === selectedVersionId) ?? versions[0];
  const drawerTitle = `${recordType.replace(/\b\w/g, (letter) => letter.toUpperCase())} Version History`;

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
        'aria-labelledby': titleId,
        sx: { width: { xs: '100%', sm: 'min(960px, 96vw)' }, maxWidth: '100%' },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: 1,
          minHeight: 0,
          bgcolor: 'background.neutral',
        }}
      >
        <FinancePolicyDrawerHeader
          title={drawerTitle}
          titleId={titleId}
          helpText={`${title}. Review recorded changes, who made them, and the values before and after each change. Select a version from the newest-first list. Times use ${Intl.DateTimeFormat().resolvedOptions().timeZone}.`}
          badges={<Label>Read Only</Label>}
          onClose={onClose}
        />
        {isLoading ? (
          <Box sx={{ p: 2, flex: 1, minHeight: 0, overflow: 'auto' }}>
            <FinancePolicySkeleton label="Loading version history" />
          </Box>
        ) : isError ? (
          <Box sx={{ p: 3, flex: 1 }}>
            <Alert
              severity="error"
              action={
                onRetry && (
                  <Button size="small" color="inherit" onClick={onRetry}>
                    Retry
                  </Button>
                )
              }
            >
              Version history could not be loaded. Please try again.
            </Alert>
          </Box>
        ) : selectedVersion ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              flex: 1,
              minHeight: 0,
              overflow: 'hidden',
              p: 2,
              gap: 1,
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
                key={`${title}-${open}`}
                versions={versions}
                selectedVersionId={selectedVersion.eventId}
                onSelectVersion={setSelectedVersionId}
              />
            </Box>
            <Scrollbar sx={{ flex: 1, minHeight: 0, minWidth: 0 }}>
              <Stack spacing={1} sx={{ pr: { xs: 0.5, sm: 1 }, pb: 1 }}>
                <VersionDiffTable
                  selectedVersion={selectedVersion}
                  renderFieldValue={renderCategoryValue}
                  collapsibleChanges
                />
                {selectedVersion.changedFields.length === 0 &&
                  ['unavailable', 'created'].includes(selectedVersion.action) && (
                    <Alert severity="info">
                      {selectedVersion.action === 'unavailable'
                        ? 'Changes and editor were not recorded for this older version.'
                        : 'Record created. Field-level details were not recorded.'}
                    </Alert>
                  )}
              </Stack>
            </Scrollbar>
          </Box>
        ) : (
          <Box sx={{ p: 3, flex: 1 }}>
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, textAlign: 'center' }}>
              <Typography variant="subtitle2">No history recorded yet</Typography>
              <Typography variant="body2" color="text.secondary">
                Recorded changes to this {recordType.toLowerCase()} will appear here.
              </Typography>
            </Paper>
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
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1,
            flexShrink: 0,
          }}
        >
          <Typography variant="caption" color="text.secondary" role="status">
            {!isLoading && !isError && versions.length > 0
              ? `Showing ${versions.length} of ${data?.totalCount ?? versions.length} recorded versions`
              : 'Read-only history'}
          </Typography>
          <Button
            variant="outlined"
            size="small"
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
