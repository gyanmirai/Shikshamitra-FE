import type { ReactNode } from 'react';

import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import confirmReducer from 'src/redux/confirmPopup/confirmPopupSlice';
import { defaultSettings } from 'src/components/settings/config-settings';
import { createSlice, configureStore, type PayloadAction } from '@reduxjs/toolkit';

const theme = createTheme(defaultSettings);

export const notificationSetting = {
  id: 'setting-id',
  eventType: 'dueDateReminder',
  eventGroup: 'Transactions',
  eventName: 'Due date reminder',
  recipientRole: 'Member',
  channel: 'Email',
  isActive: true,
  isChannelAvailable: true,
  isComingSoon: false,
  reminderOffsetDays: 2,
  repeatIntervalDays: 7,
  subjectTemplate: 'Return reminder',
  messageTemplate: 'Please return your library book.',
};
export const notificationSettings = {
  canManageSettings: true,
  setup: {
    timeZoneId: 'Asia/Kolkata',
    automaticReminderTimeLocal: '08:30',
    studentInboxRouting: 'Guardians',
    operationalRecipientUserIds: [],
    needsConfiguration: false,
    configurationIssues: [],
  },
  items: [notificationSetting],
  events: [{ ...notificationSetting }],
  channels: [{ channel: 'Email', label: 'Email', isAvailable: true }],
};
export function notificationWrapper(actions = ['View', 'Add']) {
  const auth = createSlice({
    name: 'notificationTestAuth',
    initialState: {
      permissions: actions.map((name) => ({
        name: `Library.Notification.${name}`,
        isGranted: true,
      })),
      user: { sub: 'guardian-id' },
      sessionContext: { tenantId: 'tenant-id', accountMode: 'tenant' },
    },
    reducers: {
      switchViewer: (state, action: PayloadAction<string>) => {
        state.user.sub = action.payload;
      },
      switchMode: (state, action: PayloadAction<string>) => {
        state.sessionContext.accountMode = action.payload;
      },
    },
  });
  const store = configureStore({
    reducer: {
      auth: auth.reducer,
      confirmPopup: confirmReducer,
      [api.reducerPath]: api.reducer,
    },
    middleware: (defaults) => defaults().concat(api.middleware),
  });
  return {
    store,
    actions: auth.actions,
    wrapper: ({ children }: { children: ReactNode }) => (
      <Provider store={store}>
        <ThemeProvider theme={theme}>{children}</ThemeProvider>
      </Provider>
    ),
  };
}
