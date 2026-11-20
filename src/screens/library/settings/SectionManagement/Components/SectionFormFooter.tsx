import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Button, DialogActions } from '@mui/material';
import { LoadingButton } from 'src/components/loading-button';

import type { useSectionDraft } from './useSectionDraft';

export function SectionFormFooter({ draft }: { draft: ReturnType<typeof useSectionDraft> }) {
  return (
    <DialogActions sx={{ p: 2 }}>
      <Button
        type="button"
        variant="outlined"
        color="inherit"
        size="small"
        disabled={draft.busy}
        onClick={draft.requestClose}
        startIcon={<Iconify icon={GlobalIcons.cancel} width={18} />}
      >
        Cancel
      </Button>
      <LoadingButton
        type="submit"
        variant="contained"
        color="inherit"
        size="small"
        loading={draft.busy}
        disabled={!draft.formik.dirty || !draft.academicYearId}
        startIcon={<Iconify icon={GlobalIcons.submit} width={18} />}
      >
        Submit
      </LoadingButton>
    </DialogActions>
  );
}
