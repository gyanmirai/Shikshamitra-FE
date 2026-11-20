import type { LibraryPolicyOptions } from 'src/redux/library/policy-types';

import { Alert, Button, Skeleton } from '@mui/material';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { useGetLibraryPolicyQuery } from 'src/redux/library/policies-api';

import { PolicyStatus } from './PolicyStatus';
import { PolicyDetails } from './PolicyDetails';
import { PolicyDraftDrawer } from './PolicyDraftDrawer';
import { LibraryFormDrawer } from './LibraryFormDrawer';

export function PolicyRecordDrawer({
  id,
  edit,
  academicYearId,
  options,
  onClose,
}: {
  id: string;
  edit: boolean;
  academicYearId: string;
  options: LibraryPolicyOptions;
  onClose: () => void;
}) {
  const query = useGetLibraryPolicyQuery(id, { refetchOnMountOrArgChange: true });
  if (query.currentData && edit)
    return (
      <PolicyDraftDrawer
        item={query.currentData}
        academicYearId={academicYearId}
        options={options}
        onClose={onClose}
      />
    );
  return (
    <LibraryFormDrawer
      title={query.currentData?.name || 'Borrowing Policy'}
      status={
        query.currentData ? (
          <PolicyStatus status={query.currentData.status} version={query.currentData.version} />
        ) : undefined
      }
      help="The saved policy version, scope and terms. Draft versions have no effect on circulation."
      onClose={onClose}
    >
      {query.isFetching && <Skeleton variant="rounded" height={160} />}
      {query.isError && (
        <Alert severity="error" action={<Button onClick={() => query.refetch()}>Retry</Button>}>
          {parseApiProblemDetail(query.error).detail || 'Could not load this policy.'}
        </Alert>
      )}
      {query.currentData && <PolicyDetails item={query.currentData} options={options} />}
    </LibraryFormDrawer>
  );
}
