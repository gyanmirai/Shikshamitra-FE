import React from 'react';
import { Grid } from '@mui/system';
import { alpha, useTheme } from '@mui/material/styles';
import { Box, Card, Chip, Stack, Avatar, Typography, CardContent } from '@mui/material';
import {
  BadgeOutlined as BadgeIcon,
  ClassOutlined as ClassIcon,
  EmailOutlined as EmailIcon,
  PhoneOutlined as PhoneIcon,
  NumbersOutlined as NumbersIcon,
  DirectionsBusOutlined as BusIcon,
  PersonOutlineOutlined as PersonIcon,
  VerifiedUserOutlined as VerifiedIcon,
} from '@mui/icons-material';

import type { ITransportApplicationPayload } from '../type';

// Reusable Info Item matching the reference design
const InfoItem = ({
  icon,
  label,
  value,
  color = 'primary',
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
}) => {
  const theme = useTheme();

  return (
    <Stack direction="row" spacing={1.5} alignItems="center">
      <Box
        sx={{
          width: 40,
          height: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 2,
          bgcolor: alpha(theme.palette[color].main, 0.1),
          color: theme.palette[color].main,
          flexShrink: 0,
        }}
      >
        {React.cloneElement(icon as React.ReactElement<any>, { fontSize: 'small' })}
      </Box>
      <Box>
        <Typography
          variant="caption"
          sx={{
            color: 'text.secondary',
            textTransform: 'uppercase',
            fontWeight: 700,
            fontSize: '0.65rem',
            letterSpacing: '0.5px',
            display: 'block',
            mb: 0.25,
          }}
        >
          {label}
        </Typography>
        <Typography variant="body2" fontWeight={700} color="text.primary" lineHeight={1.2}>
          {value}
        </Typography>
      </Box>
    </Stack>
  );
};

const TransportMemberProfile = ({
  selectedMember,
  fromViewScreen = false,
}: {
  selectedMember: ITransportApplicationPayload | null;
  fromViewScreen: boolean;
}) => {
  const theme = useTheme();
  const isStudent = selectedMember?.role === 'Student';

  // Dynamic colors based on active status or other logic
  const mainColor = theme.palette.primary.main;
  const statusColor = theme.palette.success.main;

  return (
    <Card
      elevation={0}
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderLeft: '6px solid',
        borderLeftColor: mainColor,
        boxShadow: `0px 2px 8px ${alpha(theme.palette.common.black, 0.04)}`,
        overflow: 'visible',
        marginBottom: 2,
      }}
    >
      <CardContent sx={{ p: 2 }}>
        {/* Header Row */}
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
          <Box
            sx={{
              bgcolor: alpha(mainColor, 0.1),
              color: mainColor,
              px: 1.5,
              py: 0.5,
              borderRadius: 1,
              fontWeight: 700,
              fontSize: '0.75rem',
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
            }}
          >
            MEMBER DETAILS
          </Box>
          <Chip
            label={selectedMember?.role || 'ACTIVE'}
            size="small"
            sx={{
              bgcolor: alpha(statusColor, 0.1),
              color: statusColor,
              fontWeight: 700,
              fontSize: '0.7rem',
              borderRadius: 1,
              height: 22,
            }}
          />
        </Stack>

        <Grid container spacing={2}>
          {/* Left Column: Big Avatar & Name */}
          <Grid size={{ xs: 12, md: 3 }}>
            <Stack
              spacing={1.5}
              alignItems="center"
              sx={{ height: '100%', justifyContent: 'center' }}
            >
              <Avatar
                src={selectedMember?.avatarUrl}
                sx={{
                  width: 80,
                  height: 80,
                  boxShadow: `0 4px 12px ${alpha(theme.palette.common.black, 0.1)}`,
                  border: `3px solid ${theme.palette.background.paper}`,
                }}
              />
              <Box textAlign="center">
                <Typography variant="subtitle1" fontWeight={800} color="text.primary">
                  {selectedMember?.name || 'Unknown'}
                </Typography>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  {selectedMember?.studentId || selectedMember?.role}
                </Typography>
              </Box>
            </Stack>
          </Grid>

          {/* Right Column: Grid Details */}
          <Grid size={{ xs: 12, md: 9 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                <InfoItem
                  label="Member ID"
                  value={selectedMember?.studentId}
                  icon={<BadgeIcon />}
                  color="info"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                <InfoItem
                  label="Email"
                  value={selectedMember?.contactNo || 'N/A'}
                  icon={<EmailIcon />}
                  color="warning"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                <InfoItem
                  label="Phone"
                  value={selectedMember?.contactNo || 'N/A'}
                  icon={<PhoneIcon />}
                  color="success"
                />
              </Grid>

              {fromViewScreen && (
                <>
                  <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                    <InfoItem
                      label="Stop"
                      value={selectedMember?.searchStop || 'N/A'}
                      icon={<BusIcon />}
                      color="secondary"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                    <InfoItem
                      label="Is Exist"
                      value={selectedMember?.isStopExist ? 'Yes' : 'No'}
                      icon={<VerifiedIcon />}
                      color={selectedMember?.isStopExist ? 'success' : 'error'}
                    />
                  </Grid>
                </>
              )}

              {isStudent && (
                <>
                  <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                    <InfoItem
                      label="Class / Division"
                      value={`${selectedMember?.class || '-'} / ${selectedMember?.division || '-'}`}
                      icon={<ClassIcon />}
                      color="primary"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                    <InfoItem
                      label="Roll No."
                      value={selectedMember?.rollNo || 'N/A'}
                      icon={<NumbersIcon />}
                      color="info"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                    <InfoItem
                      label="GR No."
                      value={selectedMember?.grNo || 'N/A'}
                      icon={<PersonIcon />}
                      color="warning"
                    />
                  </Grid>
                </>
              )}
            </Grid>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default TransportMemberProfile;
