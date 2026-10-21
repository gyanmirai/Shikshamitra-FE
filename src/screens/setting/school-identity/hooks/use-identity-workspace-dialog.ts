import { useState, useEffect } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import { useUpdateSchoolIdentityMutation } from 'src/redux/InstituteSetup/schoolIdentityApi';

import { identityError, inheritedChoices } from '../identity-form';

import type { IdentityProfile } from '../types';
import type { SchoolIdentityWorkspace } from './use-school-identity';

type WorkspaceDialog = {
  kind: 'edit' | 'copy' | 'reset' | 'history';
  profile: IdentityProfile | null;
  scope: string;
};

export function useIdentityWorkspaceDialog(workspace: SchoolIdentityWorkspace) {
  const { tab, boardId, mediumId, organizationId, context } = workspace;
  const scope = [tab, boardId, mediumId, organizationId].join(':');
  const [selection, setSelection] = useState<WorkspaceDialog | null>(null);
  const [failure, setFailure] = useState({ scope, message: '' });
  const [save, saving] = useUpdateSchoolIdentityMutation();
  useEffect(() => {
    setSelection(null);
    setFailure({ scope, message: '' });
  }, [scope]);
  const dialog = selection?.scope === scope ? selection : null;
  const open = (kind: WorkspaceDialog['kind'], profile: IdentityProfile | null = null) =>
    setSelection({ kind, profile, scope });
  const close = () => setSelection((current) => (current?.scope === scope ? null : current));
  const resetOverride = async () => {
    const profile = dialog?.kind === 'reset' ? dialog.profile : null;
    if (!profile) return;
    try {
      await save({
        ...context,
        concurrencyStamp: profile.concurrencyStamp,
        choices: inheritedChoices(profile.canAccessSignature),
      }).unwrap();
      close();
      shikshaMitraToast.success({ message: 'Override reset to inherited settings.' });
    } catch (error) {
      close();
      setFailure({ scope, message: identityError(error) });
    }
  };
  return {
    dialog,
    open,
    close,
    resetOverride,
    saving: saving.isLoading,
    error: failure.scope === scope ? failure.message : '',
  };
}
