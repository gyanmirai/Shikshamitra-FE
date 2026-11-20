import { it, expect, describe } from 'vitest';
import { studentPaths, studentPermissions } from 'src/constants/student-menu';

import {
  studentSetupStages, safeStudentReturnTo, studentSetupSettings,
  canAccessStudentSetup, getStudentSetupPosition, permittedStudentReturnTo,
  nextStudentSetupPosition, getStudentSetupStepStates, getStudentConfigurationSetting,
} from './student-setup-model';

describe('Student guide scope and navigation', () => {
  it('contains the six approved stages without document or attendance setup', () => {
    expect(studentSetupStages.map((item) => item.key)).toEqual([
      'welcome', 'admissions', 'numbering', 'records', 'workflows', 'review',
    ]);
    expect(studentSetupSettings.map((item) => item.key)).toEqual([
      'admission-periods', 'admission-forms', 'admission-stages', 'admission-offerings',
      'public-inquiry-links', 'gr-number', 'roll-number', 'houses', 'records-policy',
    ]);
  });

  it('keeps inquiry links after offerings and visits workflow guidance before review', () => {
    expect(nextStudentSetupPosition({ stage: 'admissions', setting: 'admission-offerings' },
      studentSetupSettings.map((item) => item.key))).toEqual({ stage: 'admissions', setting: 'public-inquiry-links' });
    expect(nextStudentSetupPosition({ stage: 'records', setting: 'records-policy' },
      studentSetupSettings.map((item) => item.key))).toEqual({ stage: 'workflows', setting: null });
    expect(nextStudentSetupPosition({ stage: 'workflows', setting: null }, [])).toEqual({ stage: 'review', setting: null });
  });

  it('recognizes numbering tabs and exact configured routes without prefix collisions', () => {
    expect(getStudentConfigurationSetting('/student/onboarding/settings', 'tab=roll-number')).toBe('roll-number');
    expect(getStudentConfigurationSetting('/student/onboarding/settings', '')).toBe('gr-number');
    expect(getStudentConfigurationSetting('/student/admissions/settings/workflows/id', '')).toBe('admission-stages');
    expect(getStudentConfigurationSetting('/student/records/settings/access', '')).toBe('records-policy');
    expect(getStudentConfigurationSetting('/student/admissions/settings/forms-copy', '')).toBeNull();
    expect(getStudentConfigurationSetting('/student/attendance/setting', '')).toBeNull();
  });

  it('restores a permitted setting and never revives a revoked saved cursor', () => {
    expect(getStudentSetupPosition('admissions', 'admission-periods', ['admission-forms'])).toEqual({
      stage: 'admissions', setting: 'admission-forms',
    });
    expect(getStudentSetupPosition('numbering', 'gr-number', [])).toEqual({ stage: 'numbering', setting: null });
    expect(getStudentSetupPosition('unknown', 'houses')).toEqual({ stage: 'welcome', setting: null });
  });

  it('does not certify deferred, unavailable or partially configured groups', () => {
    const settings = studentSetupSettings.map((item) => ({ key: item.key, canView: true,
      canManage: true, configurationState: 'empty' as 'empty' | 'configured' | 'unavailable' }));
    expect(getStudentSetupStepStates(settings, ['gr-number', 'roll-number'], null).numbering).toBe('deferred');
    settings[5].configurationState = 'configured';
    expect(getStudentSetupStepStates(settings, [], '2026-11-16T00:00:00Z').numbering).toBeUndefined();
    settings[6].configurationState = 'configured';
    expect(getStudentSetupStepStates(settings, [], null).numbering).toBe('complete');
    settings[6].configurationState = 'unavailable';
    expect(getStudentSetupStepStates(settings, ['gr-number', 'roll-number'], null).numbering).toBeUndefined();
  });

  it('rejects external, encoded, backslash and recursive return locations', () => {
    expect(safeStudentReturnTo('/student/admissions/pipeline?class=1#row')).toBe('/student/admissions/pipeline?class=1#row');
    ['//evil.test', '/student/../security/users', '/student/\\evil.test',
      '/student/%73etup', '/student/setup?stage=review', '/student/%2e%2e/security/users',
      '/student/profile\n', 'https://evil.test/student/profile'].forEach((location) => {
      expect(safeStudentReturnTo(location)).toBe(studentPaths.dashboard);
    });
  });

  it('requires Student module and an exact included View grant', () => {
    const grant = (name: string) => ({ name, isGranted: true });
    expect(canAccessStudentSetup([grant(studentPermissions.root)])).toBe(false);
    expect(canAccessStudentSetup([grant(studentPermissions.root), grant('Students.Onboarding.Add')])).toBe(false);
    expect(canAccessStudentSetup([grant(studentPermissions.root), grant('Students.Onboarding.View')])).toBe(true);
    expect(canAccessStudentSetup([grant('Students.Onboarding.View')])).toBe(false);
  });

  it('returns a limited user only to an authorized existing destination', () => {
    const permissions = [studentPermissions.root, studentPermissions.onboarding.setup].map((name) => ({ name, isGranted: true }));
    expect(permittedStudentReturnTo('/student/dashboard', permissions)).toBe(studentPaths.onboarding.setup);
    expect(permittedStudentReturnTo('/student/admissions/inquiries', permissions)).toBe(studentPaths.onboarding.setup);
    expect(permittedStudentReturnTo('/student/onboarding/setup?view=gr-number', permissions)).toBe('/student/onboarding/setup?view=gr-number');
  });
});
