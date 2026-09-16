import { Iconify } from 'src/components/iconify';
import React, { useMemo, useState } from 'react';
import { Scrollbar } from 'src/components/scrollbar';
import { alpha, useTheme } from '@mui/material/styles';
import { EmptyContent } from 'src/components/empty-content';
import { fullSecurityNavData } from 'src/layouts/config-nav-dashboard';
import {
  Box,
  Card,
  Paper,
  Stack,
  Button,
  Switch,
  Tooltip,
  Typography,
  LinearProgress,
} from '@mui/material';

import { setPermissionGrants, getVisibilityPermissionName } from './permission-grants';
import { buildVisibilityPanels, isVisibilityPermission } from './permission-catalogue';

// ----------------------------------------------------------------------

// Recursive component to render submodules
const SubmoduleItem = ({
  submodule,
  moduleTitle,
  submoduleVisibility,
  onToggleSubmodule,
  inherited,
  disabled,
  level = 0,
}: {
  submodule: any;
  moduleTitle: string;
  submoduleVisibility: { name: string; isGranted: boolean }[];
  onToggleSubmodule: (submoduleTitle: string) => void;
  inherited?: string[];
  disabled?: boolean;

  level?: number;
}) => {
  const theme = useTheme();

  const permissionName = getVisibilityPermissionName(submodule);

  const isVisible =
    (permissionName && submoduleVisibility.find((t) => t.name === permissionName)?.isGranted) ||
    false;

  return (
    <Box sx={{ pl: level * 3 }}>
      <Paper
        elevation={0}
        sx={{
          p: 2,
          borderRadius: 2,
          border: `1px solid ${theme.palette.divider}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          transition: 'all 0.2s',
          '&:hover': {
            borderColor: 'primary.main',
            bgcolor: alpha(theme.palette.primary.main, 0.02),
          },
          mb: 1,
        }}
      >
        <Box>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
              color: 'text.primary',
            }}
          >
            {submodule.title}
          </Typography>
          {!!inherited?.length && (
            <Typography variant="caption" color="text.secondary">
              Inherited from {inherited.join(', ')} remains
            </Typography>
          )}
        </Box>
        <Switch
          size="small"
          checked={isVisible}
          onChange={() => permissionName && onToggleSubmodule(permissionName)}
          disabled={disabled || !permissionName}
          slotProps={{ input: { 'aria-label': `${submodule.title} visibility` } }}
          sx={{ minWidth: 44, minHeight: 44 }}
        />
      </Paper>
    </Box>
  );
};

const Visibility = ({
  visibility,
  setVisibility,
  inherited = new Map<string, string[]>(),
  manageableNames,
  disabled = false,
}: {
  visibility: { name: string; isGranted: boolean }[];
  setVisibility: (visibility: { name: string; isGranted: boolean }[]) => void;
  inherited?: Map<string, string[]>;
  manageableNames?: Set<string>;
  disabled?: boolean;
}) => {
  // const [submoduleVisibility, setSubmoduleVisibility] = useState<string[]>([]);
  const [selectedTitle, setSelectedTitle] = useState('');

  const theme = useTheme();

  /**
   * Memoization Justification:
   * - The complete navigation tree includes constructed icon elements and is static for this dialog.
   * - Keeping one reference avoids rebuilding the full tree on every permission toggle.
   */
  const navigation = useMemo(() => fullSecurityNavData().flatMap((item) => item.items), []);
  const data = useMemo(
    () => buildVisibilityPanels(visibility, navigation),
    [visibility, navigation]
  );
  const currentSelected = data.find((item) => item.title === selectedTitle);
  const canManage = (name?: string) =>
    Boolean(
      name &&
      isVisibilityPermission(name) &&
      !disabled &&
      (!manageableNames || manageableNames.has(name))
    );

  // ============================================================
  // HANDLE VISIBILITY TOGGLE
  // ============================================================
  const handleToggleVisibility = (permissionName: string) => {
    if (!canManage(permissionName)) return;
    const isVisible = visibility.find((t) => t.name === permissionName)?.isGranted;
    if (isVisible) {
      setVisibility(
        visibility.map((t) =>
          t.name === permissionName ? { ...t, name: permissionName, isGranted: false } : t
        )
      );
    } else {
      setVisibility(
        visibility.map((t) =>
          t.name === permissionName ? { ...t, name: permissionName, isGranted: true } : t
        )
      );
    }
  };

  const handleToggleSubmodule = (submoduleTitle: string) => {
    if (!canManage(submoduleTitle)) return;
    const isVisible = visibility.find((t) => t.name === submoduleTitle)?.isGranted;
    if (isVisible) {
      setVisibility(
        visibility.map((t) =>
          t.name === submoduleTitle ? { ...t, name: submoduleTitle, isGranted: false } : t
        )
      );
    } else {
      setVisibility(
        visibility.map((t) =>
          t.name === submoduleTitle ? { ...t, name: submoduleTitle, isGranted: true } : t
        )
      );
    }
  };

  const handleToggleAllSubmodules = (allSubmodules: any[]) => {
    const permissionNames = allSubmodules
      .map(getVisibilityPermissionName)
      .filter((permissionName): permissionName is string => canManage(permissionName));
    const isAllVisible = permissionNames.every(
      (permissionName) => !!visibility.find((t) => t.name === permissionName)?.isGranted
    );
    setVisibility(setPermissionGrants(visibility, permissionNames, !isAllVisible));
  };

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        gap: 3,
        minHeight: 0,
        p: 1,
      }}
    >
      {/* ===========================================
             LEFT SIDEBAR (GAMIFIED NAVIGATION)
        ============================================ */}
      <Paper
        elevation={0}
        sx={{
          height: '100%',
          width: { xs: '100%', md: 340 },
          flexShrink: 0,
          minHeight: { xs: 240, md: 0 },
          borderRadius: 3,
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'background.paper',
          border: `1px solid ${theme.palette.divider}`,
          overflow: 'hidden',
        }}
      >
        <Box sx={{ p: 2.5, pb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Modules
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Manage visibility & permissions
          </Typography>
        </Box>

        <Scrollbar sx={{ px: 2, pb: 2 }}>
          <Stack spacing={1.5} sx={{ pb: 8 }}>
            {data.map((item, index) => {
              const isUnlocked = !!visibility.find((t) => t.name === item.permissionName)
                ?.isGranted;
              const isSelected = currentSelected?.title === item.title;
              const submodulePermissionNames = (item.submodule || [])
                .map(getVisibilityPermissionName)
                .filter((permissionName): permissionName is string => Boolean(permissionName));
              const totalSubmodules = submodulePermissionNames.length;
              // Count rendered sub-module rows, not permission records. Some navigation
              // entries intentionally share one permission key (for example Dashboard and
              // Student Academic 360), so filtering the permission array under-counts them.
              const visibleSubmodules = submodulePermissionNames.filter(
                (permissionName) =>
                  visibility.find((permission) => permission.name === permissionName)?.isGranted ===
                  true
              ).length;

              const progress =
                item.permissionName && !isUnlocked
                  ? 0
                  : totalSubmodules > 0
                    ? (visibleSubmodules / totalSubmodules) * 100
                    : 100;
              const isCompleted = progress === 100;

              return (
                <Card
                  key={item.title + index}
                  onClick={() => setSelectedTitle(item.title)}
                  sx={{
                    p: 2,
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'visible',
                    transition: 'all 0.3s ease',
                    border: '1px solid',
                    borderColor: isSelected ? 'primary.main' : 'transparent',
                    boxShadow: isSelected
                      ? `0 4px 20px ${alpha(theme.palette.primary.main, 0.15)}`
                      : 'none',
                    bgcolor: isSelected
                      ? alpha(theme.palette.primary.main, 0.04)
                      : 'background.neutral',
                    '&:hover': {
                      bgcolor: isSelected
                        ? alpha(theme.palette.primary.main, 0.06)
                        : alpha(theme.palette.action.hover, 0.05),
                      transform: 'translateY(-2px)',
                    },
                    ...(isSelected && {
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        left: -1,
                        top: 10,
                        bottom: 10,
                        width: 4,
                        borderRadius: '0 4px 4px 0',
                        bgcolor: 'primary.main',
                      },
                    }),
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '12px',
                        bgcolor: isSelected ? 'primary.main' : 'background.paper',
                        color: isSelected ? 'common.white' : 'text.secondary',
                        boxShadow: isSelected
                          ? `0 4px 12px ${alpha(theme.palette.primary.main, 0.4)}`
                          : '0 2px 8px rgba(0,0,0,0.08)',
                        transition: 'all 0.3s ease',
                      }}
                    >
                      <Box
                        sx={{ width: 24, height: 24, '& svg': { width: '100%', height: '100%' } }}
                      >
                        {item.icon}
                      </Box>
                    </Box>

                    <Box flexGrow={1} minWidth={0}>
                      <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Button
                          color="inherit"
                          onClick={() => setSelectedTitle(item.title)}
                          aria-pressed={isSelected}
                          sx={{
                            p: 0,
                            minHeight: 44,
                            minWidth: 44,
                            justifyContent: 'flex-start',
                            fontWeight: isSelected ? 700 : 600,
                            color: isSelected ? 'primary.dark' : 'text.primary',
                          }}
                        >
                          {item.title}
                        </Button>
                        {isCompleted && (
                          <Tooltip title="Fully Visible">
                            <Iconify
                              icon="solar:medal-star-bold-duotone"
                              sx={{ color: 'warning.main', width: 20, height: 20 }}
                            />
                          </Tooltip>
                        )}
                      </Stack>

                      <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 0.5 }}>
                        <LinearProgress
                          variant="determinate"
                          value={progress}
                          sx={{
                            flexGrow: 1,
                            height: 6,
                            borderRadius: 3,
                            bgcolor: alpha(theme.palette.grey[500], 0.12),
                            '& .MuiLinearProgress-bar': {
                              borderRadius: 3,
                              bgcolor:
                                progress === 100
                                  ? 'success.main'
                                  : isSelected
                                    ? 'primary.main'
                                    : 'primary.main',
                            },
                          }}
                        />
                        <Typography
                          variant="caption"
                          sx={{ fontWeight: 600, color: 'text.secondary' }}
                        >
                          {Math.round(progress)}%
                        </Typography>
                      </Stack>
                    </Box>

                    <Switch
                      checked={isUnlocked}
                      size="small"
                      onClick={(e) => e.stopPropagation()}
                      onChange={() => handleToggleVisibility(item.permissionName)}
                      disabled={!canManage(item.permissionName)}
                      slotProps={{ input: { 'aria-label': `${item.title} visibility` } }}
                      sx={{ minWidth: 44, minHeight: 44 }}
                    />
                  </Stack>
                  {!!inherited.get(item.permissionName)?.length && (
                    <Typography variant="caption" color="text.secondary">
                      Inherited from {inherited.get(item.permissionName)!.join(', ')} remains
                    </Typography>
                  )}
                </Card>
              );
            })}
          </Stack>
        </Scrollbar>
      </Paper>

      {/* ===========================================
             RIGHT PANEL (VISIBILITY SETTINGS)
        ============================================ */}
      <Paper
        elevation={0}
        sx={{
          flexGrow: 1,
          minWidth: 0,
          minHeight: { xs: 280, md: 0 },
          height: '100%',
          borderRadius: 3,
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'background.paper',
          border: `1px solid ${theme.palette.divider}`,
          overflow: 'hidden',
        }}
      >
        {!currentSelected ? (
          <EmptyContent
            title="Select a module"
            description="Choose a module from the sidebar to manage its visibility settings."
            imgUrl="/assets/icons/empty/ic-content.svg"
          />
        ) : (
          <>
            {/* HEADER */}
            <Box
              sx={{
                p: 3,
                borderBottom: `1px dashed ${theme.palette.divider}`,
                bgcolor: alpha(theme.palette.primary.main, 0.02),
              }}
            >
              <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: '16px',
                      bgcolor: 'background.paper',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                      color: 'primary.main',
                    }}
                  >
                    <Box sx={{ width: 28, height: 28, '& svg': { width: '100%', height: '100%' } }}>
                      {currentSelected.icon}
                    </Box>
                  </Box>
                  <Box>
                    <Typography variant="h6">{currentSelected.title}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Manage sub-module access
                    </Typography>
                  </Box>
                </Stack>

                {currentSelected?.submodule?.length && (
                  <Paper
                    elevation={0}
                    sx={{
                      p: 1,
                      px: 2,
                      bgcolor: 'background.paper',
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ fontSize: '0.85rem' }}>
                      Select All
                    </Typography>
                    <Switch
                      disabled={disabled}
                      slotProps={{
                        input: {
                          'aria-label': `Select all ${currentSelected.title} submodule visibility`,
                        },
                      }}
                      sx={{ minWidth: 44, minHeight: 44 }}
                      checked={currentSelected.submodule
                        .map(getVisibilityPermissionName)
                        .filter((permissionName: string | undefined): permissionName is string =>
                          Boolean(permissionName)
                        )
                        .every(
                          (permissionName: string) =>
                            visibility.find((t) => t.name === permissionName)?.isGranted
                        )}
                      onChange={() => handleToggleAllSubmodules(currentSelected.submodule)}
                    />
                  </Paper>
                )}
              </Stack>
            </Box>

            {/* CONTENT */}
            <Scrollbar sx={{ flexGrow: 1, p: 3 }}>
              <Stack spacing={3} sx={{ pb: 8 }}>
                {currentSelected.submodule?.length ? (
                  <Stack spacing={1}>
                    {currentSelected.submodule.map((sub: any, idx: number) => (
                      <SubmoduleItem
                        key={idx}
                        submodule={sub}
                        moduleTitle={currentSelected.permissionName}
                        submoduleVisibility={visibility}
                        onToggleSubmodule={handleToggleSubmodule}
                        inherited={inherited.get(getVisibilityPermissionName(sub) ?? '')}
                        disabled={!canManage(getVisibilityPermissionName(sub))}
                        level={0}
                      />
                    ))}
                  </Stack>
                ) : (
                  <EmptyContent title="No submodules available" />
                )}
              </Stack>
            </Scrollbar>
          </>
        )}
      </Paper>
    </Box>
  );
};

export default Visibility;
