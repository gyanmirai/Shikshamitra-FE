import type { IColumn } from 'src/components/customizabaleTable/types';

import { Box, Typography } from '@mui/material';
import { SubjectColorIndicator } from 'src/components/subject-color/SubejctColor';

import { getRoleColor } from '../role/role-form-values';

import type { RoleRecord } from '../role/role-form-values';

const roleNames = (value: unknown): string[] =>
  Array.isArray(value) ? [...value].sort((a: string, b: string) => a.localeCompare(b)) : [];

const roleText = (value: unknown) => roleNames(value).join(', ') || 'No role assigned';

export const createUserRoleColumn = (roleRecords: RoleRecord[]): IColumn => {
  const colors = new Map(roleRecords.map((role) => [role.name.toLowerCase(), getRoleColor(role)]));
  return {
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
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, minWidth: 0 }}>
          {roles.map((role) => (
            <Box key={role} sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
              <Box sx={{ display: 'flex', flexShrink: 0 }} aria-hidden="true">
                <SubjectColorIndicator color={colors.get(role.toLowerCase()) || 'text.disabled'} />
              </Box>
              <Typography variant="body2" sx={{ overflowWrap: 'anywhere', minWidth: 0 }}>
                {role}
              </Typography>
            </Box>
          ))}
        </Box>
      ) : (
        'No role assigned'
      );
    },
  };
};
