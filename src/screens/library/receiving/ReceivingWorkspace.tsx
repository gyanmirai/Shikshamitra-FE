'use client';

import { useRouter } from 'src/routes/hooks';
import { Box, Alert, Stack } from '@mui/material';
import { libraryPaths } from 'src/constants/library-menus';
import { FormBusyRegion } from 'src/components/form-busy-region';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useUnsavedNavigation } from 'src/hooks/use-unsaved-navigation';

import { ReceivingFooter } from './ReceivingFooter';
import { useReceivingDraft } from './useReceivingDraft';
import { ReceivingDraftBody } from './ReceivingDraftBody';
import { ReceivingReceiptView } from './ReceivingReceiptView';

export default function ReceivingWorkspace() {
  const draft = useReceivingDraft();
  const router = useRouter();
  const guard = useUnsavedNavigation(draft.formik.dirty && !draft.saved, {
    blockNavigation: draft.busy,
    description: draft.uncertain
      ? 'The receipt outcome is unconfirmed. Retry the unchanged receipt before starting another receipt. Leaving discards this submission attempt.'
      : undefined,
    push: router.push,
  });
  const leave = () => guard.requestNavigation(() => router.push(libraryPaths.allBooks));
  return (
    <>
      <Box sx={{ height: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        <CustomBreadcrumbs
          heading="Stock Receiving"
          description="Record newly received copies for existing catalogue titles, with their actual source and known cost."
          isBack
          onBack={leave}
          backDisabled={draft.busy}
          sx={{ px: 1 }}
          links={[
            { name: 'Library', href: libraryPaths.dashboard },
            { name: 'All Books', href: libraryPaths.allBooks, onClick: leave },
            { name: 'Stock Receiving' },
          ]}
        />
        <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', p: 1 }}>
          <Stack spacing={2}>
            {draft.error && <Alert severity="error">{draft.error}</Alert>}
            {draft.uncertain && (
              <Alert severity="warning">
                The save outcome is unconfirmed. Retry the unchanged receipt using the same
                submission attempt.
              </Alert>
            )}
            {draft.conflict && (
              <Alert severity="warning">
                Your draft is retained. Run Preview again to review the latest stock before
                receiving.
              </Alert>
            )}
            {draft.saved ? (
              <ReceivingReceiptView receipt={draft.saved} preview={draft.previewResult} />
            ) : !draft.access.canReceive ? (
              <Alert severity="info">
                Receiving new copies requires Stock Receiving Add permission. Saved receipt links
                remain available with read access.
              </Alert>
            ) : (
              <FormBusyRegion
                busy={draft.busy}
                showOverlay={false}
                label="Checking or receiving stock"
              >
                <ReceivingDraftBody draft={draft} />
              </FormBusyRegion>
            )}
          </Stack>
        </Box>
        <ReceivingFooter draft={draft} onLeave={leave} />
      </Box>
      {guard.confirmation}
    </>
  );
}
