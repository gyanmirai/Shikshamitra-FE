import { alpha } from '@mui/material/styles';
import { Box, Card, Stack, Button, Typography, LinearProgress } from '@mui/material';

import PermissionGrantSwitch from './permission-grant-switch';

import type { VisibilityPanel } from './permission-catalogue';
import type { groupGrantState } from './effective-permission-grants';

export default function VisibilityModuleCard({
  item,
  selected,
  state,
  visibleCount,
  disabled,
  onSelect,
  onToggle,
}: {
  item: VisibilityPanel;
  selected: boolean;
  state: ReturnType<typeof groupGrantState>;
  visibleCount: number;
  disabled: boolean;
  onSelect: () => void;
  onToggle: () => void;
}) {
  const total = item.submodule.length;
  const progress =
    item.permissionName && !state.checked ? 0 : total ? (visibleCount / total) * 100 : 100;
  return (
    <Card
      variant="outlined"
      onClick={onSelect}
      sx={{
        p: 2,
        cursor: 'pointer',
        borderColor: selected ? 'primary.main' : 'transparent',
        bgcolor: selected
          ? (theme) => alpha(theme.palette.primary.main, 0.04)
          : 'background.neutral',
      }}
    >
      <Stack direction="row" alignItems="center" spacing={2} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            flexShrink: 0,
            color: selected ? 'primary.main' : 'text.secondary',
            '& svg': { width: 24, height: 24 },
          }}
        >
          {item.icon}
        </Box>
        <Box flexGrow={1} minWidth={0}>
          <Button
            color="inherit"
            onClick={onSelect}
            aria-pressed={selected}
            sx={{ p: 0, minHeight: 44, minWidth: 44, justifyContent: 'flex-start' }}
          >
            {item.title}
          </Button>
          <Stack direction="row" alignItems="center" spacing={1}>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{ flexGrow: 1, borderRadius: 3 }}
            />
            <Typography variant="caption">{Math.round(progress)}%</Typography>
          </Stack>
        </Box>
        <Box onClick={(event) => event.stopPropagation()}>
          <PermissionGrantSwitch
            names={item.permissionName ? [item.permissionName] : []}
            label={`${item.title} visibility`}
            hideLabel
            {...state}
            disabled={disabled}
            onChange={onToggle}
          />
        </Box>
      </Stack>
    </Card>
  );
}
