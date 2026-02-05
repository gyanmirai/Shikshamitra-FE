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
}

interface PathRow {
  display: string;
  users: PathUser[];
  selectedCount: number;
  totalCount: number;
  nodeIds: string[];
}

const HierarchyTextView: React.FC<Props> = ({ data, isShowDelete = true }) => {
  // Dummy hierarchical sample data (Board -> Department -> Divisions) with students and employees
  const DUMMY_DATA: PathNode[] = React.useMemo(
    () => [
      {
        id: 'board-1',
        name: 'Science Board',
        type: 'board',
        parentId: null,
        children: [
          {
            id: 'dept-phy',
            name: 'Physics Dept',
            type: 'department',
            parentId: 'board-1',
            children: [
              { id: 'div-quantum', name: 'Quantum', type: 'divisions', parentId: 'dept-phy' },
              { id: 'div-astro', name: 'Astrophysics', type: 'divisions', parentId: 'dept-phy' },
            ],
            students: [
              { id: 'stu-1', name: 'Alice Newton', role: 'student', selected: true },
              { id: 'stu-2', name: 'Bob Einstein', role: 'student' },
            ],
            employees: [
              { id: 'emp-1', name: 'Dr. Maxwell', role: 'employee' },
              { id: 'emp-2', name: 'Prof. Feynman', role: 'employee', selected: true },
            ],
          },
          {
            id: 'dept-chem',
            name: 'Chemistry Dept',
            type: 'department',
            parentId: 'board-1',
            children: [
              { id: 'div-organic', name: 'Organic', type: 'divisions', parentId: 'dept-chem' },
              { id: 'div-inorganic', name: 'Inorganic', type: 'divisions', parentId: 'dept-chem' },
            ],
            students: [
              { id: 'stu-3', name: 'Charlie Curie', role: 'student' },
              { id: 'stu-4', name: 'Daisy Dalton', role: 'student', selected: true },
            ],
            employees: [
              { id: 'emp-3', name: 'Dr. Haber', role: 'employee' },
              { id: 'emp-4', name: 'Prof. Avogadro', role: 'employee' },
            ],
          },
        ],
      },
      {
        id: 'board-2',
        name: 'Arts Board',
        type: 'board',
        parentId: null,
        children: [
          {
            id: 'dept-lit',
            name: 'Literature Dept',
            type: 'department',
            parentId: 'board-2',
            children: [
              { id: 'div-poetry', name: 'Poetry', type: 'divisions', parentId: 'dept-lit' },
              { id: 'div-novel', name: 'Novel Writing', type: 'divisions', parentId: 'dept-lit' },
            ],
            students: [
              { id: 'stu-5', name: 'Eve Eliot', role: 'student' },
              { id: 'stu-6', name: 'Frank Frost', role: 'student' },
            ],
            employees: [
              { id: 'emp-5', name: 'Dr. Shakespeare', role: 'employee', selected: true },
              { id: 'emp-6', name: 'Prof. Austen', role: 'employee' },
            ],
          },
        ],
      },
    ],
    []
  );

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
        display: names.join(' → '),
        users,
        selectedCount: users.filter((u) => u.selected).length,
        totalCount: users.length,
        nodeIds: nodes.map((n) => n.id),
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
    const source = Array.isArray(data) && data.length > 0 ? data : DUMMY_DATA;
    source.forEach((root) => traverse(root));
  }, [data, traverse, DUMMY_DATA]);

  const handleRemovePath = (index: number) => {
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const tableColumns = (kind: 'student' | 'employee') => [
    {
      id: 'name',
      label: kind === 'student' ? 'Student Name' : 'Employee Name',
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
        <IconButton size="small" color="error" onClick={() => handleRemoveUser(row.id)}>
          <Icon icon="mdi:close-circle-outline" />
        </IconButton>
      ),
    },
  ];

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const current = viewIndex != null ? paths[viewIndex] : null;
  // Dummy data for students and employees if current is null
  // Use original names from the current path if available, otherwise fallback to dummy data
  const students = [
    { id: 'dummy-stu-1', name: 'Prerna Atre', role: 'student' },
    { id: 'dummy-stu-2', name: 'Raj Baku', role: 'student', selected: true },
    { id: 'dummy-stu-3', name: 'Dummy Student 3', role: 'student' },
    { id: 'dummy-stu-4', name: 'Dummy Student 4', role: 'student' },
    { id: 'dummy-stu-5', name: 'Dummy Student 5', role: 'student', selected: true },
    { id: 'dummy-stu-6', name: 'Dummy Student 6', role: 'student' },
    { id: 'dummy-stu-7', name: 'Dummy Student 7', role: 'student' },
    { id: 'dummy-stu-8', name: 'Dummy Student 8', role: 'student' },
    { id: 'dummy-stu-9', name: 'Dummy Student 9', role: 'student', selected: true },
    { id: 'dummy-stu-10', name: 'Dummy Student 10', role: 'student' },
    { id: 'dummy-stu-11', name: 'Dummy Student 11', role: 'student' },
    { id: 'dummy-stu-12', name: 'Dummy Student 12', role: 'student' },
  ];

  const employees = [
    { id: 'dummy-emp-1', name: 'Dummy Employee 1', role: 'employee' },
    { id: 'dummy-emp-2', name: 'Dummy Employee 2', role: 'employee', selected: true },
    { id: 'dummy-emp-3', name: 'Dummy Employee 3', role: 'employee' },
    { id: 'dummy-emp-4', name: 'Dummy Employee 4', role: 'employee' },
    { id: 'dummy-emp-5', name: 'Dummy Employee 5', role: 'employee', selected: true },
    { id: 'dummy-emp-6', name: 'Dummy Employee 6', role: 'employee' },
    { id: 'dummy-emp-7', name: 'Dummy Employee 7', role: 'employee' },
    { id: 'dummy-emp-8', name: 'Dummy Employee 8', role: 'employee' },
    { id: 'dummy-emp-9', name: 'Dummy Employee 9', role: 'employee', selected: true },
    { id: 'dummy-emp-10', name: 'Dummy Employee 10', role: 'employee' },
    { id: 'dummy-emp-11', name: 'Dummy Employee 11', role: 'employee' },
    { id: 'dummy-emp-12', name: 'Dummy Employee 12', role: 'employee' },
  ];

  return (
    <>
      <Stack spacing={1} sx={{ p: 2 }}>
        {paths.length ? (
          paths.map((p, i) => (
            <Paper
              key={i}
              sx={{
                p: 1.25,
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
                <Typography component="span" color="text.secondary" sx={{ fontSize: 12 }}>
                  {p.selectedCount || 60} / {p.totalCount || 60}
                </Typography>
              </Stack>
              {/* <IconButton size="small" onClick={() => setViewIndex(i)}>
                <Icon icon="mdi:eye-outline" />
              </IconButton> */}
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
