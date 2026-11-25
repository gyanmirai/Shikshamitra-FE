import { vi, it, expect, describe } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { defaultSettings } from 'src/components/settings/config-settings';
import { render, screen, within, fireEvent } from '@testing-library/react';

import VersionDiffTable from './VersionDiffTable';
import { materializePolicyVersion } from '../../utils/policy-version-page';

import type { PolicyVersion } from '../../hooks/useFinancePolicyVersion';

vi.mock('src/components/iconify', () => ({ Iconify: () => null }));

const version: PolicyVersion = {
  eventId: 'v2',
  versionNumber: 2,
  actor: 'Finance Admin',
  date: '2026-10-23T10:30:00Z',
  createdAt: '2026-10-23T10:30:00Z',
  action: 'Updated',
  status: 'Active',
  summary: 'Name updated',
  snapshotAfter: {
    PolicyName: 'Saved historical name',
    Description: 'Unchanged historical description',
    Status: 'Active',
    ConcurrencyStamp: 'internal-concurrency-value',
  },
  changedFields: [
    { field: 'PolicyName', oldValue: 'Previous name', newValue: 'Saved historical name' },
  ],
};

const view = (selected: PolicyVersion, policyType = 'concession') => (
  <ThemeProvider theme={createTheme(defaultSettings)}>
    <VersionDiffTable
      selectedVersion={selected}
      valueContext={{ policyType }}
      collapsibleChanges
      showSavedDetails
    />
  </ThemeProvider>
);

describe('Policy version-history cards', () => {
  it.each(['concession', 'collection', 'refund', 'proration'])(
    'shows a complete saved snapshot independently from changes for %s policies',
    (policyType) => {
      render(view(version, policyType));
      expect(screen.getByRole('button', { name: 'Changes' })).toHaveAttribute(
        'aria-expanded',
        'true'
      );
      fireEvent.click(screen.getByRole('button', { name: 'Changes' }));
      expect(screen.queryByRole('table')).not.toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: 'Saved version details' }));
      expect(screen.getByText('Saved historical name')).toBeVisible();
      expect(screen.getByText('Unchanged historical description')).toBeVisible();
      expect(screen.queryByText('internal-concurrency-value')).not.toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: 'Saved version details information' }));
      expect(screen.getByRole('button', { name: 'Saved version details' })).toHaveAttribute(
        'aria-expanded',
        'true'
      );
    }
  );

  it('closes the saved snapshot on selection change and shows only that version on reopening', () => {
    const { rerender } = render(view(version));
    fireEvent.click(screen.getByRole('button', { name: 'Saved version details' }));
    expect(screen.getByText('Unchanged historical description')).toBeVisible();
    rerender(
      view({
        ...version,
        eventId: 'v1',
        versionNumber: 1,
        changedFields: [],
        snapshotAfter: { PolicyName: 'First saved name', Description: 'First saved description' },
      })
    );
    expect(screen.getByRole('button', { name: 'Saved version details' })).toHaveAttribute(
      'aria-expanded',
      'false'
    );
    fireEvent.click(screen.getByRole('button', { name: 'Saved version details' }));
    expect(screen.getByText('First saved description')).toBeVisible();
    expect(screen.queryByText('Unchanged historical description')).not.toBeInTheDocument();
  });

  it('does not invent a saved snapshot for histories that only record field changes', () => {
    render(view({ ...version, snapshotAfter: undefined }));
    expect(screen.getByRole('table', { name: 'Changes in version 2' })).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Saved version details' })).not.toBeInTheDocument();
  });

  it.each([
    {
      policyType: 'refund',
      snapshot: {
        FeeHeadScope: 0,
        IncludePaidCharges: true,
        AllowedPayoutMethods: [0],
        MaximumPerRequest: 12500,
        DeductionExplanation: 'Legacy deduction',
      },
      visible: /Include paid charges/i,
      omitted: /Policy code|Maximum per request|Legacy deduction/i,
    },
    {
      policyType: 'collection',
      snapshot: {
        EnableLateFee: true,
        LateFeeType: 'Flat',
        FlatAmount: 400,
        Percentage: 25,
        MaximumLateFeeAmount: 12500,
      },
      visible: /Flat late fee amount/i,
      omitted: /Policy code|Percentage|Maximum late fee amount/i,
    },
    {
      policyType: 'proration',
      snapshot: {
        Rules: [{ FeeHeadName: 'Tuition', RuleType: 1, RoundingMode: 0, ApplyOnAdmission: true }],
      },
      visible: /Daily proration/i,
      omitted: /Policy code|Rounding mode/i,
    },
  ])(
    'shows applicable creation form fields for $policyType',
    ({ policyType, snapshot, visible, omitted }) => {
      render(
        view(
          materializePolicyVersion({
            ...version,
            versionNumber: 1,
            snapshotJson: JSON.stringify({
              PolicyName: 'Saved policy',
              PolicyCode: 'INTERNAL',
              ...snapshot,
            }),
          }),
          policyType
        )
      );

      const changes = screen.getByRole('table', { name: 'Changes in version 1' });
      expect(within(changes).getByText(visible)).toBeVisible();
      expect(within(changes).queryAllByText(omitted)).toHaveLength(0);
      fireEvent.click(screen.getByRole('button', { name: 'Changes' }));
      fireEvent.click(screen.getByRole('button', { name: 'Saved version details' }));
      expect(screen.getByText(visible)).toBeVisible();
      expect(screen.queryAllByText(omitted)).toHaveLength(0);
    }
  );

  it('groups each proration fee head and shows the recorded rules on both sides', () => {
    const schoolFees = {
      FeeHeadId: 'school-fees',
      FeeHeadName: 'School fees',
      RuleType: 'MonthlyCutoff',
      CutoffDay: 15,
      AfterCutoffAction: 'HalfCharge',
      EarlyWithdrawalRuleType: 'FullMonthCharge',
    };
    const tuition = {
      FeeHeadId: 'tuition',
      FeeHeadName: 'Tuition',
      RuleType: 'Daily',
      ApplyOnEarlyWithdrawal: false,
    };
    render(
      view(
        {
          ...version,
          snapshotBefore: { Rules: [{ ...schoolFees, CutoffDay: 10 }] },
          snapshotAfter: { FeeHeadRules: [schoolFees, tuition] },
        },
        'proration'
      )
    );

    const row = screen.getByRole('row', { name: /Fee head configuration/i });
    const [before, after] = within(row).getAllByRole('cell');
    const [previousSchoolFees] = within(before).getAllByRole('listitem');
    const [currentSchoolFees, currentTuition] = within(after).getAllByRole('listitem');

    expect(previousSchoolFees).toHaveTextContent('Monthly cut-off day 10');
    expect(within(after).getAllByRole('listitem')).toHaveLength(2);
    expect(within(currentSchoolFees).getByText('School fees')).toBeVisible();
    expect(within(currentSchoolFees).getByText('Admission')).toBeVisible();
    expect(within(currentSchoolFees).getByText(/Monthly cut-off day 15/).textContent).toBe(
      'Monthly proration\nHalf month charge\nMonthly cut-off day 15'
    );
    expect(within(currentSchoolFees).getByText('Early withdrawal')).toBeVisible();
    expect(currentSchoolFees).toHaveTextContent('Full month charge');
    expect(within(currentTuition).getByText('Tuition')).toBeVisible();
    expect(currentTuition).toHaveTextContent('Daily proration');
    expect(within(currentTuition).getByText('Off')).toBeVisible();
  });

  it('shows only applicable concession form fields in changes and saved details', () => {
    const previous = {
      PolicyName: 'Saved historical name',
      CalculationMethod: 0,
      ValueSource: 0,
      PercentageValue: 15,
      ApplyOn: 3,
      AutoCreateRefund: false,
    };
    const current = {
      ...previous,
      PolicyName: 'Updated concession',
      CalculationMethod: 1,
      ValueSource: 1,
      PercentageValue: 20,
      MaximumFixedAmount: 20000,
      FixedAmount: null,
      ApplyOn: 0,
      AutoCreateRefund: true,
      ShouldAutoCreateRefund: false,
      PolicyCode: 'CON-INTERNAL',
      AcademicYearId: 'internal-year-id',
      RoundingMethod: 1,
      FeeHeadScope: 0,
      ApplicableFeeHeadIds: [],
      ApplicableConcessionTypeIds: [],
      Version: 2,
    };
    render(
      view(
        materializePolicyVersion({
          ...version,
          previousSnapshotJson: JSON.stringify(previous),
          snapshotJson: JSON.stringify(current),
        })
      )
    );

    const changes = screen.getByRole('table', { name: 'Changes in version 2' });
    const percentage = within(changes).getByRole('row', { name: /concession percentage/i });
    expect(within(percentage).getByText('15%')).toBeVisible();
    expect(within(percentage).queryByText('20%')).not.toBeInTheDocument();
    const autoRefund = within(changes).getByRole('row', { name: /automatically create refund/i });
    expect(within(autoRefund).getByText('No')).toBeVisible();
    expect(within(autoRefund).queryByText('Yes')).not.toBeInTheDocument();
    expect(within(changes).getByRole('row', { name: /maximum amount/i })).toBeVisible();
    expect(
      within(changes).queryByRole('row', { name: /^concession amount /i })
    ).not.toBeInTheDocument();
    expect(
      within(changes).queryByRole('row', {
        name: /policy code|rounding|fee head|concession type|academic year|^version /i,
      })
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Changes' }));
    fireEvent.click(screen.getByRole('button', { name: 'Saved version details' }));
    expect(screen.getByText('Updated concession')).toBeVisible();
    expect(screen.getByText('Maximum amount')).toBeVisible();
    expect(
      screen.queryByText(
        /policy code|rounding method|fee head scope|concession percentage|automatically create refund|academic year/i
      )
    ).not.toBeInTheDocument();
  });
});
