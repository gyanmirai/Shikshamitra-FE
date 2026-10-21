import { LoadingButton } from '@mui/lab';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { DialogScrollContent } from 'src/components/customDialog';
import { Box, Alert, Button, Typography, DialogActions, LinearProgress } from '@mui/material';

import { BoardScreenStep } from './board-screen-step';
import { useAccessControlForm } from './hooks/use-access-control-form';

import type { AccessControlFormProps } from './hooks/use-access-control-form';

export const AccessControlForm = (props: AccessControlFormProps) => {
  const { user, handleClose, onCancel } = props;
  const {
    yearId,
    checkedItem,
    setCheckedItem,
    setSelectedData,
    allBoards,
    isHierarchyLoading,
    canSubmit,
    isAddAccessControlLoading,
    accessError,
    boardsError,
    refetchAccess,
    refetchBoards,
    handleSubmit,
  } = useAccessControlForm(props);

  return (
    <>
      <DialogScrollContent
        sx={{ minHeight: '100%', display: 'flex', flexDirection: 'column' }}
        scrollBarProps={{
          sx: {
            '.simplebar-content': {
              minHeight: '100%',
            },
          },
        }}
      >
        <Box
          component="fieldset"
          disabled={isAddAccessControlLoading || isHierarchyLoading}
          sx={{ flex: 1, minWidth: 0, m: 0, p: 0, border: 0 }}
        >
          {!user?.id ? (
            <Typography variant="body2" color="text.secondary">
              Select an employee before saving access control.
            </Typography>
          ) : !yearId ? (
            <Typography variant="body2" color="text.secondary">
              Choose an academic year above to load this user’s access controls.
            </Typography>
          ) : isHierarchyLoading ? (
            <LinearProgress aria-label="Loading academic access controls" />
          ) : accessError || boardsError ? (
            <Alert
              severity="error"
              action={
                <Button
                  color="inherit"
                  onClick={() => {
                    refetchAccess();
                    refetchBoards();
                  }}
                >
                  Retry
                </Button>
              }
            >
              Academic access controls could not be loaded. Try again before making changes.
            </Alert>
          ) : !allBoards?.length ? (
            <Typography variant="body2" color="text.secondary">
              Academic hierarchy is not available for the selected year.
            </Typography>
          ) : (
            <BoardScreenStep
              boards={allBoards}
              academicYearId={yearId}
              checkedItem={checkedItem}
              setCheckedItem={setCheckedItem}
              setSelectedData={setSelectedData}
            />
          )}
        </Box>
      </DialogScrollContent>

      <DialogActions>
        <Button
          size="small"
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
          variant="outlined"
          onClick={onCancel ?? handleClose}
          disabled={isAddAccessControlLoading}
        >
          Cancel
        </Button>
        <LoadingButton
          size="small"
          startIcon={<Iconify icon={GlobalIcons.submit} />}
          loading={isAddAccessControlLoading}
          disabled={!canSubmit || isAddAccessControlLoading}
          variant="contained"
          onClick={handleSubmit}
        >
          Submit
        </LoadingButton>
      </DialogActions>
    </>
  );
};
