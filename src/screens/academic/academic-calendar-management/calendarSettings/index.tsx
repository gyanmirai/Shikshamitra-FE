'use client';

import type { RootState } from 'src/redux/store';

import { LoadingButton } from '@mui/lab';
import { useSelector } from 'react-redux';
import { Iconify } from 'src/components/iconify';
import { useMemo, useState, useEffect } from 'react';
import { CustomTabs } from 'src/components/custom-tabs';
import { shikshaMitraToast } from 'src/components/toast';
import { hasGrantedPermission } from 'src/utils/permissions';
import { academicPermissions } from 'src/constants/academic-menu';
import { useCustomSearchParams } from 'src/hooks/use-search-param';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Box, Tab, Paper, Stack, Alert, Typography, CircularProgress } from '@mui/material';
import {
  useGetCalendarsQuery,
  useGetCalendarSettingsQuery,
  useCreateCalendarSettingsMutation,
  useUpdateCalendarSettingsMutation,
} from 'src/redux/academicAPI/AcademicCalendarApi/academic-calendar-api';

import CalendarSettingsForm from './components/CalendarSettingsForm';
import WorkingHourSettingsForm from './components/WorkingHourSettingsForm';

const TABS = [
  {
    value: 'general',
    label: 'General Settings',
    icon: <Iconify icon="mdi:cog-outline" width={18} />,
  },
  {
    value: 'workingHours',
    label: 'Working Hours',
    icon: <Iconify icon="mdi:clock-outline" width={18} />,
  },
];

const CalendarSettingsScreen = () => {
  const searchParamsHook = useCustomSearchParams({ tab: 'general' });
  const { setParam } = searchParamsHook;
  const searchParams = searchParamsHook.getAllParams();
  const { permissions } = useSelector((state: RootState) => state.auth);
  const { currentYear } = useSelector((state: RootState) => state.globalState);

  const canEdit = hasGrantedPermission(
    permissions,
    `${academicPermissions.academicCalendar.settings}.Edit`
  );

  const [selectedCalendarId, setSelectedCalendarId] = useState<string>('');

  // Fetch calendars for working-hours tab selector
  const { data: calendarsData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetCalendarsQuery,
    params: { academicYearId: currentYear?.id },
    popupConfig: { error: false },
  });

  // Fetch calendar settings
  const { data: settingsData, isLoading: settingsLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetCalendarSettingsQuery,
    params: { academicYearId: currentYear?.id },
    popupConfig: { error: false },
  });

  const [createSettings, { isLoading: creating }] = useCreateCalendarSettingsMutation();
  const [updateSettings, { isLoading: updating }] = useUpdateCalendarSettingsMutation();
  const isSaving = creating || updating;

  const calendars: any[] = useMemo(() => calendarsData?.items ?? [], [calendarsData?.items]);
  const settings = settingsData?.items?.[0] ?? settingsData;

  useEffect(() => {
    if (calendars.length > 0 && !selectedCalendarId) {
      setSelectedCalendarId(calendars[0].id);
    }
  }, [calendars, selectedCalendarId]);

  const handleSaveSettings = async (values: any) => {
    try {
      if (settings?.id) {
        await updateSettings({ id: settings.id, body: values }).unwrap();
      } else {
        await createSettings({ ...values, academicYearId: currentYear?.id }).unwrap();
      }
      shikshaMitraToast.success({ message: 'Calendar settings saved successfully' });
    } catch (err: any) {
      shikshaMitraToast.error({ message: err?.data?.detail || 'Failed to save settings' });
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 2 }}>
      <CustomBreadcrumbs
        heading="Calendar Settings"
        description="Configure all rules for the academic calendar — weekends, blocking, notifications, and visibility."
        links={[
          { name: 'Academics', href: '/academic/dashboard' },
          { name: 'Academic Calendar', href: '/academic/academicCalendarDashboard' },
          { name: 'Settings' },
        ]}
        action={
          searchParams.tab === 'general' && (
            <LoadingButton
              type="submit"
              form="calendar-settings-form"
              variant="contained"
              loading={isSaving}
              disabled={!canEdit}
              size="small"
              startIcon={<Iconify icon="mdi:content-save-outline" width={16} />}
              sx={{ borderRadius: 1.5 }}
            >
              Save Settings
            </LoadingButton>
          )
        }
      />

      {!canEdit && (
        <Alert severity="warning" icon={<Iconify icon="mdi:lock-outline" />}>
          You have read-only access to calendar settings.
        </Alert>
      )}

      {/* Tabs */}
      <Paper
        sx={{ '& *': { fontSize: '13px !important', '& svg': { fontSize: '18px !important' } } }}
      >
        <CustomTabs
          value={searchParams.tab}
          onChange={(_, val) => setParam('tab', val)}
          sx={{ '& .MuiTabs-flexContainer': { gap: 1.5 }, borderRadius: '12px' }}
        >
          {TABS.map((tab) => (
            <Tab key={tab.value} value={tab.value} label={tab.label} icon={tab.icon} />
          ))}
        </CustomTabs>
      </Paper>

      {/* Tab Content */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {/* General Settings */}
        {searchParams.tab === 'general' && (
          <>
            {settingsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress />
              </Box>
            ) : (
              <CalendarSettingsForm
                settingsData={settings}
                onSave={handleSaveSettings}
                isSaving={isSaving}
              />
            )}
          </>
        )}

        {/* Working Hours */}
        {searchParams.tab === 'workingHours' && (
          <Paper sx={{ p: 2.5, borderRadius: 2 }}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              alignItems={{ sm: 'center' }}
              gap={2}
              mb={3}
            >
              <Box>
                <Stack direction="row" alignItems="center" gap={1}>
                  <Iconify icon="mdi:clock-outline" width={20} color="primary.main" />
                  <Typography variant="subtitle1" fontWeight={700}>
                    Working Hours
                  </Typography>
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  Configure school timing for different shifts
                </Typography>
              </Box>
            </Stack>
            <WorkingHourSettingsForm calendarId={selectedCalendarId} />
          </Paper>
        )}
      </Box>
    </Box>
  );
};

export default CalendarSettingsScreen;
