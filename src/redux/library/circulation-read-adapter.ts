import type { LibraryLoanRow } from 'src/screens/library/circulation/loan-types';

import { mapIssueReturnItemDto } from './library-adapters';

import type { LibraryLoanReadDto } from './circulation-read-types';

export function mapCanonicalLoanRead(dto: LibraryLoanReadDto): LibraryLoanRow {
  return {
    ...mapIssueReturnItemDto(dto),
    role: dto.role === 0 ? 'Student' : dto.role === 1 ? 'Staff' : 'Role unavailable',
  };
}
