'use client';

import React from 'react';
import { useTabs } from 'src/hooks/use-tabs';
import { GlobalIcons } from 'src/utils/icons';
import { Scrollbar } from 'src/components/scrollbar';
import { CustomTabs } from 'src/components/custom-tabs';
import { Iconify } from 'src/components/iconify/iconify';
import { Box, Tab, Grid, Button, Avatar, Typography } from '@mui/material';

import IssuedBooks from './ViewDetailsComponent/IssuedBooks';
import FinesCharges from './ViewDetailsComponent/FinesCharges';
import ReservedBooks from './ViewDetailsComponent/ReservedBooks';

import type { IMember } from './type';

const TABS = [
  {
    value: 'issued-books',
    label: 'Issued Books',
    icon: <Iconify icon="solar:book-bookmark-bold" />,
    component: ({ member }: { member: IMember | null }) => <IssuedBooks member={member} />,
  },
  {
    value: 'reserved-books',
    label: 'Reserved Books',
    icon: <Iconify icon="solar:calendar-bold" />,
    component: ({ member }: { member: IMember | null }) => <ReservedBooks member={member} />,
  },
  {
    value: 'fines-charges',
    label: 'Fines & Charges',
    icon: <Iconify icon="solar:wallet-money-bold" />,
    component: ({ member }: { member: IMember | null }) => <FinesCharges member={member} />,
  },
];

interface MemberDetailedViewComponentProps {
  member: IMember | null;
  onClose: (event: any, isSubmit?: boolean) => void;
}

const MemberDetailedViewComponent: React.FC<MemberDetailedViewComponentProps> = ({
  member,
  onClose,
}) => {
  // Initialize tab state, defaulting to 'issued-books'
  const tabs = useTabs('issued-books');

  // Find the currently selected tab's component to render
  const CurrentComponent = TABS.find((tab) => tab.value === tabs.value)?.component;

  return (
    <Box
      sx={{
        height: { xs: '80vh', sm: '85vh', md: '90vh' }, // Responsive height
        maxHeight: '800px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden', // Prevent main container overflow
      }}
    >
      {/* Member Information Header */}
      <Box
        sx={{
          p: { xs: 2, sm: 3 }, // Responsive padding
          borderBottom: '1px solid',
          borderColor: 'divider',
          flexShrink: 0, // Prevent shrinking
        }}
      >
        <Typography variant="h6" gutterBottom>
          Member Information
        </Typography>

        <Grid container spacing={{ xs: 2, sm: 3 }} alignItems="center">
          <Grid size={{ xs: 12 }}>
            <Avatar
              src="/assets/images/avatar/avatar-1.jpg"
              alt={member?.name || 'Member'}
              sx={{ width: { xs: 60, sm: 80 }, height: { xs: 60, sm: 80 } }} // Responsive avatar size
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  Member Name
                </Typography>
                <Typography
                  variant="body1"
                  fontWeight="medium"
                  sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }} // Responsive font size
                >
                  {member?.name || 'Dharmik Jinjala'}
                </Typography>
              </Grid>

              <Grid size={{ xs: 6, sm: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  Member ID
                </Typography>
                <Typography
                  variant="body1"
                  fontWeight="medium"
                  sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                >
                  {member?.id || 'DDVS001'}
                </Typography>
              </Grid>

              <Grid size={{ xs: 6, sm: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  Current Issued Books
                </Typography>
                <Typography
                  variant="body1"
                  fontWeight="medium"
                  sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                >
                  {member?.currentIssue || '10'}
                </Typography>
              </Grid>

              <Grid size={{ xs: 6, sm: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  Overdue Return Books
                </Typography>
                <Typography
                  variant="body1"
                  fontWeight="medium"
                  sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                >
                  {member?.overdueReturn || '01'}
                </Typography>
              </Grid>

              <Grid size={{ xs: 6, sm: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  Role
                </Typography>
                <Typography
                  variant="body1"
                  fontWeight="medium"
                  sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                >
                  {member?.role || 'Student'}
                </Typography>
              </Grid>

              <Grid size={{ xs: 6, sm: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  Contact No.
                </Typography>
                <Typography
                  variant="body1"
                  fontWeight="medium"
                  sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                >
                  +91 6355030866
                </Typography>
              </Grid>

              <Grid size={{ xs: 6, sm: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  Pending Return Books
                </Typography>
                <Typography
                  variant="body1"
                  fontWeight="medium"
                  sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                >
                  10
                </Typography>
              </Grid>

              <Grid size={{ xs: 6, sm: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  Reserved Books
                </Typography>
                <Typography
                  variant="body1"
                  fontWeight="medium"
                  sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                >
                  02
                </Typography>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Box>

      {/* Tabs */}
      <CustomTabs value={tabs.value} onChange={tabs.onChange}>
        {TABS.map((tab) => (
          <Tab
            key={tab.value}
            value={tab.value}
            label={
              <Box display="flex" alignItems="center" gap={1}>
                {tab.icon}
                {tab.label}
              </Box>
            }
            sx={{
              fontSize: '14px',
              textTransform: 'none',
            }}
          />
        ))}
      </CustomTabs>

      {/* Tab Content */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <Scrollbar
          sx={{
            p: { xs: 1, sm: 2 },
            flex: 1,
            '& .simplebar-content': {
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            },
          }}
        >
          {CurrentComponent?.({ member })}
        </Scrollbar>
      </Box>

      {/* Cancel Button */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 2,
          p: { xs: 1.5, sm: 2 },
          borderTop: '1px solid',
          borderColor: 'divider',
          flexShrink: 0, // Prevent shrinking
        }}
      >
        <Button
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
          onClick={() => onClose(null, false)}
          variant="outlined"
          size="small"
        >
          Cancel
        </Button>
      </Box>
    </Box>
  );
};

export default MemberDetailedViewComponent;
