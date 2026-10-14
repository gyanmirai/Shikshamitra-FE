export const onboardingSettingsTabs = [
  { value: 'portal-access', label: 'Portal Access', icon: 'mdi:account-key-outline' },
  { value: 'gr-number', label: 'GR Number', icon: 'mdi:identifier' },
  { value: 'roll-number', label: 'Roll Number', icon: 'mdi:format-list-numbered' },
] as const;

export type OnboardingSettingsTab = (typeof onboardingSettingsTabs)[number]['value'];

export function getOnboardingSettingsTab(value: string | null | undefined): OnboardingSettingsTab {
  return onboardingSettingsTabs.find((tab) => tab.value === value)?.value ?? 'portal-access';
}
