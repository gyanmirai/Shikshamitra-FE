'use client';

import dayjs from 'dayjs';
import { toast } from 'sonner';
import { LoadingButton } from '@mui/lab';
import { useMemo, useState } from 'react';
import { Iconify } from 'src/components/iconify';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import {
  type LibraryNotificationSetting,
  buildLibraryNotificationSettingsPayload,
} from 'src/redux/library/library-adapters';
import {
  useGetLibraryNotificationHistoryQuery,
  useGetLibraryNotificationSettingsQuery,
  useUpdateLibraryNotificationSettingsMutation,
} from 'src/redux/library/notifications-api';
import {
  Box,
  Chip,
  Alert,
  Stack,
  Table,
  Paper,
  Switch,
  Tooltip,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  TextField,
  IconButton,
  Typography,
  DialogActions,
  LinearProgress,
  TableContainer,
} from '@mui/material';

interface LibraryNotificationGroupPanelProps {
  group: 'BookManagement' | 'MemberManagement' | 'Transactions';
}

const channelLabel: Record<string, string> = {
  InApp: 'In-App',
  Email: 'Email',
  Sms: 'SMS',
  WhatsApp: 'WhatsApp',
};

const statusColor = (status?: string) => {
  if (status === 'Sent') return 'success';
  if (status === 'Failed') return 'error';
  if (status === 'Skipped') return 'warning';
  return 'default';
};

const formatDate = (value?: string) => (value ? dayjs(value).format('DD MMM YYYY, h:mm A') : '-');

export default function LibraryNotificationGroupPanel({
  group,
}: LibraryNotificationGroupPanelProps) {
  const [selectedSetting, setSelectedSetting] = useState<LibraryNotificationSetting | null>(null);
  const [formValues, setFormValues] = useState({
    subjectTemplate: '',
    messageTemplate: '',
    reminderOffsetDays: '',
  });

  const settingsQuery = useGetLibraryNotificationSettingsQuery(undefined);
  const historyQuery = useGetLibraryNotificationHistoryQuery({
    eventGroup: group,
    page: 1,
    pageSize: 8,
  });
  const [updateSettings, updateState] = useUpdateLibraryNotificationSettingsMutation();

  const settings = useMemo(
    () =>
      (settingsQuery.data?.items || []).filter(
        (item: LibraryNotificationSetting) => item.eventGroup === group
      ),
    [settingsQuery.data?.items, group]
  );

  const openEdit = (setting: LibraryNotificationSetting) => {
    setSelectedSetting(setting);
    setFormValues({
      subjectTemplate: setting.subjectTemplate,
      messageTemplate: setting.messageTemplate,
      reminderOffsetDays:
        setting.reminderOffsetDays === null || setting.reminderOffsetDays === undefined
          ? ''
          : String(setting.reminderOffsetDays),
    });
  };

  const closeEdit = () => setSelectedSetting(null);

  const handleToggle = async (setting: LibraryNotificationSetting, isActive: boolean) => {
    try {
      await updateSettings(buildLibraryNotificationSettingsPayload(setting, { isActive })).unwrap();
      toast.success('Notification setting updated.');
    } catch (error) {
      const parsed = parseApiProblemDetail(error);
      toast.error(parsed.detail);
    }
  };

  const handleSave = async () => {
    if (!selectedSetting) return;

    try {
      await updateSettings(
        buildLibraryNotificationSettingsPayload(selectedSetting, {
          subjectTemplate: formValues.subjectTemplate,
          messageTemplate: formValues.messageTemplate,
          reminderOffsetDays:
            formValues.reminderOffsetDays === '' ? null : Number(formValues.reminderOffsetDays),
        })
      ).unwrap();
      toast.success('Notification template updated.');
      closeEdit();
    } catch (error) {
      const parsed = parseApiProblemDetail(error);
      toast.error(parsed.detail);
    }
  };

  if (settingsQuery.isLoading) {
    return (
      <Stack spacing={2} sx={{ p: 2 }}>
        <LinearProgress />
        <Typography variant="body2" color="text.secondary">
          Loading notification settings...
        </Typography>
      </Stack>
    );
  }

  if (settingsQuery.isError) {
    return (
      <Alert
        severity="error"
        action={<LoadingButton onClick={() => settingsQuery.refetch()}>Retry</LoadingButton>}
      >
        Unable to load Library notification settings.
      </Alert>
    );
  }

  return (
    <Stack spacing={2} sx={{ height: '100%', minHeight: 0 }}>
      {settings.length === 0 ? (
        <Alert severity="info">No notification settings are available for this group.</Alert>
      ) : (
        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 1 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Event</TableCell>
                <TableCell>Recipient</TableCell>
                <TableCell>Channel</TableCell>
                <TableCell>Reminder</TableCell>
                <TableCell>Last Delivery</TableCell>
                <TableCell align="center">Active</TableCell>
                <TableCell align="right">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {settings.map((setting: LibraryNotificationSetting) => {
                const disabled = !setting.isChannelAvailable || setting.isComingSoon;
                return (
                  <TableRow key={setting.id} hover>
                    <TableCell>
                      <Stack spacing={0.5}>
                        <Typography variant="subtitle2">{setting.eventName}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {setting.subjectTemplate}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>{setting.recipientRole}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.75} alignItems="center">
                        <Chip
                          size="small"
                          label={channelLabel[setting.channel] || setting.channel}
                        />
                        {disabled && (
                          <Chip
                            size="small"
                            color={setting.isComingSoon ? 'info' : 'default'}
                            label={setting.isComingSoon ? 'Coming soon' : 'Disabled'}
                          />
                        )}
                      </Stack>
                    </TableCell>
                    <TableCell>
                      {setting.reminderOffsetDays === null ||
                      setting.reminderOffsetDays === undefined
                        ? '-'
                        : `${setting.reminderOffsetDays} day(s)`}
                    </TableCell>
                    <TableCell>
                      {setting.lastStatus ? (
                        <Stack direction="row" spacing={0.75} alignItems="center">
                          <Chip
                            size="small"
                            color={statusColor(setting.lastStatus) as any}
                            label={setting.lastStatus}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(setting.lastSentAt)}
                          </Typography>
                        </Stack>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Switch
                        size="small"
                        checked={setting.isActive}
                        disabled={disabled || updateState.isLoading}
                        onChange={(event) => handleToggle(setting, event.target.checked)}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title={disabled ? 'View template' : 'Edit template'}>
                        <IconButton size="small" onClick={() => openEdit(setting)}>
                          <Iconify
                            icon={disabled ? 'mdi:eye-outline' : 'mdi:pencil-outline'}
                            width={18}
                          />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Box>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Recent Delivery History
        </Typography>
        {historyQuery.isLoading && <LinearProgress />}
        {historyQuery.isError && <Alert severity="error">Unable to load delivery history.</Alert>}
        {!historyQuery.isLoading &&
          !historyQuery.isError &&
          (historyQuery.data?.items || []).length === 0 && (
            <Alert severity="info">No delivery history has been recorded for this group yet.</Alert>
          )}
        {!historyQuery.isLoading &&
          !historyQuery.isError &&
          (historyQuery.data?.items || []).length > 0 && (
            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 1 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Event</TableCell>
                    <TableCell>Recipient</TableCell>
                    <TableCell>Channel</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Sent At</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {historyQuery.data?.items.map((item: any) => (
                    <TableRow key={item.id} hover>
                      <TableCell>{item.eventName}</TableCell>
                      <TableCell>{item.recipientName || item.recipientRole}</TableCell>
                      <TableCell>{channelLabel[item.channel] || item.channel}</TableCell>
                      <TableCell>
                        <Stack spacing={0.5}>
                          <Chip
                            size="small"
                            color={statusColor(item.status) as any}
                            label={item.status || 'Unknown'}
                            sx={{ width: 'fit-content' }}
                          />
                          {item.errorMessage && (
                            <Typography variant="caption" color="text.secondary">
                              {item.errorMessage}
                            </Typography>
                          )}
                        </Stack>
                      </TableCell>
                      <TableCell>{formatDate(item.sentAt || item.creationTime)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
      </Box>

      {selectedSetting && (
        <CustomDialog
          open
          maxWidth="sm"
          title={
            selectedSetting.isComingSoon
              ? 'View Notification Template'
              : 'Edit Notification Template'
          }
          handleClose={closeEdit}
        >
          <DialogScrollContent>
            <Stack spacing={2}>
              {(!selectedSetting.isChannelAvailable || selectedSetting.isComingSoon) && (
                <Alert severity="info">
                  This channel or event is not editable until it is available in a later phase.
                </Alert>
              )}
              <TextField
                size="small"
                label="Subject"
                value={formValues.subjectTemplate}
                disabled={!selectedSetting.isChannelAvailable || selectedSetting.isComingSoon}
                onChange={(event) =>
                  setFormValues((current) => ({ ...current, subjectTemplate: event.target.value }))
                }
              />
              <TextField
                size="small"
                label="Message"
                value={formValues.messageTemplate}
                disabled={!selectedSetting.isChannelAvailable || selectedSetting.isComingSoon}
                multiline
                minRows={5}
                onChange={(event) =>
                  setFormValues((current) => ({ ...current, messageTemplate: event.target.value }))
                }
              />
              <TextField
                size="small"
                label="Reminder offset days"
                type="number"
                value={formValues.reminderOffsetDays}
                disabled={!selectedSetting.isChannelAvailable || selectedSetting.isComingSoon}
                onChange={(event) =>
                  setFormValues((current) => ({
                    ...current,
                    reminderOffsetDays: event.target.value,
                  }))
                }
              />
            </Stack>
          </DialogScrollContent>
          <DialogActions>
            <LoadingButton onClick={closeEdit}>Cancel</LoadingButton>
            <LoadingButton
              variant="contained"
              loading={updateState.isLoading}
              disabled={!selectedSetting.isChannelAvailable || selectedSetting.isComingSoon}
              onClick={handleSave}
            >
              Save
            </LoadingButton>
          </DialogActions>
        </CustomDialog>
      )}
    </Stack>
  );
}
