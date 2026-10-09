import { Box, Paper, Typography } from '@mui/material';

import PermissionGrantSwitch from './permission-grant-switch';

import type { groupGrantState } from './effective-permission-grants';

export default function VisibilitySubmoduleItem({
  title,
  state,
  disabled,
  onToggle,
  name,
}: {
  title: string;
  state: ReturnType<typeof groupGrantState>;
  disabled: boolean;
  onToggle: () => void;
  name: string;
}) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        borderRadius: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2,
        flexWrap: 'wrap',
      }}
    >
      <Box>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
      </Box>
      <PermissionGrantSwitch
        names={[name]}
        label={`${title} visibility`}
        hideLabel
        {...state}
        disabled={disabled}
        onChange={onToggle}
      />
    </Paper>
  );
}
