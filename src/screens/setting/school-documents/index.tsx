'use client';

import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { instituteSetupPaths } from 'src/constants/institute-setup';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Box, Stack, Alert, Button, CircularProgress } from '@mui/material';
import { InstituteFieldFormattingPopover } from 'src/components/institute-field-formatting/institute-field-formatting-popover';

import { DocumentTable } from './components/document-table';
import { DocumentEditor } from './components/document-editor';
import { DocumentRecord } from './components/document-record';
import { DocumentDelete } from './components/document-delete';
import { useDocumentWorkspace } from './hooks/use-document-workspace';

export default function SchoolDocumentsScreen() {
  const workspace = useDocumentWorkspace();
  const { permissions, query, selection, adding, deleting } = workspace;
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: 1,
        minHeight: 0,
        minWidth: 0,
        overflow: 'hidden',
        flex: 1,
      }}
    >
      <CustomBreadcrumbs
        heading="School Documents"
        description="Store school approvals, permissions and related documents."
        links={[
          { name: 'Institute Setup', href: instituteSetupPaths.academicSetup },
          { name: 'School Documents' },
        ]}
        action={
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
            <InstituteFieldFormattingPopover scope="schoolDocuments" />
            {permissions.canAdd && (
              <Button
                size="small"
                variant="contained"
                startIcon={<Iconify icon={GlobalIcons.addIcon} />}
                onClick={() => workspace.setAdding(true)}
              >
                Add document
              </Button>
            )}
          </Stack>
        }
      />
      {!permissions.ready ? (
        <CircularProgress aria-label="Loading access permissions" />
      ) : !permissions.canView ? (
        <Alert severity="warning">You do not have permission to view School Documents.</Alert>
      ) : (
        <>
          <DocumentTable workspace={workspace} />
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
