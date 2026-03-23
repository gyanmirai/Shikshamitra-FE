'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { Box, Chip, Stack, Divider, Collapse, IconButton, Typography } from '@mui/material';

import { DashboardWidgetWrapper } from '../../component/dashboard-widget-wrapper';

// ----------------------------------------------------------------------

type Announcement = {
  id: string;
  title: string;
  body: string;
  type: 'info' | 'warning' | 'success' | 'error';
  author: string;
  time: string;
  isNew: boolean;
};

const ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-1',
    title: 'PTM Rescheduled to March 20',
    body: 'Parent-Teacher Meeting has been moved to March 20th, 10:00 AM in the Main Hall. All class teachers must be present.',
    type: 'warning',
    author: 'Principal',
    time: '2 hrs ago',
    isNew: true,
  },
  {
    id: 'ann-2',
    title: 'Annual Sports Day – Volunteers Needed',
    body: 'Annual Sports Day is on March 25. Teachers willing to volunteer as event coordinators should register by March 18.',
    type: 'info',
    author: 'Admin Office',
    time: 'Yesterday',
    isNew: true,
  },
  {
    id: 'ann-3',
    title: 'Staff Development Workshop',
    body: 'A professional development workshop on digital classrooms is scheduled for March 22, 2:00 PM – 4:00 PM.',
    type: 'success',
    author: 'HR Dept',
    time: '2 days ago',
    isNew: false,
  },
];

const TYPE_CONFIG = {
  info: { color: 'info', icon: 'solar:info-circle-bold' },
  warning: { color: 'warning', icon: 'solar:danger-triangle-bold' },
  success: { color: 'success', icon: 'solar:check-circle-bold' },
  error: { color: 'error', icon: 'solar:close-circle-bold' },
} as const;

// ----------------------------------------------------------------------

function AnnouncementItem({ ann }: { ann: Announcement }) {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);
  const { color, icon } = TYPE_CONFIG[ann.type];
  const mainColor = theme.palette[color].main;
  const lighterColor = theme.palette[color].lighter;

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Box
        sx={{
          p: 1.5,
          borderRadius: '12px',
          border: `1px solid ${lighterColor}`,
          bgcolor: `${mainColor}08`,
          cursor: 'pointer',
          transition: 'all 0.2s',
          '&:hover': { bgcolor: `${mainColor}12`, borderColor: `${mainColor}50` },
        }}
        onClick={() => setExpanded((v) => !v)}
      >
        <Stack direction="row" alignItems="flex-start" spacing={1.5}>
          {/* Icon */}
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '10px',
              bgcolor: `${mainColor}18`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              mt: 0.2,
            }}
          >
            <Iconify icon={icon} width={20} sx={{ color: mainColor }} />
          </Box>

          {/* Content */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" alignItems="center" spacing={1} mb={0.3}>
              <Typography
                variant="body2"
                sx={{ fontWeight: 600, color: 'text.primary', flex: 1, lineHeight: 1.3 }}
              >
                {ann.title}
              </Typography>
              {ann.isNew && (
                <Chip
                  label="NEW"
                  size="small"
                  sx={{
                    height: 18,
                    fontSize: '0.6rem',
                    fontWeight: 700,
                    bgcolor: mainColor,
                    color: '#fff',
                    borderRadius: '6px',
                  }}
                />
              )}
            </Stack>

            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                {ann.author}
              </Typography>
              <Box sx={{ width: 3, height: 3, borderRadius: '50%', bgcolor: 'text.disabled' }} />
              <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                {ann.time}
              </Typography>
            </Stack>
          </Box>

          {/* Expand icon */}
          <IconButton size="small" sx={{ p: 0.3, flexShrink: 0 }}>
            <Iconify
              icon={expanded ? 'eva:chevron-up-fill' : 'eva:chevron-down-fill'}
              width={16}
              sx={{ color: 'text.disabled' }}
            />
          </IconButton>
        </Stack>

        {/* Expanded body */}
        <Collapse in={expanded}>
          <Typography
            variant="body2"
            sx={{ color: 'text.secondary', mt: 1, pl: 6, lineHeight: 1.6, fontSize: '0.78rem' }}
          >
            {ann.body}
          </Typography>
        </Collapse>
      </Box>
    </motion.div>
  );
}

// ----------------------------------------------------------------------

export default function TeacherAnnouncements() {
  const newCount = ANNOUNCEMENTS.filter((a) => a.isNew).length;

  return (
    <DashboardWidgetWrapper
      title={
        <Stack direction="row" alignItems="center" spacing={1}>
          <Iconify icon="solar:megaphone-bold-duotone" width={20} />
          <span>Announcements</span>
        </Stack>
      }
      action={
        newCount > 0 && (
          <Chip
            label={`${newCount} New`}
            size="small"
            color="error"
            sx={{ height: 22, fontWeight: 700, fontSize: '0.7rem' }}
          />
        )
      }
    >
      <Stack spacing={1}>
        {ANNOUNCEMENTS.map((ann, idx) => (
          <Box key={ann.id}>
            <AnnouncementItem ann={ann} />
            {idx < ANNOUNCEMENTS.length - 1 && <Divider sx={{ mt: 1, borderStyle: 'dashed' }} />}
          </Box>
        ))}
      </Stack>
    </DashboardWidgetWrapper>
  );
}
