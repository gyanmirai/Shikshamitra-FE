'use client';

import type { FormEvent } from 'react';
import type { RootState } from 'src/redux/store';

import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { libraryPaths } from 'src/constants/library-menus';
import { hasGrantedPermission } from 'src/utils/permissions';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Box, Stack, Alert, Button, LinearProgress } from '@mui/material';

import { HoursSchedule } from './HoursSchedule';
import { hoursDraft } from './library-hours-model';
import { HoursConfirmation } from './HoursConfirmation';
import { useLibraryHoursRead } from './useLibraryHoursRead';
import { useLibraryHoursDraft } from './useLibraryHoursDraft';

function HoursWorkspace({
  academicYearId,
  canEdit: hasEditAction,
}: {
  academicYearId: string;
  canEdit: boolean;
}) {
  const read = useLibraryHoursRead(academicYearId);
  const canEdit =
    hasEditAction &&
    read.source?.canManageHours === true &&
    read.query.currentData?.canManageHours === true;
  const draft = useLibraryHoursDraft(academicYearId, read.source, canEdit, read.retry);
  const busy = draft.formik.isSubmitting;
  const refreshed =
    draft.formik.dirty &&
    read.query.currentData &&
    JSON.stringify(hoursDraft(read.query.currentData).hours) !==
      JSON.stringify(draft.formik.initialValues.hours);
  const submit = (event: FormEvent) => {
    event.preventDefault();
    draft.requestSave();
  };
  return (
    <Box
      data-testid="library-settings-library-hours-page"
      sx={{ height: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}
    >
      <CustomBreadcrumbs
        heading="Library Hours"
        description="Review or configure the Library opening schedule for the selected academic year."
        links={[{ name: 'Library', href: libraryPaths.dashboard }, { name: 'Library Hours' }]}
        action={
          <Button
            type="button"
            variant="outlined"
            color="inherit"
            size="small"
            disabled={!academicYearId || read.loading || busy}
            startIcon={<Iconify icon={GlobalIcons.refresh} />}
            onClick={draft.reload}
          >
            Refresh
          </Button>
        }
      />
      <Stack spacing={2} sx={{ flex: 1, minHeight: 0 }}>
        <Alert severity="info">
          Enter Library opening hours manually. No linked school-hours schedule is available.
        </Alert>
        {!academicYearId && (
          <Alert severity="info">Select an academic year to load Library hours.</Alert>
        )}
        {(read.loading || read.query.isFetching) && (
          <LinearProgress aria-label="Loading Library hours" />
        )}
        {read.error && (
          <Alert severity="error" action={<Button onClick={draft.reload}>Retry</Button>}>
            {read.error}
          </Alert>
        )}
        {read.source && (
          <>
            {hasEditAction && !canEdit && (
              <Alert severity="info">
                Editing Library hours is unavailable. Reload to check your access.
                {draft.formik.dirty && ' Your unsaved changes are retained.'}
              </Alert>
            )}
            {read.query.isError && (
              <Alert severity="error" action={<Button onClick={draft.reload}>Retry</Button>}>
                Saved hours could not be refreshed. Your draft is retained.
              </Alert>
            )}
            {draft.error && <Alert severity="error">{draft.error}</Alert>}
            {refreshed && (
              <Alert
                severity="info"
                action={<Button onClick={draft.reload}>Review saved hours</Button>}
              >
                Saved hours have refreshed. Your unsaved changes are retained.
              </Alert>
            )}
            {!read.source.items.length && (
              <Alert severity="info">
                No opening hours are saved. The weekly rows are a new draft.
              </Alert>
            )}
            <Box
              component={canEdit ? 'form' : 'div'}
              onSubmit={canEdit ? submit : undefined}
              sx={{ minHeight: 0, flex: 1, display: 'flex', flexDirection: 'column' }}
            >
              <HoursSchedule draft={draft} canEdit={canEdit} />
            </Box>
          </>
        )}
      </Stack>
      <HoursConfirmation
        kind={draft.confirm}
        busy={busy}
        onClose={() => {
          if (!busy) draft.setConfirm(null);
        }}
        onSave={draft.formik.submitForm}
        onReset={draft.reset}
      />
      {draft.navigationConfirmation}
    </Box>
  );
}

export default function LibraryTimingCreation() {
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const { permissions } = useSelector((state: RootState) => state.auth);
  const academicYearId = currentYear?.id || '';
  const canEdit =
    hasGrantedPermission(permissions, 'Library.Settings.LibraryHours.View') &&
    hasGrantedPermission(permissions, 'Library.Settings.LibraryHours.Add');
  return <HoursWorkspace key={academicYearId} academicYearId={academicYearId} canEdit={canEdit} />;
}
