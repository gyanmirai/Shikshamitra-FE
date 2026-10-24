import { useState } from 'react';
import { it, vi, expect, describe } from 'vitest';
import { render, screen, within, fireEvent } from '@testing-library/react';

import ConcessionRequestWorkspace from './ConcessionRequestWorkspace';
import { concessionInstallmentLabel } from './concessionInstallmentLabel';
import { policy, context, preview } from '../../../../../e2e/fixtures/concession-request-ui/data';

vi.mock('src/components/iconify', () => ({ Iconify: () => null }));

describe('fee-head installment selection', () => {
  function Workspace({ loading = false, empty = false, unavailable = false }) {
    const [selectedIds, setSelectedIds] = useState(['tuition']);
    return (
      <ConcessionRequestWorkspace
        policyFields={<span>Policy fields</span>}
        feeHeads={
          empty
            ? []
            : [
                { feeHeadId: 'tuition', feeHeadName: 'School tuition', amount: 5000 },
                { feeHeadId: 'school', feeHeadName: 'General school fees', amount: 1000 },
              ]
        }
        installments={context.eligibleDueFees}
        selectedIds={selectedIds}
        onToggle={(id) =>
          setSelectedIds((ids) =>
            ids.includes(id) ? ids.filter((value) => value !== id) : [...ids, id]
          )
        }
        preview={unavailable ? null : preview}
        policy={{ ...policy, valueSource: 'PolicyFixed', percentageValue: 8 }}
        loading={loading}
        missingDocumentNames={['Income proof']}
        documents={<span>Upload supporting evidence</span>}
        feeSelectionMessage={empty ? <span>No eligible fees</span> : undefined}
      />
    );
  }

  it('inspects a fee without changing selected fees or the server request totals', () => {
    render(<Workspace />);
    expect(screen.getByRole('checkbox', { name: 'School tuition' })).toBeChecked();
    const details = screen.getByRole('complementary', { name: 'Fee details and request summary' });
    expect(
      within(details).getByRole('list', { name: 'School tuition installments' })
    ).toBeVisible();
    expect(within(details).getByText(/4,600/)).toBeVisible();
    const inspect = screen.getByRole('button', { name: 'Inspect General school fees' });
    fireEvent.click(inspect);
    expect(inspect).toHaveAttribute('aria-pressed', 'true');
    expect(details.id).toBe(inspect.getAttribute('aria-controls'));
    expect(within(details).getByRole('heading', { name: 'General school fees' })).toBeVisible();
    expect(screen.getByRole('checkbox', { name: 'General school fees' })).not.toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'School tuition' })).toBeChecked();
    expect(within(details).getByText(/4,600/)).toBeVisible();
    expect(
      within(details).getByText('Select this fee to include it in the request.')
    ).toBeVisible();
  });

  it('updates selection independently and names the document blocking submission', () => {
    render(<Workspace />);
    fireEvent.click(screen.getByRole('checkbox', { name: 'School tuition' }));
    expect(screen.getByRole('checkbox', { name: 'School tuition' })).not.toBeChecked();
    expect(screen.getByText('0 fee categories included')).toBeVisible();
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Attach Income proof to enable submission.'
    );
    expect(screen.getByText('8% reduction applied automatically to selected fees')).toBeVisible();
  });

  it('keeps the panel present while calculating and does not invent preview totals', () => {
    render(<Workspace loading unavailable />);
    expect(screen.getByRole('heading', { name: 'Entire Request' })).toBeVisible();
    expect(screen.getByRole('status')).toHaveTextContent('Calculating fee impact…');
    expect(screen.queryByText(/4,600/)).not.toBeInTheDocument();
  });

  it('shows the empty fee state with the request summary still available', () => {
    render(<Workspace empty unavailable />);
    expect(screen.getByText('No eligible fees')).toBeVisible();
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Entire Request' })).toBeVisible();
  });
  it.each([
    ['Jun 2026', 2026, 'Jun 2026'],
    ['Jun', 2026, 'Jun 2026'],
    ['Half-Yearly 1', 2026, 'Half-Yearly 1 2026'],
    ['Jun 2026 2026', 2026, 'Jun 2026'],
  ])('formats %s with a single year', (label, year, expected) => {
    expect(concessionInstallmentLabel(label, Number(year))).toBe(expected);
  });
});
