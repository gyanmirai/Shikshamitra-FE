import React from 'react';
import { alpha } from '@mui/material/styles';
import LinkIcon from '@mui/icons-material/Link';
import CloseIcon from '@mui/icons-material/Close';
import GroupIcon from '@mui/icons-material/Group';
import { InfoTwoTone } from '@mui/icons-material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import {
  Box,
  Chip,
  Grid,
  Link,
  Stack,
  Dialog,
  Divider,
  Typography,
  IconButton,
  DialogContent,
} from '@mui/material';

type ViewDialogProps = {
  open: boolean;
  onClose: () => void;
  data: any;
};

export default function CalendarViewDialog({ open, onClose, data }: ViewDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: 'hidden',
          boxShadow: '0px 24px 48px rgba(0, 0, 0, 0.2)',
          backgroundImage: 'none',
        },
      }}
    >
      {/* Modern Header */}
      <Box
        sx={{
          position: 'relative',
          background: 'linear-gradient(120deg, #047857 0%, #10b981 100%)', // Rich green gradient
          color: 'white',
          px: { xs: 3, md: 4.5 },
          pt: { xs: 4, md: 5 },
          pb: { xs: 5, md: 6 },
          overflow: 'hidden',
        }}
      >
        {/* Background Patterns */}
        <Box
          sx={{
            position: 'absolute',
            top: -60,
            right: -60,
            width: 200,
            height: 200,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)',
            filter: 'blur(40px)',
            pointerEvents: 'none',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: -40,
            left: -40,
            width: 150,
            height: 150,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
            filter: 'blur(30px)',
            pointerEvents: 'none',
          }}
        />

        {/* Close Button */}
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            color: 'white',
            backgroundColor: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.2)',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              backgroundColor: 'rgba(255,255,255,0.25)',
              transform: 'scale(1.05)',
            },
          }}
          aria-label="Close dialog"
        >
          <CloseIcon fontSize="small" />
        </IconButton>

        <Box sx={{ position: 'relative', zIndex: 1, maxWidth: { md: '80%' } }}>
          <Stack direction="row" spacing={1} alignItems="center" mb={1.5}>
            <Chip
              label={`Upcoming ${data?.type || 'Event'}`}
              size="small"
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                color: '#fff',
                fontSize: '0.75rem',
                fontWeight: 600,
                backdropFilter: 'blur(4px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                height: 24,
                '& .MuiChip-label': { px: 1.5 },
              }}
            />
          </Stack>

          <Typography
            variant="h4"
            fontWeight={600}
            sx={{
              lineHeight: 1.2,
              mb: 2,
              textShadow: '0px 2px 4px rgba(0,0,0,0.1)',
              fontSize: { xs: '1.5rem', md: '2rem' }, // Responsive font size
            }}
          >
            {data?.title || 'Untitled Event'}
          </Typography>

          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip
              label={data?.holidayType || data?.eventType || 'General'}
              size="small"
              sx={{
                bgcolor: 'white',
                color: 'success.dark',
                fontWeight: 600,
                fontSize: '0.8125rem',
                border: 'none',
                height: 26,
              }}
            />
            <Chip
              label={data?.mode || 'Offline'}
              size="small"
              variant="outlined"
              sx={{
                borderColor: 'rgba(255,255,255,0.5)',
                color: 'white',
                fontWeight: 500,
                fontSize: '0.8125rem',
                borderWidth: 1.5,
                height: 26,
              }}
            />
          </Stack>
        </Box>
      </Box>

      {/* Content Section */}
      <DialogContent sx={{ p: 0, bgcolor: '#F9FAFB' }}>
        <Box sx={{ p: { xs: 3, md: 4 } }}>
          <Grid container spacing={3}>
            {/* Primary Details */}
            <Grid size={{ xs: 12, md: 6 }}>
              <InfoCard
                icon={<CalendarTodayIcon />}
                title="Date"
                subtitle="Oct 5, 2025"
                color="primary"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <InfoCard
                icon={<AccessTimeIcon />}
                title="Time"
                subtitle="10:00 AM - 2:00 PM"
                color="warning" // Added distinct color intent
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <InfoCard
                icon={<GroupIcon />}
                title="Audience"
                subtitle="120 Users"
                color="secondary"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <InfoCard
                icon={<LinkIcon />}
                title={data?.mode === 'online' ? 'Meeting Link' : 'Venue'}
                color="info"
                subtitle={
                  data?.mode === 'online' ? (
                    <Link
                      href="https://meet.example.com/ptc-2025"
                      target="_blank"
                      underline="hover"
                      sx={{
                        color: 'primary.main',
                        fontWeight: 600,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 0.5,
                      }}
                    >
                      https://meet.example.com/ptc-2025
                    </Link>
                  ) : (
                    data?.venue || 'Not specified'
                  )
                }
              />
            </Grid>

            {/* Description Section */}
            <Grid size={{ xs: 12 }}>
              <Box
                sx={{
                  bgcolor: 'white',
                  borderRadius: 3,
                  p: 3,
                  border: '1px solid',
                  borderColor: 'divider',
                  boxShadow: '0px 1px 3px rgba(0,0,0,0.02)',
                }}
              >
                <Stack direction="row" spacing={1.5} alignItems="center" mb={1.5}>
                  <Box
                    sx={{
                      display: 'flex',
                      p: 0.8,
                      borderRadius: 1.5,
                      bgcolor: alpha('#10b981', 0.1),
                      color: 'success.main',
                    }}
                  >
                    <InfoTwoTone sx={{ fontSize: 20 }} />
                  </Box>
                  <Typography variant="subtitle1" fontWeight={600} color="text.primary">
                    Description
                  </Typography>
                </Stack>
                <Divider sx={{ mb: 2, borderStyle: 'dashed' }} />
                <Typography variant="body2" color="text.secondary" lineHeight={1.6}>
                  {data?.description || 'No description provided.'}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
    </Dialog>
  );
}

// Modernized InfoCard Component
type InfoCardProps = {
  icon: React.ReactNode;
  title: string;
  subtitle: React.ReactNode;
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
};

const InfoCard: React.FC<InfoCardProps> = ({ icon, title, subtitle, color = 'primary' }) => {
  // Map internal colors for uniformity
  const colorMap = {
    primary: { main: '#10b981', light: '#d1fae5' }, // Green base for consistency
    secondary: { main: '#6366f1', light: '#e0e7ff' },
    warning: { main: '#f59e0b', light: '#fef3c7' },
    info: { main: '#3b82f6', light: '#dbeafe' },
    error: { main: '#ef4444', light: '#fee2e2' },
    success: { main: '#10b981', light: '#ecfdf5' },
  };

  const selectedColor = colorMap[color] || colorMap.primary;

  return (
    <Box
      sx={{
        bgcolor: 'white',
        borderRadius: 3,
        p: 2,
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 2.5,
        border: '1px solid',
        borderColor: 'divider',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          borderColor: selectedColor.main,
          boxShadow: `0 4px 12px ${alpha(selectedColor.main, 0.08)}`,
          transform: 'translateY(-2px)',
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 32,
          height: 32,
          borderRadius: 2.5,
          bgcolor: selectedColor.light,
          color: selectedColor.main,
          flexShrink: 0,
          '& svg': { fontSize: 20 },
        }}
      >
        {icon}
      </Box>

      <Box sx={{ minWidth: 0 }}>
        <Typography
          variant="caption"
          sx={{
            color: 'text.secondary',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            fontWeight: 700,
            fontSize: '0.65rem',
            mb: 0.5,
            display: 'block',
          }}
        >
          {title}
        </Typography>
        <Typography
          variant="body1"
          fontWeight={600}
          color="text.primary"
          sx={{
            wordBreak: 'break-word',
            lineHeight: 1.4,
          }}
        >
          {subtitle}
        </Typography>
      </Box>
    </Box>
  );
};
