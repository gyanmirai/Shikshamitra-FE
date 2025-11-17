// Redesigned module assignment view with left tree sidebar and right permission table
import { useSelector } from 'react-redux';
import { varAlpha } from 'src/theme/styles';
import React, { useRef, useState } from 'react';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { navData } from 'src/layouts/config-nav-dashboard';
import {
  Box,
  List,
  Grid,
  Paper,
  Stack,
  Divider,
  Checkbox,
  Collapse,
  Typography,
  ListItemButton,
  FormControlLabel,
} from '@mui/material';

const AssignModule = ({ allPermissions, setAllPermissions }: any) => {
  const { user } = useSelector((state: any) => state.auth);
  const data = navData(user?.profile?.email === 'ddvs@gmail.com').flatMap((item) => item.items);
  console.log('🚀 ~ AssignModule ~ data:', data);

  const stackRef = useRef<any>(null);
  const [selectSubModule, setSelectSubModule] = useState<any>(null); // top-level module
  const [selectedNode, setSelectedNode] = useState<any>(null); // currently selected submodule/child

  // Update permission (add/remove)
  const togglePermission = (permissionName: string, checked: boolean) => {
    if (!permissionName) return;
    if (checked) {
      setAllPermissions((prev: any) => {
        const idx = prev.findIndex((p: any) => p.name === permissionName);
        if (idx === -1) return [...prev, { name: permissionName, isGranted: true }];
        const clone = [...prev];
        clone[idx] = { ...clone[idx], isGranted: true };
        return clone;
      });
    } else {
      setAllPermissions((prev: any) => prev.filter((p: any) => p.name !== permissionName));
    }
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
      }}
    >
      {/* Top-level module selection */}
      <Stack
        direction="row"
        spacing={2}
        justifyContent="center"
        flexWrap="wrap"
        ref={stackRef}
        p={1}
      >
        {data.map((item) => (
          <Paper
            key={item._action}
            elevation={8}
            onClick={() => {
              setSelectSubModule(item);
              setSelectedNode(null);
            }}
            sx={{
              p: 1,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
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
      </Stack>
      <Divider sx={{ my: 2 }} />
      {/* Two-column layout */}
      <Grid
        container
        spacing={1}
        sx={{ height: '100%', minHeight: '0', flex: '1', display: 'flex', flexDirection: 'column' }}
      >
        <Grid size={{ xs: 12, md: 3, lg: 2 }} sx={{ height: '100%', minHeight: '0' }}>
          <Paper
            elevation={3}
            sx={{
              flex: 1,
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              px: 1,
              pt: 1,
              height: '100%',
            }}
          >
            <Scrollbar>
              <List
                dense
                disablePadding
                sx={{ display: 'flex', flexDirection: 'column', gap: 1, pb: 0 }}
              >
                {selectSubModule?.submodule?.length ? (
                  selectSubModule.submodule.map((node: any) => (
                    <SidebarTreeItem
                      key={node.id || node.title}
                      node={node}
                      depth={0}
                      selectedNode={selectedNode}
                      onSelect={setSelectedNode}
                    />
                  ))
                ) : (
                  <Typography variant="caption" sx={{ opacity: 0.7, p: 1 }}>
                    {selectSubModule
                      ? 'No submodules'
                      : 'Pick a top-level module to view its tree.'}
                  </Typography>
                )}
              </List>
            </Scrollbar>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 9, lg: 10 }} sx={{ height: '100%', minHeight: '0' }}>
          <Paper elevation={3} sx={{ flex: 2, p: 2, overflow: 'auto', height: '100%' }}>
            <Stack spacing={2}>
              <Typography variant="subtitle2" fontWeight={600}>
                {selectedNode
                  ? `${selectedNode.title} Permissions`
                  : 'Select a submodule item to manage permissions'}
              </Typography>
              {selectedNode && (
                <PermissionTable
                  node={selectedNode}
                  allPermissions={allPermissions}
                  togglePermission={togglePermission}
                />
              )}
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AssignModule;

const SidebarTreeItem = ({ node, depth, selectedNode, onSelect }: any) => {
  const hasChildren =
    (node.submodule && node.submodule.length > 0) || (node?.children && node?.children.length > 0);
  const isSelected = selectedNode?._action === node._action;
  // Determine if current node is an ancestor of selected node
  const isDescendant = (parent: any, target: any): boolean => {
    if (!parent || !target) return false;
    const children = parent?.submodule || parent?.children || [];
    return children.some((c: any) => c?._action === target?._action || isDescendant(c, target));
  };
  const isAncestorSelected = !isSelected && isDescendant(node, selectedNode);
  const [open, setOpen] = useState(false);
  return (
    <Box>
      <ListItemButton
        selected={isSelected}
        onClick={() => (!hasChildren ? onSelect(node) : setOpen(!open))}
        sx={{
          pl: 1,
          // ml: depth,
          ml: `${depth * 8}px`,
          borderRadius: 1,
          bgcolor: (theme) =>
            isSelected
              ? varAlpha(theme.vars.palette.primary.mainChannel, 0.2)
              : isAncestorSelected
                ? varAlpha(theme.vars.palette.primary.mainChannel, 0.08)
                : 'transparent',
          color: (theme) => (isSelected || isAncestorSelected ? 'primary.main' : 'text.primary'),

          transition: 'background-color .25s ease',
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <Typography variant="body2">{node.title}</Typography>
        {hasChildren && (
          <Iconify
            onClick={() => setOpen(!open)}
            icon={open ? 'mdi:chevron-down' : 'mdi:chevron-right'}
            sx={{ fontSize: 18, color: 'inherit' }}
          />
        )}
      </ListItemButton>
      {hasChildren && (
        <Collapse in={open} timeout="auto" unmountOnExit sx={{ mt: 0.5 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            {(node?.submodule || node?.children || []).map(
              (child: any, idx: number, arr: any[]) => (
                <Box
                  key={child.id || child.title}
                  sx={{
                    position: 'relative',

                    // horizontal connector from vertical line to item
                    '& > .MuiListItemButton-root': {
                      position: 'relative',
                      '&:before': {
                        content: '""',
                        position: 'absolute',
                        left: -16,
                        top: '50%',
                        width: 16,
                        borderTop: '1px solid',
                        borderColor: 'divider',
                      },
                    },
                    // remove bottom part of vertical line after last child by overlaying white block
                    ...(idx === arr.length - 1
                      ? {
                          '&:after': {
                            content: '""',
                            position: 'absolute',
                            left: -1,
                            bottom: 0,
                            width: 2,
                            height: '50%',
                            bgcolor: 'background.paper',
                          },
                        }
                      : {}),
                  }}
                >
                  <SidebarTreeItem
                    node={child}
                    depth={depth + 2}
                    selectedNode={selectedNode}
                    onSelect={onSelect}
                  />
                </Box>
              )
            )}
          </Box>
        </Collapse>
      )}
    </Box>
  );
};

// Permission table component
const PermissionTable = ({ node, allPermissions, togglePermission }: any) => {
  const base = node?.permissionName;
  const entries = [
    { label: 'View', name: base },
    { label: 'Add', name: base ? `${base}.Create` : null },
    { label: 'Edit', name: base ? `${base}.Edit` : null },
    { label: 'Delete', name: base ? `${base}.Delete` : null },
  ].filter((e) => e.name);
  return (
    <Paper elevation={1} sx={{ p: 2 }}>
      <Stack direction="row" spacing={2} flexWrap="wrap">
        {entries.map((e) => {
          const granted = !!allPermissions?.find((p: any) => p.name === e.name)?.isGranted;
          return (
            <FormControlLabel
              key={e.name}
              control={<Checkbox size="small" checked={granted} />}
              label={e.label}
              onChange={(evt: any) => togglePermission(e.name, evt.target.checked)}
            />
          );
        })}
      </Stack>
    </Paper>
  );
};
