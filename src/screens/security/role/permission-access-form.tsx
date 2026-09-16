'use client';

import { LoadingButton } from '@mui/lab';
import { useDispatch } from 'react-redux';
import { useMemo, useEffect } from 'react';
import { Iconify } from 'src/components/iconify';
import { shikshaMitraToast } from 'src/components/toast';
import { DialogScrollContent } from 'src/components/customDialog';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import {
  Box,
  Alert,
  Stack,
  Button,
  Typography,
  DialogActions,
  CircularProgress,
} from '@mui/material';

import Permission from './permission';
import Visibility from './visibility';
import { usePermissionDraft } from './use-permission-draft';
import { canManageGrant, catalogueEntries, inheritedSources } from './permission-catalogue';

export default function PermissionAccessForm({
  editData,
  providerName,
  handleClose,
  mode = 'actions',
  onBusyChange,
}: {
  editData: { id?: string; name?: string };
  providerName: string;
  handleClose: () => void;
  mode?: 'actions' | 'visibility';
  onBusyChange?: (busy: boolean) => void;
}) {
  const dispatch = useDispatch();
  const providerKey = (providerName === 'R' ? editData?.name : editData?.id) ?? '';
  const provider = useMemo(() => ({ providerName, providerKey }), [providerName, providerKey]);
  const draft = usePermissionDraft(provider, () => {
    shikshaMitraToast.success({
      message:
        mode === 'actions' ? 'Updated Permissions successfully' : 'Updated Visibility successfully',
    });
    handleClose();
  });
  useEffect(() => {
    onBusyChange?.(draft.busy);
  }, [draft.busy, onBusyChange]);
  useEffect(
    () => () => {
      onBusyChange?.(false);
    },
    [onBusyChange]
  );
  const entries = draft.catalogue ? catalogueEntries(draft.catalogue) : [];
  const inherited = new Map(
    entries.map((entry) => [
      entry.name,
      inheritedSources(entry, provider).map(
        (source) =>
          `${source.providerName === 'R' ? 'role' : source.providerName} ${source.providerKey}`
      ),
    ])
  );
  const cancel = () => {
    if (draft.busy || (draft.dirty && !window.confirm('Discard unsaved permission changes?')))
      return;
    dispatch(setIsChanges(false));
    handleClose();
  };
  return (
    <>
      <DialogScrollContent
        sx={{ display: 'flex', flexDirection: 'column', minHeight: 0, height: '100%', p: 0 }}
        scrollBarProps={{ sx: { overflow: 'hidden', '.simplebar-content': { height: '100%' } } }}
        onSubmit={draft.submit}
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
          <>
            {mode === 'actions' ? (
              <Permission
                catalogue={draft.catalogue}
                provider={provider}
                grants={draft.grants}
                setGrants={draft.setGrants}
                disabled={draft.blocked}
              />
            ) : (
              <>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{ p: 2 }}
                >
                  <Typography color="primary.main" variant="subtitle1">
                    Set Module Visibility
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    disabled
                    startIcon={<Iconify icon="fluent:bot-sparkle-24-filled" />}
                  >
                    MIRU Visibility
                  </Button>
                </Stack>
                <Alert severity="info">
                  Visibility switches change direct navigation grants only, not action permissions.
                  Inherited access remains effective.
                </Alert>
                <Box
                  sx={{ flex: 1, minHeight: 0, pointerEvents: draft.blocked ? 'none' : undefined }}
                >
                  <Visibility
                    visibility={entries.map((entry) => ({
                      name: entry.name,
                      isGranted: !!draft.grants[entry.name],
                    }))}
                    setVisibility={(values) =>
                      draft.setGrantValues(
                        Object.fromEntries(values.map((value) => [value.name, value.isGranted]))
                      )
                    }
                    inherited={inherited}
                    disabled={draft.blocked}
                    manageableNames={
                      new Set(
                        entries
                          .filter((entry) => canManageGrant(entry, provider))
                          .map((entry) => entry.name)
                      )
                    }
                  />
                </Box>
              </>
            )}
          </>
        )}
      </DialogScrollContent>
      <DialogActions sx={{ flexWrap: 'wrap', '& button': { minHeight: 44, minWidth: 44 } }}>
        <Box sx={{ flex: 1, minWidth: 160 }}>
          <Typography variant="body2" aria-live="polite">
            {draft.changes.length} pending permission changes
          </Typography>
          {draft.dirty && (
            <Box component="details">
              <Box component="summary" sx={{ cursor: 'pointer', py: 1 }}>
                Review changes
              </Box>
              <Stack sx={{ maxHeight: 160, overflow: 'auto' }}>
                {draft.changes.map((entry) => (
                  <Typography variant="caption" key={entry.name}>
                    {entry.displayName}:{' '}
                    {draft.grants[entry.name] ? 'Grant directly' : 'Remove direct grant'}
                  </Typography>
                ))}
              </Stack>
            </Box>
          )}
        </Box>
        <Button
          variant="outlined"
          size="small"
          disabled={draft.busy}
          onClick={cancel}
          startIcon={<Iconify icon="basil:cross-solid" />}
        >
          Cancel
        </Button>
        <LoadingButton
          variant="contained"
          size="small"
          loading={draft.busy}
          disabled={draft.blocked || !draft.dirty}
          onClick={draft.submit}
          startIcon={<Iconify icon="material-symbols:save" />}
        >
          Submit
        </LoadingButton>
      </DialogActions>
    </>
  );
}
