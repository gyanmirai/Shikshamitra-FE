'use client';

import type { RootState } from 'src/redux/store';

import { useSelector } from 'react-redux';
import { libraryPaths } from 'src/constants/library-menus';
import { hasGrantedPermission } from 'src/utils/permissions';
import { Box, Alert, Button, LinearProgress } from '@mui/material';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useGetLibraryCalendarSettingsQuery } from 'src/redux/library/calendar-api';
import {
  useGetBorrowingReturnRulesQuery,
  useAddBorrowingReturnRulesMutation,
} from 'src/redux/library/settingApi';

import { BorrowingRulesEditor } from './BorrowingRulesEditor';
import { buildBorrowingRulesPayload } from './borrowing-rules';

const BorrowingReturnRules = ({ showHeader = true }: { showHeader?: boolean }) => {
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const { permissions } = useSelector((state: RootState) => state.auth);
  const academicYearId = (currentYear as { id?: string })?.id;
  const query = useGetBorrowingReturnRulesQuery(
    { academicYearId },
    { skip: !academicYearId, refetchOnMountOrArgChange: true }
  );
  const [save] = useAddBorrowingReturnRulesMutation();
  const authority = useGetLibraryCalendarSettingsQuery(
    { academicYearId: academicYearId || '' },
    { skip: !academicYearId }
  );
  const canEdit =
    hasGrantedPermission(permissions, 'Library.Settings.BorrowingRules.Add') &&
    Boolean(authority.currentData?.canManageCalendar);

  return (
    <Box data-testid="library-settings-borrowing-rules-page" sx={{ height: 1, minHeight: 0 }}>
      {authority.isFetching && !authority.currentData && (
        <LinearProgress aria-label="Checking borrowing rule authority" />
      )}
      {authority.isError && (
        <Alert
          severity="error"
          action={
            <Button size="small" onClick={() => authority.refetch()}>
              Retry
            </Button>
          }
        >
          Could not verify your authority to change tenant-wide limits.
        </Alert>
      )}
      {authority.currentData && !canEdit && (
        <Alert severity="info">
          Legacy limits require tenant-wide scope and the borrowing rules action permission to
          change.
        </Alert>
      )}
      {query.currentData ? (
        <BorrowingRulesEditor
          key={academicYearId}
          items={query.currentData.items || []}
          showHeader={showHeader}
          canEdit={canEdit}
          refreshing={query.isFetching}
          requestError={
            query.isError
              ? parseApiProblemDetail(query.error).detail ||
                'Could not refresh borrowing rules. Your changes are retained.'
              : undefined
          }
          onRetry={() => query.refetch()}
          onSave={async (values) => {
            try {
              await save({ academicYearId, data: buildBorrowingRulesPayload(values) }).unwrap();
            } catch (error) {
              throw new Error(
                parseApiProblemDetail(error).detail ||
                  'Could not save borrowing rules. Please retry.'
              );
            }
          }}
        />
      ) : (
        <>
          {showHeader && (
            <CustomBreadcrumbs
              heading="Borrowing Rules"
              description="Set concurrent borrowing and reservation limits for student and staff members."
              links={[
                { name: 'Library', href: libraryPaths.dashboard },
                { name: 'Borrowing Rules' },
              ]}
            />
          )}
          {!academicYearId && (
            <Alert severity="info">Select an academic year to load borrowing rules.</Alert>
          )}
          {query.isFetching && <LinearProgress aria-label="Loading borrowing rules" />}
          {query.isError && (
            <Alert
              severity="error"
              action={
                <Button size="small" onClick={() => query.refetch()}>
                  Retry
                </Button>
              }
            >
              {parseApiProblemDetail(query.error).detail || 'Could not load borrowing rules.'}
            </Alert>
          )}
        </>
      )}
    </Box>
  );
};

export default BorrowingReturnRules;
