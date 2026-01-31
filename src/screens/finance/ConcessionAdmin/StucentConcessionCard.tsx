import type { LabelColor } from 'src/components/label';

import React from 'react';
import { varAlpha } from 'src/theme/styles';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Box, Grid, Paper, Typography } from '@mui/material';
import { Tag, Group, Phone, Email, Person, School, People, Language } from '@mui/icons-material';
import { ConcessionStatusType, ConcessionStatusTypeColors } from 'src/enums/concession-status-type';
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
      p: 2,
      mb: 2,
      border: (theme) => `1px solid ${theme.palette.divider}`,
      boxShadow: (theme) =>
        theme.customShadows?.card ||
        '0 0 2px 0 rgba(145, 158, 171, 0.2), 0 12px 24px -4px rgba(145, 158, 171, 0.12)',
    }}
  >
    {/* Header */}
    <Box display="flex" alignItems="center" mb={3} gap={1.5}>
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: 1.5,
          bgcolor: (theme) => varAlpha(theme.palette.primary.mainChannel, 0.08),
          color: 'primary.main',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Iconify icon="solar:user-id-bold-duotone" width={24} />
      </Box>

      <Box>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Student Information
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
          Personal and Academic Details
        </Typography>
      </Box>

      <Box sx={{ ml: 'auto' }}>
        <Label
          color={ConcessionStatusTypeColors[student?.status as ConcessionStatusType] as LabelColor}
          variant="soft"
        >
          {student?.status ? ConcessionStatusType[student.status] : '-'}
        </Label>
      </Box>
    </Box>

    {/* Body */}
    <Grid container spacing={3}>
      {/* Student Name */}
      <Grid size={{ xs: 12, md: 3 }}>
        <InfoItem
          icon={<Person sx={{ fontSize: 20, color: 'info.main' }} />}
          label="Student Name"
          value={`${student?.studentName} ${student?.grNo ? `(${student.grNo})` : ''}` || '-'}
        />
      </Grid>

      {/* Roll No */}
      <Grid size={{ xs: 12, md: 3 }}>
        <InfoItem
          icon={<Tag sx={{ fontSize: 20, color: 'warning.main' }} />}
          label="Roll No."
          value={student?.rollNo || '-'}
        />
      </Grid>

      {/* Parent Name */}
      <Grid size={{ xs: 12, md: 3 }}>
        <InfoItem
          icon={<Group sx={{ fontSize: 20, color: 'success.main' }} />}
          label="Parent Name"
          value={student?.parentName || '-'}
        />
      </Grid>

      {/* Contact */}
      <Grid size={{ xs: 12, md: 3 }}>
        <InfoItem
          icon={<Phone sx={{ fontSize: 20, color: 'error.main' }} />}
          label="Contact No."
          value={student?.contactNo || '-'}
        />
      </Grid>

      {/* Email */}
      <Grid size={{ xs: 12, md: 3 }}>
        <InfoItem
          icon={<Email sx={{ fontSize: 20, color: 'secondary.main' }} />}
          label="Email"
          value={student?.email || '-'}
        />
      </Grid>

      {/* Class / Division */}
      <Grid size={{ xs: 12, md: 3 }}>
        <InfoItem
          icon={<School sx={{ fontSize: 20, color: 'primary.dark' }} />}
          label="Class/Div"
          value={student?.classDivision || '-'}
        />
      </Grid>

      {/* Board / Medium */}
      <Grid size={{ xs: 12, md: 3 }}>
        <InfoItem
          icon={<Language sx={{ fontSize: 20, color: 'info.dark' }} />}
          label="Board/Medium"
          value={student?.boardMedium || '-'}
        />
      </Grid>

      {/* Sibling */}
      {student?.sibling && (
        <Grid size={{ xs: 12, md: 3 }}>
          <InfoItem
            icon={<People sx={{ fontSize: 20, color: 'warning.dark' }} />}
            label="Sibling"
            value={student?.sibling}
          />
        </Grid>
      )}
    </Grid>
  </Paper>
);

export default StudentInformationAccordion;
