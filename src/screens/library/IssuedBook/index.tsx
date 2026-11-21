'use client';

import type { RootState } from 'src/redux/store';

import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Box, Stack, Button } from '@mui/material';
import { libraryPaths } from 'src/constants/library-menus';
import { hasGrantedPermission } from 'src/utils/permissions';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import BookIssueReturnTable from './Components/IssuedBookTable';
import { CirculationDialogs } from '../circulation/CirculationDialogs';
import { useCirculationDialog } from '../circulation/useCirculationDialog';

import type { LibraryLoanRow } from '../circulation/loan-types';
import type { CirculationDialogState } from '../circulation/return-target';

function CirculationWorkspace() {
  const { permissions } = useSelector((state: RootState) => state.auth);
  const canIssue = hasGrantedPermission(permissions, 'Library.IssueReturn.Issue');
  const canReturn = hasGrantedPermission(permissions, 'Library.IssueReturn.Return');
  const canRenew = hasGrantedPermission(permissions, 'Library.IssueReturn.Renew');
  const canReviewDates = hasGrantedPermission(permissions, 'Library.IssueReturn.ReviewDates');
  const state = useCirculationDialog();
  const openSaved = (kind: CirculationDialogState['kind'], row: LibraryLoanRow) => {
    if (row.copyId && (row.transactionId || row.id))
      state.open(kind, row.accessionNo, {
        loanId: row.transactionId || row.id,
        copyId: row.copyId,
      });
  };
  return (
    <Box
      data-testid="library-issue-return-page"
      sx={{ height: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}
    >
      <CustomBreadcrumbs
        heading="Issue & Return"
        description="Manage borrowing and return records for Library members in your scope."
        links={[{ name: 'Library', href: libraryPaths.dashboard }, { name: 'Issue & Return' }]}
        action={
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
            {canIssue && (
              <Button
                data-testid="library-issue-open-button"
                size="small"
                color="inherit"
                variant="outlined"
                disabled={state.busy}
                startIcon={<Iconify icon={GlobalIcons.issueBook} />}
                onClick={() => state.open('issue')}
              >
                Issue
              </Button>
            )}
            {canReturn && (
              <Button
                data-testid="library-return-open-button"
                size="small"
                color="inherit"
                variant="contained"
                disabled={state.busy}
                startIcon={<Iconify icon={GlobalIcons.retrunIcon} />}
                onClick={() => state.open('return')}
              >
                Return
              </Button>
            )}
          </Stack>
        }
      />
      <BookIssueReturnTable
        onReturnBook={canReturn ? (row) => openSaved('return', row) : undefined}
        onRenewBook={canRenew ? (row) => openSaved('renew', row) : undefined}
        onReviewDates={canReviewDates ? (row) => openSaved('reviewDates', row) : undefined}
      />
      <CirculationDialogs
        dialog={state.dialog}
        busy={state.busy}
        onBusyChange={state.setBusy}
        onClose={state.onClose}
        onReload={state.reload}
      />
      {state.confirmation}
    </Box>
  );
}

export default function IssueReturnBook() {
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const academicYearId = (currentYear as { id?: string })?.id || '';
  return <CirculationWorkspace key={academicYearId} />;
}
