import React, { useState } from 'react';
import { it, vi, expect, describe, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';

import { NavList } from './nav-list';

import type { NavItemBaseProps } from '../types';

const route = vi.hoisted(() => ({ pathname: '/finance/settings/fee-category' }));
vi.mock('src/routes/hooks', () => ({ usePathname: () => route.pathname }));
vi.mock('react-redux', () => ({ useSelector: () => ({ permissions: {} }) }));
vi.mock('src/utils/permissions', () => ({ hasNavigationPermission: () => true }));
vi.mock('./nav-item', () => ({
  NavItem: ({ title, active, open, hasChild, onClick }: any) => (
    <button
      type="button"
      aria-expanded={hasChild ? open : undefined}
      data-active={active}
      onClick={onClick}
    >
      {title}
    </button>
  ),
}));
vi.mock('../styles', () => ({
  NavUl: ({ children }: any) => <ul>{children}</ul>,
  NavLi: ({ children }: any) => <li>{children}</li>,
  NavCollapse: ({ children, in: open }: any) => (open ? <div>{children}</div> : null),
}));

const fees: NavItemBaseProps = {
  title: 'Fees',
  path: '/finance/fees',
  _action: 'fees',
  children: [
    {
      title: 'Settings',
      path: '',
      _action: 'settings',
      children: [
        { title: 'Fee Category', path: '/finance/settings/fee-category', _action: 'fee-category' },
      ],
    },
  ],
};

function Navigation({ data = fees }: { data?: NavItemBaseProps }) {
  const [menus, setMenus] = useState<{ action: string; depth: number }[]>([]);
  return (
    <NavList
      data={data}
      depth={1}
      isSubLayout
      currentOpenMenu={menus}
      setCurrentOpenMenu={setMenus}
    />
  );
}

afterEach(cleanup);

describe('active navigation ancestors', () => {
  it.each(['/hr/payroll/payslip-generation', '/hr/payroll/setting/payslip-statement-settings'])(
    'keeps Overview unselected on %s while revealing the payroll ancestry',
    (pathname) => {
      route.pathname = pathname;
      render(
        <Navigation
          data={{
            title: 'Payroll Management',
            path: '/hr/payroll',
            _action: 'payroll',
            children: [
              { title: 'Overview', path: '/hr/payroll', exactMatch: true },
              { title: 'Payslips', path: '/hr/payroll/payslip-generation' },
              {
                title: 'Settings',
                path: '/hr/payroll/setting',
                children: [
                  { title: 'Payslip & statement settings', path: '/hr/payroll/setting/payslip-statement-settings' },
                ],
              },
            ],
          }}
        />
      );
      expect(screen.getByRole('button', { name: 'Overview' })).toHaveAttribute(
        'data-active',
        'false'
      );
      expect(
        screen.getByRole('button', {
          name: pathname.includes('/setting/') ? 'Payslip & statement settings' : 'Payslips',
        })
      ).toHaveAttribute('data-active', 'true');
    }
  );

  it('selects Overview on the exact payroll root', () => {
    route.pathname = '/hr/payroll/';
    render(<Navigation data={{ title: 'Overview', path: '/hr/payroll', exactMatch: true }} />);
    expect(screen.getByRole('button', { name: 'Overview' })).toHaveAttribute('data-active', 'true');
  });
  it('opens every ancestor on direct access and allows active groups to collapse and reopen', () => {
    route.pathname = '/finance/settings/fee-category/';
    render(<Navigation />);
    expect(screen.getByRole('button', { name: 'Fee Category' })).toHaveAttribute(
      'data-active',
      'true'
    );
    fireEvent.click(screen.getByRole('button', { name: 'Settings' }));
    expect(screen.getByRole('button', { name: 'Settings' })).toHaveAttribute(
      'aria-expanded',
      'false'
    );
    expect(screen.queryByRole('button', { name: 'Fee Category' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Settings' }));
    fireEvent.click(screen.getByRole('button', { name: 'Fees' }));
    expect(screen.getByRole('button', { name: 'Fees' })).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByRole('button', { name: 'Fees' })).toHaveAttribute('data-active', 'true');
    expect(screen.queryByRole('button', { name: 'Settings' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Fees' }));
    expect(screen.getByRole('button', { name: 'Fees' })).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('button', { name: 'Settings' })).toHaveAttribute(
      'aria-expanded',
      'true'
    );
    expect(screen.getByRole('button', { name: 'Fee Category' })).toHaveAttribute(
      'data-active',
      'true'
    );
  });

  it('still lets unrelated groups open and close', () => {
    route.pathname = '/finance/dashboard';
    render(<Navigation />);
    fireEvent.click(screen.getByRole('button', { name: 'Fees' }));
    expect(screen.getByRole('button', { name: 'Settings' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Fees' }));
    expect(screen.queryByRole('button', { name: 'Settings' })).not.toBeInTheDocument();
  });

  it('updates ancestry on route changes without leaving the previous branch open', () => {
    route.pathname = '/finance/settings/fee-category';
    const view = render(<Navigation />);
    route.pathname = '/finance/dashboard';
    view.rerender(<Navigation />);
    expect(screen.queryByRole('button', { name: 'Fee Category' })).not.toBeInTheDocument();
    route.pathname = '/finance/settings/fee-category/detail';
    view.rerender(<Navigation />);
    expect(screen.getByRole('button', { name: 'Fee Category' })).toHaveAttribute(
      'data-active',
      'true'
    );
  });

  it('applies the same behavior to Academics', () => {
    route.pathname = '/academic/lesson-plan';
    render(
      <Navigation
        data={{
          title: 'Curriculum',
          _action: 'curriculum',
          children: [{ title: 'Lesson Plan', path: '/academic/lesson-plan' }],
        }}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Curriculum' }));
    expect(screen.queryByRole('button', { name: 'Lesson Plan' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Curriculum' }));
    expect(screen.getByRole('button', { name: 'Lesson Plan' })).toHaveAttribute(
      'data-active',
      'true'
    );
  });

  it('keeps Admissions collapsed on rerender but reveals it again when navigating', () => {
    const admissions: NavItemBaseProps = {
      title: 'Admissions',
      path: '/student/admissions',
      _action: 'student-admissions',
      children: [
        { title: 'Inquiries', path: '/student/admissions/inquiries' },
        { title: 'Applications', path: '/student/admissions/applications' },
      ],
    };
    route.pathname = '/student/admissions/inquiries';
    const view = render(<Navigation data={admissions} />);
    fireEvent.click(screen.getByRole('button', { name: 'Admissions' }));
    view.rerender(<Navigation data={admissions} />);
    expect(screen.getByRole('button', { name: 'Admissions' })).toHaveAttribute(
      'aria-expanded',
      'false'
    );
    expect(screen.queryByRole('button', { name: 'Inquiries' })).not.toBeInTheDocument();

    route.pathname = '/student/admissions/applications';
    view.rerender(<Navigation data={admissions} />);
    expect(screen.getByRole('button', { name: 'Applications' })).toHaveAttribute(
      'data-active',
      'true'
    );

    route.pathname = '/student/admissions/inquiries';
    view.rerender(<Navigation data={admissions} />);
    expect(screen.getByRole('button', { name: 'Inquiries' })).toHaveAttribute(
      'data-active',
      'true'
    );
  });
});
