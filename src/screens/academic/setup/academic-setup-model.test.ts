import { it, expect, describe } from 'vitest';

import {
  safeAcademicReturnTo,
  academicSetupSettings,
  getAcademicSetupPosition,
  getAcademicSetupStepStates,
  getAcademicSetupEntryDecision,
  getAcademicConfigurationSetting,
} from './academic-setup-model';

describe('Academic setup entry and navigation', () => {
  it('covers exactly the nine visible settings in their owning stages', () => {
    expect(academicSetupSettings.map((setting) => setting.key)).toEqual([
      'subjects', 'elective-groups', 'lecture-slots', 'weekly-lectures', 'homework-types',
      'assignment-types', 'rubrics', 'grading-scales', 'exam-types',
    ]);
    expect(new Set(academicSetupSettings.map((setting) => setting.stage))).toEqual(
      new Set(['curriculum', 'timetable', 'homework', 'examination'])
    );
  });

  it('starts timetable setup with the prerequisite while retaining saved weekly-lecture links', () => {
    expect(getAcademicSetupPosition('timetable', null)).toEqual({ stage: 'timetable', setting: 'lecture-slots' });
    expect(getAcademicSetupPosition('timetable', 'weekly-lectures')).toEqual({ stage: 'timetable', setting: 'weekly-lectures' });
  });

  it('recognizes exact configuration routes without prefix collisions', () => {
    expect(getAcademicConfigurationSetting('/academic/curriculumSetting/subjectCreation/')).toBe('subjects');
    expect(getAcademicConfigurationSetting('/academic/curriculumSetting/subjectCreation-copy')).toBeNull();
    expect(getAcademicConfigurationSetting('/academic/dashboard')).toBeNull();
    expect(getAcademicConfigurationSetting('/academic/lmsSettings/generalSettings')).toBeNull();
  });

  it('opens automatically only before a school-wide visit, independent of settings', () => {
    expect(getAcademicSetupEntryDecision({ eligible: true, configuration: false, visited: false })).toBe('redirect');
    expect(getAcademicSetupEntryDecision({ eligible: true, configuration: false, visited: true })).toBe('show');
    expect(getAcademicSetupEntryDecision({ eligible: false, configuration: false, visited: false })).toBe('show');
    expect(getAcademicSetupEntryDecision({ eligible: true, configuration: true, visited: false })).toBe('track');
  });

  it('never guesses an unvisited school while status is loading or failed', () => {
    expect(getAcademicSetupEntryDecision({ eligible: true, configuration: false })).toBe('loading');
    expect(getAcademicSetupEntryDecision({ eligible: true, configuration: false, failed: true })).toBe('error');
  });

  it('keeps return navigation inside Academic and avoids reopening setup', () => {
    expect(safeAcademicReturnTo('/academic/curriculumSubjects?class=6#allocation')).toBe('/academic/curriculumSubjects?class=6#allocation');
    ['//example.com', 'https://example.com/academic/dashboard', '/academic/setup?source=automatic', '/security/users', '/academic/../security/users'].forEach((value) => {
      expect(safeAcademicReturnTo(value)).toBe('/academic/dashboard');
    });
  });

  it('restores valid server positions and rejects a setting from another stage', () => {
    expect(getAcademicSetupPosition('homework', 'rubrics')).toEqual({ stage: 'homework', setting: 'rubrics' });
    expect(getAcademicSetupPosition('curriculum', 'exam-types')).toEqual({ stage: 'curriculum', setting: 'subjects' });
    expect(getAcademicSetupPosition('unknown', 'rubrics')).toEqual({ stage: 'welcome', setting: null });
  });

  it('does not turn visiting or deferring a stage into configuration completion', () => {
    const settings: import('src/redux/academic-setup/types').AcademicSetupSettingStatus[] = academicSetupSettings.map((setting) => ({
      key: setting.key, canView: true, canManage: true, configurationState: 'empty' as const,
    }));
    expect(getAcademicSetupStepStates(settings, ['subjects', 'elective-groups'], null).curriculum).toBe('deferred');
    expect(getAcademicSetupStepStates(settings, [], '2026-10-28T00:00:00Z').curriculum).toBeUndefined();
    settings[0] = { ...settings[0], configurationState: 'configured' };
    expect(getAcademicSetupStepStates(settings, [], null).curriculum).toBeUndefined();
    settings[1] = { ...settings[1], configurationState: 'configured' };
    expect(getAcademicSetupStepStates(settings, [], null).curriculum).toBe('complete');
  });

  it('restores the first permitted setting when another user saved an inaccessible cursor', () => {
    expect(getAcademicSetupPosition('curriculum', 'subjects', ['elective-groups'])).toEqual({
      stage: 'curriculum', setting: 'elective-groups',
    });
    expect(getAcademicSetupPosition('curriculum', 'subjects', [])).toEqual({ stage: 'curriculum', setting: null });
  });
});
