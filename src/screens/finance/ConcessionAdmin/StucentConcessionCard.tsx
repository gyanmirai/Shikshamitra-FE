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
    elevation={0}
    sx={{
      borderRadius: 2,
      p: 3,
      mb: 3,
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
        <Typography variant="h6" sx={{ fontSize: '1.125rem', fontWeight: 700 }}>
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
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
          <Box
            sx={{
              mt: 0.5,
              width: 36,
              height: 36,
              borderRadius: '50%',
              bgcolor: (theme) => varAlpha(theme.palette.info.mainChannel, 0.08),
              color: 'info.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Person sx={{ fontSize: 20 }} />
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
              Student Name
            </Typography>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {student?.studentName || '-'}
              {student?.grNo ? ` (${student.grNo})` : ''}
            </Typography>
          </Box>
        </Box>
      </Grid>

      {/* Roll No */}
      <Grid size={{ xs: 12, md: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
          <Box
            sx={{
              mt: 0.5,
              width: 36,
              height: 36,
              borderRadius: '50%',
              bgcolor: (theme) => varAlpha(theme.palette.warning.mainChannel, 0.08),
              color: 'warning.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Tag sx={{ fontSize: 20 }} />
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
              Roll No.
            </Typography>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {student?.rollNo || '-'}
            </Typography>
          </Box>
        </Box>
      </Grid>

      {/* Parent Name */}
      <Grid size={{ xs: 12, md: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
          <Box
            sx={{
              mt: 0.5,
              width: 36,
              height: 36,
              borderRadius: '50%',
              bgcolor: (theme) => varAlpha(theme.palette.success.mainChannel, 0.08),
              color: 'success.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Group sx={{ fontSize: 20 }} />
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
              Parent Name
            </Typography>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {student?.parentName || '-'}
            </Typography>
          </Box>
        </Box>
      </Grid>

      {/* Contact */}
      <Grid size={{ xs: 12, md: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
          <Box
            sx={{
              mt: 0.5,
              width: 36,
              height: 36,
              borderRadius: '50%',
              bgcolor: (theme) => varAlpha(theme.palette.error.mainChannel, 0.08),
              color: 'error.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Phone sx={{ fontSize: 20 }} />
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
              Contact No.
            </Typography>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {student?.contactNo || '-'}
            </Typography>
          </Box>
        </Box>
      </Grid>

      {/* Email */}
      <Grid size={{ xs: 12, md: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
          <Box
            sx={{
              mt: 0.5,
              width: 36,
              height: 36,
              borderRadius: '50%',
              bgcolor: (theme) => varAlpha(theme.palette.secondary.mainChannel, 0.08),
              color: 'secondary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Email sx={{ fontSize: 20 }} />
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
              Email
            </Typography>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, wordBreak: 'break-word' }}>
              {student?.email || '-'}
            </Typography>
          </Box>
        </Box>
      </Grid>

      {/* Class / Division */}
      <Grid size={{ xs: 12, md: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
          <Box
            sx={{
              mt: 0.5,
              width: 36,
              height: 36,
              borderRadius: '50%',
              bgcolor: (theme) => varAlpha(theme.palette.primary.mainChannel, 0.08),
              color: 'primary.dark',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <School sx={{ fontSize: 20 }} />
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
              Class/Div
            </Typography>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {student?.classDivision || '-'}
            </Typography>
          </Box>
        </Box>
      </Grid>

      {/* Board / Medium */}
      <Grid size={{ xs: 12, md: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
          <Box
            sx={{
              mt: 0.5,
              width: 36,
              height: 36,
              borderRadius: '50%',
              bgcolor: (theme) => varAlpha(theme.palette.info.mainChannel, 0.08),
              color: 'info.dark',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Language sx={{ fontSize: 20 }} />
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
              Board/Medium
            </Typography>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {student?.boardMedium || '-'}
            </Typography>
          </Box>
        </Box>
      </Grid>

      {/* Sibling */}
      {student?.sibling && (
        <Grid size={{ xs: 12, md: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
            <Box
              sx={{
                mt: 0.5,
                width: 36,
                height: 36,
                borderRadius: '50%',
                bgcolor: (theme) => varAlpha(theme.palette.warning.mainChannel, 0.08),
                color: 'warning.dark',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <People sx={{ fontSize: 20 }} />
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                Sibling
              </Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                {student?.sibling}
              </Typography>
            </Box>
          </Box>
        </Grid>
      )}
    </Grid>
  </Paper>
);

export default StudentInformationAccordion;
