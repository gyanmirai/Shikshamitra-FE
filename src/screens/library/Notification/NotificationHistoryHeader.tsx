import { Stack, Button } from '@mui/material';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { RouterLink } from 'src/routes/components';
import { libraryPaths } from 'src/constants/library-menus';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

export function NotificationHistoryHeader({
  canAct,
  onCommand,
}: {
  canAct: boolean;
  onCommand: (command: 'compose' | 'run') => void;
}) {
  return (
    <CustomBreadcrumbs
      heading="Notification"
      description="Review Library delivery outcomes and send messages within your authorized scope."
      links={[{ name: 'Library', href: libraryPaths.dashboard }, { name: 'Notification' }]}
      sx={{ px: 1 }}
      action={
        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
          <Button
            component={RouterLink}
            href={libraryPaths.notificationSettings}
            size="small"
            variant="outlined"
            color="inherit"
            startIcon={<Iconify icon={GlobalIcons.academicFieldSettings} />}
          >
            Settings
          </Button>
          {canAct && (
            <>
              <Button
                size="small"
                variant="outlined"
                color="inherit"
                onClick={() => onCommand('run')}
                startIcon={<Iconify icon={GlobalIcons.refresh} />}
              >
                Run reminders
              </Button>
              <Button
                size="small"
                variant="contained"
                color="inherit"
                onClick={() => onCommand('compose')}
                startIcon={<Iconify icon={GlobalIcons.sendNotification} />}
              >
                Send message
              </Button>
            </>
          )}
        </Stack>
      }
    />
  );
}
