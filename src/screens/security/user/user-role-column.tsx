import type { IColumn } from 'src/components/customizabaleTable/types';

import { Box, Chip } from '@mui/material';

const roleNames = (value: unknown): string[] =>
  Array.isArray(value) ? [...value].sort((a: string, b: string) => a.localeCompare(b)) : [];

const roleText = (value: unknown) => roleNames(value).join(', ') || 'No role assigned';

export const userRoleColumn: IColumn = {
  id: 'roleNames',
  label: 'Role',
  align: 'left',
  minWidth: 200,
  isSort: true,
  isFilter: true,
  filterType: 'string',
  filterValue: roleText,
  sortValue: (value) => roleText(value).toLowerCase(),
  exportValue: roleText,
  render: (value) => {
    const roles = roleNames(value);
    return roles.length ? (
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
        {roles.map((role) => (
          <Chip
            key={role}
            size="small"
            label={role}
            sx={{
              maxWidth: 1,
              height: 'auto',
              '& .MuiChip-label': { whiteSpace: 'normal', overflowWrap: 'anywhere', py: 0.5 },
            }}
          />
        ))}
      </Box>
    ) : (
      'No role assigned'
    );
  },
};
