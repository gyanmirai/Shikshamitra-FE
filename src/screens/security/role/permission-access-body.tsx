import { DialogScrollContent } from 'src/components/customDialog';
import { Box, Alert, Button, CircularProgress } from '@mui/material';

import Permission from './permission';
import { UserPermissionProvider } from './user-permission-context';
import PermissionVisibilityPanel from './permission-visibility-panel';

import type { GrantProvider } from './permission-catalogue';
import type { usePermissionDraft } from './use-permission-draft';

export default function PermissionAccessBody({
  draft,
  provider,
  mode,
  onReview,
  subjectName,
}: {
  draft: ReturnType<typeof usePermissionDraft>;
  provider: GrantProvider;
  mode: 'actions' | 'visibility';
  onReview: () => void;
  subjectName?: string;
}) {
  return (
    <DialogScrollContent
      onSubmit={onReview}
      sx={{ display: 'flex', flexDirection: 'column', minHeight: 0, height: '100%', p: 0 }}
      scrollBarProps={{
        sx: {
          flex: 1,
          minHeight: 0,
          overflow: 'hidden',
          '& > .simplebar-wrapper > .simplebar-mask > .simplebar-offset > .simplebar-content-wrapper':
            {
              overflow: 'hidden !important',
              '& > .simplebar-content': { height: '100%' },
            },
        },
      }}
    >
      {(draft.error || draft.isError) && (
        <Alert
          severity="error"
          action={
            <Button disabled={draft.busy} onClick={draft.reload}>
              Reload
            </Button>
          }
        >
          {draft.error ||
            'Permissions could not be loaded. Existing changes are preserved. Retry to continue.'}
        </Alert>
      )}
      {draft.isLoading && (
        <Box sx={{ display: 'grid', placeItems: 'center', flex: 1, minHeight: 200 }}>
          <CircularProgress aria-label="Loading permissions" />
        </Box>
      )}
      {draft.catalogue && (
        <UserPermissionProvider
          catalogue={draft.catalogue}
          provider={provider}
          states={draft.states}
          setStates={draft.setStates}
        >
          {mode === 'actions' ? (
            <Permission
              catalogue={draft.catalogue}
              provider={provider}
              grants={draft.grants}
              setGrants={draft.setGrants}
              disabled={draft.blocked}
              subjectName={subjectName}
            />
          ) : (
            <PermissionVisibilityPanel
              draft={draft}
              provider={provider}
              subjectName={subjectName}
            />
          )}
        </UserPermissionProvider>
      )}
    </DialogScrollContent>
  );
}
