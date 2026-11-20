'use client';

import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { CustomTabs } from 'src/components/custom-tabs';
import { libraryPaths } from 'src/constants/library-menus';
import { Tab, Stack, Alert, Button, Skeleton } from '@mui/material';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { useGetLibraryPolicyOptionsQuery } from 'src/redux/library/policies-api';
import { useGetLibraryCalendarSettingsQuery } from 'src/redux/library/calendar-api';

import { CalendarPreview } from './CalendarPreview';
import { CalendarClosures } from './CalendarClosures';
import { CalendarTimezone } from './CalendarTimezone';
import { useWorkspaceQuery } from '../policies/useWorkspaceQuery';
import { useLibrarySettings } from '../policies/useLibrarySettings';

export default function LibraryCalendarScreen() {
  const { academicYearId } = useLibrarySettings();
  const { query, update } = useWorkspaceQuery();
  const value = query.get('tab');
  const tab = value === 'closures' || value === 'preview' ? value : 'timezone';
  const settings = useGetLibraryCalendarSettingsQuery(
    { academicYearId },
    { skip: !academicYearId }
  );
  const options = useGetLibraryPolicyOptionsQuery({ academicYearId }, { skip: !academicYearId });
  const data = settings.currentData;
  return (
    <Stack spacing={2} sx={{ height: 1, minHeight: 0 }}>
      <CustomBreadcrumbs
        heading="Library Calendar"
        description="Configure local dates, closures and date calculations."
        links={[{ name: 'Library', href: libraryPaths.dashboard }, { name: 'Library Calendar' }]}
        action={
          <Button
            size="small"
            color="inherit"
            variant="outlined"
            disabled={!academicYearId || settings.isFetching || options.isFetching}
            onClick={() => {
              settings.refetch();
              options.refetch();
            }}
            startIcon={<Iconify icon={GlobalIcons.refresh} />}
          >
            Refresh
          </Button>
        }
      />
      <CustomTabs
        value={tab}
        guardUnsavedChanges={false}
        onChange={(_, next) => update({ tab: next, page: 1 })}
        aria-label="Library calendar views"
      >
        {[
          ['timezone', 'Timezone', GlobalIcons.clock],
          ['closures', 'Closures', GlobalIcons.calendar],
          ['preview', 'Date preview', GlobalIcons.search],
        ].map(([id, label, icon]) => (
          <Tab
            key={id}
            value={id}
            label={label}
            id={`library-calendar-${id}-tab`}
            aria-controls={`library-calendar-${id}-panel`}
            icon={<Iconify icon={icon} />}
          />
        ))}
      </CustomTabs>
      {!academicYearId && (
        <Alert severity="info">Select an academic year to load the Library calendar.</Alert>
      )}
      {settings.isFetching && !data && <Skeleton variant="rounded" height={200} />}
      {settings.isError && (
        <Alert
          severity="error"
          action={
            <Button size="small" onClick={() => settings.refetch()}>
              Retry
            </Button>
          }
        >
          {parseApiProblemDetail(settings.error).detail || 'Could not load the Library calendar.'}
        </Alert>
      )}
      {options.isError && (
        <Alert
          severity="error"
          action={
            <Button size="small" onClick={() => options.refetch()}>
              Retry
            </Button>
          }
        >
          {parseApiProblemDetail(options.error).detail || 'Could not load Library section options.'}
        </Alert>
      )}
      {data && (
        <Stack
          key={academicYearId}
          spacing={2}
          role="tabpanel"
          id={`library-calendar-${tab}-panel`}
          aria-labelledby={`library-calendar-${tab}-tab`}
          sx={{ flex: 1, minHeight: 0, overflow: 'auto', p: 1 }}
        >
          {data.configurationIssues.length > 0 && (
            <Alert severity="info">{data.configurationIssues.join(' ')}</Alert>
          )}
          {tab === 'timezone' && <CalendarTimezone settings={data} />}
          {tab === 'closures' && options.currentData && (
            <CalendarClosures
              academicYearId={academicYearId}
              sections={options.currentData.sections}
              canEdit={data.canManageCalendar}
            />
          )}
          {tab === 'preview' && options.currentData && (
            <CalendarPreview
              academicYearId={academicYearId}
              sections={options.currentData.sections}
            />
          )}
        </Stack>
      )}
    </Stack>
  );
}
