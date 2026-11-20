'use client';

import { useState } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { CustomTabs } from 'src/components/custom-tabs';
import { DialogScrollContent } from 'src/components/customDialog';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { Box, Tab, Alert, Stack, Button, DialogActions, LinearProgress } from '@mui/material';
import { useGetMemberDetailsQuery } from 'src/redux/library/libraryMembers/memberManagementApi';

import { MemberProfile } from './MemberProfile';
import IssuedBooks from './ViewDetailsComponent/IssuedBooks';
import FinesCharges from './ViewDetailsComponent/FinesCharges';
import ReservedBooks from './ViewDetailsComponent/ReservedBooks';
import BorrowHistory from './ViewDetailsComponent/BorrowHistory';

import type { IMember } from './type';

const panels = [
  {
    value: 'borrowed',
    label: 'Borrowed Books',
    icon: GlobalIcons.issueBook,
    Component: IssuedBooks,
  },
  {
    value: 'reserved',
    label: 'Reserved Books',
    icon: GlobalIcons.reservation,
    Component: ReservedBooks,
  },
  { value: 'charges', label: 'Charges', icon: GlobalIcons.paymentSummary, Component: FinesCharges },
  {
    value: 'history',
    label: 'Borrow History',
    icon: GlobalIcons.history,
    Component: BorrowHistory,
  },
];

const MemberDetailedViewComponent = ({
  member,
  onClose,
}: {
  member: IMember | null;
  onClose: (event: unknown, isSubmit?: boolean) => void;
}) => {
  const [tab, setTab] = useState('borrowed');
  const { currentData, isFetching, isError, error, refetch } = useGetMemberDetailsQuery(
    { memberId: member?.id },
    { skip: !member?.id, refetchOnMountOrArgChange: true }
  );
  const details = currentData as IMember | undefined;
  const Panel = panels.find((panel) => panel.value === tab)?.Component;

  return (
    <>
      <DialogScrollContent>
        <Stack spacing={2} sx={{ minWidth: 0 }}>
          {isFetching && <LinearProgress aria-label="Loading member details" />}
          {isError && (
            <Alert
              severity="error"
              action={
                <Button size="small" onClick={() => refetch()}>
                  Retry
                </Button>
              }
            >
              {parseApiProblemDetail(error).detail || 'Could not load member details.'}
            </Alert>
          )}
          {!member?.id && (
            <Alert severity="info">Select a library member to view their details.</Alert>
          )}
          {details && (
            <>
              <MemberProfile member={details} />
              <CustomTabs
                value={tab}
                onChange={(_, value: string) => setTab(value)}
                aria-label="Member records"
              >
                {panels.map((panel) => (
                  <Tab
                    key={panel.value}
                    value={panel.value}
                    label={panel.label}
                    icon={<Iconify icon={panel.icon} />}
                    id={`member-tab-${panel.value}`}
                    aria-controls={`member-panel-${panel.value}`}
                  />
                ))}
              </CustomTabs>
              <Box
                role="tabpanel"
                id={`member-panel-${tab}`}
                aria-labelledby={`member-tab-${tab}`}
                sx={{ minHeight: 0 }}
              >
                {Panel && <Panel key={`${details.id}-${tab}`} member={details} />}
              </Box>
            </>
          )}
        </Stack>
      </DialogScrollContent>
      <DialogActions>
        <Button
          variant="outlined"
          color="inherit"
          size="small"
          onClick={() => onClose(null)}
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
        >
          Close
        </Button>
      </DialogActions>
    </>
  );
};

export default MemberDetailedViewComponent;
