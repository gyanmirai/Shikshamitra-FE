import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { alpha, useTheme } from '@mui/material/styles';
import { EmptyContent } from 'src/components/empty-content';
import { Box, Card, Chip, Stack, Avatar, Divider, Typography, IconButton } from '@mui/material';

import type { StudentTabsComponentType } from '.';

interface AnnouncementCardProps {
  title: string;
  category: string;
  description: string;
  message: string;
  signature: string;
  createdBy: string;
  createdOn: string;
  isRead?: boolean;
}

const AnnouncementCard = ({
  title,
  category,
  description,
  message,
  signature,
  createdBy,
  createdOn,
  isRead = false,
}: AnnouncementCardProps) => {
  const theme = useTheme();

  return (
    <Card
      sx={{
        mb: 2,
        boxShadow: 'none',
        border: `1px solid ${alpha(theme.palette.grey[500], 0.12)}`,
        transition: 'all 0.3s ease',
        position: 'relative',
        overflow: 'hidden',
        '&:hover': {
          boxShadow: theme.customShadows?.z4 || 4,
          borderColor: 'transparent',
          transform: 'translateY(-2px)',
        },
        ...(!isRead && {
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: 4,
            height: '100%',
            bgcolor: 'primary.main',
            zIndex: 1,
          },
        }),
      }}
    >
      {/* Header Section */}
      <Box sx={{ p: 2.5, pb: 1.5 }}>
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={2}>
          <Box flex={1}>
            <Stack direction="row" alignItems="center" spacing={1.5} mb={1}>
              <Typography variant="subtitle1" fontWeight={700} color="text.primary">
                {title}
              </Typography>
              {!isRead && (
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: 'primary.main',
                    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
                  }}
                />
              )}
            </Stack>

            <Chip
              label={category}
              size="small"
              variant="soft"
              color="primary"
              sx={{
                height: 24,
                fontSize: '0.75rem',
                fontWeight: 600,
                borderRadius: 1,
              }}
            />
          </Box>

          <IconButton
            size="small"
            sx={{
              color: 'text.disabled',
              '&:hover': { color: 'text.primary', bgcolor: alpha(theme.palette.grey[500], 0.08) },
            }}
          >
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </Stack>
      </Box>

      {/* Content Section */}
      <Box sx={{ px: 2.5, pb: 2.5 }}>
        {description && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 2,
              fontStyle: 'italic',
              pl: 1.5,
              borderLeft: `2px solid ${theme.palette.primary.main}`,
            }}
          >
            {description}
          </Typography>
        )}

        <Typography
          variant="body2"
          color="text.primary"
          sx={{ whiteSpace: 'pre-line', lineHeight: 1.6, mb: 3 }}
        >
          {message}
        </Typography>

        {signature && (
          <Typography
            variant="caption"
            color="text.secondary"
            component="div"
            sx={{ fontStyle: 'italic' }}
          >
            {signature}
          </Typography>
        )}
      </Box>

      <Divider sx={{ borderStyle: 'dashed' }} />

      {/* Footer Section */}
      <Box sx={{ p: 2 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Avatar
              alt={createdBy}
              sx={{
                width: 36,
                height: 36,
                fontSize: '0.875rem',
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: 'primary.main',
                fontWeight: 600,
              }}
            >
              {createdBy.charAt(0).toUpperCase()}
            </Avatar>
            <Stack spacing={0.5}>
              <Typography variant="subtitle2" sx={{ lineHeight: 1 }}>
                {createdBy}
              </Typography>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <Iconify
                  icon="solar:calendar-date-outline"
                  width={14}
                  sx={{ color: 'text.disabled' }}
                />
                <Typography variant="caption" color="text.secondary">
                  {createdOn}
                </Typography>
              </Stack>
            </Stack>
          </Stack>

          <Stack direction="row" spacing={1}>
            <IconButton
              size="small"
              sx={{
                color: 'text.secondary',
                '&:hover': {
                  color: 'primary.main',
                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                },
              }}
            >
              <Iconify icon="solar:bookmark-outline" width={20} />
            </IconButton>
            <IconButton
              size="small"
              sx={{
                color: 'text.secondary',
                '&:hover': {
                  color: 'primary.main',
                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                },
              }}
            >
              <Iconify icon="solar:share-outline" width={20} />
            </IconButton>
          </Stack>
        </Stack>
      </Box>
    </Card>
  );
};

const Communication = (props: StudentTabsComponentType) => {
  // Sample data - replace with actual data from props or API
  const announcements: AnnouncementCardProps[] = [
    {
      title: 'School Annual Day',
      category: 'Event',
      description: 'Join us for the annual day celebrations!',
      message:
        'We are excited to announce that the school annual day will be held on 25th December. There will be various cultural programs and activities. All students are encouraged to participate and make this event memorable.\n\nEvents include:\n• Dance performances\n• Drama\n• Music concert',
      signature: 'Principal',
      createdBy: 'John Doe',
      createdOn: '10/12/2023',
      isRead: false,
    },
    {
      title: 'Mathematics Exam Schedule',
      category: 'Exam',
      description: 'Important update regarding upcoming mid-term exams.',
      message:
        'Please find the attached schedule for the mathematics mid-term examinations. Students are requested to report to the examination hall 30 minutes prior to the start time.',
      signature: 'Exam Department',
      createdBy: 'Sarah Smith',
      createdOn: '11/12/2023',
      isRead: true,
    },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 280px)' }}>
      <Scrollbar sx={{ flexGrow: 1, height: '100%' }}>
        <Box sx={{ gap: 2, minWidth: 360, display: 'flex', flexDirection: 'column' }}>
          {/* Header */}
          <Box sx={{ p: 3, pb: 2 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="h5" fontWeight={700}>
                Announcements
              </Typography>
              <Chip
                label={`${announcements.length} New`}
                color="primary"
                size="small"
                variant="soft"
                sx={{ borderRadius: 1, fontWeight: 600 }}
              />
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Stay updated with the latest school news and events.
            </Typography>
          </Box>

          {/* Scrollable Content */}
          <Box sx={{ px: 3, pb: 3 }}>
            <Stack spacing={2.5}>
              {announcements.length > 0 ? (
                announcements.map((announcement, index) => (
                  <AnnouncementCard key={index} {...announcement} />
                ))
              ) : (
                <EmptyContent
                  title="No Announcements"
                  description="You're all caught up! No new announcements at this time."
                  imgUrl="/assets/icons/empty/ic_content.svg"
                />
              )}
            </Stack>
          </Box>
        </Box>
      </Scrollbar>
    </Box>
  );
};

export default Communication;
