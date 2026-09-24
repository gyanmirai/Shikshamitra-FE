'use client';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import { motion } from 'framer-motion';
import Stack from '@mui/material/Stack';
import { Tooltip } from '@mui/material';
import Button from '@mui/material/Button';
import { useMemo, useState } from 'react';
import { varAlpha } from 'src/theme/styles';
import { Iconify } from 'src/components/iconify';
import Typography from '@mui/material/Typography';
import { Scrollbar } from 'src/components/scrollbar';
import { fullSecurityNavData } from 'src/layouts/config-nav-dashboard';

import PermissionNode from './permission-node';
import { getVisibilityPermissionName } from './permission-grants';
import { type PermissionType, getPermissionChildren } from './utils';
import { canManageGrant, catalogueEntries, inheritedSources } from './permission-catalogue';
import {
  getNodeActionPermissionNames,
  getAffectedNodePermissionNames,
  getNodeRevocationPermissionNames,
} from './account-settings-permissions';

import type { GrantProvider, PermissionCatalogue } from './permission-catalogue';

// ----------------------------------------------------------------------

export default function Permission({
  catalogue, provider, grants, setGrants, disabled = false,
}: {
  catalogue: PermissionCatalogue;
  provider: GrantProvider;
  grants: Record<string, boolean>;
  setGrants: (names: string[], value: boolean) => void;
  disabled?: boolean;
}) {
  const entries = catalogueEntries(catalogue);
  const inherited = new Map(entries.map((entry) => [entry.name,
    inheritedSources(entry, provider).map((source) =>
      `${source.providerName === 'R' ? 'role' : source.providerName} ${source.providerKey}`
    ),
  ]));
  const permissionData = entries.filter((entry) => canManageGrant(entry, provider))
    .map((entry) => ({ name: entry.name, isGranted: !!grants[entry.name] }));
  const setPermissionData = (values: { name: string; isGranted: boolean }[]) => {
    if (disabled) return;
    const changes = values.filter((entry) => entry.isGranted !== !!grants[entry.name]);
    [true, false].forEach((value) => {
      const names = changes.filter((entry) => entry.isGranted === value).map((entry) => entry.name);
      if (names.length) setGrants(names, value);
    });
  };

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

  const handlePermissionToggle = (node: any, type: PermissionType, currentValue: boolean) => {
    const newValue = !currentValue;
    const affectedNames = getAffectedNodePermissionNames(node, type, newValue, permissionData);
    setPermissionData(
      permissionData.map((item) =>
        affectedNames.has(item.name) ? { ...item, isGranted: newValue } : item
      )
    );
  };

  const handleNodeSelectAll = (node: any, value: boolean) => {
    if (!expandedSubModule) return;

    const key = value
      ? getNodeActionPermissionNames(node, permissionData)
      : getNodeRevocationPermissionNames(node, permissionData);

    const newPermissions = permissionData.map((item) =>
      key.includes(item.name) ? { ...item, isGranted: value } : item
    );
    setPermissionData(newPermissions);
  };

  const findVisibility = (name: string | undefined) =>
    entries.find((item) => item.name === name)?.isGranted;

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
            const hasVisibility = findVisibility(getVisibilityPermissionName(module));
            return (
              <Tooltip
                title={hasVisibility ? '' : 'Navigation is hidden. Use Set Module Visibility to change it.'}
                key={module.title}
              >
                <span key={module.title}>
                  <Button
                    key={module.title}
                    fullWidth
                    size="large"
                    startIcon={module.icon}
                    onClick={() => handleModuleClick(module)}
                    disabled={disabled}
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
              const hasVisibility = findVisibility(getVisibilityPermissionName(subItem));
              return (
                <Tooltip
                  title={hasVisibility ? '' : 'Navigation is hidden. Use Set Module Visibility to change it.'}
                  key={subItem.title}
                >
                  <span key={subItem.title}>
                    <Button
                      fullWidth
                      size="large"
                      // startIcon={module.icon}
                      disabled={disabled}
                      onClick={() => handleSubModuleChange(subItem.title)}
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

  const selectedPermissionModule = selectedModule.submodule?.find(
    (item: any) => item.title === expandedSubModule
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
      {getPermissionChildren(selectedPermissionModule).length > 0 && (
        <Box
          sx={{
            p: 2.5,
            display: 'flex',
            flexWrap: 'wrap',
            gap: 2,
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
                getPermissionChildren(activeSubModule).length > 0
                  ? getPermissionChildren(activeSubModule)
                  : activeSubModule
                    ? [activeSubModule]
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
                        disabled={disabled}
                        inherited={inherited}
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
      sx={{ height: '100%', minHeight: 0, p: 1 }}
    >
        <>
          <Box sx={{ width: { xs: '100%', md: 280 }, flexShrink: 0, height: '100%', minHeight: { xs: 240, md: 0 } }}>
            {renderModuleList}
          </Box>
          <Box sx={{ width: { xs: '100%', md: 320 }, flexShrink: 0, height: '100%', minHeight: { xs: 240, md: 0 } }}>
            {renderSubModules}
          </Box>
          <Box sx={{ flexGrow: 1, minWidth: 0, height: '100%', minHeight: { xs: 400, md: 0 } }}>{renderPermissionMatrix}</Box>
        </>
    </Stack>
  );
}
