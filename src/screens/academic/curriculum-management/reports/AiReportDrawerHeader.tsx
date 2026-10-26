import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import CustomTooltip from 'src/components/custom-tooltip';
import { Box, Stack, IconButton, Typography } from '@mui/material';

interface Props {
  contextLabel: string;
  disableClose: boolean;
  onClose: () => void;
}

export function AiReportDrawerHeader({ contextLabel, disableClose, onClose }: Props) {
  return (
    <Box sx={{ px: { xs: 2, sm: 3 }, py: 2, flexShrink: 0, bgcolor: 'background.paper' }}>
      <Stack direction="row" spacing={1.5} alignItems="flex-start">
        <Box
          sx={{
            width: 40,
            height: 40,
            flexShrink: 0,
            display: 'grid',
            borderRadius: 1.5,
            placeItems: 'center',
            color: 'text.secondary',
            bgcolor: 'background.neutral',
          }}
        >
          <Iconify icon={GlobalIcons.generateReport} width={24} aria-hidden />
        </Box>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Stack direction="row" spacing={1} alignItems="center" useFlexGap flexWrap="wrap">
            <Typography id="shikshamitra-ai-drawer-title" component="h2" variant="h6">
              Generate Report With ShikshaMitra AI
            </Typography>
            <CustomTooltip
              title="Describe the report in English, Gujarati, Hindi, or your own wording. Review and approve the plan before a file is created."
              arrow
            >
              <IconButton
                aria-label="AI report workspace information"
                size="small"
                color="info"
                sx={{ width: 44, height: 44 }}
              >
                <Iconify icon={GlobalIcons.info} width={16} aria-hidden />
              </IconButton>
            </CustomTooltip>
          </Stack>
        </Box>
        <IconButton
          aria-label="Close ShikshaMitra AI report workspace"
          onClick={onClose}
          disabled={disableClose}
          sx={{ width: 44, height: 44, mt: -0.25, mr: -0.75 }}
        >
          <Iconify icon={GlobalIcons.cancel} aria-hidden />
        </IconButton>
      </Stack>
      <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mt: 1.5 }}>
        <Iconify icon={GlobalIcons.calendar} width={18} color="text.secondary" aria-hidden />
        <Typography variant="caption" color="text.secondary" sx={{ overflowWrap: 'anywhere' }}>
          Using: {contextLabel}
        </Typography>
      </Stack>
    </Box>
  );
}
