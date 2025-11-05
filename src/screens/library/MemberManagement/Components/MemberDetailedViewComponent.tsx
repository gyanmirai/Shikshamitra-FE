'use client';

import React from 'react';
import { useTabs } from 'src/hooks/use-tabs';
import { useTheme } from '@mui/material/styles';
import { Scrollbar } from 'src/components/scrollbar';
import { CustomTabs } from 'src/components/custom-tabs';
import { Iconify } from 'src/components/iconify/iconify';
import { Tab, Card, Grid, Avatar, Typography } from '@mui/material';

import IssuedBooks from './ViewDetailsComponent/IssuedBooks';
import FinesCharges from './ViewDetailsComponent/FinesCharges';
import ReservedBooks from './ViewDetailsComponent/ReservedBooks';
import BorrowHistory from './ViewDetailsComponent/BorrowHistory';

import type { IMember } from './type';

const TABS = [
  {
    value: 'borrow-books',
    label: 'Borrowed Books',
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
    label: 'Charges',
    icon: <Iconify icon="solar:wallet-money-bold" />,
    component: ({ member }: { member: IMember | null }) => <FinesCharges member={member} />,
  },
  {
    value: 'borrow-history',
    label: 'Borrow History',
    icon: <Iconify icon="fluent:book-contacts-24-filled" />, // Added icon for borrow history
    component: ({ member }: { member: IMember | null }) => <BorrowHistory member={member} />,
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
  const tabs = useTabs('borrow-books');
  const theme = useTheme();
  // Find the currently selected tab's component to render
  const CurrentComponent = TABS.find((tab) => tab.value === tabs.value)?.component;

  return (
    <Scrollbar
      sx={{
        p: 2,
        height: { xs: '80vh' }, // Responsive height
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Member Information Header */}
      <Card
        sx={{
          p: 2,
          mb: 2,
          borderRadius: 3,
          boxShadow: 2,
          bgcolor: theme.vars.palette.background.paper,
        }}
      >
        <Grid container spacing={2}>
          {/* Left Side: Avatar */}
          <Grid size={{ xs: 12, sm: 1 }} display="flex" justifyContent="center">
            <Avatar
              src="/assets/images/avatar/avatar-1.jpg"
              alt={member?.name || 'Member'}
              sx={{
                mt: 2,
                width: { xs: 60, sm: 80 },
                height: { xs: 60, sm: 80 },
                borderRadius: '50%',
              }}
            />
          </Grid>

          {/* Right Side: Member Details */}
          <Grid size={{ xs: 12, sm: 11 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Member Name
                </Typography>
                <Typography variant="subtitle2" fontWeight="medium">
                  {member?.name || 'Dharmik Jinjala'}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Class/Division
                </Typography>
                <Typography variant="subtitle2" fontWeight="medium">
                  {member?.class || '10'}-{member?.division || 'A'}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Roll No.
                </Typography>
                <Typography variant="subtitle2" fontWeight="medium">
                  {member?.rollNo || '10'}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Gr No.
                </Typography>
                <Typography variant="subtitle2" fontWeight="medium">
                  {member?.grNo || 'GR43'}
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, sm: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Member ID
                </Typography>
                <Typography variant="subtitle2" fontWeight="medium">
                  {member?.id || 'DDVS001'}
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, sm: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Overdue Return Books
                </Typography>
                <Typography variant="subtitle2" fontWeight="medium">
                  {member?.overdueReturn || '01'}
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, sm: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Role
                </Typography>
                <Typography variant="subtitle2" fontWeight="medium">
                  {member?.role || 'Student'}
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, sm: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Contact No.
                </Typography>
                <Typography variant="subtitle2" fontWeight="medium">
                  {member?.contactNo || 'N/A'}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Reserved Books
                </Typography>
                <Typography variant="subtitle2" fontWeight="medium">
                  02
                </Typography>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Card>

      {/* Tabs */}
      <Card
        sx={{
          '& *': { fontSize: '13px !important', '& svg': { fontSize: '18px !important' } },
        }}
      >
        <CustomTabs
          value={tabs.value}
          onChange={tabs.onChange}
          sx={{ '& .MuiTabs-flexContainer': { gap: 1.5 } }}
          role="tablist"
        >
          {TABS.map((tab) => (
            <Tab key={tab.value} value={tab.value} label={tab.label} icon={tab.icon} />
          ))}
        </CustomTabs>
      </Card>

      {/* Tab Content */}
      <Scrollbar sx={{ p: 1 }}>
        {CurrentComponent && <CurrentComponent member={member} />}
      </Scrollbar>
    </Scrollbar>
  );
};

export default MemberDetailedViewComponent;
