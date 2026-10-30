import { useState } from 'react';
import { _api } from '@iconify/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from 'src/redux/auth/authSlice';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { it, vi, expect, afterAll, afterEach, beforeAll } from 'vitest';
import { defaultSettings } from 'src/components/settings/config-settings';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

import { AccountButton } from './account-button';
import { getAccountIdentity } from './account-identity';
import { AccountMenuContent } from './account-menu-content';
import { AccountMenuSurface } from './account-menu-surface';

const theme = createTheme(defaultSettings);
const identity = getAccountIdentity({
  preferred_username: 'admin-ddvs',
  email: 'admin-ddvs@ddvs.com',
  role: 'admin',
});
const onPassword = vi.fn();
const onProfile = vi.fn();
const onLeaveCenter = vi.fn();
const iconFetch = _api.getFetch();

beforeAll(() => {
  _api.setFetch(async (input) => {
    const url = new URL(String(input));
    return new Response(
      JSON.stringify({
        prefix: url.pathname.slice(1, -5),
        icons: {},
        not_found: url.searchParams.get('icons')?.split(',') || [],
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  });
});

afterAll(() => {
  if (iconFetch) _api.setFetch(iconFetch);
});

function Harness({ staff = false }: { staff?: boolean }) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  return (
    <>
      <AccountButton
        identity={identity}
        open={Boolean(anchorEl)}
        onClick={(event) => setAnchorEl(event.currentTarget)}
      />
      <AccountMenuSurface
        id="test-account"
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        disableRestoreFocus={false}
      >
        <AccountMenuContent
          identity={identity}
          titleId="test-account-title"
          institutionName="DDVS"
          canUseSelfLeaveCenter={staff}
          onClose={() => setAnchorEl(null)}
          onPassword={onPassword}
          onProfile={onProfile}
          onLeaveCenter={onLeaveCenter}
        />
      </AccountMenuSurface>
    </>
  );
}

function view(desktop: boolean, staff = false) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn((query: string) => ({
      matches: desktop && query.includes('min-width:900px'),
      media: query,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))
  );
  const store = configureStore({ reducer: { auth: authReducer } });
  return render(
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <Harness staff={staff} />
      </ThemeProvider>
    </Provider>
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

it('shows the account name, role and email in the header control', () => {
  view(true);
  const trigger = screen.getByRole('button', { name: 'Account menu for admin-ddvs' });
  expect(trigger).toHaveTextContent('admin-ddvs');
  expect(trigger).toHaveTextContent('admin');
  expect(trigger).toHaveTextContent('admin-ddvs@ddvs.com');
  expect(trigger).toHaveAttribute('aria-expanded', 'false');
});

it('opens an anchored desktop popover and restores focus after Escape', async () => {
  view(true);
  const trigger = screen.getByRole('button', { name: 'Account menu for admin-ddvs' });
  trigger.focus();
  fireEvent.click(trigger);
  const dialog = await screen.findByRole('dialog', { name: 'My Account' });
  expect(dialog).toHaveClass('MuiPopover-paper');
  expect(screen.getByRole('menuitem', { name: 'Change Password' })).toBeVisible();
  expect(screen.getByRole('button', { name: 'Logout' })).toBeVisible();
  expect(screen.queryByRole('menuitem', { name: 'Profile' })).not.toBeInTheDocument();
  fireEvent.keyDown(dialog, { key: 'Escape' });
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  expect(trigger).toHaveFocus();
});

it('opens a bottom drawer on mobile and closes from its explicit close control', async () => {
  view(false);
  fireEvent.click(screen.getByRole('button', { name: 'Account menu for admin-ddvs' }));
  const dialog = await screen.findByRole('dialog', { name: 'My Account' });
  expect(dialog).toHaveClass('MuiDrawer-paper');
  expect(dialog.closest('.MuiDrawer-root')).toHaveClass('MuiDrawer-anchorBottom');
  expect(dialog).toHaveTextContent('admin-ddvs@ddvs.com');
  fireEvent.click(screen.getByRole('button', { name: 'Close account menu' }));
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
});

it('preserves staff profile and leave actions along with password changes', async () => {
  view(true, true);
  fireEvent.click(screen.getByRole('button', { name: 'Account menu for admin-ddvs' }));
  await screen.findByRole('dialog', { name: 'My Account' });
  fireEvent.click(screen.getByRole('menuitem', { name: 'Profile' }));
  fireEvent.click(screen.getByRole('menuitem', { name: 'Leave Center' }));
  fireEvent.click(screen.getByRole('menuitem', { name: 'Change Password' }));
  expect(onProfile).toHaveBeenCalledOnce();
  expect(onLeaveCenter).toHaveBeenCalledOnce();
  expect(onPassword).toHaveBeenCalledOnce();
});
