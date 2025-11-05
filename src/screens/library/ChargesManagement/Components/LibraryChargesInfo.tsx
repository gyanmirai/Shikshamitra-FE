'use client';

import React, { useMemo, useState } from 'react';
import { Iconify } from 'src/components/iconify';
import { ExpandMore } from '@mui/icons-material';
import {
  Box,
  Grid,
  Stack,
  Accordion,
  Typography,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';

import type { ILibraryChargeData } from './type';

export default function LibraryChargeInfo({ charge }: { charge: ILibraryChargeData | null }) {
  const [expandedMember, setExpandedMember] = useState(false);

  // Member details using useMemo
  const memberDetails = useMemo(() => {
    if (!charge) return [];

    const details = [
      { label: 'Name', icon: 'mdi:account', value: charge.memberName || '—' },
      { label: 'Role', icon: 'mdi:account-group', value: charge.role || '—' },
      { label: 'Member ID', icon: 'mdi:card-account-details', value: charge.memberId || '—' },
    ];

    if (charge.role === 'Student') {
      details.push(
        {
          label: 'Class / Division',
          icon: 'mdi:school',
          value: `${charge.classNo || '—'}${charge.division ? `-${charge.division}` : ''}`,
        },
        { label: 'Roll No.', icon: 'mdi:format-list-numbered', value: charge.rollNo || '—' },
        { label: 'GR No', icon: 'mdi:card-account-details-outline', value: charge.grNo || '—' }
      );
    }

    return details;
  }, [charge]);

  if (!charge) return null;

  return (
    <Accordion
      expanded={expandedMember}
      onChange={() => setExpandedMember(!expandedMember)}
      sx={{
        boxShadow: 1,
        borderRadius: '12px !important',
        '&:before': { display: 'none' },
        border: '1px solid',
        borderColor: 'divider',
        mb: 2,
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMore />}
        sx={{
          '& .MuiAccordionSummary-content': {
            my: 1.5,
            display: 'block',
          },
        }}
      >
        <Typography variant="h6" color="primary.main" mb={expandedMember ? 0 : 1}>
          Basic Information
        </Typography>

        {/* Show preview when collapsed */}
        {!expandedMember && (
          <Grid container spacing={2} mt={0.5}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Iconify icon="mdi:account" width={18} color="text.secondary" />
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                    sx={{ fontSize: '0.65rem', lineHeight: 1.2 }}
                  >
                    Name:
                  </Typography>
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    color="text.primary"
                    sx={{ fontSize: '0.75rem' }}
                    noWrap
                  >
                    {charge.memberName || '—'}
                  </Typography>
                </Box>
              </Stack>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Iconify icon="mdi:account-group" width={18} color="text.secondary" />
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                    sx={{ fontSize: '0.65rem', lineHeight: 1.2 }}
                  >
                    Role:
                  </Typography>
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    color="text.primary"
                    sx={{ fontSize: '0.75rem' }}
                    noWrap
                  >
                    {charge.role || '—'}
                  </Typography>
                </Box>
              </Stack>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Iconify icon="mdi:card-account-details" width={18} color="text.secondary" />
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                    sx={{ fontSize: '0.65rem', lineHeight: 1.2 }}
                  >
                    Member ID:
                  </Typography>
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    color="text.primary"
                    sx={{ fontSize: '0.75rem' }}
                    noWrap
                  >
                    {charge.memberId || '—'}
                  </Typography>
                </Box>
              </Stack>
            </Grid>
          </Grid>
        )}
      </AccordionSummary>

      <AccordionDetails sx={{ pt: 0 }}>
        <Grid container spacing={2}>
          {memberDetails.map((d) => (
            <Grid key={d.label} size={{ xs: 12, sm: 6, md: 4 }}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Iconify icon={d.icon} width={20} color="text.secondary" />
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                    sx={{ fontSize: '0.7rem', lineHeight: 1.2 }}
                  >
                    {d.label}:
                  </Typography>
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    color="text.primary"
                    sx={{ fontSize: '0.8rem' }}
                    noWrap
                  >
                    {d.value}
                  </Typography>
                </Box>
              </Stack>
            </Grid>
          ))}
        </Grid>
      </AccordionDetails>
    </Accordion>
  );
}
