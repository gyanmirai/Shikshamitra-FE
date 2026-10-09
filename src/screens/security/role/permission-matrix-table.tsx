import type { ReactNode } from 'react';

import CustomizableTable from 'src/components/customizabaleTable';

import { permissionMatrixColumns } from './permission-matrix-columns';

import type { MatrixRow } from './permission-matrix-model';
import type { PermissionMatrixProps } from './permission-matrix';

export default function PermissionMatrixTable({
  rows,
  allRows,
  user,
  disabled,
  visibility = false,
  onChange,
  collapsed,
  toggleGroup,
  empty,
}: PermissionMatrixProps & {
  allRows: MatrixRow[];
  collapsed: Set<string>;
  toggleGroup: (id: string) => void;
  empty: ReactNode;
}) {
  const columns = permissionMatrixColumns(
    allRows,
    user,
    disabled,
    collapsed,
    toggleGroup,
    visibility,
    onChange
  );
  return (
    <CustomizableTable
      tableId={`permission-matrix-${user ? 'user' : 'role'}-${visibility ? 'visibility' : 'actions'}`}
      tableTitle="Permissions"
      columns={columns}
      data={rows}
      showToolbar={false}
      isSearch={false}
      isFilter={false}
      isPagination={false}
      isShowedDense={false}
      rowProps={(data) => ({
        'data-testid': `permission-${(data as MatrixRow).title}`,
        sx: {
          bgcolor: (data as MatrixRow).group ? 'background.neutral' : undefined,
          '& > td': { borderColor: 'divider' },
          ...((data as MatrixRow).group ? { '& > td': { py: 0.25, borderColor: 'divider' } } : {}),
        },
      })}
      noDataText={empty}
      wrapperProps={{
        sx: {
          minHeight: 0,
          '& > .MuiCard-root': {
            boxShadow: 'none',
            borderRadius: 1,
            border: 0,
            bgcolor: 'transparent',
          },
          '& .MuiTableCell-head': {
            bgcolor: 'background.neutral',
            color: 'text.primary',
            py: 1.25,
            borderBottomStyle: 'solid',
          },
          '& .MuiTableCell-head:after': { display: 'none' },
          '& .MuiTableCell-body': { borderBottomStyle: 'solid' },
        },
      }}
    />
  );
}
