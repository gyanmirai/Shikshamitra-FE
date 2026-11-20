import { useState } from 'react';
import { it, vi, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

import { NavList as MiniNav } from './mini/nav-list';
import { NavList as VerticalNav } from './vertical/nav-list';
import { NavList as HorizontalNav } from './horizontal/nav-list';

const state = vi.hoisted(() => ({ permissions: [] as { name: string; isGranted: boolean }[] }));
vi.mock('react-redux', () => ({ useSelector: (select: any) => select({ auth: state }) }));
vi.mock('src/routes/hooks', () => ({ usePathname: () => '/library/receiving' }));
vi.mock('./vertical/nav-item', () => ({
  NavItem: ({ title }: any) => <button type="button">{title}</button>,
}));
vi.mock('./horizontal/nav-item', () => ({
  NavItem: ({ title }: any) => <button type="button">{title}</button>,
}));
vi.mock('./mini/nav-item', () => ({
  NavItem: ({ title }: any) => <button type="button">{title}</button>,
}));
vi.mock('./styles', () => ({
  NavUl: ({ children }: any) => <ul>{children}</ul>,
  NavLi: ({ children }: any) => <li>{children}</li>,
  NavCollapse: ({ children, in: open }: any) => (open ? <div>{children}</div> : null),
}));
const receiving = {
  title: 'Stock Receiving',
  path: '/library/receiving',
  permissionName: 'Library.Receiving.View',
  requiredAllPermissions: ['Library.Receiving.View', 'Library.AllBooks.View'],
};

it.each([VerticalNav, HorizontalNav, MiniNav])(
  'enforces required read prerequisites in every navigation layout',
  (Navigation) => {
    function Harness() {
      const [menus, setMenus] = useState<{ action: string; depth: number }[]>([]);
      return (
        <Navigation
          data={receiving}
          depth={1}
          currentOpenMenu={menus}
          setCurrentOpenMenu={setMenus}
        />
      );
    }
    state.permissions = [{ name: 'Library.Receiving.View', isGranted: true }];
    const view = render(<Harness />);
    expect(screen.queryByRole('button', { name: 'Stock Receiving' })).not.toBeInTheDocument();
    state.permissions = ['Library.Receiving.View', 'Library.AllBooks.View'].map((name) => ({
      name,
      isGranted: true,
    }));
    view.rerender(<Harness />);
    expect(screen.getByRole('button', { name: 'Stock Receiving' })).toBeVisible();
  }
);
