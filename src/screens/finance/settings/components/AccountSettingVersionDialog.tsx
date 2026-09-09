import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Stack,
  Typography,
  Divider,
  Chip,
  CircularProgress,
  Box,
} from '@mui/material';
import { Iconify } from 'src/components/iconify';

interface Props {
  open: boolean;
  title: string;
  data?: { items?: any[] };
  isLoading?: boolean;
  onClose: () => void;
}

export default function AccountSettingVersionDialog({
  open,
  title,
  data,
  isLoading,
  onClose,
}: Props) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {title} history
        <IconButton onClick={onClose}>
          <Iconify icon="mingcute:close-line" />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {isLoading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress size={28} />
          </Box>
        ) : (
          <Stack spacing={2}>
            {(data?.items || []).map((item) => (
              <Stack key={item.id} spacing={1}>
                <Stack direction="row" justifyContent="space-between">
                  <Chip size="small" label={`v${item.versionNumber} · ${item.changeAction}`} />
                  <Typography variant="caption" color="text.secondary">
                    {new Date(item.changeTime).toLocaleString()}
                  </Typography>
                </Stack>
                <Typography variant="caption">By {item.actorName || 'System'}</Typography>
                {(item.changedFields || []).map((change: any) => (
                  <Typography key={`${item.id}-${change.fieldName}`} variant="body2">
                    <strong>{change.fieldName}</strong>: {change.originalValue || '—'} →{' '}
                    {change.newValue || '—'}
                  </Typography>
                ))}
                <Divider />
              </Stack>
            ))}
            {!data?.items?.length && (
              <Typography color="text.secondary">No audited changes yet.</Typography>
            )}
          </Stack>
        )}
      </DialogContent>
    </Dialog>
  );
}
