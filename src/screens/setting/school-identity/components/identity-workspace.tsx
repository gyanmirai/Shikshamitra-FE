import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import LinearProgress from '@mui/material/LinearProgress';
import { ConfirmDialog } from 'src/components/confirm-dialog';

import { IdentityEditor } from './identity-editor';
import { IdentityContent } from './identity-content';
import { IdentityHistory } from './identity-history';
import { IdentityCopyDialog } from './identity-copy';
import { IdentityScopeTabs } from './identity-scope-tabs';
import { IdentityContextPanel } from './identity-context-panel';
import { getIdentityEditorScope } from '../identity-editor-scope';
import { IdentityWorkspaceActions } from './identity-workspace-actions';
import { useIdentityWorkspaceDialog } from '../hooks/use-identity-workspace-dialog';

import type { SchoolIdentityWorkspace } from '../hooks/use-school-identity';

export function IdentityWorkspace({ workspace }: { workspace: SchoolIdentityWorkspace }) {
  const { query, context, canManage, years, selectedYear, tab, valid, yearsQuery, boardsQuery } =
    workspace;
  const { dialog, open, close, error, saving, resetOverride } =
    useIdentityWorkspaceDialog(workspace);
  const optionsReady =
    !yearsQuery.isLoading && !boardsQuery.isLoading && !yearsQuery.isError && !boardsQuery.isError;
  const ready = valid && (tab === 0 || optionsReady);
  return (
    <>
      <IdentityScopeTabs
        value={tab}
        href={workspace.tabHref}
        actions={
          ready && (
            <Box sx={{ ml: 'auto', flex: { xs: '1 1 100%', sm: '0 0 auto' } }}>
              <IdentityWorkspaceActions
                workspace={workspace}
                onEdit={(profile) => open('edit', profile)}
                onCopy={(profile) => open('copy', profile)}
                onReset={(profile) => open('reset', profile)}
                onHistory={() => open('history')}
              />
            </Box>
          )
        }
      />
      <Box
        role="tabpanel"
        id={`identity-panel-${tab}`}
        aria-labelledby={`identity-scope-${tab}`}
        sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}
      >
        {tab === 1 && <IdentityContextPanel workspace={workspace} />}
        {ready && (
          <>
            {query.currentData && !canManage && (
              <Alert severity="info">
                You can view these assets. Editing requires management access to this entire
                context.
              </Alert>
            )}
            {error && <Alert severity="error">{error}</Alert>}
            {query.isFetching && query.currentData && (
              <LinearProgress aria-label="Refreshing school identity" />
            )}
            {query.isError && (
              <Alert
                severity="error"
                action={<Button onClick={() => query.refetch()}>Retry</Button>}
              >
                School Identity could not be loaded. Check your access to this context and try
                again.
              </Alert>
            )}
            {!query.isError && (
              <IdentityContent
                key={[tab, workspace.boardId, workspace.mediumId, workspace.organizationId].join(
                  ':'
                )}
                profile={query.currentData}
                context={context}
                disabled={query.isFetching}
              />
            )}
          </>
        )}
      </Box>
      {dialog?.kind === 'edit' && dialog.profile && (
        <IdentityEditor
          profile={dialog.profile}
          context={context}
          onClose={close}
          scope={getIdentityEditorScope(workspace)}
        />
      )}
      {dialog?.kind === 'history' && <IdentityHistory context={context} onClose={close} />}
      {dialog?.kind === 'copy' && dialog.profile && (
        <IdentityCopyDialog
          years={years}
          targetYearId={selectedYear}
          target={context}
          stamp={dialog.profile.concurrencyStamp}
          onClose={close}
        />
      )}
      <ConfirmDialog
        open={dialog?.kind === 'reset'}
        onClose={() => {
          if (!saving) close();
        }}
        icon="warning"
        title="Reset School Identity Override?"
        content={
          dialog?.profile?.canAccessSignature
            ? 'Custom logo, banner and principal signature choices will be replaced by inherited settings. Issued documents will retain their original assets.'
            : 'Custom logo and banner choices will be replaced by inherited settings. Principal signature settings and issued documents will remain unchanged.'
        }
        disableCancel={saving}
        disableBackdropClick
        action={
          <Button
            variant="contained"
            color="warning"
            disabled={saving}
            onClick={resetOverride}
            startIcon={<Iconify icon={GlobalIcons.resetIcon} />}
          >
            Reset to inherited
          </Button>
        }
      />
    </>
  );
}
