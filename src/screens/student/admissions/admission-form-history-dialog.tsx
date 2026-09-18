import type { AdmissionForm } from 'src/redux/student/admissions/admission-forms-api';

import dayjs from 'dayjs';
import { useState, useEffect } from 'react';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import {
  useGetAdmissionFormAuditQuery,
  useGetAdmissionFormVersionsQuery,
  useLazyCompareAdmissionFormVersionsQuery,
} from 'src/redux/student/admissions/admission-forms-api';
import {
  Box,
  List,
  Alert,
  Stack,
  Button,
  Dialog,
  Divider,
  ListItem,
  Typography,
  DialogTitle,
  ListItemText,
  DialogContent,
  DialogActions,
  CircularProgress,
} from '@mui/material';

type Props = {
  form: AdmissionForm | null;
  onClose: () => void;
  onRestoreVersion: (id: string) => Promise<unknown>;
};

export function AdmissionFormHistoryDialog({ form, onClose, onRestoreVersion }: Props) {
  const audit = useGetAdmissionFormAuditQuery(form?.id ?? '', { skip: !form });
  const versions = useGetAdmissionFormVersionsQuery(form?.id ?? '', { skip: !form });
  const [compare, comparison] = useLazyCompareAdmissionFormVersionsQuery();
  const [selectedVersion, setSelectedVersion] = useState('');

  useEffect(() => {
    if (!form) setSelectedVersion('');
  }, [form]);

  const comparableVersions = (versions.data ?? []).filter((version) => version.id !== form?.id);
  return (
    <Dialog open={Boolean(form)} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>History &amp; versions · {form?.name}</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={3}>
          <Box>
            <Typography variant="subtitle1">Compare versions</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              Review structural changes or restore an older version as a new editable draft.
            </Typography>
            {versions.isLoading ? (
              <CircularProgress size={24} />
            ) : comparableVersions.length ? (
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                <CustomSelect
                  label="Compare with"
                  value={selectedVersion}
                  options={comparableVersions.map((version) => ({
                    value: version.id,
                    label: `Version ${version.version}`,
                  }))}
                  onChange={(value) => setSelectedVersion(String(value))}
                  sx={{ minWidth: 220 }}
                />
                <Button
                  variant="outlined"
                  disabled={!selectedVersion || comparison.isFetching}
                  onClick={() => form && compare({ id: form.id, otherId: selectedVersion }, true)}
                >
                  Compare
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Iconify icon="mdi:restore" />}
                  disabled={!selectedVersion}
                  onClick={() => onRestoreVersion(selectedVersion)}
                >
                  Restore as new draft
                </Button>
              </Stack>
            ) : (
              <Alert severity="info">No other versions are available yet.</Alert>
            )}
            {comparison.data && (
              <List dense sx={{ mt: 1, bgcolor: 'background.neutral', borderRadius: 1 }}>
                {comparison.data.changes.map((change) => (
                  <ListItem key={change}>
                    <ListItemText primary={change} />
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
          <Divider />
          <Box>
            <Typography variant="subtitle1">Activity</Typography>
            {audit.isLoading ? (
              <CircularProgress size={24} sx={{ mt: 1 }} />
            ) : audit.data?.length ? (
              <List dense disablePadding>
                {audit.data.map((entry) => (
                  <ListItem key={entry.id} divider>
                    <ListItemText
                      primary={entry.action.replace(/([a-z])([A-Z])/g, '$1 $2')}
                      secondary={`${dayjs(entry.occurredAt).format('DD MMM YYYY, hh:mm A')} · Version ${entry.version}${entry.comment ? ` · ${entry.comment}` : ''}`}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Alert severity="info" sx={{ mt: 1 }}>
                No recorded form activity is available.
              </Alert>
            )}
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
