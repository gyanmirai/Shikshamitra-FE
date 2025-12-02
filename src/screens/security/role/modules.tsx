// Redesigned module assignment view with table layout and hierarchical permissions
import { useSelector } from 'react-redux';
import { varAlpha } from 'src/theme/styles';
import React, { useMemo, useState } from 'react';
import { Scrollbar } from 'src/components/scrollbar';
import { navData } from 'src/layouts/config-nav-dashboard';
import {
  Box,
  Paper,
  Table,
  Checkbox,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  Typography,
  TableContainer,
} from '@mui/material';

// Helper to generate a permission name from title if missing
const computePermissionName = (node: any, parentPermissionName: string | null) => {
  if (node.permissionName) return node.permissionName;

  // Remove spaces and special chars to make a valid permission segment
  const cleanTitle = node.title.replace(/[^a-zA-Z0-9]/g, '');

  if (!parentPermissionName) return cleanTitle;
  return `${parentPermissionName}.${cleanTitle}`;
};

// Helper to flatten the tree into a list with depth for table rendering
const flattenTree = (
  nodes: any[],
  depth = 0,
  parentPermissionName: string | null = null
): any[] => {
  if (!nodes) return [];
  return nodes.reduce((acc: any[], node: any) => {
    const children = node.submodule || node.children || [];

    // Compute permission name for current node
    const currentPermissionName = computePermissionName(node, parentPermissionName);
    const nodeWithPermission = {
      ...node,
      permissionName: currentPermissionName,
      depth,
      children,
      isParent: children.length > 0,
    };

    // Add current node
    acc.push(nodeWithPermission);

    // Add children
    if (children.length > 0) {
      acc.push(...flattenTree(children, depth + 1, currentPermissionName));
    }
    return acc;
  }, []);
};

// Helper to collect all permission names for a node and its descendants
const collectPermissionNames = (node: any, type: string): string[] => {
  const permissions: string[] = [];
  const base = node.permissionName;

  if (base) {
    if (type === 'View') permissions.push(base);
    else if (type === 'Add') permissions.push(`${base}.Create`);
    else if (type === 'Edit') permissions.push(`${base}.Edit`);
    else if (type === 'Delete') permissions.push(`${base}.Delete`);
  }

  const children = node.submodule || node.children || [];
  children.forEach((child: any) => {
    const childPermissionName = computePermissionName(child, base);
    const childWithPermission = { ...child, permissionName: childPermissionName };
    permissions.push(...collectPermissionNames(childWithPermission, type));
  });

  return permissions;
};

// Custom Checkbox Component
const CustomCheckbox = (props: any) => <Checkbox {...props} />;

const AssignModule = ({ allPermissions, setAllPermissions }: any) => {
  const { user } = useSelector((state: any) => state.auth);
  const data = navData(user?.profile?.email === 'ddvs@gmail.com').flatMap((item) => item.items);

  const [selectSubModule, setSelectSubModule] = useState<any>(data[0] || null); // Default to first module

  // Flatten the submodules of the selected top-level module
  const tableRows = useMemo(() => {
    if (!selectSubModule) return [];
    // The top level module might have a permissionName too, we should use it as base
    const parentPermission = computePermissionName(selectSubModule, null);
    return flattenTree(selectSubModule.submodule || selectSubModule.children, 0, parentPermission);
  }, [selectSubModule]);
  // Check if a specific permission is granted
  const isGranted = (name: string) =>
    !!allPermissions?.find((p: any) => p.name === name)?.isGranted;

  // Update permission (add/remove)
  // If it's a parent, it should update all children for that specific type (View/Add/Edit/Delete)
  const togglePermission = (node: any, type: string, checked: boolean) => {
    const targets = collectPermissionNames(node, type);

    setAllPermissions((prev: any) => {
      let newPermissions = [...prev];

      targets.forEach((targetName) => {
        if (checked) {
          // Add if not exists
          const exists = newPermissions.find((p: any) => p.name === targetName);
          if (!exists) {
            newPermissions.push({ name: targetName, isGranted: true });
          } else {
            // Ensure it's granted (though usually if it exists it is, but just in case)
            newPermissions = newPermissions.map((p) =>
              p.name === targetName ? { ...p, isGranted: true } : p
            );
          }
        } else {
          // Remove
          newPermissions = newPermissions.filter((p: any) => p.name !== targetName);
        }
      });
      return newPermissions;
    });
  };

  // Toggle all permissions of a specific type for the current visible table rows
  const toggleAll = (type: string, checked: boolean) => {
    const allTargets: string[] = [];
    tableRows.forEach((row: any) => {
      allTargets.push(...collectPermissionNames(row, type));
    });
    // Deduplicate
    const uniqueTargets = Array.from(new Set(allTargets));

    setAllPermissions((prev: any) => {
      let newPermissions = [...prev];

      uniqueTargets.forEach((targetName) => {
        if (checked) {
          const exists = newPermissions.find((p: any) => p.name === targetName);
          if (!exists) {
            newPermissions.push({ name: targetName, isGranted: true });
          } else {
            newPermissions = newPermissions.map((p) =>
              p.name === targetName ? { ...p, isGranted: true } : p
            );
          }
        } else {
          newPermissions = newPermissions.filter((p: any) => p.name !== targetName);
        }
      });
      return newPermissions;
    });
  };

  // Check if all visible rows have the permission of a specific type
  const isAllGranted = (type: string) => {
    if (tableRows.length === 0) return false;

    // We only care about rows that actually HAVE a permission name for this type
    // But our logic ensures almost all do.
    // Let's check if every row that *would* have a checkbox is checked.

    // A simpler approximation: check if all rows are granted.
    return tableRows.every((row: any) => {
      const base = row.permissionName;
      let permissionName = null;
      if (base) {
        if (type === 'View') permissionName = base;
        else if (type === 'Add') permissionName = `${base}.Create`;
        else if (type === 'Edit') permissionName = `${base}.Edit`;
        else if (type === 'Delete') permissionName = `${base}.Delete`;
      }
      if (!permissionName) return true; // Skip if no permission applicable
      return isGranted(permissionName);
    });
  };

  const renderCheckbox = (node: any, type: string) => {
    const base = node.permissionName;
    let permissionName = null;

    if (base) {
      if (type === 'View') permissionName = base;
      else if (type === 'Add') permissionName = `${base}.Create`;
      else if (type === 'Edit') permissionName = `${base}.Edit`;
      else if (type === 'Delete') permissionName = `${base}.Delete`;
    }

    if (!permissionName) return <TableCell align="center">-</TableCell>;

    const checked = isGranted(permissionName);

    return (
      <TableCell align="center">
        <CustomCheckbox
          size="small"
          checked={checked}
          onChange={(e: any) => togglePermission(node, type, e.target.checked)}
        />
      </TableCell>
    );
  };

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        flexGrow: '1',
        minHeight: '0',
        display: 'flex',
        flexDirection: 'column',
        p: 1,
      }}
    >
      {/* Top-level module selection */}
      <Box sx={{ display: 'flex', gap: 2, height: '100%' }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            maxWidth: '200px',
            width: '100%',
          }}
        >
          <Scrollbar sx={{ p: 1 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: '100%' }}>
              {data.map((item) => (
                <Paper
                  key={item._action}
                  elevation={4}
                  onClick={() => setSelectSubModule(item)}
                  sx={{
                    p: 1,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',

                    fontSize: 14,
                    gap: 1,
                    backgroundColor: (theme) =>
                      selectSubModule?._action === item._action
                        ? varAlpha(theme.vars.palette.primary.mainChannel, 0.12)
                        : 'background.paper',
                    color: (theme) =>
                      selectSubModule?._action === item._action ? 'primary.main' : 'text.primary',
                    transition: 'all 0.3s ease',
                    '&:hover': { boxShadow: 6 },
                    '& :first-child': { height: 20, width: 20 },
                  }}
                >
                  {item.icon}
                  <Typography variant="caption" fontWeight={600}>
                    {item.title}
                  </Typography>
                </Paper>
              ))}
            </Box>
          </Scrollbar>
        </Box>

        {/* Permission Table */}
        <Paper
          elevation={3}
          sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
        >
          <TableContainer sx={{ flex: 1, minHeight: 0 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#F4F6F8' }}>
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      textTransform: 'uppercase',
                      backgroundColor: '#F4F6F8',
                    }}
                  >
                    Module / Page
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      textTransform: 'uppercase',
                      backgroundColor: '#F4F6F8',
                    }}
                  >
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <Typography
                        variant="caption"
                        sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}
                      >
                        View
                      </Typography>
                      <CustomCheckbox
                        size="small"
                        checked={isAllGranted('View')}
                        onChange={(e: any) => toggleAll('View', e.target.checked)}
                      />
                    </Box>
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      textTransform: 'uppercase',
                      backgroundColor: '#F4F6F8',
                    }}
                  >
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <Typography
                        variant="caption"
                        sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}
                      >
                        Add/Edit
                      </Typography>
                      <CustomCheckbox
                        size="small"
                        checked={isAllGranted('Add')}
                        onChange={(e: any) => toggleAll('Add', e.target.checked)}
                      />
                    </Box>
                  </TableCell>
                  {/* <TableCell align="center" sx={{ fontWeight: 700,  fontSize: '0.75rem', textTransform: 'uppercase', backgroundColor: '#F4F6F8' }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Typography variant="caption" sx={{ fontWeight: 700,  fontSize: '0.75rem', textTransform: 'uppercase' }}>Edit</Typography>
                    <CustomCheckbox
                      size="small"
                      checked={isAllGranted('Edit')}
                      onChange={(e: any) => toggleAll('Edit', e.target.checked)}
                    />
                  </Box>
                </TableCell> */}
                  <TableCell
                    align="center"
                    sx={{
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      textTransform: 'uppercase',
                      backgroundColor: '#F4F6F8',
                    }}
                  >
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <Typography
                        variant="caption"
                        sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}
                      >
                        Delete
                      </Typography>
                      <CustomCheckbox
                        size="small"
                        checked={isAllGranted('Delete')}
                        onChange={(e: any) => toggleAll('Delete', e.target.checked)}
                      />
                    </Box>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tableRows.length > 0 ? (
                  tableRows.map((row: any, index) => {
                    const { isParent } = row;
                    return (
                      <TableRow
                        key={`${row.title}-${row.depth}-${index}`}
                        hover
                        sx={{
                          backgroundColor: (theme) =>
                            isParent
                              ? theme.vars.palette.background.neutral
                              : theme.vars.palette.background.paper,
                          '&:hover': { backgroundColor: isParent ? '#EDF0F2' : 'action.hover' },
                        }}
                      >
                        <TableCell sx={{ fontWeight: isParent ? 700 : 400 }}>
                          <Box sx={{ pl: row.depth * 3, display: 'flex', alignItems: 'center' }}>
                            <Typography variant="body2" sx={{ fontWeight: isParent ? 700 : 400 }}>
                              {row.title}
                            </Typography>
                          </Box>
                        </TableCell>
                        {renderCheckbox(row, 'View')}
                        {renderCheckbox(row, 'Add')}
                        {/* {renderCheckbox(row, 'Edit')} */}
                        {renderCheckbox(row, 'Delete')}
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Typography variant="body2" sx={{ py: 3, color: 'text.secondary' }}>
                        No submodules available for this section.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>
    </Box>
  );
};

export default AssignModule;
