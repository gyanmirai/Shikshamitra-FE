import React from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { vi, it, expect, describe, afterEach, beforeEach } from 'vitest';
import { render, screen, cleanup, waitFor, fireEvent } from '@testing-library/react';

import SubLayout from './index';

const state = vi.hoisted(() => ({ compact: true, pathname: '/student/student-i-card' }));
vi.mock('next/navigation', () => ({ usePathname: () => state.pathname }));
vi.mock('react-redux', () => ({
  useSelector: () => ({ permissions: [], loading: false, permissionsInitialized: true }),
}));
vi.mock('@mui/material/useMediaQuery', () => ({ default: () => state.compact }));
vi.mock('src/layouts/config-nav-dashboard', () => ({
  navSubData: () => ({ '/student': [{ items: [{ title: 'I-Card' }] }] }),
}));
vi.mock('../iconify', () => ({ Iconify: () => null }));
vi.mock('../scrollbar', async () => {
  const { forwardRef } = await import('react');
  return {
    Scrollbar: forwardRef<HTMLDivElement, { children: React.ReactNode }>(({ children }, ref) => (
      <div ref={ref}>{children}</div>
    )),
  };
});
vi.mock('../nav-section', () => ({
  NavSectionVertical: () => <nav aria-label="Module destinations">I-Card</nav>,
}));

const theme = createTheme({ cssVariables: true });
const workspace = () => (
  <ThemeProvider theme={theme}>
    <SubLayout>
      <h1>Issued Cards</h1>
    </SubLayout>
  </ThemeProvider>
);

beforeEach(() => {
  state.compact = true;
  state.pathname = '/student/student-i-card';
});
afterEach(cleanup);

describe('responsive module navigation', () => {
  it('keeps phone content free of permanent navigation until the drawer opens', () => {
    render(workspace());
    expect(screen.getByRole('heading', { name: 'Issued Cards' })).toBeVisible();
    expect(
      screen.queryByRole('navigation', { name: 'Module destinations' })
    ).not.toBeInTheDocument();
    expect(screen.getByLabelText('Open Student navigation')).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Unpin' })).not.toBeInTheDocument();
  });

  it('opens and dismisses the existing phone drawer without losing content', async () => {
    render(workspace());
    fireEvent.click(screen.getByLabelText('Open Student navigation'));
    expect(screen.getByRole('navigation', { name: 'Module destinations' })).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Close Student navigation' }));
    await waitFor(() => expect(screen.queryByRole('navigation')).not.toBeInTheDocument());
    expect(screen.getByRole('heading', { name: 'Issued Cards' })).toBeVisible();
  });

  it('dismisses the phone drawer after a destination changes', async () => {
    const view = render(workspace());
    fireEvent.click(screen.getByLabelText('Open Student navigation'));
    state.pathname = '/student/profile';
    view.rerender(workspace());
    await waitFor(() => expect(screen.queryByRole('navigation')).not.toBeInTheDocument());
  });

  it('retains desktop navigation and pin controls', () => {
    state.compact = false;
    render(workspace());
    expect(screen.getByRole('navigation', { name: 'Module destinations' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Unpin' })).toBeInTheDocument();
  });
});
