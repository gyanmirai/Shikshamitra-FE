import React from 'react';
import { Iconify } from 'src/components/iconify';
import { Tag, Person, School, Language } from '@mui/icons-material';
import { Box, Grid, Paper, Stack, Divider, Typography } from '@mui/material';
import { InfoItem } from 'src/screens/academic/homework-assignment-management/homeworkCreation/component/viewHomeworkDetails';

import type { IStudentInfo } from '../Concession/type';

interface Props {
  student: IStudentInfo | null;
}

const StudentInformationAccordion: React.FC<Props> = ({ student }) => (
  <Paper
    variant="outlined"
    sx={{
      p: 1.5,
      mb: 1.5,
      borderRadius: 2,
      transition: 'box-shadow 0.2s ease',
      '&:hover': { boxShadow: 4 },
    }}
  >
    <Stack direction="row" alignItems="center" gap={1} mb={1.5}>
      <Iconify
        icon="solar:users-group-rounded-bold-duotone"
        width={18}
        sx={{ color: 'primary.main' }}
      />
      <Box>
        <Typography variant="subtitle2" fontWeight={700}>
          Student Information
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Details of the selected student
        </Typography>
      </Box>
    </Stack>
    <Divider sx={{ mb: 2 }} />

    <Grid container spacing={2}>
      <Grid size={{ xs: 12, md: 3 }}>
        <InfoItem
          icon={<Person sx={{ fontSize: 20, color: 'info.main' }} />}
          label="Student Name"
          value={`${student?.name || 'Aarav Sharma'} ${student?.grNumber || 'GR001' ? `(${student?.grNumber || 'GR001'})` : ''}`}
        />
      </Grid>

      <Grid size={{ xs: 12, md: 3 }}>
        <InfoItem
          icon={<Tag sx={{ fontSize: 20, color: 'warning.main' }} />}
          label="Roll No."
          value={student?.rollNo || '01'}
        />
      </Grid>

      <Grid size={{ xs: 12, md: 3 }}>
        <InfoItem
          icon={<School sx={{ fontSize: 20, color: 'primary.dark' }} />}
          label="Class/Div"
          value={(student?.standardName || '10').concat(
            student?.divisionName || 'A' ? ` (${student?.divisionName || 'A'})` : ''
          )}
        />
      </Grid>

      <Grid size={{ xs: 12, md: 3 }}>
        <InfoItem
          icon={<Language sx={{ fontSize: 20, color: 'info.dark' }} />}
          label="Board/Medium"
          value={student?.boardMedium || 'CBSE / English'}
        />
      </Grid>
    </Grid>
  </Paper>
);

export default StudentInformationAccordion;
