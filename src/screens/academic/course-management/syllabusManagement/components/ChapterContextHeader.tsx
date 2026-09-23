import { Box, Paper, Stack, Divider, Typography } from '@mui/material';

interface ChapterContextHeaderProps {
  className?: string;
  subject?: string;
  isEditing: boolean;
}

export function ChapterContextHeader({ className, subject, isEditing }: ChapterContextHeaderProps) {
  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 2.5, borderRadius: 2 }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        justifyContent="space-between"
        spacing={2}
      >
        <Box>
          <Typography variant="subtitle1" fontWeight={700}>
            {isEditing ? 'Edit chapter' : 'New chapter'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Add the core chapter details, optional planning information, and supporting files.
          </Typography>
        </Box>

        <Stack
          direction="row"
          alignItems="stretch"
          spacing={2}
          divider={<Divider orientation="vertical" flexItem />}
          sx={{ flexShrink: 0 }}
        >
          <Box>
            <Typography variant="caption" color="text.secondary">
              Class
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {className || 'Not selected'}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Subject
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {subject || 'Not selected'}
            </Typography>
          </Box>
        </Stack>
      </Stack>
    </Paper>
  );
}
