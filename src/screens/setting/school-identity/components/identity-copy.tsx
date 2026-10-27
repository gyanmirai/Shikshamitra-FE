import type { AcademicYear } from 'src/types/school';

import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import DialogActions from '@mui/material/DialogActions';
import { FormSectionCard } from 'src/components/form-section-card';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';

import { IdentityAssets } from './identity-assets';
import { useIdentityCopy } from '../hooks/use-identity-copy';
import { IdentityContextFields } from './identity-context-fields';

import type { IdentityContext } from '../types';

export function IdentityCopyDialog({
  years,
  targetYearId,
  target,
  stamp,
  onClose,
}: {
  years: AcademicYear[];
  targetYearId: string;
  target: IdentityContext;
  stamp: string;
  onClose: () => void;
}) {
  const {
    selection: { year, board, medium, organization },
    error,
    copying,
    sourceHierarchy,
    boards,
    context,
    query,
    compatible,
    copySource,
    selectSource,
  } = useIdentityCopy(target, stamp, onClose);
  return (
    <CustomDialog
      open
      title="Copy School Identity Overrides"
      titleInfo="Choose an existing override from another academic year and review its images before copying."
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
            title="Source Context"
            descriptionTooltip="Select the source board, medium and organization from another academic year at the same override level. Copying replaces this context’s explicit choices and preserves inheritance. Shared school defaults are not copied."
          >
            <IdentityContextFields
              years={years.filter((item) => item.id !== targetYearId)}
              boards={boards}
              yearId={year}
              boardId={board}
              mediumId={medium}
              organizationId={organization}
              disabled={copying.isLoading || sourceHierarchy.isFetching}
              onChange={selectSource}
            />
          </FormSectionCard>
          {sourceHierarchy.isError && (
            <Alert
              severity="error"
              action={<Button onClick={() => sourceHierarchy.refetch()}>Retry</Button>}
            >
              Source academic options could not be loaded.
            </Alert>
          )}
          {board && !compatible && (
            <Alert severity="warning">
              Choose{' '}
              {target.organizationId
                ? 'a specific organization'
                : target.mediumId
                  ? 'a specific medium and All organizations'
                  : 'All mediums'}{' '}
              to match the target override level.
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
        <Button
          variant="outlined"
          disabled={copying.isLoading}
          onClick={onClose}
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          disabled={
            copying.isLoading ||
            !compatible ||
            !query.currentData?.id ||
            !query.currentData.canManage ||
            query.isFetching ||
            sourceHierarchy.isFetching ||
            sourceHierarchy.isError
          }
          onClick={copySource}
          startIcon={<Iconify icon={GlobalIcons.copy} />}
        >
          Copy overrides
        </Button>
      </DialogActions>
    </CustomDialog>
  );
}
