import type { AdmissionFormStagePolicy } from 'src/redux/student/admissions/admission-form-stage-policy';

import { useState } from 'react';
import { screen } from '@testing-library/react';
import { vi, it, expect, describe } from 'vitest';
import userEvent from '@testing-library/user-event';
import { DEFAULT_FORM_STAGE_POLICY } from 'src/redux/student/admissions/admission-form-stage-policy';

import { renderDocumentUi } from '../document-verification/document-ui-test-fixture';
import { FormStageBehaviorSettings } from './components/form-stage-behavior-settings';

vi.mock('src/components/iconify', () => ({ Iconify: () => null }));

describe('Form submission behavior', () => {
  it('hides late submission and preserves saved deadline policy while changing corrections', async () => {
    const changed = vi.fn();
    function Settings() {
      const [policy, setPolicy] = useState<AdmissionFormStagePolicy>({
        ...DEFAULT_FORM_STAGE_POLICY,
        responsibility: 'staff',
        dueInDays: 7,
        allowLateSubmission: false,
        allowCorrectionRequests: false,
      });
      return (
        <FormStageBehaviorSettings
          policy={policy}
          disabled={false}
          onChange={(change) => {
            changed({ ...policy, ...change });
            setPolicy({ ...policy, ...change });
          }}
        />
      );
    }
    renderDocumentUi(<Settings />);
    expect(screen.queryByRole('switch', { name: 'Allow late submission' })).not.toBeInTheDocument();
    const toggle = screen.getByRole('switch', { name: 'Allow corrections' });
    expect(toggle).toBeEnabled();
    expect(toggle).not.toBeChecked();
    const user = userEvent.setup();
    await user.click(toggle);
    expect(toggle).toBeChecked();
    expect(changed).toHaveBeenLastCalledWith(
      expect.objectContaining({
        responsibility: 'staff',
        dueInDays: 7,
        allowLateSubmission: false,
        allowCorrectionRequests: true,
      })
    );
    await user.click(toggle);
    expect(toggle).not.toBeChecked();
    expect(changed).toHaveBeenLastCalledWith(
      expect.objectContaining({
        allowCorrectionRequests: false,
        allowLateSubmission: false,
        dueInDays: 7,
      })
    );
  });

  it('keeps corrections locked when editing is unavailable without exposing late submission', () => {
    const changed = vi.fn();
    renderDocumentUi(
      <FormStageBehaviorSettings
        policy={{ ...DEFAULT_FORM_STAGE_POLICY, dueInDays: 7, allowLateSubmission: true }}
        disabled
        onChange={changed}
      />
    );
    expect(screen.queryByRole('switch', { name: 'Allow late submission' })).not.toBeInTheDocument();
    expect(screen.getByRole('switch', { name: 'Allow corrections' })).toBeDisabled();
    expect(changed).not.toHaveBeenCalled();
  });
});
