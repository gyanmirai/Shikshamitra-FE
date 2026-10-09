import { useState } from 'react';
import { screen } from '@testing-library/react';
import { vi, it, expect, describe } from 'vitest';
import userEvent from '@testing-library/user-event';
import { DEFAULT_FORM_STAGE_POLICY } from 'src/redux/student/admissions/admission-form-stage-policy';

import { renderDocumentUi } from '../document-verification/document-ui-test-fixture';
import { FormStageBehaviorSettings } from './components/form-stage-behavior-settings';

vi.mock('src/components/iconify', () => ({ Iconify: () => null }));

describe('Form submission behavior', () => {
  it('allows changing late submission without a deadline and preserves hidden policy values', async () => {
    const changed = vi.fn();
    function Settings() {
      const [policy, setPolicy] = useState({
        ...DEFAULT_FORM_STAGE_POLICY,
        responsibility: 'staff' as const,
        dueInDays: null,
        allowLateSubmission: false,
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
    const toggle = screen.getByRole('switch', { name: 'Allow late submission' });
    expect(toggle).toBeEnabled();
    expect(toggle).not.toBeChecked();
    const user = userEvent.setup();
    await user.click(toggle);
    expect(toggle).toBeChecked();
    expect(changed).toHaveBeenLastCalledWith(
      expect.objectContaining({
        responsibility: 'staff',
        dueInDays: null,
        allowLateSubmission: true,
      })
    );
    await user.click(toggle);
    expect(toggle).not.toBeChecked();
    expect(changed).toHaveBeenLastCalledWith(
      expect.objectContaining({ allowLateSubmission: false })
    );
  });

  it('keeps saved late-submission settings visible and locked when editing is unavailable', () => {
    const changed = vi.fn();
    renderDocumentUi(
      <FormStageBehaviorSettings
        policy={{ ...DEFAULT_FORM_STAGE_POLICY, dueInDays: 7, allowLateSubmission: true }}
        disabled
        onChange={changed}
      />
    );
    expect(screen.getByRole('switch', { name: 'Allow late submission' })).toBeChecked();
    expect(screen.getByRole('switch', { name: 'Allow late submission' })).toBeDisabled();
    expect(changed).not.toHaveBeenCalled();
  });
});
