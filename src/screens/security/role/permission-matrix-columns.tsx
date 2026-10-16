import type { IData, IColumn } from 'src/components/customizabaleTable/types';

import { Iconify } from 'src/components/iconify';
import { Stack, Button, Typography } from '@mui/material';

import PermissionMatrixCell from './permission-matrix-cell';
import PermissionBulkActions from './permission-bulk-actions';

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
      width: 240,
      minWidth: 240,
      sticky: !visibility,
      stickyPosition: 'left',
      cellSx: { py: 0.5, borderBottomStyle: 'solid', boxShadow: 'none' },
      render: (_value: unknown, data: IData) => {
        const row = data as MatrixRow;
        return (
          <Stack sx={{ py: 0.25, pl: row.depth * 2.5 }}>
            {row.group ? (
              <Button
                size="small"
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
                  alignSelf: 'flex-start',
                  justifyContent: 'flex-start',
                  minWidth: 0,
                  px: 0,
                  textAlign: 'left',
                  fontSize: 13,
                  fontWeight: 600,
                  '& .MuiButton-startIcon': { ml: 0, mr: 1, width: 16 },
                  '& .MuiButton-startIcon > *': { width: 16, height: 16 },
                }}
              >
                {row.title}
              </Button>
            ) : (
              <Typography variant="subtitle2" sx={{ pl: 3, overflowWrap: 'anywhere' }}>
                {row.title}
              </Typography>
            )}
          </Stack>
        );
      },
    },
    ...actionLabels.map((label): IColumn => ({
      id: label,
      label,
      isSort: false,
      isFilter: false,
      minWidth: user ? 210 : 160,
      headerSx: { zIndex: 12 },
      cellSx: {
        px: 1,
        py: 1,
        minWidth: user ? 210 : 160,
        verticalAlign: 'middle',
        borderBottomStyle: 'solid',
      },
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
    ...(!visibility
      ? [
          {
            id: 'bulkActions',
            label: 'Bulk actions',
            isSort: false,
            isFilter: false,
            excludeFromExport: true,
            sticky: true,
            stickyPosition: 'right',
            width: user ? 250 : 170,
            minWidth: user ? 250 : 170,
            headerSx: { borderLeft: '1px solid', borderLeftColor: 'divider' },
            cellSx: {
              py: 1,
              borderLeft: '1px solid',
              borderLeftColor: 'divider',
              borderBottomStyle: 'solid',
              boxShadow: 'none',
            },
            render: (_value: unknown, data: IData) => {
              const row = data as MatrixRow;
              return <PermissionBulkActions scope={row.title} nodes={[row.node]} />;
            },
          } satisfies IColumn,
        ]
      : []),
  ];
}
