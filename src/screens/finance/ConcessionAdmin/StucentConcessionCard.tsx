import React from 'react';
import { Box, Grid, Paper, Typography } from '@mui/material';
import { Tag, Person, School, Language } from '@mui/icons-material';
import { InfoItem } from 'src/screens/academic/homework-assignment-management/homeworkCreation/component/viewHomeworkDetails';

import type { IStudentInfo } from '../Concession/type';

interface Props {
  student: IStudentInfo | null;
}

const StudentInformationAccordion: React.FC<Props> = ({ student }) => (
  <Paper
    elevation={0}
    sx={{
      borderRadius: 2,
      p: 1,
      border: (theme) => `1px solid ${theme.palette.divider}`,
      boxShadow: (theme) =>
        theme.customShadows?.card ||
        '0 0 2px 0 rgba(145, 158, 171, 0.2), 0 12px 24px -4px rgba(145, 158, 171, 0.12)',
    }}
  >
    {/* Header */}
    <Box display="flex" alignItems="center" mb={1} gap={1.5}>
      <Typography variant="h6">Student Information</Typography>
    </Box>

    {/* Body */}
    <Grid container spacing={2}>
      {/* Student Name */}
      <Grid size={{ xs: 12, md: 3 }}>
        <InfoItem
          icon={<Person sx={{ fontSize: 20, color: 'info.main' }} />}
          label="Student Name"
          value={`${student?.name || 'Aarav Sharma'} ${student?.grNumber || 'GR001' ? `(${student?.grNumber || 'GR001'})` : ''}`}
        />
      </Grid>

      {/* Roll No */}
      <Grid size={{ xs: 12, md: 3 }}>
        <InfoItem
          icon={<Tag sx={{ fontSize: 20, color: 'warning.main' }} />}
          label="Roll No."
          value={student?.rollNo || '01'}
        />
      </Grid>

      {/* Class / Division */}
      <Grid size={{ xs: 12, md: 3 }}>
        <InfoItem
          icon={<School sx={{ fontSize: 20, color: 'primary.dark' }} />}
          label="Class/Div"
          value={(student?.standardName || '10').concat(
            student?.divisionName || 'A' ? ` (${student?.divisionName || 'A'})` : ''
          )}
        />
      </Grid>

      {/* Board / Medium */}
      <Grid size={{ xs: 12, md: 3 }}>
        <InfoItem
          icon={<Language sx={{ fontSize: 20, color: 'info.dark' }} />}
          label="Board/Medium"
          value={student?.boardMedium || 'CBSE / English'}
        />
      </Grid>

      {/* Sibling */}
      {/* <Grid size={{ xs: 12, md: 3 }}>
        <InfoItem
          icon={<People sx={{ fontSize: 20, color: 'warning.dark' }} />}
          label="Sibling"
          value={student?.sibling || 'N/A'}
        />
      </Grid> */}
    </Grid>
  </Paper>
);

export default StudentInformationAccordion;
