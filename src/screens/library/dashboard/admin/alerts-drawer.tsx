import type { BoxProps } from '@mui/material';

import { useRef, useState } from 'react';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { alpha, useTheme } from '@mui/material/styles';
import {
  Box,
  Tab,
  Tabs,
  Stack,
  Slide,
  Drawer,
  Divider,
  Typography,
  IconButton,
} from '@mui/material';

import {
  AlertItem,
  LOW_STOCK,
  DEFAULTERS,
  HIGH_DEMAND,
  OVERDUE_BOOKS,
  getSeverityStatus,
} from './admin-alerts';

interface AlertsDrawerProps {
  open: boolean;
  onClose: () => void;
}

type FilterTab = 'all' | 'overdue' | 'high-demand' | 'dead-stock';

// FormSlider component for smooth tab transitions
const FormSlider = ({
  step,
  steps: allStep,
  children,
  isBackClick,
  containerProps = {},
}: {
  step: number;
  steps: any[];
  children?: any;
  isBackClick: boolean;
  containerProps?: BoxProps;
}) => {
  const { sx = {}, ...props } = containerProps;
  const containerRef = useRef<HTMLElement>(null);
  return (
    <Box ref={containerRef} sx={{ height: '100%', ...sx }} {...props}>
      {allStep.map(
        (_, index) =>
          index === step && (
            <Slide
              in={index === step}
              container={containerRef.current}
              direction={isBackClick ? 'right' : 'left'}
              key={index}
            >
              {children}
            </Slide>
          )
      )}
    </Box>
  );
};

const TABS = [
  { value: 'all', label: 'All' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'high-demand', label: 'High Demand' },
  { value: 'dead-stock', label: 'Dead Stock' },
];

const AlertsDrawer = ({ open, onClose }: AlertsDrawerProps) => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [previousTab, setPreviousTab] = useState<FilterTab>('all');

  const handleTabChange = (_event: React.SyntheticEvent, newValue: FilterTab) => {
    setPreviousTab(activeTab);
    setActiveTab(newValue);
  };

  // Calculate total alerts count
  const totalAlerts =
    DEFAULTERS.length + OVERDUE_BOOKS.length + HIGH_DEMAND.length + LOW_STOCK.length;

  // Get filtered count based on active tab
  const getFilteredCount = () => {
    switch (activeTab) {
      case 'overdue':
        return OVERDUE_BOOKS.length;
      case 'high-demand':
        return HIGH_DEMAND.length;
      case 'dead-stock':
        return LOW_STOCK.length;
      default:
        return totalAlerts;
    }
  };

  const shouldShowSection = (section: FilterTab) => {
    if (activeTab === 'all') return true;
    return activeTab === section;
  };

  // Get current tab index for FormSlider
  const currentTabIndex = TABS.findIndex((tab) => tab.value === activeTab);
  const previousTabIndex = TABS.findIndex((tab) => tab.value === previousTab);
  const isBackClick = currentTabIndex < previousTabIndex;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 480 },
          maxWidth: 480,
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      {/* Header */}
      <Box sx={{ px: 3, py: 2 }}>
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              All Operational Alerts
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
              {getFilteredCount()} {getFilteredCount() === 1 ? 'alert' : 'alerts'}
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small" sx={{ mt: -0.5 }}>
            <Iconify icon="carbon:close" width={20} />
          </IconButton>
        </Stack>
      </Box>

      <Divider />

      {/* Filter Tabs */}
      <Box
        sx={{
          px: 3,
          pt: 2,
          pb: 1,
          bgcolor: (t) => alpha(t.palette.grey[500], 0.04),
          borderBottom: (t) => `1px solid ${t.palette.divider}`,
        }}
      >
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            minHeight: 40,
            '& .MuiTabs-flexContainer': {
              gap: 2,
            },
            '& .MuiTab-root': {
              minHeight: 40,
              minWidth: 'auto',
              px: 2,
              py: 1,
              fontSize: '0.875rem',
              fontWeight: 600,
              textTransform: 'none',
              color: 'text.secondary',
              '&.Mui-selected': {
                color: 'text.primary',
              },
            },
            '& .MuiTabs-indicator': {
              height: 2,
              borderRadius: '2px 2px 0 0',
            },
          }}
        >
          {TABS.map((tab) => (
            <Tab key={tab.value} label={tab.label} value={tab.value} />
          ))}
        </Tabs>
      </Box>

      {/* Scrollable Alert List with FormSlider */}
      <FormSlider
        step={currentTabIndex}
        steps={TABS}
        isBackClick={isBackClick}
        containerProps={{
          sx: {
            flexGrow: 1,
            overflow: 'hidden',
          },
        }}
      >
        <Scrollbar sx={{ px: 3, py: 2, height: '100%' }}>
          <Stack spacing={0}>
            {/* Top Defaulters Section */}
            {shouldShowSection('all') && (
              <>
                <Typography
                  variant="overline"
                  sx={{ color: 'text.disabled', mt: 1, mb: 1, fontWeight: 800, display: 'block' }}
                >
                  Top Defaulters
                </Typography>
                {DEFAULTERS.map((item) => (
                  <AlertItem
                    key={`def-${item.id}`}
                    title={item.name}
                    subtitle={`${item.books} books overdue`}
                    info={`${item.days}d`}
                    status={getSeverityStatus(item.days)}
                    icon="solar:user-rounded-linear"
                  />
                ))}
              </>
            )}

            {/* Overdue Books Section */}
            {shouldShowSection('overdue') && (
              <>
                <Typography
                  variant="overline"
                  sx={{
                    color: 'text.disabled',
                    mt: shouldShowSection('all') ? 3 : 1,
                    mb: 1,
                    fontWeight: 800,
                    display: 'block',
                  }}
                >
                  Overdue &gt; 7 Days
                </Typography>
                {OVERDUE_BOOKS.map((item) => (
                  <AlertItem
                    key={`ovr-${item.id}`}
                    title={item.title}
                    subtitle={item.member}
                    info={`${item.days}d`}
                    status="error"
                    isCritical
                    icon="solar:book-bookmark-linear"
                  />
                ))}
              </>
            )}

            {/* High Demand Section */}
            {shouldShowSection('high-demand') && (
              <>
                <Typography
                  variant="overline"
                  sx={{
                    color: 'text.disabled',
                    mt: shouldShowSection('all') ? 3 : 1,
                    mb: 1,
                    fontWeight: 800,
                    display: 'block',
                  }}
                >
                  High Demand
                </Typography>
                {HIGH_DEMAND.map((item) => (
                  <AlertItem
                    key={`dem-${item.id}`}
                    title={item.title}
                    subtitle="Waitlist items"
                    info={`${item.requests} req`}
                    status="info"
                    icon="solar:star-linear"
                  />
                ))}
              </>
            )}

            {/* Low Stock Section */}
            {shouldShowSection('dead-stock') && (
              <>
                <Typography
                  variant="overline"
                  sx={{
                    color: 'text.disabled',
                    mt: shouldShowSection('all') ? 3 : 1,
                    mb: 1,
                    fontWeight: 800,
                    display: 'block',
                  }}
                >
                  Low Stock
                </Typography>
                {LOW_STOCK.map((item) => (
                  <AlertItem
                    key={`low-${item.id}`}
                    title={item.title}
                    subtitle="Less than 3 copies"
                    info={`${item.stock} left`}
                    status="error"
                    icon="solar:box-linear"
                  />
                ))}
              </>
            )}
          </Stack>
        </Scrollbar>
      </FormSlider>
    </Drawer>
  );
};

export default AlertsDrawer;
