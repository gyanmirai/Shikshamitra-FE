import {
  Box,
  Grid,
  Card,
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
import UserHoverProfile from 'src/components/student-popover';

import type { ISubject } from '../type';

const SubjectOverview = ({ subject }: { subject: ISubject }) => (
  <Box sx={{ height: '100%' }}>
    <Grid container spacing={2}>
      <Grid item xs={12} md={8}>
        <Card sx={{ height: '100%' }}>
          <CardContent sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              <Iconify icon="mdi:information-outline" sx={{ mr: 1, verticalAlign: 'middle' }} />
              Basic Information
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <DetailRow label="Subject Code" value={subject?.subjectCode} icon="mdi:code-tags" />
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
          <Scrollbar sx={{ height: '100%' }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                <Iconify icon="mdi:account-group" sx={{ mr: 1, verticalAlign: 'middle' }} />
                Teachers
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Primary Teacher
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <ListItem
                    disablePadding
                    sx={{
                      backgroundColor: 'background.paper',
                      borderRadius: '8px',
                      p: 1,
                      boxShadow: 2,
                      my: 1,
                    }}
                  >
                    <ListItemAvatar>
                      <UserHoverProfile
                        avatarComp={
                          <Avatar
                            sx={{
                              bgcolor: 'secondary.main',
                              width: 36,
                              height: 36,
                              cursor: 'pointer',
                            }}
                          >
                            {subject?.primaryTeacher
                              .split(' ')
                              .map((n) => n[0])
                              .join('')}
                          </Avatar>
                        }
                        user={{
                          name: subject?.primaryTeacher,
                          avatarUrl: '/assets/images/avatars/avatar_1.jpg',
                          role: 'Student',
                          email: 'john.doe@example.com',
                          class: '10th',
                          division: 'A',
                          board: 'CBSE',
                          medium: 'English',
                          organization: 'Higher Secondary',
                        }}
                      />
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle2">{subject?.primaryTeacher}</Typography>
                      }
                    />
                  </ListItem>
                </Box>
              </Box>

              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
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
                      boxShadow: 2,
                      my: 1,
                    }}
                  >
                    <ListItemAvatar>
                      <UserHoverProfile
                        avatarComp={
                          <Avatar
                            sx={{
                              bgcolor: 'secondary.main',
                              width: 36,
                              height: 36,
                              cursor: 'pointer',
                            }}
                          >
                            {teacher
                              .split(' ')
                              .map((n) => n[0])
                              .join('')}
                          </Avatar>
                        }
                        user={{
                          name: teacher,
                          avatarUrl: '/assets/images/avatars/avatar_1.jpg',
                          role: 'Student',
                          email: 'john.doe@example.com',
                          class: '10th',
                          division: 'A',
                          board: 'CBSE',
                          medium: 'English',
                          organization: 'Higher Secondary',
                        }}
                      />
                    </ListItemAvatar>
                    <ListItemText
                      primary={<Typography variant="subtitle2">{teacher}</Typography>}
                    />
                  </ListItem>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No secondary teachers assigned
                </Typography>
              )}
            </CardContent>
          </Scrollbar>
        </Card>
      </Grid>
    </Grid>
  </Box>
);

export default SubjectOverview;
