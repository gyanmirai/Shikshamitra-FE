import React from 'react';
import { varAlpha } from 'src/theme/styles';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { Box, Grid, Card, Chip, Avatar, Typography, CardContent } from '@mui/material';

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
        component="p"
        sx={{ color: 'text.secondary', display: 'block', mb: 0.5, fontWeight: 500 }}
      >
        {label}
      </Typography>
      <Typography
        variant="subtitle2"
        component="p"
        sx={{ fontWeight: 600, color: 'text.primary', wordBreak: 'break-word' }}
        dangerouslySetInnerHTML={{ __html: String(value ?? 'N/A') }}
      />
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
                <Grid size={{ xs: 12 }}>
                  <InfoItem
                    icon={<Iconify icon="mdi:code-tags" />}
                    label="Subject Code"
                    value={subject?.subjectCode}
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
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

            <Box sx={{ mb: 3 }}>
              <Chip
                label="Primary Teacher"
                size="small"
                color="primary"
                variant="soft"
                sx={{ mb: 1.5, fontWeight: 600, fontSize: '0.7rem', letterSpacing: 0.5 }}
              />
              {subject?.primaryTeacher?.name ? (
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: (theme) => varAlpha(theme.palette.primary.mainChannel, 0.06),
                    border: (theme) =>
                      `1px solid ${varAlpha(theme.palette.primary.mainChannel, 0.16)}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    transition: 'all 0.2s',
                    '&:hover': {
                      bgcolor: (theme) => varAlpha(theme.palette.primary.mainChannel, 0.1),
                      boxShadow: (theme) =>
                        `0 2px 8px ${varAlpha(theme.palette.primary.mainChannel, 0.12)}`,
                    },
                  }}
                >
                  <Avatar
                    sx={{
                      width: 42,
                      height: 42,
                      bgcolor: 'primary.main',
                      fontSize: '1rem',
                      fontWeight: 700,
                    }}
                  >
                    {subject.primaryTeacher.name.charAt(0).toUpperCase()}
                  </Avatar>
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 600, color: 'text.primary', lineHeight: 1.4 }}
                    >
                      {subject.primaryTeacher.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 500 }}>
                      Primary
                    </Typography>
                  </Box>
                  <Iconify
                    icon="mdi:shield-check"
                    sx={{ color: 'primary.main', fontSize: 20, flexShrink: 0 }}
                  />
                </Box>
              ) : (
                <Box
                  sx={{
                    p: 2.5,
                    borderRadius: 2,
                    bgcolor: (theme) => varAlpha(theme.vars.palette.background.neutralChannel, 0.3),
                    border: (theme) => `1px dashed ${theme.vars.palette.divider}`,
                    textAlign: 'center',
                  }}
                >
                  <Iconify
                    icon="mdi:account-off-outline"
                    sx={{ fontSize: 28, color: 'text.disabled', mb: 0.5 }}
                  />
                  <Typography variant="caption" color="text.disabled" display="block">
                    No primary teacher assigned
                  </Typography>
                </Box>
              )}
            </Box>

            <Box>
              <Chip
                label="Secondary Teachers"
                size="small"
                color="info"
                variant="soft"
                sx={{ mb: 1.5, fontWeight: 600, fontSize: '0.7rem', letterSpacing: 0.5 }}
              />
              {(subject?.secondaryTeachers?.length ?? 0) > 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {subject.secondaryTeachers!.map((teacher, index) => (
                    <Box
                      key={teacher.id || index}
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: (theme) => varAlpha(theme.palette.info.mainChannel, 0.06),
                        border: (theme) =>
                          `1px solid ${varAlpha(theme.palette.info.mainChannel, 0.12)}`,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        transition: 'all 0.2s',
                        '&:hover': {
                          bgcolor: (theme) => varAlpha(theme.palette.info.mainChannel, 0.1),
                          boxShadow: (theme) =>
                            `0 2px 8px ${varAlpha(theme.palette.info.mainChannel, 0.1)}`,
                        },
                      }}
                    >
                      <Avatar
                        sx={{
                          width: 34,
                          height: 34,
                          bgcolor: 'info.main',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                        }}
                      >
                        {teacher.name.charAt(0).toUpperCase()}
                      </Avatar>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 500, color: 'text.primary', flex: 1, minWidth: 0 }}
                        noWrap
                      >
                        {teacher.name}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Box
                  sx={{
                    p: 2.5,
                    borderRadius: 2,
                    bgcolor: (theme) => varAlpha(theme.vars.palette.background.neutralChannel, 0.3),
                    border: (theme) => `1px dashed ${theme.vars.palette.divider}`,
                    textAlign: 'center',
                  }}
                >
                  <Iconify
                    icon="mdi:account-group-outline"
                    sx={{ fontSize: 28, color: 'text.disabled', mb: 0.5 }}
                  />
                  <Typography variant="caption" color="text.disabled" display="block">
                    No secondary teachers assigned
                  </Typography>
                </Box>
              )}
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  </Box>
);

export default SubjectOverview;
