import type { ReactElement } from 'react';

import dayjs from 'dayjs';
import React from 'react';
import { Box, Chip, Button, Avatar, Divider, Typography } from '@mui/material';

import { Iconify } from '../iconify';
import CustomTooltip from '../custom-tooltip';

interface UserProfile {
  name: string;
  email?: string;
  role?: string;
  class?: string;
  division?: string;
  avatarUrl?: string;
  workHours?: string;
  location?: string;
  timezone?: string;
  organization?: string;
  board?: string;
  medium?: string;
  // Employee-specific
  mobileNo?: string;
  department?: string;
  shift?: string;
  joinDate?: string;
  status?: string;
  employeeId?: string;
}

const InfoRow = ({ icon, label, value }: { icon: string; label: string; value?: string }) => {
  if (!value) return null;
  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 1.25 }}>
      <Box
        sx={{
          width: 32,
          height: 32,
          borderRadius: 1,
          bgcolor: 'action.hover',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Iconify icon={icon} width={16} sx={{ color: 'text.secondary' }} />
      </Box>
      <Box>
        <Typography variant="caption" color="text.disabled" display="block" lineHeight={1.2}>
          {label}
        </Typography>
        <Typography variant="body2" fontWeight={500} lineHeight={1.4}>
          {value}
        </Typography>
      </Box>
    </Box>
  );
};

const UserHoverProfile: React.FC<{
  user: UserProfile;
  avatarComp: ReactElement<any, any>;
  onViewProfile?: () => void;
}> = ({ user, avatarComp, onViewProfile }) => {
  const joinedText = (() => {
    if (!user.joinDate) return undefined;
    const d = dayjs(user.joinDate, 'DD-MM-YYYY');
    if (!d.isValid()) return user.joinDate;
    const years = dayjs().diff(d, 'year');
    return `${d.format('DD MMM YYYY')}${years > 0 ? ` · ${years} yrs` : ''}`;
  })();

  return (
    <CustomTooltip
      arrow={false}
      title={
        <Box sx={{ width: 300, overflow: 'hidden', m: -1 }}>
          {/* Gradient banner */}
          <Box
            sx={{
              height: 58,
              background: (theme) =>
                `linear-gradient(135deg, ${theme.vars.palette.primary.dark} 0%, ${theme.vars.palette.primary.light} 100%)`,
              position: 'relative',
              mb: '36px',
            }}
          >
            {/* Avatar overlapping banner */}
            <Box sx={{ position: 'absolute', bottom: -28, left: 16 }}>
              <Avatar
                src={user.avatarUrl}
                alt={user.name}
                sx={{
                  width: 56,
                  height: 56,
                  border: (theme) => `3px solid ${theme.vars.palette.background.paper}`,
                }}
              />
            </Box>
          </Box>

          {/* Content area */}
          <Box sx={{ px: 2, pb: 2 }}>
            {/* Name */}
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 0.5 }}>
              {user.name}
            </Typography>

            {/* Role chip + ID */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5, flexWrap: 'wrap' }}>
              {user.role && (
                <Chip
                  label={user.role}
                  size="small"
                  color="primary"
                  variant="outlined"
                  sx={{ height: 20, fontSize: '0.68rem', fontWeight: 600 }}
                />
              )}
              {user.employeeId && (
                <Typography variant="caption" color="text.disabled">
                  ID: {user.employeeId}
                </Typography>
              )}
            </Box>

            <Divider sx={{ mb: 1.5 }} />

            {/* Info rows */}
            <InfoRow icon="mdi:email-outline" label="Email" value={user.email} />
            <InfoRow icon="mdi:phone-outline" label="Phone" value={user.mobileNo} />
            <InfoRow
              icon="mdi:office-building-outline"
              label="Department"
              value={user.department || user.organization}
            />
            <InfoRow icon="mdi:clock-time-four-outline" label="Shift" value={user.shift} />
            <InfoRow icon="mdi:calendar-start" label="Joined" value={joinedText} />
            {/* Student fields */}
            {(user.board || user.medium) && (
              <InfoRow
                icon="mdi:school-outline"
                label="Board / Medium"
                value={[user.board, user.medium].filter(Boolean).join(' · ')}
              />
            )}
            {(user.class || user.division) && (
              <InfoRow
                icon="mdi:google-classroom"
                label="Class"
                value={[user.class, user.division].filter(Boolean).join(' – ')}
              />
            )}

            <Divider sx={{ mb: 1.5 }} />

            {/* View Full Profile */}
            <Button
              fullWidth
              variant="outlined"
              size="small"
              endIcon={<Iconify icon="mdi:arrow-right" width={16} />}
              onClick={onViewProfile}
              sx={{ justifyContent: 'space-between', px: 2 }}
            >
              View Full Profile
            </Button>
          </Box>
        </Box>
      }
      placement="right"
    >
      {avatarComp}
    </CustomTooltip>
  );
};

export default UserHoverProfile;
