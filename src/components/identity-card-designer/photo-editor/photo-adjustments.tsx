
import { useId } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Stack, Slider, Typography } from '@mui/material';
import { FormSectionCard } from 'src/components/form-section-card';

import { DesignerSelect, DesignerSwitch } from '../controls';

import type { PhotoEditorState } from './use-photo-editor';

export function PhotoSlider({ label, value, min, max, step = 1, disabled, onChange }: {
  label: string; value: number; min: number; max: number; step?: number; disabled: boolean; onChange: (value: number) => void;
}) {
  const id = useId();
  return (
    <Stack spacing={0.5}>
      <Typography id={id} variant="body2">{label}: {Math.round(value * 100) / 100}</Typography>
      <Slider size="small" aria-labelledby={id} value={value} min={min} max={max} step={step} disabled={disabled} onChange={(_, next) => onChange(Number(next))} />
    </Stack>
  );
}

export function PhotoAdjustments({ editor, disabled }: { editor: PhotoEditorState; disabled: boolean }) {
  const { settings, update } = editor;
  return (
    <>
      <FormSectionCard title="Crop & Position" icon={GlobalIcons.image} descriptionTooltip="Choose a crop and position the photo inside it. Empty areas remain transparent unless a background is selected.">
        <DesignerSelect label="Crop aspect" value={settings.aspect} disabled={disabled} onChange={(aspect) => update({ aspect })} options={[
          { value: 'original', label: 'Original ratio' }, { value: '0.75', label: 'Portrait 3:4' },
          { value: '0.8', label: 'Portrait 4:5' }, { value: '1', label: 'Square 1:1' }, { value: '1.3333333333', label: 'Landscape 4:3' }, { value: '1.7777777778', label: 'Landscape 16:9' },
        ]} />
        <PhotoSlider label="Zoom" value={settings.zoom} min={0.2} max={4} step={0.01} disabled={disabled} onChange={(zoom) => update({ zoom })} />
        <PhotoSlider label="Horizontal position" value={settings.x} min={-1} max={1} step={0.01} disabled={disabled} onChange={(x) => update({ x })} />
        <PhotoSlider label="Vertical position" value={settings.y} min={-1} max={1} step={0.01} disabled={disabled} onChange={(y) => update({ y })} />
        <PhotoSlider label="Rotation" value={settings.rotation} min={-180} max={180} disabled={disabled} onChange={(rotation) => update({ rotation })} />
        <Stack direction="row" useFlexGap flexWrap="wrap">
          <DesignerSwitch label="Flip horizontally" checked={settings.flipX} disabled={disabled} onChange={(flipX) => update({ flipX })} />
          <DesignerSwitch label="Flip vertically" checked={settings.flipY} disabled={disabled} onChange={(flipY) => update({ flipY })} />
        </Stack>
      </FormSectionCard>
      <FormSectionCard title="Tone" icon={GlobalIcons.academicFieldSettings} descriptionTooltip="Adjust the image without changing the original photo.">
        {(['brightness', 'contrast', 'saturation'] as const).map((key) => (
          <PhotoSlider key={key} label={key[0].toUpperCase() + key.slice(1)} value={settings[key]} min={0} max={200} disabled={disabled} onChange={(value) => update({ [key]: value })} />
        ))}
      </FormSectionCard>
    </>
  );
}
