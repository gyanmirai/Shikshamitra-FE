import { Box, Grid, Card, Avatar, Divider, Typography, CardContent } from '@mui/material';

import { DetailRow } from 'src/screens/communication/announcement/components/detailRow';

import { Iconify } from 'src/components/iconify';

import type { ISubject } from '../type';

const SubjectOverview = ({ subject }: { subject: ISubject }) => (
  <Box sx={{ height: '100%' }}>
    <Grid container spacing={2}>
      <Grid item xs={12} md={8}>
        <Card>
          <CardContent>
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
        <Card>
          <CardContent>
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
                <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                  {subject?.primaryTeacher?.charAt(0) || 'T'}
                </Avatar>
                <Typography>{subject?.primaryTeacher || 'Not assigned'}</Typography>
              </Box>
            </Box>

            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Secondary Teachers
            </Typography>
            {Array.isArray(subject?.secondaryTeacher) && subject?.secondaryTeacher.length > 0 ? (
              subject?.secondaryTeacher.map((teacher: string, idx: number) => (
                <Box key={idx} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Avatar sx={{ mr: 2, bgcolor: 'secondary.main' }}>
                    {teacher.charAt(0) || 'T'}
                  </Avatar>
                  <Typography>{teacher}</Typography>
                </Box>
              ))
            ) : (
              <Typography variant="body2" color="text.secondary">
                No secondary teachers assigned
              </Typography>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  </Box>
);

export default SubjectOverview;
