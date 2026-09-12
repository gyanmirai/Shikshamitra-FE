import { Iconify } from 'src/components/iconify';
import { Box, Stack, IconButton, Typography } from '@mui/material';

interface Props {
  contextLabel: string;
  disableClose: boolean;
  onClose: () => void;
}

export function AiReportDrawerHeader({ contextLabel, disableClose, onClose }: Props) {
  return (
    <Box sx={{ p: { xs: 2, sm: 2.5 }, bgcolor: 'background.neutral' }}>
      <Stack direction="row" spacing={1.5} alignItems="flex-start">
        <Box
          sx={{
            width: 40,
            height: 40,
            flexShrink: 0,
            display: 'grid',
            borderRadius: 1.5,
            placeItems: 'center',
            color: 'primary.main',
            bgcolor: 'primary.lighter',
          }}
        >
          <Iconify icon="solar:magic-stick-3-bold" width={24} />
        </Box>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography id="shikshamitra-ai-drawer-title" variant="h6">
            Generate report with ShikshaMitra AI
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Ask in English, Gujarati, Hindi, or your own natural wording.
          </Typography>
        </Box>
        <IconButton
          aria-label="Close ShikshaMitra AI report workspace"
          onClick={onClose}
          disabled={disableClose}
          sx={{ width: 44, height: 44, mt: -0.25, mr: -0.75 }}
        >
          <Iconify icon="mingcute:close-line" />
        </IconButton>
      </Stack>
      <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mt: 1.5 }}>
        <Iconify icon="solar:calendar-date-bold" width={18} color="text.secondary" />
        <Typography variant="caption" color="text.secondary">
          Using: {contextLabel}
        </Typography>
      </Stack>
    </Box>
  );
}
