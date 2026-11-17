
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { FormSectionCard } from 'src/components/form-section-card';
import { Alert, Stack, Button, TextField, Typography, LinearProgress } from '@mui/material';

import { DesignerSelect } from '../controls';
import { PhotoSlider } from './photo-adjustments';

import type { PhotoEditorState } from './use-photo-editor';

export function PhotoBackground({ editor, disabled }: { editor: PhotoEditorState; disabled: boolean }) {
  const { settings, update, removal, source } = editor;
  return (
    <FormSectionCard title="Background & Mask" icon={GlobalIcons.image} descriptionTooltip="Remove portrait backgrounds on this device, then refine the mask. Restore brings back original pixels.">
      <Typography variant="body2" color="text.secondary">The first removal downloads a portrait model. Your photo stays on this device. Best suited to people; inspect hair and edges before applying.</Typography>
      <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
        <Button type="button" size="small" color="inherit" variant="outlined" disabled={disabled || !source} onClick={() => source && removal.remove(source)} startIcon={<Iconify icon={GlobalIcons.image} width={18} />}>
          {removal.error ? 'Retry background removal' : 'Remove background'}
        </Button>
        {removal.busy && <Button size="small" color="inherit" onClick={removal.cancel} startIcon={<Iconify icon={GlobalIcons.cancel} width={18} />}>Cancel removal</Button>}
      </Stack>
      {removal.progress && <Typography variant="caption" role="status">{removal.progress}</Typography>}
      {removal.busy && <LinearProgress aria-label="Background model progress" variant={removal.percent === undefined ? 'indeterminate' : 'determinate'} value={removal.percent} />}
      {removal.error && <Alert severity="error">{removal.error}</Alert>}
      <DesignerSelect label="Background" value={settings.background === 'transparent' ? 'transparent' : 'solid'} disabled={disabled} onChange={(value) => update({ background: value === 'transparent' ? value : '#ffffff' })} options={[{ value: 'transparent', label: 'Transparent' }, { value: 'solid', label: 'Solid colour' }]} />
      {settings.background !== 'transparent' && <TextField label="Background colour" type="color" size="small" fullWidth value={settings.background} disabled={disabled} onChange={(event) => update({ background: event.target.value })} />}
      <DesignerSelect label="Preview tool" value={editor.tool} disabled={disabled} onChange={(value) => editor.setTool(value as typeof editor.tool)} options={[{ value: 'move', label: 'Move photo' }, { value: 'erase', label: 'Erase mask' }, { value: 'restore', label: 'Restore mask' }]} />
      {editor.tool !== 'move' && <PhotoSlider label="Brush size" value={editor.brushSize} min={2} max={120} disabled={disabled} onChange={editor.setBrushSize} />}
    </FormSectionCard>
  );
}
