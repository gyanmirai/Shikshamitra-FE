import type { ReactNode } from 'react';

import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { RouterLink } from 'src/routes/components';
import useMediaQuery from '@mui/material/useMediaQuery';
import { CustomTabs } from 'src/components/custom-tabs';

const TABS = [
  { value: 0, label: 'School defaults' },
  { value: 1, label: 'Board, medium & organization overrides' },
];

export function IdentityScopeTabs({
  value,
  href,
  actions,
}: {
  value: number;
  href: (value: number) => string;
  actions?: ReactNode;
}) {
  const muiTheme = useTheme();
  const compact = useMediaQuery(muiTheme.breakpoints.down('sm'));
  return (
    <Card
      role="group"
      aria-label="School identity toolbar"
      sx={{
        borderRadius: 1,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <CustomTabs
        value={value}
        aria-label="School identity scope"
        variant={compact ? 'fullWidth' : 'scrollable'}
        scrollButtons={compact ? false : 'auto'}
        guardUnsavedChanges={false}
        sx={{
          minWidth: 0,
          flex: { xs: '1 1 100%', sm: '0 1 auto' },
        }}
        slotProps={{
          scroller: { p: 1 },
          flexContainer: { gap: 1 },
          tab: {
            gap: 0.75,
            // px: { xs: 1, sm: 2 },
            minWidth: compact ? 0 : 'auto',
            maxWidth: compact ? 'none' : 360,
            // minHeight: 44,
            borderRadius: 1,
            whiteSpace: 'normal',
          },
        }}
      >
        {TABS.map((tab) => (
          <Tab
            key={tab.value}
            value={tab.value}
            component={RouterLink}
            href={href(tab.value)}
            scroll={false}
            id={`identity-scope-${tab.value}`}
            aria-controls={`identity-panel-${tab.value}`}
            icon={
              <Iconify
                icon={tab.value === 0 ? 'mdi:school-outline' : 'mdi:layers-outline'}
                width={20}
              />
            }
            iconPosition="start"
            label={tab.label}
          />
        ))}
      </CustomTabs>
      {actions}
    </Card>
  );
}
