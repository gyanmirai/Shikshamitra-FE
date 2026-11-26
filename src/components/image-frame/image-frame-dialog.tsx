import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import { useRef, useState } from 'react';
import Button from '@mui/material/Button';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import Typography from '@mui/material/Typography';
import DialogActions from '@mui/material/DialogActions';
import { FormSectionCard } from 'src/components/form-section-card';
import { useUnsavedNavigation } from 'src/hooks/use-unsaved-navigation';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { renderUnsavedConfirmation } from 'src/components/confirm-dialog/render-unsaved-confirmation';

import { ImageFramePreview } from './image-frame-preview';
import { ImageFrameControls } from './image-frame-controls';
import { renderImageFrame, DEFAULT_PLACEMENT } from './image-frame';

import type { FrameSize, PendingFrameImage } from './image-frame';

export function ImageFrameDialog({
  label,
  frame,
  maxBytes,
  previewMaxWidth,
  circularPreview,
  applyLabel = 'Use framed image',
  titleInfo = 'Fit the entire image or fill the frame, then adjust zoom and position. The framed image will be used in documents.',
  pending,
  onClose,
  onApply,
}: {
  label: string;
  frame: FrameSize;
  maxBytes: number;
  previewMaxWidth?: number;
  circularPreview?: boolean;
  applyLabel?: string;
  titleInfo?: string;
  pending: PendingFrameImage;
  onClose: () => void;
  onApply: (file: File) => void;
}) {
  const [placement, setPlacement] = useState(DEFAULT_PLACEMENT);
  const [busy, setBusy] = useState(false);
  const preparing = useRef(false);
  const [error, setError] = useState('');
  const discardTitle = 'Discard Image Position Changes?';
  const navigation = useUnsavedNavigation(placement !== DEFAULT_PLACEMENT, {
    blockNavigation: busy,
    title: discardTitle,
    renderConfirmation: (keepEditing, discard) =>
      renderUnsavedConfirmation(keepEditing, discard, { title: discardTitle, busy }),
  });
  const cancel = () => navigation.requestNavigation(onClose);
  const apply = async () => {
    if (preparing.current) return;
    preparing.current = true;
    setBusy(true);
    setError('');
    try {
      const file = await renderImageFrame(pending.file, pending.image, frame, placement, maxBytes);
      onApply(file);
    } catch (failure) {
      setError(
        failure instanceof Error ? failure.message : 'The image could not be prepared. Try again.'
      );
      setBusy(false);
      preparing.current = false;
    }
  };
  return (
    <>
      <CustomDialog
        open
        hasForm={false}
        title="Adjust Image in Frame"
        maxWidth="sm"
        titleInfo={titleInfo}
        handleClose={cancel}
        guardUnsavedChanges={false}
        disableClose={busy}
        hasUnsavedChanges={placement !== DEFAULT_PLACEMENT}
      >
        <DialogScrollContent>
          <FormSectionCard
            title="Image Placement"
            icon="mdi:crop"
            descriptionTooltip="Choose how the image fits and position it inside the frame."
          >
            <Stack spacing={2}>
              <Typography variant="body2">
                {label} · {pending.image.naturalWidth} × {pending.image.naturalHeight} px
              </Typography>
              <Stack
                direction={circularPreview ? { xs: 'column', sm: 'row' } : 'column'}
                spacing={2}
              >
                <Stack spacing={2} sx={{ flex: 1, minWidth: 0 }}>
                  <ImageFramePreview
                    label={label}
                    frame={frame}
                    pending={pending}
                    placement={placement}
                    maxWidth={previewMaxWidth}
                    circular={circularPreview}
                  />
                  {!circularPreview && (
                    <Typography variant="caption" color="text.secondary">
                      Fit entire image keeps all edges visible. Fill frame crops any edges outside
                      the frame. Empty space stays transparent.
                    </Typography>
                  )}
                </Stack>
                <Stack sx={{ flex: 1, minWidth: 0 }}>
                  <ImageFrameControls value={placement} disabled={busy} onChange={setPlacement} />
                </Stack>
              </Stack>
              {error && <Alert severity="error">{error}</Alert>}
            </Stack>
          </FormSectionCard>
        </DialogScrollContent>
        <DialogActions>
          <Button
            size="small"
            variant="outlined"
            disabled={busy}
            onClick={cancel}
            startIcon={<Iconify icon={GlobalIcons.cancel} />}
          >
            Cancel
          </Button>
          <Button
            size="small"
            variant="contained"
            disabled={busy}
            onClick={apply}
            startIcon={<Iconify icon={GlobalIcons.submit} />}
          >
            {busy ? 'Preparing image…' : applyLabel}
          </Button>
        </DialogActions>
      </CustomDialog>
      {navigation.confirmation}
    </>
  );
}
