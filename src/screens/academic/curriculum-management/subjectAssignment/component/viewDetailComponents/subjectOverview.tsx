import React from 'react';
import { varAlpha } from 'src/theme/styles';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { Box, Grid, Card, Typography, CardContent } from '@mui/material';

import type { ISubjectDetail } from '../type';

interface InfoItemProps {
  icon: React.ReactNode;
  label: string;
  value: string | number | undefined;
}

const InfoItem = ({ icon, label, value }: InfoItemProps) => (
  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
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
        flexShrink: 0,
      }}
    >
      {React.cloneElement(icon as React.ReactElement<{ sx?: Record<string, unknown> }>, {
        sx: { fontSize: 20 },
      })}
    </Box>
    <Box sx={{ minWidth: 0 }}>
      <Typography
        variant="caption"
        sx={{ color: 'text.secondary', display: 'block', mb: 0.5, fontWeight: 500 }}
      >
        {label}
      </Typography>
      <Typography
        variant="subtitle2"
        sx={{ fontWeight: 600, color: 'text.primary', wordBreak: 'break-word' }}
      >
        {value || 'N/A'}
      </Typography>
    </Box>
  </Box>
);

const SubjectOverview = ({ subject }: { subject: ISubjectDetail }) => (
  <Box sx={{ height: '100%' }}>
    <Grid container spacing={3} sx={{ height: '100%' }}>
      <Grid size={{ xs: 12, md: 8 }} sx={{ height: '100%' }}>
        <Card sx={{ height: '100%', boxShadow: 'var(--shadows-10)', borderRadius: 2 }}>
          <Scrollbar sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 3, color: 'text.primary' }}>
                Subject Details
              </Typography>

              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <InfoItem
                    icon={<Iconify icon="mdi:code-tags" />}
                    label="Subject Code"
                    value={subject?.subjectCode}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <InfoItem
                    icon={<Iconify icon="mdi:target" />}
                    label="Learning Goal"
                    value={subject?.learningGoals}
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <InfoItem
                    icon={<Iconify icon="mdi:text-box-outline" />}
                    label="Description"
                    value={subject?.description}
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <InfoItem
                    icon={<Iconify icon="mdi:alert-decagram-outline" />}
                    label="Prerequisites"
                    value={subject?.prerequisites}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Scrollbar>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, md: 4 }} sx={{ height: '100%' }}>
        <Card
          sx={{
            height: '100%',
            boxShadow: 'var(--shadows-10)',
            borderRadius: 2,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" sx={{ mb: 3 }}>
              Teaching Staff
            </Typography>

            <Box sx={{ mb: 4 }}>
              <Typography
                variant="subtitle2"
                sx={{
                  mb: 2,
                  color: 'text.secondary',
                  textTransform: 'uppercase',
                  fontSize: '0.75rem',
                }}
              >
                Primary Teacher
              </Typography>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 1.5,
                  bgcolor: (theme) => varAlpha(theme.vars.palette.background.neutralChannel, 0.4),
                  border: (theme) => `1px dashed ${theme.vars.palette.divider}`,
                  textAlign: 'center',
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  No primary teacher assigned
                </Typography>
              </Box>
            </Box>

            <Box>
              <Typography
                variant="subtitle2"
                sx={{
                  mb: 2,
                  color: 'text.secondary',
                  textTransform: 'uppercase',
                  fontSize: '0.75rem',
                }}
              >
                Secondary Teacher
              </Typography>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 1.5,
                  bgcolor: (theme) => varAlpha(theme.vars.palette.background.neutralChannel, 0.4),
                  border: (theme) => `1px dashed ${theme.vars.palette.divider}`,
                  textAlign: 'center',
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  No secondary teachers assigned
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  </Box>
);

export default SubjectOverview;
