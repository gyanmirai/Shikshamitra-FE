import type { RootState } from 'src/redux/store';
import type { LibraryDashboardOverview } from 'src/redux/library/library-adapters';

import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { RouterLink } from 'src/routes/components';
import { Scrollbar } from 'src/components/scrollbar';
import { hasGrantedPermission } from 'src/utils/permissions';
import { Stack, Alert, Button, Typography } from '@mui/material';
import { FormSectionCard } from 'src/components/form-section-card';
import { libraryPaths, libraryPermissions } from 'src/constants/library-menus';

import { AlertItem } from './DashboardAlertItem';
import { DashboardAlertSummary } from './DashboardAlertSummary';
import {
  alertIcon,
  alertStatus,
  isFinancialAlert,
  dashboardAlertView,
} from './dashboard-alert-view';

export function DashboardAlerts({
  overview,
  financialOnly = false,
}: {
  overview?: LibraryDashboardOverview;
  financialOnly?: boolean;
}) {
  const { permissions } = useSelector((state: RootState) => state.auth);
  const canViewCharges = hasGrantedPermission(permissions, libraryPermissions.charges);
  const view = dashboardAlertView(overview, financialOnly);
  return (
    <FormSectionCard
      title={financialOnly ? 'Financial Notices' : 'Operational Alerts'}
      icon={financialOnly ? GlobalIcons.paymentSummary : GlobalIcons.bell}
      descriptionTooltip="Review current library notices and follow up on items that need attention."
      sx={{ height: 1, boxShadow: 'none', minWidth: 0 }}
    >
      {!financialOnly && <DashboardAlertSummary overview={overview} />}
      <Scrollbar sx={{ minWidth: 0, ...(financialOnly ? {} : { height: 420 }) }}>
        <Stack spacing={1}>
          {view.unavailable && (
            <Alert severity="info">
              Financial alert verification unavailable. Local declarations do not establish verified
              collection or arrears.
            </Alert>
          )}
          {!view.alerts.length && !view.unavailable && (
            <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
              {financialOnly
                ? 'No financial notices right now.'
                : 'No operational alerts right now.'}
            </Typography>
          )}
          {view.alerts.map((item, index) => (
            <AlertItem
              key={`${item.type}:${index}`}
              title={item.title}
              subtitle={item.message}
              info={item.count ? String(item.count) : ''}
              status={alertStatus(item.severity)}
              icon={alertIcon(item.type)}
              action={
                canViewCharges &&
                isFinancialAlert(item.type) &&
                item.link === libraryPaths.charges ? (
                  <Button
                    component={RouterLink}
                    href={libraryPaths.charges}
                    size="small"
                    color="inherit"
                    aria-label={`Open charge register for ${item.title}`}
                    endIcon={<Iconify icon={GlobalIcons.openInNew} />}
                  >
                    Open charge register
                  </Button>
                ) : undefined
              }
            />
          ))}
        </Stack>
      </Scrollbar>
    </FormSectionCard>
  );
}
