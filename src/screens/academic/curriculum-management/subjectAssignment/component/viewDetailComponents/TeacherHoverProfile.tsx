import type { ReactElement } from 'react';

import React from 'react';
import CustomTooltip from 'src/components/custom-tooltip';
import { Box, Card, Badge, Avatar, Typography } from '@mui/material';

interface TeacherProfile {
  name?: string;
  avatarUrl?: string;
  designation?: string;
  department?: string;
  status?: string;
  email?: string;
  experience?: string;
  division?: string;
  class?: string;
  dailyStatus?: string;
  qualification?: string;
  subjects?: string[];
}

const TeacherHoverProfile: React.FC<{
  teacher: TeacherProfile;
  avatarComp: ReactElement;
}> = ({ teacher, avatarComp }) => (
  <CustomTooltip
    arrow
    placement="right"
    title={
      <Card sx={{ p: 0, minWidth: 280, boxShadow: 'none' }}>
        <Box
          sx={{
            p: 2.5,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            badgeContent={
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  border: '2px solid #fff',
                  bgcolor:
                    teacher.status === 'Active'
                      ? 'success.main'
                      : teacher.status === 'Inactive'
                        ? 'warning.main'
                        : teacher.status === 'Left'
                          ? 'error.main'
                          : teacher.status === 'Retired'
                            ? 'grey.500'
                            : 'grey.300',
                }}
              />
            }
          >
            <Avatar src={teacher.avatarUrl} alt={teacher.name} sx={{ width: 48, height: 48 }} />
          </Badge>
          <Box>
            <Typography variant="subtitle2" color="text.primary">
              {teacher.name}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
              {teacher.designation}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
              {teacher.department}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="caption" color="text.secondary">
              Email
            </Typography>
            <Typography variant="caption" color="text.primary" fontWeight={600}>
              {teacher.email}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="caption" color="text.secondary">
              Experience
            </Typography>
            <Typography variant="caption" color="text.primary" fontWeight={600}>
              {teacher.experience}
            </Typography>
          </Box>
        </Box>
      </Card>
    }
  >
    {avatarComp}
  </CustomTooltip>
);

export default TeacherHoverProfile;
