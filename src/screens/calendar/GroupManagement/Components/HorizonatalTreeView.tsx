// Clean implementation of HierarchyTextView with path stats, view & remove actions, and popup tables
import { Icon } from '@iconify/react';
import React, { useState, useEffect, useCallback } from 'react';
import CustomizableTable from 'src/components/customizabaleTable';
import { Paper, Stack, Divider, Typography, IconButton } from '@mui/material';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';

export interface PathUser {
  id: string;
  name: string;
  role: 'student' | 'employee';
  selected?: boolean;
}

export interface PathNode {
  id: string;
  name: string;
  type: string;
  parentId: string | null;
  children?: PathNode[];
  students?: PathUser[];
  employees?: PathUser[];
}

interface Props {
  data: PathNode[];
  isShowDelete?: boolean;
  onRemove?: (nodes: PathNode[]) => void;
}

interface PathRow {
  display: string;
  users: PathUser[];
  selectedCount: number;
  totalCount: number;
  nodeIds: string[];
  nodes: PathNode[];
}

const HierarchyTextView: React.FC<Props> = ({ data, isShowDelete = true, onRemove }) => {
  const [paths, setPaths] = useState<PathRow[]>([]);
  const [viewIndex, setViewIndex] = useState<number | null>(null);

  const collectUsers = useCallback((nodes: PathNode[]): PathUser[] => {
    const list: PathUser[] = [];
    nodes.forEach((n) => {
      if (Array.isArray(n.students)) list.push(...n.students);
      if (Array.isArray(n.employees)) list.push(...n.employees);
    });
    return list;
  }, []);

  const buildRow = useCallback(
    (names: string[], nodes: PathNode[]): PathRow => {
      const users = collectUsers(nodes);
      return {
        display: names.join(' -> '),
        users,
        selectedCount: users.filter((u) => u.selected).length,
        totalCount: users.length,
        nodeIds: nodes.map((n) => n.id),
        nodes,
      };
    },
    [collectUsers]
  );

  const traverse = useCallback(
    (node: PathNode, chain: PathNode[] = [], names: string[] = []) => {
      const newChain = [...chain, node];
      const newNames = [...names, node.name];
      if (!node.children || node.children.length === 0) {
        setPaths((prev) => [...prev, buildRow(newNames, newChain)]);
        return;
      }
      const hasDivisions = node.children.some((c) => c.type === 'divisions');
      if (hasDivisions) {
        const childNodes = node.children ?? [];
        const divisionNames = childNodes.map((c) => c.name).join(',');
        setPaths((prev) => [
          ...prev,
          buildRow([...newNames, divisionNames], [...newChain, ...childNodes]),
        ]);
      } else {
        node.children.forEach((child) => traverse(child, newChain, newNames));
      }
    },
    [buildRow]
  );

  useEffect(() => {
    setPaths([]);
    const source = Array.isArray(data) && data.length > 0 ? data : [];
    source.forEach((root) => traverse(root));
  }, [data, traverse]);

  const handleRemovePath = (index: number) => {
    const pathToRemove = paths[index];
    if (onRemove && pathToRemove) {
      onRemove(pathToRemove.nodes);
    }
    setPaths((prev) => prev.filter((_, i) => i !== index));
    if (viewIndex === index) setViewIndex(null);
  };

  const handleRemoveUser = (userId: string) => {
    if (viewIndex == null) return;
    setPaths((prev) =>
      prev.map((p, i) => {
        if (i !== viewIndex) return p;
        const users = p.users.filter((u) => u.id !== userId);
        return {
          ...p,
          users,
          selectedCount: users.filter((u) => u.selected).length,
          totalCount: users.length,
        };
      })
    );
  };

  const current = viewIndex != null ? paths[viewIndex] : null;
  const students = current?.users.filter((user) => user.role === 'student') ?? [];
  const employees = current?.users.filter((user) => user.role === 'employee') ?? [];

  return (
    <>
      <Stack spacing={1} sx={{ p: 1 }}>
        {paths.length ? (
          paths.map((p, i) => (
            <Paper
              key={i}
              sx={{
                p: 1,
                borderRadius: 2,
                bgcolor: (t) => t.vars.palette.background.neutral,
                fontFamily: 'monospace',
                fontSize: 14,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center" flexGrow={1}>
                <Typography component="span" sx={{ flexGrow: 1 }} fontFamily="Monospace">
                  {p.display}
                </Typography>
                {p.totalCount > 0 && (
                  <Typography component="span" color="text.secondary" sx={{ fontSize: 12 }}>
                    {p.selectedCount} / {p.totalCount}
                  </Typography>
                )}
              </Stack>
              {p.totalCount > 0 && (
                <IconButton size="small" onClick={() => setViewIndex(i)}>
                  <Icon icon="mdi:eye-outline" />
                </IconButton>
              )}
              {isShowDelete && (
                <IconButton size="small" color="error" onClick={() => handleRemovePath(i)}>
                  <Icon icon="mdi:close-circle-outline" />
                </IconButton>
              )}
            </Paper>
          ))
        ) : (
          <Typography variant="body2" color="text.secondary">
            No data available
          </Typography>
        )}
      </Stack>

      <CustomDialog
        open={viewIndex !== null}
        handleClose={() => setViewIndex(null)}
        fullWidth
        maxWidth="md"
        title="Users"
      >
        <DialogScrollContent>
          <Stack spacing={3} sx={{ height: 480 }}>
            <Stack spacing={1} sx={{ flex: 1, minHeight: 0 }}>
              <Typography variant="subtitle2">Students</Typography>
              <CustomizableTable
                tableId="group-path-students"
                data={students}
                columns={[
                  {
                    id: 'name',
                    label: 'Name',
                    minWidth: 160,
                  },
                  // {
                  //   id: 'role',
                  //   label: 'Role',
                  //   minWidth: 100,
                  //   render: (_: any, row: any) => (
                  //     <Typography variant="body2">
                  //       {row.role.charAt(0).toUpperCase() + row.role.slice(1)}
                  //     </Typography>
                  //   ),
                  // },
                  {
                    id: 'action',
                    label: 'Remove',
                    minWidth: 80,
                    isFilter: false,
                    isSort: false,
                    render: (_: any, row: any) => (
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleRemoveUser(row.id)}
                      >
                        <Icon icon="mdi:close-circle-outline" />
                      </IconButton>
                    ),
                  },
                ]}
                showCheckbox={false}
                noDataText={<Typography variant="body2">No students</Typography>}
              />
            </Stack>
            <Divider />
            <Stack spacing={1} sx={{ flex: 1, minHeight: 0 }}>
              <Typography variant="subtitle2">Employees</Typography>
              <CustomizableTable
                tableId="group-path-employees"
                data={employees}
                columns={[
                  {
                    id: 'name',
                    label: 'Name',
                    minWidth: 160,
                  },
                  // {
                  //   id: 'role',
                  //   label: 'Role',
                  //   minWidth: 100,
                  //   render: (_: any, row: any) => (
                  //     <Typography variant="body2">
                  //       {row.role.charAt(0).toUpperCase() + row.role.slice(1)}
                  //     </Typography>
                  //   ),
                  // },
                  {
                    id: 'action',
                    label: 'Remove',
                    minWidth: 80,
                    isFilter: false,
                    isSort: false,
                    render: (_: any, row: any) => (
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleRemoveUser(row.id)}
                      >
                        <Icon icon="mdi:close-circle-outline" />
                      </IconButton>
                    ),
                  },
                ]}
                showCheckbox={false}
                noDataText={<Typography variant="body2">No employees</Typography>}
              />
            </Stack>
          </Stack>
        </DialogScrollContent>
      </CustomDialog>
    </>
  );
};

export default HierarchyTextView;
