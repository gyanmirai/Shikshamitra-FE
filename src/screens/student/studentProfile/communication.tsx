import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
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
}: AnnouncementCardProps) => (
  <Card
    sx={{
      position: 'relative',
      overflow: 'hidden',
      mb: 2,
      transition: 'all 0.3s ease',
      borderLeft: '4px solid',
      borderLeftColor: 'primary.main',
      backgroundColor: isRead ? 'background.paper' : 'grey.50',
      '&:hover': {
        boxShadow: 8,
        transform: 'translateY(-2px)',
      },
    }}
  >
    {/* Header Section */}
    <Box
      sx={{
        p: 2,
        pb: 1.5,
        bgcolor: 'grey.100',
      }}
    >
      <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={2}>
        <Box flex={1}>
          <Stack direction="row" alignItems="center" spacing={1} mb={1}>
            <Typography variant="h6" fontWeight={600} color="text.primary">
              {title}
            </Typography>
            {!isRead && (
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: 'error.main',
                }}
              />
            )}
          </Stack>
          <Chip
            label={category}
            size="small"
            color="primary"
            variant="soft"
            sx={{
              height: 24,
              fontSize: '0.75rem',
              fontWeight: 600,
            }}
          />
        </Box>
        <IconButton size="small" sx={{ mt: -0.5 }}>
          <Iconify icon="eva:more-vertical-fill" />
        </IconButton>
      </Stack>
    </Box>

    <Divider />

    {/* Content Section */}
    <Box sx={{ p: 2.5 }}>
      {/* Description */}
      {description && (
        <Typography
          variant="subtitle2"
          color="text.secondary"
          mb={2}
          sx={{
            fontStyle: 'italic',
            pl: 2,
            borderLeft: '3px solid',
            borderLeftColor: 'primary.main',
          }}
        >
          {description}
        </Typography>
      )}

      {/* Message Body */}
      <Typography
        variant="body2"
        color="text.primary"
        sx={{
          whiteSpace: 'pre-line',
          lineHeight: 1.8,
          mb: 2,
        }}
      >
        {message}
      </Typography>

      {/* Signature */}
      {signature && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            fontStyle: 'italic',
            mt: 2,
            pl: 2,
          }}
        >
          {signature}
        </Typography>
      )}
    </Box>

    <Divider />

    {/* Footer Section */}
    <Box
      sx={{
        p: 1.5,
        bgcolor: 'grey.50',
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Avatar
            sx={{
              width: 32,
              height: 32,
              bgcolor: 'primary.main',
              fontSize: '0.875rem',
            }}
          >
            {createdBy.charAt(0).toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="caption" fontWeight={600} color="text.primary" display="block">
              {createdBy}
            </Typography>
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <Iconify icon="solar:calendar-outline" width={14} />
              <Typography variant="caption" color="text.secondary">
                {createdOn}
              </Typography>
            </Stack>
          </Box>
        </Stack>

        <Stack direction="row" spacing={1}>
          <IconButton
            size="small"
            sx={{
              bgcolor: 'grey.200',
              '&:hover': {
                bgcolor: 'grey.300',
              },
            }}
          >
            <Iconify icon="solar:bookmark-outline" width={18} />
          </IconButton>
          <IconButton
            size="small"
            sx={{
              bgcolor: 'grey.200',
              '&:hover': {
                bgcolor: 'grey.300',
              },
            }}
          >
            <Iconify icon="solar:share-outline" width={18} />
          </IconButton>
        </Stack>
      </Stack>
    </Box>
  </Card>
);

const Communication = (props: StudentTabsComponentType) => {
  // Sample data - replace with actual data from props or API
  const announcements: AnnouncementCardProps[] = [
    {
      title: 'School Annual Day',
      category: 'Event',
      description: 'Join us for the annual day celebrations!',
      message:
        'We are excited to announce that the school annual day will be held on 25th December. There will be various cultural programs and activities. All students are encouraged to participate and make this event memorable.',
      signature: 'Principal',
      createdBy: 'John Doe',
      createdOn: '10/12/2023',
      isRead: false,
    },
  ];

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ p: 2, pb: 1 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="h6" fontWeight={600} color="text.primary">
              {announcements.length} announcement(s)
            </Typography>
          </Box>
        </Stack>
      </Box>

      <Divider />

      {/* Scrollable Content */}
      <Scrollbar sx={{ flexGrow: 1, p: 2 }}>
        {announcements.length > 0 ? (
          announcements.map((announcement, index) => (
            <AnnouncementCard key={index} {...announcement} />
          ))
        ) : (
          <Box sx={{ mt: 5 }}>
            <EmptyContent title="No Announce Data Found" />
          </Box>
        )}
      </Scrollbar>
    </Box>
  );
};

export default Communication;
