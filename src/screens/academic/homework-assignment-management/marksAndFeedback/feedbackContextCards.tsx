import { Iconify } from 'src/components/iconify';
import { sanitizeHtml } from 'src/utils/sanitize-html';
import { Box, Card, Stack, Avatar, Typography } from '@mui/material';

type StudentFeedbackContextProps = {
  studentName?: string;
  rollNumber?: string;
  grNumber?: string;
  title?: string;
};

type HomeworkFeedbackContextProps = {
  title?: string;
  description?: string;
};

export const StudentFeedbackContext = ({
  studentName,
  rollNumber,
  grNumber,
  title,
}: StudentFeedbackContextProps) => (
  <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
    {title && (
      <Typography variant="overline" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
        {title}
      </Typography>
    )}
    <Stack direction="row" alignItems="center" spacing={1.5}>
      <Avatar
        alt={studentName || 'Student'}
        sx={{
          width: 48,
          height: 48,
          bgcolor: 'primary.lighter',
          color: 'primary.main',
          fontWeight: 700,
        }}
      >
        {studentName?.charAt(0) || 'S'}
      </Avatar>
      <Box>
        <Typography variant="subtitle1" fontWeight={600}>
          {studentName || 'Student'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Roll No: {rollNumber || '--'}
          {grNumber ? ` · GR No: ${grNumber}` : ''}
        </Typography>
      </Box>
    </Stack>
  </Card>
);

export const HomeworkFeedbackContext = ({ title, description }: HomeworkFeedbackContextProps) => (
  <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
    <Stack direction="row" alignItems="flex-start" spacing={1.5}>
      <Box
        sx={{
          width: 40,
          height: 40,
          flexShrink: 0,
          display: 'grid',
          placeItems: 'center',
          borderRadius: 1,
          bgcolor: 'info.lighter',
          color: 'info.main',
        }}
      >
        <Iconify icon="solar:notebook-bookmark-bold-duotone" width={24} />
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="caption" color="text.secondary">
          Homework
        </Typography>
        <Typography variant="subtitle1" fontWeight={600}>
          {title || 'Untitled homework'}
        </Typography>
        {description ? (
          <Box
            sx={{
              mt: 0.5,
              color: 'text.secondary',
              typography: 'body2',
              '& p': { my: 0.5 },
              '& ul, & ol': { my: 0.5, pl: 2.5 },
            }}
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(description) }}
          />
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            No homework description provided.
          </Typography>
        )}
      </Box>
    </Stack>
  </Card>
);
