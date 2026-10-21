import { useState } from 'react';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import DialogActions from '@mui/material/DialogActions';
import { FormSectionCard } from 'src/components/form-section-card';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';

import { IDENTITY_LABELS } from '../types';
import { IdentityFramePreview } from './identity-frame-preview';
import { IdentityFrameControls } from './identity-frame-controls';
import { DEFAULT_PLACEMENT, renderIdentityFrame } from '../identity-image-frame';

import type { IdentityKind } from '../types';

export type PendingIdentityImage = { file: File; image: HTMLImageElement; url: string };

export function IdentityFrameDialog({
  kind,
  pending,
  onClose,
  onApply,
}: {
  kind: IdentityKind;
  pending: PendingIdentityImage;
  onClose: () => void;
  onApply: (file: File) => void;
}) {
  const [placement, setPlacement] = useState(DEFAULT_PLACEMENT);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const cancel = () => {
    if (
      !busy &&
      (placement === DEFAULT_PLACEMENT || window.confirm('Discard image position changes?'))
    )
      onClose();
  };
  const apply = async () => {
    setBusy(true);
    setError('');
    try {
      const file = await renderIdentityFrame(pending.file, pending.image, kind, placement);
      onApply(file);
    } catch (failure) {
      setError(
        failure instanceof Error ? failure.message : 'The image could not be prepared. Try again.'
      );
      setBusy(false);
    }
  };
  return (
    <CustomDialog
      open
      hasForm={false}
      title="Adjust Image in Frame"
      maxWidth="sm"
      titleInfo="Fit the entire image or fill the frame, then adjust zoom and position. The framed image will be used in documents."
      handleClose={onClose}
      disableClose={busy}
      hasUnsavedChanges={placement !== DEFAULT_PLACEMENT}
    >
      <DialogScrollContent>
        <FormSectionCard
          title="Image Placement"
          icon="mdi:crop"
          descriptionTooltip="Choose how the image fits and position it inside the document frame."
        >
          <Stack spacing={2}>
            <Typography variant="body2">
              {IDENTITY_LABELS[kind]} · {pending.image.naturalWidth} × {pending.image.naturalHeight}{' '}
              px
            </Typography>
            <IdentityFramePreview kind={kind} pending={pending} placement={placement} />
            <Typography variant="caption" color="text.secondary">
              Fit entire image keeps all edges visible. Fill frame crops any edges outside the
              frame. Empty space stays transparent.
            </Typography>
            <IdentityFrameControls value={placement} disabled={busy} onChange={setPlacement} />
            {error && <Alert severity="error">{error}</Alert>}
          </Stack>
        </FormSectionCard>
      </DialogScrollContent>
      <DialogActions>
        <Button disabled={busy} onClick={cancel}>
          Cancel
        </Button>
        <Button variant="contained" disabled={busy} onClick={apply}>
          {busy ? 'Preparing image…' : 'Use framed image'}
        </Button>
      </DialogActions>
    </CustomDialog>
  );
}
