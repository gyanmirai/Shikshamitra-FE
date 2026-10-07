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
        px: { xs: 1, sm: 1.5 },
        py: 1,
        borderBottom: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
        <Stack spacing={0.5} sx={{ minWidth: 0 }}>
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

          {dateRange && statusLabel !== 'Completed' && (
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
          sx={{ width: 40, height: 40, color: 'text.secondary' }}
        >
          <Iconify icon="mdi:close" width={22} />
        </IconButton>
      </Stack>
    </Box>
  );
}
