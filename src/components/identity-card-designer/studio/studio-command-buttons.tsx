import Divider from '@mui/material/Divider';

import { ToolButton } from './tool-button';

import type { StudioController } from './use-card-studio';

export function StudioCommandButtons({
  controller: c,
  disabled,
}: {
  controller: StudioController;
  disabled?: boolean;
}) {
  const blocked = disabled || !c.selectedElements.some((element) => !element.locked);
  return (
    <>
      <ToolButton
        label="Undo"
        icon="mdi:undo"
        onClick={c.undo}
        disabled={disabled || !c.canUndo}
      />
      <ToolButton
        label="Redo"
        icon="mdi:redo"
        onClick={c.redo}
        disabled={disabled || !c.canRedo}
      />
      <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
      <ToolButton
        label="Copy"
        icon="mdi:content-copy"
        onClick={c.copySelection}
        disabled={blocked}
      />
      <ToolButton
        label="Paste"
        icon="mdi:content-paste"
        onClick={c.pasteSelection}
        disabled={disabled || !c.canPaste}
      />
      <ToolButton
        label="Duplicate selection"
        icon="mdi:content-copy"
        onClick={c.duplicateSelection}
        disabled={blocked}
      />
      <ToolButton
        label="Delete selection"
        icon="mdi:delete"
        onClick={c.deleteSelection}
        disabled={blocked}
      />
    </>
  );
}
