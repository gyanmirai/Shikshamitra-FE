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
    const selectedCard = screen.getByRole('checkbox', { name: 'School tuition' }).closest('li')!;
    expect(within(selectedCard).getByRole('button', { name: 'Fee Breakdown' })).toHaveAttribute(
      'aria-expanded',
      'true'
    );
    const summary = screen.getByRole('complementary', {
      name: 'Concession impact and supporting documents',
    });
    expect(within(summary).getByText(/4,600/)).toBeVisible();
    const inspect = screen.getByRole('button', { name: 'Inspect General school fees' });
    fireEvent.click(inspect);
    expect(inspect).toHaveAttribute('aria-pressed', 'true');
    expect(inspect).toHaveAttribute('aria-expanded', 'true');
    const details = within(inspect.closest('li')!).getByRole('region', { name: 'Fee details' });
    expect(inspect.closest('li')).toContainElement(details);
    expect(details.id).toBe(inspect.getAttribute('aria-controls'));
    expect(
      within(inspect.closest('li')!).getByRole('heading', { name: 'General school fees' })
    ).toBeVisible();
    expect(screen.getByRole('checkbox', { name: 'General school fees' })).not.toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'School tuition' })).toBeChecked();
    expect(within(summary).getByText(/4,600/)).toBeVisible();
    expect(
      within(details).getByText('Select this fee to include it in the request.')
    ).toBeVisible();
  });

  it('collapses the inline breakdown without changing fee selection', () => {
    render(<Workspace />);
    const checkbox = screen.getByRole('checkbox', { name: 'School tuition' });
    const card = checkbox.closest('li')!;
    const breakdown = within(card).getByRole('button', { name: 'Fee Breakdown' });
    fireEvent.click(breakdown);
    expect(breakdown).toHaveAttribute('aria-expanded', 'false');
    expect(checkbox).toBeChecked();
    fireEvent.click(breakdown);
    expect(within(card).getByRole('region', { name: 'Fee details' })).toBeVisible();
    expect(checkbox).toBeChecked();
  });

  it('updates selection independently and names the document blocking submission', () => {
    render(<Workspace />);
    fireEvent.click(screen.getByRole('checkbox', { name: 'School tuition' }));
    expect(screen.getByRole('checkbox', { name: 'School tuition' })).not.toBeChecked();
    expect(screen.getByText('0 selected fees')).toBeVisible();
    expect(screen.getByText('Required')).toBeVisible();
    expect(screen.getByText('Upload supporting evidence')).toBeVisible();
  });

  it('keeps the panel present while calculating and does not invent preview totals', () => {
    render(<Workspace loading unavailable />);
    expect(screen.getByRole('heading', { name: 'Concession Impact' })).toBeVisible();
    expect(screen.getByRole('status')).toHaveTextContent('Calculating fee impact…');
    expect(screen.queryByText(/4,600/)).not.toBeInTheDocument();
  });

  it('shows the empty fee state with the request summary still available', () => {
    render(<Workspace empty unavailable />);
    expect(screen.getByText('No eligible fees')).toBeVisible();
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Concession Impact' })).toBeVisible();
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
