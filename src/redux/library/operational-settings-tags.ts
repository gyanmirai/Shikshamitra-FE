import { librarySettingsType } from 'src/redux/tagTypes';

export const libraryCalendarReadTag = {
  type: librarySettingsType.librarySettings,
  id: 'CALENDAR',
} as const;
export const libraryPolicyReadTag = {
  type: librarySettingsType.librarySettings,
  id: 'POLICIES',
} as const;
