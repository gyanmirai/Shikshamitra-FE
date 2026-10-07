import type { ReactNode } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Stack from '@mui/material/Stack';
import { useRef, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import useMediaQuery from '@mui/material/useMediaQuery';

type Props = {
  panel: 'fields' | 'form';
  onPanelChange: (panel: 'fields' | 'form') => void;
  fields: ReactNode;
  form: ReactNode;
  children: ReactNode;
};

export function FormBuilderWorkspace({ panel, onPanelChange, fields, form, children }: Props) {
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
  return (
    <Stack
      ref={workspaceRef}
      spacing={1}
      sx={{ flex: 1, width: 1, minWidth: 0, minHeight: 0, overflow: 'hidden' }}
    >
      <Tabs
        value={panel}
        onChange={(_, value: 'fields' | 'form') => onPanelChange(value)}
        variant="fullWidth"
        aria-label="Form builder workspace"
        sx={{ display: { lg: 'none' }, bgcolor: 'background.paper' }}
      >
        <Tab
          value="fields"
          label="Student fields"
          icon={<Iconify icon="mdi:account-details-outline" width={18} />}
          iconPosition="start"
          id="builder-tab-fields"
          aria-controls="builder-panel-fields"
        />
        <Tab
          value="form"
          label="Your form"
          icon={<Iconify icon="mdi:form-select" width={18} />}
          iconPosition="start"
          id="builder-tab-form"
          aria-controls="builder-panel-form"
        />
      </Tabs>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'minmax(0, 1fr)',
            lg: 'minmax(320px, 350px) minmax(0, 1fr)',
            xl: 'minmax(350px, 370px) minmax(0, 1fr)',
          },
          gap: 1,
          flex: 1,
          minHeight: 0,
          minWidth: 0,
          '& .MuiSwitch-switchBase.Mui-checked': { color: 'text.primary' },
          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: 'text.primary' },
        }}
      >
        <Box
          id="builder-panel-fields"
          role={desktop ? 'region' : 'tabpanel'}
          tabIndex={desktop ? undefined : -1}
          aria-labelledby={desktop ? undefined : 'builder-tab-fields'}
          aria-label={desktop ? 'Student fields' : undefined}
          sx={{
            display: { xs: panel === 'fields' ? 'flex' : 'none', lg: 'flex' },
            flexDirection: 'column',
            minHeight: 0,
            minWidth: 0,
            overflow: 'hidden',
            border: 1,
            borderColor: 'divider',
            borderRadius: 2,
            bgcolor: 'background.paper',
          }}
        >
          {fields}
        </Box>
        <Box
          id="builder-panel-form"
          role={desktop ? 'region' : 'tabpanel'}
          tabIndex={desktop ? undefined : -1}
          aria-labelledby={desktop ? undefined : 'builder-tab-form'}
          aria-label={desktop ? 'Your form' : undefined}
          sx={{
            display: { xs: panel === 'form' ? 'flex' : 'none', lg: 'flex' },
            flexDirection: 'column',
            minHeight: 0,
            minWidth: 0,
            overflow: 'hidden',
            border: 1,
            borderColor: 'divider',
            borderRadius: 2,
            bgcolor: 'background.paper',
          }}
        >
          {form}
        </Box>
      </Box>
      {children}
    </Stack>
  );
}
