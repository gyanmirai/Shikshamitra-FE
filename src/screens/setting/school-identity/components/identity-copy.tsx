import type { Board, AcademicYear } from 'src/types/school';

import { useState } from 'react';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import { shikshaMitraToast } from 'src/components/toast';
import { FormSectionCard } from 'src/components/form-section-card';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import {
  useGetSchoolIdentityQuery,
  useCopySchoolIdentityMutation,
} from 'src/redux/InstituteSetup/schoolIdentityApi';

import { identityError } from '../identity-form';
import { IdentityAssets } from './identity-assets';
import { IdentityContextFields } from './identity-context-fields';

import type { IdentityContext } from '../types';

export function IdentityCopyDialog({
  years,
  boards,
  targetYearId,
  target,
  stamp,
  onClose,
}: {
  years: AcademicYear[];
  boards: Board[];
  targetYearId: string;
  target: IdentityContext;
  stamp: string;
  onClose: () => void;
}) {
  const [year, setYear] = useState('');
  const [board, setBoard] = useState('');
  const [medium, setMedium] = useState('');
  const [error, setError] = useState('');
  const [copy, copying] = useCopySchoolIdentityMutation();
  const context = { boardId: board || undefined, mediumId: medium || undefined };
  const query = useGetSchoolIdentityQuery(context, { skip: !board });
  const compatible = Boolean(
    board && target.boardId && Boolean(medium) === Boolean(target.mediumId)
  );
  const copySource = async () => {
    if (!target.boardId || !compatible) return;
    try {
      await copy({
        sourceBoardId: board,
        sourceMediumId: medium || undefined,
        targetBoardId: target.boardId,
        targetMediumId: target.mediumId,
        targetConcurrencyStamp: stamp,
      }).unwrap();
      shikshaMitraToast.success({ message: 'School Identity overrides copied.' });
      onClose();
    } catch (failure) {
      setError(identityError(failure));
    }
  };
  return (
    <CustomDialog
      open
      title="Copy School Identity Overrides"
      handleClose={onClose}
      hasForm={false}
      hasUnsavedChanges={false}
      maxWidth="md"
      disableClose={copying.isLoading}
    >
      <DialogScrollContent>
        <Stack spacing={2}>
          <FormSectionCard
            icon="mdi:content-copy"
            title="Source context"
            descriptionTooltip="Select the source board and medium from another academic year. Copying replaces this context’s explicit choices and preserves inheritance. Shared school defaults are not copied."
          >
            <IdentityContextFields
              years={years.filter((item) => item.id !== targetYearId)}
              boards={boards}
              yearId={year}
              boardId={board}
              mediumId={medium}
              disabled={copying.isLoading}
              onChange={(nextYear, nextBoard, nextMedium) => {
                setYear(nextYear);
                setBoard(nextBoard);
                setMedium(nextMedium);
                setError('');
              }}
            />
          </FormSectionCard>
          {board && !compatible && (
            <Alert severity="warning">
              Choose {target.mediumId ? 'a specific medium' : 'All mediums'} to match the target
              override level.
            </Alert>
          )}
          {query.isError && (
            <Alert severity="error">The source override could not be loaded.</Alert>
          )}
          {query.currentData && !query.currentData.id && (
            <Alert severity="info">This source context has no saved override to copy.</Alert>
          )}
          {query.currentData && !query.currentData.canManage && (
            <Alert severity="warning">Select a source context you have management access to.</Alert>
          )}
          {query.currentData && <IdentityAssets profile={query.currentData} context={context} />}
          {error && <Alert severity="error">{error}</Alert>}
        </Stack>
      </DialogScrollContent>
      <DialogActions>
        <Button disabled={copying.isLoading} onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="contained"
          disabled={
            copying.isLoading ||
            !compatible ||
            !query.currentData?.id ||
            !query.currentData.canManage ||
            query.isFetching
          }
          onClick={copySource}
        >
          Copy overrides
        </Button>
      </DialogActions>
    </CustomDialog>
  );
}
