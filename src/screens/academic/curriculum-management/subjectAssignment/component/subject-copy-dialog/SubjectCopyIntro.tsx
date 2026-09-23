import { Iconify } from 'src/components/iconify';
import { Box, Stack, Typography } from '@mui/material';

export function SubjectCopyIntro() {
  return (
    <Stack direction="row" spacing={1.25} alignItems="flex-start">
      <Box sx={{ color: 'text.secondary', display: 'flex', mt: 0.25 }}>
        <Iconify icon="solar:copy-outline" width={22} />
      </Box>
      <Box>
        <Typography variant="subtitle2">Reuse an existing class setup</Typography>
        <Typography variant="body2" color="text.secondary">
          Choose a source class, review what will be copied, then confirm the destination.
        </Typography>
      </Box>
    </Stack>
  );
}
