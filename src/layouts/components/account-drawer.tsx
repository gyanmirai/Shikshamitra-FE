'use client';

import type { RootState } from 'src/redux/store';
import type { ButtonBaseProps } from '@mui/material/ButtonBase';

import { useSelector } from 'react-redux';
import { useSession } from 'next-auth/react';
import { useRouter } from 'src/routes/hooks';
import { useId, useRef, useState } from 'react';

import { AccountButton } from './account-button';
import { AccountDialogs } from './account-dialogs';
import { AccountMenuContent } from './account-menu-content';
import { AccountMenuSurface } from './account-menu-surface';
import { hasAccountRole, getAccountIdentity } from './account-identity';

import type { AccountDialog } from './account-dialogs';
import type { AccountProfile } from './account-identity';

export type AccountDrawerProps = ButtonBaseProps & {
  institutionName?: string;
  data?: { label: string; href: string; icon?: React.ReactNode; info?: React.ReactNode }[];
};

export function AccountDrawer({ data: _data, institutionName, sx, ...other }: AccountDrawerProps) {
  const menuId = useId();
  const trigger = useRef<HTMLButtonElement>(null);
  const router = useRouter();
  const { employee, sessionContext } = useSelector((state: RootState) => state.auth);
  const { data } = useSession();
  const session = data as { profile?: AccountProfile } | null;
  const profile = session?.profile;
  const identity = getAccountIdentity(profile, employee);
  const canUseSelfLeaveCenter =
    sessionContext?.accountMode === 'tenant' &&
    !hasAccountRole(profile?.role, 'admin') &&
    !hasAccountRole(profile?.role, 'student');
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [activeDialog, setActiveDialog] = useState<AccountDialog>(null);

  const closeMenu = () => setAnchorEl(null);
  const openDialog = (dialog: AccountDialog) => {
    closeMenu();
    setActiveDialog(dialog);
  };
  const closeDialog = () => {
    setActiveDialog(null);
    trigger.current?.focus();
  };

  return (
    <>
      <AccountButton
        ref={trigger}
        open={Boolean(anchorEl)}
        identity={identity}
        aria-controls={anchorEl ? menuId : undefined}
        onClick={(event) => setAnchorEl(event.currentTarget)}
        sx={sx}
        {...other}
      />
      <AccountMenuSurface
        id={menuId}
        anchorEl={anchorEl}
        onClose={closeMenu}
        disableRestoreFocus={Boolean(activeDialog)}
      >
        <AccountMenuContent
          identity={identity}
          titleId={`${menuId}-title`}
          institutionName={institutionName}
          canUseSelfLeaveCenter={canUseSelfLeaveCenter}
          onClose={closeMenu}
          onPassword={() => openDialog('password')}
          onProfile={() => openDialog('profile')}
          onLeaveCenter={() => {
            closeMenu();
            router.push('/dashboard/my-leave');
          }}
        />
      </AccountMenuSurface>
      <AccountDialogs active={activeDialog} onClose={closeDialog} />
    </>
  );
}
