import { useRef, useState, useEffect } from 'react';

import type { IdentityCardPhotoEdit } from '../types';

export function useCardPhotoEdits(scope: string, recordIds: string[], onError?: (message: string) => void) {
  const [draft, setDraft] = useState<{ scope: string; edits: IdentityCardPhotoEdit[] }>({ scope, edits: [] });
  const key = JSON.stringify(recordIds);
  const identity = `${scope}:${key}`;
  const current = useRef({ identity, token: {} });
  if (current.current.identity !== identity) current.current = { identity, token: {} };
  const { token } = current.current;
  useEffect(() => {
    const ids: string[] = JSON.parse(key);
    setDraft((previous) => {
      if (previous.scope !== scope) return { scope, edits: [] };
      const edits = previous.edits.filter((edit) => ids.includes(edit.recordId));
      return edits.length === previous.edits.length ? previous : { scope, edits };
    });
  }, [scope, key]);
  const photoEdits = draft.scope === scope ? draft.edits.filter((edit) => recordIds.includes(edit.recordId)) : [];
  const onPhotoEdit = (edit: IdentityCardPhotoEdit) => {
    if (current.current.token !== token || !recordIds.includes(edit.recordId)) return;
    const next = [...photoEdits.filter((item) => item.recordId !== edit.recordId), edit];
    const total = next.reduce((bytes, item) => bytes + Math.ceil((item.imageData.split(',')[1]?.length ?? 0) * 3 / 4), 0);
    if (total > 8 * 1024 * 1024) {
      onError?.('Edited photos exceed 8 MB. Export a smaller selected group.'); return;
    }
    setDraft({ scope, edits: next });
  };
  return { photoEdits, onPhotoEdit };
}
