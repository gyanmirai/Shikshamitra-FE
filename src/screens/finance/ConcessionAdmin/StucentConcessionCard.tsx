import type { LabelColor } from 'src/components/label';

import React from 'react';
import { varAlpha } from 'src/theme/styles';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Box, Grid, Paper, Typography } from '@mui/material';
import { Tag, Group, Phone, Email, Person, School, People, Language } from '@mui/icons-material';
import { ConcessionStatusType, ConcessionStatusTypeColors } from 'src/enums/concession-status-type';

import type { IStudentInfo } from '../Concession/type';

interface Props {
  student: IStudentInfo | null;
}

const StudentInformationAccordion: React.FC<Props> = ({ student }) => (
  <Paper
    sx={{
      borderRadius: 2,
      p: 2,
      mb: 2,
    }}
    elevation={6}
  >
    {/* Header */}
    <Box display="flex" alignItems="center" mb={2} gap={1}>
      <Box
        sx={{
          width: 32,
          height: 32,
          borderRadius: '6px',
          bgcolor: (theme) => varAlpha(theme.palette.primary.mainChannel, 0.15),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Iconify icon="solar:user-outline" width={20} color="primary.main" />
      </Box>

      <Typography variant="h6" color="primary.main">
        Student Information
      </Typography>

      <Box sx={{ ml: 'auto' }}>
        <Label
          color={ConcessionStatusTypeColors[student?.status as ConcessionStatusType] as LabelColor}
        >
          {student?.status ? ConcessionStatusType[student.status] : '-'}
        </Label>
      </Box>
    </Box>

    {/* Body */}
    <Box sx={{ borderRadius: 2, mb: 1 }}>
      <Grid container spacing={2}>
        {/* Student Name */}
        <Grid size={{ xs: 12, md: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                bgcolor: (theme) => varAlpha(theme.palette.primary.mainChannel, 0.15),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 2,
              }}
            >
              <Person sx={{ color: 'primary.main', fontSize: 17 }} />
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Student Name
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {student?.studentName || '-'}({student?.grNo})
              </Typography>
            </Box>
          </Box>
        </Grid>

        {/* Roll No */}
        <Grid size={{ xs: 12, md: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                bgcolor: (theme) => varAlpha(theme.palette.primary.mainChannel, 0.15),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 2,
              }}
            >
              <Tag sx={{ color: 'primary.main', fontSize: 17 }} />
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Roll No.
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {student?.rollNo || '-'}
              </Typography>
            </Box>
          </Box>
        </Grid>

        {/* Parent Name */}
        <Grid size={{ xs: 12, md: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                bgcolor: (theme) => varAlpha(theme.palette.primary.mainChannel, 0.15),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 2,
              }}
            >
              <Group sx={{ color: 'primary.main', fontSize: 17 }} />
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Parent Name
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {student?.parentName || '-'}
              </Typography>
            </Box>
          </Box>
        </Grid>

        {/* Contact */}
        <Grid size={{ xs: 12, md: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                bgcolor: (theme) => varAlpha(theme.palette.primary.mainChannel, 0.15),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 2,
              }}
            >
              <Phone sx={{ color: 'primary.main', fontSize: 17 }} />
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Contact No.
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {student?.contactNo || '-'}
              </Typography>
            </Box>
          </Box>
        </Grid>

        {/* Email */}
        <Grid size={{ xs: 12, md: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                bgcolor: (theme) => varAlpha(theme.palette.primary.mainChannel, 0.15),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 2,
              }}
            >
              <Email sx={{ color: 'primary.main', fontSize: 17 }} />
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Email
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {student?.email || '-'}
              </Typography>
            </Box>
          </Box>
        </Grid>

        {/* Class / Division */}
        <Grid size={{ xs: 12, md: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                bgcolor: (theme) => varAlpha(theme.palette.primary.mainChannel, 0.15),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 2,
              }}
            >
              <School sx={{ color: 'primary.main', fontSize: 17 }} />
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Class/Div
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {student?.classDivision || '-'}
              </Typography>
            </Box>
          </Box>
        </Grid>

        {/* Board / Medium */}
        <Grid size={{ xs: 12, md: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                bgcolor: (theme) => varAlpha(theme.palette.primary.mainChannel, 0.15),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 2,
              }}
            >
              <Language sx={{ color: 'primary.main', fontSize: 17 }} />
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Board/Medium
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {student?.boardMedium || '-'}
              </Typography>
            </Box>
          </Box>
        </Grid>

        {/* Sibling */}
        {student?.sibling && (
          <Grid size={{ xs: 12, md: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  bgcolor: (theme) => varAlpha(theme.palette.primary.mainChannel, 0.15),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 2,
                }}
              >
                <People sx={{ color: 'primary.main', fontSize: 17 }} />
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Sibling
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {student?.sibling}
                </Typography>
              </Box>
            </Box>
          </Grid>
        )}
      </Grid>
    </Box>
  </Paper>
);

export default StudentInformationAccordion;
