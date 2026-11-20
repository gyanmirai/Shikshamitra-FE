'use client';

import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useRef, useState, useEffect } from 'react';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { Box, Alert, Stack, Button, Typography, DialogActions, LinearProgress } from '@mui/material';

import { PhotoPreview } from './photo-preview';
import { exportPhoto } from './image-processing';
import { usePhotoEditor } from './use-photo-editor';
import { PhotoBackground } from './photo-background';
import { PhotoAdjustments } from './photo-adjustments';

export type PhotoEditorDialogProps = {
  open: boolean;
  source: { imageData: string; name: string };
  onClose: () => void;
  onApply: (imageData: string) => void;
  disabled?: boolean;
};

export function PhotoEditorDialog({ open, source, ...props }: PhotoEditorDialogProps) {
  if (!open) return null;
  return <PhotoEditorSession key={source.imageData} source={source} {...props} />;
}

function PhotoEditorSession({ source, onClose, onApply, disabled = false }: Omit<PhotoEditorDialogProps, 'open'>) {
  const editor = usePhotoEditor(source.imageData);
  const [discard, setDiscard] = useState(false);
  const [applying, setApplying] = useState(false);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);
  const busy = disabled || applying || editor.removal.busy;
  const locked = busy || editor.before || !editor.source;
  const requestClose = () => {
    if (applying) return;
    if (editor.dirty) setDiscard(true);
    else onClose();
  };
  const apply = async () => {
    if (busy || !editor.source || !editor.mask) return;
    setApplying(true); editor.setError('');
    try {
      await new Promise<void>((resolve) => { requestAnimationFrame(() => resolve()); });
      if (!mounted.current) return;
      const result = exportPhoto(editor.source, editor.mask, editor.settings);
      onApply(result);
    } catch (failure) {
      editor.setError(failure instanceof Error ? failure.message : 'The edited photo could not be applied.');
    } finally { if (mounted.current) setApplying(false); }
  };
  return (
    <>
      <CustomDialog open handleClose={requestClose} title="Edit Photo" maxWidth="lg" hasForm={false} guardUnsavedChanges={false} disableClose={applying} paperProps={{ sx: { height: 'min(900px, 92dvh)' } }} titleInfo="Apply saves this edited copy to the current card workflow. The original profile photo remains unchanged.">
        <DialogScrollContent>
          <Stack spacing={2}>
            <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>{source.name}</Typography>
            {editor.error && <Alert severity="error">{editor.error}</Alert>}
            {!editor.source && !editor.error && <LinearProgress aria-label="Loading photo" />}
            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
              <Button size="small" type="button" color="inherit" variant={editor.before ? 'contained' : 'outlined'} disabled={busy || !editor.source} aria-pressed={editor.before} onClick={() => editor.setBefore(!editor.before)} startIcon={<Iconify icon={GlobalIcons.eye} width={18} />}>{editor.before ? 'Show edited' : 'Show original'}</Button>
              <Button size="small" type="button" color="inherit" variant="outlined" disabled={busy || !editor.source} onClick={editor.reset} startIcon={<Iconify icon={GlobalIcons.resetIcon} width={18} />}>Reset photo</Button>
            </Stack>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(0, 1fr) minmax(280px, 360px)' }, gap: 2, alignItems: 'start' }}>
              <PhotoPreview editor={editor} disabled={locked} />
              <Stack spacing={2} sx={{ minWidth: 0 }}>
                <PhotoAdjustments editor={editor} disabled={locked} />
                <PhotoBackground editor={editor} disabled={locked} />
              </Stack>
            </Box>
          </Stack>
        </DialogScrollContent>
        <DialogActions>
          <Button type="button" size="small" color="inherit" variant="outlined" disabled={applying} onClick={requestClose} startIcon={<Iconify icon={GlobalIcons.cancel} width={18} />}>Cancel</Button>
          <Button type="button" size="small" color="inherit" variant="contained" loading={applying} disabled={busy || !editor.source || !editor.mask} onClick={apply} startIcon={<Iconify icon={GlobalIcons.submit} width={18} />}>Apply photo</Button>
        </DialogActions>
      </CustomDialog>
      <ConfirmDialog open={discard} onClose={() => setDiscard(false)} title="Discard Photo Changes?" content="Your edited copy will be discarded." cancelText="Keep editing" action={<Button size="small" color="error" variant="contained" startIcon={<Iconify icon={GlobalIcons.delete} width={18} />} onClick={onClose}>Discard changes</Button>} />
    </>
  );
}
