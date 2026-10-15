import { Iconify } from 'src/components/iconify';
import { Box, Stack, Typography } from '@mui/material';

const items = [
  ['mdi:school-outline', 'Your institute', 'Confirm your school’s contact and address details.'],
  [
    'mdi:calendar-outline',
    'Your academic foundation',
    'Create the academic year, classes and divisions.',
  ],
  ['mdi:account-group-outline', 'Your people', 'Invite staff with the roles they need.'],
];
export default function WelcomeStep() {
  return (
    <Stack spacing={2.5}>
      <Stack
        data-setup-welcome
        spacing={0}
        sx={{
          border: 1,
          borderColor: 'divider',
          borderRadius: 2,
          bgcolor: 'background.paper',
          px: { xs: 2, sm: 3 },
        }}
      >
        {items.map(([icon, title, description]) => (
          <Stack
            data-setup-item
            key={title}
            direction="row"
            spacing={2}
            alignItems="center"
            sx={{ py: 2, '&:not(:last-child)': { borderBottom: 1, borderColor: 'divider' } }}
          >
            <Box sx={{ p: 1, display: 'flex', borderRadius: 1, bgcolor: 'background.neutral' }}>
              <Iconify icon={icon} width={24} sx={{ color: 'text.secondary' }} />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="subtitle1">{title}</Typography>
              <Typography variant="body2" color="text.secondary">
                {description}
              </Typography>
            </Box>
          </Stack>
        ))}
      </Stack>
      <Typography variant="body2" color="text.secondary">
        Complete the steps at your own pace. Saved details will be waiting when you return.
      </Typography>
    </Stack>
  );
}
