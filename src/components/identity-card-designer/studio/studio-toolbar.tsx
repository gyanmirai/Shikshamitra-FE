import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

import { ToolMenu } from './tool-menu';
import { ToolButton } from './tool-button';
import { orders, alignments } from './menu-options';
import { StudioCommandButtons } from './studio-command-buttons';

import type { StudioController } from './use-card-studio';

export type StudioToolbarProps = {
  controller: StudioController;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  onFit: () => void;
  disabled?: boolean;
};

export function StudioToolbar({
  controller: c,
  zoom,
  onZoomChange,
  onFit,
  disabled,
}: StudioToolbarProps) {
  const editable = c.selectedElements.filter((element) => !element.locked);
  const blocked = disabled || !editable.length;
  const zooms = [...new Set([0.5, 0.75, 1, 1.25, 1.5, 2, zoom])].sort((a, b) => a - b);
  return (
    <Stack
      role="toolbar"
      aria-label="Card editing tools"
      direction="row"
      alignItems="center"
      sx={{
        flexWrap: { xs: 'nowrap', md: 'wrap' },
        overflowX: { xs: 'auto', md: 'visible' },
        overflowY: { xs: 'hidden', md: 'visible' },
        flexShrink: 0,
        minWidth: 0,
        gap: 0.25,
        px: 1,
        py: 0.5,
        borderBottom: 1,
        borderColor: 'divider',
        '& > *': { flexShrink: 0 },
      }}
    >
      <StudioCommandButtons controller={c} disabled={disabled} />
      <ToolMenu
        label="Align selection"
        icon="mdi:format-align-left"
        disabled={blocked}
        items={[
          ...alignments.map(({ label, mode }) => ({
            label,
            onClick: () => c.alignSelection(mode),
          })),
          {
            label: 'Distribute horizontally',
            onClick: () => c.distributeSelection('horizontal'),
            disabled: editable.length < 3,
          },
          {
            label: 'Distribute vertically',
            onClick: () => c.distributeSelection('vertical'),
            disabled: editable.length < 3,
          },
        ]}
      />
      <ToolMenu
        label="Order selection"
        icon="mdi:layers-outline"
        disabled={blocked}
        items={orders.map(({ label, mode }) => ({ label, onClick: () => c.orderSelection(mode) }))}
      />
      <ToolButton
        label="Group selection"
        icon="mdi:group"
        onClick={c.groupSelection}
        disabled={disabled || editable.length < 2}
      />
      <ToolButton
        label="Ungroup selection"
        icon="mdi:ungroup"
        onClick={c.ungroupSelection}
        disabled={disabled || !editable.some((element) => element.groupId)}
      />
      <Stack
        direction="row"
        spacing={0.5}
        alignItems="center"
        sx={{ ml: { xs: 0, md: 'auto' }, order: { xs: -1, md: 0 } }}
      >
        <Select
          size="small"
          value={zoom}
          inputProps={{ 'aria-label': 'Canvas zoom' }}
          onChange={(event) => onZoomChange(Number(event.target.value))}
          sx={{ minWidth: 90 }}
        >
          {zooms.map((value) => (
            <MenuItem key={value} value={value}>
              {Math.round(value * 100)}%
            </MenuItem>
          ))}
        </Select>
        <Button color="inherit" size="small" onClick={onFit}>
          Fit canvas
        </Button>
      </Stack>
    </Stack>
  );
}
