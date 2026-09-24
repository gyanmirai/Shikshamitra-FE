import { Iconify } from 'src/components/iconify';
import { Box, Stack, IconButton, Typography } from '@mui/material';

type Props = {
  subjectLabel: string;
  onClose: () => void;
};

export function SubjectScheduleDrawerHeader({ subjectLabel, onClose }: Props) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 1.5,
        px: { xs: 2, sm: 3 },
        py: 2,
        borderBottom: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      <Stack direction="row" spacing={1.25} alignItems="center" sx={{ minWidth: 0 }}>
        <Box
          sx={{
            width: 36,
            height: 36,
            display: 'grid',
            placeItems: 'center',
            flexShrink: 0,
            borderRadius: 1.5,
            color: 'text.secondary',
            bgcolor: 'action.hover',
          }}
        >
          <Iconify icon="solar:calendar-date-outline" width={20} />
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography id="subject-schedule-title" variant="h6">
            Weekly lecture breakdown
          </Typography>
          <Stack
            direction="row"
            spacing={0.5}
            alignItems="center"
            color="text.secondary"
            sx={{ mt: 0.25 }}
          >
            <Iconify icon="solar:book-2-outline" width={16} />
            <Typography variant="body2" noWrap>
              {subjectLabel}
            </Typography>
          </Stack>
        </Box>
      </Stack>
      <IconButton
        aria-label="Close lecture breakdown"
        onClick={onClose}
        sx={{ width: 44, height: 44, flexShrink: 0 }}
      >
        <Iconify icon="mingcute:close-line" />
      </IconButton>
    </Box>
  );
}
