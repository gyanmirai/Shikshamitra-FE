'use client';

import type { ReactNode } from 'react';

import { usePathname } from 'next/navigation';
import { RouterLink } from 'src/routes/components';
import { alpha, useTheme } from '@mui/material/styles';
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
  description: string;
  children: ReactNode;
  layout: 'table' | 'document';
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
}: SettingsPageProps) {
  const isTableLayout = layout === 'table';

  return (
    <Stack
      spacing={1.5}
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
        />
      </Box>
      <Box
        sx={{
          px: 2,
          display: isTableLayout ? 'flex' : undefined,
          flexDirection: isTableLayout ? 'column' : undefined,
          gap: isTableLayout ? 1.5 : undefined,
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
                  minHeight: 76,
                  p: 1.25,
                  border: 1,
                  borderColor: isActive ? 'primary.main' : 'divider',
                  borderRadius: 1.5,
                  alignItems: 'flex-start',
                  justifyContent: 'flex-start',
                  textAlign: 'left',
                  bgcolor: isActive ? alpha(theme.palette.primary.main, 0.08) : 'background.paper',
                  transition: theme.transitions.create(['border-color', 'background-color']),
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    inset: '0 auto 0 0',
                    width: 3,
                    borderRadius: '6px 0 0 6px',
                    bgcolor: isActive ? 'primary.main' : 'transparent',
                  },
                  '&:hover': {
                    borderColor: 'primary.main',
                    bgcolor: alpha(theme.palette.primary.main, isActive ? 0.1 : 0.04),
                  },
                  '&:focus-visible': {
                    outline: `3px solid ${alpha(theme.palette.primary.main, 0.35)}`,
                    outlineOffset: 2,
                  },
                }}
              >
                <Stack direction="row" spacing={1} sx={{ minWidth: 0, width: '100%' }}>
                  <Box
                    sx={{
                      width: 34,
                      height: 34,
                      borderRadius: 1,
                      display: 'grid',
                      placeItems: 'center',
                      flexShrink: 0,
                      color: isActive ? 'primary.main' : 'text.secondary',
                      bgcolor: isActive ? alpha(theme.palette.primary.main, 0.12) : 'action.hover',
                    }}
                  >
                    <Iconify icon={option.icon || 'mdi:tune-variant'} width={20} />
                  </Box>
                  <Stack spacing={0.125} sx={{ minWidth: 0, flex: 1 }}>
                    <Stack direction="row" spacing={0.75} alignItems="baseline">
                      <Typography variant="subtitle2" sx={{ color: 'text.primary' }}>
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
