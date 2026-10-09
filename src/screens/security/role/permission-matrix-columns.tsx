import type { IData, IColumn } from 'src/components/customizabaleTable/types';

import { Iconify } from 'src/components/iconify';
import { Button, Typography } from '@mui/material';

import PermissionMatrixCell from './permission-matrix-cell';

import type { MatrixRow } from './permission-matrix-model';
import type { PermissionMatrixProps } from './permission-matrix';

export function permissionMatrixColumns(
  rows: MatrixRow[],
  user: boolean,
  disabled: boolean,
  collapsed: Set<string>,
  toggleGroup: (id: string) => void,
  visibility: boolean,
  onChange: PermissionMatrixProps['onChange']
): IColumn[] {
  const actionLabels = [
    ...new Set(rows.flatMap((row) => row.actions.map((action) => action.label))),
  ];
  return [
    {
      id: 'title',
      label: 'Feature',
      isSort: false,
      isFilter: false,
      minWidth: 220,
      cellSx: { py: 0.5, borderBottomStyle: 'solid' },
      render: (_value: unknown, data: IData) => {
        const row = data as MatrixRow;
        return row.group ? (
          <Button
            color="inherit"
            onClick={() => toggleGroup(row.id)}
            disabled={disabled}
            aria-expanded={!collapsed.has(row.id)}
            aria-label={`${collapsed.has(row.id) ? 'Expand' : 'Collapse'} ${row.title}`}
            startIcon={
              <Iconify
                icon={
                  collapsed.has(row.id)
                    ? 'eva:arrow-ios-forward-fill'
                    : 'eva:arrow-ios-downward-fill'
                }
              />
            }
            sx={{
              minHeight: 32,
              ml: row.depth * 1.5,
              textAlign: 'left',
              fontSize: 11,
              textTransform: 'uppercase',
              fontWeight: 500,
            }}
          >
            {row.title}
          </Button>
        ) : (
          <Typography variant="subtitle2" sx={{ pl: row.depth * 1.5, overflowWrap: 'anywhere' }}>
            {row.title}
          </Typography>
        );
      },
    },
    ...actionLabels.map((label): IColumn => ({
      id: label,
      label,
      isSort: false,
      isFilter: false,
      minWidth: user ? 190 : 140,
      cellSx: { px: 1, py: 1.5, borderBottomStyle: 'solid' },
      render: (_value: unknown, data: IData) => {
        const row = data as MatrixRow;
        const action = row.actions.find((item) => item.label === label);
        if (!action) return null;
        return (
          <PermissionMatrixCell
            feature={row.title}
            action={action}
            user={user}
            disabled={disabled}
            visibility={visibility}
            onChange={(state) => onChange(row, action, state)}
          />
        );
      },
    })),
  ];
}
