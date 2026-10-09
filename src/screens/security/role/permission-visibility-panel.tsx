import PermissionWorkspace from './permission-workspace';

import type { GrantProvider } from './permission-catalogue';
import type { usePermissionDraft } from './use-permission-draft';

export default function PermissionVisibilityPanel({
  draft,
  provider,
  subjectName,
}: {
  draft: ReturnType<typeof usePermissionDraft>;
  provider: GrantProvider;
  subjectName?: string;
}) {
  return draft.catalogue ? (
    <PermissionWorkspace
      visibility
      catalogue={draft.catalogue}
      provider={provider}
      states={draft.states}
      setStates={draft.setStates}
      disabled={draft.blocked}
      subjectName={subjectName}
    />
  ) : null;
}
