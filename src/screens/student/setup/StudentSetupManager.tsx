'use client';

import dynamic from 'next/dynamic';
import LinearProgress from '@mui/material/LinearProgress';

import { PersistedOnboardingSettingsProvider } from '../onboarding/persisted-onboarding-settings-provider';

import type { StudentSetupSettingKey } from './student-setup-catalog';

function LoadingSetting() {
  return <LinearProgress aria-label="Loading Student setting" />;
}

const managers = {
  'admission-periods': dynamic(() => import('../admissions/admission-cycles'), { loading: LoadingSetting }),
  'admission-forms': dynamic(() => import('../admissions/admission-forms'), { loading: LoadingSetting }),
  'admission-stages': dynamic(() => import('../admissions/admission-workflows'), { loading: LoadingSetting }),
  'admission-offerings': dynamic(() => import('../admissions/admission-offerings'), { loading: LoadingSetting }),
  'public-inquiry-links': dynamic(() => import('../admissions/admission-public-inquiry-links-screen'), { loading: LoadingSetting }),
  'gr-number': dynamic(() => import('../onboarding/setting/numbering-rules-screen').then((module) => module.GrNumberSettingsScreen), { loading: LoadingSetting }),
  'roll-number': dynamic(() => import('../onboarding/setting/numbering-rules-screen').then((module) => module.RollNumberSettingsScreen), { loading: LoadingSetting }),
  houses: dynamic(() => import('../house-management'), { loading: LoadingSetting }),
  'records-policy': dynamic(() => import('../records/records-settings'), { loading: LoadingSetting }),
};

export default function StudentSetupManager({ setting }: { setting: StudentSetupSettingKey }) {
  if (setting === 'houses') {
    const HouseCatalogue = managers.houses;
    return <HouseCatalogue workspace="catalogue" />;
  }
  const Manager = managers[setting];
  if (setting === 'gr-number' || setting === 'roll-number') {
    return <PersistedOnboardingSettingsProvider><Manager /></PersistedOnboardingSettingsProvider>;
  }
  return <Manager />;
}
