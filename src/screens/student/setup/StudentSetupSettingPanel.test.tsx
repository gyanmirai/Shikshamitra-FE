import type { StudentSetupState, StudentSetupSettingStatus } from 'src/redux/student/setup/types';

import { it, vi, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

import StudentSetupSettingPanel from './StudentSetupSettingPanel';

vi.mock('./StudentSetupManager', () => ({ default: () => <div>Numbering manager</div> }));

function renderNumbering(configurationState: StudentSetupSettingStatus['configurationState']) {
  const state: StudentSetupState = {
    academicYearId: 'year-a',
    concurrencyStamp: 'v1',
    currentStageKey: 'numbering',
    currentSettingKey: 'gr-number',
    deferredSettingKeys: [],
    reviewedAt: null,
    settings: [{ key: 'gr-number', canView: true, canManage: false, configurationState }],
  };
  render(
    <StudentSetupSettingPanel
      position={{ stage: 'numbering', setting: 'gr-number' }}
      state={state}
      deferred={[]}
      disabled={false}
      onOpen={vi.fn()}
    />
  );
}

it.each(['context-required', 'unavailable'] as const)(
  'does not describe %s numbering status as a missing management permission',
  (configurationState) => {
    renderNumbering(configurationState);
    expect(
      screen.queryByText(/Changes require the relevant management permission/)
    ).not.toBeInTheDocument();
  }
);

it.each(['configured', 'empty'] as const)(
  'preserves the readonly explanation for a %s setting without management access',
  (configurationState) => {
    renderNumbering(configurationState);
    expect(screen.getByText(/Changes require the relevant management permission/)).toBeVisible();
  }
);
