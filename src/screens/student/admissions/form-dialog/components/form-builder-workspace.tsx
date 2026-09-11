import type { ReactNode } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Stack from '@mui/material/Stack';
import { useRef, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import useMediaQuery from '@mui/material/useMediaQuery';

const PANELS = [
  { id: 'fields', label: 'Add fields', icon: 'mdi:plus-box-outline' },
  { id: 'form', label: 'Your form', icon: 'mdi:form-select' },
  { id: 'settings', label: 'Field settings', icon: 'mdi:tune-variant' },
] as const;

type Panel = (typeof PANELS)[number]['id'];
type Props = {
  panel: Panel;
  onPanelChange: (panel: Panel) => void;
  fields: ReactNode;
  form: ReactNode;
  settings: ReactNode;
  children: ReactNode;
};

export function FormBuilderWorkspace({
  panel,
  onPanelChange,
  fields,
  form,
  settings,
  children,
}: Props) {
  const theme = useTheme();
  const desktop = useMediaQuery(theme.breakpoints.up('lg'));
  const workspaceRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (desktop) return;
    const workspace = workspaceRef.current;
    const focusedPanel = document.activeElement?.closest('[role="tabpanel"]');
    if (
      focusedPanel &&
      workspace?.contains(focusedPanel) &&
      focusedPanel.id !== `builder-panel-${panel}`
    ) {
      workspace.querySelector<HTMLElement>(`#builder-panel-${panel}`)?.focus();
    }
  }, [desktop, panel]);
  const contents = { fields, form, settings };
  return (
    <Stack ref={workspaceRef} spacing={1.5} sx={{ flex: 1, width: 1, minWidth: 0, minHeight: 0 }}>
      <Tabs
        value={panel}
        onChange={(_, value: Panel) => onPanelChange(value)}
        variant="fullWidth"
        aria-label="Form builder workspace"
        sx={{ display: { lg: 'none' }, bgcolor: 'background.paper', borderRadius: 1 }}
      >
        {PANELS.map((item) => (
          <Tab
            key={item.id}
            value={item.id}
            label={item.label}
            id={`builder-tab-${item.id}`}
            aria-controls={`builder-panel-${item.id}`}
            icon={<Iconify icon={item.icon} width={18} />}
            iconPosition="start"
            sx={{ px: 1, minWidth: 0, minHeight: 44 }}
          />
        ))}
      </Tabs>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'minmax(0, 1fr)',
            lg: '260px minmax(0, 1fr) 320px',
            xl: '280px minmax(0, 1fr) 350px',
          },
          gap: 2,
          flex: 1,
          minHeight: 0,
          height: { xs: 600, lg: 1 },
        }}
      >
        {PANELS.map((item) => (
          <Box
            key={item.id}
            id={`builder-panel-${item.id}`}
            role={desktop ? 'region' : 'tabpanel'}
            tabIndex={desktop ? undefined : -1}
            aria-labelledby={desktop ? undefined : `builder-tab-${item.id}`}
            aria-label={desktop ? item.label : undefined}
            sx={{
              display: { xs: panel === item.id ? 'flex' : 'none', lg: 'flex' },
              flexDirection: 'column',
              minWidth: 0,
              minHeight: 0,
              height: 1,
              overflow: 'hidden',
              border: 1,
              borderColor: 'divider',
              borderRadius: 2,
              bgcolor: 'background.paper',
            }}
          >
            {contents[item.id]}
          </Box>
        ))}
      </Box>
      {children}
    </Stack>
  );
}
