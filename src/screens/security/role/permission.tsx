'use client';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import { motion } from 'framer-motion';
import Stack from '@mui/material/Stack';
import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import Button from '@mui/material/Button';
import { varAlpha } from 'src/theme/styles';
import Accordion from '@mui/material/Accordion';
import { Iconify } from 'src/components/iconify';
import Typography from '@mui/material/Typography';
import { Scrollbar } from 'src/components/scrollbar';
import { navData } from 'src/layouts/config-nav-dashboard';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';

import SecurityScore from './security-score';
import PermissionNode from './permission-node';
import { updateNodeAndChildren, calculateSecurityScore } from './utils';

import type { PermissionType, PermissionsMap } from './utils';

// ----------------------------------------------------------------------

export default function Permission() {
  const { user } = useSelector((state: any) => state.auth);
  const isDdvs = user?.profile?.email === 'ddvs@gmail.com';

  const navigationData = useMemo(() => navData(isDdvs), [isDdvs]);
  const modules = useMemo(() => navigationData.flatMap((group) => group.items), [navigationData]);

  const [selectedModule, setSelectedModule] = useState(modules[0]);
  const [expandedSubModule, setExpandedSubModule] = useState<string | false>(false);

  // State for permissions: { [module_submodule_child]: { view: true, add: false, ... } }
  const [permissions, setPermissions] = useState<PermissionsMap>({});

  // Gamification Stats
  const progress = calculateSecurityScore(permissions);

  const handleModuleClick = (module: any) => {
    setSelectedModule(module);
    setExpandedSubModule(false);
  };

  const handleSubModuleChange =
    (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpandedSubModule(isExpanded ? panel : false);
    };

  const handlePermissionToggle = (key: string, type: PermissionType) => {
    setPermissions((prev) => {
      const current = prev[key] || { View: false, 'Add/Edit': false, Delete: false };
      const newValue = !current[type];
      const updatedPermissions = { ...current, [type]: newValue };

      if (type === 'Add/Edit' && newValue) {
        updatedPermissions.View = true;
      }

      return {
        ...prev,
        [key]: updatedPermissions,
      };
    });
  };

  const handleNodeSelectAll = (node: any, value: boolean) => {
    if (!expandedSubModule) return;

    const newPermissions = updateNodeAndChildren(
      permissions,
      node,
      selectedModule.title,
      expandedSubModule,
      'All',
      value
    );
    setPermissions(newPermissions);
  };

  const handleGlobalSelectAll = (items: any[], select: boolean) => {
    if (!expandedSubModule) return;

    let newPermissions = { ...permissions };
    items.forEach((item) => {
      newPermissions = updateNodeAndChildren(
        newPermissions,
        item,
        selectedModule.title,
        expandedSubModule,
        'All',
        select
      );
    });
    setPermissions(newPermissions);
  };

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
        <Stack spacing={0.5} sx={{ p: 1 }}>
          {modules.map((module) => {
            const isSelected = selectedModule.title === module.title;
            return (
              <Button
                key={module.title}
                fullWidth
                size="large"
                startIcon={module.icon}
                onClick={() => handleModuleClick(module)}
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
                  },
                  transition: 'all 0.2s',
                }}
              >
                <Box sx={{ flexGrow: 1, textAlign: 'left' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: isSelected ? 700 : 500 }}>
                    {module.title}
                  </Typography>
                </Box>
                {isSelected && <Iconify icon="eva:arrow-ios-forward-fill" width={16} />}
              </Button>
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
        {selectedModule.submodule && selectedModule.submodule.length > 0 ? (
          selectedModule.submodule.map((subItem: any) => (
            <Accordion
              key={subItem.title}
              expanded={expandedSubModule === subItem.title}
              onChange={handleSubModuleChange(subItem.title)}
              sx={{
                mb: 1,
                borderRadius: 1.5,
                '&:before': { display: 'none' },
                bgcolor:
                  expandedSubModule === subItem.title ? 'background.paper' : 'background.neutral',
                boxShadow:
                  expandedSubModule === subItem.title ? (theme) => theme.customShadows.z4 : 'none',
                transition: 'all 0.3s',
              }}
            >
              <AccordionSummary expandIcon={<Iconify icon="eva:arrow-ios-downward-fill" />}>
                <Typography variant="subtitle2" sx={{ width: '100%', flexShrink: 0 }}>
                  {subItem.title}
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 0 }}>
                {/* This is just a placeholder to indicate selection, actual permissions are in the right panel */}
                <Box sx={{ p: 2, pt: 0, color: 'text.secondary', typography: 'body2' }}>
                  Select to view permissions on the right panel.
                </Box>
              </AccordionDetails>
            </Accordion>
          ))
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
            <Stack direction="row" spacing={1}>
              <Button
                size="small"
                variant="soft"
                color="primary"
                onClick={() => {
                  const activeSubModule = selectedModule.submodule?.find(
                    (s: any) => s.title === expandedSubModule
                  );
                  const itemsToShow =
                    (activeSubModule as any)?.children?.length > 0
                      ? (activeSubModule as any).children
                      : [activeSubModule];
                  handleGlobalSelectAll(itemsToShow, true);
                }}
              >
                Select All
              </Button>
              <Button
                size="small"
                variant="soft"
                color="error"
                onClick={() => {
                  const activeSubModule = selectedModule.submodule?.find(
                    (s: any) => s.title === expandedSubModule
                  );
                  const itemsToShow =
                    (activeSubModule as any)?.children?.length > 0
                      ? (activeSubModule as any).children
                      : [activeSubModule];
                  handleGlobalSelectAll(itemsToShow, false);
                }}
              >
                Deselect All
              </Button>
            </Stack>
          )}
          <Box sx={{ width: 250 }}>
            <SecurityScore score={progress} />
          </Box>
        </Stack>
      </Box>

      <Scrollbar sx={{ p: 2.5, zIndex: 1 }}>
        {expandedSubModule ? (
          <Stack spacing={1}>
            {/* Find the selected submodule object */}
            {(() => {
              const activeSubModule = selectedModule.submodule?.find(
                (s: any) => s.title === expandedSubModule
              );
              // If submodule has children, show them. If not, show the submodule itself as a row.
              const itemsToShow =
                (activeSubModule as any)?.children?.length > 0
                  ? (activeSubModule as any).children
                  : [activeSubModule];

              return itemsToShow?.map((item: any, index: number) => {
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
                      permissions={permissions}
                      onToggle={handlePermissionToggle}
                      onSelectAll={handleNodeSelectAll}
                    />
                  </motion.div>
                );
              });
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
      <Box sx={{ width: { xs: '100%', md: 280 }, flexShrink: 0, height: '100%' }}>
        {renderModuleList}
      </Box>
      <Box sx={{ width: { xs: '100%', md: 320 }, flexShrink: 0, height: '100%' }}>
        {renderSubModules}
      </Box>
      <Box sx={{ flexGrow: 1, minWidth: 0, height: '100%' }}>{renderPermissionMatrix}</Box>
    </Stack>
  );
}
