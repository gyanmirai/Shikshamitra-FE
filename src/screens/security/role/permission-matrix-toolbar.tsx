import type { ReactNode } from 'react';

import { Iconify } from 'src/components/iconify';
import {
  Box,
  Stack,
  Checkbox,
  TextField,
  Typography,
  InputAdornment,
  FormControlLabel,
} from '@mui/material';

export default function PermissionMatrixToolbar({
  search,
  onSearch,
  user,
  disabled,
  onlyOverrides,
  onOverrides,
  overrideCount,
  bulkActions,
}: {
  search: string;
  onSearch: (value: string) => void;
  user: boolean;
  disabled: boolean;
  onlyOverrides: boolean;
  onOverrides: (value: boolean) => void;
  overrideCount: number;
  bulkActions?: ReactNode;
}) {
  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      flexWrap="wrap"
      sx={{ pb: 1.5, gap: 1 }}
    >
      <TextField
        size="small"
        placeholder="Search features…"
        value={search}
        disabled={disabled}
        onChange={(event) => onSearch(event.target.value)}
        inputProps={{ 'aria-label': 'Search permissions' }}
        sx={{
          width: { xs: '100%', sm: 320 },
          maxWidth: '100%',
          '& .MuiInputBase-root': { minHeight: { xs: 44, md: 38 }, borderRadius: 1 },
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Iconify icon="eva:search-fill" width={16} />
            </InputAdornment>
          ),
        }}
      />
      {user && (
        <Stack direction="row" alignItems="center" spacing={0.75}>
          <FormControlLabel
            sx={{ m: 0 }}
            control={
              <Checkbox
                size="small"
                color="primary"
                sx={{ minHeight: 44, minWidth: 44 }}
                checked={onlyOverrides}
                disabled={disabled}
                onChange={(event) => onOverrides(event.target.checked)}
              />
            }
            label={<Typography variant="caption">Overrides only</Typography>}
          />
          <Box
            aria-label={`Overridden actions: ${overrideCount}`}
            sx={{
              px: 0.75,
              py: 0.25,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 0.5,
              typography: 'caption',
            }}
          >
            {overrideCount}
          </Box>
        </Stack>
      )}
      {bulkActions}
    </Stack>
  );
}
