import { useState } from 'react';
import { it, vi, expect, describe, afterEach, beforeEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';

import { HrSetupEditor } from './hr-setup-editor';

const mocks = vi.hoisted(() => ({
  error: false,
  refetch: vi.fn(),
  permissions: [
    'HR.PayrollManagement.Settings.EarningComponents.View',
    'HR.PayrollManagement.Settings.EarningComponents.Add',
    'HR.PayrollManagement.Settings.SalaryTemplates.View',
    'HR.PayrollManagement.Settings.SalaryTemplates.Add',
  ],
}));
vi.mock('react-redux', () => ({
  useSelector: (selector: any) =>
    selector({
      auth: { permissions: mocks.permissions.map((name) => ({ name, isGranted: true })) },
    }),
}));
vi.mock('src/redux/hr/employee-payroll-api', () => ({
  useGetEarningComponentOptionsQuery: () => ({
    currentData: { items: [] },
    isError: mocks.error,
    refetch: mocks.refetch,
  }),
}));
vi.mock('src/redux/hr/salary-template-api', () => ({
  useGetSalaryTemplatesQuery: () => ({
    currentData: { items: [] },
    isError: mocks.error,
    refetch: mocks.refetch,
  }),
}));
vi.mock('src/screens/hr/payroll/setting/earning-component', () => ({
  EarningComponentForm: () => {
    const [draft, setDraft] = useState('');
    return (
      <input
        aria-label="Earning draft"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
      />
    );
  },
}));
vi.mock('src/screens/hr/payroll/setting/salary-template-editor', () => ({
  default: function TemplateDraft() {
    const [draft, setDraft] = useState('');
    return (
      <input
        aria-label="Template draft"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
      />
    );
  },
}));
vi.mock('src/screens/hr/payroll/setting/pf', () => ({ PFForm: () => null }));
vi.mock('src/screens/hr/payroll/setting/esi-policies', () => ({ EsiPolicyEditor: () => null }));
vi.mock('src/screens/hr/payroll/setting/professional-tax', () => ({
  ProfessionalTaxForm: () => null,
}));
vi.mock('src/screens/hr/payroll/setting/deduction-component', () => ({
  DeductionComponentForm: () => null,
}));
vi.mock('src/screens/hr/attendance-setting/shift-management', () => ({
  ShiftManagementForm: () => null,
}));
vi.mock('src/screens/hr/policies/components/LeavePolicyForm', () => ({
  LeavePolicyForm: () => null,
}));
vi.mock('src/redux/hr/leaveApi', () => ({ useGetLeavePoliciesQuery: () => ({}) }));
vi.mock('./hr-setup-policy-editor', () => ({ HrSetupPolicyEditor: () => null }));

describe('HR setup catalogue recovery', () => {
  beforeEach(() => {
    mocks.error = false;
    mocks.refetch.mockClear();
  });
  afterEach(cleanup);
  it.each([
    ['earnings', 'Earning draft', 'Unable to load earning components.'],
    ['salary-template', 'Template draft', 'Unable to load salary templates.'],
  ])(
    'preserves the %s editor during a failed background lookup and retry',
    (task, label, message) => {
      const props = {
        task,
        readiness: { academicYearId: 'year', checks: [], availableYears: [], isReady: false },
        onSaved: vi.fn(),
        revision: 0,
      };
      const view = render(<HrSetupEditor {...props} />);
      fireEvent.change(screen.getByRole('textbox', { name: label }), {
        target: { value: 'Keep this draft' },
      });
      mocks.error = true;
      view.rerender(<HrSetupEditor {...props} />);
      expect(screen.getByRole('alert')).toHaveTextContent(message);
      expect(screen.getByRole('textbox', { name: label })).toHaveValue('Keep this draft');
      fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
      expect(mocks.refetch).toHaveBeenCalledOnce();
      mocks.error = false;
      view.rerender(<HrSetupEditor {...props} />);
      expect(screen.queryByRole('alert')).toBeNull();
      expect(screen.getByRole('textbox', { name: label })).toHaveValue('Keep this draft');
    }
  );
});
