import { changesConflict, changesPersisted } from './permission-draft-state';

import type { PermissionChange } from './permission-draft-state';
import type { GrantProvider, PermissionCatalogue } from './permission-catalogue';

export async function savePermissionDraft({ catalogue, provider, changes, refetch, persist, isActive }: {
  catalogue: PermissionCatalogue;
  provider: GrantProvider;
  changes: PermissionChange[];
  refetch: () => Promise<PermissionCatalogue>;
  persist: (changes: PermissionChange[]) => Promise<unknown>;
  isActive: () => boolean;
}) {
  const fresh = await refetch();
  if (!isActive()) return false;
  if (changesConflict(catalogue, fresh, provider, changes)) {
    throw new Error('Permissions changed on the server. Your draft is preserved. Reload and review before saving again.');
  }
  if (changes.length) await persist(changes);
  const saved = await refetch();
  if (!isActive()) return false;
  if (!changesPersisted(saved, provider, changes)) {
    throw new Error('The saved permissions could not be verified. Your draft is preserved. Reload and review the current access.');
  }
  return true;
}
