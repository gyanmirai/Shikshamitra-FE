import type { ReactElement } from 'react';

import { Scrollbar } from 'src/components/scrollbar';
import CustomTooltip from 'src/components/custom-tooltip';
import DetailRow from 'src/screens/communication/announcement/components/detailRow';
import {
  Box,
  Grid,
  Card,
  Chip,
  Badge,
  Avatar,
  Divider,
  Typography,
  CardContent,
} from '@mui/material';

import type { ISubjectDetail } from '../type';

const SubjectOverview = ({ subject }: { subject: ISubjectDetail }) => (
  <Box sx={{ height: '100%' }}>
    <Grid container spacing={2} height="100%">
      <Grid
        size={{ xs: 12, md: 8 }}
        sx={{ mt: 0, pt: 0, pl: 0, pb: 2, height: '100%', overflow: 'auto' }}
      >
        <Card sx={{ height: '100%', boxShadow: 0, border: 'none' }}>
          <Scrollbar sx={{ height: '100%', px: 0, pr: 2 }}>
            <CardContent sx={{ p: 0 }}>
              {/* Adjust padding here */}
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
          </Scrollbar>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, md: 4 }}>
        <Card>
          <CardContent sx={{ p: 2 }}>
            {/* Primary Teacher */}
            <Box sx={{ mb: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                Primary Teacher
              </Typography>
              {/* <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <ListItem
                  sx={{
                    borderRadius: '8px',
                    p: 1,
                    border: '1px solid',
                    borderColor: 'divider',
                    boxShadow: 3,
                  }}
                >
                  <ListItemAvatar>
                    <TeacherHoverProfile
                      avatarComp={
                        <Badge
                          key={subject?.primaryTeacher?.status}
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
                                  subject?.primaryTeacher?.status === 'Active'
                                    ? 'success.main'
                                    : subject?.primaryTeacher?.status === 'Inactive'
                                      ? 'warning.main'
                                      : subject?.primaryTeacher?.status === 'Left'
                                        ? 'error.main'
                                        : subject?.primaryTeacher?.status === 'Retired'
                                          ? 'grey.500'
                                          : 'grey.300',
                              }}
                            />
                          }
                        >
                          <Avatar
                            src={subject.primaryTeacher.name}
                            alt={subject.primaryTeacher.name}
                            sx={{ width: 36, height: 36, cursor: 'pointer' }}
                          />
                        </Badge>
                      }
                      teacher={{
                        name: subject?.primaryTeacher?.name,
                        avatarUrl: subject?.primaryTeacher?.avatarUrl,
                        designation: subject?.primaryTeacher?.designation,
                        department: subject?.primaryTeacher?.department,
                        class: subject?.primaryTeacher?.class,
                        status: subject?.primaryTeacher?.status,
                        division: subject?.primaryTeacher?.division,
                        dailyStatus: subject?.primaryTeacher?.dailyStatus,
                        email: subject?.primaryTeacher?.email,
                        experience: subject?.primaryTeacher?.experience,
                        qualification: subject?.primaryTeacher?.qualification,
                        subjects: subject?.primaryTeacher?.subjects,
                      }}
                    />
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography variant="body2" sx={{ mb: -1 }}>
                        {subject?.primaryTeacher?.name}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="caption" color="text.secondary">
                        {subject?.primaryTeacher?.department}
                      </Typography>
                    }
                  />
                </ListItem>
              </Box> */}
            </Box>

            {/* Secondary Teachers */}
            <Typography variant="subtitle2">Secondary Teacher</Typography>
            {/* <Scrollbar sx={{ height: '200px' }}>
              {Array.isArray(subject?.secondaryTeacher) && subject?.secondaryTeacher.length > 0 ? (
                subject.secondaryTeacher.map((teacher, idx) => (
                  <ListItem
                    key={idx}
                    sx={{
                      borderRadius: '8px',
                      p: 1,
                      border: '1px solid',
                      borderColor: 'divider',
                      boxShadow: 3,
                      my: 1,
                    }}
                  >
                    <ListItemAvatar>
                      <TeacherHoverProfile
                        avatarComp={
                          <Badge
                            key={teacher.status}
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
                            <Avatar
                              src={teacher.name}
                              alt={teacher.name}
                              sx={{ width: 36, height: 36, cursor: 'pointer' }}
                            />
                          </Badge>
                        }
                        teacher={{
                          name: teacher.name,
                          avatarUrl: teacher.avatarUrl,
                          designation: teacher.designation,
                          department: teacher.department,
                          class: teacher.class,
                          status: teacher.status,
                          division: teacher.division,
                          dailyStatus: teacher.dailyStatus,
                          email: teacher.email,
                          experience: teacher.experience,
                          qualification: teacher.qualification,
                          subjects: teacher.subjects,
                        }}
                      />
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="body2" sx={{ mb: -1 }}>
                          {teacher.name}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="caption" color="text.secondary">
                          {teacher.department}
                        </Typography>
                      }
                    />
                  </ListItem>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No secondary teachers assigned
                </Typography>
              )}
            </Scrollbar> */}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  </Box>
);

export default SubjectOverview;

interface TeacherProfile {
  name?: string;
  avatarUrl?: string;
  designation?: string;
  department?: string;
  class?: string;
  status?: string;
  division?: string;
  dailyStatus?: string;
  email?: string;
  experience?: string;
  qualification?: string;
  subjects?: string[];
}

export const TeacherHoverProfile: React.FC<{
  teacher?: TeacherProfile;
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
          <Badge
            key={teacher.status}
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            badgeContent={
              <CustomTooltip
                title={
                  <Typography variant="caption">
                    {teacher.status === 'Active'
                      ? 'Active'
                      : teacher.status === 'Inactive'
                        ? 'Inactive'
                        : teacher.status === 'Left'
                          ? 'Left'
                          : teacher.status === 'Retired'
                            ? 'Retired'
                            : 'Unknown Status'}
                  </Typography>
                }
                arrow
              >
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
                    cursor: 'pointer',
                  }}
                />
              </CustomTooltip>
            }
          >
            <Avatar src={teacher.avatarUrl} alt={teacher.name} sx={{ width: 56, height: 56 }} />
          </Badge>
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
              sx={{ height: 20, fontSize: '0.75rem' }}
            />
          </Box>
        </Box>
      </Box>
    }
  >
    {avatarComp}
  </CustomTooltip>
);
