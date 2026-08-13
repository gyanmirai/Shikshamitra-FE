'use client';

import type { ReactNode } from 'react';

import { usePathname } from 'next/navigation';
import { RouterLink } from 'src/routes/components';
import { alpha, useTheme } from '@mui/material/styles';
import { varAlpha } from 'src/theme/styles';
import { studentPaths } from 'src/constants/student-menu';
import { Iconify } from 'src/components/iconify';
import { isPlainPrimaryNavigationClick } from 'src/components/nav-section/path-utils';
import { Box, Stack, ButtonBase, Typography } from '@mui/material';

import { EnrollmentWorkspaceHeader } from '../admissions-crm/workspace-header';
import { useEnrollmentWorkspace } from '../admissions-crm/enrollment-workspace-context';
import { serializeEnrollmentWorkspaceState } from '../admissions-crm/enrollment-workspace-state';

import type { EnrollmentSettingsPanel } from '../admissions-crm/enrollment-workspace-state';

type SettingsPageProps = {
  title: string;
  description: ReactNode;
  children: ReactNode;
  layout: 'table' | 'document';
  actions?: ReactNode;
};

type SettingsPanelOption = {
  value: EnrollmentSettingsPanel;
  label: string;
  description?: string;
  icon?: string;
  meta?: string;
};

type SettingsPanelTabsProps = {
  label: string;
  value: EnrollmentSettingsPanel;
  options: SettingsPanelOption[];
};

export function EnrollmentSettingsPage({
  title,
  description,
  children,
  layout,
  actions,
}: SettingsPageProps) {
  const isTableLayout = layout === 'table';

  return (
    <Stack
      spacing={isTableLayout ? 1 : 1.5}
      sx={{
        minWidth: 0,
        minHeight: isTableLayout ? 0 : undefined,
        flex: isTableLayout ? 1 : undefined,
        height: isTableLayout ? '100%' : undefined,
        overflow: isTableLayout ? { xs: 'auto', md: 'hidden' } : undefined,
      }}
    >
      <Box component="header" sx={{ flexShrink: 0 }}>
        <EnrollmentWorkspaceHeader
          title={title}
          description={description}
          section={{ name: 'Settings', href: studentPaths.enrollment.settings }}
          actions={actions}
          sx={isTableLayout ? { px: 0 } : undefined}
        />
      </Box>
      <Box
        sx={{
          px: isTableLayout ? 0 : 2,
          display: isTableLayout ? 'flex' : undefined,
          flexDirection: isTableLayout ? 'column' : undefined,
          gap: isTableLayout ? 1 : 1.5,
          minWidth: 0,
          minHeight: isTableLayout ? 0 : undefined,
          flex: isTableLayout ? 1 : undefined,
        }}
      >
        {children}
      </Box>
    </Stack>
  );
}

export function EnrollmentSettingsTaskNav({ label, value, options }: SettingsPanelTabsProps) {
  const theme = useTheme();
  const pathname = usePathname();
  const { state, updateState } = useEnrollmentWorkspace();
  const translucent = (channel: string | undefined, color: string, opacity: number) =>
    channel ? varAlpha(channel, opacity) : alpha(color, opacity);

  const getPanelHref = (panel: EnrollmentSettingsPanel) => {
    const query = serializeEnrollmentWorkspaceState({
      ...state,
      page: 1,
      settingsPanel: panel,
    }).toString();

    return query ? `${pathname}?${query}` : pathname;
  };

  return (
    <Box component="nav" aria-label={label} sx={{ minWidth: 0, flexShrink: 0 }}>
      <Box
        sx={{
          overflowX: 'auto',
          overscrollBehaviorX: 'contain',
          pb: 0.5,
          scrollbarWidth: 'thin',
        }}
      >
        <Box
          sx={{
            display: 'grid',
            gridAutoFlow: { xs: 'column', lg: 'row' },
            gridAutoColumns: { xs: 'minmax(220px, 78vw)', sm: 'minmax(220px, 1fr)' },
            gridTemplateColumns: { lg: `repeat(${options.length}, minmax(0, 1fr))` },
            gap: 1,
            minWidth: { xs: 'max-content', lg: 0 },
          }}
        >
          {options.map((option) => {
            const isActive = option.value === value;
            return (
              <ButtonBase
                key={option.value}
                component={RouterLink}
                href={getPanelHref(option.value)}
                aria-current={isActive ? 'page' : undefined}
                onClick={(event) => {
                  if (!isPlainPrimaryNavigationClick(event)) return;
                  event.preventDefault();
                  updateState({ settingsPanel: option.value, page: 1 }, 'push');
                }}
                sx={{
                  position: 'relative',
                  minHeight: 80,
                  p: 1.5,
                  border: 1,
                  borderColor: translucent(
                    theme.vars?.palette.grey['500Channel'],
                    theme.palette.grey[500],
                    0.2
                  ),
                  borderRadius: 2,
                  alignItems: 'flex-start',
                  justifyContent: 'flex-start',
                  textAlign: 'left',
                  bgcolor: isActive
                    ? translucent(
                        theme.vars?.palette.primary.mainChannel,
                        theme.palette.primary.main,
                        0.08
                      )
                    : 'background.paper',
                  transition: theme.transitions.create([
                    'background-color',
                    'box-shadow',
                    'transform',
                  ]),
                  '&:hover': {
                    bgcolor: isActive
                      ? translucent(
                          theme.vars?.palette.primary.mainChannel,
                          theme.palette.primary.main,
                          0.12
                        )
                      : translucent(
                          theme.vars?.palette.grey['500Channel'],
                          theme.palette.grey[500],
                          0.04
                        ),
                    boxShadow: theme.customShadows?.z4 || theme.shadows[4],
                    transform: 'translateY(-2px)',
                  },
                  '&:focus-visible': {
                    outline: `3px solid ${translucent(
                      theme.vars?.palette.primary.mainChannel,
                      theme.palette.primary.main,
                      0.35
                    )}`,
                    outlineOffset: 2,
                  },
                  '@media (prefers-reduced-motion: reduce)': {
                    transition: 'none',
                    '&:hover': { transform: 'none' },
                  },
                }}
              >
                <Stack direction="row" spacing={1.5} sx={{ minWidth: 0, width: '100%' }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      color: isActive ? 'primary.main' : 'text.secondary',
                      bgcolor: isActive
                        ? translucent(
                            theme.vars?.palette.primary.mainChannel,
                            theme.palette.primary.main,
                            0.12
                          )
                        : translucent(
                            theme.vars?.palette.grey['500Channel'],
                            theme.palette.grey[500],
                            0.08
                          ),
                    }}
                  >
                    <Iconify icon={option.icon || 'mdi:tune-variant'} width={22} />
                  </Box>
                  <Stack spacing={0.25} sx={{ minWidth: 0, flex: 1, mt: 0.25 }}>
                    <Stack direction="row" spacing={0.75} alignItems="baseline">
                      <Typography
                        variant="subtitle2"
                        sx={{
                          color: isActive ? 'primary.main' : 'text.primary',
                          fontWeight: 700,
                        }}
                      >
                        {option.label}
                      </Typography>
                      {option.meta ? (
                        <Typography variant="caption" color="text.secondary">
                          {option.meta}
                        </Typography>
                      ) : null}
                    </Stack>
                    {option.description ? (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          textWrap: 'pretty',
                        }}
                      >
                        {option.description}
                      </Typography>
                    ) : null}
                  </Stack>
                </Stack>
              </ButtonBase>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
}
