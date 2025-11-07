import React, { useMemo } from 'react';
import {
  Box,
  Chip,
  Grid,
  Link,
  Dialog,
  IconButton,
  Typography,
  DialogContent,
} from '@mui/material';
import {
  Close,
  Group,
  AccessTime,
  InfoTwoTone,
  CalendarToday,
  Link as LinkIcon,
} from '@mui/icons-material';

import type { IEventAnnouncement } from '../../type';

const EventDetailsComponent = ({
  open,
  event,
  onClose,
}: {
  event: IEventAnnouncement | null;
  open: boolean;
  onClose: () => void;
}) => {
  // Safely create an object URL for the attachment (if any)
  const attachmentUrl = useMemo(() => {
    if (event?.attachment) {
      try {
        return URL.createObjectURL(event.attachment);
      } catch (_) {
        return null;
      }
    }
    return null;
  }, [event]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3, overflow: 'hidden' },
      }}
    >
      {/* Redesigned Header (gradient instead of image) */}
      <Box
        sx={{
          position: 'relative',
          background: 'linear-gradient(135deg, #065f46 0%, #0d9b6b 45%, #10b981 70%, #34d399 100%)',
          color: 'white',
          px: { xs: 2.5, md: 4 },
          pt: { xs: 3, md: 4 },
          pb: { xs: 4, md: 5 },
        }}
      >
        {/* Decorative blurred circles */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            '&:before': {
              content: '""',
              position: 'absolute',
              top: -30,
              right: -20,
              width: 120,
              height: 120,
              background:
                'radial-gradient(circle at center, rgba(255,255,255,0.25), transparent 70%)',
              filter: 'blur(6px)',
            },
            '&:after': {
              content: '""',
              position: 'absolute',
              bottom: -40,
              left: -30,
              width: 160,
              height: 160,
              background:
                'radial-gradient(circle at center, rgba(255,255,255,0.18), transparent 70%)',
              filter: 'blur(8px)',
            },
          }}
        />

        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            color: 'white',
            backgroundColor: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(4px)',
            '&:hover': { backgroundColor: 'rgba(255,255,255,0.28)' },
            transition: 'background-color .2s',
          }}
          aria-label="Close dialog"
        >
          <Close />
        </IconButton>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, maxWidth: { md: '68%' } }}>
          <Chip
            label={`Upcoming ${event?.type}`}
            color="success"
            variant="outlined"
            sx={{
              alignSelf: 'flex-start',
              backgroundColor: 'rgba(255,255,255,0.15)',
              color: 'white',
              borderColor: 'rgba(255,255,255,0.35)',
              fontWeight: 500,
              letterSpacing: 0.4,
            }}
            size="small"
          />
          <Typography
            variant="h6"
            fontWeight={700}
            sx={{
              textShadow: '0 1px 2px rgba(0,0,0,0.25)',
              lineHeight: 1.3,
            }}
          >
            {event?.title}
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 0.5 }}>
            <Chip
              label={event?.type || event?.type || 'General'}
              size="small"
              variant="outlined"
              sx={{
                backgroundColor: (theme) => theme.palette.background.paper,
                color: (theme) => theme.palette.text.primary,
                fontWeight: 500,
                backdropFilter: 'blur(3px)',
              }}
            />
            <Chip
              label={event?.eventMode || 'Offline'}
              size="small"
              variant="outlined"
              sx={{
                backgroundColor: (theme) => theme.palette.background.paper,
                color: (theme) => theme.palette.text.primary,
                fontWeight: 500,
                backdropFilter: 'blur(3px)',
              }}
            />
          </Box>
        </Box>
      </Box>

      {/* Content */}
      <DialogContent sx={{ backgroundColor: '#f8fafc', p: 2.25 }}>
        <Grid container spacing={1.5}>
          <Grid size={{ xs: 12, md: 6 }}>
            <InfoCard
              icon={<CalendarToday color="primary" />}
              title="Date"
              subtitle="Oct 5, 2025"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <InfoCard
              icon={<AccessTime color="primary" />}
              title="Time"
              subtitle="10:00 AM - 2:00 PM"
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <InfoCard icon={<Group color="primary" />} title="Audience" subtitle="120 Users" />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <InfoCard
              icon={<LinkIcon color="primary" />}
              title={event?.eventMode === 'online' ? 'Meeting Link' : 'Venue'}
              subtitle={
                event?.eventMode === 'online' ? (
                  <Link
                    href="https://meet.example.com/ptc-2025"
                    target="_blank"
                    underline="hover"
                    sx={{ color: 'success.main', fontWeight: 600 }}
                  >
                    https://meet.example.com/ptc-2025
                  </Link>
                ) : (
                  event?.venue || '-'
                )
              }
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <InfoCard
              icon={<InfoTwoTone color="success" />}
              title="Description"
              subtitle={event?.description || '-'}
            />
          </Grid>
          {attachmentUrl && event?.attachment && (
            <Grid size={{ xs: 12 }}>
              <InfoCard
                icon={<LinkIcon color="primary" />}
                title="Attachment"
                subtitle={
                  <Link
                    href={attachmentUrl}
                    download={event.attachment.name}
                    underline="hover"
                    sx={{ fontWeight: 600, color: 'success.main', wordBreak: 'break-all' }}
                  >
                    {event.attachment.name}
                  </Link>
                }
              />
            </Grid>
          )}
        </Grid>
      </DialogContent>
    </Dialog>
  );
};

export default EventDetailsComponent;

type InfoCardProps = {
  icon: React.ReactNode;
  title: string;
  subtitle: React.ReactNode;
};

// Reusable info card component
const InfoCard: React.FC<InfoCardProps> = ({ icon, title, subtitle }) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      gap: 1.6,
      backgroundColor: 'white',
      borderRadius: 2.5,
      p: 1.75,
      boxShadow: '0 2px 6px rgba(16,185,129,0.08)',
      border: '1px solid #E3F9EF',
      position: 'relative',
      overflow: 'hidden',
      '&:before': {
        content: '""',
        position: 'absolute',
        top: 0,
        right: 0,
        width: 60,
        height: 60,
        background: 'radial-gradient(circle at top right, rgba(16,185,129,0.14), transparent 70%)',
        pointerEvents: 'none',
      },
    }}
  >
    <Box
      sx={{
        width: 36,
        height: 36,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        // background: 'linear-gradient(135deg,#dcfce7,#bbf7d0)',
        borderRadius: 1.5,
        color: 'success.main',
        boxShadow: 'inset 0 0 0 1px rgba(16,185,129,0.22)',
        flexShrink: 0,
        fontSize: 18,
        '& svg': { fontSize: 20 },
      }}
    >
      {icon}
    </Box>
    <Box>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{
          fontWeight: 600,
          letterSpacing: 0.25,
          color: (theme) => theme.palette.text.secondary,
        }}
      >
        {title}
      </Typography>
      <Typography
        variant="body2"
        fontWeight={600}
        sx={{ mt: 0.15, color: (theme) => theme.palette.text.primary }}
      >
        {subtitle}
      </Typography>
    </Box>
  </Box>
);
