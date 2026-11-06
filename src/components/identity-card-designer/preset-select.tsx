import { DesignerSelect } from './controls';
import { createIdentityCardPreset } from './presets';

import type { IdentityCardDesignerProps } from './types';

export function PresetSelect({
  layout,
  fields,
  disabled,
  onLayoutChange,
}: Pick<IdentityCardDesignerProps, 'layout' | 'fields' | 'disabled' | 'onLayoutChange'>) {
  const presets = [
    ...(fields.some((field) => field.key === 'StudentName')
      ? [{ value: 'classic-identity', label: 'Classic Identity' }]
      : []),
    ...(fields.some((field) => ['name', 'employeeCode'].includes(field.key))
      ? [{ value: 'staff-professional', label: 'Staff Professional' }]
      : []),
  ];
  const currentPreset = layout.presetKey ?? '';
  const options = presets.some((preset) => preset.value === currentPreset)
    ? presets
    : [...presets, { value: currentPreset, label: 'Custom layout' }];
  return (
    <DesignerSelect
      label="Preset"
      value={currentPreset}
      options={options}
      disabled={disabled}
      onChange={(key) => {
        if (!presets.some((preset) => preset.value === key)) return;
        onLayoutChange(
          createIdentityCardPreset(key as 'classic-identity' | 'staff-professional', {
            widthMm: layout.widthMm,
            heightMm: layout.heightMm,
            themeColor: layout.themeColor,
            backgroundColor: layout.backgroundColor,
          })
        );
      }}
    />
  );
}
