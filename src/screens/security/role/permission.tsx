'use client';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import { motion } from 'framer-motion';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Button from '@mui/material/Button';
import { varAlpha } from 'src/theme/styles';
import { Iconify } from 'src/components/iconify';
import Typography from '@mui/material/Typography';
import { useMemo, useState, useEffect } from 'react';
import { Scrollbar } from 'src/components/scrollbar';
import { Tooltip, CircularProgress } from '@mui/material';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { fullSecurityNavData } from 'src/layouts/config-nav-dashboard';
import { useGetPermissionsQuery } from 'src/redux/permission/permissionApi';

import { extractGrantedPermissions } from '.';
import PermissionNode from './permission-node';
import { getAllChildrenData, type PermissionType } from './utils';

// ----------------------------------------------------------------------

export default function Permission({
  editData,
  setPermissionData,
  permissionData,
  providerName,
  initialData,
}: {
  editData: any;
  setPermissionData: (data: { name: string; isGranted: boolean }[]) => void;
  permissionData: { name: string; isGranted: boolean }[];
  providerName: string;
  initialData: any;
}) {
  const { data: _permissionData, isLoading: isPermissionLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetPermissionsQuery,
    params: { providerName, providerKey: providerName === 'R' ? editData?.name : editData?.id },
    options: {
      skip: !editData,
    },
  });

  useEffect(() => {
    if (_permissionData?.groups?.length > 0) {
      const init = extractGrantedPermissions(_permissionData?.groups);
      setPermissionData(init);
      initialData.current = init;
    }
  }, [_permissionData, initialData, setPermissionData]);

  const navigationData = useMemo(() => fullSecurityNavData(), []);
  const modules = useMemo(() => navigationData.flatMap((group) => group.items), [navigationData]);

  const [selectedModule, setSelectedModule] = useState<any>(modules[0]);
  const [expandedSubModule, setExpandedSubModule] = useState<string | false>(false);

  // State for permissions: { [module_submodule_child]: { view: true, add: false, ... } }
  // const [permissions, setPermissions] = useState<PermissionsMap>({});

  // Gamification Stats
  // const progress = calculateSecurityScore(permissionData);

  const handleModuleClick = (module: any) => {
    setSelectedModule(module);
    setExpandedSubModule(false);
  };

  const handleSubModuleChange = (value: string) => {
    setExpandedSubModule(value === expandedSubModule ? false : value);
  };

  const handlePermissionToggle = (key: string, type: PermissionType) => {
    const targetName = `${key}.${type}`;
    const targetItem = permissionData.find((item) => item.name === targetName);
    const newValue = targetItem ? !targetItem.isGranted : false;

    setPermissionData(
      permissionData.map((item) => {
        if (item.name === targetName) {
          return { ...item, isGranted: newValue };
        }

        if (newValue) {
          if (type === 'Add' && item.name === `${key}.View`) {
            return { ...item, isGranted: true };
          }
          if (type === 'Delete' && (item.name === `${key}.View` || item.name === `${key}.Add`)) {
            return { ...item, isGranted: true };
          }
        }
        if (!newValue && type === 'View') {
          if (item.name === `${key}.Add` || item.name === `${key}.Delete`) {
            return { ...item, isGranted: false };
          }
        }
        return item;
      })
    );
  };

  const handleNodeSelectAll = (node: any, value: boolean) => {
    if (!expandedSubModule) return;

    let key: string[] = [];

    if (node?.children?.length > 0) {
      node.children.forEach((child: any) => {
        key.push(`${child.permissionName}.View`);
        key.push(`${child.permissionName}.Add`);
        key.push(`${child.permissionName}.Delete`);
      });
    } else {
      key = [
        `${node.permissionName}.View`,
        `${node.permissionName}.Add`,
        `${node.permissionName}.Delete`,
      ];
    }

    const newPermissions = permissionData.map((item) =>
      key.includes(item.name) ? { ...item, isGranted: value } : item
    );
    setPermissionData(newPermissions);
  };

  const findVisibility = (name: string) =>
    permissionData?.find((item) => item.name === name)?.isGranted;

  const renderModuleList = (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 2,
        overflow: 'hidden',
      }}
    >
      <Box sx={{ p: 2.5, bgcolor: 'background.neutral' }}>
        <Typography variant="h6">Modules</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Select a module to manage
        </Typography>
      </Box>
      <Scrollbar>
        <Stack spacing={0.5} sx={{ p: 1, pb: 8 }}>
          {modules.map((module) => {
            const isSelected = selectedModule.title === module.title;
            const hasVisibility = findVisibility(module.permissionName);
            return (
              <Tooltip
                title={hasVisibility ? '' : 'Not Module visibility Accessible'}
                key={module.title}
              >
                <span key={module.title}>
                  <Button
                    key={module.title}
                    fullWidth
                    size="large"
                    startIcon={module.icon}
                    onClick={() => hasVisibility && handleModuleClick(module)}
                    disabled={!hasVisibility}
                    sx={{
                      justifyContent: 'flex-start',
                      px: 2.5,
                      py: 1.5,
                      borderRadius: 1.5,
                      color: isSelected ? 'primary.main' : 'text.secondary',
                      bgcolor: isSelected
                        ? (theme) => varAlpha(theme.vars.palette.primary.mainChannel, 0.08)
                        : 'transparent',
                      '&:hover': {
                        bgcolor: (theme) => varAlpha(theme.vars.palette.primary.mainChannel, 0.04),
                        // textDecoration: hasVisibility ? 'none' : 'line-through',
                      },
                      transition: 'all 0.2s',
                      // textDecoration: hasVisibility ? 'none' : 'line-through',
                    }}
                  >
                    <Box sx={{ flexGrow: 1, textAlign: 'left' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: isSelected ? 700 : 500 }}>
                        {module.title}
                      </Typography>
                    </Box>
                    {isSelected && <Iconify icon="eva:arrow-ios-forward-fill" width={16} />}
                  </Button>
                </span>
              </Tooltip>
            );
          })}
        </Stack>
      </Scrollbar>
    </Card>
  );
  const renderSubModules = (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 2 }}>
      <Box sx={{ p: 2.5, borderBottom: '1px dashed', borderColor: 'divider' }}>
        <Typography variant="h6">{selectedModule.title}</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {selectedModule.submodule?.length || 0} Sub-modules available
        </Typography>
      </Box>

      <Scrollbar sx={{ p: 2 }}>
        <Stack spacing={1} sx={{ p: 1, pb: 8 }}>
          {selectedModule.submodule && selectedModule.submodule.length > 0 ? (
            selectedModule.submodule.map((subItem: any) => {
              const isSelected = expandedSubModule === subItem.title;
              const hasVisibility = findVisibility(subItem.permissionName);
              return (
                <Tooltip
                  title={hasVisibility ? '' : 'Not Module visibility Accessible'}
                  key={subItem.title}
                >
                  <span key={subItem.title}>
                    <Button
                      fullWidth
                      size="large"
                      // startIcon={module.icon}
                      disabled={!hasVisibility}
                      onClick={() => hasVisibility && handleSubModuleChange(subItem.title)}
                      sx={{
                        justifyContent: 'flex-start',
                        px: 2.5,
                        py: 1.5,
                        borderRadius: 1.5,
                        color: isSelected ? 'primary.main' : 'text.secondary',
                        bgcolor: isSelected
                          ? (theme) => varAlpha(theme.vars.palette.primary.mainChannel, 0.08)
                          : (theme) => theme.vars.palette.background.neutral,
                        '&:hover': {
                          bgcolor: (theme) =>
                            varAlpha(theme.vars.palette.primary.mainChannel, 0.08),
                          // textDecoration: hasVisibility ? 'none' : 'line-through',
                        },
                        transition: 'all 0.2s',
                      }}
                    >
                      <Box sx={{ flexGrow: 1, textAlign: 'left' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: isSelected ? 700 : 500 }}>
                          {subItem.title}
                        </Typography>
                      </Box>
                      {isSelected && <Iconify icon="eva:arrow-ios-forward-fill" width={16} />}
                    </Button>
                  </span>
                </Tooltip>
              );
            })
          ) : (
            <Box sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
              <Iconify
                icon="solar:folder-with-files-broken"
                width={48}
                sx={{ mb: 1, opacity: 0.5 }}
              />
              <Typography variant="body2">No sub-modules found</Typography>
            </Box>
          )}
        </Stack>
      </Scrollbar>
    </Card>
  );

  const renderPermissionMatrix = (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 2,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {selectedModule.submodule?.find((s: any) => s.title === expandedSubModule)?.children?.length >
        0 && (
        <Box
          sx={{
            p: 2.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px dashed',
            borderColor: 'divider',
            zIndex: 1,
          }}
        >
          <Box>
            <Typography variant="h6">Permissions</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Manage access & security
            </Typography>
          </Box>

          {/* Gamification HUD & Global Actions */}
          <Stack direction="row" spacing={1.5} alignItems="center">
            {expandedSubModule && (
              <Stack direction="row" spacing={2} alignItems="center">
                {['View', 'Add', 'Delete'].map((type) => {
                  const activeSubModule = selectedModule.submodule?.find(
                    (s: any) => s.title === expandedSubModule
                  );
                  const itemsToShow =
                    (activeSubModule as any)?.children?.length > 0
                      ? getAllChildrenData(activeSubModule)
                      : [activeSubModule];

                  // Check if all items have this permission enabled
                  const isGlobalChecked = itemsToShow.every((item: any) => {
                    const key = `${item.permissionName}.${type}`;
                    return !!permissionData?.find((i) => i.name === key)?.isGranted;
                  });

                  return (
                    <Stack key={type} direction="row" spacing={1} alignItems="center">
                      <Typography variant="subtitle2" sx={{ fontSize: '0.75rem' }}>
                        {type}
                      </Typography>
                      <Switch
                        size="small"
                        checked={isGlobalChecked}
                        onChange={(e) => {
                          const isChecked = e.target.checked;
                          const newPermissions: { name: string; isGranted: boolean }[] = [
                            ...permissionData,
                          ];

                          itemsToShow.forEach((item: any) => {
                            const key = `${item.permissionName}.${type}`;
                            const index = newPermissions.findIndex((i) => i.name === key);
                            if (index !== -1) {
                              newPermissions[index] = {
                                ...newPermissions[index],
                                isGranted: isChecked,
                              };

                              if (isChecked) {
                                if (type === 'Add') {
                                  const viewIndex = newPermissions.findIndex(
                                    (i) => i.name === `${item.permissionName}.View`
                                  );
                                  if (viewIndex !== -1) {
                                    newPermissions[viewIndex] = {
                                      ...newPermissions[viewIndex],
                                      isGranted: true,
                                    };
                                  }
                                }
                                if (type === 'Delete') {
                                  const viewIndex = newPermissions.findIndex(
                                    (i) => i.name === `${item.permissionName}.View`
                                  );
                                  if (viewIndex !== -1) {
                                    newPermissions[viewIndex] = {
                                      ...newPermissions[viewIndex],
                                      isGranted: true,
                                    };
                                  }
                                  const addIndex = newPermissions.findIndex(
                                    (i) => i.name === `${item.permissionName}.Add`
                                  );
                                  if (addIndex !== -1) {
                                    newPermissions[addIndex] = {
                                      ...newPermissions[addIndex],
                                      isGranted: true,
                                    };
                                  }
                                }
                              } else if (type === 'View') {
                                const addIndex = newPermissions.findIndex(
                                  (i) => i.name === `${item.permissionName}.Add`
                                );
                                if (addIndex !== -1) {
                                  newPermissions[addIndex] = {
                                    ...newPermissions[addIndex],
                                    isGranted: false,
                                  };
                                }

                                const deleteIndex = newPermissions.findIndex(
                                  (i) => i.name === `${item.permissionName}.Delete`
                                );
                                if (deleteIndex !== -1) {
                                  newPermissions[deleteIndex] = {
                                    ...newPermissions[deleteIndex],
                                    isGranted: false,
                                  };
                                }
                              }
                            }
                          });

                          setPermissionData(newPermissions);
                        }}
                      />
                    </Stack>
                  );
                })}
              </Stack>
            )}
            {/* <Box sx={{ width: 250 }}>
              <SecurityScore score={progress} />
            </Box> */}
          </Stack>
        </Box>
      )}

      <Scrollbar sx={{ p: 2.5, zIndex: 1 }}>
        {expandedSubModule ? (
          <Stack spacing={1} sx={{ pb: 8 }}>
            {/* Find the selected submodule object */}
            {(() => {
              const activeSubModule = selectedModule.submodule?.find(
                (s: any) => s.title === expandedSubModule
              );
              // If submodule has children, show them. If not, show the submodule itself as a row.
              const itemsToShow =
                (activeSubModule as any)?.children?.length > 0
                  ? (activeSubModule as any).children
                  : [];

              return itemsToShow.length > 0 ? (
                itemsToShow?.map((item: any, index: number) => {
                  if (!item) return null;

                  return (
                    <motion.div
                      key={item.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <PermissionNode
                        node={item}
                        moduleTitle={selectedModule.title}
                        submoduleTitle={expandedSubModule}
                        permissions={permissionData}
                        setPermission={setPermissionData}
                        onToggle={handlePermissionToggle}
                        onSelectAll={handleNodeSelectAll}
                      />
                    </motion.div>
                  );
                })
              ) : (
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  No sub-modules found
                </Typography>
              );
            })()}
          </Stack>
        ) : (
          <Box
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'text.secondary',
              minHeight: 300,
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Box sx={{ position: 'relative', display: 'inline-flex', mb: 3 }}>
                <Box
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    bgcolor: 'primary.main',
                    opacity: 0.1,
                    borderRadius: '50%',
                    filter: 'blur(20px)',
                  }}
                />
                <Iconify
                  icon="solar:lock-password-unlocked-bold-duotone"
                  width={80}
                  sx={{ color: 'primary.main' }}
                />
              </Box>
            </motion.div>
            <Typography variant="h6" sx={{ opacity: 0.8, mb: 1 }}>
              Select a Sub-module
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.5, maxWidth: 300, textAlign: 'center' }}>
              Choose a sub-module from the middle panel to configure detailed permissions and
              security settings.
            </Typography>
          </Box>
        )}
      </Scrollbar>
    </Card>
  );

  return (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      spacing={2}
      sx={{ height: 'calc(100vh - 100px)', p: 1 }}
    >
      {isPermissionLoading ? (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
            height: '100%',
            width: '100%',
            minHeight: 200,
          }}
        >
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Box sx={{ width: { xs: '100%', md: 280 }, flexShrink: 0, height: '100%' }}>
            {renderModuleList}
          </Box>
          <Box sx={{ width: { xs: '100%', md: 320 }, flexShrink: 0, height: '100%' }}>
            {renderSubModules}
          </Box>
          <Box sx={{ flexGrow: 1, minWidth: 0, height: '100%' }}>{renderPermissionMatrix}</Box>
        </>
      )}
    </Stack>
  );
}
