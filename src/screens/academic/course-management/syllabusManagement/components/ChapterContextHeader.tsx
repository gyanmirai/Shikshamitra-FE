import { Iconify } from 'src/components/iconify';
import CustomTooltip from 'src/components/custom-tooltip';
import { Box, Paper, Stack, Divider, Typography, IconButton } from '@mui/material';

const EDIT_CHAPTER_DESCRIPTION =
  'Add the core chapter details, optional planning information, and supporting files.';

interface ChapterContextHeaderProps {
  className?: string;
  subject?: string;
  isEditing: boolean;
}

export function ChapterContextHeader({ className, subject, isEditing }: ChapterContextHeaderProps) {
  const heading = (
    <Stack direction="row" spacing={0.5} alignItems="center">
      <Typography variant="subtitle1" fontWeight={700}>
        {isEditing ? 'Edit chapter' : 'New chapter'}
      </Typography>
      {isEditing && (
        <CustomTooltip title={EDIT_CHAPTER_DESCRIPTION} arrow placement="right">
          <IconButton
            aria-label="Edit chapter information"
            size="small"
            color="info"
            sx={{ p: 0.25 }}
          >
            <Iconify icon="lucide:info" width={16} />
          </IconButton>
        </CustomTooltip>
      )}
    </Stack>
  );

  const classAndSubject = (
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
  );

  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 2.5, borderRadius: 2 }}>
      {isEditing ? (
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
        >
          {heading}
          <Box sx={{ width: { xs: '100%', sm: 'auto' }, ml: { sm: 'auto' } }}>
            <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-end', sm: 'flex-start' } }}>
              {classAndSubject}
            </Box>
          </Box>
        </Stack>
      ) : (
        <Stack spacing={1} alignItems="flex-start">
          <Box sx={{ minWidth: 0 }}>
            {heading}
            <Typography variant="body2" color="text.secondary">
              {EDIT_CHAPTER_DESCRIPTION}
            </Typography>
          </Box>
          {classAndSubject}
        </Stack>
      )}
    </Paper>
  );
}
