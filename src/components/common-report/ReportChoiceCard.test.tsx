import { it, vi, expect } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';

import { ReportChoiceCard } from './ReportChoiceCard';

vi.mock('@iconify/react', () => ({ Icon: () => null }));

it('lets Curriculum and Institute Setup users select a report using the keyboard', async () => {
  const user = userEvent.setup();
  let selected = '';
  render(<ReportChoiceCard report={{ id: 'hierarchy', name: 'Academic hierarchy', categoryId: 'setup', icon: '', render: () => null }}
    selected={false} onSelect={(report) => { selected = report.id; }} />);
  const button = screen.getByRole('button', { name: 'Academic hierarchy' });
  await user.tab();
  expect(document.activeElement).toBe(button);
  await user.keyboard('{Enter}');
  expect(selected).toBe('hierarchy');
});
