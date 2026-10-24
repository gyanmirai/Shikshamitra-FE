import { Iconify } from 'src/components/iconify';
import { fDateTime } from 'src/utils/format-time';
import { FormSectionCard } from 'src/components/form-section-card';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import {
  Box,
  Chip,
  Alert,
  Stack,
  Button,
  Skeleton,
  Typography,
  DialogActions,
} from '@mui/material';

import {
  formatHistoryField,
  formatHistoryValue,
  formatHistoryAction,
  type AccountSettingHistoryItem,
} from './account-setting-history-formatters';

interface Props {
  open: boolean;
  title: string;
  recordType?: string;
  hiddenFields?: string[];
  data?: { items?: AccountSettingHistoryItem[]; totalCount?: number };
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  onClose: () => void;
}

export default function AccountSettingVersionDialog({
  open,
  title,
  recordType = 'Account setting',
  hiddenFields = [],
  data,
  isLoading,
  isError,
  onRetry,
  onClose,
}: Props) {
  const items = (data?.items || [])
    .map((item) => ({
      ...item,
      changedFields: item.changedFields?.filter(
        (change) =>
          !hiddenFields.some((field) => field.toLowerCase() === change.fieldName.toLowerCase())
      ),
    }))
    .sort((a, b) => b.versionNumber - a.versionNumber);
  const { timeZone } = Intl.DateTimeFormat().resolvedOptions();

  return (
    <CustomDialog
      titleInfo="Review recorded changes, who made them, and the values before and after each change."
      open={open}
      handleClose={onClose}
      title="Version History"

      maxWidth="sm"
      hasForm={false}
      guardUnsavedChanges={false}
      paperProps={{ sx: { maxHeight: 'calc(100dvh - 48px)' } }}
    >
      <DialogScrollContent>
        <FormSectionCard icon="solar:history-bold-duotone" title={title}>
          <Stack spacing={2} aria-busy={Boolean(isLoading)}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={0.5}
              justifyContent="space-between"
            >
              <Typography variant="body2" color="text.secondary">
                {recordType}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Newest first · {timeZone}
              </Typography>
            </Stack>
            {isLoading ? (
              <Stack spacing={2} role="status" aria-label="Loading version history">
                {[0, 1].map((key) => (
                  <Stack key={key} spacing={1}>
                    <Skeleton width="55%" height={24} />
                    <Skeleton width="75%" />
                    <Skeleton variant="rounded" height={64} />
                  </Stack>
                ))}
              </Stack>
            ) : isError ? (
              <Alert
                severity="error"
                action={
                  onRetry && (
                    <Button
                      size="small"
                      color="inherit"
                      onClick={onRetry}
                      startIcon={<Iconify icon="solar:restart-bold" />}
                    >
                      Retry
                    </Button>
                  )
                }
              >
                Version history could not be loaded. Please try again.
              </Alert>
            ) : !items.length ? (
              <Stack spacing={1} alignItems="center" sx={{ py: 3, textAlign: 'center' }}>
                <Iconify icon="solar:history-bold-duotone" width={32} color="text.disabled" />
                <Typography variant="subtitle2">No history recorded yet</Typography>
                <Typography variant="body2" color="text.secondary">
                  Recorded changes to this {recordType.toLowerCase()} will appear here.
                </Typography>
              </Stack>
            ) : (
              <Box component="ol" sx={{ m: 0, p: 0, listStyle: 'none' }}>
                {items.map((item, index) => (
                  <Box
                    component="li"
                    key={item.id}
                    sx={{ display: 'flex', gap: 1.5, pb: index === items.length - 1 ? 0 : 2.5 }}
                  >
                    <Box sx={{ position: 'relative', width: 28, flexShrink: 0 }}>
                      {index < items.length - 1 && (
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 32,
                            bottom: -16,
                            left: 13,
                            borderLeft: 1,
                            borderColor: 'divider',
                          }}
                        />
                      )}
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 28,
                          height: 28,
                          borderRadius: '50%',
                          bgcolor: 'action.hover',
                          color: 'text.secondary',
                        }}
                      >
                        <Iconify
                          icon={
                            item.changeAction === 'created'
                              ? 'solar:add-circle-bold'
                              : 'solar:history-bold'
                          }
                          width={16}
                        />
                      </Box>
                    </Box>
                    <Stack spacing={1.25} sx={{ flex: 1, minWidth: 0 }}>
                      <Stack spacing={0.5}>
                        <Stack
                          direction="row"
                          alignItems="center"
                          spacing={1}
                          flexWrap="wrap"
                          useFlexGap
                        >
                          <Typography variant="subtitle2">
                            {formatHistoryAction(item.changeAction)}
                          </Typography>
                          <Chip
                            size="small"
                            variant="soft"
                            label={`Version ${item.versionNumber}`}
                          />
                        </Stack>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ overflowWrap: 'anywhere' }}
                        >
                          {item.changeAction === 'unavailable'
                            ? 'Editor not recorded'
                            : `By ${item.actorName || (item.actorId ? 'Unknown user' : 'System')}`}
                          {' · '}
                          {item.changeTime ? fDateTime(item.changeTime) : 'Time not recorded'}
                        </Typography>
                      </Stack>
                      {item.changeAction === 'unavailable' ? (
                        <Typography variant="body2" color="text.secondary">
                          Changes and editor were not recorded for this older version.
                        </Typography>
                      ) : item.changedFields?.length ? (
                        <Stack
                          spacing={1.5}
                          sx={{ p: 1.5, bgcolor: 'action.hover', borderRadius: 1 }}
                        >
                          {item.changedFields.map((change) => (
                            <Stack key={`${item.id}-${change.fieldName}`} spacing={0.5}>
                              <Typography variant="caption" fontWeight={600}>
                                {formatHistoryField(change.fieldName)}
                              </Typography>
                              <Box
                                sx={{
                                  display: 'grid',
                                  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                                  gap: 1,
                                }}
                              >
                                {(['Before', 'After'] as const).map((label) => (
                                  <Stack key={label} spacing={0.25} sx={{ minWidth: 0 }}>
                                    <Typography variant="caption" color="text.secondary">
                                      {label}
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      sx={{ overflowWrap: 'anywhere', whiteSpace: 'pre-wrap' }}
                                    >
                                      {formatHistoryValue(
                                        label === 'Before' ? change.originalValue : change.newValue,
                                        change.fieldName
                                      )}
                                    </Typography>
                                  </Stack>
                                ))}
                              </Box>
                            </Stack>
                          ))}
                        </Stack>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          {item.changeAction === 'created'
                            ? 'Record created. Field-level details were not recorded.'
                            : 'No field-level changes recorded.'}
                        </Typography>
                      )}
                    </Stack>
                  </Box>
                ))}
              </Box>
            )}
          </Stack>
        </FormSectionCard>
      </DialogScrollContent>
      <DialogActions
        sx={{ p: 2, boxShadow: 'var(--shadows-10)', justifyContent: 'space-between', gap: 1 }}
      >
        <Typography variant="caption" color="text.secondary" role="status">
          {!isLoading && !isError && items.length > 0
            ? `Showing ${items.length} of ${data?.totalCount ?? items.length} recorded versions`
            : 'Read-only history'}
        </Typography>
        <Button
          variant="outlined"
          size="small"
          onClick={onClose}
          startIcon={<Iconify icon="mingcute:close-line" />}
        >
          Close
        </Button>
      </DialogActions>
    </CustomDialog>
  );
}
