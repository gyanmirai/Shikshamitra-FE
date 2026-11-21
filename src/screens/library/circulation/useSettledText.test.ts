import { it, expect } from 'vitest';
import { waitFor, renderHook } from '@testing-library/react';

import { useSettledText } from './useSettledText';

it('settles independent accession/member fields without canceling the other lookup', async () => {
  const { result, rerender } = renderHook(
    ({ copy, member }) => [useSettledText(copy), useSettledText(member)],
    { initialProps: { copy: 'old-copy', member: 'old-member' } }
  );
  rerender({ copy: 'new-copy', member: 'new-member' });
  await waitFor(() => expect(result.current).toEqual(['new-copy', 'new-member']));
});
