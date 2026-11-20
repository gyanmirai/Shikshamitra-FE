import type { ReactNode } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { useRef, useState, useEffect } from 'react';
import useMediaQuery from '@mui/material/useMediaQuery';
import CustomTooltip from 'src/components/custom-tooltip';

type Props = {
  panel: 'fields' | 'form';
  onPanelChange: (panel: 'fields' | 'form') => void;
  fields: ReactNode;
  form: ReactNode;
  children: ReactNode;
  fieldsNeedAttention?: boolean;
};

export function FormBuilderWorkspace({
  panel,
  onPanelChange,
  fields,
  form,
  children,
  fieldsNeedAttention = false,
}: Props) {
  const theme = useTheme();
  const desktop = useMediaQuery(theme.breakpoints.up('lg'));
  const workspaceRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const [fieldsCollapsed, setFieldsCollapsed] = useState(false);
  useEffect(() => {
    if (desktop && fieldsNeedAttention) setFieldsCollapsed(false);
  }, [desktop, fieldsNeedAttention]);
  useEffect(() => {
    const workspace = workspaceRef.current;
    if (desktop) {
      if (
        fieldsCollapsed &&
        workspace?.querySelector('#builder-fields-content')?.contains(document.activeElement)
      )
        toggleRef.current?.focus();
      return;
    }
    const focusedPanel = document.activeElement?.closest('[role="tabpanel"]');
    if (
      focusedPanel &&
      workspace?.contains(focusedPanel) &&
      focusedPanel.id !== `builder-panel-${panel}`
    ) {
      workspace.querySelector<HTMLElement>(`#builder-panel-${panel}`)?.focus();
    }
  }, [desktop, panel, fieldsCollapsed]);
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
        aria-label="Form Builder Workspace"
        sx={{ display: { lg: 'none' }, bgcolor: 'background.paper' }}
      >
        <Tab
          value="fields"
          label="Student Fields"
          icon={<Iconify icon="mdi:account-details-outline" width={18} />}
          iconPosition="start"
          id="builder-tab-fields"
          aria-controls="builder-panel-fields"
        />
        <Tab
          value="form"
          label="Your Form"
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
            lg: `${fieldsCollapsed ? 56 : 280}px minmax(0, 1fr)`,
            xl: `${fieldsCollapsed ? 56 : 300}px minmax(0, 1fr)`,
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
          aria-label={desktop ? 'Student Fields' : undefined}
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
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{
              display: desktop ? 'flex' : 'none',
              p: 0.5,
              borderBottom: fieldsCollapsed ? 0 : 1,
              borderColor: 'divider',
              flexShrink: 0,
            }}
          >
            {!fieldsCollapsed && (
              <Typography variant="subtitle2" sx={{ pl: 1 }}>
                Field Library
              </Typography>
            )}
            <CustomTooltip
              title={fieldsCollapsed ? 'Expand Field Library' : 'Collapse Field Library'}
              describeChild
            >
              <IconButton
                ref={toggleRef}
                size="small"
                aria-label={fieldsCollapsed ? 'Expand Field Library' : 'Collapse Field Library'}
                aria-expanded={!fieldsCollapsed}
                aria-controls="builder-fields-content"
                onClick={() => setFieldsCollapsed((collapsed) => !collapsed)}
                sx={{ width: 44, height: 44, flexShrink: 0 }}
              >
                <Iconify icon={fieldsCollapsed ? 'mdi:chevron-right' : 'mdi:chevron-left'} />
              </IconButton>
            </CustomTooltip>
          </Stack>
          <Box
            id="builder-fields-content"
            hidden={desktop && fieldsCollapsed}
            sx={{
              display: desktop && fieldsCollapsed ? 'none' : 'flex',
              flexDirection: 'column',
              flex: 1,
              minHeight: 0,
              minWidth: 0,
            }}
          >
            {fields}
          </Box>
        </Box>
        <Box
          id="builder-panel-form"
          role={desktop ? 'region' : 'tabpanel'}
          tabIndex={desktop ? undefined : -1}
          aria-labelledby={desktop ? undefined : 'builder-tab-form'}
          aria-label={desktop ? 'Your Form' : undefined}
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
