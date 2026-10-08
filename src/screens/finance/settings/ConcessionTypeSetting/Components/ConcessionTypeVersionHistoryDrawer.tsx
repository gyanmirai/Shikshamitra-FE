'use client';

import type { ConcessionTypeVersionHistoryItem } from 'src/redux/finance/concessionType';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { fDateTime } from 'src/utils/format-time';
import { Scrollbar } from 'src/components/scrollbar';
import { DrawerHeader } from 'src/screens/hr/policies/components/HRPolicySharedUI';
import { useGetConcessionTypeVersionHistoryQuery } from 'src/redux/finance/concessionType';
import {
  Box,
  Alert,
  Paper,
  Stack,
  Button,
  Drawer,
  Divider,
  Typography,
  LinearProgress,
} from '@mui/material';

interface ConcessionTypeVersionHistoryDrawerProps {
  open: boolean;
  concessionTypeId: string | null;
  concessionTypeName?: string;
  onClose: () => void;
}

const formatAction = (action: string) =>
  action
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const formatFieldName = (fieldName: string) => {
  if (fieldName === 'DiscountType') return 'Legacy discount type';
  return fieldName
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const displayValue = (value?: string | null) => {
  if (value === null || value === undefined || value === '' || value.toLowerCase() === 'null')
    return 'Not set';
  if (value.toLowerCase() === 'true') return 'Active';
  if (value.toLowerCase() === 'false') return 'Inactive';
  return value;
};

const displayFieldValue = (fieldName: string, value?: string | null) => {
  if (fieldName === 'DiscountType') {
    if (value === '0') return 'Percentage';
    if (value === '1') return 'Flat amount';
  }
  return displayValue(value);
};

function VersionCard({ version }: { version: ConcessionTypeVersionHistoryItem }) {
  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Stack spacing={1.5}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          alignItems={{ sm: 'center' }}
          justifyContent="space-between"
          spacing={1}
        >
          <Stack direction="row" spacing={1.25} alignItems="center">
            <Box
              sx={{
                width: 40,
                height: 40,
                display: 'grid',
                flexShrink: 0,
                borderRadius: 1,
                placeItems: 'center',
                color: 'primary.main',
                bgcolor: 'primary.lighter',
              }}
            >
              <Iconify icon="mdi:timeline-clock-outline" width={22} />
            </Box>
            <Box>
              <Typography variant="subtitle1">Version {version.versionNumber}</Typography>
              <Typography variant="caption" color="text.secondary">
                {fDateTime(version.changeTime) ?? '—'} · {version.actorName || 'System'}
              </Typography>
            </Box>
          </Stack>
          <Label color={version.changeAction === 'created' ? 'success' : 'info'}>
            {formatAction(version.changeAction)}
          </Label>
        </Stack>

        {version.changedFields.length > 0 ? (
          <Stack spacing={1} divider={<Divider flexItem />}>
            {version.changedFields.map((field) => (
              <Box key={`${version.id}-${field.fieldName}`}>
                <Typography variant="caption" color="text.secondary">
                  {formatFieldName(field.fieldName)}
                </Typography>
                {field.fieldName === 'DiscountType' ? (
                  <Typography variant="caption" color="text.secondary" display="block">
                    This older setting is no longer editable in the concession type form.
                  </Typography>
                ) : null}
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={0.75}
                  alignItems={{ sm: 'center' }}
                >
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ wordBreak: 'break-word' }}
                  >
                    {displayFieldValue(field.fieldName, field.originalValue)}
                  </Typography>
                  <Iconify icon="eva:arrow-forward-fill" color="text.disabled" />
                  <Typography variant="body2" fontWeight={600} sx={{ wordBreak: 'break-word' }}>
                    {displayFieldValue(field.fieldName, field.newValue)}
                  </Typography>
                </Stack>
              </Box>
            ))}
          </Stack>
        ) : (
          <Typography variant="body2" color="text.secondary">
            {version.changeAction === 'created'
              ? 'Initial concession type record.'
              : 'No field-level changes were recorded for this version. The original change cannot be reconstructed.'}
          </Typography>
        )}
      </Stack>
    </Paper>
  );
}

export default function ConcessionTypeVersionHistoryDrawer({
  open,
  concessionTypeId,
  concessionTypeName,
  onClose,
}: ConcessionTypeVersionHistoryDrawerProps) {
  const { data, isFetching, isError, refetch } = useGetConcessionTypeVersionHistoryQuery(
    { concessionTypeId: concessionTypeId ?? '', maxResultCount: 50 },
    { skip: !open || !concessionTypeId }
  );
  const versions = data?.data?.items ?? [];

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: { xs: '100%', sm: 620 }, maxWidth: '100%' } }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <DrawerHeader
          title={concessionTypeName || 'Concession Type'}
          subtitle="Review the version history and fields changed over time."
          onClose={onClose}
        />
        <Divider />
        {isFetching ? (
          <LinearProgress aria-label="Loading concession type version history" />
        ) : null}

        {isError ? (
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={() => refetch()}>
                Retry
              </Button>
            }
            sx={{ m: 3 }}
          >
            Unable to load concession type version history.
          </Alert>
        ) : null}

        {!isError && !isFetching ? (
          <Scrollbar sx={{ flex: 1, minHeight: 0 }}>
            <Stack spacing={2} sx={{ p: { xs: 2, sm: 3 } }}>
              <Box>
                <Typography variant="subtitle1">Version History</Typography>
                <Typography variant="body2" color="text.secondary">
                  {data?.data?.totalCount ?? versions.length}{' '}
                  {(data?.data?.totalCount ?? versions.length) === 1 ? 'version' : 'versions'}{' '}
                  recorded.
                </Typography>
              </Box>
              {versions.length > 0 ? (
                versions.map((version) => <VersionCard key={version.id} version={version} />)
              ) : (
                <Alert severity="info">
                  No version history is available for this concession type.
                </Alert>
              )}
            </Stack>
          </Scrollbar>
        ) : null}
      </Box>
    </Drawer>
  );
}
