import type { ReactElement } from 'react';

import {
  Box,
  Grid,
  Card,
  Chip,
  Avatar,
  Divider,
  ListItem,
  Typography,
  CardContent,
  ListItemText,
  ListItemAvatar,
} from '@mui/material';

import { DetailRow } from 'src/screens/communication/announcement/components/detailRow';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomTooltip from 'src/components/custom-tooltip';

import type { ISubject } from '../type';

const SubjectOverview = ({ subject }: { subject: ISubject }) => (
  <Box sx={{ height: '100%' }}>
    <Grid container spacing={2}>
      <Grid item xs={12} md={8}>
        <Card sx={{ height: '100%' }}>
          <CardContent sx={{ p: 2 }}>
            <Typography
              variant="subtitle1"
              gutterBottom
              sx={{ display: 'flex', alignItems: 'center' }}
            >
              <Iconify
                icon="mdi:information-outline"
                sx={{ mr: 1, height: '22px', width: '22px' }}
              />
              Basic Information
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <DetailRow label="Subject Code" value={subject?.subjectCode} icon="bi:file-code" />
            <DetailRow
              label="Description"
              value={subject?.description}
              icon="mdi:text-box-outline"
            />
            <DetailRow
              label="Prerequisites"
              value={subject?.prerequisites}
              icon="mdi:alert-decagram-outline"
            />
            <DetailRow label="Learning Goal" value={subject?.learningGoal} icon="mdi:target" />
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={4}>
        <Card sx={{ height: '100%' }}>
          <CardContent sx={{ p: 2 }}>
            <Typography
              variant="subtitle1"
              gutterBottom
              sx={{ display: 'flex', alignItems: 'center' }}
            >
              <Iconify icon="mdi:account-group" sx={{ mr: 1, height: '22px', width: '22px' }} />
              Teachers
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Scrollbar sx={{ height: '270px' }}>
              {/* Primary Teacher */}
              <Box sx={{ mb: 1 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Primary Teacher
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <ListItem
                    disablePadding
                    sx={{
                      borderRadius: '8px',
                      p: 1,
                      boxShadow: 3,
                      my: 1,
                      bgcolor: 'background.neutral',
                    }}
                  >
                    <ListItemAvatar>
                      <TeacherHoverProfile
                        avatarComp={
                          <Avatar
                            src={subject?.primaryTeacher}
                            alt={subject?.primaryTeacher}
                            sx={{ width: 36, height: 36, cursor: 'pointer' }}
                          />
                        }
                        teacher={{
                          name: subject?.primaryTeacher,
                          designation: 'Senior Teacher',
                          department: 'CSE',
                          class: '10',
                          division: 'A',
                          email: 'aisha.sharma@example.com',
                          experience: '12 Years',
                          qualification: 'M.Tech (CSE)',
                          subjects: ['Mathematics', 'Physics'],
                          avatarUrl: '/assets/images/avatars/avatar_1.jpg',
                        }}
                      />
                    </ListItemAvatar>
                    <ListItemText
                      primary={<Typography variant="body2">{subject?.primaryTeacher}</Typography>}
                    />
                  </ListItem>
                </Box>
              </Box>

              {/* Secondary Teachers */}
              <Typography variant="subtitle2" gutterBottom>
                Secondary Teachers
              </Typography>

              {Array.isArray(subject?.secondaryTeacher) && subject?.secondaryTeacher.length > 0 ? (
                subject?.secondaryTeacher.map((teacher: string, idx: number) => (
                  <ListItem
                    key={idx}
                    disablePadding
                    sx={{
                      backgroundColor: 'background.paper',
                      borderRadius: '8px',
                      p: 1,
                      boxShadow: 3,
                      my: 1,
                    }}
                  >
                    <ListItemAvatar>
                      <TeacherHoverProfile
                        avatarComp={
                          <Avatar
                            src={teacher}
                            alt={teacher}
                            sx={{ width: 36, height: 36, cursor: 'pointer' }}
                          />
                        }
                        teacher={{
                          name: teacher,
                          designation: 'Senior Teacher',
                          department: 'CSE',
                          class: '10',
                          division: 'A',
                          email: 'aisha.sharma@example.com',
                          experience: '12 Years',
                          qualification: 'M.Tech (CSE)',
                          subjects: ['Mathematics', 'Physics'],
                          avatarUrl: '/assets/images/avatars/avatar_1.jpg',
                        }}
                      />
                    </ListItemAvatar>
                    <ListItemText primary={<Typography variant="body2">{teacher}</Typography>} />
                  </ListItem>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No secondary teachers assigned
                </Typography>
              )}
            </Scrollbar>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  </Box>
);

export default SubjectOverview;

interface TeacherProfile {
  name: string;
  avatarUrl?: string;
  designation?: string;
  department?: string;
  class?: string;
  division?: string;
  email?: string;
  experience?: string;
  qualification?: string;
  subjects?: string[];
}

export const TeacherHoverProfile: React.FC<{
  teacher: TeacherProfile;
  avatarComp: ReactElement<any, any>;
}> = ({ teacher, avatarComp }: any) => (
  <CustomTooltip
    arrow
    placement="right"
    title={
      <Box sx={{ p: 2, minWidth: 240 }}>
        {' '}
        {/* Add padding and min width for better layout */}
        {/* Header: Avatar + Name */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
          <Avatar src={teacher.avatarUrl} alt={teacher.name} sx={{ width: 56, height: 56 }} />
          <Box>
            <Typography variant="subtitle1" color="text.primary">
              {teacher.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {teacher.designation}, {teacher.department}
            </Typography>
          </Box>
        </Box>
        <Divider sx={{ my: 1 }} />
        {/* Info Grid */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 1 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Email :{' '}
            </Typography>
            <Typography variant="caption" color="text.primary">
              {teacher.email}
            </Typography>
          </Box>

          <Box>
            <Typography variant="caption" color="text.secondary">
              Experience :{' '}
            </Typography>
            <Typography variant="caption" color="text.primary">
              {teacher.experience}
            </Typography>
          </Box>

          <Box>
            <Typography variant="caption" color="text.secondary">
              Status :{' '}
            </Typography>
            <Chip
              label="Present"
              size="small"
              color="success"
              variant="outlined"
              sx={{ height: 20, fontSize: '0.75rem', mt: 0.5 }}
            />
          </Box>

          <Box>
            <Typography variant="caption" color="text.secondary">
              Qualification :{' '}
            </Typography>
            <Typography variant="caption" color="text.primary">
              {teacher.qualification}
            </Typography>
          </Box>
        </Box>
      </Box>
    }
  >
    {avatarComp}
  </CustomTooltip>
);
