'use client';

import type { RootState } from 'src/redux/store';
import type { AcademicYear } from 'src/types/school';

import { useState } from 'react';
import { useSelector } from 'react-redux';
import CustomDialog from 'src/components/customDialog';
import { useGetYearQuery } from 'src/redux/year/yearApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { Box, Alert, Button, MenuItem, TextField, Typography } from '@mui/material';

import { AccessControlForm } from '../accessControl/access-control-form';

type AcademicPermissionUser = { id: string; userName: string };

type AcademicPermissionDialogProps = {
  open: boolean;
  user: AcademicPermissionUser | null;
  onClose: () => void;
};

export default function AcademicPermissionDialog({
  open,
  user,
  onClose,
}: AcademicPermissionDialogProps) {
  const currentYear = useSelector(
    (state: RootState) => state.globalState.currentYear
  ) as Partial<AcademicYear>;
  const [yearOverride, setYearOverride] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);
  const { data, isLoading, isError, refetch } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetYearQuery,
    options: { skip: !open },
  });
  const years: AcademicYear[] = data?.items ?? [];
  const requestedYearId = yearOverride ?? currentYear?.id ?? '';
  const selectedYearId = years.some((year) => year.id === requestedYearId) ? requestedYearId : '';

  const changeYear = (yearId: string) => {
    if (dirty && !window.confirm('Discard unsaved academic permission changes and switch years?'))
      return;
    setDirty(false);
    setYearOverride(yearId);
  };
  const cancel = () => {
    if (!busy && (!dirty || window.confirm('Discard unsaved academic permission changes?')))
      onClose();
  };

  return (
    <CustomDialog
      fullScreen
      title="Academic Permission"
      titleInfo="Choose an academic year and select the academic areas this user can access. Changes apply only to the selected year."
      open={open}
      handleClose={onClose}
      disableClose={busy}
      hasUnsavedChanges={dirty}
    >
      {open && (
        <>
          <Box
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              gap: 2,
              alignItems: { sm: 'center' },
              borderBottom: 1,
              borderColor: 'divider',
            }}
          >
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="subtitle1" sx={{ overflowWrap: 'anywhere' }}>
                {user?.userName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Manage academic access for the selected year.
              </Typography>
            </Box>
            <TextField
              select
              fullWidth
              size="small"
              label="Academic year"
              value={selectedYearId}
              disabled={busy || isLoading || !years.length}
              onChange={(event) => changeYear(event.target.value)}
              helperText={
                isLoading
                  ? 'Loading academic years…'
                  : 'Defaults to your global academic year selection.'
              }
              sx={{ width: { xs: '100%', sm: 300 }, flexShrink: 0 }}
            >
              {years.map((year) => (
                <MenuItem key={year.id} value={year.id}>
                  {year.name}
                </MenuItem>
              ))}
            </TextField>
          </Box>
          {isError && (
            <Alert
              severity="error"
              action={
                <Button color="inherit" onClick={() => refetch()}>
                  Retry
                </Button>
              }
              sx={{ mx: 2, mt: 2 }}
            >
              Academic years could not be loaded. Try again.
            </Alert>
          )}
          {!isLoading && !isError && !years.length && (
            <Alert severity="info" sx={{ mx: 2, mt: 2 }}>
              No academic years are available. Add an academic year in Academic Setup before
              assigning access.
            </Alert>
          )}
          <AccessControlForm
            key={`${user?.id}:${selectedYearId}`}
            user={user}
            academicYearId={selectedYearId}
            handleClose={onClose}
            onCancel={cancel}
            onBusyChange={setBusy}
            onDirtyChange={setDirty}
          />
        </>
      )}
    </CustomDialog>
  );
}
