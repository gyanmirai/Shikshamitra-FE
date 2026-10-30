import HrProfile from 'src/screens/hr/profile';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';

import { ChangePasswordDialog } from './change-password-dialog';

export type AccountDialog = 'password' | 'profile' | null;

export function AccountDialogs({
  active,
  onClose,
}: {
  active: AccountDialog;
  onClose: () => void;
}) {
  return (
    <>
      {active === 'password' && <ChangePasswordDialog onClose={onClose} />}
      <CustomDialog
        title="User Profile"
        open={active === 'profile'}
        handleClose={onClose}
        maxWidth="lg"
      >
        {active === 'profile' && (
          <Scrollbar sx={{ p: 2 }}>
            <HrProfile />
          </Scrollbar>
        )}
      </CustomDialog>
    </>
  );
}
