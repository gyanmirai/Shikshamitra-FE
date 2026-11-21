import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useGetBookCopyLabelsQuery } from 'src/redux/library/copy-labels-api';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { Alert, Button, Typography, DialogActions, LinearProgress } from '@mui/material';

import { SavedLabelsGrid } from './SavedLabelsGrid';
import { SavedLabelsPrintPortal } from './SavedLabelsPrintPortal';
import { useSavedLabelValidation } from './useSavedLabelValidation';

import type { SavedLabel } from './saved-label-model';

export function SavedCopyLabelsDialog({
  open,
  bookId,
  copyIds,
  onClose,
}: {
  open: boolean;
  bookId?: string;
  copyIds?: readonly string[];
  onClose: () => void;
}) {
  const { currentData, isFetching, isError, refetch } = useGetBookCopyLabelsQuery(
    { bookId },
    { skip: !open || !bookId, refetchOnMountOrArgChange: true }
  );
  const savedLabels: SavedLabel[] = currentData?.labels || [];
  const selectedIds = copyIds === undefined ? undefined : new Set(copyIds);
  const labels = selectedIds
    ? savedLabels.filter((label) => selectedIds.has(label.copyId))
    : savedLabels;
  const emptySelection = selectedIds?.size === 0;
  const missingSelection = Boolean(
    selectedIds &&
    currentData &&
    !isFetching &&
    !isError &&
    [...selectedIds].some((id) => !savedLabels.some((label) => label.copyId === id))
  );
  const validation = useSavedLabelValidation(labels);
  const canPrint =
    open && !isFetching && !isError && !emptySelection && !missingSelection && validation.canPrint;
  return (
    <>
      <CustomDialog
        open={open}
        maxWidth="md"
        title="Saved Copy Labels"
        titleInfo="Saved labels print on A4 sheets, one label per row. Choose actual size in the print dialog."
        hasForm={false}
        guardUnsavedChanges={false}
        handleClose={onClose}
      >
        <DialogScrollContent>
          {(isFetching || validation.isPreparing) && (
            <LinearProgress aria-label="Preparing saved copy labels" />
          )}
          {emptySelection && (
            <Alert severity="warning">No received copies were selected for printing.</Alert>
          )}
          {missingSelection && (
            <Alert
              severity="error"
              action={
                <Button size="small" onClick={() => refetch()}>
                  Retry
                </Button>
              }
            >
              Some received copies are missing from saved label results. Refresh the saved record
              before printing.
            </Alert>
          )}
          {isError && (
            <Alert
              severity="error"
              action={
                <Button size="small" onClick={() => refetch()}>
                  Retry
                </Button>
              }
            >
              Could not load saved labels. No draft labels will be printed.
            </Alert>
          )}
          {validation.invalidCount > 0 && (
            <Alert severity="error">
              Some saved scan values cannot be encoded as barcodes. Printing is blocked. The
              accession text has not been changed.
            </Alert>
          )}
          {!isFetching && !isError && !labels.length && !emptySelection && !missingSelection && (
            <Alert severity="info">No saved copy labels are available yet.</Alert>
          )}
          {!isError && (
            <>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                A4 sheets · One label per row · Print at actual size
              </Typography>
              <SavedLabelsGrid
                id="library-saved-copy-labels"
                labels={labels}
                title={currentData?.title}
                onValidityChange={validation.onValidityChange}
              />
            </>
          )}
        </DialogScrollContent>
        <DialogActions>
          <Button
            size="small"
            variant="outlined"
            color="inherit"
            onClick={onClose}
            startIcon={<Iconify icon={GlobalIcons.cancel} />}
          >
            Close
          </Button>
          <Button
            size="small"
            variant="contained"
            color="inherit"
            onClick={() => window.print()}
            disabled={!canPrint}
            startIcon={<Iconify icon={GlobalIcons.printer} />}
          >
            Print saved labels
          </Button>
        </DialogActions>
      </CustomDialog>
      <SavedLabelsPrintPortal
        enabled={canPrint}
        labels={labels}
        title={currentData?.title}
        onValidityChange={validation.onValidityChange}
      />
    </>
  );
}
