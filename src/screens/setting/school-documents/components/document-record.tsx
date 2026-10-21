import { Alert, Button, Skeleton, DialogActions } from '@mui/material';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { useGetSchoolDocumentQuery } from 'src/redux/InstituteSetup/schoolDocumentsApi';

import { DocumentView } from './document-view';
import { DocumentEditor } from './document-editor';
import { schoolDocumentError } from '../document-form';

export function DocumentRecord({
  id,
  mode,
  canDelete,
  onClose,
}: {
  id: string;
  mode: 'view' | 'edit';
  canDelete: boolean;
  onClose: () => void;
}) {
  const query = useGetSchoolDocumentQuery(id);
  if (!query.currentData)
    return (
      <CustomDialog
        open
        hasForm={false}
        guardUnsavedChanges={false}
        title="School Document"
        titleInfo="Load the saved document details and attachments."
        handleClose={onClose}
        maxWidth="sm"
      >
        <DialogScrollContent>
          {query.isError ? (
            <Alert
              severity="error"
              action={
                <Button
                  color="inherit"
                  onClick={() => {
                    query.refetch();
                  }}
                >
                  Retry
                </Button>
              }
            >
              {schoolDocumentError(query.error)}
            </Alert>
          ) : (
            <Skeleton height={240} aria-label="Loading document details" />
          )}
        </DialogScrollContent>
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </CustomDialog>
    );
  return mode === 'edit' ? (
    <DocumentEditor document={query.currentData} canDelete={canDelete} onClose={onClose} />
  ) : (
    <DocumentView document={query.currentData} onClose={onClose} />
  );
}
