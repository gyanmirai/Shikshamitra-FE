import { GlobalIcons } from 'src/utils/icons';
import { Box, Stack, Divider, Typography } from '@mui/material';
import { FormSectionCard } from 'src/components/form-section-card';

const EDIT_CHAPTER_DESCRIPTION =
  'Add the core chapter details, optional planning information, and supporting files.';

interface ChapterContextHeaderProps {
  className?: string;
  subject?: string;
  isEditing: boolean;
}

export function ChapterContextHeader({ className, subject, isEditing }: ChapterContextHeaderProps) {
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
    <FormSectionCard
      title={isEditing ? 'Edit Chapter' : 'New Chapter'}
      icon={GlobalIcons.issueBook}
      descriptionTooltip={EDIT_CHAPTER_DESCRIPTION}
      sx={{ mb: 2 }}
    >
      {classAndSubject}
    </FormSectionCard>
  );
}
