import { useMemo, useState, useCallback } from 'react';

// ----------------------------------------------------------------------

export type UseCopyToClipboardReturn = {
  copy: CopyFn;
  copiedText: CopiedValue;
};

export type CopiedValue = string | null;

export type CopyFn = (text: string) => Promise<boolean>;

export function useCopyToClipboard(): UseCopyToClipboardReturn {
  const [copiedText, setCopiedText] = useState<CopiedValue>(null);

  const copy: CopyFn = useCallback(
    async (text) => {
      if (!navigator?.clipboard) {
        return false;
      }

      try {
        await navigator.clipboard.writeText(text);
        setCopiedText(text);
        return true;
      } catch (error) {
        setCopiedText(null);
        return false;
      }
    },
    [setCopiedText]
  );

  const memoizedValue = useMemo(() => ({ copy, copiedText }), [copy, copiedText]);

  return memoizedValue;
}
