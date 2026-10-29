import { render, screen } from '@testing-library/react';
import { it, vi, expect, describe, beforeEach } from 'vitest';

import FinancePrerequisiteState from './FinancePrerequisiteState';

const state = vi.hoisted(() => ({ permissions: [] as { name: string; isGranted: boolean }[] }));
vi.mock('react-redux', () => ({ useSelector: (select: any) => select({ auth: state }) }));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
const grant = (...names: string[]) => {
  state.permissions = names.map((name) => ({ name, isGranted: true }));
};

describe('FinancePrerequisiteState setup permissions', () => {
  beforeEach(() => grant());

  it('offers calendar setup only when the user can edit its dates', () => {
    grant('InstituteSetup.AcademicSetup.View');
    const view = render(<FinancePrerequisiteState requirements={[{ key: 'board-calendar' }]} />);
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.getByText(/Ask your administrator/)).toBeVisible();
    grant('InstituteSetup.AcademicSetup.View', 'InstituteSetup.AcademicSetup.Edit');
    view.rerender(<FinancePrerequisiteState requirements={[{ key: 'board-calendar' }]} />);
    expect(screen.getByRole('link', { name: 'Open academic setup' })).toHaveAttribute(
      'href',
      '/setting/academic-setup'
    );
  });

  it('shows a single administrator instruction when all setup actions are unavailable', () => {
    render(
      <FinancePrerequisiteState requirements={[{ key: 'fee-head' }, { key: 'bank-account' }]} />
    );
    expect(screen.getAllByText(/Ask your administrator/)).toHaveLength(1);
  });
});
