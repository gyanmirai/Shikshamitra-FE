import { fixtureClassRecords } from './mock-api';

// Isolated browser fixture: no requests to the application backend.
export function useFetchStandardFeeStructures(classId: string) {
  return {
    data: (fixtureClassRecords[classId] ?? []).map(
      ({ id, name, status, concurrencyStamp, revisionNumber }) => ({
        id,
        name,
        status,
        concurrencyStamp,
        revisionNumber,
      })
    ),
    isLoading: false,
    isFetching: false,
    isError: false,
    refetch: () => {},
  };
}
