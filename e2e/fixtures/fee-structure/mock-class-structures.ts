import { fixtureClassRecords } from './mock-api';

// Isolated browser fixture: no requests to the application backend.
export function useFetchStandardFeeStructures(classId: string) {
  return {
    data: fixtureClassRecords[classId] ?? [],
    isLoading: false,
    isFetching: false,
    isError: false,
    refetch: () => {},
  };
}
