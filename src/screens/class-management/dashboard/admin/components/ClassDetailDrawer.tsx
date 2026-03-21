import React from 'react';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { Box, Grid, Stack, Drawer, Avatar, Divider, Typography, IconButton } from '@mui/material';

// ----------------------------------------------------------------------

type ClassDetailDrawerProps = {
  open: boolean;
  onClose: () => void;
  // In a real app, this would be the actual class data
  className?: string;
};

export default function ClassDetailDrawer({
  open,
  onClose,
  className = 'Class 5-A',
}: ClassDetailDrawerProps) {
  return (
    <Drawer
      open={open}
      onClose={onClose}
      anchor="right"
      PaperProps={{
        sx: { width: { xs: 1, sm: 400 } },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', py: 2, px: 2.5 }}>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Class Overview - {className}
        </Typography>

        <IconButton onClick={onClose}>
          <Iconify icon="eva:close-fill" />
        </IconButton>
      </Box>

      <Divider sx={{ borderStyle: 'dashed' }} />

      <Scrollbar sx={{ p: 2.5, height: 1 }}>
        <Stack spacing={3}>
          {/* Summary */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              sx={{ width: 64, height: 64, bgcolor: 'primary.lighter', color: 'primary.main' }}
            >
              <Iconify icon="material-symbols:class-rounded" width={32} />
            </Avatar>
            <Box>
              <Typography variant="subtitle1">Mr. Khan</Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Class Teacher
              </Typography>
              <Label color="success" sx={{ mt: 0.5 }}>
                2450 Students
              </Label>
            </Box>
          </Box>

          <Divider />

          {/* Key Metrics */}
          <Grid container spacing={2}>
            <Grid size={{ xs: 6 }}>
              <Box sx={{ p: 2, bgcolor: 'background.neutral', borderRadius: 1.5 }}>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                  Attendance (Today)
                </Typography>
                <Typography variant="h6">82%</Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Box sx={{ p: 2, bgcolor: 'background.neutral', borderRadius: 1.5 }}>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                  Fee Pending
                </Typography>
                <Typography variant="h6" color="error.main">
                  12
                </Typography>
              </Box>
            </Grid>
          </Grid>

          {/* Mini Lists */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
              Subject Progress
            </Typography>
            {[
              { subject: 'Mathematics', progress: 80 },
              { subject: 'Science', progress: 65 },
              { subject: 'English', progress: 90 },
            ].map((item) => (
              <Box key={item.subject} sx={{ mb: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption">{item.subject}</Typography>
                  <Typography variant="caption">{item.progress}%</Typography>
                </Box>
                <Box
                  sx={{
                    width: '100%',
                    height: 6,
                    borderRadius: 1,
                    bgcolor: 'grey.200',
                    position: 'relative',
                  }}
                >
                  <Box
                    sx={{
                      width: `${item.progress}%`,
                      height: '100%',
                      borderRadius: 1,
                      bgcolor: 'info.main',
                    }}
                  />
                </Box>
              </Box>
            ))}
          </Box>

          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
              Recent Announcements
            </Typography>
            {[
              { title: 'Picnic on Friday', time: '2 hours ago' },
              { title: 'Exam Schedule Released', time: '1 day ago' },
            ].map((item) => (
              <Stack key={item.title} direction="row" spacing={1.5} sx={{ mb: 2 }}>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: 'primary.main',
                    mt: 0.75,
                  }}
                />
                <Box>
                  <Typography variant="body2">{item.title}</Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {item.time}
                  </Typography>
                </Box>
              </Stack>
            ))}
          </Box>
        </Stack>
      </Scrollbar>
    </Drawer>
  );
}
