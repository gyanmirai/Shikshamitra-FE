import { Stack, Button } from '@mui/material';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { RouterLink } from 'src/routes/components';
import { libraryPaths } from 'src/constants/library-menus';

import type { useReceivingDraft } from './useReceivingDraft';

export function ReceivingFooter({
  draft,
  onLeave,
}: {
  draft: ReturnType<typeof useReceivingDraft>;
  onLeave: () => void;
}) {
  return (
    <Stack
      direction="row"
      spacing={1}
      justifyContent="flex-end"
      sx={{ p: 1, borderTop: 1, borderColor: 'divider', flexWrap: 'wrap', rowGap: 1 }}
    >
      <Button
        size="small"
        variant="outlined"
        color="inherit"
        disabled={draft.busy}
        onClick={onLeave}
        startIcon={<Iconify icon={GlobalIcons.cancel} />}
      >
        {draft.saved ? 'Back to books' : 'Cancel'}
      </Button>
      {draft.saved ? (
        <>
          <Button
            component={RouterLink}
            href={`${libraryPaths.receiving}/${draft.saved.id}`}
            size="small"
            variant={draft.access.canReceive ? 'outlined' : 'contained'}
            color="inherit"
            startIcon={<Iconify icon={GlobalIcons.eye} />}
          >
            Open saved receipt
          </Button>
          {draft.access.canReceive && (
            <Button
              size="small"
              variant="contained"
              color="inherit"
              disabled={draft.busy}
              onClick={draft.startAnother}
              startIcon={<Iconify icon={GlobalIcons.addIcon} />}
            >
              Receive more copies
            </Button>
          )}
        </>
      ) : (
        draft.access.canReceive && (
          <>
            <Button
              size="small"
              variant="outlined"
              color="inherit"
              loading={draft.busy}
              disabled={draft.busy || draft.uncertain}
              onClick={() => draft.preview()}
              startIcon={<Iconify icon={GlobalIcons.eye} />}
            >
              Preview
            </Button>
            <Button
              size="small"
              variant="contained"
              color="inherit"
              loading={draft.busy}
              disabled={!draft.canReceive}
              onClick={() => draft.receive()}
              startIcon={<Iconify icon={GlobalIcons.submit} />}
            >
              {draft.uncertain ? 'Retry unchanged receipt' : 'Receive copies'}
            </Button>
          </>
        )
      )}
    </Stack>
  );
}
