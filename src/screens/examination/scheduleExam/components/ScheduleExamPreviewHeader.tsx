import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import CustomTooltip from 'src/components/custom-tooltip';
import { Box, Stack, IconButton, Typography } from '@mui/material';

type ScheduleExamPreviewHeaderProps = {
  dateRange: string;
  examName: string;
  onClose: () => void;
  statusColor: 'default' | 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error';
  statusLabel: string;
};

export function ScheduleExamPreviewHeader({
  dateRange,
  examName,
  onClose,
  statusColor,
  statusLabel,
}: ScheduleExamPreviewHeaderProps) {
  return (
    <Box
      component="header"
      sx={{
        px: { xs: 2, sm: 3 },
        py: 2.5,
        borderBottom: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={2}>
        <Stack spacing={1} sx={{ minWidth: 0 }}>
          <Stack direction="row" alignItems="center" flexWrap="wrap" gap={1}>
            <Typography variant="h5" component="h2" sx={{ fontWeight: 700, lineHeight: 1.25 }}>
              {examName}
            </Typography>
            <Label color={statusColor} variant="soft" sx={{ px: 1.25, height: 24 }}>
              {statusLabel}
            </Label>
            <CustomTooltip
              arrow
              placement="right"
              title="View scheduled subjects, timings, and exam readiness."
            >
              <Box component="span" sx={{ display: 'inline-flex', color: 'info.main' }}>
                <Iconify icon={GlobalIcons.info} width={18} height={18} />
              </Box>
            </CustomTooltip>
          </Stack>

          {dateRange && (
            <Stack direction="row" spacing={0.75} alignItems="center" color="text.secondary">
              <Iconify icon={GlobalIcons.calendar} width={16} height={16} />
              <Typography
                variant="body2"
                sx={{ fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}
              >
                {dateRange}
              </Typography>
            </Stack>
          )}
        </Stack>

        <IconButton
          aria-label="Close exam details"
          onClick={onClose}
          sx={{ mt: -0.75, mr: -1, width: 44, height: 44, color: 'text.secondary' }}
        >
          <Iconify icon="mdi:close" width={22} />
        </IconButton>
      </Stack>
    </Box>
  );
}
