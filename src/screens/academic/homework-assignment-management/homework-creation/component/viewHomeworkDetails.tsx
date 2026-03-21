import React from 'react';
import { varAlpha } from 'src/theme/styles';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { Box, Card, Grid, Typography } from '@mui/material';

import HomeworkOverview from './view-homework-details/homeworkOverview';

import type { IHomework } from '../type';

// Reusable Info Item Component matching BasicChargeAccordianCard pattern
interface InfoItemProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  iconColor?: string;
  iconBgColor?: string | ((theme: any) => string);
}

export const InfoItem = ({
  icon,
  label,
  value,
  iconColor = 'primary.main',
  iconBgColor = (theme) => varAlpha(theme.palette.primary.mainChannel, 0.08),
}: InfoItemProps) => (
  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
    <Box
      sx={{
        width: 40,
        height: 40,
        borderRadius: 1.5,
        bgcolor: iconBgColor,
        color: iconColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      {React.cloneElement(icon as React.ReactElement<any>, { sx: { fontSize: 20 } })}
    </Box>
    <Box sx={{ minWidth: 0 }}>
      <Typography
        variant="subtitle2"
        sx={{ color: 'text.secondary', display: 'block', fontWeight: 500 }}
      >
        {label}
      </Typography>
      <Typography
        variant="subtitle2"
        component="div"
        sx={{ fontWeight: 600, color: 'text.primary', wordBreak: 'break-word' }}
      >
        {value || 'N/A'}
      </Typography>
    </Box>
  </Box>
);

const ViewHomeworkDetails = ({ homework }: { homework: IHomework | null }) => {
  if (!homework) {
    return (
      <Box
        sx={{
          p: 2,
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box
          sx={{
            p: 2,
            borderRadius: 2,
            bgcolor: (theme) => varAlpha(theme.palette.grey['500Channel'], 0.08),
            border: (theme) => `1px dashed ${theme.palette.divider}`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
            textAlign: 'center',
          }}
        >
          <Iconify
            icon="solar:clipboard-list-bold-duotone"
            sx={{ width: 64, height: 64, color: 'text.disabled' }}
          />
          <Typography variant="h6" sx={{ color: 'text.secondary' }}>
            No homework details available
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 1, height: '100%' }}>
      <Scrollbar sx={{ height: '100%' }}>
        <Card
          sx={{
            height: '100%',
            mx: 'auto',
            boxShadow: 'var(--shadows-10)',
            borderRadius: 2,
            ml: 1,
            mb: 2,
            mr: 1,
            mt: 0.5,
          }}
        >
          {/* Body */}
          <Box sx={{ p: 2 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 3 }}>
                <InfoItem
                  icon={<Iconify icon="mdi:book-open-page-variant" />}
                  label="Subject"
                  value={homework.subject}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <InfoItem
                  icon={<Iconify icon="mdi:google-classroom" />}
                  label="Class"
                  value={`${homework.class} - ${homework.divisionMeta?.divisionId}`}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 3 }}>
                <InfoItem
                  icon={<Iconify icon="solar:bookmark-circle-bold" />}
                  label="Chapter"
                  value={homework.chapter}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <InfoItem
                  icon={<Iconify icon={GlobalIcons.submit} />}
                  label="Submit Via"
                  value={homework.submissionType}
                />
              </Grid>
            </Grid>
          </Box>
        </Card>

        {/* Detailed Overview */}
        <Box sx={{ borderColor: 'divider', mb: 2 }}>
          <HomeworkOverview homework={homework} />
        </Box>
      </Scrollbar>
    </Box>
  );
};

export default ViewHomeworkDetails;
