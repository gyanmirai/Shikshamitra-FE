'use client';

import { useRouter } from 'src/routes/hooks';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Box, Stack, Alert, Button } from '@mui/material';
import { libraryPaths } from 'src/constants/library-menus';
import { FormBusyRegion } from 'src/components/form-busy-region';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useUnsavedNavigation } from 'src/hooks/use-unsaved-navigation';

import { StockImportReview } from './StockImportReview';
import { StockImportFields } from './StockImportFields';
import { useStockImportDraft } from './useStockImportDraft';
import { StockImportBatchView } from './StockImportBatchView';
import { StockImportFileFields } from './StockImportFileFields';

export default function StockImportWorkspace() {
  const draft = useStockImportDraft();
  const router = useRouter();
  const guard = useUnsavedNavigation(
    (draft.formik.dirty || Boolean(draft.fileName)) && !draft.saved,
    {
      blockNavigation: draft.busy,
      guardContextChanges: true,
      description: draft.uncertain
        ? 'The import outcome is unconfirmed. Retry the unchanged batch here or check the import history after leaving.'
        : undefined,
      push: router.push,
    }
  );
  const leave = () => guard.requestNavigation(() => router.push(libraryPaths.receivingImports));
  const disabled = draft.busy || draft.uncertain;
  return (
    <>
      <Box sx={{ height: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        <CustomBreadcrumbs
          heading="Import Stock"
          isBack
          onBack={leave}
          backDisabled={draft.busy}
          sx={{ px: 1 }}
          links={[
            { name: 'Library', href: libraryPaths.dashboard },
            { name: 'Stock Receiving', href: libraryPaths.receiving },
            { name: 'Stock Imports', href: libraryPaths.receivingImports, onClick: leave },
            { name: 'Import Stock' },
          ]}
        />
        <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', p: 1 }}>
          <FormBusyRegion busy={draft.busy} label="Checking or importing stock" showOverlay={false}>
            <Stack spacing={2}>
              {draft.error && <Alert severity="error">{draft.error}</Alert>}
              {draft.uncertain && (
                <Alert severity="warning">
                  Retry the unchanged batch to confirm whether it was recorded.
                </Alert>
              )}
              {draft.saved ? (
                <StockImportBatchView result={draft.saved} />
              ) : (
                draft.access.canReceive && (
                  <>
                    <StockImportFields draft={draft} disabled={disabled} />
                    <StockImportFileFields draft={draft} disabled={disabled} />
                    {draft.reviewed && <StockImportReview review={draft.reviewed} />}
                  </>
                )
              )}
            </Stack>
          </FormBusyRegion>
        </Box>
        <Stack
          direction="row"
          spacing={1}
          justifyContent="flex-end"
          flexWrap="wrap"
          sx={{ p: 1, borderTop: 1, borderColor: 'divider', rowGap: 1 }}
        >
          <Button
            variant="outlined"
            color="inherit"
            size="small"
            disabled={draft.busy}
            onClick={leave}
          >
            {draft.saved ? 'Back to stock imports' : 'Cancel'}
          </Button>
          {!draft.saved && draft.access.canReceive && (
            <>
              <Button
                variant="outlined"
                size="small"
                color="inherit"
                disabled={disabled}
                onClick={draft.preview}
                startIcon={<Iconify icon={GlobalIcons.eye} />}
              >
                Preview rows
              </Button>
              <Button
                variant="contained"
                size="small"
                color="inherit"
                disabled={!draft.canCommit}
                onClick={draft.commit}
                startIcon={<Iconify icon={GlobalIcons.submit} />}
              >
                {draft.uncertain ? 'Retry unchanged batch' : 'Import reviewed rows'}
              </Button>
            </>
          )}
        </Stack>
      </Box>
      {guard.confirmation}
    </>
  );
}
