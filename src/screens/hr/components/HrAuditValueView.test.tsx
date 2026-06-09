import { it, expect, describe } from 'vitest';
import { render, screen, within } from '@testing-library/react';

import { HrAuditValueView } from './HrAuditValueView';

describe('HrAuditValueView', () => {
  it('renders count summaries as compact chips', () => {
    render(<HrAuditValueView value='{"totalCount":8,"includedCount":3,"removedCount":5}' />);

    expect(screen.getByText('Total 8')).toBeInTheDocument();
    expect(screen.getByText('Included 3')).toBeInTheDocument();
    expect(screen.getByText('Removed 5')).toBeInTheDocument();
    expect(screen.queryByText(/totalCount/)).not.toBeInTheDocument();
  });

  it('renders object payloads as key value rows', () => {
    render(
      <HrAuditValueView value='{"sourcePolicyId":"3a216aea-8273-8586-a1a3-3bffdc298e2e","status":"active"}' />
    );

    expect(screen.getByText('Source Policy ID')).toBeInTheDocument();
    expect(screen.getByText('Linked record')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('active')).toBeInTheDocument();
    expect(screen.queryByText(/3a216aea/)).not.toBeInTheDocument();
  });

  it('renders arrays as multiple structured list rows', () => {
    render(
      <HrAuditValueView
        value={[
          { holidayName: 'Annual day', date: '20250601T00:00:00+00:00' },
          { holidayName: 'Sports day', source: 'manual' },
        ]}
      />
    );

    const list = screen.getByTestId('hr-audit-list');
    expect(within(list).getByText('Annual day')).toBeInTheDocument();
    expect(within(list).getByText('Sports day')).toBeInTheDocument();
    expect(within(list).getByText(/01 Jun 2025/)).toBeInTheDocument();
  });

  it('uses source key context for scalar business dates', () => {
    render(<HrAuditValueView value="20250601T00:00:00+00:00" sourceKey="effectiveFrom" />);

    expect(screen.getByText('01 Jun 2025')).toBeInTheDocument();
    expect(screen.queryByText(/05:30 AM/)).not.toBeInTheDocument();
  });

  it('renders long values without exposing raw JSON or GUIDs', () => {
    render(
      <HrAuditValueView value='{"notes":"Follow up with source 3a216aea-8273-8586-a1a3-3bffdc298e2e for a long policy change explanation."}' />
    );

    expect(screen.getByText('Notes')).toBeInTheDocument();
    expect(screen.getByText(/Linked record/)).toBeInTheDocument();
    expect(screen.queryByText(/3a216aea/)).not.toBeInTheDocument();
    expect(screen.queryByText(/[{}]/)).not.toBeInTheDocument();
  });
});
