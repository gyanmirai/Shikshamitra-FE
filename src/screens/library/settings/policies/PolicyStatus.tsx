import type { LibraryPolicyState } from 'src/redux/library/policy-types';

import { Label } from 'src/components/label';

export function PolicyStatus({
  status,
  version,
}: {
  status: LibraryPolicyState;
  version?: number;
}) {
  return (
    <Label color={status === 1 ? 'success' : status === 0 ? 'info' : 'default'}>
      {['Draft', 'Published', 'Archived'][status]}
      {version ? ` · v${version}` : ''}
    </Label>
  );
}
