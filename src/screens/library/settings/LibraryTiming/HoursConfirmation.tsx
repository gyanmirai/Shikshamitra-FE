import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { LoadingButton } from 'src/components/loading-button';
import { ConfirmDialog } from 'src/components/confirm-dialog';

export function HoursConfirmation({
  kind,
  busy,
  onClose,
  onSave,
  onReset,
}: {
  kind: 'save' | 'reset' | null;
  busy: boolean;
  onClose: () => void;
  onSave: () => void;
  onReset: () => void;
}) {
  return (
    <ConfirmDialog
      open={Boolean(kind)}
      onClose={onClose}
      title={kind === 'save' ? 'Save Library Hours?' : 'Reset Library Hours?'}
      icon={kind === 'save' ? 'info' : 'warning'}
      disableCancel={busy}
      bodyBusy={busy}
      content={
        kind === 'save'
          ? 'Save these Library opening hours for the selected academic year?'
          : 'Discard this draft and restore the saved hours opened in this editor?'
      }
      action={
        <LoadingButton
          type="button"
          variant="contained"
          color="inherit"
          loading={busy}
          startIcon={
            <Iconify icon={kind === 'save' ? GlobalIcons.submit : GlobalIcons.resetIcon} />
          }
          onClick={kind === 'save' ? onSave : onReset}
        >
          {kind === 'save' ? 'Save' : 'Reset'}
        </LoadingButton>
      }
    />
  );
}
