import { readyFixture } from './mock-api';

// Isolated browser fixture: no requests to the application backend.
const records = [readyFixture, { ...readyFixture, id: 'second', name: 'Class 5 Activity Fees' }];
export function useFetchStandardFeeStructures(classId: string) {
  return {
    data: classId === 'class' ? records : [],
    isLoading: false,
    isFetching: false,
    isError: false,
    refetch: () => {},
  };
}
