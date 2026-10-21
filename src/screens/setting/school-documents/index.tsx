'use client';

import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { instituteSetupPaths } from 'src/constants/institute-setup';
import { Box, Alert, Button, CircularProgress } from '@mui/material';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { schoolDocumentError } from './document-form';
import { DocumentTable } from './components/document-table';
import { DocumentEditor } from './components/document-editor';
import { DocumentRecord } from './components/document-record';
import { DocumentDelete } from './components/document-delete';
import { useDocumentWorkspace } from './hooks/use-document-workspace';

export default function SchoolDocumentsScreen() {
  const workspace = useDocumentWorkspace();
  const { permissions, query, selection, adding, deleting } = workspace;
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minWidth: 0, gap: 1, flex: 1 }}>
      <CustomBreadcrumbs
        heading="School Documents"
        description="Store school approvals, permissions and related documents."
        links={[
          { name: 'Institute Setup', href: instituteSetupPaths.academicSetup },
          { name: 'School Documents' },
        ]}
        action={
          permissions.canAdd && (
            <Button
              size="small"
              variant="contained"
              startIcon={<Iconify icon={GlobalIcons.addIcon} />}
              onClick={() => workspace.setAdding(true)}
            >
              Add Document
            </Button>
          )
        }
      />
      {!permissions.ready ? (
        <CircularProgress aria-label="Loading access permissions" />
      ) : !permissions.canView ? (
        <Alert severity="warning">You do not have permission to view School Documents.</Alert>
      ) : (
        <>
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
            <DocumentTable workspace={workspace} />
          )}
          {adding && permissions.canAdd && (
            <DocumentEditor
              canDelete={permissions.canDelete}
              onClose={() => workspace.setAdding(false)}
            />
          )}
          {selection && (selection.mode === 'view' || permissions.canAdd) && (
            <DocumentRecord
              key={`${selection.mode}-${selection.id}`}
              {...selection}
              canDelete={permissions.canDelete}
              onClose={() => workspace.setSelection(null)}
            />
          )}
          {deleting && permissions.canDelete && (
            <DocumentDelete
              document={deleting}
              onClose={() => workspace.setDeleting(null)}
              onDeleted={() => {
                workspace.setDeleting(null);
                if (query.currentData?.items.length === 1 && workspace.page > 0) {
                  workspace.changeCriteria({ page: String(workspace.page - 1) });
                }
              }}
            />
          )}
        </>
      )}
    </Box>
  );
}
